const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeCatalog}=require('../public/escape-levels.js');
const {EscapeWorld}=require('../public/escape-world.js');
const {EscapeProgress}=require('../public/escape-progress.js');

test('every secret spot has a door off the trail that stays shut until its rule is met',()=>{
  const opened=new Set(),w=new EscapeWorld(()=>true,null,()=>false,()=>false,id=>opened.has(id));
  for(const id of Object.keys(EscapeProgress.SECRET_RULES)){const s=w.secrets.find(s=>s.id===id),door=w.secretDoors.find(d=>d.id===id);assert.ok(s&&door,id+' has a door');
    assert.equal(w.floor(door.x+.5,door.y+.5),false,id+' door is shut');assert.equal(w.route({x:s.x+.5,y:s.y+.5}),null,id+' cannot be reached');
    opened.add(id);assert.equal(w.floor(door.x+.5,door.y+.5),true,id+' door opens');}
  // Sally's Burrow opens off the last courtyard, next to escape 100.
  const burrow=w.secretDoors.find(d=>d.id==='sallys-burrow'),home=w.chapters.find(c=>c.theme==='home');assert.ok(Math.abs(burrow.x-home.x)<=9&&Math.abs(burrow.y-home.y)<=7);
});
test('secret escapes stand inside their clearings and can be entered once the spot is open',()=>{
  let open=false;const w=new EscapeWorld(()=>true,null,()=>false,()=>false,()=>open),secret=EscapeCatalog.hidden.filter(l=>l.secret);
  assert.equal(secret.length,9);assert.equal(w.secretNodes.length,9);
  for(const n of w.secretNodes){const s=w.secrets.find(s=>s.id===n.secret);assert.ok(Math.abs(n.x-s.x)<=s.rx&&Math.abs(n.y-s.y)<=s.ry,n.id+' inside '+s.id);assert.equal(w.grid[n.y][n.x],'.');}
  const n=w.secretNodes.find(n=>n.id==='frozen-run');Object.assign(w.player,{x:n.x,y:n.y});assert.equal(w.enter(),null);open=true;assert.equal(w.enter(),'hidden:frozen-run');
  const b=w.secrets.find(s=>s.id==='sallys-burrow');Object.assign(w.player,{x:b.x+.5,y:b.y+.5});assert.equal(w.enter(),'room:sallys-burrow');
});
test('each rule opens its spot: stars, flies, challenges, creatures, caches, mastery, escape 100',()=>{
  const p=new EscapeProgress(null),chapters=EscapeWorld.chapters;
  const star=n=>{let left=n;p.data.levels={};for(const l of EscapeCatalog.levels){if(left<=0)break;const s=Math.min(3,left);p.data.levels[l.id]={cleared:true,stars:s,bestTime:10,treasure:0};left-=s;}};
  assert.equal(p.secretOpen('star-garden',chapters),false);star(100);assert.equal(p.secretOpen('star-garden',chapters),true);
  assert.equal(p.hiddenLevelOpen('moonflower-bed',chapters),true);assert.equal(p.hiddenLevelOpen('starlight-bed',chapters),false,'the second bed wants 200 stars');star(300);assert.equal(p.hiddenLevelOpen('comet-bed',chapters),true);
  p.data.goldflies=24;assert.equal(p.secretOpen('cloud-nest'),false);p.data.goldflies=25;assert.equal(p.secretOpen('cloud-nest'),true);
  for(const c of EscapeCatalog.challenges.slice(0,19))p.data.challenges[c.id]={cleared:true};assert.equal(p.secretOpen('challenge-shrine'),false);p.data.challenges[EscapeCatalog.challenges[19].id]={cleared:true};assert.equal(p.secretOpen('challenge-shrine'),true);
  p.data.met=p.creatureKinds().slice(1);assert.equal(p.secretOpen('bestiary-grove'),false);p.data.met=p.creatureKinds();assert.equal(p.secretOpen('bestiary-grove'),true);
  p.data.caches=['frost-north'];assert.equal(p.secretOpen('ice-cave'),false);p.data.caches.push('frost-south');assert.equal(p.secretOpen('ice-cave'),true);
  assert.equal(p.secretOpen('sunken-wreck',chapters),true,'three stars everywhere masters the Tide Pools');
  assert.equal(p.secretOpen('sallys-burrow'),true);p.data.levels.home=undefined;assert.equal(p.secretOpen('sallys-burrow'),false);
  assert.equal(p.secretOpen('moss-den'),false,'Old Moss is not ready for visitors yet');
});
test('a cracked hedge opens when Sally pushes into it, and stays open',()=>{
  const p=new EscapeProgress(null);let bumped=null;const w=new EscapeWorld(()=>true,null,()=>false,()=>false,id=>p.secretOpen(id));w.onSecretBump=d=>{bumped=d.id;p.openSecret(d.id);};
  const d=w.secretDoors.find(d=>d.id==='mossy-well'),dirs=[[1,0],[-1,0],[0,1],[0,-1]],[dx,dy]=dirs.find(([dx,dy])=>w.floor(d.x+dx+.5,d.y+dy+.5));
  Object.assign(w.player,{x:d.x+dx+.5,y:d.y+dy+.5});for(let i=0;i<30;i++)w.step(1/120,{x:-dx,y:-dy});
  assert.equal(bumped,'mossy-well');assert.equal(p.secretOpen('mossy-well'),true);assert.equal(w.floor(d.x+.5,d.y+.5),true);
  assert.equal(p.openSecret('star-garden'),false,'only cracked hedges give way to a push');
});
