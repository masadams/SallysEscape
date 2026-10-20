// Record legal analogue inputs over the real 120 Hz engine. No hunter or hazard is removed.
// Run: node scripts/record-winter.cjs [--write] [--delay seconds]
// Main routes and optional treasure tours are authored below; tests independently replay the output.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),{EscapeAdventure}=require(path.join(root,'public/escape-engine.js'));
const ACT={pebble:'throwDecoy',glow:'throwGlow',spore:'throwSpore',tongue:'useTongue',burrow:'burrow',seed:'plantSeed',camo:'camouflage'};
function make(id,delay=0){
 const g=new EscapeAdventure({seasonalId:id}),commands=[];let events=new Set();
 const frame=input=>{g.advance(1/120,input);for(const e of g.drainEvents())events.add(e);const c={kind:'move',frames:1,x:input.x||0,y:input.y||0,sprint:!!input.sprint,crawl:!!input.crawl,aiming:!!input.aiming};const last=commands.at(-1);if(last?.kind==='move'&&last.x===c.x&&last.y===c.y&&last.sprint===c.sprint&&last.crawl===c.crawl&&last.aiming===c.aiming)last.frames++;else commands.push(c);if(g.status==='caught')throw Error('Caught '+g.message);if(g.oopses)throw Error('Oops '+g.elapsed.toFixed(2)+' '+g.player.x.toFixed(1)+','+g.player.y.toFixed(1));};
 const wait=n=>{for(let i=0;i<Math.round(n*120)&&g.status==='playing';i++)frame({});};
 function go(tx,ty,sprint=false,crawl=false){
   const target={x:tx+.5,y:ty+.5};let n=0;
   journey:while(Math.hypot(g.player.x-target.x,g.player.y-target.y)>.006&&g.status==='playing'){
     const route=g.route(g.player,target);if(!route.length)throw Error('No walking route '+id+' -> '+tx+','+ty);
     for(const pt of route)while(Math.hypot(g.player.x-pt.x,g.player.y-pt.y)>.006&&g.status==='playing'){
       if(++n>18000)throw Error('Stalled '+id+' -> '+tx+','+ty+' at '+g.player.x.toFixed(2)+','+g.player.y.toFixed(2));
       const dx=pt.x-g.player.x,dy=pt.y-g.player.y,L=Math.hypot(dx,dy),icy=g.slippery.has(g.tileKey(g.player))||Math.hypot(g.slideVelocity.x,g.slideVelocity.y)>.02;
       if(icy){const brake=crawl||L<.8,limit=brake?1.25:2.45,v=g.slideVelocity,flow=require('../public/escape-ice.js').currentAt(g.currents,g.player,g.water(g.player)),fx=flow?flow.dir[0]*flow.speed:0,fy=flow?flow.dir[1]*flow.speed:0;frame({x:+Math.max(-1,Math.min(1,(dx*4-(v.x+fx)*.8-fx)/limit)).toFixed(4),y:+Math.max(-1,Math.min(1,(dy*4-(v.y+fy)*.8-fy)/limit)).toFixed(4),sprint,crawl:brake});}
       else {const wet=g.water(g.player),flow=g.currents.length?require('../public/escape-ice.js').currentAt(g.currents,g.player,wet):null;
         // In a stream or on a sand slide, aim against the flow so Sally still arrives where she is heading (as a player would).
         if(flow){const sp=2.45*(wet?.55:1)*(g.hasTail?1:.9),want=Math.min(sp,L*120),vx=dx/L*want-flow.dir[0]*flow.speed,vy=dy/L*want-flow.dir[1]*flow.speed,m=Math.max(1,Math.hypot(vx,vy)/sp);frame({x:+(vx/sp/m).toFixed(4),y:+(vy/sp/m).toFixed(4),crawl});}
         else {const scale=Math.min(1,L*120/(sprint?4:2.45));frame({x:+(dx/L*scale).toFixed(4),y:+(dy/L*scale).toFixed(4),sprint,crawl});}}
       if(g.player.flight){while(g.player.flight)frame({});if(g.caps.some(c=>c.at[0]===tx&&c.at[1]===ty))return;continue journey;}
     }
   }
 }
 function face(x,y){frame({x,y});}
 function act(kind,power){if(!g[ACT[kind]](power))throw Error(kind+' failed: '+g.message);commands.push({kind,...(power===undefined?{}:{power})});}
 wait(delay);return {g,commands,go,wait,face,act,events};
}

// Authored waypoint tours; fixture replay uses only the recorded inputs.
const tours=require('./winter-tours.json');
function execute(id,variant,delay=0){const r=make(id,delay);try{for(const p of tours[id][variant]){if(Array.isArray(p))r.go(...p);else if(p.snowball){let n=0;while(r.g.elapsed%7>.06&&r.g.status==='playing'&&n++<900)r.wait(1/120);}else if(p.face)r.face(...p.face);else if(p.wait)r.wait(p.wait);else if(p.action)r.act(p.action,p.power);}r.wait(1);if(r.g.status!=='won')throw Error('Not won '+r.g.message);if(variant==='treasure'&&r.g.treasure!==r.g.totalTreasure)throw Error('Missing '+r.g.treasure+'/'+r.g.totalTreasure+' '+r.g.loot.filter(l=>!l.taken).map(l=>[l.x,l.y]));const result={id,variant,options:{seasonalId:id},time:+r.g.elapsed.toFixed(2),treasure:r.g.treasure,events:[...r.events],commands:r.commands};console.log(id,variant,'won',result.time,result.treasure+'/10',result.events.join(','));return result;}catch(e){console.log('FAIL',id,variant,e.message,r.g.catches.at(-1));return null;}}
function serialize(records){return '[\n'+records.map(({commands,...r})=>'  '+JSON.stringify(r).slice(0,-1)+',"commands":[\n'+commands.map(c=>'    '+JSON.stringify(c)).join(',\n')+'\n  ]}').join(',\n')+'\n]\n';}
if(require.main===module){const at=process.argv.indexOf('--delay'),delay=at<0?0:Number(process.argv[at+1]);if(!Number.isFinite(delay)||delay<0||delay>30)throw Error('--delay must be 0 to 30 seconds');const result=[];for(const variant of ['main','treasure'])for(const id of Object.keys(tours)){const r=execute(id,variant,delay);if(r)result.push(r);}if(result.length!==16)process.exitCode=1;else if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,"tests/fixtures/escape-winter.cjs"),'// Reproducible real-input runs: node scripts/record-winter.cjs --write\nmodule.exports=JSON.parse(require("node:zlib").gunzipSync(Buffer.from(\n'+JSON.stringify(require("node:zlib").gzipSync(serialize(result),{level:9}).toString("base64"))+',"base64")).toString("utf8"));\n');}
module.exports={make,execute,tours};


