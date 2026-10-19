const test=require('node:test'),assert=require('node:assert/strict');
function fresh(){const data=new Map();global.localStorage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
  delete require.cache[require.resolve('../public/escape-players.js')];return {P:require('../public/escape-players.js'),data};}

test('the first player keeps the progress saved before players existed',()=>{
  const {P,data}=fresh();data.set('sallys-escape-progress-v1',JSON.stringify({levels:{a:{stars:3},b:{stars:2}}}));
  const me=P.current();assert.equal(me.legacy,true);assert.equal(P.storage().getItem('sallys-escape-progress-v1'),data.get('sallys-escape-progress-v1'));
  assert.deepEqual(P.summary(me.id),{stars:5,cleared:2});
});

test('each player saves into their own space, up to six, and a removed player is forgotten',()=>{
  const {P,data}=fresh();P.storage().setItem('sally-escape-settings','first');
  const b=P.create('  Robin   the  Brave  ',2);assert.equal(b.name,'Robin the Brave');assert.equal(P.storage(b.id).getItem('sally-escape-settings'),null,'a new player starts fresh');
  P.storage(b.id).setItem('sally-escape-settings','second');assert.equal(P.storage().getItem('sally-escape-settings'),'first');assert.equal(data.get('sally-escape-settings@'+b.id),'second');
  for(let i=0;i<10;i++)P.create('x'+i);assert.equal(P.list().length,P.MAX);assert.equal(P.create('one too many'),null);
  assert.equal(P.select(b.id),true);assert.equal(P.current().id,b.id);assert.equal(P.storage().getItem('sally-escape-settings'),'second');
  assert.equal(P.rename(b.id,'Robin',4),true);assert.equal(P.current().name,'Robin');assert.equal(P.current().color,4);
  assert.equal(P.remove(b.id),true);assert.equal(data.has('sally-escape-settings@'+b.id),false);assert.notEqual(P.current().id,b.id,'removing the current player picks another');
  for(const p of P.list().slice(1))P.remove(p.id);assert.equal(P.list().length,1);assert.equal(P.remove(P.list()[0].id),false,'the last player stays');
});

test('the new story starts everyone afresh once: progress, stickers and tips go, names, settings and built levels stay',()=>{
  const data=new Map([['sally-escape-players-v1',JSON.stringify({current:'p1',list:[{id:'p1',name:'Ada',color:0,legacy:true},{id:'p2',name:'Bo',color:1}],keys:[]})],
    ['sallys-escape-progress-v1','{"levels":{"meadow-dash":{"stars":3}}}'],['sallys-escape-progress-v1@p2','{}'],['sallys-escape-kids','["hello-sally"]'],['sally-escape-throw-tip','1'],['sally-escape-last-played@p2','x'],
    ['sally-escape-settings','{"muted":true}'],['sally-escape-custom-v1@p2','[]'],['sally-escape-workshop-v1','{}']]);
  const store={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k),key:i=>[...data.keys()][i]??null,get length(){return data.size;}};
  global.localStorage=store;delete require.cache[require.resolve('../public/escape-players.js')];const P=require('../public/escape-players.js');
  assert.deepEqual([...data.keys()].sort(),['sally-escape-custom-v1@p2','sally-escape-players-v1','sally-escape-save-era','sally-escape-settings','sally-escape-workshop-v1']);
  assert.deepEqual(P.list().map(p=>p.name),['Ada','Bo']);
  data.set('sallys-escape-progress-v1','{"levels":{}}');assert.equal(P.freshStart(),false,'only once');assert.ok(data.has('sallys-escape-progress-v1'));
});
