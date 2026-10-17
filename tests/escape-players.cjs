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
