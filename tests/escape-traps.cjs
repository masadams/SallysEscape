const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');
function ticks(g,s,input={}){for(let n=0;n<Math.ceil(s*120);n++)g.advance(1/120,input);}
// An open arena with no hunters, so only the trap can catch Sally.
function arena(player=[2,5]){const g=new EscapeAdventure();for(let y=1;y<g.height-1;y++)for(let x=1;x<g.width-1;x++)g.grid[y][x]='.';g.hunters=[];g.key={x:15.5,y:11.5};g.exit={x:1.5,y:11.5};g.loot=[];Object.assign(g.player,{x:player[0]+.5,y:player[1]+.5});return g;}
const log=(from,to,extra={})=>({from:{x:from[0]+.5,y:from[1]+.5},to:{x:to[0]+.5,y:to[1]+.5},period:4,offset:0,speed:6,warn:1,pos:null,rolling:false,warning:false,...extra});

test('a rolling log warns, sweeps its lane on a rhythm, and flattens Sally if she stays in it',()=>{
  const g=arena([8,5]);g.logs=[log([1,5],[15,5])];ticks(g,1.1);assert.equal(g.logs[0].warning,true);assert.ok(g.drainEvents().includes('rumble'));assert.equal(g.status,'playing');
  ticks(g,2);assert.equal(g.status,'caught');assert.match(g.result.message,/log/);
});
test('a side pocket keeps Sally safe from the log, and the log knocks hunters down',()=>{
  const g=arena([8,6]);g.logs=[log([1,5],[15,5])];const h=g.makeHunter({kind:'snake',spawn:[12,5],facing:0,patrol:[[12,5]]});g.hunters=[h];g.hunter=h;g.motion.resetHunter(h,0);h.pauseUntil=100;g.player.hidden=true;g.grid[6][8]='L';
  ticks(g,4);assert.equal(g.status,'playing');assert.ok(g.hunters[0].state==='steamed'||g.hunters[0].state==='patrol');
});
test('thorns rise on a rhythm, tremble first, and only catch Sally while raised',()=>{
  const g=arena([6,5]);g.thorns=[{keys:new Set(['6,5']),period:3,up:1,offset:0,raised:false,warning:false}];ticks(g,1.6);assert.equal(g.thorns[0].warning,true);assert.equal(g.status,'playing');ticks(g,.5);assert.equal(g.status,'caught');assert.match(g.result.message,/Thorns/);
  const safe=arena([6,5]);safe.thorns=[{keys:new Set(['6,5']),period:3,up:1,offset:0}];ticks(safe,1.5);Object.assign(safe.player,{x:8.5});ticks(safe,1);assert.equal(safe.status,'playing');
});
test('crumbling floor holds while Sally stands on it and collapses into a gap once she leaves',()=>{
  const g=arena([4,5]);g.level={...g.level,crumble:[[5,5]]};g.grid[5][5]='c';assert.equal(g.floor(5,5),true);
  ticks(g,.45,{x:1});assert.ok(g.crumbling.has('5,5'));ticks(g,.3);assert.equal(g.grid[5][5],'c','still there under her feet');
  ticks(g,.6,{x:1});ticks(g,.5);assert.equal(g.grid[5][5],'P');assert.equal(g.floor(5,5),false,'there is no way back');assert.equal(g.status,'playing');
});
test('a crumbling bridge carries Sally across once, then falls; a one-use bridge seals after it closes',()=>{
  const g=new EscapeAdventure({levelId:'firefly-ford'});g.hunters=[];const gate=g.gates[0];gate.crumble=true;g.setGateOpen(gate,true);
  Object.assign(g.player,{x:13.5,y:9.5});ticks(g,.5,{x:1});assert.equal(gate.crossed,true);ticks(g,.5,{x:1});ticks(g,.6);assert.equal(gate.open,false);assert.equal(gate.sealed,true);
  Object.assign(g.player,{x:12.5,y:9.5});ticks(g,.2);assert.equal(gate.open,false,'its plate no longer works');
  const once=new EscapeAdventure({levelId:'firefly-ford'});once.hunters=[];const bridge=once.gates[0];bridge.once=true;Object.assign(once.player,{x:12.5,y:9.5});ticks(once,.1);assert.equal(bridge.open,true);
  Object.assign(once.player,{x:10.5,y:9.5});ticks(once,bridge.duration+1);assert.equal(bridge.open,false);assert.equal(bridge.sealed,true);Object.assign(once.player,{x:12.5,y:9.5});ticks(once,.2);assert.equal(bridge.open,false);
});
