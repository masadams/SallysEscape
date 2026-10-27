// Records winning runs for tests/fixtures/escape-playthroughs.json.
//
//   node scripts/route-solver.cjs solve <levelId|challenge:id> "<hints>"   new route from hints
//   node scripts/route-solver.cjs repair <fixture index>                  re-record after a rules change
//   node scripts/route-solver.cjs sprint <levelId>                        does a straight sprint win?
//   node scripts/route-solver.cjs naive <levelId> "<hints>"              does the plain hint route win unaided?
//
// Hints are space separated: gX,Y walks the engine's own route to tile X,Y (gX,Y! sprints),
// wN waits N seconds, fX,Y faces a direction (f0,1 is down), and pebble/burrow/tongue/seed/camo use a tool. A hint run is first
// recorded with every hunter and timed trap removed, then a search adds waits and sprint
// changes wherever the real hunters would catch Sally, keeping whatever gets furthest.
const path=require('path');
const {EscapeAdventure}=require(path.join(__dirname,'../public/escape-engine.js'));
const {clone,push,bad,frame,go}=require(path.join(__dirname,'../public/escape-planner.js'));
const ACT={pebble:'throwDecoy',burrow:'burrow',tongue:'useTongue',seed:'plantSeed',camo:'camouflage'};
const optionsFor=id=>id.startsWith('challenge:')?{challengeId:id.slice(10)}:id.startsWith('hidden:')?{hiddenId:id.slice(7)}:id.startsWith('kids:')?{kidsId:id.slice(5)}:{levelId:id};

// The same rules with nothing hunting Sally: used to lay out a route from hints.
class Peaceful extends EscapeAdventure{
  // With no beetle about, a heavy plate's door simply stands open; the search then waits for the real one.
  constructor(options){super(options);this.hunters=[];this.hawk=null;this.antTrails=[];this.logs=[];this.thorns=[];for(const gate of this.gates)if(gate.heavy){gate.heavy=false;gate.duration=0;this.setGateOpen(gate,true);}}
  updateEmergences(){this.pendingSpawns=[];}
  // No hunters to steam here, so a steam-trap hatch opens on the key alone; the real search must still steam them.
  exitUnlocked(){const c=this.challenge;if(!c?.steamTraps)return super.exitUnlocked();this.challenge={...c,steamTraps:0};const open=super.exitUnlocked();this.challenge=c;return open;}
}
function record(Engine,options,hints){
  const g=new Engine(options),out=[],move=(x,y,sprint,frames)=>{for(let i=0;i<frames&&g.status==='playing';i++){g.advance(1/120,{x,y,sprint});push(out,{kind:'move',frames:1,x,y,sprint});}};
  for(const c of hints.split(/\s+/).filter(Boolean)){
    if(g.status!=='playing')break;
    if(/^w[0-9.]+$/.test(c)){move(0,0,false,Math.round(+c.slice(1)*120));continue;}
    if(/^f-?[01],-?[01]$/.test(c)){const [fx,fy]=c.slice(1).split(',').map(Number);move(fx,fy,false,1);continue;} // Face a direction with one frame of input.
    if(c.startsWith('g')){const [tx,ty]=c.slice(1).replace('!','').split(',').map(Number),sprint=c.endsWith('!');
      // Stepping onto a bounce cap flings Sally; ride the flight out and carry on from where she lands.
      route:for(const pt of g.route(g.player,{x:tx+.5,y:ty+.5})||[]){let n=0;while(Math.hypot(pt.x-g.player.x,pt.y-g.player.y)>.06&&n++<400&&g.status==='playing'){if(g.player.flight){while(g.player.flight&&g.status==='playing')move(0,0,false,1);break route;}const dx=pt.x-g.player.x,dy=pt.y-g.player.y,L=Math.hypot(dx,dy),step=(sprint?4:2.45)/120,s=L<step?L/step:1;move(+(dx/L*s).toFixed(4),+(dy/L*s).toFixed(4),sprint,1);}}
      continue;}
    // pDX,DY,S leans into a crate (or anything) in that direction for S seconds: a shove.
    if(/^p-?[01],-?[01],[0-9.]+$/.test(c)){const [px,py,ps]=c.slice(1).split(',').map(Number);move(px,py,false,Math.round(ps*120));continue;}
    if(ACT[c]){if(g[ACT[c]]())out.push({kind:c});else throw new Error('hint '+c+' failed at '+g.player.x.toFixed(2)+','+g.player.y.toFixed(2)+': '+g.message);continue;}
    throw new Error('unknown hint '+c);
  }
  move(0,0,false,240); // Stand on the hatch long enough to escape.
  return {commands:out,game:g};
}

