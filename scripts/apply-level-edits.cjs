// Brings level workshop exports into the game. The admin area's workshop saves behind-the-scenes
// drafts of the game's escapes and exports them as a file; this checks every draft and, with
// --write, puts it in place of its escape in its source file: public/escape-rebuilt.js, escape-hidden.js,
// escape-kids.js or the seasonal pack's file (escape-autumn.js, -winter, -spring, -summer).
//
//   node scripts/apply-level-edits.cjs edits.json            check only: builds, lint, recorded run
//   node scripts/apply-level-edits.cjs edits.json --write    and write the drafts into the source
//
// An edited escape keeps its id, place on the trail and ties (EDIT_KEEP) and its revision, so
// players' records stand; a seasonal or Little Explorers escape keeps everything the builder doesn't
// handle (EscapeBuilder.mergeInto). A recorded winning run that no longer wins means its fixture in
// tests/fixtures/ needs a new run before the tests pass again.
const path=require('path'),fs=require('fs');
const ROOT=path.join(__dirname,'..');
const PI=Math.PI;
const SOURCES={level:'escape-rebuilt.js',hidden:'escape-hidden.js',kids:'escape-kids.js',autumn:'escape-autumn.js',winter:'escape-winter.js',spring:'escape-spring.js',summer:'escape-summer.js'};
for(const k of Object.keys(SOURCES))SOURCES[k]=path.join(ROOT,'public',SOURCES[k]);
// Each kind of escape's recorded winning runs, and how a run names its escape.
const FIXTURES={level:['escape-playthroughs.json'],hidden:['escape-playthroughs.json'],kids:['escape-kids-adventures.json'],seasonal:['escape-seasons.json','escape-winter.cjs','escape-spring.cjs','escape-summer.cjs']};
const runFor=(kind,id)=>r=>!r.options.challengeId&&!r.pending&&({level:r.options.levelId,hidden:r.options.hiddenId,kids:r.options.kidsId,seasonal:r.options.seasonalId})[kind]===id;

// The route entries of a source file, as [start,end) text spans inside `const routes=[ ... ];`.
function entries(text){
  const open=text.indexOf('const routes=[');if(open<0)throw new Error('No routes list');
  const out=[];let i=open+'const routes=['.length,depth=0,start=-1,quote=null;
  for(;i<text.length;i++){const ch=text[i];
    if(quote){if(ch==='\\')i++;else if(ch===quote)quote=null;continue;}
    if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
    if(ch==='/'&&text[i+1]==='/'){i=text.indexOf('\n',i);continue;}
    if(ch==='{'||ch==='['){if(depth===0&&ch==='{')start=i;depth++;}
    else if(ch==='}'||ch===']'){if(depth===0)break;depth--;if(depth===0&&ch==='}')out.push([start,i+1]);}}
  return out;
}
const evaluate=src=>Function('PI','return ('+src+');')(PI);
// Numbers that are quarter turns read back as PI, the way the source writes facings.
function num(n){for(const [v,s] of [[PI,'PI'],[-PI,'-PI'],[PI/2,'PI/2'],[-PI/2,'-PI/2'],[PI*1.5,'PI*1.5']])if(Math.abs(n-v)<1e-9)return s;return String(n);}
function value(v){
  if(typeof v==='number')return num(v);
  if(Array.isArray(v))return '['+v.map(value).join(',')+']';
  if(v&&typeof v==='object')return '{'+Object.entries(v).filter(([,x])=>x!==undefined).map(([k,x])=>(/^[A-Za-z_$][\w$]*$/.test(k)?k:JSON.stringify(k))+':'+value(x)).join(',')+'}';
  return JSON.stringify(v);
}
// One route in the source's style: the map last, a row per line.
function serialize(route){
  const {map,...rest}=route,first=['append','id','name','brief','hint'],keys=[...first.filter(k=>k in rest),...Object.keys(rest).filter(k=>!first.includes(k))];
  const head=keys.map(k=>k+':'+value(rest[k])).join(',');
  return '{'+head+',map:[\n'+map.map(r=>' '+JSON.stringify(r)).join(',\n')+']}';
}
// The route that goes into the source for a draft: the draft's gameplay, the old entry's ties.
function merged(old,route,keep){
  const out={};for(const k of ['append',...keep])if(old[k]!==undefined&&k!=='revision')out[k]=old[k];
  const {id,revision,draft,custom,...play}=route;
  return {...out,id:old.id,...play};
}
function replaceEntry(text,id,route,keep){
  for(const [a,b] of entries(text)){const old=evaluate(text.slice(a,b));if(old.id!==id)continue;
    return text.slice(0,a)+serialize(merged(old,route,keep))+text.slice(b);}
  throw new Error('No route '+id+' in this file');
}
// A seasonal or Little Explorers entry is replaced whole: its route already carries what it keeps.
function replaceWhole(text,id,route){
  for(const [a,b] of entries(text)){const old=evaluate(text.slice(a,b));if(old.id!==id)continue;
    const {draft,custom,...entry}=route;return text.slice(0,a)+serialize({...entry,id})+text.slice(b);}
  throw new Error('No route '+id+' in this file');
}
module.exports={entries,serialize,replaceEntry,replaceWhole,merged};

