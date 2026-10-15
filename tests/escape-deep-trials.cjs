const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');
const {EscapeCatalog}=require('../public/escape-levels.js');
const {EscapeProgress}=require('../public/escape-progress.js');
// Quota, deadline, sight and reversal rules are checked on frozen copies of the original trials,
// so rebuilt routes cannot move them.
const legacy=require('./fixtures/legacy-levels.json');
function game(id){return new EscapeAdventure(legacy[id]?{level:legacy[id]}:{levelId:id});}
function advance(g,s,input={}){for(let n=0;n<Math.ceil(s*120);n++)g.advance(1/120,input);}
test('Deep Trials escalate enemy pressure and keep new quotas, deadlines and shorter sight in their own chapter',()=>{
 const deep=EscapeCatalog.levels.slice(17,23);assert.equal(deep.length,6);assert.deepEqual(deep.map(l=>l.guards.length),[4,4,6,5,5,6]);
 assert.ok(EscapeCatalog.levels.slice(0,17).every(l=>!l.requiredTreasure&&!l.timeLimit&&!l.sightRadius));
 for(const l of deep){assert.ok(l.width>=25&&l.height>=13);assert.ok(!l.sightRadius||l.sightRadius>=5);assert.ok(Object.isFrozen(l));const g=new EscapeAdventure({levelId:l.id});assert.ok(g.requiredTreasure<=g.totalTreasure);}
});
test('base treasure quotas gate the hatch and correctly explain partial progress; full sweep overrides six with ten',()=>{
 const g=game('toll-of-ash');g.hunters=[];g.collectKey();assert.equal(g.requiredTreasure,4);assert.match(g.message,/4 more/);assert.equal(g.exitUnlocked(),false);
 g.collectLoot(g.loot[3]);assert.equal(g.treasure,3);Object.assign(g.player,g.exit);advance(g,.6);assert.equal(g.status,'playing');assert.equal(g.exitHold,0);
 g.collectLoot(g.loot[0]);assert.equal(g.exitUnlocked(),true);advance(g,.6);assert.equal(g.status,'won');assert.equal(g.result.treasure,4);
 const royal=new EscapeAdventure({challengeId:'royal-sweep'});assert.equal(royal.requiredTreasure,10);assert.equal(game('crown-of-thorns').requiredTreasure,6);
});
test('Last Light has a base-level deadline that freezes on pause and wins over a late exit',()=>{
 const g=game('last-light');g.hunters=[];assert.equal(g.timeLimit,50);g.elapsed=49.99;g.paused=true;advance(g,2);assert.equal(g.elapsed,49.99);g.paused=false;advance(g,.02);assert.equal(g.status,'failed');
 const late=game('last-light');late.hunters=[];late.hasKey=true;late.elapsed=49.999;late.exitHold=.549;Object.assign(late.player,late.exit);late.advance(1/120);assert.equal(late.status,'failed');assert.ok(Object.isFrozen(late.result));
 assert.equal(new EscapeAdventure({challengeId:'needle-dash'}).timeLimit,60);
});
test('shorter sight hides farther terrain while keeping nearby warnings visible; old sight stays six tiles',()=>{
 for(const [id,x,y,farX,expected] of [['last-light',16,12,22,false],['switchback-garden',10,8,16,true]]){const g=game(id);g.grid=g.grid.map((row,y)=>row.map((_,x)=>x===0||y===0||x===g.width-1||y===g.height-1?'#':'.'));Object.assign(g.player,{x:x+.5,y:y+.5});g.updateVisibility(true);assert.equal(g.visibleTile(farX,y),expected);assert.equal(g.visibleTile(x+4,y),true);}
});
test('Threefold Keep fires its room reversal before a tongue can reach the chest, and the chest opens the final walking exit',()=>{
 const g=game('threefold-keep');g.hunters=[];g.collectKey();Object.assign(g.player,{x:20.5,y:12.5,facing:{x:-1,y:0}});assert.equal(g.useTongue(),false);
 Object.assign(g.player,{x:19.5,y:12.5});g.reactToMaze('enter');assert.equal(g.reactionsFired.size,2);Object.assign(g.player,{x:17.5,y:12.5});assert.equal(g.useTongue(),true);advance(g,.16);
 assert.equal(g.reactionsFired.size,3);assert.equal(g.treasure,3);assert.equal(g.gates.find(g=>g.id==='west').sealed,true);assert.equal(g.gates.find(g=>g.id==='final').open,true);assert.ok(g.route(g.player,g.exit).length);
});
test('the final Crown layout keeps all treasure reachable after every reversal, so its quota cannot be stranded',()=>{
 const g=game('crown-of-thorns');g.hunters=[];for(const id of ['blue','amber']){Object.assign(g.player,g.gates.find(gate=>gate.id===id).switch);g.activateSwitches();g.reactToMaze('enter');}
 g.collectKey();g.collectLoot(g.loot[4]);g.elapsed=2;g.updateClosingGates();assert.equal(g.reactionsFired.size,3);Object.assign(g.player,g.exit);
 for(const loot of g.loot)assert.ok(g.route(g.player,loot).length,'every remaining quota item stays reachable');assert.ok(g.route(g.player,g.key).length);
});
test('seventeen-route saves unlock Deep Trials without dropping medals or challenge records',()=>{
 const levels=Object.fromEntries(EscapeCatalog.levels.slice(0,17).map(l=>[l.id,{cleared:true,bestTime:20,stars:2,treasure:5,revision:l.revision||1}])),raw=JSON.stringify({version:1,view:'overview',levels,challenges:{'no-turning-back':{cleared:true,bestTime:40,revision:EscapeCatalog.levels.find(l=>l.id==='turning-citadel').revision}}});
 const p=new EscapeProgress({getItem:()=>raw,setItem(){}});assert.equal(p.unlocked('razor-crossing'),true);assert.equal(p.unlocked('needle-vault'),false);assert.equal(Object.keys(p.data.levels).length,17);assert.equal(p.data.view,'overview');assert.ok(p.data.challenges['no-turning-back'].cleared);
});
test('leaf cover on a switch still hides a stationary Sally while the switch activates normally',()=>{
 const g=game('razor-crossing');g.hunters=[];Object.assign(g.player,g.gates.find(gate=>gate.id==='amber').switch);assert.equal(g.grid[11][14],'L');advance(g,.02);assert.equal(g.player.hidden,true);assert.equal(g.gates.find(gate=>gate.id==='amber').open,true);
});
