const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');const {escapeBuildCustom}=require('../public/escape-levels.js');
function ticks(g,s,input={}){for(let n=0;n<Math.ceil(s*120)&&g.status==='playing';n++)g.advance(1/120,input);}
// A 17×9 room built from a text map, with extra level data.
function room(rows,extra={}){return new EscapeAdventure({level:escapeBuildCustom({id:'custom-test',name:'Test',map:rows,guards:[],...extra})});}
const ROWS=['#################','#@..............#','#...............#','#...............#','#.......o.......#','#...............#','#...............#','#K.............X#','#################'];
const snake=(g,at,patrol)=>{const h=g.makeHunter({kind:'snake',spawn:at,facing:Math.PI,patrol});g.hunters.push(h);g.motion.resetHunter(h,g.hunters.length-1);return h;};

test('a spore puffball bursts under Sally into a cloud that hides her on the move and blinds hunters inside it',()=>{
  const g=room(ROWS);assert.equal(g.puffs.length,1);Object.assign(g.player,{x:6.5,y:4.5});ticks(g,.8,{x:1});
  assert.equal(g.clouds.length,1,'stepping on it bursts it');ticks(g,.2,{x:1});assert.equal(g.player.hidden,true,'hidden inside the cloud while moving');
  const h=snake(g,[10,4],[[10,4]]);h.facing=Math.PI;assert.equal(g.seesPlayer(h),false);
  Object.assign(g.player,{x:12.5,y:4.5});Object.assign(h,{x:8.5,y:4.5,facing:0});ticks(g,.05);assert.equal(g.seesPlayer(h),false,'a hunter in the cloud is blind');
  g.hunters=[];ticks(g,5);assert.equal(g.clouds.length,0,'the cloud thins away');assert.ok(g.elapsed<g.puffs[0].readyAt,'and the puffball is still regrowing');
});
test('a pebble or a hunter treading on a puffball bursts it too',()=>{
  const g=room(ROWS);g.decoy={x:8.5,y:4.5,expires:5};ticks(g,.05);assert.equal(g.clouds.length,1);
  const t=room(ROWS);const h=snake(t,[6,4],[[6,4],[11,4]]);Object.assign(t.player,{x:1.5,y:7.5});ticks(t,4);assert.equal(t.clouds.length>0||t.elapsed<t.puffs[0].readyAt,true,'the snake walked over it');
});
test('a bounce cap flings Sally over a gap to its landing tile, silently and out of reach mid-air',()=>{
  const rows=['#################','#@..............#','#...............#','#...............#','#......_._......#','#......___......#','#...............#','#K.............X#','#################'];
  const g=room(rows,{caps:[{at:[5,4],to:[10,4]}]});Object.assign(g.player,{x:3.5,y:4.5});
  ticks(g,1.8,{x:1});assert.equal(g.player.flight,null);assert.ok(g.player.x>9.6&&g.player.x<12.5,'landed past the gap: '+g.player.x);
  const air=room(rows,{caps:[{at:[5,4],to:[10,4]}]});Object.assign(air.player,{x:4.95,y:4.5});ticks(air,.1,{x:1});assert.ok(air.player.flight,'in the air');assert.equal(air.player.moving,false,'a flight makes no footsteps');
});
test('a mole tunnels toward footsteps and bursts up beneath Sally, but a still or leafy Sally gives it nothing',()=>{
  const mole=(g,at)=>{const h=g.makeHunter({kind:'mole',spawn:at,facing:0,patrol:[at]});g.hunters.push(h);g.motion.resetHunter(h,g.hunters.length-1);return h;};
  const g=room(ROWS);const h=mole(g,[9,2]);Object.assign(g.player,{x:6.5,y:2.5});ticks(g,.4,{x:-1});assert.equal(h.state,'track','it felt the footsteps');
  ticks(g,4,{x:1});assert.equal(g.status,'caught','walking on toward it');assert.match(g.result.message,/mole/);
  const still=room(ROWS);const m=mole(still,[9,2]);Object.assign(still.player,{x:6.5,y:2.5});ticks(still,.2,{x:-1});ticks(still,3,{});
  assert.equal(still.status,'playing','stopping when it ripples close leaves it sniffing short of her');assert.ok(['up','under','surface'].includes(m.state));
  const leafy=room(ROWS.map((r,y)=>y===2?r.replace(/\./g,'L'):r));const l=mole(leafy,[9,2]);Object.assign(leafy.player,{x:4.5,y:2.5});ticks(leafy,2,{x:1});assert.equal(l.state,'under','footsteps on leaves make no tremble');
});
test('the Mushroom Grotto follows the Great Boiler with five escapes that teach puffballs, caps and moles',()=>{
  const {EscapeCatalog}=require('../public/escape-levels.js'),{EscapeWorld}=require('../public/escape-world.js');
  const grotto=EscapeCatalog.levels.slice(78,83);assert.deepEqual(grotto.map(l=>l.id),['puffball-hollow','capstone-leap','mole-run','spore-garden','fairy-ring']);
  assert.ok(EscapeCatalog.regions.includes(78));for(const l of grotto){assert.equal(l.loot.reduce((n,t)=>n+t[2],0),10);assert.ok(l.tailDrop);}
  assert.ok(grotto[0].puffballs.length>=4);assert.equal(grotto[1].caps.length,2);assert.ok(grotto[2].guards.filter(g=>g.kind==='mole').length>=2);
  assert.ok(['mantis','mole','wasp'].every(k=>grotto[3].guards.some(g=>g.kind===k)));assert.equal(grotto[4].requiredTreasure,6);assert.equal(grotto[4].caps.length,4);
  const w=new EscapeWorld(),c=w.chapters.find(c=>c.theme==='grotto');assert.equal(c.name,'Mushroom Grotto');assert.equal(c.start,78);
  assert.ok(w.paths.some(([a,b])=>w.chapters[a].theme==='vents'&&w.chapters[b]===c),'the Grotto opens off the Steam Vents');
});
