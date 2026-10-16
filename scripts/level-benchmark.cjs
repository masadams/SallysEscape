#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const crypto=require('node:crypto');
const Lab=require('./lib/level-lab.cjs');
const {EscapeCatalog}=require('../public/escape-levels.js');
const {writeOutputs}=require('./level-lab.cjs');
function selectCases(all,ids){
  if(!ids)return all;
  const requested=new Set(ids.split(','));
  for(const id of requested)if(!all.some(item=>item.id===id))throw new Error('Unknown benchmark level '+id);
  return all.filter(item=>requested.has(item.id));
}
function cases(catalog=EscapeCatalog){
  return [
    ...catalog.levels.map(level=>({id:level.id,options:{levelId:level.id},level})),
    ...catalog.challenges.map(challenge=>({id:'challenge:'+challenge.id,options:{challengeId:challenge.id},level:catalog.levels.find(l=>l.id===challenge.levelId)})),
    ...catalog.hidden.map(level=>({id:'hidden:'+level.id,options:{hiddenId:level.id},level}))
  ];
}
function shardCases(all,shard,shards){
  if(!Number.isInteger(shard)||!Number.isInteger(shards)||shards<1||shards>64||shard<1||shard>shards)throw new Error('Use --shard 1..N with --shards N (up to 64)');
  return all.filter((_,index)=>index%shards===shard-1);
}
function matchingRecording(recordings,options){
  return recordings.find(r=>['levelId','challengeId','hiddenId'].every(k=>(r.options[k]??null)===(options[k]??null)));
}
function tags(level){return ['gaze','gates','reinforcements','reactions','vents','thorns','logs','cold','wind','hawk','antTrails','seedCrossings','requiredTreasure'].filter(k=>Array.isArray(level[k])?level[k].length:level[k]);}
function benchmarkCase(item,recordings,config){
  const recording=matchingRecording(recordings,item.options);
  let reference={status:'missing'};
  if(recording){try{reference=Lab.replay(item.options,recording.commands);reference.status=reference.won?'verified':'failed';}catch(error){reference={status:'invalid',error:error.message};}}
  // Reference commands are deliberately NOT supplied to search: this measures
  // independent discovery separately from whether known solutions still work.
  const report=Lab.solve(item.options,config);
  if(report.replay)report.stress=Lab.stress(item.options,report.replay.commands,config);
  return {id:item.id,tags:tags(item.level),reference,report};
}
function saveSummary(out,results,config){
  const summary={settings:config,cases:results.map(({id,tags,reference,report})=>({id,tags,reference,fingerprint:report.fingerprint,searchStatus:report.status,reason:report.reason,search:report.search,stress:report.stress?{wins:report.stress.wins,trials:report.stress.trials}:null})),totals:{levels:results.length,referenceVerified:results.filter(r=>r.reference.status==='verified').length,referenceFailed:results.filter(r=>['failed','invalid'].includes(r.reference.status)).length,referenceMissing:results.filter(r=>r.reference.status==='missing').length,independentlySolved:results.filter(r=>r.report.status==='solved').length,unresolved:results.filter(r=>r.report.status==='unresolved').length,searchMilliseconds:results.reduce((n,r)=>n+r.report.search.milliseconds,0),expanded:results.reduce((n,r)=>n+r.report.search.expanded,0),generated:results.reduce((n,r)=>n+r.report.search.generated,0)}};
  const rows=summary.cases.map(r=>`| ${r.id} | ${r.reference.status} | ${r.searchStatus} | ${r.reason} | ${r.search.expanded} | ${r.stress?r.stress.wins+'/'+r.stress.trials:'—'} | ${r.tags.join(', ')} |`);
  const markdown=['# Sally solver benchmark','','Known recordings and independent search are evaluated separately. Unresolved is not impossible. Timing stress is not a human success rate.','',`Cases: ${summary.totals.levels}. Verified references: ${summary.totals.referenceVerified}. Independently solved: ${summary.totals.independentlySolved}. Unresolved: ${summary.totals.unresolved}.`,'','| Level | Existing replay | New search | Stop reason | Expanded | Timing stress | Mechanics |','| --- | --- | --- | --- | --- | --- | --- |',...rows,''].join('\n');
  fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');fs.writeFileSync(path.join(out,'summary.md'),markdown);
  return {summary,markdown};
}
function main(argv){
  const config={budget:600,width:8,depth:160,seconds:120,milliseconds:20000,frames:1000000,trials:3,jitter:6,seed:1,macro:true},flags={shard:1,shards:1};
  for(let i=0;i<argv.length;i++){
    if(argv[i]==='--no-macro'){config.macro=false;continue;}
    const key=argv[i].slice(2);if(!argv[i].startsWith('--')||!['out','only','shard','shards',...Object.keys(config).filter(k=>k!=='macro')].includes(key))throw new Error('Unknown benchmark option '+argv[i]);
    const value=argv[++i];if(value===undefined||value.startsWith('--'))throw new Error('Missing value for --'+key);
    if(Object.hasOwn(config,key))config[key]=Number(value);else flags[key]=['out','only'].includes(key)?value:Number(value);
  }
  if(!flags.out)throw new Error('Usage: npm run level:benchmark -- --out work/benchmark [--shard 1 --shards 8]');
  Lab.settings(config);Lab.stress({},[],{trials:0,jitter:config.jitter,seed:config.seed});
  if(!Number.isInteger(config.trials)||config.trials<0||config.trials>100)throw new Error('Invalid trials');
  const selected=shardCases(selectCases(cases(),flags.only),flags.shard,flags.shards);
  const recordings=JSON.parse(fs.readFileSync(path.join(__dirname,'../tests/fixtures/escape-playthroughs.json'),'utf8'));
  const solverFingerprint=crypto.createHash('sha256').update(['lib/level-lab.cjs','lib/level-policy.cjs','level-lab.cjs','level-benchmark.cjs','route-solver.cjs'].map(file=>fs.readFileSync(path.join(__dirname,file),'utf8')).join('\0')).digest('hex');
  const metadata={...config,shard:flags.shard,shards:flags.shards,only:flags.only||null,node:process.version,solverFingerprint};
  const results=[];
  for(const item of selected){
    const result=benchmarkCase(item,recordings,config);results.push(result);
    writeOutputs(path.join(flags.out,item.id.replace(':','-')),result.report);
    saveSummary(flags.out,results,metadata);
    console.log(`${item.id}: reference=${result.reference.status}; independent=${result.report.status} (${result.report.reason}); timing=${result.report.stress?result.report.stress.wins+'/'+config.trials:'n/a'}`);
  }
  const final=saveSummary(flags.out,results,metadata);
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,final.markdown);
  // An unresolved search is benchmark evidence, not a failing game regression.
  // Broken known solutions are regressions and must fail the job.
  return final.summary.totals.referenceFailed?1:0;
}
if(require.main===module){try{process.exitCode=main(process.argv.slice(2));}catch(error){console.error(error.message);process.exitCode=2;}}
module.exports={cases,selectCases,shardCases,matchingRecording,tags,benchmarkCase,saveSummary,main};
