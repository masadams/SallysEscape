const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');const {EscapeCatalog}=require('../public/escape-levels.js');const {EscapeProgress}=require('../public/escape-progress.js');const {EscapeBestiary}=require('../public/escape-bestiary.js');
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v))};};

test('every creature in the campaign has a bestiary card with a home escape',()=>{
  const homes=EscapeBestiary.homes(EscapeCatalog);
  for(const kind of Object.keys(homes))assert.ok(EscapeBestiary.byKind(kind),'card for '+kind);
  for(const e of EscapeBestiary.entries){assert.ok(e.name&&e.icon&&e.job&&e.hunts&&e.tip,e.kind);assert.ok(e.kind in homes,e.kind+' lives somewhere');}
});
test('coming near a creature marks it met; a buried scorpion or a posing mimic does not count yet',()=>{
  const game=new EscapeAdventure({levelId:EscapeCatalog.levels[0].id});const snake=game.hunters[0];
  snake.x=game.player.x+10;snake.y=game.player.y;game.step(.3,{});assert.equal(game.met?.has('snake')||false,false,'too far away');
  snake.x=game.player.x+3;game.metCheckAt=0;game.noteMet();assert.ok(game.met.has('snake'));
  game.hunters.push({kind:'scorpion',x:game.player.x+1,y:game.player.y,buried:true,state:'patrol'},{kind:'mimic',x:game.player.x+1,y:game.player.y,state:'rooted'});
  game.metCheckAt=0;game.noteMet();assert.equal(game.met.has('scorpion'),false);assert.equal(game.met.has('mimic'),false);
});
test('met creatures are saved once, survive a reload, and junk is ignored',()=>{
  const storage=memory(),progress=new EscapeProgress(storage);
  assert.deepEqual(progress.meet(['snake','beetle','snake']),['snake','beetle']);assert.deepEqual(progress.meet(['snake']),[]);
  const again=new EscapeProgress(storage);assert.deepEqual(again.data.met,['snake','beetle']);
  storage.setItem('sallys-escape-progress-v1',JSON.stringify({version:1,met:['fox','<img>',42,'x'.repeat(40)]}));
  assert.deepEqual(new EscapeProgress(storage).data.met,['fox']);
});
