const test=require('node:test'),assert=require('node:assert/strict');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const make=(map,guards,extra={})=>new EscapeAdventure({level:escapeBuildCustom({id:'c',name:'c',brief:'',pebbles:1,guards,map,...extra})});
function run(g,input,seconds){for(let i=0;i<Math.round(seconds*120);i++)g.advance(1/120,input);return g;}
const PI=Math.PI;

test('an echo frog croaks Sally’s noise back from where it sits, and a snake goes to the frog',()=>{
  const g=make(['##############','#@NNNN......K#','#............#','#X...........#','##############'],[{kind:'echofrog',spawn:[6,1],facing:0,patrol:[[6,1]]},{spawn:[10,3],facing:0,patrol:[[10,3],[12,3]]}]);
  run(g,{x:1,y:0},.4);assert.equal(g.hunters[0].state,'swell','the crunch on gravel fills its throat');
  run(g,{},2);assert.ok(g.decoy?.croak,'it croaks');assert.ok(Math.abs(g.decoy.x-6.5)<.01,'from where it sits');
  run(g,{},1);assert.equal(g.hunters[1].state,'decoy','the snake goes to look');
  assert.equal(g.status,'playing');
});

test('an echo frog is harmless, rests after croaking, and echoes a pebble too',()=>{
  const g=make(['##############','#@..........K#','#............#','#X...........#','##############'],[{kind:'echofrog',spawn:[2,1],facing:0,patrol:[[2,1]]}]);
  g.player.x=2.5;run(g,{},1);assert.equal(g.status,'playing','touching it is safe');
  g.player.x=6.5;g.player.facing={x:-1,y:0};assert.equal(g.throwDecoy(),true);run(g,{},.05);assert.equal(g.hunters[0].state,'swell','a pebble’s clack nearby');
  run(g,{},2.7);assert.equal(g.hunters[0].state,'listen');g.decoy=null;g.player.x=3.5;run(g,{x:0,y:1,sprint:true},.3);assert.equal(g.hunters[0].state,'listen','it rests a while');
});

test('a chameleon creeps a little slower than a snake and pauses long at each end',()=>{
  const map=['################','#@............K#','#..............#','#X.............#','################'],patrol=[[2,2],[13,2]];
  const snake=make(map,[{spawn:[13,2],facing:PI,patrol}]),cham=make(map,[{kind:'chameleon',spawn:[13,2],facing:PI,patrol}]);
  for(const g of [snake,cham]){g.player.x=1.5;g.player.y=3.5;g.player.hidden=true;}
  run(snake,{},2);run(cham,{},2);assert.ok(cham.hunters[0].x>snake.hunters[0].x,'slower');
  assert.ok(cham.hunters[0].movedAt>0,'the scene can tell when it last moved');
});

test('a frost sentinel’s gaze glances off ice walls round a corner, glints, then freezes Sally and calls the hunters',()=>{
  // An open hall with a stone pillar; the sentinel looks down-right at the east wall, which is ice.
  const ice=['############I','#@..........I','#...........I','#.....##....I','#.....##....I','#X.........KI','############I'],stone=ice.map(r=>r.replace(/I/g,'#'));
  const guards=[{kind:'sentinel',spawn:[1,1],facing:.45,range:12,patrol:[[1,1]]},{spawn:[1,5],facing:0,patrol:[[1,5]]}];
  const seenAt=(map,x,y)=>{const g=make(map,guards.slice(0,1));g.player.x=x+.5;g.player.y=y+.5;return g.sentinelBeams(g.hunters[0]).seen;};
  let spot=null;for(let y=1;y<6&&!spot;y++)for(let x=1;x<12&&!spot;x++)if(seenAt(ice,x,y)&&!seenAt(stone,x,y))spot=[x,y];
  assert.ok(spot,'some tile is seen only by the gaze glancing off the ice');
  const g=make(ice,guards);g.player.x=spot[0]+.5;g.player.y=spot[1]+.5;run(g,{},.05);assert.equal(g.hunters[0].state,'glare','a glint of warning first');
  run(g,{},.7);assert.equal(g.hunters[0].state,'cool');assert.ok(g.heldUntil>g.elapsed,'frozen');assert.ok(g.decoy?.chirp,'the crack calls the hunters');
  const x=g.player.x;run(g,{x:-1,y:0},.5);assert.equal(g.player.x,x,'cannot move while frozen');assert.equal(g.status,'playing','the gaze itself never catches her');
  const hid=make(ice.map((r,y)=>y===spot[1]?r.slice(0,spot[0])+'L'+r.slice(spot[0]+1):r),guards.slice(0,1));hid.player.x=spot[0]+.5;hid.player.y=spot[1]+.5;run(hid,{},.2);assert.equal(hid.hunters[0].state,'watch','leaves still hide her');
});

