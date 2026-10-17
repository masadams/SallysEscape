const test=require('node:test'),assert=require('node:assert/strict');
const L=require('../public/escape-lighting.js');
const {EscapeWorld}=require('../public/escape-world.js');
const {EscapeCatalog,escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');

test('every area, secret spot and the finale has a lighting mood',()=>{
  for(const c of EscapeWorld.chapters)assert.ok(L.MOODS[c.theme],c.theme);
  for(const l of EscapeCatalog.hidden)if(l.secret)assert.ok(L.MOODS['secret:'+l.secret],l.secret);
  for(const k of ['finale','gilded','hollow'])assert.ok(L.MOODS[k]);
  for(const [k,m] of Object.entries(L.MOODS)){assert.equal(m.grade.length,4,k);assert.ok(m.grade[3]>0&&m.grade[3]<.4,k+' grade stays subtle');assert.ok(m.vignette>=0&&m.vignette<.6,k);}
  assert.equal(L.moodFor('nowhere'),null);
});

test('the Road Home warms toward sunset escape by escape',()=>{
  const first=L.moodFor('home',0),last=L.moodFor('home',6);
  assert.ok(last.grade[2]<first.grade[2]&&last.grade[3]>first.grade[3]&&last.wash.alpha>first.wash.alpha);
});

test('light sources: only what Sally can see glows, and the hatch glows once it is open',()=>{
  const map=['##########','#@......K#','#........#','#.......X#','##########'];
  const g=new EscapeAdventure({level:escapeBuildCustom({id:'l',name:'l',brief:'',guards:[],map,warm:[[3,2],[6,3]],explore:true,dark:true,sightRadius:3})});
  const colours=s=>s.map(x=>x.color.join());
  let s=L.lightSources(g);assert.equal(colours(s).filter(c=>c==='255,150,70').length,1,'only the warm stone in sight glows');
  assert.ok(!colours(s).includes('255,215,120'),'the hatch is shut');
  g.hasKey=true;s=L.lightSources(g);assert.ok(!colours(s).includes('255,215,120'),'the hatch is out of sight');
  g.player.x=7.5;g.player.y=2.5;g.updateVisibility(true);s=L.lightSources(g);assert.ok(colours(s).includes('255,215,120'),'open and in sight, it glows');
  g.lights.push({x:7.5,y:2.5,r:2.5,born:g.elapsed,until:g.elapsed+12});s=L.lightSources(g,g.elapsed+11.5);
  const mushroom=s.find(x=>x.color.join()==='120,236,214');assert.ok(mushroom&&mushroom.alpha<.1,'a glow mushroom fades at the end');
});
