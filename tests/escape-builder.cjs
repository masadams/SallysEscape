const test=require('node:test'),assert=require('node:assert/strict');
const B=require('../public/escape-builder.js');const {escapeBuildCustom}=require('../public/escape-levels.js');const {EscapeAdventure}=require('../public/escape-engine.js');
function store(){const data={};return {getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=v;},data};}
test('a blank level is a walled room with Sally, the key and the hatch, and it is valid and playable',()=>{
  const m=B.blank(21,13);assert.equal(m.map.length,13);assert.ok(m.map.every(r=>r.length===21));assert.deepEqual(B.validate(m),[]);
  const level=escapeBuildCustom(B.toRoute(m)),g=new EscapeAdventure({level});assert.equal(g.level.custom,true);assert.equal(g.width,21);assert.equal(g.status,'playing');
});
test('painting keeps the edge solid, moves unique marks, and clears enemies off new walls',()=>{
  const m=B.blank();assert.equal(B.paint(m,0,5,'.'),false,'edges stay wall');B.paint(m,5,5,'@');assert.equal(m.map.join('').split('@').length-1,1);assert.equal(m.map[5][5],'@');
  assert.equal(B.addEnemy(m,'snake',10,5),true);B.addPatrol(m,0,14,5);assert.deepEqual(m.guards[0].patrol,[[10,5],[14,5]]);
  B.paint(m,14,5,'#');assert.deepEqual(m.guards[0].patrol,[[10,5]]);B.paint(m,10,5,'#');assert.equal(m.guards.length,0);
  B.addEnemy(m,'scorpion',12,7);assert.equal(B.addPatrol(m,0,13,7),false,'posted enemies keep their post');
});
test('validation explains what stops a level, in plain words',()=>{
  const m=B.blank();for(let y=1;y<m.map.length-1;y++)B.paint(m,10,y,'#');assert.ok(B.validate(m).some(p=>/reach the key/.test(p)));
  const n=B.blank();B.addEnemy(n,'beetle',2,10);assert.ok(B.validate(n).some(p=>/too close/.test(p)));n.requiredTreasure=3;assert.ok(B.validate(n).some(p=>/more treasure/.test(p)));
  const t=B.blank();for(let x=12;x<=16;x++)for(let y=1;y<=3;y++)B.paint(t,x,y,'_');B.paint(t,14,2,'K');assert.ok(B.validate(t).some(p=>/key/.test(p)));t.tongues=1;B.paint(t,14,4,'.');assert.deepEqual(B.validate(t),[],'a tongue can grab the key from the bank');
});
test('levels resize without losing what fits, and save, list, share and import safely',()=>{
  const m=B.blank(21,13);B.paint(m,4,4,'L');B.addEnemy(m,'snake',10,6);const r=B.resize(m,15,11);assert.equal(r.map[0].length,15);assert.equal(r.map[4][4],'L');assert.equal(r.guards.length,1);assert.deepEqual(B.validate(r).filter(p=>!/too close/.test(p)),[]);
  const s=store();m.name='Leaf maze';assert.equal(B.saveOne(s,m),true);assert.equal(B.loadAll(s)[0].name,'Leaf maze');B.saveOne(s,m);assert.equal(B.loadAll(s).length,1,'saving again updates');
  const text=B.exportText(m),back=B.importText(text);assert.equal(back.name,'Leaf maze');assert.deepEqual(back.map,m.map);assert.equal(back.guards.length,1);
  assert.equal(B.importText('nonsense'),null);assert.equal(B.importText('SALLY1:'+Buffer.from(JSON.stringify({map:['#<script>#']})).toString('base64')),null,'only map characters are accepted');
  B.removeOne(s,m.id);assert.equal(B.loadAll(s).length,0);
});
test('newer creatures, vines and cracks can be placed and turned, and play in the game',()=>{
  const m=B.blank(21,13);B.paint(m,6,6,'T');B.paint(m,8,6,'S');assert.equal(B.addEnemy(m,'heron',12,6),true);assert.equal(B.addEnemy(m,'fox',16,3),true);
  assert.equal(B.addEnemy(m,'crab',8,6),false,'creatures cannot stand in a crack');assert.equal(B.addPatrol(m,1,8,6),false,'nor walk through one');
  assert.equal(B.addPatrol(m,0,13,6),false,'a heron keeps its post');assert.equal(B.turnEnemy(m,12,6),true);assert.equal(m.guards[0].facing,Math.PI*1.5);B.turnEnemy(m,12,6);assert.equal(m.guards[0].facing,0);
  assert.deepEqual(B.validate(m),[]);const back=B.importText(B.exportText(m));assert.deepEqual(back.map,m.map);assert.equal(back.guards[0].kind,'heron');
  const g=new EscapeAdventure({level:escapeBuildCustom(B.toRoute(m))});assert.equal(g.hunters.find(h=>h.kind==='heron').state,'still');assert.equal(g.vines.length,1);assert.equal(g.status,'playing');
});
