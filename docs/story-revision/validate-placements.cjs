// Run from any directory: node docs/story-revision/validate-placements.cjs
// Static content audit only. This does not simulate hunters, time, collisions or gate reactions.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const {EscapeCatalog:catalog,escapeGridFor:gridFor}=require(path.join(root,'public/escape-levels.js'));
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'placements.json'),'utf8'));
const directions=[[1,0],[-1,0],[0,1],[0,-1]];
const key=at=>at.slice(0,2).join(',');
const themes=['meadow','garden','river','ruins','quarry','desert','marsh','jungle','glow','orchard','coast','hollow','lantern','rooftops','ants','frost','vents','grotto','storm','tide','home'];
const boundaries=[0,5,9,13,17,23,27,32,37,42,47,49,53,58,63,68,73,78,83,88,93,100];
function occupied(level){
  const cells=new Set();
  const add=at=>{if(Array.isArray(at)&&typeof at[0]==='number')cells.add(key(at));};
  const line=(a,b)=>{const steps=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));for(let i=0;i<=steps;i++)add([a[0]+Math.sign(b[0]-a[0])*i,a[1]+Math.sign(b[1]-a[1])*i]);};
  const rect=r=>{for(let y=r[1];y<=r[3];y++)for(let x=r[0];x<=r[2];x++)add([x,y]);};
  ['spawn','key','exit','rootWheel'].forEach(k=>add(level[k]));
  ['loot','cover','gravel','cracks','water','mud','gaps','crumble','vines','slits','puffballs','moss','ice','tideFlats','soil','warm','shade','regrowth','glowPlants'].forEach(k=>(level[k]||[]).forEach(add));
  for(const g of level.gates||[]){add(g.switch);(g.plates||[]).forEach(add);(g.tiles||[]).forEach(add);}
  for(const g of [...level.guards||[],...level.reinforcements||[]]){add(g.spawn);(g.patrol||[]).forEach(add);}
  for(const c of level.caps||[]){add(c.at);add(c.to);}
  for(const v of level.vents||[])for(let i=0;i<=v.length;i++)add([v.at[0]+v.dir[0]*i,v.at[1]+v.dir[1]*i]);
  for(const t of level.antTrails||[])for(let i=0;i<t.path.length;i++)line(t.path[i],t.path[(i+1)%t.path.length]);
  for(const t of level.thorns||[])(t.tiles||[]).forEach(add);
  for(const l of level.logs||[])line(l.from,l.to);
  for(const w of level.wind||[])rect(w.area);
  for(const c of level.seedCrossings||[]){(c.banks||[]).forEach(add);(c.tiles||[]).forEach(add);}
  for(const r of level.reactions||[]){add(r.at);if(r.region)rect(r.region);}
  return cells;
}
function distance(grid,start,target){
  const queue=[start],distances=new Map([[key(start),0]]);
  for(let i=0;i<queue.length;i++){
    const at=queue[i];if(key(at)===key(target))return distances.get(key(at));
    for(const [dx,dy]of directions){const next=[at[0]+dx,at[1]+dy],tile=grid[next[1]]?.[next[0]],k=key(next);
      if(tile&&'.LNmMSg'.includes(tile)&&!distances.has(k)){distances.set(k,distances.get(key(at))+1);queue.push(next);}
    }
  }
  return null;
}
assert.equal(data.notes.length,42);
const ids=new Set(),levels=new Set(),areas=new Map();let words=0;
for(const note of data.notes){
  assert(!ids.has(note.id),'duplicate note ID '+note.id);ids.add(note.id);
  assert(!levels.has(note.levelId),'two proposed notes share '+note.levelId);levels.add(note.levelId);
  assert.equal(note.id,`level-note:${note.areaTheme}:${note.id.split(':').at(-1)}`);
  assert(['1','2'].includes(note.id.split(':').at(-1)));
  const index=catalog.levels.findIndex(l=>l.id===note.levelId),level=catalog.levels[index];assert(level,'unknown normal level '+note.levelId);
  const area=boundaries.findIndex((n,i)=>index>=n&&index<boundaries[i+1]);
  assert.equal(note.area,area+1);assert.equal(note.areaTheme,themes[area]);
  assert.equal(note.levelName,level.name);assert.equal(note.levelRevision,level.revision);
  areas.set(note.areaTheme,(areas.get(note.areaTheme)||0)+1);
  assert(Array.isArray(note.at)&&note.at.length===2&&note.at.every(Number.isInteger));
  const [x,y]=note.at,grid=gridFor(level);
  assert.equal(grid[y]?.[x],'.',note.id+' must be ordinary floor');
  assert(!occupied(level).has(key(note.at)),note.id+' overlaps authored feature/hazard');
  const steps=distance(grid,level.spawn,note.at);assert(steps!==null,note.id+' is not initially floor-reachable');
  assert.equal(steps,note.staticWalkStepsFromSpawn,note.id+' route changed');
  const count=note.body.trim().split(/\s+/u).length;assert(count>=25&&count<=65,`${note.id}: ${count} words`);words+=count;
  for(const k of ['title','author','kind','placement','rewardSketch'])assert(note[k]?.trim(),note.id+' missing '+k);
}
for(const theme of themes)assert.equal(areas.get(theme),2,theme+' must have two notes');
const manuscript=fs.readFileSync(path.join(__dirname,'NARRATIVE.md'),'utf8');
for(const theme of themes)assert(manuscript.includes('### area:'+theme+' '),'missing area manuscript '+theme);
for(const id of ['opening','finale','after','milestone:small-kindness','milestone:carry-the-light','milestone:one-lantern','milestone:the-wait'])assert(manuscript.includes('### '+id+' '),'missing scene '+id);
for(const spot of ['star-garden','mossy-well','cloud-nest','challenge-shrine','bestiary-grove','ice-cave','sunken-wreck','magpie-roost','blind-grove','gilded','bramble'])assert(manuscript.includes('### note:'+spot+' '),'missing legacy card '+spot);
const narration=fs.readFileSync(path.join(__dirname,'NARRATION-SCRIPTS.md'),'utf8');
const scripts=[...narration.matchAll(/### Spoken script\n\n([\s\S]*?)(?=\n## |$)/g)].map(m=>m[1].trim());
const voiced=['opening','area:glow','milestone:carry-the-light','milestone:one-lantern','finale','after'];
assert.equal(scripts.length,voiced.length,'narration scene count');
voiced.forEach((id,i)=>{
  const heading='### '+id+' — ',start=manuscript.indexOf(heading);assert(start>=0);
  const lines=manuscript.slice(start).split('\n');lines.shift();const expected=[];
  for(const line of lines){if(/^## /.test(line)||/^### /.test(line))break;if(!/^Authoring direction:/.test(line))expected.push(line);}
  assert.equal(scripts[i],expected.join('\n').trim().replace(/^\*The end of the first journey\.\*$/m,'The end of the first journey.'),'narration transcript drift: '+id);
});
console.log(`PASS: 42 notes / 42 existing levels / 21 areas; ${words} note words; complete scene and legacy-card coverage.`);
console.log('PASS: unique IDs, level revisions, area membership, floor anchors, authored-feature exclusions and initial-state static floor reachability.');
console.log('PASS: five core narration scripts plus optional hook match their manuscript scenes verbatim.');
console.log('LIMIT: no engine collision radius, timing, patrol sightlines, moving hazards, objectives, tide state or reaction-state simulation; all placements still require playtesting.');
