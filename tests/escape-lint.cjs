const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeCatalog}=require('../public/escape-levels.js');
const {rules}=require('../scripts/lint-levels.cjs');

// Known and deliberate: a key a king cobra watches, and optional treasure on a rooted hunter's post.
const ACCEPTED=new Set(['moonwell-keep:under-guard','boiler-owls:under-guard','eye-of-the-storm:under-guard','bramble-maze:under-guard','starlight-bed:under-guard']);
test('no escape breaks a fairness rule: nothing always-on guards the only way, nothing sits by the start, the hatch can open',()=>{
  const found=[];
  for(const l of EscapeCatalog.levels)for(const f of rules(l,{levelId:l.id}))if(f.level==='error'&&!ACCEPTED.has(l.id+':'+f.rule))found.push(l.id+': '+f.msg);
  for(const l of EscapeCatalog.hidden)for(const f of rules(l,{hiddenId:l.id}))if(f.level==='error'&&!ACCEPTED.has(l.id+':'+f.rule))found.push(l.id+': '+f.msg);
  assert.deepEqual(found,[]);
});
test('the linter catches the mistakes it was built for',()=>{
  const level=EscapeCatalog.levels.find(l=>l.id==='home'),broken={...level,guards:[...level.guards,{kind:'cobra',spawn:[17,14],facing:Math.PI,patrol:[[17,14]]}]};
  assert.ok(rules(broken,{level:broken}).some(f=>f.level==='error'&&f.rule==='under-guard'),'a cobra on the key is flagged');
});
