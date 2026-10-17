#!/usr/bin/env node
'use strict';
const Practice=require('./lib/level-practice.cjs'),Benchmark=require('./level-benchmark.cjs');
function parse(argv){
  const flags={only:'kettle-works,fern-cloister,frozen-plates',holdout:'great-boiler,eye-of-the-storm',memory:'work/experience/library.json',out:'work/practice'},config={};
  for(let i=0;i<argv.length;i++){
    const key=argv[i].slice(2);
    if(!argv[i].startsWith('--')||!['only','holdout','memory','out','milliseconds','frames','candidates','trials','jitter','seed','test-seed','search-milliseconds','search-budget','width'].includes(key))throw new Error('Unknown practice option '+argv[i]);
    const value=argv[++i];if(value===undefined||value.startsWith('--'))throw new Error('Missing value for --'+key);
    if(Object.hasOwn(flags,key))flags[key]=value;else config[key.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=Number(value);
  }
  return {flags,config};
}
function main(argv){
  if(argv.includes('--help')){console.log('Bounded per-level practice (no learned transfer).\nUsage: npm run level:practice\nOptions: --only ID,ID --holdout ID,ID|none --memory FILE --out DIR\n  --milliseconds 300000 --frames 300000 --candidates 12 --trials 8\n  --seed 1 --test-seed 1009 --jitter 6 --search-milliseconds 10000\n  --search-budget 200 --width 4\nDefault sample includes middle/late maps; unresolved searches are reported honestly.');return 0;}
  const {flags,config}=parse(argv);Practice.settings(config);
  const all=Benchmark.cases(),items=Benchmark.selectCases(all,flags.only),holdout=flags.holdout==='none'?[]:Benchmark.selectCases(all,flags.holdout);
  const result=Practice.run({items,holdout,memoryFile:flags.memory,out:flags.out,config,onProgress:r=>console.log(`${r.id}: ${r.source}; ${r.initialTraining?.wins??'?'}/${r.initialTraining?.completedTrials??'?'} -> ${r.finalTraining?.wins??'?'}/${r.finalTraining?.completedTrials??'?'} training wins; ${r.attempts.length} candidates; ${r.reason}`)});
  console.log(`Session: ${result.budget.simulatedFrames}/${result.settings.frames} frames; ${result.budget.milliseconds} ms. Report: ${flags.out}/practice.md`);
  return result.budget.exhausted?1:0;
}
if(require.main===module){try{process.exitCode=main(process.argv.slice(2));}catch(error){console.error(error.message);process.exitCode=2;}}
module.exports={parse,main};
