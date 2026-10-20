// Record legal analogue inputs for Blossom Hollow over the real 120 Hz engine (see record-winter.cjs).
// Run: node scripts/record-spring.cjs [--write]
const fs=require('fs'),path=require('path'),{make}=require('./record-winter.cjs');
const root=path.join(__dirname,'..'),tours=require('./spring-tours.json');
function execute(id,variant){const r=make(id);try{for(const p of tours[id][variant]){if(Array.isArray(p))r.go(...p);else if(p.crawl)r.go(...p.crawl,false,true);else if(p.clear){const [x,y,d]=p.clear;let n=0;while(r.g.hunters.some(h=>h.kind==='mole'&&Math.hypot(h.x-x-.5,h.y-y-.5)<d)&&r.g.status==='playing'&&n++<2400)r.wait(1/120);}else if(p.face)r.face(...p.face);else if(p.wait)r.wait(p.wait);else if(p.action)r.act(p.action,p.power);}r.wait(1);
  if(r.g.status!=='won')throw Error('Not won '+r.g.status+' '+r.g.message);if(variant==='treasure'&&r.g.treasure!==r.g.totalTreasure)throw Error('Missing '+r.g.treasure+'/'+r.g.totalTreasure+' '+r.g.loot.filter(l=>!l.taken).map(l=>[l.x,l.y]));
  const result={id,variant,options:{seasonalId:id},time:+r.g.elapsed.toFixed(2),treasure:r.g.treasure,events:[...r.events],commands:r.commands};console.log(id,variant,'won',result.time,result.treasure+'/10',result.events.join(','));return result;}
 catch(e){console.log('FAIL',id,variant,e.message,'at',r.g.player.x.toFixed(1),r.g.player.y.toFixed(1),JSON.stringify(r.g.catches?.at(-1)||''));return null;}}
function serialize(records){return '[\n'+records.map(({commands,...r})=>'  '+JSON.stringify(r).slice(0,-1)+',"commands":[\n'+commands.map(c=>'    '+JSON.stringify(c)).join(',\n')+'\n  ]}').join(',\n')+'\n]\n';}
if(require.main===module){const result=[];for(const variant of ['main','treasure'])for(const id of Object.keys(tours)){const r=execute(id,variant);if(r)result.push(r);}
 if(result.length!==Object.keys(tours).length*2)process.exitCode=1;
 else if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,'tests/fixtures/escape-spring.cjs'),'// Reproducible real-input runs: node scripts/record-spring.cjs --write\nmodule.exports=JSON.parse(require("node:zlib").gunzipSync(Buffer.from(\n'+JSON.stringify(require('node:zlib').gzipSync(serialize(result),{level:9}).toString('base64'))+',"base64")).toString("utf8"));\n');}
module.exports={execute,tours};
