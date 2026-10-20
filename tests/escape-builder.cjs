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
// A walled-off east half behind a door at (10,6): the door is the only way to the key and hatch.
function walled(){const m=B.blank(21,13);for(let y=1;y<12;y++)B.paint(m,10,y,'#');B.paintDoor(m,10,6,0,false);return m;}
const play=m=>new EscapeAdventure({level:escapeBuildCustom(B.toRoute(m))});
const stand=(g,x,y,s=.1)=>{Object.assign(g.player,{x:x+.5,y:y+.5});for(let i=0;i<120*s;i++)g.advance(1/120,{});};
test('one door can be worked three ways: a plate, a lever and taking a chest',()=>{
  const m=walled();B.paint(m,3,3,'2');B.addTrigger(m,'plate',5,3);B.addTrigger(m,'lever',5,9);
  assert.ok(B.validate(m).some(p=>/red door has nothing linked/.test(p)),'an unlinked door is flagged');assert.ok(B.validate(m).some(p=>/plate is not linked/.test(p)));
  const plate=B.triggerAt(m,5,3).id,lever=B.triggerAt(m,5,9).id;
  for(const s of [plate,lever,'chest:3,3'])assert.equal(B.toggleLink(m,s,'d0').ok,true);assert.deepEqual(B.validate(m),[]);
  const r=B.toRoute(m);assert.deepEqual(r.gates[0].plates,[[5,3]]);assert.deepEqual(r.gates[0].levers,[[5,9]]);assert.equal(r.gates[0].duration,5);assert.deepEqual(r.reactions[0].open,['d0']);
  const a=play(m);stand(a,5,3);assert.equal(a.gates[0].open,true,'the plate opens it');
  const b=play(m);stand(b,5,9);assert.equal(b.gates[0].open,true,'the lever opens it');
  const c=play(m);stand(c,3,3,.3);assert.equal(c.gates[0].open,true,'taking the chest opens it');
  assert.equal(B.toggleLink(m,plate,'d0').linked,false,'linking again unlinks');
});
test('door modes: stays open, slams shut, and a heavy plate only a beetle presses',()=>{
  const m=walled();B.addTrigger(m,'plate',5,3);B.toggleLink(m,B.triggerAt(m,5,3).id,'d0');B.setDoor(m,'d0',{mode:'stay'});
  const a=play(m);stand(a,5,3);stand(a,2,9,8);assert.equal(a.gates[0].open,true,'it stays open');
  B.setDoor(m,'d0',{mode:'shut'});const b=play(m);assert.equal(b.gates[0].open,true,'it starts open');stand(b,5,3);stand(b,2,9,2);assert.equal(b.gates[0].open,false);assert.equal(b.gates[0].sealed,true);
  assert.equal(B.setDoor(m,'d0',{mode:'crumble'})&&m.doors[0].mode,'shut','only bridges crumble');
  const h=walled();B.addTrigger(h,'heavy',5,3);B.toggleLink(h,B.triggerAt(h,5,3).id,'d0');assert.ok(B.validate(h).some(p=>/heavy plate needs a beetle/.test(p)));
  B.addEnemy(h,'beetle',3,3);B.addPatrol(h,0,5,3);assert.deepEqual(B.validate(h).filter(p=>!/too close/.test(p)),[]);
  const c=play(h);stand(c,5,3);assert.equal(c.gates[0].open,false,'Sally is too light');
});
test('taking the key wakes a sleeping enemy, and only the key or a chest can wake one',()=>{
  const m=B.blank(21,13);B.addEnemy(m,'snake',15,9);const id=m.guards[0].id;B.addTrigger(m,'plate',5,3);
  assert.equal(B.toggleLink(m,B.triggerAt(m,5,3).id,id).ok,false);B.setSleep(m,id,true);assert.ok(B.validate(m).some(p=>/nothing to wake it/.test(p)));
  B.removeAt(m,5,3);assert.equal(B.toggleLink(m,'key',id).ok,true);assert.deepEqual(B.validate(m),[]);
  const r=B.toRoute(m);assert.equal(r.guards.length,0);assert.equal(r.reinforcements[0].id,id);assert.deepEqual(r.reactions[0].spawn,[id]);
  const g=play(m);assert.equal(g.hunters.length,0);Object.assign(g.player,{x:g.key.x,y:g.key.y});for(let i=0;i<120*4;i++)g.advance(1/120,{});assert.equal(g.hunters.length,1,'the snake woke');
});
test('hazards, bridges and cold ground are placed, tuned and played',()=>{
  const m=B.blank(21,13);for(let x=1;x<20;x++)B.paint(m,x,6,'_');B.paintDoor(m,7,6,1,true);B.paintDoor(m,8,6,1,true);B.setDoor(m,'b1',{mode:'crumble'});
  assert.equal(B.addHazard(m,'vent',0,3),true,'a vent sits in a wall');assert.equal(B.addHazard(m,'vent',4,3),false,'not on open floor');B.turnEnemy(m,0,3);assert.equal(m.hazards[0].dir,1);
  B.addHazard(m,'thorns',12,9);B.setHazard(m,m.hazards[1].id,{speed:'fast',offset:true});B.addHazard(m,'log',3,10);assert.ok(B.validate(m).some(p=>/log needs an end/.test(p)));
  assert.equal(B.setLogEnd(m,m.hazards[2].id,5,8),false,'a log rolls in a straight line');assert.equal(B.setLogEnd(m,m.hazards[2].id,9,10),true);
  for(const p of [[3,3],[4,3]])B.paintClimate(m,'cold',...p);B.paintClimate(m,'warm',4,3);assert.deepEqual(B.validate(m),[]);
  const r=B.toRoute(m);assert.equal(r.gates[0].crumble,true);assert.equal(r.gates[0].bridge,true);assert.equal(r.vents.length,1);assert.deepEqual(r.thorns[0].tiles,[[12,9]]);assert.equal(r.thorns[0].period,2);assert.equal(r.logs[0].to[0],9);
  assert.deepEqual(r.cold,[[3,3,3,3],[4,3,4,3]]);assert.deepEqual(r.warm,[[4,3]]);
  const g=play(m);assert.equal(g.status,'playing');assert.equal(g.gates[0].open,true);for(let i=0;i<120*3;i++)g.advance(1/120,{});assert.equal(g.status,'playing');
  const back=B.importText(B.exportText(m));assert.deepEqual(back.hazards,m.hazards);assert.deepEqual(back.doors,m.doors);assert.deepEqual(back.cold,m.cold);
});
test('old saved and shared levels still load, and painting a wall clears what stood there',()=>{
  const old={id:'custom-old1',name:'Old',map:B.blank(21,13).map,guards:[{kind:'snake',spawn:[12,6],facing:0,patrol:[[12,6],[15,6]]}]};
  const back=B.importText('SALLY1:'+Buffer.from(JSON.stringify(old)).toString('base64'));assert.equal(back.name,'Old');assert.equal(back.guards.length,1);assert.ok(back.guards[0].id);assert.deepEqual(back.doors,[]);
  const s=store();s.setItem('sally-escape-custom-v1',JSON.stringify([old]));assert.equal(B.loadAll(s)[0].guards[0].patrol.length,2);
  const m=walled();B.addTrigger(m,'plate',5,3);B.toggleLink(m,B.triggerAt(m,5,3).id,'d0');B.paint(m,5,3,'#');assert.equal(m.triggers.length,0);assert.deepEqual(m.links,[]);
  B.paint(m,10,6,'.');assert.equal(m.doors.length,0,'painting over a door tile removes it');
});

