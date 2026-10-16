// Passkey (WebAuthn) checks with nothing but Node's crypto: a small CBOR reader, the
// authenticator data layout, COSE public keys, and the two ceremonies' verification steps.
// Attestation is not checked ('none' is requested): what matters is that the same key signs later.
const crypto=require('node:crypto');

const b64url=buf=>Buffer.from(buf).toString('base64url');
const fromB64url=text=>{if(typeof text!=='string'||!/^[A-Za-z0-9_-]*$/.test(text))throw new Error('bad encoding');return Buffer.from(text,'base64url');};

// Just enough CBOR for attestation objects and COSE keys: integers, byte and text strings,
// arrays, maps and the simple values. Returns [value, next offset].
function cbor(buf,at=0,depth=0){
  if(depth>8||at>=buf.length)throw new Error('bad cbor');
  const first=buf[at],major=first>>5,info=first&31;let p=at+1,n;
  if(info<24)n=info;else if(info===24){n=buf[p];p+=1;}else if(info===25){n=buf.readUInt16BE(p);p+=2;}else if(info===26){n=buf.readUInt32BE(p);p+=4;}
  else if(info===27){const big=buf.readBigUInt64BE(p);if(big>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('bad cbor');n=Number(big);p+=8;}else throw new Error('bad cbor');
  if(major===0)return [n,p];
  if(major===1)return [-1-n,p];
  if(major===2){if(p+n>buf.length)throw new Error('bad cbor');return [buf.subarray(p,p+n),p+n];}
  if(major===3){if(p+n>buf.length)throw new Error('bad cbor');return [buf.subarray(p,p+n).toString('utf8'),p+n];}
  if(major===4){if(n>64)throw new Error('bad cbor');const out=[];for(let i=0;i<n;i++){const [v,q]=cbor(buf,p,depth+1);out.push(v);p=q;}return [out,p];}
  if(major===5){if(n>64)throw new Error('bad cbor');const out=new Map();for(let i=0;i<n;i++){const [k,q]=cbor(buf,p,depth+1);const [v,r]=cbor(buf,q,depth+1);out.set(k,v);p=r;}return [out,p];}
  if(major===7){if(info===20)return [false,p];if(info===21)return [true,p];if(info===22)return [null,p];}
  throw new Error('bad cbor');
}

// Authenticator data: relying-party hash, flags, signature counter and, when a key is being
// registered, the credential id and its COSE public key.
function parseAuthData(buf){
  if(buf.length<37)throw new Error('short authenticator data');
  const out={rpIdHash:buf.subarray(0,32),flags:buf[32],signCount:buf.readUInt32BE(33)};
  out.userPresent=Boolean(out.flags&1);out.userVerified=Boolean(out.flags&4);
  if(out.flags&64){
    if(buf.length<55)throw new Error('short authenticator data');
    const idLen=buf.readUInt16BE(53);if(idLen>1023||55+idLen>buf.length)throw new Error('bad credential id');
    out.credentialId=buf.subarray(55,55+idLen);const [key]=cbor(buf,55+idLen);out.coseKey=key;
  }
  return out;
}

// A COSE key becomes a JWK Node can verify with. ES256, RS256 and EdDSA cover every common passkey.
function coseToJwk(key){
  if(!(key instanceof Map))throw new Error('bad key');
  const kty=key.get(1),alg=key.get(3),b=v=>{if(!Buffer.isBuffer(v))throw new Error('bad key');return b64url(v);};
  if(kty===2&&alg===-7&&key.get(-1)===1)return {alg:-7,jwk:{kty:'EC',crv:'P-256',x:b(key.get(-2)),y:b(key.get(-3))}};
  if(kty===3&&alg===-257)return {alg:-257,jwk:{kty:'RSA',n:b(key.get(-1)),e:b(key.get(-2))}};
  if(kty===1&&alg===-8&&key.get(-1)===6)return {alg:-8,jwk:{kty:'OKP',crv:'Ed25519',x:b(key.get(-2))}};
  throw new Error('unsupported key type');
}
function verifySignature(alg,jwk,data,signature){
  const key=crypto.createPublicKey({key:jwk,format:'jwk'});
  if(alg===-7)return crypto.verify('sha256',data,{key,dsaEncoding:'der'},signature);
  if(alg===-257)return crypto.verify('sha256',data,key,signature);
  if(alg===-8)return crypto.verify(null,data,key,signature);
  return false;
}

// The parts both ceremonies share: the client data says what was asked, by which page.
function checkClientData(clientDataJSON,{type,challenge,origin}){
  let client;try{client=JSON.parse(clientDataJSON.toString('utf8'));}catch(_){throw new Error('bad client data');}
  if(client.type!==type)throw new Error('wrong ceremony');
  if(typeof client.challenge!=='string'||client.challenge!==challenge)throw new Error('wrong challenge');
  if(client.origin!==origin)throw new Error('wrong origin');
  if(client.crossOrigin===true)throw new Error('cross-origin');
}
const rpHashOk=(auth,rpId)=>crypto.timingSafeEqual(auth.rpIdHash,crypto.createHash('sha256').update(rpId).digest());

// Registration: returns the credential to store.
function verifyRegistration(credential,{challenge,origin,rpId}){
  const r=credential?.response;if(!r||credential.type!=='public-key')throw new Error('not a passkey');
  const clientDataJSON=fromB64url(r.clientDataJSON),attestation=fromB64url(r.attestationObject);
  if(clientDataJSON.length>4096||attestation.length>8192)throw new Error('too large');
  checkClientData(clientDataJSON,{type:'webauthn.create',challenge,origin});
  const [att]=cbor(attestation);if(!(att instanceof Map)||!Buffer.isBuffer(att.get('authData')))throw new Error('bad attestation');
  const auth=parseAuthData(att.get('authData'));
  if(!rpHashOk(auth,rpId))throw new Error('wrong site');
  if(!auth.userPresent)throw new Error('no user presence');
  if(!auth.credentialId||!auth.coseKey)throw new Error('no credential');
  const {alg,jwk}=coseToJwk(auth.coseKey);
  return {id:b64url(auth.credentialId),alg,jwk,signCount:auth.signCount,userVerified:auth.userVerified};
}

// Sign-in: checks the signature with the stored key and returns the new signature counter.
function verifyAuthentication(credential,stored,{challenge,origin,rpId}){
  const r=credential?.response;if(!r||credential.type!=='public-key')throw new Error('not a passkey');
  const clientDataJSON=fromB64url(r.clientDataJSON),authData=fromB64url(r.authenticatorData),signature=fromB64url(r.signature);
  if(clientDataJSON.length>4096||authData.length>4096||signature.length>1024)throw new Error('too large');
  checkClientData(clientDataJSON,{type:'webauthn.get',challenge,origin});
  const auth=parseAuthData(authData);
  if(!rpHashOk(auth,rpId))throw new Error('wrong site');
  if(!auth.userPresent)throw new Error('no user presence');
  const signed=Buffer.concat([authData,crypto.createHash('sha256').update(clientDataJSON).digest()]);
  if(!verifySignature(stored.alg,stored.jwk,signed,signature))throw new Error('bad signature');
  // A counter that goes backwards means a cloned key; many passkeys always send 0, which is fine.
  if(auth.signCount!==0&&stored.signCount!==0&&auth.signCount<=stored.signCount)throw new Error('signature counter went backwards');
  return {signCount:auth.signCount,userVerified:auth.userVerified};
}

module.exports={cbor,parseAuthData,coseToJwk,verifyRegistration,verifyAuthentication,b64url,fromB64url};
