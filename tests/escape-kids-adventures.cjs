const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeCatalog}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const Guide=require('../public/escape-kids-guide.js');
const recordings=require('./fixtures/escape-kids-adventures.json');
const adventures=EscapeCatalog.kids.filter(l=>l.adventure);
const ACT={pebble:'throwDecoy',glow:'throwGlow',spore:'throwSpore',tongue:'useTongue',burrow:'burrow',seed:'plantSeed',camo:'camouflage'};
function run(g,seconds,input={}){for(let i=0;i<Math.round(seconds*120);i++)g.advance(1/120,input);}
function replay(record,delay=0,batch=1){
  const g=new EscapeAdventure(record.options),events=new Set();run(g,delay);
  for(const c of record.commands){
    if(c.kind==='move')for(let n=0;n<c.frames;n+=batch){g.advance(Math.min(batch,c.frames-n)/120,c);for(const e of g.drainEvents())events.add(e);}
    else assert.equal(g[ACT[c.kind]](c.power),true,record.id+' '+c.kind+' failed: '+g.message);
  }
  return {g,events};
}

test('eleven adventures follow the original twenty, with ten optional treasure and reversible main routes',()=>{
  assert.deepEqual(EscapeCatalog.kids.slice(20).map(l=>l.id),['garden-gate','beetle-courtyard','lily-pond','lantern-house','sleepy-steamworks','sallys-way-home','seashell-beach','snowy-hilltop','glow-garden','ant-city','treasure-island']);
  assert.equal(adventures.length,11);assert.equal(recordings.length,22);
  for(const l of adventures){
    assert.equal(l.loot.reduce((n,p)=>n+p[2],0),10,l.id);assert.ok(!l.requiredTreasure&&!l.timeLimit,l.id);
    assert.ok(!l.reactions?.some(r=>r.close?.length||r.spawn?.length),'no surprise closures or reinforcements');
    assert.ok(!l.gates?.some(g=>g.once||g.crumble),'no one-use routes');
    assert.equal(new Set(l.map.map(r=>r.length)).size,1,l.id+' rectangular');
    const g=new EscapeAdventure({kidsId:l.id});
    for(const [x,y]of l.checkpoints)assert.ok(g.floor(x,y),l.id+' checkpoint on floor');
    for(const h of l.guards){assert.ok(g.floor(...h.spawn),l.id+' creature on floor');for(const p of h.patrol)assert.ok(g.floor(...p),l.id+' patrol on floor');}
    assert.equal(l.fieldNotes.length,2,l.id+' two readable trail notes');
    for(const n of l.fieldNotes){assert.ok(g.floor(...n.at),n.id+' note on floor');assert.ok(n.title&&n.body.split(/\s+/).length<=30,n.id+' short enough to read during play');assert.ok(!l.gates?.some(gt=>gt.tiles.some(p=>p.join()===n.at.join())),n.id+' outside doorways');}
  }
});

for(const record of recordings)test(record.id+' / '+record.variant+': recorded inputs win with every creature and hazard active, without an Oops',()=>{
  const {g,events}=replay(record);assert.equal(g.status,'won',g.message);assert.equal(g.oopses,0);assert.equal(g.hasKey,true);
  assert.equal(g.treasure,record.treasure);assert.equal(g.result.kids,true);
  assert.ok(Math.abs(g.elapsed-record.time)<.02,'the same inputs reproduce the same finish');
  if(record.variant==='treasure')assert.equal(g.treasure,g.totalTreasure,'every optional treasure is collectible');
  if(g.level.reactions)assert.equal(g.reactionsFired.size,g.level.reactions.length,'the return route really opened');
  if(record.id==='lantern-house'){assert.ok(g.tonguesUsed>0);assert.ok(g.glowsUsed>0);assert.ok(events.has('gate'));}
  if(record.id==='lily-pond'||record.id==='sallys-way-home')assert.ok(events.has('hop'),'real bounce flight');
  if(record.id==='beetle-courtyard')assert.ok(events.has('charge'),'the beetle actually charged');
  if(record.id==='sleepy-steamworks'){assert.ok(events.has('steam'));if(record.variant==='treasure'){assert.ok(events.has('plate'));assert.ok(g.seedsUsed>0);}}
});

for(const record of recordings.filter(r=>r.variant==='main'))for(const delay of [.75,2])test(record.id+': main route survives a '+delay+'s later start',()=>{
  const {g}=replay(record,delay);assert.equal(g.status,'won',g.message);assert.equal(g.oopses,0);
});

