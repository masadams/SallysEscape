#!/usr/bin/env node
'use strict';
const path=require('node:path'),{spawnSync}=require('node:child_process');
function parse(argv){
  const config={minutes:120,out:'work/laptop-benchmark'};
  for(let i=0;i<argv.length;i++){
    if(argv[i]==='--help')return {...config,help:true};
    const key=argv[i].slice(2);if(!argv[i].startsWith('--')||!['minutes','out'].includes(key))throw new Error('Unknown overnight option '+argv[i]);
    const value=argv[++i];if(!value||value.startsWith('--'))throw new Error('Missing value for --'+key);
    config[key]=key==='minutes'?Number(value):value;
  }
  if(!Number.isInteger(config.minutes)||config.minutes<1||config.minutes>720)throw new Error('Use --minutes 1..720');
  return config;
}
function run(config,{spawn=spawnSync,now=Date.now}={}){
  const deadline=now()+config.minutes*60000,repo=path.resolve(__dirname,'..');
  for(let shard=1;shard<=8;shard++){
    const remaining=deadline-now();if(remaining<=0)return {status:'paused',completedShards:shard-1,code:0};
    // One process, no timing trials or practice. The parent timeout covers
    // references, search, replay verification and file writes together.
    const result=spawn(process.execPath,[path.join(__dirname,'level-benchmark.cjs'),'--shard',String(shard),'--shards','8','--width','4','--budget','300','--milliseconds','45000','--frames','60000','--trials','0','--resume','--out',path.resolve(repo,config.out,'shard-'+shard)],{cwd:repo,stdio:'inherit',timeout:Math.max(1,remaining),killSignal:'SIGTERM'});
    if(result.error?.code==='ETIMEDOUT')return {status:'paused',completedShards:shard-1,code:0};
    if(result.error)throw result.error;
    if(result.status!==0)return {status:'failed',completedShards:shard-1,code:result.status||1};
  }
  return {status:'complete',completedShards:8,code:0};
}
function main(argv){
  const config=parse(argv);
  if(config.help){console.log('Usage: node scripts/level-overnight.cjs [--minutes 120] [--out work/laptop-benchmark]\nRuns one CPU process for up to the selected wall time; repeat the same command to resume matching completed cases.');return 0;}
  const result=run(config);console.log(JSON.stringify(result));
  if(result.status==='paused')console.log('Time allowance reached. Completed cases are saved; repeat the same command to continue.');
  return result.code;
}
if(require.main===module){try{process.exitCode=main(process.argv.slice(2));}catch(error){console.error(error.message);process.exitCode=2;}}
module.exports={parse,run,main};
