const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');
const recordings=require('./fixtures/escape-playthroughs.json');
for(const recording of recordings)test('recorded legal escape with real guards: '+(recording.options.challengeId||recording.options.levelId),()=>{
  const g=new EscapeAdventure(recording.options);
  for(const command of recording.commands){
    if(command.kind==='move')for(let n=0;n<command.frames;n++)g.advance(1/120,command);
    else if(command.kind==='pebble')assert.equal(g.throwDecoy(),true);
    else if(command.kind==='camo')assert.equal(g.camouflage(),true);
    else if(command.kind==='burrow')assert.equal(g.burrow(),true);
    else if(command.kind==='seed')assert.equal(g.plantSeed(),true);
    else if(command.kind==='tongue')assert.equal(g.useTongue(),true);
    else assert.fail('Unknown input command');
  }
  assert.equal(g.status,'won');assert.equal(g.hasKey,true);assert.ok(g.elapsed>1&&g.elapsed<180);
  if(g.challenge?.noChase)assert.equal(g.alarms,0);
  if(g.challenge?.allTreasure)assert.equal(g.treasure,g.totalTreasure);
  if(g.timeLimit)assert.ok(g.elapsed<g.timeLimit);
  if(g.challenge?.keyByTongue)assert.equal(g.keyByTongue,true);
  if(g.level.reactions){assert.equal(g.reactionsFired.size,g.level.reactions.length);if(g.level.reactions.some(r=>r.close?.length))assert.ok(g.gates.some(gate=>gate.sealed&&(!gate.open||gate.bracedUntil>g.elapsed)));}
  if(g.level.reinforcements){assert.equal(g.pendingSpawns.length,0);assert.equal(g.spawnedReinforcements.size,g.level.reinforcements.length);assert.equal(g.hunters.length,g.level.guards.length+g.level.reinforcements.length);}
  for(const gate of g.gates.filter(g=>g.duration)){assert.ok(gate.activations>0,gate.id+' plate used');}
  assert.equal(g.motion.snakes.length,g.hunters.length);
  if(g.level.rivalries)assert.ok(g.clashes>0,'the real guards fought during the escape');
  if(g.level.hawk)assert.ok(g.hawk.strikes>0,'the hawk really dived during the escape');
  if(g.level.biome==='lagoon')assert.ok(g.swimDistance>10,'the recorded escape includes real swimming');
});