test('recorded wins are unchanged when the renderer advances two engine frames at a time',()=>{
  for(const record of recordings.filter(r=>r.variant==='main')){const {g}=replay(record,0,2);assert.equal(g.status,'won',record.id);assert.equal(g.oopses,0,record.id);}
});

for(const l of adventures)test(l.id+': a child can read at the start for fifteen seconds safely',()=>{
  const g=new EscapeAdventure({kidsId:l.id});run(g,15);assert.equal(g.status,'playing');assert.equal(g.oopses,0);assert.equal(g.alarms,0);
});

test('all Little Explorers supplies are endless, while campaign supplies still get spent',()=>{
  for(const l of EscapeCatalog.kids){assert.equal(l.unlimited,true);const g=new EscapeAdventure({kidsId:l.id});for(const prop of ['decoys','burrows','tongues','glows','spores','seeds','camos'])if(g[prop]>0){const n=g[prop];for(let i=0;i<20;i++)g.spend(prop);assert.equal(g[prop],n,l.id+' '+prop);}}
  const campaign=new EscapeAdventure({levelId:'quiet-vault'}),n=campaign.decoys;campaign.spend('decoys');assert.equal(campaign.decoys,n-1);
  const g=new EscapeAdventure({kidsId:'beetle-courtyard'});g.player.facing={x:1,y:0};assert.equal(g.throwSpore(0),true);assert.equal(g.throwSpore(0),false,'endless supplies retain cooldown');
});

test('an Oops after finding the key keeps the key and opened return route',()=>{
  for(const id of ['garden-gate','sallys-way-home']){const {g}=replay(recordings.find(r=>r.id===id&&r.variant==='main'));
    // A unit check of recovery in the same world state, just before the result would be shown.
    g.status='playing';g.result=null;g.oops(null);assert.equal(g.hasKey,true);assert.ok(g.gates.find(gt=>gt.id.endsWith(id==='garden-gate'?'home':'pond')).open);assert.ok(Guide.plan(g).path.length>0);}
});

test('the guide ends at the required burrow, tongue or tunnel action, with no dots through the obstacle',()=>{
  for(const [id,kind]of [['push-through','burrow'],['tongue-snatch','tongue'],['tunnel-hop','tunnel']]){
    const g=new EscapeAdventure({kidsId:id}),p=Guide.plan(g);assert.equal(p.action?.kind,kind,id);
    assert.deepEqual(p.path.at(-1),p.action.at);for(const at of p.path)assert.ok(g.floor(...at),id+' every dot is walkable');
  }
  const p=Guide.plan(new EscapeAdventure({kidsId:'tongue-snatch'}));assert.equal(p.action.target[0]-p.action.at[0],2,'spare reach rather than an exact three-tile grab');
});

test('the lantern-house guide points to the remote switch before it points into the locked wing',()=>{
  const g=new EscapeAdventure({kidsId:'lantern-house'}),p=Guide.plan(g);assert.equal(p.gateId,'lantern-blue');assert.equal(p.action.kind,'tongue');assert.deepEqual(p.action.target,[15,4]);
  g.tongueSwitch(g.gates[0]);const after=Guide.plan(g);assert.equal(after.gateId,undefined);assert.ok(after.path.some(([x])=>x>22),'the opened wing is now reachable');
});

test('the steamworks treasure door can be reopened from either side after its timer expires',()=>{
  const g=new EscapeAdventure({kidsId:'sleepy-steamworks'}),gate=g.gates.find(g=>g.id==='works-treasure');
  for(const at of [[28,16],[32,16]]){g.player.x=at[0]+.5;g.player.y=at[1]+.5;run(g,.1);assert.equal(gate.open,true);g.player.y=14.5;run(g,9);assert.equal(gate.open,false);assert.equal(gate.sealed,false);}
});

test('the last five adventures are a step harder: bigger, busier and less forgiving, but still gentle',()=>{
  const first=adventures.slice(0,6),last=adventures.slice(6),hunters=l=>(l.guards||[]).length+(l.antTrails||[]).length;
  assert.ok(last.every(l=>hunters(l)>=3),'at least three creatures or a column');assert.ok(last.every(l=>l.gentle>Math.max(...first.map(f=>f.gentle))),'creatures move a little quicker');assert.equal(Math.max(...last.map(l=>l.gentle)),last.at(-1).gentle,'the finale is the quickest');
  assert.ok(last.every(l=>l.checkpoints.length>=3),'checkpoints before each tricky part');assert.ok(Math.max(...last.map(l=>l.width*l.height))>Math.max(...first.map(l=>l.width*l.height)),'the finale is the biggest');
  assert.equal(last.at(-1).id,'treasure-island');
});
