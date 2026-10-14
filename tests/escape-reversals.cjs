const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');
const {EscapeCatalog,escapeGridFor}=require('../public/escape-levels.js');
const {EscapeProgress}=require('../public/escape-progress.js');
const later=EscapeCatalog.levels.filter(l=>l.reactions);
function game(id='backlash-hall'){return new EscapeAdventure({levelId:id});}
function advance(g,s,input={}){for(let n=0;n<Math.ceil(s*120);n++)g.advance(1/120,input);}
function openBlue(g){Object.assign(g.player,g.gates.find(g=>g.id==='blue').switch);g.activateSwitches();}

test('the maze only reacts in later chapters, with increasing enemy pressure',()=>{
 assert.equal(later.length,35);assert.ok(EscapeCatalog.levels.slice(0,13).every(l=>!l.reactions));
 assert.deepEqual(EscapeCatalog.levels.slice(13,17).map(l=>l.guards.length),[3,3,4,4]);assert.equal(EscapeCatalog.levels.length,53);assert.equal(EscapeCatalog.challenges.length,16);
 for(const level of later){const g=game(level.id);for(const p of [g.player,g.key,g.exit,...g.loot,...g.hunters,...g.hunters.flatMap(h=>h.patrol)])assert.ok(g.fits(p),level.id+' valid placement');
  for(const r of level.reactions){assert.ok(r.message&&r.objective);for(const id of [...r.close||[],...r.open||[]])assert.ok(g.gates.find(g=>g.id===id));}
 }
});
test('taking the key opens a new way out before the entrance seals and fires only once',()=>{
 const g=game();openBlue(g);g.collectKey();const blue=g.gates[0],back=g.gates[1];
 assert.equal(blue.sealed,true);assert.equal(blue.open,true);assert.ok(blue.closingAt>=.9);assert.equal(back.open,true);assert.ok(g.drainEvents().includes('maze'));assert.equal(g.reactionsFired.size,1);
 g.collectKey();g.reactToMaze('key');assert.equal(g.reactionsFired.size,1);advance(g,1);assert.equal(blue.open,false);assert.equal(g.grid[3][12],'G');assert.equal(g.grid[14][12],'g');
 Object.assign(g.player,blue.switch);g.activateSwitches();assert.equal(blue.open,false);assert.match(g.mazeObjectiveText(),/south passage/);
});
test('sealing waits for Sally and enemies to clear a doorway, including collider edges',()=>{
 for(const actor of ['player','hunter']){const g=game();openBlue(g);Object.assign(g[actor],{x:13.22,y:3.5});g.collectKey();g.elapsed=1;g.updateClosingGates();assert.equal(g.gates[0].open,true);
  g[actor].x=13.4;g.updateClosingGates();assert.equal(g.gates[0].open,false);assert.ok(g.fits(g[actor]));}
});
test('pause and completed attempts freeze pending closures; retry resets the maze',()=>{
 const g=game();openBlue(g);g.collectKey();const elapsed=g.elapsed,closing=g.gates[0].closingAt;g.paused=true;g.advance(5);g.updateClosingGates();assert.equal(g.elapsed,elapsed);assert.equal(g.gates[0].closingAt,closing);assert.equal(g.gates[0].open,true);
 g.paused=false;g.finish('caught','Caught');g.elapsed=3;g.updateClosingGates();assert.equal(g.gates[0].open,true);assert.equal(g.result.reactionsFired,1);assert.ok(Object.isFrozen(g.result));
 const fresh=game();assert.equal(fresh.reactionsFired.size,0);assert.equal(fresh.gates[0].sealed,false);assert.equal(fresh.gates[1].open,false);assert.equal(fresh.mazeObjectiveText(),null);
});
test('entry reactions wait for the actual room and prerequisites, rather than nearby walls',()=>{
 const g=game('false-refuge');Object.assign(g.player,{x:10.5,y:9.5});g.reactToMaze('enter');assert.equal(g.reactionsFired.size,0);openBlue(g);g.reactToMaze('enter');assert.equal(g.reactionsFired.size,0);
 Object.assign(g.player,{x:11.5,y:9.5});g.reactToMaze('enter');assert.equal(g.reactionsFired.size,1);assert.equal(g.gates[0].sealed,true);assert.equal(g.gates[1].open,false);assert.match(g.mazeObjectiveText(),/amber/);
 Object.assign(g.player,g.gates[1].switch);g.activateSwitches();assert.equal(g.mazeObjectiveText(),null);g.reactToMaze('enter');assert.equal(g.reactionsFired.size,1);
});
test('the treasure trap fires for its chest, not ordinary coins, including a tongue-collected chest',()=>{
 const g=game('greedy-gallery');openBlue(g);g.collectLoot(g.loot[0]);assert.equal(g.reactionsFired.size,0);
 g.hunters=[];Object.assign(g.player,{x:12.5,y:10.5,facing:{x:1,y:0}});assert.equal(g.useTongue(),true);advance(g,.16);
 assert.equal(g.treasure,4);assert.equal(g.loot[3].taken,true);assert.equal(g.reactionsFired.size,1);assert.equal(g.gates[1].open,true);assert.equal(g.gates[0].sealed,true);
 g.collectLoot(g.loot[3]);assert.equal(g.treasure,4);assert.equal(g.reactionsFired.size,1);
});
test('gate closures invalidate paths, update sight and block tongue and burrow',()=>{
 const g=game();openBlue(g);Object.assign(g.player,{x:11.5,y:3.5,facing:{x:1,y:0}});g.collectKey();
 assert.equal(g.clear(g.player,{x:13.5,y:3.5},true),true);g.elapsed=1;for(const h of g.hunters){h.path=[{x:13.5,y:3.5}];h.targetId='old';}g.updateClosingGates();
 assert.ok(g.hunters.every(h=>h.path.length===0&&h.targetId===null));assert.equal(g.clear(g.player,{x:13.5,y:3.5},true),false);assert.equal(g.visibleTile(13,3),false);
 g.burrows=1;assert.equal(g.burrow(),false);assert.match(g.message,/sealed/);assert.equal(g.burrows,1);
});
test('the citadel stages its second reversal after the key, not on an early chamber visit',()=>{
 const g=game('turning-citadel');Object.assign(g.player,{x:14.5,y:11.5});g.reactToMaze('enter');assert.equal(g.reactionsFired.size,0);
 g.collectKey();assert.equal(g.gates.find(g=>g.id==='descent').open,true);g.reactToMaze('enter');assert.equal(g.reactionsFired.size,2);assert.equal(g.gates.find(g=>g.id==='descent').sealed,true);assert.equal(g.gates.find(g=>g.id==='escape').open,true);
 assert.equal(g.gates.find(g=>g.id==='amber').open,false);Object.assign(g.player,g.gates.find(g=>g.id==='amber').switch);g.activateSwitches();assert.equal(g.gates.find(g=>g.id==='amber').open,true);
});
test('old thirteen-route saves unlock the harder chapter without a wipe',()=>{
 const levels=Object.fromEntries(EscapeCatalog.levels.slice(0,13).map(l=>[l.id,{cleared:true,bestTime:20,stars:2,treasure:5,revision:l.revision||1}]));const raw=JSON.stringify({version:1,levels,challenges:{},view:'follow'});
 const p=new EscapeProgress({getItem:()=>raw,setItem(){}});assert.equal(Object.keys(p.data.levels).length,13);assert.equal(p.unlocked('backlash-hall'),true);assert.equal(p.unlocked('false-refuge'),false);
});

