const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');
const {EscapeCatalog}=require('../public/escape-levels.js');
function advance(g,s,input={}){for(let n=0;n<Math.ceil(s*120);n++)g.advance(1/120,input);}
function reach(){const g=new EscapeAdventure({levelId:'reed-bank'});g.hunters=[];Object.assign(g.player,{x:4.5,y:8.5,facing:{x:1,y:0}});return g;}
test('new routes have distinct finite tool sets and tongue is absent from earlier routes and Forked Fort',()=>{
 const sets=EscapeCatalog.levels.slice(9,13).map(l=>[l.tongues,l.burrows,l.pebbles]);assert.deepEqual(sets,[[3,0,1],[1,2,0],[2,0,0],[0,1,2]]);
 for(const level of EscapeCatalog.levels){for(const n of [level.tongues||0,level.burrows,level.pebbles])assert.ok(Number.isInteger(n)&&n>=0);}
 for(const id of ['quiet-vault','forked-fort']){const g=new EscapeAdventure({levelId:id});assert.equal(g.useTongue(),false);assert.equal(g.tonguesUsed,0);}
});
test('tongue reaches three tiles across a gap, collects the key on contact and retracts',()=>{
 const g=reach();assert.equal(g.clear(g.player,g.key),false);assert.equal(g.clear(g.player,g.key,true),true);assert.equal(g.useTongue(),true);assert.equal(g.tongues,2);assert.equal(g.hasKey,false);
 advance(g,.13);assert.equal(g.hasKey,false);advance(g,.02);assert.equal(g.hasKey,true);assert.equal(g.keyByTongue,true);assert.equal(g.tongue.caught,true);advance(g,.2);assert.equal(g.tongue,null);
});
test('out of range, off-axis, behind Sally and blocked grabs spend no uses',()=>{
 for(const modify of [g=>g.player.x=4.4,g=>g.player.y=9.1,g=>g.player.facing={x:-1,y:0},g=>g.grid[8][6]='#',g=>g.grid[8][6]='B',g=>g.grid[8][6]='G']){
  const g=reach();modify(g);assert.equal(g.useTongue(),false);assert.equal(g.tongues,3);assert.equal(g.tongue,null);
 }
});
test('diagonal movement aims a diagonal tongue without changing the burrow direction',()=>{
 const g=reach();for(let y=13;y<=15;y++)for(let x=4;x<=7;x++)g.grid[y][x]='.';g.hasKey=true;Object.assign(g.player,{x:4.5,y:15.5});g.loot=[{x:6.5,y:13.5,value:1,taken:false}];g.advance(1/120,{x:1,y:-1});assert.deepEqual(g.player.facing,{x:1,y:0});assert.equal(g.useTongue(),true);advance(g,.15);assert.equal(g.treasure,1);
});
test('a grab takes only the nearest item, awards a chest once and cannot repeat during its cooldown',()=>{
 const g=reach();g.hasKey=true;g.loot=[{x:5.5,y:8.5,value:3,taken:false},{x:7.5,y:8.5,value:1,taken:false}];
 assert.equal(g.useTongue(),true);assert.equal(g.useTongue(),false);advance(g,.15);assert.equal(g.treasure,3);assert.equal(g.loot[1].taken,false);advance(g,.2);assert.equal(g.useTongue(),false);advance(g,.25);assert.equal(g.useTongue(),true);advance(g,.2);assert.equal(g.treasure,4);assert.equal(g.tonguesUsed,2);
});
test('walking through a pending target does not steal its pickup or double the reward',()=>{
 const g=reach();g.hasKey=true;g.loot=[{x:5.05,y:8.5,value:1,taken:false}];assert.equal(g.useTongue(),true);advance(g,.15,{x:1});assert.equal(g.tongue.caught,true);assert.equal(g.treasure,1);advance(g,.5);assert.equal(g.treasure,1);
});
test('pause freezes the tongue, charges and pending pickup; results reject new grabs',()=>{
 const g=reach();g.useTongue();advance(g,.05);g.paused=true;const elapsed=g.elapsed;g.advance(10);assert.equal(g.elapsed,elapsed);assert.equal(g.hasKey,false);assert.equal(g.useTongue(),false);assert.equal(g.tongues,2);
 g.paused=false;advance(g,.1);assert.equal(g.hasKey,true);g.finish('won','Done');assert.equal(g.tongue,null);assert.equal(g.useTongue(),false);
});
test('capture takes precedence over a pending remote key pickup',()=>{
 const g=reach();g.useTongue();g.elapsed=.139;g.hunters=[{...g.hunter,x:g.player.x,y:g.player.y}];g.advance(1/120);assert.equal(g.status,'caught');assert.equal(g.hasKey,false);assert.equal(g.tongue,null);
});
test('moving beyond reach or behind a wall cancels the contact instead of collecting through it',()=>{
 for(const modify of [g=>g.player.x=3.5,g=>g.grid[8][5]='#']){const g=reach();g.useTongue();modify(g);advance(g,.15);assert.equal(g.hasKey,false);assert.equal(g.tongue.caught,undefined);assert.equal(g.tongues,2);}
});
test('gaps block walking, burrowing and enemy charges but permit vision and tongue',()=>{
 const g=reach();assert.equal(g.floor(6,8),false);assert.equal(g.fits({x:6.5,y:8.5}),false);assert.ok(g.lineVisible(g.player,g.key));
 Object.assign(g.player,{x:5.5,y:8.5});g.burrows=1;assert.equal(g.burrow(),false);assert.equal(g.burrows,1);
 const h=g.hunter;Object.assign(h,{kind:'beetle',x:5.5,y:8.5,state:'charge',aim:{x:8.5,y:8.5},facing:0,phaseUntil:2});Object.assign(g.player,{x:8.5,y:10.5});g.hunters=[h];advance(g,.5);assert.equal(h.state,'stunned');assert.ok(h.x<5.8);
});
test('retries restore each route loadout and clear an unfinished tongue',()=>{
 const a=reach();a.useTongue();const b=new EscapeAdventure({levelId:'reed-bank'});assert.equal(b.tongues,3);assert.equal(b.tongue,null);assert.equal(b.tonguesUsed,0);assert.equal(b.burrows,0);assert.equal(b.decoys,1);
});
test('burrowing interrupts a pending tongue so it cannot stretch or collect across the landing wall',()=>{
 const g=new EscapeAdventure({levelId:'split-shelves'});g.hunters=[];Object.assign(g.player,{x:8.5,y:6.5,facing:{x:0,y:-1}});g.loot=[{x:8.5,y:5.5,value:1,taken:false}];assert.equal(g.useTongue(),true);
 g.player.facing={x:1,y:0};assert.equal(g.burrow(),true);assert.equal(g.tongue,null);advance(g,.5);assert.equal(g.treasure,0);assert.equal(g.tongues,0);
});
test('Long Reach disallows walking pickup of the key and only opens the hatch after a tongue pickup',()=>{
 const g=new EscapeAdventure({challengeId:'long-reach'});g.hunters=[];Object.assign(g.player,g.key);advance(g,.1);assert.equal(g.hasKey,false);assert.equal(g.exitUnlocked(),false);
 Object.assign(g.player,{x:4.5,y:8.5,facing:{x:1,y:0}});g.useTongue();advance(g,.15);assert.equal(g.hasKey,true);assert.equal(g.keyByTongue,true);assert.equal(g.exitUnlocked(),true);
});
test('Long Reach ends with a clear failure when its last grab is spent on treasure',()=>{
 const g=new EscapeAdventure({challengeId:'long-reach'});g.hunters=[];Object.assign(g.player,{x:4.5,y:8.5,facing:{x:1,y:0}});g.tongues=1;g.loot=[{x:5.5,y:8.5,value:1,taken:false}];g.useTongue();advance(g,.36);assert.equal(g.status,'failed');assert.ok(g.result.message.includes('Save one'));assert.equal(g.hasKey,false);
});
