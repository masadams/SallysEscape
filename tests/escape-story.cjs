const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../public/escape-story.js');require('../public/escape-world.js');const {EscapeCatalog}=require('../public/escape-levels.js');const {EscapeProgress}=require('../public/escape-progress.js');
const chapters=globalThis.EscapeWorld.chapters;

test('every area on the trail has its story card, in order, in three parts',()=>{
  assert.equal(S.AREAS.length,chapters.length);S.AREAS.forEach((a,i)=>assert.equal(a.theme,chapters[i].theme,'card '+(i+1)+' is '+chapters[i].name));
  assert.deepEqual(S.PARTS.map(p=>p.n),[1,2,3]);assert.equal(S.PARTS[0].from,0);
  for(const p of S.PARTS)assert.ok(p.from<chapters.length);
  assert.equal(S.areaCard(8).title,'The Waystone','Part Two opens with the reveal in Luminous Depths');assert.equal(S.partFor(8).n,2);assert.equal(S.partFor(15).n,3);
  assert.ok(S.AREAS.slice(0,8).every(a=>!a.kind),'Part One is Old Moss’s journal');assert.ok(S.AREAS.slice(8).every(a=>a.kind==='map'),'from Part Two the cards are map pages');
});

test('card ids are unique and save safely, and every secret spot and bonus maze has a lost Wayfinder’s note',()=>{
  const ids=S.CARDS.map(c=>c.id);assert.equal(new Set(ids).size,ids.length);for(const id of [...ids,'part:1','part:2','part:3'])assert.match(id,/^[a-z0-9:-]{1,40}$/);
  assert.ok(ids.length+3<=80,'room in the saved list');
  for(const level of EscapeCatalog.hidden){const spot=S.spotFor(level);if(level.id==='the-long-way-home')continue;assert.ok(spot,level.id+' belongs to a spot');assert.ok(S.byId('note:'+spot),'note for '+spot);}
  for(const c of S.CARDS)assert.ok(c.title&&c.body.length&&c.body.every(t=>typeof t==='string'&&t.length>2),c.id);
});

test('a player’s story cards are saved with their progress',()=>{
  const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
  const p=new EscapeProgress(storage);assert.equal(p.storySeen('opening'),false);assert.equal(p.markStory('opening'),true);assert.equal(p.markStory('opening'),false);
  const again=new EscapeProgress(storage);assert.equal(again.storySeen('opening'),true);
  data.set('sallys-escape-progress-v1',JSON.stringify({...JSON.parse(data.get('sallys-escape-progress-v1')),story:['opening','<bad>',42]}));assert.deepEqual(new EscapeProgress(storage).data.story,['opening']);
});