// Traverse tiles and persistent maze states with the actual gate/reaction
// handlers. Possible burrow landings add entry states, but only walking edges
// prove escape safety. The recordings separately cover enemies and timing.
function walkingGraph(level){
 const base=game(level.id),start={x:level.spawn[0],y:level.spawn[1],open:base.gates.reduce((n,g,i)=>n|(g.open?1<<i:0),0),sealed:0,key:false,fired:0,chest:false},nodes=[],edges=[],ids=new Map(),goals=[];
 const signature=n=>[n.x,n.y,n.open,n.sealed,+n.key,n.fired,+n.chest].join(','),reactions=level.reactions||[],completeReactions=EscapeCatalog.levels.indexOf(level)>=17;
 function add(n){const id=signature(n);if(ids.has(id))return ids.get(id);const i=nodes.length;ids.set(id,i);nodes.push(n);edges.push([]);return i;}
 function apply(n){const g=Object.create(EscapeAdventure.prototype);Object.assign(g,{...base,player:{...base.player,x:n.x+.5,y:n.y+.5},hunters:[],pendingSpawns:[],spawnedReinforcements:new Set(),grid:escapeGridFor(level),gates:base.gates.map((gate,i)=>({...gate,open:Boolean(n.open&(1<<i)),sealed:Boolean(n.sealed&(1<<i)),closingAt:null})),hasKey:n.key,reactionsFired:new Set(reactions.filter((r,i)=>n.fired&(1<<i)).map(r=>r.id)),events:[],elapsed:10,updateVisibility(){}});
  for(const gate of g.gates)for(const [x,y] of gate.tiles)g.grid[y][x]=gate.bridge?(gate.open?'W':'P'):gate.open?'g':'G';g.activateSwitches();g.reactToMaze('enter');
  if(!g.hasKey&&n.x===level.key[0]&&n.y===level.key[1])g.collectKey();
  let taken=Number(n.chest);reactions.forEach((r,i)=>{if(r.when==='treasure'&&n.x===r.at[0]&&n.y===r.at[1]&&!(taken&(1<<i))){taken|=1<<i;g.reactToMaze('treasure',{x:n.x+.5,y:n.y+.5});}});
  g.elapsed+=1;g.updateClosingGates();return {g,n:{...n,key:g.hasKey,chest:taken,open:g.gates.reduce((v,gate,i)=>v|(gate.open?1<<i:0),0),sealed:g.gates.reduce((v,gate,i)=>v|(gate.sealed?1<<i:0),0),fired:reactions.reduce((v,r,i)=>v|(g.reactionsFired.has(r.id)?1<<i:0),0)}};
 }
 add(apply(start).n);
 for(let i=0;i<nodes.length;i++){const {g,n}=apply(nodes[i]);if(n.key&&n.x===level.exit[0]&&n.y===level.exit[1]&&(!completeReactions||n.fired===(1<<reactions.length)-1))goals.push(i);
  // A timer can expire anywhere off its plate/crossing. Include those
  // closures as reachable states, so recovery never depends on a consumable.
  g.gates.forEach((gate,k)=>{if(!gate.duration||!gate.open||gate.sealed)return;const occupied=gate.tiles.some(([x,y])=>x===n.x&&y===n.y)||gate.plates.some(p=>Math.floor(p.x)===n.x&&Math.floor(p.y)===n.y);if(!occupied){const j=add(apply({...n,open:n.open&~(1<<k)}).n);edges[j].push(i);}});
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=n.x+dx,y=n.y+dy;if(!g.floor(x,y))continue;const next=apply({...n,x,y}).n,j=add(next);edges[j].push(i);}
  // Seed crossings and braced roots can reach extra components. Treat
  // their far banks as spent-seed entry states, then prove a walking return.
  if(level.seeds){
   for(const bed of level.seedCrossings||[])for(let k=0;k<bed.banks.length;k++)if(n.x===bed.banks[k][0]&&n.y===bed.banks[k][1]){const [x,y]=bed.banks[1-k];add(apply({...n,x,y}).n);}
   for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){let x=n.x+dx,y=n.y+dy;const gate=g.gates.find(q=>q.root&&q.sealed&&q.tiles.some(([gx,gy])=>gx===x&&gy===y));if(!gate)continue;let count=0;while(gate.tiles.some(([gx,gy])=>gx===x&&gy===y)&&count++<8){x+=dx;y+=dy;}if(g.floor(x,y))add(apply({...n,x,y}).n);}
  }
  if(level.burrows)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const wx=n.x+dx,wy=n.y+dy,x=n.x+2*dx,y=n.y+2*dy;if(wx<=0||wy<=0||wx>=g.width-1||wy>=g.height-1||!['#','B'].includes(g.grid[wy]?.[wx])||!g.fits({x:x+.5,y:y+.5}))continue;add(apply({...n,x,y}).n);}
 }
 const safe=new Set(goals),queue=[...goals];for(let i=0;i<queue.length;i++)for(const p of edges[queue[i]])if(!safe.has(p)){safe.add(p);queue.push(p);}
 return {nodes,safe,goals};
}
for(const level of EscapeCatalog.levels.filter(l=>l.reactions||l.gates?.some(g=>g.duration)))test('every reachable maze state retains a walking key-and-exit solution: '+level.id,()=>{
 const {nodes,safe,goals}=walkingGraph(level);assert.ok(goals.length);assert.equal(safe.size,nodes.length,'no state can strand Sally after resources are spent');
 for(const [x,y] of level.loot)assert.ok(nodes.some(n=>n.x===x&&n.y===y),'treasure can be reached and escaped with');
 assert.ok(nodes.some(n=>n.fired===(1<<(level.reactions||[]).length)-1),'all authored reversals can happen');
});
