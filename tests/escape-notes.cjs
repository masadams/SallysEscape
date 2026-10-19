const test=require('node:test'),assert=require('node:assert/strict');
const N=require('../public/escape-notes.js');const {EscapeAdventure}=require('../public/escape-engine.js'),{EscapeCatalog}=require('../public/escape-levels.js'),{EscapeProgress}=require('../public/escape-progress.js');
require('../public/escape-world.js');const chapters=globalThis.EscapeWorld.chapters;

test('42 pages, two in each area, each in a different ordinary escape of that area, as placed',()=>{
  assert.equal(N.NOTES.length,42);assert.equal(new Set(N.NOTES.map(n=>n.id)).size,42);assert.equal(new Set(N.NOTES.map(n=>n.levelId)).size,42);
  chapters.forEach((c,i)=>{const two=N.NOTES.filter(n=>n.area===i);assert.equal(two.length,2,c.name);assert.ok(two.every(n=>n.theme===c.theme));});
  for(const n of N.NOTES){const i=EscapeCatalog.levels.findIndex(l=>l.id===n.levelId);assert.ok(i>=0,n.levelId);const c=chapters[n.area];assert.ok(i>=c.start&&i<c.end,n.id+' is in '+c.name);
    assert.equal(EscapeCatalog.levels[i].revision,n.revision,n.id+' placed for this revision');assert.ok(n.title&&n.body.split(/\s+/).length<=70&&n.author&&n.sketch);}
});
test('every page lies on open floor that Sally can walk to from where she starts',()=>{
  for(const n of N.NOTES){const g=new EscapeAdventure({levelId:n.levelId}),[x,y]=n.at;assert.ok(g.floor(x,y),n.id+' on floor');
    const start=[Math.floor(g.player.x),Math.floor(g.player.y)],seen=new Set([start.join()]),queue=[start];let reached=false;
    while(queue.length){const [cx,cy]=queue.shift();if(cx===x&&cy===y){reached=true;break;}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=(cx+dx)+','+(cy+dy);if(!seen.has(k)&&g.floor(cx+dx,cy+dy)){seen.add(k);queue.push([cx+dx,cy+dy]);}}}
    assert.ok(reached,n.id+' reachable');}
});
test('a page shows only in its own official level',()=>{
  const n=N.NOTES[0],level=EscapeCatalog.levels.find(l=>l.id===n.levelId);
  assert.equal(N.forLevel(level),n);assert.equal(N.forLevel({...level,revision:level.revision+1}),null,'a changed level shows no page');
  assert.equal(N.forLevel({...level,custom:true}),null);assert.equal(N.forLevel({...level,kids:true}),null);assert.equal(N.forLevel(null),null);
  assert.deepEqual(N.signed(n),{who:'Old Moss',what:'journal scrap'});
});
test('found and read pages are saved with a player’s progress, ids only',()=>{
  const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
  const p=new EscapeProgress(storage);assert.equal(p.readNote('level-note:meadow:1'),false,'cannot read before finding');
  assert.equal(p.findNote('level-note:meadow:1'),true);assert.equal(p.findNote('level-note:meadow:1'),false);assert.equal(p.readNote('level-note:meadow:1'),true);
  const again=new EscapeProgress(storage);assert.ok(again.noteFound('level-note:meadow:1')&&again.noteRead('level-note:meadow:1'));
  data.set('sallys-escape-progress-v1',JSON.stringify({...JSON.parse(data.get('sallys-escape-progress-v1')),notes:['level-note:meadow:1','<bad>',7,'level-note:x:9']}));
  assert.deepEqual(new EscapeProgress(storage).data.notes,['level-note:meadow:1']);
});
