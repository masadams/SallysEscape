'use strict';
const Lab=require('./level-lab.cjs');
const {EscapeAdventure}=require('../../public/escape-engine.js');

function validate(artifact){
  if(!artifact||artifact.schemaVersion!==1||artifact.kind!=='feedback-policy'||!artifact.options||!artifact.settings||!Array.isArray(artifact.choices)||artifact.choices.length>1000)throw new Error('Invalid feedback policy');
  if(typeof artifact.settings.allowTail!=='boolean'||!Number.isInteger(artifact.settings.seconds))throw new Error('Invalid policy settings');
  Lab.settings(artifact.settings);
  const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<=4096&&Math.abs(p.y)<=4096;
  for(const c of artifact.choices){
    if(!c||typeof c!=='object'||(c.lookBack!==undefined&&typeof c.lookBack!=='boolean'))throw new Error('Invalid policy choice');
    if(c.type==='tile'||c.type==='route'){
      if(typeof c.sprint!=='boolean')throw new Error('Invalid policy sprint');
      if(c.type==='tile'?!point(c.target):!Array.isArray(c.waypoints)||c.waypoints.length<1||c.waypoints.length>6||!c.waypoints.every(point))throw new Error('Invalid policy waypoint');
    }else if(c.type==='input'){
      Lab.validateCommands([{kind:'move',x:c.x,y:c.y,sprint:c.sprint,frames:c.frames}]);
      if(c.frames>180)throw new Error('Policy input exceeds 180 frames');
    }else if(c.type==='tool'){
      if(!Object.hasOwn(Lab.ACTIONS,c.kind)||(c.x!==undefined&&(![-1,0,1].includes(c.x)||![-1,0,1].includes(c.y)||Math.abs(c.x)+Math.abs(c.y)!==1)))throw new Error('Invalid policy tool');
    }else throw new Error('Unknown policy choice');
  }
  if(artifact.fingerprint!==Lab.fingerprint(artifact.options))throw new Error('Policy is stale: engine or level changed. Solve the level again.');
}

// Follows saved decisions with full-state waypoint feedback, without searching.
// Every winning perturbed execution is independently checked as raw inputs.
function follow(artifact,config={}){
  validate(artifact);
  const cfg=Lab.settings({...config,seconds:artifact.settings.seconds,allowTail:artifact.settings.allowTail!==false&&config.allowTail!==false});
  const controlFrames=config.controlFrames??1,delayFrames=config.delayFrames??0;
  if(!Number.isInteger(controlFrames)||controlFrames<1||controlFrames>61||!Number.isInteger(delayFrames)||delayFrames<0||delayFrames>60)throw new Error('Invalid policy control timing');
  const started=Date.now(),commands=[];let frames=0,g=new EscapeAdventure(artifact.options),actionFailure=null;
  const deadline=Math.min(started+cfg.milliseconds,config.deadline??Infinity);
  const exhausted=()=>frames>=cfg.frames||Date.now()>=deadline;
  const execution={...cfg,controlFrames,consumeFrame:()=>{if(exhausted())return false;frames++;return true;}};
  const apply=choice=>{
    const result=Lab.execute(g,choice,execution);if(!result)return false;
    g=result.g;for(const c of result.commands)Lab.append(commands,c);return true;
  };
  for(let index=0;index<artifact.choices.length&&g.status==='playing'&&!exhausted();index++){
    if(delayFrames)apply({type:'input',x:0,y:0,sprint:false,frames:delayFrames});
    if(g.status!=='playing'||exhausted())break;
    if(!apply(artifact.choices[index])){actionFailure={index,message:g.message};break;}
  }
  const executionFrames=frames;
  const verification=g.status==='won'&&!actionFailure?Lab.replay(artifact.options,commands,{allowTail:cfg.allowTail,consumeFrame:execution.consumeFrame}):null;
  return {...Lab.summary(g),won:verification?.won===true,reason:verification?.won?'verified-feedback-replay':exhausted()?'evaluation-budget':verification?'verification-failed':actionFailure?'action-failed':g.status==='playing'?'plan-ended':g.status,actionFailure,executionFrames,verificationFrames:frames-executionFrames,simulatedFrames:frames,milliseconds:Date.now()-started,verification,commands};
}

function stress(artifact,config={}){
  validate(artifact);
  const trials=config.trials??8,jitter=config.jitter??6,seed=config.seed??1;
  Lab.stress({},[],{trials:0,jitter,seed});
  if(!Number.isInteger(trials)||trials<0||trials>100)throw new Error('Invalid trials');
  // Shared limits apply to the entire batch, not a fresh allowance per trial.
  const cfg=Lab.settings({...config,frames:config.frames??100000,milliseconds:config.milliseconds??10000});
  let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const runs=[],started=Date.now(),deadline=started+cfg.milliseconds;
  const baselineResult=follow(artifact,{...cfg,deadline}),{commands:baselineCommands,...baseline}=baselineResult;
  let frames=baseline.simulatedFrames;
  for(let trial=0;baseline.won&&trial<trials;trial++){
    const remaining=cfg.milliseconds-(Date.now()-started);if(frames>=cfg.frames||remaining<1)break;
    const controlFrames=1+Math.floor(random()*(jitter+1)),delayFrames=Math.floor(random()*(jitter+1));
    const result=follow(artifact,{...cfg,frames:cfg.frames-frames,milliseconds:remaining,deadline,controlFrames,delayFrames});
    frames+=result.simulatedFrames;
    const {commands,...outcome}=result;runs.push({trial,controlFrames,delayFrames,...outcome});
  }
  return {kind:'closed-loop full-state latency stress; not a human win-rate estimate',trials,completedTrials:runs.filter(r=>r.reason!=='evaluation-budget').length,attemptedTrials:runs.length,jitterFrames:jitter,seed,wins:runs.filter(r=>r.won).length,simulatedFrames:frames,milliseconds:Date.now()-started,baseline,budgetExhausted:baseline.reason==='evaluation-budget'||(baseline.won&&runs.length<trials)||runs.some(r=>r.reason==='evaluation-budget'),runs};
}
module.exports={validate,follow,stress};