test('a cloud ray glides over walls, and its shadow hides Sally from the hawk and the hunters, even moving',()=>{
  const map=['################','#@............K#','#..............#','#X.............#','################'];
  const g=make(map,[{kind:'cloudray',spawn:[2,2],facing:0,patrol:[[2,2],[13,2]],speed:1.2}],{hawk:{every:9,warn:2,first:20}});
  g.player.x=2.5;g.player.y=2.5;run(g,{x:.3,y:0},.5);assert.equal(g.player.hidden,true,'in the shadow, moving');assert.equal(g.shaded(),true,'the hawk cannot see her');
  run(g,{},6);assert.ok(g.hunters[0].x>8,'it glides on');assert.equal(g.player.hidden,false,'out of the shadow');assert.equal(g.status,'playing','harmless itself');
});

test('the builder knows ice walls, frost sentinels, cloud rays, echo frogs and chameleons',()=>{
  const B=require('../public/escape-builder.js');const m=B.blank(21,13);
  assert.ok(B.paint(m,5,5,'I'));for(const kind of ['sentinel','cloudray','echofrog','chameleon'])assert.ok(B.addEnemy(m,kind,4+['sentinel','cloudray','echofrog','chameleon'].indexOf(kind)*3,8),kind);
  const s=m.guards.find(g=>g.kind==='sentinel');B.setGuard(m,s.id,{looks:[0,Math.PI/2],every:3,range:7});
  assert.deepEqual(B.validate(m),[]);const r=B.toRoute(m);assert.ok(r.map[5].includes('I'));
  const again=B.sanitize(JSON.parse(JSON.stringify(m)));assert.deepEqual(B.toRoute(again),r);
  const g=new EscapeAdventure({level:escapeBuildCustom(r)});assert.equal(g.ice.size,1);assert.equal(g.grid[5][5],'#','ice is a wall');
  assert.equal(g.hunters.find(h=>h.kind==='sentinel').range,7);
});

