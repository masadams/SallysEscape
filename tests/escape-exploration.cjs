const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');
const {EscapeProgress}=require('../public/escape-progress.js');
const {EscapeCatalog}=require('../public/escape-levels.js');
const {escapeCameraFor}=require('../public/escape-view.js');
function advance(g,seconds,input={}){for(let n=0;n<Math.ceil(seconds*120);n++)g.advance(1/120,input);}
function garden(){return new EscapeAdventure({levelId:'switchback-garden'});}
function beetle(){const g=new EscapeAdventure({levelId:'lantern-courtyard'});g.hunters=[g.hunters[0]];Object.assign(g.hunter,{x:9.5,y:8.5,facing:0});Object.assign(g.player,{x:11.5,y:8.5});return g;}
test('closed gates block paths, sight and burrowing; a matching switch opens every gate permanently',()=>{
 const g=garden(),gate=g.gates[0];assert.equal(g.route(g.player,g.key).length,0);
 Object.assign(g.player,{x:9.5,y:4.5,facing:{x:1,y:0}});const charges=g.burrows;
 assert.equal(g.clear(g.player,{x:11.5,y:4.5}),false);assert.equal(g.burrow(),false);assert.equal(g.burrows,charges);
 Object.assign(g.player,gate.switch);g.activateSwitches();assert.ok(gate.open);assert.ok(g.route(g.player,g.key).length);
 Object.assign(g.player,g.exit);g.activateSwitches();assert.ok(gate.open);assert.ok(gate.tiles.every(([x,y])=>g.floor(x,y)));
});
test('opening a switch invalidates all cached guard paths and paused contact does not activate it',()=>{
 const g=garden();Object.assign(g.player,g.gates[0].switch);g.paused=true;g.advance(1);assert.equal(g.gates[0].open,false);
 for(const h of g.hunters){h.path=[{x:999,y:999}];h.targetId='old';}g.activateSwitches();
 assert.ok(g.hunters.every(h=>h.path.length===0&&h.targetId===null));
});
test('exploration shows the blocking wall or gate, hides cells behind it and remembers visited terrain',()=>{
 const g=garden();Object.assign(g.player,{x:9.5,y:4.5});g.updateVisibility(true);
 assert.equal(g.visibleTile(10,4),true);assert.equal(g.visibleTile(11,4),false);assert.equal(g.discovered.has('17,3'),false);
 const before=new Set(g.discovered);Object.assign(g.player,g.gates[0].switch);g.activateSwitches();Object.assign(g.player,{x:9.5,y:4.5});g.updateVisibility(true);
 assert.equal(g.visibleTile(11,4),true);assert.ok([...before].every(id=>g.discovered.has(id)));
});
test('two touching walls prevent diagonal discovery of another room',()=>{
 const g=garden();g.grid=Array.from({length:g.height},()=>Array(g.width).fill('#'));g.grid[1][1]='.';g.grid[2][2]='.';Object.assign(g.player,{x:1.5,y:1.5});g.updateVisibility(true);
 assert.equal(g.visibleTile(2,2),false);
});
test('pause freezes discovery and the first five routes retain full visibility',()=>{
 const g=garden(),before=[...g.discovered];g.paused=true;g.advance(5,{x:1});assert.deepEqual([...g.discovered],before);
 const old=new EscapeAdventure();assert.equal(old.visibleTile(15,2),true);assert.equal(escapeCameraFor(old,800,395).follow,false);
});
test('follow camera crops a larger map, contains Sally at every border, and overview fits the whole map',()=>{
 const g=garden();for(const [width,height] of [[351,247],[800,395]]){
  for(const [x,y] of [[1.5,1.5],[g.width-1.5,g.height-1.5],[10.5,8.5]]){Object.assign(g.player,{x,y});const c=escapeCameraFor(g,width,height);assert.ok(c.follow);assert.ok(c.cell*g.height>height);assert.ok(x*c.cell+c.ox>=0&&x*c.cell+c.ox<=width);assert.ok(y*c.cell+c.oy>=0&&y*c.cell+c.oy<=height);assert.ok(c.ox<=0&&c.oy<=0);}
  const c=escapeCameraFor(g,width,height,true);assert.equal(c.follow,false);assert.ok(c.cell*g.width<=width&&c.cell*g.height<=height);
 }
});
test('current trail saves unlock the next chapter and the view preference survives reloads without dropping records',()=>{
 const data=new Map(),s={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},levels={};for(const level of EscapeCatalog.levels.slice(0,5))levels[level.id]={cleared:true,bestTime:15,stars:2,treasure:4,revision:level.revision||1};
 s.setItem('sallys-escape-progress-v1',JSON.stringify({version:1,levels,challenges:{}}));const p=new EscapeProgress(s);assert.ok(p.unlocked('switchback-garden'));assert.equal(p.data.view,'follow');
 assert.equal(p.setView('overview'),true);assert.equal(p.setView('invalid'),false);const saved=new EscapeProgress(s);assert.equal(saved.data.view,'overview');assert.equal(Object.keys(saved.data.levels).length,5);
});
test('beetle telegraphs a fixed aim, charges without steering and then rests',()=>{
 const g=beetle(),h=g.hunter;advance(g,.9);assert.equal(h.state,'windup');const aim={...h.aim},position={x:h.x,y:h.y};
 Object.assign(g.player,{x:12.5,y:10.5});advance(g,.5);assert.deepEqual(h.aim,aim);assert.equal(h.x,position.x);assert.equal(h.y,position.y);
 advance(g,.9);assert.equal(g.status,'playing');assert.equal(h.state,'recover');assert.ok(Math.abs(h.y-8.5)<1e-8);assert.ok(Math.abs(h.x-aim.x)<.06);
});
test('beetle charges stop at a closed gate and never phase through a wall',()=>{
 const g=beetle(),h=g.hunter;Object.assign(h,{x:13.5,y:8.5,state:'charge',facing:0,aim:{x:17.5,y:8.5},phaseUntil:2});Object.assign(g.player,{x:8.5,y:10.5});
 advance(g,.5);assert.equal(h.state,'recover');assert.ok(h.x<13.8);assert.ok(g.fits(h));
});
test('beetles cannot see through walls or stationary leaf cover',()=>{
 const g=beetle();g.player.hidden=true;assert.equal(g.seesPlayer(g.hunter),false);g.player.hidden=false;Object.assign(g.hunter,{x:16.5,y:8.5,facing:Math.PI});assert.equal(g.seesPlayer(g.hunter),false);
});
test('paused beetle charges freeze and an actual charge collision ends the attempt',()=>{
 const g=beetle(),h=g.hunter;Object.assign(h,{state:'charge',aim:{x:12.5,y:8.5},phaseUntil:2});Object.assign(g.player,{x:10.2,y:8.5});g.paused=true;g.advance(5);assert.equal(h.x,9.5);g.paused=false;advance(g,.1);assert.equal(g.status,'caught');
});
