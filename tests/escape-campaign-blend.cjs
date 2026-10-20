const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');
const B=require('../public/escape-builder.js');
const {EscapeCatalog}=require('../public/escape-levels.js');

// Seasonal and Little Explorers features that now appear in the main campaign, each in one fitting place.
test('the campaign borrows glide ice, a tunnel kit, soft sand and bounce caps',()=>{
  const frost=new EscapeAdventure({levelId:'frostbite-steps'});assert.equal(frost.slippery.size,14);assert.ok(frost.slippery.has('13,5')&&frost.slippery.has('13,9'));
  const ants=new EscapeAdventure({levelId:'marching-tunnels'});assert.equal(ants.diggers,1);
  const sand=new EscapeAdventure({levelId:'sunken-caravan'});assert.ok(sand.softSand.size>=10);
  const lagoon=new EscapeAdventure({levelId:'tideglass-lagoon'});assert.deepEqual(lagoon.caps.map(c=>[c.at,c.to]),[[[7,4],[14,4]],[[14,10],[7,10]]]);
  for(const id of ['frostbite-steps','marching-tunnels','sunken-caravan','tideglass-lagoon'])assert.match(EscapeCatalog.levels.find(l=>l.id===id).hint,/frozen|tunnel kit|sand|caps/i,id);
});
test('entering the frozen lane keeps Sally\'s walking speed and she slides on past where she let go',()=>{
  const g=new EscapeAdventure({levelId:'frostbite-steps'});g.hunters=[];g.player.x=8.5;g.player.y=5.5;
  for(let i=0;i<120;i++)g.advance(1/120,{x:1});assert.ok(g.slippery.has(g.tileKey(g.player)),'reached the ice');
  const speed=Math.hypot(g.slideVelocity.x,g.slideVelocity.y);assert.ok(speed>1.5,'kept her speed: '+speed);
  const at=g.player.x;for(let i=0;i<60;i++)g.advance(1/120,{});assert.ok(g.player.x>at+.6,'still sliding with no input');
});
test('the builder keeps glide ice, so campaign and winter ice survive a round trip',()=>{
  for(const level of [EscapeCatalog.levels.find(l=>l.id==='frostbite-steps'),...EscapeCatalog.seasonal.filter(l=>l.slippery?.length)]){
    const route=B.toRoute(B.sanitize(JSON.parse(JSON.stringify(B.fromRoute(level)))));assert.deepEqual(route.slippery,level.slippery,level.id);}
});
