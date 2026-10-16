// A software passkey for tests: does what a phone or laptop authenticator does, with a P-256 key.
const crypto=require('node:crypto');
const b64=buf=>Buffer.from(buf).toString('base64url');

function head(major,n){
  if(n<24)return Buffer.from([major<<5|n]);
  if(n<256)return Buffer.from([major<<5|24,n]);
  if(n<65536){const b=Buffer.alloc(3);b[0]=major<<5|25;b.writeUInt16BE(n,1);return b;}
  const b=Buffer.alloc(5);b[0]=major<<5|26;b.writeUInt32BE(n,1);return b;
}
function cbor(value){
  if(Number.isInteger(value))return value>=0?head(0,value):head(1,-1-value);
  if(Buffer.isBuffer(value))return Buffer.concat([head(2,value.length),value]);
  if(typeof value==='string'){const b=Buffer.from(value,'utf8');return Buffer.concat([head(3,b.length),b]);}
  if(value instanceof Map)return Buffer.concat([head(5,value.size),...[...value].flatMap(([k,v])=>[cbor(k),cbor(v)])]);
  throw new Error('cannot encode');
}

function createPasskey({origin,rpId=new URL(origin).hostname,counter=0}={}){
  const {publicKey,privateKey}=crypto.generateKeyPairSync('ec',{namedCurve:'P-256'});
  const jwk=publicKey.export({format:'jwk'}),id=crypto.randomBytes(16);
  const rpHash=()=>crypto.createHash('sha256').update(rpId).digest();
  const count=()=>{const b=Buffer.alloc(4);b.writeUInt32BE(counter);return b;};
  const clientData=(type,challenge,o=origin)=>Buffer.from(JSON.stringify({type,challenge,origin:o,crossOrigin:false}));
  return {
    id:b64(id),
    set counter(n){counter=n;},
    create(options,{origin:o=origin}={}){
      const cose=cbor(new Map([[1,2],[3,-7],[-1,1],[-2,Buffer.from(jwk.x,'base64url')],[-3,Buffer.from(jwk.y,'base64url')]]));
      const idLen=Buffer.alloc(2);idLen.writeUInt16BE(id.length);
      const authData=Buffer.concat([rpHash(),Buffer.from([0x45]),count(),Buffer.alloc(16),idLen,id,cose]);
      const attestationObject=cbor(new Map([['fmt','none'],['attStmt',new Map()],['authData',authData]]));
      return {id:b64(id),rawId:b64(id),type:'public-key',response:{clientDataJSON:b64(clientData('webauthn.create',options.publicKey.challenge,o)),attestationObject:b64(attestationObject)}};
    },
    get(options,{origin:o=origin}={}){
      counter+=1;
      const authData=Buffer.concat([rpHash(),Buffer.from([0x05]),count()]),cd=clientData('webauthn.get',options.publicKey.challenge,o);
      const signature=crypto.sign('sha256',Buffer.concat([authData,crypto.createHash('sha256').update(cd).digest()]),{key:privateKey,dsaEncoding:'der'});
      return {id:b64(id),rawId:b64(id),type:'public-key',response:{clientDataJSON:b64(cd),authenticatorData:b64(authData),signature:b64(signature),userHandle:null}};
    },
  };
}
module.exports={createPasskey,cbor};