test('a boogoo whistles and rams Sally from afar, and a ram into a wall leaves it dizzy',()=>{
  const map=['##########','#@......K#','#........#','#X.......#','##########'];
  const g=make(map,[{kind:'boogoo',spawn:[5,1],facing:PI,patrol:[[5,1]]}]),h=g.hunters[0];let wound=false;
  for(let i=0;i<240&&g.status==='playing';i++){g.advance(1/120,{});if(h.state==='windup')wound=true;}
  assert.ok(wound,'it winds up to ram');assert.equal(g.status,'caught');assert.match(g.message,/rammed/);
  const dodge=make(map,[{kind:'boogoo',spawn:[5,1],facing:PI,patrol:[[5,1]]}]),b=dodge.hunters[0];
  for(let i=0;i<360&&b.state!=='charge';i++)dodge.advance(1/120,{});assert.equal(b.state,'charge');
  for(let i=0;i<240&&b.state==='charge';i++){dodge.player.y=3.5;dodge.advance(1/120,{});}
  assert.equal(dodge.status,'playing','Sally stepped out of the lane');assert.equal(b.state,'stunned','it hit the wall');
});
test('up close a boogoo swings its arms forward and swipes its claws instead of ramming; backing away escapes the swipe',()=>{
  const map=['##########','#@.....K.#','#........#','#X.......#','##########'];
  const g=make(map,[{kind:'boogoo',spawn:[3,1],facing:PI,patrol:[[3,1]]}]),h=g.hunters[0],seen=new Set();
  for(let i=0;i<480&&g.status==='playing';i++){g.advance(1/120,{});seen.add(h.state);}
  assert.ok(seen.has('raise')&&seen.has('swipe'),'it rears, then swipes');assert.ok(!seen.has('charge'),'no ram at close range');
  assert.equal(g.status,'caught');assert.match(g.message,/claws/);
  const back=make(map,[{kind:'boogoo',spawn:[3,1],facing:PI,patrol:[[3,1]]}]),b=back.hunters[0];
  for(let i=0;i<480&&b.state!=='raise';i++)back.advance(1/120,{});assert.equal(b.state,'raise');
  back.player.y=3.5;back.player.x=b.x-2;
  for(let i=0;i<40;i++)back.advance(1/120,{});assert.equal(back.status,'playing','out of reach when it swipes');
});
test('the builder offers the boogoo, and it plays from a built level',()=>{
  const B=require('../public/escape-builder.js'),m=B.blank(21,13);
  assert.equal(B.ENEMIES.boogoo,'Boogoo');assert.ok(!B.POSTED.has('boogoo'),'it walks a patrol');
  assert.ok(B.addEnemy(m,'boogoo',4,3));assert.equal(m.guards.at(-1).kind,'boogoo');
  const {EscapeBestiary}=require('../public/escape-bestiary.js');assert.ok(EscapeBestiary.byKind('boogoo').hunts);
  assert.ok(!EscapeBestiary.book.some(e=>e.kind==='boogoo'),'builder-only for now: not in the bestiary book');
});
test('cave folk hunt as a pack: the first to spot Sally shouts, and the others fan out to either side of her',()=>{
  const map=['################','#@.............#','#..............#','#..............#','#..............#','#X............K#','################'];
  const g=make(map,[{kind:'cavefolk',spawn:[5,1],facing:PI,patrol:[[5,1]]},{kind:'cavefolk',spawn:[12,4],facing:0,patrol:[[12,4]]},{kind:'cavefolk',spawn:[12,2],facing:0,patrol:[[12,2]]}]);
  let shouted=false;for(let i=0;i<300&&g.hunters[0].state!=='chase';i++){g.advance(1/120,{});if(g.events.includes('shout'))shouted=true;}
  assert.equal(g.hunters[0].state,'chase');assert.ok(shouted||g.hunters[0].shoutAt>=0,'it shouts');
  assert.deepEqual(g.hunters.slice(1).map(h=>h.state),['flank','flank'],'the pack is called in');
  assert.deepEqual(g.hunters.slice(1).map(h=>h.flankSide).sort(),[-1,1],'one to each side');
  run(g,{},6);assert.equal(g.status,'caught');assert.match(g.message,/cave folk/);
});
test('a lone cave folk out of earshot of the shout keeps to its rounds',()=>{
  const map=['##################','#@.......#.......#','#........#.......#','#........#.......#','#X.......#......K#','##################'];
  const g=make(map,[{kind:'cavefolk',spawn:[5,1],facing:PI,patrol:[[5,1]]},{kind:'cavefolk',spawn:[14,2],facing:0,patrol:[[14,2]]}]);
  for(let i=0;i<300&&g.hunters[0].state!=='chase';i++)g.advance(1/120,{});
  assert.equal(g.hunters[0].state,'chase');assert.equal(g.hunters[1].state,'patrol','walled off, it never heard');
});
test('the builder offers cave folk',()=>{
  const B=require('../public/escape-builder.js'),m=B.blank(21,13);assert.equal(B.ENEMIES.cavefolk,'Cave folk');
  assert.ok(B.addEnemy(m,'cavefolk',4,3));assert.ok(B.addEnemy(m,'cavefolk',6,3));
  const {EscapeBestiary}=require('../public/escape-bestiary.js');assert.ok(EscapeBestiary.byKind('cavefolk').hunts);assert.ok(!EscapeBestiary.book.some(e=>e.kind==='cavefolk'));
});
test('cave folk come in colours: unset ones take turns, and a colour picked in the builder plays',()=>{
  const map=['##########','#@.......#','#........#','#X......K#','##########'],at=[[3,2],[4,2],[5,2],[6,2]];
  const g=make(map,at.map(s=>({kind:'cavefolk',spawn:s,facing:0,patrol:[s]})));
  assert.deepEqual(g.hunters.map(h=>h.tint),['orange','blue','green','orange']);
  const B=require('../public/escape-builder.js'),m=B.blank(21,13);B.addEnemy(m,'cavefolk',4,3);const id=m.guards.at(-1).id;
  B.setGuard(m,id,{tint:'blue'});assert.equal(m.guards.at(-1).tint,'blue');B.setGuard(m,id,{tint:'purple'});assert.equal(m.guards.at(-1).tint,undefined,'only the drawn colours');
  B.setGuard(m,id,{tint:'green'});const route=B.toRoute(m);assert.equal(route.guards.find(q=>q.kind==='cavefolk').tint,'green');
});