if(require.main===module){
  const file=process.argv[2],write=process.argv.includes('--write');
  if(!file){console.log('Usage: node scripts/apply-level-edits.cjs edits.json [--write]');process.exit(2);}
  const data=JSON.parse(fs.readFileSync(file,'utf8'));
  if(data.kind!=='sally-level-edits'||!Array.isArray(data.edits))throw new Error('Not a level workshop export');
  const B=require(path.join(ROOT,'public/escape-builder.js'));
  const lib=require(path.join(ROOT,'public/escape-levels.js'));
  const {EscapeAdventure}=require(path.join(ROOT,'public/escape-engine.js'));
  const {rules,measure}=require('./lint-levels.cjs');
  const {EscapeCatalog,escapeBuildCustom,escapeBuildAs,EDIT_KEEP}=lib;
  const ACT={pebble:'throwDecoy',burrow:'burrow',tongue:'useTongue',seed:'plantSeed',camo:'camouflage',glow:'throwGlow',spore:'throwSpore'};
  const replay=(level,commands)=>{const g=new EscapeAdventure({level});for(const c of commands){if(c.kind==='move'){for(let n=0;n<c.frames;n++)g.advance(1/120,c);}else g[ACT[c.kind]]?.(c.power);}return g;};
  const texts={},fixtures={};
  const textOf=file=>texts[file]??=fs.readFileSync(file,'utf8');
  const runsOf=kind=>fixtures[kind]??=FIXTURES[kind].flatMap(f=>require(path.join(ROOT,'tests/fixtures',f)));
  const lists={level:EscapeCatalog.levels,hidden:EscapeCatalog.hidden,kids:EscapeCatalog.kids,seasonal:EscapeCatalog.seasonal};
  let failed=0;
  for(const e of data.edits){
    const [kind,id]=String(e.key).split(':'),list=lists[kind]||[],game=list.find(l=>l.id===id);
    const say=(...m)=>console.log('  '+m.join(' '));
    console.log((game?(kind==='hidden'?'★ ':kind==='level'?String(list.indexOf(game)+1).padStart(3)+' ':kind==='kids'?'🌼 ':'✦ ')+game.name:e.key)+(e.savedAt?'  (saved '+String(e.savedAt).slice(0,16).replace('T',' ')+')':''));
    if(!game){say('✗ unknown escape');failed++;continue;}
    // The source file: a seasonal escape lives in its pack's file.
    const file=kind==='seasonal'?[SOURCES.autumn,SOURCES.winter,SOURCES.spring,SOURCES.summer].find(f=>entries(textOf(f)).some(([a,b])=>evaluate(textOf(f).slice(a,b)).id===id)):SOURCES[kind];
    if(!file){say('✗ no source file has this escape');failed++;continue;}
    // Prefer the model (what the builder saved); the route is what it built from it then.
    const model=e.model&&B.sanitize(e.model),problems=model?B.validate(model):[];
    if(problems.length){say('✗ builder checks:',problems.join(' '));failed++;continue;}
    const old=entries(textOf(file)).map(([a,b])=>evaluate(textOf(file).slice(a,b))).find(r=>r.id===id);
    const pack=kind==='kids'||kind==='seasonal',route=model?(pack?B.mergeInto(old,game,B.toRoute(model)):B.toRoute(model)):e.route;
    try{texts[file]=pack?replaceWhole(textOf(file),id,route):replaceEntry(textOf(file),id,route,EDIT_KEEP);}catch(err){say('✗',err.message);failed++;continue;}
    // Build it the way the game will, from the rewritten source entry.
    const entry=entries(texts[file]).map(([a,b])=>evaluate(texts[file].slice(a,b))).find(r=>r.id===id);
    let level;try{level=pack?escapeBuildAs(e.key,entry):escapeBuildCustom(entry);new EscapeAdventure({level});}catch(err){say('✗ does not build:',err.message);failed++;continue;}
    const before=B.fromRoute(game),after=B.fromRoute(level),changed=[];
    if(before.map.join('\n')!==after.map.join('\n'))changed.push('map ('+before.map.reduce((n,row,y)=>n+[...row].filter((c,x)=>after.map[y]?.[x]!==c).length,0)+' tiles)');
    const same=(k,v)=>JSON.stringify(k==='links'?[...(v||[])].map(String).sort():v);
    for(const k of Object.keys({...before,...after}))if(k!=='map'&&k!=='id'&&k!=='source'&&same(k,before[k])!==same(k,after[k]))changed.push(k);
    say(changed.length?'changed: '+changed.join(', '):'no gameplay changes');
    const lint=rules(level,{level}).filter(f=>f.level==='error');for(const f of lint)say('⚠ lint:',f.msg);
    const recs=runsOf(kind).filter(runFor(kind,id));if(!recs.length)say('· no recorded winning run to check');
    for(const rec of recs){const g=replay(level,rec.commands),name=rec.variant&&rec.variant!=='main'?' ('+rec.variant+')':'';say(g.status==='won'?'✓ the recorded winning run'+name+' still wins ('+g.elapsed.toFixed(1)+'s)':'⚠ the recorded winning run'+name+' no longer wins: re-record it before the tests pass again');}
  }
  if(write&&!failed){for(const [file,text] of Object.entries(texts))fs.writeFileSync(file,text);console.log('\nWritten. Run npm test.');}
  else if(write)console.log('\nNothing written: fix the drafts marked ✗ first.');
  process.exit(failed?1:0);
}
