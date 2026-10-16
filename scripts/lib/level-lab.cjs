'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {EscapeAdventure}=require('../../public/escape-engine.js');
const {clone}=require('../route-solver.cjs');
const FPS=120, VERSION=1;
const ACTIONS=Object.freeze({pebble:'throwDecoy',tongue:'useTongue',burrow:'burrow',seed:'plantSeed',camo:'camouflage',lookBack:'lookBack'});
const DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function fingerprint(options){
  const sources=['escape-engine.js','escape-levels.js','escape-rebuilt.js','escape-hidden.js','creature-rig.js'];
  return hash(JSON.stringify(options)+sources.map(name=>fs.readFileSync(path.join(__dirname,'../../public',name),'utf8')).join('\0'));
}
function append(commands,command){
  const last=commands.at(-1);
  if(command.kind==='move'&&last?.kind==='move'&&last.x===command.x&&last.y===command.y&&last.sprint===command.sprint)last.frames+=command.frames;
  else commands.push({...command});
}
function summary(g){return {status:g.status,seconds:+g.elapsed.toFixed(3),position:{x:+g.player.x.toFixed(3),y:+g.player.y.toFixed(3)},hasKey:g.hasKey,treasure:g.treasure,requiredTreasure:g.requiredTreasure,tailsDropped:g.tailsDropped,alarms:g.alarms,message:g.result?.message||g.message};}
function legalWin(g){
  return g.status==='won'&&g.exitUnlocked()&&(!g.challenge?.noChase||g.alarms===0)&&(!g.challenge?.noChill||!g.player.chilled)&&(!g.challenge?.noTheft||g.stolen===0)&&(!g.timeLimit||g.elapsed<g.timeLimit);
}
function validateCommands(commands){
  if(!Array.isArray(commands)||commands.length>100000)throw new Error('Replay needs an array of at most 100000 commands');
  let frames=0;
  for(const c of commands){
    if(c.kind==='move'){
      if(!Number.isInteger(c.frames)||c.frames<1||!Number.isFinite(c.x)||!Number.isFinite(c.y)||Math.abs(c.x)>1||Math.abs(c.y)>1||typeof c.sprint!=='boolean')throw new Error('Invalid movement command');
      frames+=c.frames;
    }else if(!Object.hasOwn(ACTIONS,c.kind))throw new Error('Unknown action: '+c.kind);
  }
  if(frames>FPS*600)throw new Error('Replay exceeds ten minutes');
}
function replay(options,commands,{allowTail=true,consumeFrame}={}){
  validateCommands(commands);
  const g=new EscapeAdventure(options);let actionFailure=null,budgetExhausted=false;
  run:for(let index=0;index<commands.length&&g.status==='playing';index++){
    const c=commands[index];
    if(c.kind==='move')for(let f=0;f<c.frames&&g.status==='playing';f++){
      if(consumeFrame&&!consumeFrame()){budgetExhausted=true;break run;}
      g.advance(1/FPS,c);
    }
    else if(!g[ACTIONS[c.kind]]()){actionFailure={index,kind:c.kind,message:g.message};break;}
  }
  return {won:!budgetExhausted&&!actionFailure&&legalWin(g)&&(allowTail||g.tailsDropped===0),actionFailure,budgetExhausted,...summary(g)};
}
function random(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function stress(options,commands,{trials=8,jitter=6,seed=1,allowTail=true}={}){
  if(!Number.isInteger(trials)||trials<0||trials>100||!Number.isInteger(jitter)||jitter<0||jitter>60||!Number.isInteger(seed))throw new Error('Invalid stress settings');
  const rng=random(seed),runs=[];
  for(let trial=0;trial<trials;trial++){
    const changed=[];
    for(const c of commands){
      if(c.kind==='move'){
        // A delay before some inputs, followed by a slightly early/late release.
        if(jitter&&rng()<.25)changed.push({kind:'move',frames:1+Math.floor(rng()*jitter),x:0,y:0,sprint:false});
        changed.push({...c,frames:Math.max(1,c.frames+Math.floor(rng()*(jitter*2+1))-jitter)});
      }else changed.push({...c});
    }
    runs.push({trial,...replay(options,changed,{allowTail})});
  }
  return {kind:'open-loop timing stress; not a human win-rate estimate',trials,jitterFrames:jitter,seed,wins:runs.filter(r=>r.won).length,runs};
}
function settings(config={}){
  const defaults={budget:1500,width:24,depth:160,seconds:120,milliseconds:60000,frames:1000000,allowTail:true,macro:true};
  const s=Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k,config[k]??v]));
  for(const [k,max] of [['budget',100000],['width',256],['depth',1000],['seconds',300],['milliseconds',600000],['frames',100000000]])if(!Number.isInteger(s[k])||s[k]<1||s[k]>max)throw new Error('Invalid '+k+' (1–'+max+')');
  for(const k of ['allowTail','macro'])if(typeof s[k]!=='boolean')throw new Error('Invalid '+k+' (boolean required)');
  return s;
}
// Optimistic distances guide search only: gates, cracked walls and gaps may be
// traversable after a legal mechanism. They are NEVER opened in the simulator.
function distanceField(g,target){
  const field=new Map(),q=[[Math.floor(target.x),Math.floor(target.y),0]];
  for(let i=0;i<q.length;i++){
    const [x,y,d]=q[i],key=x+','+y;
    if(field.has(key)||x<0||y<0||x>=g.width||y>=g.height||g.grid[y][x]==='#')continue;
    field.set(key,d);for(const [dx,dy]of DIRS)q.push([x+dx,y+dy,d+1]);
  }
  return field;
}
function makeEvaluator(initial){
  const key=distanceField(initial,initial.key),exit=distanceField(initial,initial.exit);
  const loot=initial.loot.map(p=>distanceField(initial,p));
  // Reserve search lanes for mechanisms away from the direct objective route.
  // These are suggested subgoals, not permission to change any game state.
  const landmarks=initial.gates.flatMap((gate,index)=>[...(gate.switch?[gate.switch]:[]),...gate.plates,...gate.levers].map(point=>({field:distanceField(initial,point),done:g=>g.gates[index].activations>0})))
    .concat(initial.loot.map((p,index)=>({field:loot[index],done:g=>g.loot[index].taken})))
    .slice(0,24);
  return g=>{
    const tile=Math.floor(g.player.x)+','+Math.floor(g.player.y),fallback=g.width*g.height;
    let distance=(g.hasKey?exit:key).get(tile)??fallback;
    if(g.hasKey&&g.treasure<g.requiredTreasure){
      distance=Math.min(...g.loot.map((p,i)=>p.taken?fallback:(loot[i].get(tile)??fallback)));
    }
    // A global key/required-loot bonus preserves progress across the return route.
    const score=(g.hasKey?10000:0)+Math.min(g.treasure,g.requiredTreasure)*1000-distance*12-g.elapsed*.25-g.tailsDropped*25
      +g.reactionsFired.size*10+g.gates.filter(p=>p.open).length*8+g.steamed*8
      +(g.decoys+g.burrows+g.tongues+g.seeds+g.camos)*.1;
    return {score,distance,landmarks:landmarks.map(p=>score+distance*12-(p.done(g)?0:(p.field.get(tile)??fallback))*12)};
  };
}
// This is approximate pruning, not an equivalence proof. Keep enemy state,
// facing, resources, mechanisms and time so waits and return trips can survive.
function signature(g){
  const q=n=>Math.round((n||0)*4);
  return JSON.stringify([q(g.player.x),q(g.player.y),g.player.facing,g.player.tongueAim,Math.floor(g.elapsed*2),Math.floor(g.player.stamina/20),Math.floor(g.player.warmth/20),g.hasKey,g.keyByTongue,g.loot.map(p=>p.taken),g.treasure,g.decoys,g.burrows,g.tongues,g.seeds,g.camos,g.hasTail,g.alarms,g.steamed,g.gates.map(p=>[p.open,p.sealed,p.bracedUntil,p.expiresAt]),[...g.reactionsFired],g.hunters.map(h=>[q(h.x),q(h.y),h.state,q(h.awareness),h.routeIndex]),g.grid.map(row=>row.join('')).join(''),g.lookUntil,g.camoUntil]);
}
function goalRoutes(g){
  const objectives=[];
  if(!g.hasKey)objectives.push(g.key);
  if(g.hasKey&&g.exitUnlocked())objectives.push(g.exit);
  if(g.treasure<g.requiredTreasure)objectives.push(...g.loot.filter(p=>!p.taken));
  for(const gate of g.gates)if(!gate.sealed&&!gate.open){
    if(gate.switch)objectives.push(gate.switch);
    objectives.push(...gate.plates,...gate.levers);
  }
  const unique=new Set(),routes=[];
  for(const target of objectives){
    // Recompute on this branch's real geometry, including closed gates and
    // collapsed bridges. Short segments leave room to react to moving threats.
    const waypoints=g.route(g.player,target).slice(0,6);
    if(!waypoints.length)continue;
    const key=JSON.stringify(waypoints);if(unique.has(key))continue;unique.add(key);
    for(const sprint of [true,false])routes.push({type:'route',waypoints,sprint});
    if(g.level.gaze)routes.push({type:'route',waypoints,sprint:true,lookBack:true});
  }
  return routes;
}
function candidates(g,{macro=true}={}){
  const out=macro?goalRoutes(g):[],x=Math.floor(g.player.x),y=Math.floor(g.player.y);
  for(const [dx,dy]of DIRS){
    if(g.actorFloor(x+dx,y+dy,null))for(const sprint of [true,false]){
      const move={type:'tile',target:{x:x+dx+.5,y:y+dy+.5},sprint};out.push(move);
      if(g.level.gaze)out.push({...move,lookBack:true});
    }
  }
  // Short diagonals allow dodges and movement between tile-centred paths.
  for(const [dx,dy]of [[1,1],[-1,1],[1,-1],[-1,-1]])if(g.actorFloor(x+dx,y,null)&&g.actorFloor(x,y+dy,null)&&g.actorFloor(x+dx,y+dy,null))out.push({type:'input',x:dx,y:dy,sprint:true,frames:24});
  for(const frames of [30,90,180])out.push({type:'input',x:0,y:0,sprint:false,frames});
  for(const [kind,stock]of [['pebble',g.decoys],['tongue',g.tongues],['burrow',g.burrows],['seed',g.seeds]])if(stock>0)for(const [x,y]of DIRS)out.push({type:'tool',kind,x,y});
  if(g.camos>0)out.push({type:'tool',kind:'camo'});
  if(g.level.gaze)out.push({type:'tool',kind:'lookBack'});
  return out;
}
function execute(parent,choice,config){
  const g=clone(parent),commands=[];
  // The rig contains an arrow function closing over its original game. A plain
  // deep copy would still read the parent's grid after a gate/bridge changes.
  g.motion.floor=(x,y)=>g.floor(x,y);
  const tick=(x,y,sprint)=>{if(g.status!=='playing'||g.elapsed>=config.seconds)return false;if(config.consumeFrame&&!config.consumeFrame())return false;g.advance(1/FPS,{x,y,sprint});append(commands,{kind:'move',frames:1,x,y,sprint});return true;};
  const wait=frames=>{for(let i=0;i<frames;i++)if(!tick(0,0,false))break;};
  if(choice.lookBack){if(!g.lookBack())return null;commands.push({kind:'lookBack'});}
  const walk=target=>{
    for(let n=0;n<240&&g.status==='playing'&&g.elapsed<config.seconds;){
      const dx=target.x-g.player.x,dy=target.y-g.player.y;
      if(Math.hypot(dx,dy)<.09)return true;
      // Keyboard-like digital movement; no exact fractional input or teleport.
      // Feedback tests can sample less often. Refine near a waypoint rather
      // than oscillating past it; each held frame still consumes the budget.
      const hold=Math.min(config.controlFrames||1,Math.max(1,Math.floor(Math.hypot(dx,dy)*FPS/4)),240-n);
      for(let i=0;i<hold;i++,n++)if(!tick(Math.abs(dx)>.055?Math.sign(dx):0,Math.abs(dy)>.055?Math.sign(dy):0,choice.sprint))return false;
      if(n>20&&!g.player.moving&&!g.player.flight)break;
    }
    return false;
  };
  if(choice.type==='tile'){
    walk(choice.target);
  }else if(choice.type==='route'){
    for(const target of choice.waypoints)if(!walk(target))break;
    // Escaping requires holding on the exit; do not make the beam discover
    // that finishing wait through unrelated idle branches.
    if(g.status==='playing'&&g.exitUnlocked()&&Math.hypot(g.player.x-g.exit.x,g.player.y-g.exit.y)<.3)wait(90);
  }else if(choice.type==='input'){
    for(let n=0;n<choice.frames;n++)if(!tick(choice.x,choice.y,choice.sprint))break;
  }else{
    // Facing is changed using the same movement input available to the player.
    if(choice.x!==undefined&&!tick(choice.x,choice.y,false))return null;
    if(g.status!=='playing'||!g[ACTIONS[choice.kind]]())return null;
    commands.push({kind:choice.kind});wait(choice.kind==='camo'?90:30);
  }
  if(!commands.length)return null;
  return {g,commands,choice};
}
function commandsFor(node){const parts=[];for(let n=node;n?.parent;n=n.parent)parts.push(n.commands);const commands=[];for(const part of parts.reverse())for(const c of part)append(commands,c);return commands;}
function solve(options,config={}){
  const cfg=settings(config),initial=new EscapeAdventure(options),evaluate=makeEvaluator(initial),started=Date.now();
  const root={g:initial,parent:null,commands:[],...evaluate(initial)};
  let beam=[root],best=root,expanded=0,generated=0,simulatedFrames=0,depth=0,winner=null,reason='depth-limit',memory=null;
  const executionConfig={...cfg,consumeFrame:()=>{if(simulatedFrames>=cfg.frames)return false;simulatedFrames++;return true;}};
  if(config.reuseCommands){
    const check=replay(options,config.reuseCommands,{allowTail:cfg.allowTail});memory={attempted:true,...check};
    if(check.won)return {schemaVersion:VERSION,status:'solved',reason:'reused-verified-replay',options,fingerprint:fingerprint(options),settings:cfg,search:{expanded:0,generated:0,depth:0,milliseconds:Date.now()-started},bestAttempt:check,failures:[],verification:check,memory,replay:{schemaVersion:VERSION,options,fingerprint:fingerprint(options),commands:config.reuseCommands}};
  }
  const failures=new Map(),seen=new Set([signature(initial)]);
  outer:for(;depth<cfg.depth&&beam.length;depth++){
    const next=[];
    for(const node of beam){
      if(expanded>=cfg.budget){reason='expansion-budget';break outer;}expanded++;
      for(const choice of candidates(node.g,cfg)){
        if(simulatedFrames>=cfg.frames){reason='simulation-budget';break outer;}
        if(Date.now()-started>=cfg.milliseconds){reason='wall-time-budget';break outer;}
        const result=execute(node.g,choice,executionConfig);if(!result)continue;generated++;
        const {g}=result;
        if(legalWin(g)&&(cfg.allowTail||g.tailsDropped===0)){winner={...result,parent:node};break outer;}
        if(g.status!=='playing'||(!cfg.allowTail&&g.tailsDropped>0)){
          const label=g.result?.message||'Tail loss forbidden by review policy',tile=Math.floor(g.player.x)+','+Math.floor(g.player.y),id=label+'@'+tile;
          const entry=failures.get(id)||{message:label,tile,count:0};entry.count++;failures.set(id,entry);continue;
        }
        if(g.elapsed>=cfg.seconds)continue;
        const id=signature(g);if(seen.has(id))continue;seen.add(id);
        const child={...result,parent:node,...evaluate(g)};if(child.score>best.score)best=child;next.push(child);
      }
    }
    next.sort((a,b)=>b.score-a.score);
    // Spatial diversity prevents all beam slots following one promising lane.
    const perCell=new Map(),selected=new Set();beam=[];
    const take=n=>{if(selected.has(n))return false;const g=n.g,key=[Math.floor(g.player.x),Math.floor(g.player.y),g.hasKey,g.reactionsFired.size,g.treasure].join(','),count=perCell.get(key)||0;if(count>=3)return false;perCell.set(key,count+1);selected.add(n);beam.push(n);return true;};
    for(const n of next){take(n);if(beam.length>=Math.ceil(cfg.width*.6))break;}
    for(let i=0;i<(root.landmarks?.length||0)&&beam.length<cfg.width;i++){
      const ranked=[...next].sort((a,b)=>b.landmarks[i]-a.landmarks[i]);for(const n of ranked)if(take(n))break;
    }
    for(const n of next){if(beam.length>=cfg.width)break;take(n);}
    if(!beam.length)reason='frontier-exhausted';
  }
  const commands=winner?commandsFor(winner):null;
  const choices=[];if(winner)for(let n=winner;n?.parent;n=n.parent)choices.unshift(n.choice);
  const verification=commands?replay(options,commands,{allowTail:cfg.allowTail}):null;
  if(winner&&!verification.won)throw new Error('Search/replay disagreement: '+JSON.stringify(verification));
  return {schemaVersion:VERSION,status:winner?'solved':'unresolved',reason:winner?'verified-replay':reason,options,fingerprint:fingerprint(options),settings:cfg,search:{expanded,generated,simulatedFrames,depth,milliseconds:Date.now()-started},bestAttempt:summary((winner||best).g),failures:[...failures.values()].sort((a,b)=>b.count-a.count).slice(0,12),verification,memory,replay:commands?{schemaVersion:VERSION,options,fingerprint:fingerprint(options),commands}:null,policy:winner?{schemaVersion:1,kind:'feedback-policy',options,fingerprint:fingerprint(options),settings:{seconds:cfg.seconds,allowTail:cfg.allowTail},choices}:null};
}
function verifyArtifact(artifact,config={}){
  if(artifact.schemaVersion!==VERSION||!artifact.options||!Array.isArray(artifact.commands))throw new Error('Invalid level-lab replay');
  if(artifact.fingerprint!==fingerprint(artifact.options))throw new Error('Replay is stale: engine or level changed. Solve the level again.');
  return replay(artifact.options,artifact.commands,config);
}
module.exports={ACTIONS,FPS,fingerprint,append,summary,replay,stress,settings,signature,goalRoutes,candidates,execute,solve,verifyArtifact,validateCommands};
