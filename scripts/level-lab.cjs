#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const Lab=require('./lib/level-lab.cjs');
const {EscapeCatalog,escapeBuildCustom}=require('../public/escape-levels.js');
const Builder=require('../public/escape-builder.js');
const USAGE=`Level lab: find and check legal solutions without editing maps.
  npm run level:lab -- list
  npm run level:lab -- solve quiet-vault --out work/quiet-vault
  npm run level:lab -- solve challenge:ID --out work/challenge
  npm run level:lab -- solve --custom exported-level.txt --out work/custom
  npm run level:lab -- solve --route route.json --out work/custom
  npm run level:lab -- replay work/quiet-vault/replay.json
  npm run level:lab -- stress work/quiet-vault/replay.json --trials 12 --jitter 6 --seed 1
Options: --budget 1500 --width 24 --depth 160 --seconds 120 --trials 8
         --milliseconds 60000 --jitter 6 (frames at 120 Hz) --seed 1 --no-tail
         --reuse previous/replay.json (try previous inputs against this map first)
Exit codes: 0 solved/replay passed; 1 unresolved/replay failed/stress failure; 2 invalid input.
Search uses full game state. Results do not certify human difficulty or impossibility.`;
function parse(argv){
  const flags={},pos=[];const numeric=new Set(['budget','width','depth','seconds','milliseconds','trials','jitter','seed']);
  for(let i=0;i<argv.length;i++){
    const arg=argv[i];if(!arg.startsWith('--')){pos.push(arg);continue;}
    const key=arg.slice(2);if(key==='no-tail'){flags.allowTail=false;continue;}if(key==='help'){flags.help=true;continue;}
    if(!numeric.has(key)&&!['out','custom','route','reuse'].includes(key))throw new Error('Unknown option '+arg);
    const value=argv[++i];if(value===undefined||value.startsWith('--'))throw new Error('Missing value for '+arg);
    flags[key]=numeric.has(key)?Number(value):value;
  }
  return {flags,pos};
}
function loadOptions(id,flags){
  if([Boolean(id),Boolean(flags.custom),Boolean(flags.route)].filter(Boolean).length!==1)throw new Error('Choose one level ID, --custom, or --route');
  if(flags.custom){const text=fs.readFileSync(flags.custom,'utf8');const model=/^SALLY[12]:/.test(text.trim())?Builder.importText(text.trim()):Builder.sanitize(JSON.parse(text));if(!model)throw new Error('Invalid builder export');const errors=Builder.validate(model);if(errors.length)throw new Error('Builder validation: '+errors.join('; '));return {level:escapeBuildCustom(Builder.toRoute(model))};}
  if(flags.route){const route=JSON.parse(fs.readFileSync(flags.route,'utf8'));return {level:escapeBuildCustom(route)};}
  if(id.startsWith('challenge:'))return {challengeId:id.slice(10)};
  if(id.startsWith('hidden:'))return {hiddenId:id.slice(7)};
  return {levelId:id};
}
function writeOutputs(dir,report){
  fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2)+'\n');
  const replayPath=path.join(dir,'replay.json');
  if(report.replay)fs.writeFileSync(replayPath,JSON.stringify(report.replay,null,2)+'\n');
  else if(fs.existsSync(replayPath))fs.unlinkSync(replayPath); // Never leave a previous win beside an unresolved report.
  const s=report.stress;
  const lines=[`# Level lab: ${report.options.levelId||report.options.challengeId||report.options.hiddenId||report.options.level.name}`,``, `Result: **${report.status}** (${report.reason}).`,``, `Search: ${report.search.expanded} expanded states; ${report.search.generated} simulated candidates.`,``, `Best attempt: ${report.bestAttempt.hasKey?'key collected':'key not collected'}, ${report.bestAttempt.treasure}/${report.bestAttempt.requiredTreasure} required treasure, ${report.bestAttempt.seconds}s; tail drops: ${report.bestAttempt.tailsDropped}.`,``,s?`Timing stress: ${s.wins}/${s.trials} wins with ±${s.jitterFrames} input frames and intermittent delays. This is an open-loop stress test, not a human success estimate.`:'Timing stress: unavailable without a winning replay.',``,report.status==='unresolved'?'No solution was found within this search configuration. This is NOT proof that the map is impossible.':'A fresh instance of the real engine verified the saved replay.',``,`## Most frequent failed branches`,``,...report.failures.map(f=>`- Tile ${f.tile}: ${f.message} (${f.count} branches)`),``,`These counts describe this search, not player death rates. Search has full map knowledge. Inspect the replay and playtest readability and fun before accepting a map.`];
  fs.writeFileSync(path.join(dir,'report.md'),lines.join('\n')+'\n');
}
function main(argv){
  const {flags,pos}=parse(argv),[mode,id]=pos;if(flags.help||!mode){console.log(USAGE);return 0;}
  if(mode==='list'){console.log(JSON.stringify({levels:EscapeCatalog.levels.map(l=>({id:l.id,name:l.name})),challenges:EscapeCatalog.challenges.map(c=>({id:'challenge:'+c.id,levelId:c.levelId})),hidden:EscapeCatalog.hidden.map(l=>({id:'hidden:'+l.id,name:l.name}))},null,2));return 0;}
  // Validate before any potentially expensive search or output writes.
  Lab.settings(flags);Lab.stress({},[],{trials:0,jitter:flags.jitter??6,seed:flags.seed??1});
  if(!Number.isInteger(flags.trials??8)||(flags.trials??8)<0||(flags.trials??8)>100)throw new Error('Invalid trials (0–100)');
  if(mode==='solve'){
    if(pos.length>2)throw new Error('Unexpected positional arguments');
    if(!flags.out)throw new Error('--out is required to save the report and replay');
    const options=loadOptions(id,flags);
    if(flags.reuse){const previous=JSON.parse(fs.readFileSync(flags.reuse,'utf8'));Lab.validateCommands(previous.commands);flags.reuseCommands=previous.commands;}
    const report=Lab.solve(options,flags);
    if(report.replay)report.stress=Lab.stress(options,report.replay.commands,flags);
    writeOutputs(flags.out,report);
    console.log(`${report.status.toUpperCase()}: ${report.reason}; ${report.search.expanded} states. Report: ${path.resolve(flags.out,'report.md')}`);
    if(report.stress)console.log(`Timing stress: ${report.stress.wins}/${report.stress.trials} wins. This is not a human win rate.`);
    return report.status==='solved'?0:1;
  }
  if(mode==='replay'||mode==='stress'){
    if(!id||pos.length!==2)throw new Error('Supply one replay file');
    const artifact=JSON.parse(fs.readFileSync(id,'utf8')),verified=Lab.verifyArtifact(artifact);
    const result=mode==='replay'?verified:Lab.stress(artifact.options,artifact.commands,flags);
    console.log(JSON.stringify(result,null,2));return mode==='replay'?(verified.won?0:1):(verified.won&&result.wins===result.trials?0:1);
  }
  throw new Error('Unknown command '+mode+'\n'+USAGE);
}
if(require.main===module){try{process.exitCode=main(process.argv.slice(2));}catch(error){console.error(error.message);process.exitCode=2;}}
module.exports={parse,loadOptions,writeOutputs,main};