// Turn a recording into a plan of waypoints, waits and actions.
function extractPlan(Engine,recording){
  const g=new Engine(recording.options),plan=[];let last={x:g.player.x,y:g.player.y},still=0,lastInput=null;
  const flushWait=()=>{if(still>0){plan.push({type:'wait',t:still/120});still=0;}};
  for(const c of recording.commands){
    // A move that shoved a crate is kept as a push from where it started, not as waypoints.
    if(c.kind==='move'&&(c.x||c.y)&&g.crates?.length){const probe=clone(g),v=probe.crateVersion;for(let n=0;n<c.frames;n++)probe.advance(1/120,c);
      if(probe.crateVersion!==v){flushWait();plan.push({type:'go',x:g.player.x,y:g.player.y,sprint:false,exact:true});plan.push({type:'push',x:c.x,y:c.y,frames:c.frames});for(let n=0;n<c.frames;n++)g.advance(1/120,c);last={x:g.player.x,y:g.player.y};lastInput=c;continue;}}
    if(c.kind!=='move'){flushWait();plan.push({type:'go',x:g.player.x,y:g.player.y,sprint:false,exact:true});plan.push({type:'act',kind:c.kind,aim:lastInput&&(lastInput.x||lastInput.y)?{x:lastInput.x,y:lastInput.y}:null});g[ACT[c.kind]]();continue;}
    for(let n=0;n<c.frames;n++){
      const flying=Boolean(g.player.flight);g.advance(1/120,c);if(g.player.flight){if(!flying){if(still)flushWait();plan.push({type:'go',x:g.player.flight.from.x,y:g.player.flight.from.y,sprint:Boolean(c.sprint)});}last={x:g.player.flight.to.x,y:g.player.flight.to.y};continue;}if(!(c.x||c.y)){still++;continue;}
      if(still)flushWait();
      const d=Math.hypot(g.player.x-last.x,g.player.y-last.y),turned=lastInput&&(lastInput.x!==c.x||lastInput.y!==c.y);
      if(d>=.35||turned&&d>.05){plan.push({type:'go',x:g.player.x,y:g.player.y,sprint:Boolean(c.sprint)});last={x:g.player.x,y:g.player.y};}
      lastInput=c;
    }
  }
  flushWait();plan.push({type:'go',x:g.player.x,y:g.player.y,sprint:false});plan.push({type:'finish'});
  return plan;
}
// A recorded run never leans on the forgiving tail drop: losing the tail counts as caught.
// ALLOW_TAIL=1 lets a bonus escape's run drop its tail (any finish will do there).
// STEALTH=1 treats any chase as failure, for long routes where a chase started early dooms the run far beyond the search window.
function wait(g,rec,t){for(let i=0;i<Math.round(t*120)&&g.status==='playing';i++)frame(g,rec,0,0,false);return !bad(g);}
function finish(g,rec){
  for(let tries=0;tries<3&&g.status==='playing';tries++){
    for(const pt of g.route(g.player,g.exit)||[])if(!go(g,rec,{x:pt.x,y:pt.y},false))return g.status==='won';
    for(let i=0;i<120&&g.status==='playing';i++)frame(g,rec,0,0,false);
  }
  return g.status==='won';
}
const OPTIONS=[{wait:0,sprint:null,scale:1},{wait:0,sprint:true,scale:.5},{wait:.5,sprint:null,scale:1},{wait:1,sprint:null,scale:1},{wait:0,sprint:false,scale:1.5},{wait:2,sprint:null,scale:1},{wait:1,sprint:true,scale:1},{wait:3.5,sprint:null,scale:1},{wait:5,sprint:true,scale:1},{wait:8,sprint:null,scale:1},{wait:12,sprint:null,scale:1},{wait:0,sprint:null,scale:1,run:8},{wait:0,sprint:null,scale:1,camo:true},{wait:0,sprint:null,scale:1,dodge:1},{wait:0,sprint:null,scale:1,dodge:-1},{wait:0,sprint:null,scale:1,pebble:true}];
function runItem(g,rec,item,option){
  // A sustained sprint lasts several items; camouflage blends in and holds still.
  if(option.run)g.solverSprint=option.run;
  // A sidestep leaves a charge lane or tongue line, then the route carries on.
  if(option.dodge&&item.type==='go'){const dx=item.x-g.player.x,dy=item.y-g.player.y,L=Math.hypot(dx,dy)||1,px=-dy/L*option.dodge,py=dx/L*option.dodge,from={x:g.player.x,y:g.player.y};
    for(let i=0;i<48&&g.status==='playing';i++){frame(g,rec,+px.toFixed(4),+py.toFixed(4),true);if(bad(g))return false;}if(Math.hypot(g.player.x-from.x,g.player.y-from.y)<.5)return false;}
  if(option.pebble){if(!g.decoys||!g.throwDecoy())return false;rec.push({kind:'pebble'});}
  if(option.camo){if(!g.camos||!g.camouflage())return false;rec.push({kind:'camo'});if(!wait(g,rec,2))return false;}
  if(option.wait&&!wait(g,rec,option.wait))return false;if(g.status==='won')return true;
  if(item.type==='wait')return wait(g,rec,item.t*option.scale);
  if(item.type==='push'){for(let i=0;i<item.frames&&g.status==='playing';i++)frame(g,rec,item.x,item.y,false);return !bad(g);}
  if(item.type==='act'){if(item.aim)frame(g,rec,item.aim.x,item.aim.y,false);if(bad(g))return false;const ok=g[ACT[item.kind]]();if(ok)rec.push({kind:item.kind});return ok&&!bad(g);}
  if(item.type==='go'){const sprint=option.sprint!==null?option.sprint:g.solverSprint>0?true:item.sprint;if(g.solverSprint>0)g.solverSprint--;return go(g,rec,item,sprint);}
  return finish(g,rec);
}
// Hill-climb on progress: follow the plan; where it fails, try each option a few items
// earlier, keep whichever change gets furthest, and continue from there.
function search(Engine,options,plan,{window=40,lookahead=60,rounds=500}={}){
  const checkpoints=[{g:new Engine(options),rec:[]}];
  const forward=(state,i,limit,first)=>{const made=[];let g=state.g,rec=state.rec;
    for(let k=i;k<plan.length&&k<limit;k++){const ng=clone(g),nr=rec.map(c=>({...c}));
      if(!runItem(ng,nr,plan[k],k===i&&first?first:OPTIONS[0]))return {reached:k,made};
      made.push({g:ng,rec:nr});g=ng;rec=nr;if(ng.status==='won')return {reached:plan.length,made,won:true};}
    return {reached:Math.min(plan.length,limit),made};};
  checkpoints.push(...forward(checkpoints[0],0,plan.length).made);
  for(let round=0;round<rounds;round++){
    const last=checkpoints.at(-1);if(last.g.status==='won')return last.rec;
    const j=checkpoints.length-1;let best=null;
    for(let b=0;b<=window&&j-b>=0;b++)for(const option of OPTIONS.slice(1)){
      const i=j-b,trial=forward(checkpoints[i],i,j+lookahead,option),score=trial.reached-(option.wait||0)*.2-b*.01;
      if(trial.reached>j&&(!best||score>best.score))best={i,trial,score};if(trial.won)break;
    }
    if(!best){if(process.env.DEBUG){const g=checkpoints.at(-1).g;console.error('stuck at item',j,'/',plan.length,JSON.stringify(plan[j]),'t',g.elapsed.toFixed(1),'Sally',g.player.x.toFixed(1),g.player.y.toFixed(1));for(const h of g.hunters){const d=Math.hypot(h.x-g.player.x,h.y-g.player.y);if(d<8)console.error('  ',h.kind,h.state,h.x.toFixed(1),h.y.toFixed(1),'distance',d.toFixed(1));}}return null;}
    checkpoints.length=best.i+1;checkpoints.push(...best.trial.made);
    if(!best.trial.won)checkpoints.push(...forward(checkpoints.at(-1),checkpoints.length-1,plan.length).made);
  }
  return null;
}
// Replays exactly as tests/escape-playthroughs.cjs does and checks the challenge rules too.
function verify(options,commands){
  const g=new EscapeAdventure(options);for(const c of commands){if(c.kind==='move')for(let n=0;n<c.frames;n++)g.advance(1/120,c);else if(!g[ACT[c.kind]]())return false;}
  return g.status==='won'&&(!g.challenge?.noChase||g.alarms===0)&&(!g.challenge?.allTreasure||g.treasure===g.totalTreasure)&&(!g.timeLimit||g.elapsed<g.timeLimit);
}
// A bot that sprints the engine's shortest route to the key, then to the hatch, ignoring hunters.
function sprintBot(options){
  const g=new EscapeAdventure(options),run=target=>{for(const pt of g.route(g.player,target)||[]){let n=0;while(Math.hypot(pt.x-g.player.x,pt.y-g.player.y)>.1&&n++<200&&g.status==='playing'){const dx=pt.x-g.player.x,dy=pt.y-g.player.y,L=Math.hypot(dx,dy);g.advance(1/120,{x:dx/L,y:dy/L,sprint:true});}}};
  run(g.key);for(let i=0;i<240&&g.status==='playing';i++)run(g.exit);return g.status;
}
module.exports={clone,record,extractPlan,search,verify,sprintBot,Peaceful,go,wait,frame,bad,optionsFor,ACT};
if(require.main===module){
  const [mode,arg,hints]=process.argv.slice(2);const fixtures=path.join(__dirname,'../tests/fixtures/escape-playthroughs.json');
  if(mode==='sprint'){console.log(arg,sprintBot(optionsFor(arg)));process.exit(0);}
  // Walks the hint route with no waiting against the real hunters: a route that wins this way is too easy.
  if(mode==='naive'){let status;try{const run=record(EscapeAdventure,optionsFor(arg),hints||'').game;status=run.tailsDropped>0&&run.status==='won'?'needed the tail drop':run.status;}catch(e){status='caught';}console.log(arg,status==='won'?'TOO EASY: the plain route wins':'ok: the plain route '+status);process.exit(0);}
  let options,plan;
  if(mode==='solve'){options=optionsFor(arg);const calm=record(Peaceful,options,hints||'');if(calm.game.status!=='won')throw new Error('the hint route does not escape even without hunters: '+calm.game.status);plan=extractPlan(Peaceful,{options,commands:calm.commands});}
  else if(mode==='repair'){const r=require(fixtures)[+arg];options=r.options;plan=extractPlan(process.env.OLD_ENGINE?require(process.env.OLD_ENGINE).EscapeAdventure:Peaceful,r);}
  else{console.error('usage: route-solver.cjs solve|repair|sprint ...');process.exit(2);}
  const t=Date.now(),commands=search(EscapeAdventure,options,plan),ok=commands&&verify(options,commands);
  console.error(JSON.stringify(options),ok?'SOLVED':'FAILED',((Date.now()-t)/1000).toFixed(1)+'s');
  if(ok)console.log(JSON.stringify({options,commands}));else process.exit(1);
}