test('pages: up to three notes on open floor, carried through save, share and play, and an official escape brings its story page',()=>{
  const B=require('../public/escape-builder.js');require('../public/escape-notes.js');const {escapeBuildCustom,EscapeCatalog}=require('../public/escape-levels.js');const {EscapeAdventure}=require('../public/escape-engine.js');
  const m=B.blank();assert.equal(B.addPage(m,0,0),false,'not in a wall');
  for(const x of [3,4,5])assert.equal(B.addPage(m,x,5),true);assert.equal(B.addPage(m,6,5),false,'three at most');
  B.setPage(m,0,{title:'  Hello  there ',body:'Look under the leaves.',author:'Pip'});B.setPage(m,1,{body:'x'.repeat(500)});
  assert.equal(m.pages[0].title,'Hello there');assert.equal(m.pages[1].body.length,320);
  const route=B.toRoute(m);assert.equal(route.pages.length,2,'a page with no words is left out');
  assert.deepEqual(new EscapeAdventure({level:escapeBuildCustom(route)}).level.pages,route.pages);
  assert.deepEqual(B.sanitize(JSON.parse(JSON.stringify(m))).pages,m.pages);
  assert.equal(B.removeExtraAt(m,4,5),true);assert.equal(m.pages.length,2);
  const official=B.fromRoute(EscapeCatalog.levels[0]);assert.equal(official.pages.length,1);assert.equal(official.pages[0].id,'level-note:meadow:1');
});
