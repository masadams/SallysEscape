// Brings level workshop exports into the game. The admin area's workshop saves behind-the-scenes
// drafts of the game's escapes and exports them as a file; this checks every draft and, with
// --write, puts it in place of its escape in public/escape-rebuilt.js or public/escape-hidden.js.
//
//   node scripts/apply-level-edits.cjs edits.json            check only: builds, lint, recorded run
//   node scripts/apply-level-edits.cjs edits.json --write    and write the drafts into the source
//
// An edited escape keeps its id, place on the trail and ties (EDIT_KEEP) and its revision, so
// players' records stand. A recorded winning run that no longer wins means the fixture in
// tests/fixtures/escape-playthroughs.json needs a new run before the tests pass again.
const path=require('path'),fs=require('fs');
const ROOT=path.join(__dirname,'..');
const PI=Math.PI;
const SOURCES={level:path.join(ROOT,'public/escape-rebuilt.js'),hidden:path.join(ROOT,'public/escape-hidden.js')};

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
module.exports={entries,serialize,replaceEntry,merged};

if(require.main===module){
  const file=process.argv[2],write=process.argv.includes('--write');
  if(!file){console.log('Usage: node scripts/apply-level-edits.cjs edits.json [--write]');process.exit(2);}
  const data=JSON.parse(fs.readFileSync(file,'utf8'));
  if(data.kind!=='sally-level-edits'||!Array.isArray(data.edits))throw new Error('Not a level workshop export');
  const B=require(path.join(ROOT,'public/escape-builder.js'));
  const {EscapeCatalog,escapeBuildCustom,EDIT_KEEP}=require(path.join(ROOT,'public/escape-levels.js'));
  const {EscapeAdventure}=require(path.join(ROOT,'public/escape-engine.js'));
  const {rules,measure}=require('./lint-levels.cjs');
  const fixtures=require(path.join(ROOT,'tests/fixtures/escape-playthroughs.json'));
  const texts={level:fs.readFileSync(SOURCES.level,'utf8'),hidden:fs.readFileSync(SOURCES.hidden,'utf8')};
  let failed=0;
  for(const e of data.edits){
    const [kind,id]=String(e.key).split(':'),list=kind==='hidden'?EscapeCatalog.hidden:EscapeCatalog.levels,game=list.find(l=>l.id===id);
    const say=(...m)=>console.log('  '+m.join(' '));
    console.log((game?(kind==='hidden'?'★ ':String(list.indexOf(game)+1).padStart(3)+' ')+game.name:e.key)+(e.savedAt?'  (saved '+String(e.savedAt).slice(0,16).replace('T',' ')+')':''));
    if(!game||!SOURCES[kind]){say('✗ unknown escape');failed++;continue;}
    // Prefer the model (what the builder saved); the route is what it built from it then.
    const model=e.model&&B.sanitize(e.model),problems=model?B.validate(model):[];
    if(problems.length){say('✗ builder checks:',problems.join(' '));failed++;continue;}
    const route=model?B.toRoute(model):e.route;
    try{texts[kind]=replaceEntry(texts[kind],id,route,EDIT_KEEP);}catch(err){say('✗',err.message);failed++;continue;}
    // Build it the way the game will, from the rewritten source entry.
    const entry=entries(texts[kind]).map(([a,b])=>evaluate(texts[kind].slice(a,b))).find(r=>r.id===id);
    let level;try{level=escapeBuildCustom(entry);new EscapeAdventure({level});}catch(err){say('✗ does not build:',err.message);failed++;continue;}
    const before=B.fromRoute(game),after=B.fromRoute(level),changed=[];
    if(before.map.join('\n')!==after.map.join('\n'))changed.push('map ('+before.map.reduce((n,row,y)=>n+[...row].filter((c,x)=>after.map[y]?.[x]!==c).length,0)+' tiles)');
    const same=(k,v)=>JSON.stringify(k==='links'?[...(v||[])].map(String).sort():v);
    for(const k of Object.keys({...before,...after}))if(k!=='map'&&k!=='id'&&same(k,before[k])!==same(k,after[k]))changed.push(k);
    say(changed.length?'changed: '+changed.join(', '):'no gameplay changes');
    const lint=rules(level,{level}).filter(f=>f.level==='error');for(const f of lint)say('⚠ lint:',f.msg);
    const rec=fixtures.find(r=>(kind==='hidden'?r.options.hiddenId:r.options.levelId)===id&&!r.options.challengeId);
    if(rec){const run=measure({...rec,options:{level}});say(run.won?'✓ the recorded winning run still wins ('+run.time+'s)':'⚠ the recorded winning run no longer wins: re-record it in tests/fixtures/escape-playthroughs.json');}
  }
  if(write&&!failed){for(const k of Object.keys(texts))fs.writeFileSync(SOURCES[k],texts[k]);console.log('\nWritten. Run npm test.');}
  else if(write)console.log('\nNothing written: fix the drafts marked ✗ first.');
  process.exit(failed?1:0);
}
