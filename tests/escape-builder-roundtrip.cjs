const test=require('node:test'),assert=require('node:assert/strict');
const B=require('../public/escape-builder.js');
const {EscapeCatalog,escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const fixtures=require('./fixtures/escape-playthroughs.json');
const ACT={pebble:'throwDecoy',burrow:'burrow',tongue:'useTongue',seed:'plantSeed',camo:'camouflage'};
function replay(options,commands){const g=new EscapeAdventure(options);for(const c of commands){if(c.kind==='move'){for(let n=0;n<c.frames;n++)g.advance(1/120,c);}else g[ACT[c.kind]]();}return g;}

// Every escape in the game opens in the builder and comes back out as the same escape: its recorded
// winning run still wins, frame for frame, on the round-tripped level.
test('every game escape survives builder round trip: its recorded run still wins on the rebuilt level',()=>{
  const failed=[];
  for(const level of [...EscapeCatalog.levels,...EscapeCatalog.hidden]){
    const rec=fixtures.find(r=>!r.pending&&!r.options.challengeId&&(r.options.levelId===level.id||r.options.hiddenId===level.id));if(!rec)continue;
    const model=B.sanitize(JSON.parse(JSON.stringify(B.fromRoute(level))));if(!model){failed.push(level.id+': does not sanitize');continue;}
    const route=escapeBuildCustom(B.toRoute(model)),g=replay({level:route},rec.commands),orig=replay(rec.options,rec.commands);
    if(g.status!=='won'||Math.abs(g.elapsed-orig.elapsed)>1e-6)failed.push(level.id+': '+g.status+' at '+g.elapsed.toFixed(2)+'s (game '+orig.elapsed.toFixed(2)+'s)');
  }
  assert.deepEqual(failed,[]);
});
test('the builder can place every extra the game has, and the game plays them',()=>{
  const m=B.blank(21,13);
  assert.ok(B.addWind(m,3,3,6,5));B.setWind(m,0,{dir:1,period:4,on:1.2,offset:1});assert.deepEqual(m.wind[0].dir,[0,1]);
  assert.ok(B.addCap(m,8,8));assert.ok(B.setCapEnd(m,12,8));
  const area=B.addRegion(m,2,9,5,10);assert.ok(area);B.setRegion(m,area,{requiresKey:true});
  for(const p of [[3,2],[8,2],[8,4],[3,4]])assert.ok(B.addAntPoint(m,...p));assert.equal(B.addAntPoint(m,5,5),false,'a column only turns at right angles');
  assert.ok(B.addSeedCrossing(m,[10,3],[13,3]));assert.ok(B.setRootWheel(m,15,5));
  for(const k of Object.keys(B.LAYERS))assert.ok(B.toggleLayer(m,k,4+Object.keys(B.LAYERS).indexOf(k),6));
  assert.ok(B.addEnemy(m,'angler',14,9));assert.ok(B.addEnemy(m,'snake',10,10));const [angler,snake]=m.guards;B.setGuard(m,angler.id,{lure:[14,7]});assert.ok(B.toggleRival(m,angler.id,snake.id));
  B.setSettings(m,{hawk:{every:9,warn:2,first:12},storm:{every:9,warn:1.6,first:8},tide:{period:14,high:6,offset:0},tailDrop:true,timeLimit:90,camos:2,seeds:1,dark:true});
  B.toggleLink(m,'enter:'+area,snake.id);B.setMessage(m,'enter:'+area,'Something wakes.','Run.');
  assert.deepEqual(B.validate(m),[]);
  const route=B.toRoute(m);for(const k of ['wind','caps','antTrails','seedCrossings','rootWheel','shade','glowPlants','regrowth','slippery','rivalries','hawk','storm','tide','timeLimit','camos','seeds','dark'])assert.ok(route[k]!==undefined,k);
  assert.equal(route.reactions[0].when,'enter');assert.equal(route.reactions[0].requiresKey,true);assert.deepEqual(route.reactions[0].spawn,[snake.id]);assert.equal(route.reactions[0].message,'Something wakes.');
  const again=B.sanitize(JSON.parse(JSON.stringify(m)));assert.deepEqual(B.toRoute(again),route,'saving and loading keeps every extra');
  const g=new EscapeAdventure({level:escapeBuildCustom(route)});for(let i=0;i<240;i++)g.advance(1/120,{});assert.ok(['playing','caught'].includes(g.status));
});

// The seasonal adventures and the Little Explorers adventures open in the builder too: their checkpoints,
// gentle catches, trail signs, scenery, mill wheel, fox warning and look all come back out, and each
// recorded winning run still wins on the rebuilt level.
test('seasonal and Little Explorers adventures survive the builder round trip with their recorded wins',()=>{
  const ACT2={...ACT,glow:'throwGlow',spore:'throwSpore'},play=(options,commands)=>{const g=new EscapeAdventure(options);for(const c of commands){if(c.kind==='move'){for(let n=0;n<c.frames;n++)g.advance(1/120,c);}else g[ACT2[c.kind]](c.power);}return g;};
  const sets=[[EscapeCatalog.seasonal,require('./fixtures/escape-seasons.json')],[EscapeCatalog.kids.filter(l=>l.adventure),require('./fixtures/escape-kids-adventures.json')]],failed=[];let runs=0;
  for(const [levels,recs] of sets)for(const level of levels){
    const model=B.sanitize(JSON.parse(JSON.stringify(B.fromRoute(level))));if(!model){failed.push(level.id+': does not sanitize');continue;}
    const route=B.toRoute(model);
    for(const k of ['gentle','foxWarn','checkpoints','props','millWheel'])if(level[k]!==undefined)assert.deepEqual(route[k],level[k],level.id+' keeps '+k);
    if(level.fieldNotes)assert.equal(route.fieldNotes.length,level.fieldNotes.length,level.id+' keeps its signs');
    if(level.seasonalTheme)assert.equal(route.look,level.seasonalTheme);
    const built=escapeBuildCustom(route);
    for(const r of recs.filter(r=>r.id===level.id)){runs++;const g=play({level:built},r.commands),o=play(r.options,r.commands);
      if(g.status!=='won'||Math.abs(g.elapsed-o.elapsed)>1e-6)failed.push(level.id+' '+r.variant+': '+g.status+' at '+g.elapsed.toFixed(2)+'s');}
  }
  assert.ok(runs>=20,'recorded runs replayed: '+runs);assert.deepEqual(failed,[]);
});
test('every Little Explorers level, even the smallest, opens in the builder and passes its checks',()=>{
  for(const level of EscapeCatalog.kids){const m=B.sanitize(JSON.parse(JSON.stringify(B.fromRoute(level))));assert.ok(m,level.id);assert.deepEqual(B.validate(m),[],level.id);}
});
