const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');const {EscapeCatalog}=require('../public/escape-levels.js');const {EscapeProgress}=require('../public/escape-progress.js');
function ticks(g,seconds,input={}){for(let n=0;n<Math.round(seconds*120);n++)g.advance(1/120,input);}
function steps(){const g=new EscapeAdventure({levelId:'frostbite-steps'});g.tailDrop=false;for(const h of g.hunters){h.patrol=[{x:h.x,y:h.y}];h.x=25.5;h.y=13.5;h.patrol=[{x:25.5,y:13.5}];}return g;}
test('Frost Hollow follows the Lantern Marsh: five routes where only marked rooms are cold',()=>{
  const frost=EscapeCatalog.levels.slice(68,73);assert.deepEqual(frost.map(l=>l.id),['frostbite-steps','icicle-gallery','frozen-plates','snowdrift-vault','winter-heart']);
  assert.equal(frost[0].unlockAfter,'moonwell-keep');for(const l of frost){assert.ok(l.cold.length&&l.warm.length>=4&&l.tailDrop);const g=new EscapeAdventure({levelId:l.id});assert.ok(!g.cold.has(g.tileKey(g.player)),'Sally starts warm');let floor=0,cold=0;for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++)if(g.floor(x,y)){floor++;if(g.cold.has(x+','+y))cold++;}assert.ok(cold/floor<.75,l.id+' keeps warm ground too');}
  assert.ok(EscapeCatalog.levels.filter(l=>l.cold).every(l=>EscapeCatalog.levels.indexOf(l)>=68&&EscapeCatalog.levels.indexOf(l)<73));const p=new EscapeProgress(null);assert.equal(p.unlocked('frostbite-steps'),false);p.data.levels['moonwell-keep']={cleared:true};assert.equal(p.unlocked('frostbite-steps'),true);
});
test('cold rooms drain warmth, sprinting drains it faster, and warm ground or stones thaw Sally',()=>{
  const g=steps();Object.assign(g.player,{x:14.5,y:3.5});ticks(g,2);const walkedCold=g.player.warmth;assert.ok(walkedCold<85&&walkedCold>78);
  const s=steps();Object.assign(s.player,{x:9.5,y:5.5});ticks(s,2,{x:1,sprint:true});assert.ok(s.player.warmth<walkedCold,'sprinting in the cold costs more');
  g.player.warmth=20;Object.assign(g.player,{x:11.5,y:2.5});ticks(g,1);assert.ok(g.player.warmth>60,'warm stones thaw fast');
  const out=steps();out.player.warmth=50;ticks(out,1);assert.ok(Math.abs(out.player.warmth-56)<.1,'ordinary ground warms slowly');
});
test('a chilled Sally is slow and cannot sprint, frozen is slower still, and she warms back up to sprint',()=>{
  const speed=w=>{const g=steps();Object.assign(g.player,{x:9.5,y:3.5,warmth:w,chilled:w<30});g.cold.clear();const x=g.player.x;ticks(g,.5,{x:1,sprint:true});return (g.player.x-x)/.5;};
  const warm=speed(100),chilled=speed(20),frozen=speed(0);assert.ok(warm>3.5,'warm Sally sprints');assert.ok(chilled<2,'chilled Sally cannot sprint');assert.ok(frozen<chilled);
  const g=steps();Object.assign(g.player,{x:14.5,y:3.5});ticks(g,10);assert.equal(g.player.chilled,true);assert.equal(g.status,'playing','the cold never kills by itself');
  Object.assign(g.player,{x:11.5,y:2.5});ticks(g,1.5);assert.equal(g.player.chilled,false);
});
test('cold-blooded hunters crawl on the ice while owls keep their pace, and Keep Warm fails on a chill',()=>{
  const g=new EscapeAdventure({levelId:'frostbite-steps'}),h=g.hunters[0];g.hunters=[h];Object.assign(h,{x:12.5,y:5.5,path:[],targetId:null});const a=h.x;g.moveHunter({x:20.5,y:5.5},1,h);assert.ok(Math.abs(h.x-a-.6)<1e-6);
  const owl={kind:'owl',x:12.5,y:5.5,path:[],targetId:null};g.moveHunter({x:20.5,y:5.5},1,owl);assert.ok(Math.abs(owl.x-13.5)<1e-6);
  const c=new EscapeAdventure({challengeId:'keep-warm'});c.player.chilled=true;c.player.warmth=10;c.cold.clear();c.player.x=c.player.x;c.advance(1/120,{});assert.equal(c.status,'failed');
});
