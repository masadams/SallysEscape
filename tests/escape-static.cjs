const test=require('node:test'),assert=require('node:assert/strict'),zlib=require('node:zlib'),fs=require('node:fs'),path=require('node:path');
const {serve}=require('./helpers/admin-session.cjs');

test('the game is served gzipped with an ETag, and a returning browser gets a 304',async t=>{
  const {base}=await serve(t),raw=fs.readFileSync(path.join(__dirname,'../public/escapescene.js'));
  let r=await fetch(base+'/escapescene.js');assert.equal(r.status,200);const etag=r.headers.get('etag');assert.ok(etag);
  assert.equal(r.headers.get('content-encoding'),'gzip');assert.ok(Number(r.headers.get('content-length'))<raw.length/2,'compressed well');
  assert.equal(await r.text(),raw.toString(),'decompresses to the file');
  r=await fetch(base+'/escapescene.js',{headers:{'if-none-match':etag}});assert.equal(r.status,304);
  r=await fetch(base+'/escapescene.js',{headers:{'accept-encoding':'identity'}});assert.equal(r.headers.get('content-encoding'),null);assert.equal(Number(r.headers.get('content-length')),raw.length);
  r=await fetch(base+'/icon.svg',{method:'HEAD'});assert.equal(r.status,200);
  r=await fetch(base+'/no-such-file.js');assert.equal(r.status,404);
  r=await fetch(base+'/vendor/p5.min.js');assert.match(r.headers.get('cache-control'),/max-age/);
});
