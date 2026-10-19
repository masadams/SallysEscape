const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../public/escape-story.js');require('../public/escape-world.js');const {EscapeCatalog}=require('../public/escape-levels.js');const {EscapeProgress}=require('../public/escape-progress.js');
const chapters=globalThis.EscapeWorld.chapters;

test('every area on the trail has its story card, in order, in three parts',()=>{
  assert.equal(S.AREAS.length,chapters.length);S.AREAS.forEach((a,i)=>assert.equal(a.theme,chapters[i].theme,'card '+(i+1)+' is '+chapters[i].name));
  assert.deepEqual(S.PARTS.map(p=>p.n),[1,2,3]);assert.equal(S.PARTS[0].from,0);
  for(const p of S.PARTS)assert.ok(p.from<chapters.length);
  assert.equal(S.areaCard(8).title,'The Answering Stone','Part Two opens with the reveal in Luminous Depths');assert.equal(S.partFor(8).n,2);assert.equal(S.partFor(15).n,3);
  assert.ok(S.AREAS.slice(0,8).every(a=>!a.kind),'Part One is Old Moss’s journal');assert.ok(S.AREAS.slice(8).every(a=>a.kind==='map'),'from Part Two the cards are map pages');
});

test('card ids are unique and save safely, and every secret spot and bonus maze has a lost Wayfinder’s note',()=>{
  const ids=S.CARDS.map(c=>c.id);assert.equal(new Set(ids).size,ids.length);for(const id of [...ids,'part:1','part:2','part:3'])assert.match(id,/^[a-z0-9:-]{1,40}$/);
  assert.ok(ids.length+3<=200,'room in the saved list');
  for(const level of EscapeCatalog.hidden){const spot=S.spotFor(level);if(level.id==='the-long-way-home')continue;assert.ok(spot,level.id+' belongs to a spot');assert.ok(S.byId('note:'+spot),'note for '+spot);}
  for(const c of S.CARDS)assert.ok(c.title&&c.body.length&&c.body.every(t=>typeof t==='string'&&t.length>2),c.id);
});

test('a player’s story cards are saved with their progress',()=>{
  const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
  const p=new EscapeProgress(storage);assert.equal(p.storySeen('opening'),false);assert.equal(p.markStory('opening'),true);assert.equal(p.markStory('opening'),false);
  const again=new EscapeProgress(storage);assert.equal(again.storySeen('opening'),true);
  data.set('sallys-escape-progress-v1',JSON.stringify({...JSON.parse(data.get('sallys-escape-progress-v1')),story:['opening','<bad>',42]}));assert.deepEqual(new EscapeProgress(storage).data.story,['opening']);
});

test('the cards are the reviewed manuscript, a few short pages each, with no authoring notes left in',()=>{
  const md=require('fs').readFileSync(require('path').join(__dirname,'../docs/story-revision/NARRATIVE.md'),'utf8');
  for(const c of S.CARDS){assert.ok(c.body.length<=7,c.id+' has '+c.body.length+' pages');
    for(const page of c.body){assert.ok(!/Authoring direction/.test(page),c.id);for(const line of page.split('\n'))assert.ok(md.includes(line),c.id+': '+line.slice(0,50));}}
});
test('four moments come with progress, each just before the area that brings it, and the garden recovers by stage',()=>{
  assert.deepEqual(S.MOMENTS.map(m=>[m.id,chapters[m.opens].name]),[['milestone:small-kindness','Garden Ruins'],['milestone:carry-the-light','Sun and Sea'],['milestone:one-lantern','Sunbaked Rooftops'],['milestone:the-wait','Steam Vents']]);
  for(const m of S.MOMENTS){const at=S.CARDS.findIndex(c=>c.id===m.id);assert.equal(S.CARDS[at+1].id,'area:'+chapters[m.opens].theme);}
  const upTo=n=>({open:i=>i<=n,home:false});
  assert.equal(S.stage(upTo(9)),0);assert.equal(S.stage(upTo(10)),1);assert.equal(S.stage(upTo(13)),2);assert.equal(S.stage(upTo(20)),3);assert.equal(S.stage({open:()=>true,home:true}),4);
});
test('every area has a sign line and a local line, and a local only says the after-line once their area has recovered',()=>{
  assert.equal(S.LOCALS.length,chapters.length);for(const l of S.LOCALS)assert.ok(l.sign&&l.line&&l.after);
  const lantern=chapters.findIndex(c=>c.theme==='lantern');
  assert.equal(S.localLine(lantern,'lantern',1),S.LOCALS[lantern].line);assert.equal(S.localLine(lantern,'lantern',2),S.LOCALS[lantern].after);
  assert.equal(S.localLine(19,'tide',3),S.LOCALS[19].line,'Shelly mentions the bottle only once Sally is home');assert.equal(S.localLine(19,'tide',4),S.LOCALS[19].after);
});
test('what comes after the ending waits for later, and the finale belongs to Home',()=>{
  assert.equal(S.byId('after').later,true);assert.equal(S.byId('burrow:tomorrows-work').later,true);assert.equal(S.byId('finale').later,undefined);
  assert.equal(EscapeCatalog.levels.at(-1).id,'home');
});
