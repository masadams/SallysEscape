// A human-like playtester. It takes each escape's recorded winning run, turns it into the plan a
// player would have in mind (where to go, where to wait, when to use a tool) and plays that plan the
// way a person does: reacting a little late, steering a little loosely and waiting a little too long
// or too short. Many noisy attempts give each escape a difficulty score (how often a person following
// the right idea still makes it) and a map of where they get caught.
//
//   node scripts/playtest.cjs [--runs 20] [--seed 1] [--only id,id] [--from 78] [--json out.json]
const path=require('path'),fs=require('fs');
const {EscapeAdventure}=require(path.join(__dirname,'../public/escape-engine.js'));
const {EscapeCatalog}=require(path.join(__dirname,'../public/escape-levels.js'));
const {extractPlan,clone}=require(path.join(__dirname,'route-solver.cjs'));
const ACT={pebble:'throwDecoy',burrow:'burrow',tongue:'useTongue',seed:'plantSeed',camo:'camouflage'};

// A small seeded random source, so a report can be reproduced.
function rng(seed){let s=seed>>>0||1;return ()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
const gauss=r=>{let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};

// The ghost: the recorded winning run replayed exactly, frame by frame, with where Sally stood,
// whether she was sprinting, and when she used a tool.
function ghostOf(recording){
  const g=new EscapeAdventure(recording.options),frames=[];
  for(const c of recording.commands){
    if(c.kind!=='move'){frames.push({x:g.player.x,y:g.player.y,sprint:false,act:c.kind,still:true});g[ACT[c.kind]]();continue;}
    for(let n=0;n<c.frames;n++){g.advance(1/120,c);frames.push({x:g.player.x,y:g.player.y,sprint:Boolean(c.sprint),still:!(c.x||c.y)});}
  }
  return frames;
}
// One attempt: Sally chases the ghost the way a person copies a route they have seen. She falls
// behind it in human ways: setting off a reaction time late after each pause, misjudging how long
// to wait, wobbling as she steers, and stopping or stepping back when the next moment looks
// dangerous; she sprints to catch up when she is well behind. With no noise she matches the ghost.
function attempt(options,ghost,r,{lag=30,wobble=.12,waitError=.2,careful=true}={}){
  const g=new EscapeAdventure(options);let t=0,frames=0,dodge=null,wasStill=true,acted=new Set();
  const send=(x,y,sprint)=>{g.advance(1/120,{x,y,sprint});frames++;};
  while(t<ghost.length&&g.status==='playing'&&frames<ghost.length*3+2400){
    const f=ghost[Math.floor(t)];
    if(f.act&&!acted.has(Math.floor(t))){acted.add(Math.floor(t));g[ACT[f.act]]?.();t++;continue;}
    // Leaving a pause: a reaction time passes before she sets off.
    if(wasStill&&!f.still){wasStill=false;const react=Math.max(0,Math.round(lag*(1+gauss(r)*.3)));for(let i=0;i<react&&g.status==='playing';i++)send(0,0,false);}
    if(f.still&&!wasStill){wasStill=true;}
    // Pauses are misjudged: each paused frame of the ghost counts for a little more or less.
    if(f.still){const dx=f.x-g.player.x,dy=f.y-g.player.y,L=Math.hypot(dx,dy),step=2.45/120;
      if(L>.02){const k=Math.min(1,L/step);send(dx/L*k,dy/L*k,false);}else send(0,0,false);t+=Math.max(.3,1+gauss(r)*waitError*.15);continue;}
    if(careful&&frames%12===0){dodge=null;const ahead=ghost[Math.min(ghost.length-1,Math.floor(t)+24)],ax=ahead.x-g.player.x,ay=ahead.y-g.player.y,AL=Math.hypot(ax,ay)||1;
      if(foresee(g,ax/AL,ay/AL,f.sprint))for(const [x,y,sp] of [[0,0,false],[-ax/AL,-ay/AL,true],[-ay/AL,ax/AL,true],[ay/AL,-ax/AL,true]])if(!foresee(g,x,y,sp)){dodge={x,y,sp};break;}}
    if(dodge){send(dodge.x,dodge.y,dodge.sp);continue;}
    const dx=f.x-g.player.x,dy=f.y-g.player.y,L=Math.hypot(dx,dy);
    if(g.player.flight){send(0,0,false);t++;continue;}
    const behind=L>.35,step=(behind||f.sprint?4:2.45)/120;
    if(L<1e-6){send(0,0,false);t++;continue;}
    const a=Math.atan2(dy,dx)+gauss(r)*wobble*Math.min(1,L*3),k=Math.min(1,L/step);send(Math.cos(a)*k,Math.sin(a)*k,behind||f.sprint);
    if(L<.6)t++;
  }
  for(let i=0;i<360&&g.status==='playing';i++)send(0,0,false);
  const caught=g.status==='caught'||g.tailsDropped>0;
  return {won:g.status==='won',clean:g.status==='won'&&!g.tailsDropped,caughtAt:caught?{x:Math.floor(g.player.x),y:Math.floor(g.player.y),by:(g.result?.message||'').slice(0,60)}:null,time:frames/120};
}
// Would carrying on like this for the next 0.6 seconds get Sally caught, or start a chase? Played
// out on a copy, the way a player pictures the next moment.
function foresee(g,x,y,sprint){const c=clone(g),chasing=h=>['chase','windup','charge','rear','strike','dive','pounce','lunge'].includes(h.state);const before=c.hunters.filter(chasing).length;
  for(let i=0;i<72&&c.status==='playing';i++)c.advance(1/120,{x,y,sprint});return c.status==='caught'||c.tailsDropped>g.tailsDropped||c.hunters.filter(chasing).length>before;}
function playtest(recording,{runs=20,seed=1}={}){
  const plan=ghostOf(recording),r=rng(seed+JSON.stringify(recording.options).length*7919),results=[];
  for(let i=0;i<runs;i++)results.push(attempt(recording.options,plan,r));
  const spots=new Map();for(const x of results)if(x.caughtAt){const k=x.caughtAt.x+','+x.caughtAt.y;spots.set(k,(spots.get(k)||0)+1);}
  const won=results.filter(x=>x.won).length,clean=results.filter(x=>x.clean).length;
  return {winRate:won/runs,cleanRate:clean/runs,danger:[...spots].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,n])=>({tile:k,catches:n})),
    medianTime:results.filter(x=>x.won).map(x=>x.time).sort((a,b)=>a-b)[Math.floor(won/2)]||null};
}
module.exports={playtest,attempt,ghostOf};

