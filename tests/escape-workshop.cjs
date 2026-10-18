const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const B=require('../public/escape-builder.js');
const {EscapeCatalog,escapeBuildCustom,EDIT_KEEP}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const {entries,replaceEntry}=require('../scripts/apply-level-edits.cjs');
const fixtures=require('./fixtures/escape-playthroughs.json');
const ACT={pebble:'throwDecoy',burrow:'burrow',tongue:'useTongue',seed:'plantSeed',camo:'camouflage'};
function replay(options,commands){const g=new EscapeAdventure(options);for(const c of commands){if(c.kind==='move'){for(let n=0;n<c.frames;n++)g.advance(1/120,c);}else g[ACT[c.kind]]();}return g;}
// A fresh copy of the catalog, built as a browser with these workshop drafts would build it.
function catalogWith(overrides){
  const file=require.resolve('../public/escape-levels.js');delete require.cache[file];
  globalThis.EscapeEdits={overrides:()=>overrides};
  try{return require(file);}finally{delete globalThis.EscapeEdits;delete require.cache[file];require(file);}
}

test('workshop drafts stand in for their escapes only while the switch is on, keeping their place',()=>{
  const game=EscapeCatalog.levels[30],model=B.fromRoute(game);model.name='Edited';model.map[1]=model.map[1].replace('.','L');
  const {EscapeCatalog:c,escapeGameLevel}=catalogWith({['level:'+game.id]:B.toRoute(model),'level:quiet-vault':{map:['#']},'level:nope':{}});
  const edited=c.levels[30];
  assert.equal(edited.draft,true);assert.equal(edited.name,'Edited');assert.equal(edited.id,game.id);
  for(const k of EDIT_KEEP)assert.deepEqual(edited[k],game[k],k);
  assert.notDeepEqual(edited.cover,game.cover);
  assert.equal(c.levels[0].draft,undefined,'a draft that does not build is skipped');
  assert.equal(c.levels.length,EscapeCatalog.levels.length);
  assert.equal(escapeGameLevel('level:'+game.id).name,game.name,'the game’s own copy stays reachable');
  assert.equal(EscapeCatalog.levels[30].draft,undefined,'without the switch nothing changes');
});

test('runs on a workshop draft never count toward progress',()=>{
  const {EscapeProgress}=require('../public/escape-progress.js');
  const p=new EscapeProgress(null);const level=EscapeCatalog.levels[0];
  const run={status:'won',levelId:level.id,routeRevision:level.revision||1,stars:3,time:20,treasure:9,totalTreasure:9,alarms:0,hasTail:true};
  assert.equal(p.record({...run,draft:true}),false);
});

test('the drafts store keeps drafts per escape and exports them',()=>{
  const mem={};globalThis.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=String(v);}};
  const file=require.resolve('../public/escape-edits.js');delete require.cache[file];
  try{const E=require(file);
    assert.deepEqual(E.overrides(),{});E.save('level:quiet-vault',{name:'x'},{map:['#']});E.save('hidden:gilded-gate',{name:'y'},null);
    assert.deepEqual(E.overrides(),{},'nothing stands in until the switch is on');
    E.setActive(true);assert.deepEqual(Object.keys(E.overrides()),['level:quiet-vault'],'a draft with problems has no route and stays out');
    const out=E.exportFile();assert.equal(out.kind,'sally-level-edits');assert.equal(out.edits.length,2);
    assert.equal(E.exportFile(['hidden:gilded-gate']).edits.length,1);
    E.remove('level:quiet-vault');assert.deepEqual(E.overrides(),{});
  }finally{delete globalThis.localStorage;delete require.cache[file];}
});

// The apply script writes an export into the game's source; the written escapes must build and
// play exactly as the drafts did.
test('apply-level-edits writes drafts into the source and they play as edited',()=>{
  const src={level:fs.readFileSync(path.join(__dirname,'../public/escape-rebuilt.js'),'utf8'),hidden:fs.readFileSync(path.join(__dirname,'../public/escape-hidden.js'),'utf8')};
  const picks=[...[0,12,36,47,62,66,72,76,81,86,91,99].map(i=>['level',EscapeCatalog.levels[i]]),...[0,5,9].map(i=>['hidden',EscapeCatalog.hidden[i]])];
  for(const [kind,game] of picks)src[kind]=replaceEntry(src[kind],game.id,B.toRoute(B.fromRoute(game)),EDIT_KEEP);
  const load=text=>{const m={exports:{}};Function('module','globalThis',text)(m,{});return m.exports;};
  const routes={level:load(src.level),hidden:load(src.hidden)};
  assert.equal(entries(src.level).length,EscapeCatalog.levels.length);
  const failed=[];
  for(const [kind,game] of picks){
    const route=routes[kind].find(r=>r.id===game.id),rec=fixtures.find(r=>!r.pending&&!r.options.challengeId&&(kind==='hidden'?r.options.hiddenId:r.options.levelId)===game.id);
    for(const k of ['append','unlockAfter','secret','bonus','stars'])if(game[k]!==undefined&&k!=='unlockAny')assert.deepEqual(route[k],game[k],game.id+' keeps '+k);
    if(!rec)continue;const g=replay({level:escapeBuildCustom(route)},rec.commands),orig=replay(rec.options,rec.commands);
    if(g.status!=='won'||Math.abs(g.elapsed-orig.elapsed)>1e-6)failed.push(game.id+': '+g.status);
  }
  assert.deepEqual(failed,[]);
});
