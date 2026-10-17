'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const Lab=require('./level-lab.cjs'),Policy=require('./level-policy.cjs');
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const keyFor=(options,allowTail=true)=>digest([Lab.fingerprint(options),allowTail]);
const policyHash=Policy.identity;
const evaluator=crypto.createHash('sha256').update(['level-lab.cjs','level-goals.cjs','level-policy.cjs','level-practice.cjs','level-memory.cjs'].map(name=>fs.readFileSync(path.join(__dirname,name),'utf8')).join('\0')).digest('hex');
function load(file){
  if(!fs.existsSync(file))return {schemaVersion:1,entries:{},attempts:[]};
  if(fs.statSync(file).size>16*1024*1024)throw new Error('Memory library exceeds 16 MiB');
  const memory=JSON.parse(fs.readFileSync(file,'utf8'));
  if(!memory||memory.schemaVersion!==1||!memory.entries||Array.isArray(memory.entries)||typeof memory.entries!=='object'||Object.keys(memory.entries).length>256||!Object.keys(memory.entries).every(k=>/^[a-f0-9]{64}$/.test(k))||!Array.isArray(memory.attempts)||memory.attempts.length>256)throw new Error('Invalid memory library');
  return memory;
}
function save(file,memory){
  if(Object.keys(memory.entries).length>256)throw new Error('Memory has 256 entries; use a new library for another catalog revision');
  const data=JSON.stringify(memory,null,2)+'\n';if(Buffer.byteLength(data)>16*1024*1024)throw new Error('Memory library exceeds 16 MiB');
  fs.mkdirSync(path.dirname(file),{recursive:true});const temp=file+'.'+process.pid+'.tmp';
  fs.writeFileSync(temp,data);fs.renameSync(temp,file);
}
function withLock(file,fn){
  fs.mkdirSync(path.dirname(file),{recursive:true});const lock=file+'.lock';let fd;
  try{fd=fs.openSync(lock,'wx');}catch(error){if(error.code==='EEXIST')throw new Error('Memory library is in use; if its process was interrupted, remove '+lock+' after checking no practice session is running');throw error;}
  try{fs.writeSync(fd,String(process.pid));return fn();}finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
function lookup(memory,options,allowTail=true){
  const entry=memory.entries[keyFor(options,allowTail)];if(!entry)return null;
  Policy.validate(entry.policy);
  if(entry.policy.fingerprint!==Lab.fingerprint(options)||entry.policy.settings.allowTail!==allowTail||entry.hash!==policyHash(entry.policy))throw new Error('Memory entry does not match requested level/policy');
  return entry;
}
function recordAttempt(memory,record){memory.attempts.push(record);memory.attempts=memory.attempts.slice(-256);}
function protocol(config){return {seed:config.seed??1,trials:config.trials??8,jitter:config.jitter??6,evaluator};}
function complete(result){return result.baseline.won&&result.baseline.verification?.won===true&&!result.budgetExhausted&&result.completedTrials===result.trials;}
function score(result){return {wins:result.wins,trials:result.trials,baselineSeconds:result.baseline.seconds};}
function better(candidate,incumbent){return candidate.wins>incumbent.wins||(candidate.wins===incumbent.wins&&candidate.baseline.seconds<incumbent.baseline.seconds-.001);}
function remember(memory,policy,result,config){
  Policy.validate(policy);if(!complete(result))throw new Error('Cannot remember an unverified or incomplete evaluation');
  if(result.policyHash!==policyHash(policy)||result.seed!==config.seed||result.trials!==config.trials||result.jitterFrames!==config.jitter)throw new Error('Evaluation does not match this policy/protocol');
  const key=keyFor(policy.options,policy.settings.allowTail);
  memory.entries[key]={policy,hash:policyHash(policy),protocol:protocol(config),training:score(result)};
}
module.exports={load,save,withLock,lookup,recordAttempt,keyFor,policyHash,protocol,complete,score,better,remember};