if(require.main===module){
  const arg=(name,def)=>{const i=process.argv.indexOf('--'+name);return i<0?def:process.argv[i+1];};
  const runs=+arg('runs',20),seed=+arg('seed',1),only=arg('only',''),from=+arg('from',0),out=arg('json','');
  const fixtures=require(path.join(__dirname,'../tests/fixtures/escape-playthroughs.json'));
  const index=id=>EscapeCatalog.levels.findIndex(l=>l.id===id);
  const report=[];
  for(const rec of fixtures){
    const id=rec.options.levelId||rec.options.challengeId&&('challenge:'+rec.options.challengeId)||rec.options.hiddenId&&('hidden:'+rec.options.hiddenId);
    if(only&&!only.split(',').includes(id))continue;if(!only&&(!rec.options.levelId||index(id)<from))continue;
    const res=playtest(rec,{runs,seed});report.push({id,escape:index(id)+1,...res});
    const bar='█'.repeat(Math.round(res.cleanRate*10)).padEnd(10,'·');
    console.log(String(index(id)+1).padStart(3),id.padEnd(22),bar,(res.cleanRate*100).toFixed(0).padStart(3)+'% clean',(res.winRate*100).toFixed(0).padStart(3)+'% with tail',res.danger.length?'caught most at '+res.danger.map(d=>d.tile+'×'+d.catches).join(' '):'');
  }
  if(out)fs.writeFileSync(out,JSON.stringify(report,null,2));
}
