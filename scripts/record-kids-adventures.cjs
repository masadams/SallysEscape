// Record legal analogue inputs over the real 120 Hz engine. No hunter or hazard is removed.
// Run: node scripts/record-kids-adventures.cjs [--write] [--delay seconds]
// Main routes and optional treasure tours are authored below; tests independently replay the output.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),{EscapeAdventure}=require(path.join(root,'public/escape-engine.js'));
const Guide=require(path.join(root,'public/escape-kids-guide.js'));
const ACT={pebble:'throwDecoy',glow:'throwGlow',spore:'throwSpore',tongue:'useTongue',burrow:'burrow',seed:'plantSeed',camo:'camouflage'};
function make(id,delay=0){
 const g=new EscapeAdventure({kidsId:id}),commands=[];let events=new Set();
 const frame=input=>{g.advance(1/120,input);for(const e of g.drainEvents())events.add(e);const c={kind:'move',frames:1,x:input.x||0,y:input.y||0,sprint:!!input.sprint,crawl:!!input.crawl};const last=commands.at(-1);if(last?.kind==='move'&&last.x===c.x&&last.y===c.y&&last.sprint===c.sprint&&last.crawl===c.crawl)last.frames++;else commands.push(c);if(g.oopses)throw Error('Oops '+g.elapsed.toFixed(2)+' '+g.player.x.toFixed(1)+','+g.player.y.toFixed(1));};
 const wait=n=>{for(let i=0;i<Math.round(n*120)&&g.status==='playing';i++)frame({});};
 function go(tx,ty,sprint=false){
   const target={x:tx+.5,y:ty+.5};let n=0;
   journey:while(Math.hypot(g.player.x-target.x,g.player.y-target.y)>.006&&g.status==='playing'){
     const route=g.route(g.player,target);if(!route.length)throw Error('No walking route '+id+' -> '+tx+','+ty);
     for(const pt of route)while(Math.hypot(g.player.x-pt.x,g.player.y-pt.y)>.006&&g.status==='playing'){
       if(++n>18000)throw Error('Stalled '+id+' -> '+tx+','+ty+' at '+g.player.x.toFixed(2)+','+g.player.y.toFixed(2));
       const dx=pt.x-g.player.x,dy=pt.y-g.player.y,L=Math.hypot(dx,dy),scale=Math.min(1,L*120/(sprint?4:2.45));
       frame({x:+(dx/L*scale).toFixed(4),y:+(dy/L*scale).toFixed(4),sprint});
       if(g.player.flight){while(g.player.flight)frame({});if(g.caps.some(c=>c.at[0]===tx&&c.at[1]===ty))return;continue journey;}
     }
   }
 }
 function face(x,y){frame({x,y});}
 function act(kind,power){if(!g[ACT[kind]](power))throw Error(kind+' failed: '+g.message);commands.push({kind,...(power===undefined?{}:{power})});}
 function guide(){for(let k=0;k<20&&g.status==='playing';k++){const p=Guide.plan(g);if(!p.path.length)throw Error('No guide '+id);const a=p.action,end=p.path.at(-1);go(...end);if(a){if(a.face)face(...a.face);if(a.kind==='bounce'){frame({x:.1});wait(.7);}else{act(a.kind==='tongue'?'tongue':'burrow');wait(1);}}else wait(.7);}if(g.status!=='won')throw Error('Guide did not win '+id);}
 wait(delay);return {g,commands,go,wait,face,act,guide,events};
}
const main={
 'garden-gate':r=>{r.go(4,3);r.go(12,9);r.go(19,5);r.go(27,3);r.go(28,16);r.go(17,16,true);r.go(3,16);},
 'beetle-courtyard':r=>{r.go(10,14);r.go(21,14);r.go(22,6);r.go(27,5);r.go(29,3);r.go(27,5);r.go(22,6);r.go(21,14);r.go(3,16);},
 'lily-pond':r=>{r.go(7,7);r.wait(.7);r.go(20,13);r.wait(.7);r.go(30,4);r.go(27,15);r.wait(.7);r.go(3,18);},
 'lantern-house':r=>{r.go(12,4);r.face(1,0);r.act('tongue');r.wait(.8);r.face(0,1);r.act('glow',0);r.wait(1);r.go(11,17);r.go(20,11);r.go(24,5);r.go(28,3);r.go(24,5);r.go(20,11);r.go(11,17);r.go(4,20);},
 'sleepy-steamworks':r=>{r.go(11,14);r.go(12,3);r.go(16,3);r.go(18,9);r.go(22,17);r.go(23,5);r.go(31,3);r.go(23,5);r.go(18,9);r.go(16,3);r.go(11,3);r.go(11,14);r.go(3,18);},
 'sallys-way-home':r=>{r.go(7,4);r.go(14,3);r.go(23,3);r.go(28,5);r.go(34,3);r.go(28,16);r.go(23,18);r.wait(.7);r.go(6,18);r.go(3,19);}
};
function execute(id,variant,fn,delay=0){const r=make(id,delay);try{fn(r);r.wait(1);if(r.g.status!=='won')throw Error('Not won '+r.g.message);if(variant==='treasure'&&r.g.treasure!==r.g.totalTreasure)throw Error('Missing treasure '+r.g.treasure+'/'+r.g.totalTreasure+' '+r.g.loot.filter(l=>!l.taken).map(l=>[l.x,l.y]));const out={id,variant,options:{kidsId:id},commands:r.commands,time:+r.g.elapsed.toFixed(2),treasure:r.g.treasure,events:[...r.events]};console.log(id,variant,r.g.status,out.time,out.treasure+'/'+r.g.totalTreasure,'alarms',r.g.alarms,out.events.join(','));return out;}catch(e){console.log('FAIL',id,variant,e.message,'catch',r.g.catches.at(-1));return null;}}
const treasure={
 'garden-gate':r=>{r.go(11,14);r.go(3,9);r.go(2,2);r.go(4,3);r.go(12,2);r.go(12,9);r.go(19,3);r.go(27,3);r.go(27,8);r.go(28,16);r.go(20,16,true);r.go(17,16,true);r.go(3,16);},
 'beetle-courtyard':r=>{r.go(5,12);r.go(12,15);r.go(29,15);r.go(21,14);r.go(12,6);r.face(1,0);r.act('spore',0);r.wait(.7);r.go(16,5);r.go(12,6);r.go(10,2);r.go(22,10);r.go(27,2);r.go(30,6);r.go(29,3);r.go(27,5);r.go(21,14);r.go(3,16);},
 'lily-pond':r=>{r.go(8,18);r.go(2,3);r.go(7,10);r.go(7,7);r.wait(.7);r.go(14,13);r.go(20,8);r.go(20,5);r.face(0,-1);r.act('tongue');r.wait(.7);r.go(20,13);r.wait(.7);r.go(32,9);r.go(31,17);r.go(30,4);r.go(27,15);r.wait(.7);r.go(3,18);},
 'lantern-house':r=>{r.go(2,15);r.go(2,2);r.go(11,10);r.go(12,4);r.face(1,0);r.act('tongue');r.wait(.8);r.face(0,1);r.act('glow',0);r.wait(1);r.go(11,17);r.go(15,10);r.go(20,20);r.go(20,11);r.go(25,3);r.go(28,3);r.go(30,11);r.go(30,15);r.face(-1,0);r.act('pebble',1);r.wait(1.5);r.go(30,20,true);r.go(29,14,true);r.go(20,11);r.go(11,17);r.go(4,20);},
 'sleepy-steamworks':r=>{r.go(6,14);r.go(16,17);r.go(11,2);r.go(12,3);r.go(16,3);r.go(16,9);r.go(18,9);r.go(21,3);r.go(22,17);r.go(28,13);r.go(28,16);r.face(1,0);r.act('seed');r.go(32,15);r.go(32,16);r.go(23,5);r.go(32,8);r.go(31,3);r.go(23,5);r.go(18,9);r.go(16,3);r.go(11,3);r.go(11,14);r.go(3,18);},
 'sallys-way-home':r=>{r.go(2,8);r.go(3,19);r.go(9,19);r.face(0,-1);r.act('spore',0);r.wait(.7);r.go(9,16);r.go(9,19);r.go(7,4);r.go(14,3);r.face(0,1);r.act('spore',1);r.wait(.8);r.go(15,8);r.go(14,3);r.go(22,2);r.go(29,3);r.go(34,3);r.go(36,15);r.face(0,1);r.act('spore',0);r.wait(.7);r.go(36,19);r.go(36,15);r.go(28,16);r.go(24,20);r.go(22,20);r.go(23,18);r.wait(.7);r.go(14,14);r.wait(.7);r.go(23,18);r.wait(.7);r.go(3,19);}
};
if(require.main===module){
 const delayAt=process.argv.indexOf('--delay'),delay=delayAt<0?0:Number(process.argv[delayAt+1]);
 if(!Number.isFinite(delay)||delay<0||delay>30)throw Error('--delay must be 0 to 30 seconds');
 const result=[];for(const [variant,specs]of [['main',main],['treasure',treasure]])for(const [id,fn]of Object.entries(specs)){const r=execute(id,variant,fn,delay);if(r)result.push(r);}
 if(result.length!==12)process.exitCode=1;
 else if(process.argv.includes('--write')){const text='[\n'+result.map(({commands,...r})=>'  '+JSON.stringify(r).slice(0,-1)+',"commands":[\n'+commands.map(c=>'    '+JSON.stringify(c)).join(',\n')+'\n  ]}').join(',\n')+'\n]\n';fs.writeFileSync(path.join(root,'tests/fixtures/escape-kids-adventures.json'),text);}
}
module.exports={make,execute,main,treasure};
