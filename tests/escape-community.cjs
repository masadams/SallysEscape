const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createServer}=require('../server/index.cjs');const B=require('../public/escape-builder.js');
async function serve(t,options){const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'sally-shelf-'));const server=createServer({dataDir,...options});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  t.after(()=>{server.close();fs.rmSync(dataDir,{recursive:true,force:true});});return {base:'http://127.0.0.1:'+server.address().port,dataDir};}
const post=(base,url,body,pass)=>fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json',...(pass?{'X-Builder-Password':pass}:{})},body:JSON.stringify(body)});
function level(){const m=B.blank(21,13);m.name='Shelf test';m.author='Mason';B.addEnemy(m,'snake',12,6);B.addPatrol(m,0,16,6);return m;}

test('the builder password unlocks the builder and is required to publish or take a level down',async t=>{
  const {base}=await serve(t,{password:'lizard-pass'});
  assert.equal((await post(base,'/api/builder/unlock',{password:'nope'})).status,401);assert.equal((await post(base,'/api/builder/unlock',{password:'lizard-pass'})).status,204);
  assert.equal((await post(base,'/api/levels',{level:level()})).status,401,'publishing needs the password');assert.equal((await post(base,'/api/levels',{level:level()},'wrong')).status,401);
  const m=level();assert.equal((await post(base,'/api/levels',{level:m},'lizard-pass')).status,201);
  const shelf=await (await fetch(base+'/api/levels')).json();assert.equal(shelf.levels.length,1);assert.equal(shelf.levels[0].name,'Shelf test');assert.equal(shelf.levels[0].author,'Mason');assert.ok(shelf.levels[0].publishedAt);
  assert.equal((await fetch(base+'/api/levels/'+m.id,{method:'DELETE'})).status,401,'anyone can play, only makers take levels down');
  assert.equal((await fetch(base+'/api/levels/'+m.id,{method:'DELETE',headers:{'X-Builder-Password':'lizard-pass'}})).status,204);
  assert.equal((await (await fetch(base+'/api/levels')).json()).levels.length,0);
});
test('the shelf refuses broken levels, oversized bodies and guessing, and stays shut with no password set',async t=>{
  const {base}=await serve(t,{password:'lizard-pass'});
  const broken=level();broken.map=broken.map.map(r=>r.replace('K','.'));assert.equal((await post(base,'/api/levels',{level:broken},'lizard-pass')).status,400,'a level with no key is not published');
  assert.equal((await post(base,'/api/levels',{level:{map:['<script>']}},'lizard-pass')).status,400);
  assert.equal((await fetch(base+'/api/levels',{method:'POST',headers:{'X-Builder-Password':'lizard-pass'},body:'x'.repeat(70000)}).catch(()=>({status:413}))).status,413);
  for(let i=0;i<8;i++)await post(base,'/api/builder/unlock',{password:'guess'+i});assert.equal((await post(base,'/api/builder/unlock',{password:'lizard-pass'})).status,429,'too many wrong tries wait a minute');
  const off=await serve(t,{password:''});assert.equal((await post(off.base,'/api/builder/unlock',{password:'anything'})).status,503);assert.equal((await post(off.base,'/api/levels',{level:level()},'anything')).status,503);
  assert.equal((await fetch(off.base+'/api/levels')).status,200,'the shelf can still be read');assert.equal((await fetch(off.base+'/api/scores')).status,404);
});
test('a stored level that was tampered with on disk is not served',async t=>{
  const {base,dataDir}=await serve(t,{password:'p'});await post(base,'/api/levels',{level:level()},'p');
  const file=path.join(dataDir,'community-levels.json'),list=JSON.parse(fs.readFileSync(file,'utf8'));list.push({id:'custom-bad',map:['<img onerror=x>']});fs.writeFileSync(file,JSON.stringify(list));
  const shelf=await (await fetch(base+'/api/levels')).json();assert.equal(shelf.levels.length,1);
});
