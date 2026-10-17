'use strict';
const fs=require('node:fs'),path=require('node:path');
const Lab=require('./level-lab.cjs'),Policy=require('./level-policy.cjs'),Memory=require('./level-memory.cjs');
const {EscapeAdventure}=require('../../public/escape-engine.js');

function settings(config={}){
  const cfg={milliseconds:300000,frames:300000,candidates:12,trials:8,jitter:6,seed:1,testSeed:1009,searchMilliseconds:10000,searchBudget:200,width:4,...config};
  for(const [key,max]of [['milliseconds',600000],['frames',100000000],['candidates',64],['trials',32],['searchMilliseconds',60000],['searchBudget',100000],['width',256]])if(!Number.isInteger(cfg[key])||cfg[key]<1||cfg[key]>max)throw new Error('Invalid practice '+key);
  Lab.stress({},[],{trials:0,jitter:cfg.jitter,seed:cfg.seed});Lab.stress({},[],{trials:0,seed:cfg.testSeed});
  if(cfg.seed===cfg.testSeed)throw new Error('Training and test seeds must differ');
  return cfg;
}
function budgetFor(cfg){
  const started=Date.now(),deadline=started+cfg.milliseconds;let frames=0;
  return {deadline,consumeFrame(){if(frames>=cfg.frames||Date.now()>=deadline)return false;frames++;return true;},remaining(){return {frames:Math.max(0,cfg.frames-frames),milliseconds:Math.max(0,deadline-Date.now())};},summary(){return {simulatedFrames:frames,milliseconds:Date.now()-started,exhausted:frames>=cfg.frames||Date.now()>=deadline};}};
}
function* variants(policy,training){
  const initial=new EscapeAdventure(policy.options),failures=training.runs.filter(r=>!r.won&&r.decisionIndex>=0);
  for(const failure of failures.slice(0,1)){
    const index=failure.decisionIndex,x=Math.floor(failure.position.x),y=Math.floor(failure.position.y);
    // These suggest local detours only. The real simulation must still reach
    // the added waypoint and independently verify every winning trace.
    for(const [dx,dy]of [[1,0],[0,1],[-1,0],[0,-1]])if(initial.actorFloor(x+dx,y+dy,null)){
      const choices=structuredClone(policy.choices);choices.splice(index,0,{type:'tile',target:{x:x+dx+.5,y:y+dy+.5},sprint:true});
      if(choices.length<=1000)yield {label:'detour-'+dx+'-'+dy+'-before-'+index,policy:{...policy,choices}};
    }
    for(const [kind,stock]of [['pebble',initial.decoys],['camo',initial.camos],['tongue',initial.tongues],['seed',initial.seeds],['burrow',initial.burrows]]){
      if(stock<=policy.choices.slice(0,index).filter(c=>c.kind===kind).length)continue;
      for(const [x,y]of kind==='camo'?[[undefined,undefined]]:[[1,0],[0,1],[-1,0],[0,-1]]){
        const choices=structuredClone(policy.choices),tool={type:'tool',kind};if(x!==undefined)Object.assign(tool,{x,y});choices.splice(index,0,tool);
        if(choices.length<=1000)yield {label:kind+'-'+(x??'')+'-'+(y??'')+'-before-'+index,policy:{...policy,choices}};
      }
    }
  }
  const indices=[0,...training.runs.filter(r=>!r.won&&r.decisionIndex>=0).map(r=>r.decisionIndex)];
  for(const index of new Set(indices))for(const frames of [15,30,60,90,120,180]){
    const choices=structuredClone(policy.choices);choices.splice(index,0,{type:'input',x:0,y:0,sprint:false,frames});
    if(choices.length<=1000)yield {label:'wait-'+frames+'-before-'+index,policy:{...policy,choices}};
  }
  for(let index=0;index<policy.choices.length;index++)if(['route','tile'].includes(policy.choices[index].type)){
    const choices=structuredClone(policy.choices);choices[index].sprint=!choices[index].sprint;
    yield {label:'toggle-sprint-'+index,policy:{...policy,choices}};
  }
}
function concise(result){
  if(!result)return null;
  return {policyHash:result.policyHash,wins:result.wins,trials:result.trials,completedTrials:result.completedTrials,baselineWon:result.baseline.won,baselineReason:result.baseline.reason,baselineMessage:result.baseline.message,budgetExhausted:result.budgetExhausted,baselineSeconds:result.baseline.seconds,simulatedFrames:result.simulatedFrames,failures:result.runs.filter(r=>!r.won).map(r=>({reason:r.reason,position:r.position,decisionIndex:r.decisionIndex,message:r.message}))};
}
function runUnlocked({items,holdout=[],memoryFile,out,config={},onProgress=()=>{}}){
  const cfg=settings(config);
  if(!items.length||new Set([...items,...holdout].map(item=>item.id)).size!==items.length+holdout.length)throw new Error('Choose distinct practice and held-out levels');
  const budget=budgetFor(cfg),memory=Memory.load(memoryFile),results=[];
  const evaluate=(policy,seed)=>{
    const remaining=budget.remaining();if(!remaining.frames||!remaining.milliseconds)return null;
    return Policy.stress(policy,{trials:cfg.trials,jitter:cfg.jitter,seed,...remaining,deadline:budget.deadline,consumeFrame:budget.consumeFrame});
  };
  const discover=options=>{
    const remaining=budget.remaining();if(!remaining.frames||!remaining.milliseconds)return null;
    return Lab.solve(options,{budget:cfg.searchBudget,width:cfg.width,frames:remaining.frames,milliseconds:Math.min(cfg.searchMilliseconds,remaining.milliseconds),consumeFrame:budget.consumeFrame});
  };
  const protocol=Memory.protocol(cfg);
  for(const item of items){
    const entry=Memory.lookup(memory,item.options),found=entry?null:discover(item.options);
    let initialPolicy=entry?.policy||found?.policy;
    const row={id:item.id,source:entry?'memory':'independent-search',search:found?.search||null,initialTraining:null,finalTraining:null,attempts:[],skippedKnownAttempts:0,heldoutTiming:null};
    results.push(row);
    if(!initialPolicy){
      row.reason=found?.reason||'session-budget';
      Memory.recordAttempt(memory,{kind:'discovery-unresolved',id:item.id,fingerprint:Lab.fingerprint(item.options),reason:row.reason,search:row.search,protocol});Memory.save(memoryFile,memory);
      onProgress(row);continue;
    }
    let initial=evaluate(initialPolicy,cfg.seed);
    if(entry&&initial&&!initial.baseline.won&&!initial.budgetExhausted){
      row.memoryRejected=concise(initial);delete memory.entries[Memory.keyFor(item.options)];Memory.save(memoryFile,memory);
      const fallback=discover(item.options);row.source='memory-rejected-then-search';row.search=fallback?.search||null;row.fallbackReason=fallback?.reason||'session-budget';
      initialPolicy=fallback?.policy;initial=initialPolicy?evaluate(initialPolicy,cfg.seed):null;
    }
    row.initialTraining=concise(initial);
    if(!initial||!Memory.complete(initial)){row.reason=!initial?(row.fallbackReason||'session-budget'):initial.baseline.won?'incomplete-training':'baseline-failed';onProgress(row);continue;}
    let bestPolicy=initialPolicy,best=initial;
    Memory.remember(memory,bestPolicy,best,cfg);Memory.save(memoryFile,memory);
    for(const candidate of variants(initialPolicy,initial)){
      if(best.wins===cfg.trials||row.attempts.length>=cfg.candidates)break;
      const hash=Memory.policyHash(candidate.policy);
      if(memory.attempts.some(a=>a.hash===hash&&JSON.stringify(a.protocol)===JSON.stringify(protocol)&&a.complete)){row.skippedKnownAttempts++;continue;}
      const evaluation=evaluate(candidate.policy,cfg.seed);if(!evaluation)break;
      const complete=!evaluation.budgetExhausted&&(!evaluation.baseline.won||evaluation.completedTrials===cfg.trials),accepted=Memory.complete(evaluation)&&Memory.better(evaluation,best);
      const attempt={label:candidate.label,hash,protocol,complete,accepted,result:concise(evaluation)};
      row.attempts.push(attempt);Memory.recordAttempt(memory,attempt);
      if(accepted){bestPolicy=candidate.policy;best=evaluation;Memory.remember(memory,bestPolicy,best,cfg);}
      Memory.save(memoryFile,memory);
      if(evaluation.budgetExhausted)break;
    }
    row.finalTraining=concise(best);row.improved=Memory.policyHash(initialPolicy)!==Memory.policyHash(bestPolicy);
    // Neither unseen-seed results nor held-out maps enter selection or memory.
    const before=evaluate(initialPolicy,cfg.testSeed);
    const after=row.improved?evaluate(bestPolicy,cfg.testSeed):before;
    row.heldoutTiming={seed:cfg.testSeed,before:concise(before),after:concise(after),samePolicy:!row.improved};
    row.reason='evaluated';onProgress(row);
  }
  const heldoutMaps=holdout.map(item=>{
    const result=discover(item.options);
    return {id:item.id,memoryUsed:false,memoryUpdated:false,status:result?.status||'not-run',reason:result?.reason||'session-budget',search:result?.search||null};
  });
  const summary={schemaVersion:1,kind:'per-level experience and bounded strategy practice; no learned transfer',settings:cfg,evaluatorFingerprint:protocol.evaluator,node:process.version,memoryFile:path.resolve(memoryFile),results,heldoutMaps,budget:budget.summary()};
  fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'practice.json'),JSON.stringify(summary,null,2)+'\n');
  const rows=results.map(r=>`| ${r.id} | ${r.source} | ${r.initialTraining?r.initialTraining.wins+'/'+r.initialTraining.completedTrials:'—'} | ${r.finalTraining?r.finalTraining.wins+'/'+r.finalTraining.completedTrials:'—'} | ${r.heldoutTiming?.before?r.heldoutTiming.before.wins+'/'+r.heldoutTiming.before.completedTrials:'—'} | ${r.heldoutTiming?.after?r.heldoutTiming.after.wins+'/'+r.heldoutTiming.after.completedTrials:'—'} | ${r.attempts.length} |`);
  fs.writeFileSync(path.join(out,'practice.md'),['# Bounded solver practice','','Per-level strategy refinement and automatic retrieval, not learned transfer or human success rates. Check completed-trial counts and budget flags before interpreting fractions.','','| Level | Starting strategy | Train before | Train after | Unseen seed before | Unseen seed after | Candidates |','| --- | --- | --- | --- | --- | --- | --- |',...rows,'',`Total work: ${summary.budget.simulatedFrames}/${cfg.frames} frames; ${summary.budget.milliseconds}/${cfg.milliseconds} ms.`,``,...heldoutMaps.map(r=>`Held-out map ${r.id}: ${r.status} (${r.reason}); no memory read or update.`),''].join('\n'));
  return summary;
}
function run(args){return Memory.withLock(args.memoryFile,()=>runUnlocked(args));}
module.exports={settings,budgetFor,variants,concise,run};
