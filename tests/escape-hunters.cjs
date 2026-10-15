const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');
function ticks(g,s,input={}){for(let n=0;n<Math.ceil(s*120);n++)g.advance(1/120,input);}
// An open 15×11 arena with one hunter; the key and hatch are tucked away so they never interfere.
function arena(kind,at,player,extra={}){
  const g=new EscapeAdventure();for(let y=1;y<g.height-1;y++)for(let x=1;x<g.width-1;x++)g.grid[y][x]='.';
  g.key={x:15.5,y:11.5};g.exit={x:1.5,y:11.5};g.loot=[];
  const h=g.makeHunter({kind,spawn:at,facing:0,patrol:[at],...extra});g.hunters=[h];g.hunter=h;g.motion.resetHunter(h,0);h.pauseUntil=100;
  Object.assign(g.player,{x:player[0]+.5,y:player[1]+.5});return {g,h};
}

test('the beetle locks a lane toward where Sally is heading, then charges up to three tiles past its aim',()=>{
  const {g,h}=arena('beetle',[2,5],[6,3]);ticks(g,.62,{y:1});assert.equal(h.state,'windup');
  const direct=Math.atan2(g.player.y-h.y,g.player.x-h.x);assert.ok(h.facing>direct+.05,'it aims ahead of Sally, not at her');
  const lane=h.facing;ticks(g,.5,{y:-1});assert.equal(h.facing,lane,'the lane never steers once locked');
  ticks(g,3,{});assert.ok(h.x>8,'the charge runs past the aim point');assert.ok(h.x<12.5,'but no further than three tiles past it');
});
test('stepping out of the lane dodges the charge, and a dazed beetle is harmless to touch',()=>{
  const {g,h}=arena('beetle',[9,5],[13,5]);ticks(g,.62);assert.equal(h.state,'windup');ticks(g,.5,{y:-1});ticks(g,1);assert.equal(g.status,'playing');assert.equal(h.state,'stunned','it hits the far wall');
  Object.assign(g.player,{x:h.x,y:h.y-.3});ticks(g,.1);assert.equal(g.status,'playing','touching a dazed beetle is safe');
});
test('standing in the lane is a catch, with a wider hit than a walking guard',()=>{
  const {g,h}=arena('beetle',[2,5],[8,5]);Object.assign(h,{state:'charge',facing:0,phaseUntil:3});g.player.y=5.5+.55;ticks(g,1);assert.equal(g.status,'caught');
});
test('a charge flattens leaf cover and smashes a cracked wall open for everyone, but never the border',()=>{
  const {g,h}=arena('beetle',[2,5],[2,9]);g.grid[5][7]='L';for(let y=1;y<g.height-1;y++)g.grid[y][11]='#';g.grid[5][11]='B';
  Object.assign(h,{state:'charge',facing:0,phaseUntil:3});ticks(g,1.5);assert.equal(g.grid[5][7],'.');assert.equal(g.grid[5][11],'.');assert.equal(h.state,'stunned');assert.ok(g.route(h,{x:13.5,y:5.5},h).length>0,'hunters can now path through the gap');assert.ok(g.drainEvents().includes('smash'));
  const edge=arena('beetle',[13,5],[2,9]);edge.g.grid[5][16]='B';Object.assign(edge.h,{state:'charge',facing:0,phaseUntil:3});ticks(edge.g,1);assert.equal(edge.g.grid[5][16],'B');
});
test('a scorpion with its tail up stings where Sally is heading; changing direction escapes',()=>{
  const caught=arena('scorpion',[5,3],[6,3]);ticks(caught.g,.05,{y:1});assert.equal(caught.h.state,'windup');ticks(caught.g,.7,{y:1});assert.equal(caught.g.status,'caught');assert.match(caught.g.result.message,/scorpion struck/);
  const {g,h}=arena('scorpion',[5,3],[6,3]);ticks(g,.05,{y:1});assert.equal(h.state,'windup');ticks(g,.8,{y:-1});assert.equal(g.status,'playing');
});
test('with its tail down, the scorpion must raise it first, so a quick crossing gets through',()=>{
  const {g,h}=arena('scorpion',[5,5],[8,8],{offset:2.5});assert.ok(!h.tailUp);Object.assign(g.player,{x:6.2,y:6.9});ticks(g,.05);assert.equal(h.state,'raise');
  ticks(g,.55,{x:1,sprint:true});assert.equal(g.status,'playing');assert.notEqual(h.state,'windup','Sally left the ring before the tail was up');
});
test('the strike ring follows the scorpion, but leaf cover inside it keeps Sally safe',()=>{
  const {g,h}=arena('scorpion',[5,5],[6,5]);g.grid[5][6]='L';ticks(g,1);assert.equal(g.player.hidden,true);assert.equal(g.status,'playing');assert.notEqual(h.state,'windup');
});
test('a buried scorpion waits unseen until Sally is close, then bursts out with its tail up',()=>{
  const {g,h}=arena('scorpion',[5,5],[10,5],{buried:true});ticks(g,1);assert.equal(h.state,'buried');assert.equal(g.alarms,0);
  g.player.x=7.2;ticks(g,.02);assert.equal(h.state,'emerge');ticks(g,.4);assert.ok(h.tailUp);
});
test('walls stop stings, and after a sting the scorpion rests with its tail down',()=>{
  for(const blocked of [true,false]){const {g,h}=arena('scorpion',[4,3],[6,3]);h.state='sting';h.phaseUntil=1;h.aim={...g.player};if(blocked)g.grid[3][6]='#';else{h.x=1.5;h.aim.x=7.5;h.reach=2.2;}ticks(g,.02);assert.equal(g.status,'playing');}
  const {g,h}=arena('scorpion',[5,3],[9,9]);h.state='sting';h.phaseUntil=0;h.aim={x:9.5,y:3.5};ticks(g,.02);assert.equal(h.state,'recover');const at={x:h.x,y:h.y};ticks(g,.9);assert.deepEqual({x:h.x,y:h.y},at);assert.equal(h.tailUp,false);
});
test('a sting captures before same-frame key or hatch rewards, and pause freezes the strike',()=>{
  const {g,h}=arena('scorpion',[5,3],[6,3]);h.state='sting';h.aim={...g.player};h.phaseUntil=1;g.key={...g.player};g.exit={...g.player};g.exitHold=.549;ticks(g,.01);assert.equal(g.status,'caught');assert.equal(g.hasKey,false);
  const b=arena('scorpion',[5,3],[6,3]);ticks(b.g,.05);b.g.paused=true;const snapshot=JSON.stringify(b.h),time=b.g.elapsed;ticks(b.g,2);assert.equal(JSON.stringify(b.h),snapshot);assert.equal(b.g.elapsed,time);
});

test('a toad fires its tongue down a clear line, and a pillar in the way blocks the shot',()=>{
  const {g,h}=arena('toad',[2,5],[6,5]);ticks(g,.5);assert.equal(h.state,'windup');ticks(g,.85);assert.equal(g.status,'caught');assert.match(g.result.message,/toad/);
  const safe=arena('toad',[2,5],[6,5]);ticks(safe.g,.5);assert.equal(safe.h.state,'windup');safe.g.grid[5][4]='#';ticks(safe.g,.6);assert.equal(safe.g.status,'playing');assert.ok(safe.h.tongueLength<2.1||safe.h.state==='recover');
});
test('stepping off the tongue line dodges it, and the toad then rests',()=>{
  const {g,h}=arena('toad',[2,5],[6,5]);ticks(g,.5);assert.equal(h.state,'windup');ticks(g,.6,{y:-1,sprint:true});assert.equal(g.status,'playing');ticks(g,.3);assert.equal(h.state,'recover');
});
test('a spider leaves lasting tripwire webs on its rounds; plucking one sends it rushing',()=>{
  const {g,h}=arena('spider',[3,3],[13,9],{patrol:[[3,3],[10,3]]});h.pauseUntil=0;ticks(g,9);const trips=g.webs.filter(w=>w.trip);assert.ok(trips.length>=2,'webs build up along its patrol');assert.ok(trips.every(w=>w.expires===Infinity));
  const web=trips.at(-1);Object.assign(g.player,{x:web.x,y:web.y+.3});ticks(g,.05);assert.equal(h.state,'rush');assert.ok(g.alarms>0);
});
test('a spider keeps at most five tripwires, dropping the oldest',()=>{
  const {g,h}=arena('spider',[1,1],[15,11],{patrol:[[1,1],[14,1],[14,10],[1,10]]});h.pauseUntil=0;ticks(g,40);assert.ok(g.webs.filter(w=>w.trip).length<=5);
});
test('a cricket is harmless but its chirp draws a nearby snake to the spot',()=>{
  const {g,h}=arena('cricket',[5,5],[7,5]);const snake=g.makeHunter({kind:'snake',spawn:[11,7],facing:Math.PI,patrol:[[11,7]]});g.hunters.push(snake);g.motion.resetHunter(snake,1);
  Object.assign(g.player,{x:h.x+.2,y:h.y});ticks(g,.1);assert.equal(g.status,'playing','touching a cricket is safe');
  Object.assign(g.player,{x:7.5,y:5.5});ticks(g,.6);assert.ok(g.decoy?.chirp,'the chirp works like a pebble');Object.assign(g.player,{x:2.5,y:10.5});g.grid[10][2]='L';ticks(g,2);assert.ok(Math.hypot(snake.x-7.5,snake.y-5.5)<Math.hypot(11.5-7.5,7.5-5.5)-1,'the snake heads for the chirp');
});
test('a moth lights Sally up: leaves stop hiding her and hunters see further',()=>{
  const {g,h}=arena('snake',[2,5],[8,5]);h.facing=0;g.grid[5][8]='L';ticks(g,.1);assert.equal(g.player.hidden,true);assert.equal(g.seesPlayer(h),false);
  const moth=g.makeHunter({kind:'moth',spawn:[9,5],facing:0,patrol:[[9,5]]});g.hunters.push(moth);g.motion.resetHunter(moth,1);assert.equal(g.lit(),true);assert.equal(g.seesPlayer(h),true);
});
test('a mimic looks like treasure until Sally reaches for it, then snaps where she is heading',()=>{
  const {g,h}=arena('mimic',[8,5],[3,5]);h.state='rooted';ticks(g,.5);assert.equal(h.state,'rooted','it waits quietly at a distance');
  Object.assign(g.player,{x:7,y:5.5});ticks(g,.05);assert.equal(h.state,'reveal');ticks(g,.6);assert.equal(g.status,'caught');
});
test('an owl swoop bends toward Sally, but leaf cover makes it miss',()=>{
  const {g,h}=arena('owl',[2,5],[7,5]);h.state='glare';h.phaseUntil=0;h.aim={x:7.5,y:5.5};h.perch={x:2.5,y:5.5};ticks(g,.02);
  const start={...h.aim};ticks(g,.3,{y:1});assert.ok(h.aim.y>start.y+.3,'the swoop follows her');
  const hide=arena('owl',[2,5],[7,5]);hide.h.state='glare';hide.h.phaseUntil=0;hide.h.aim={x:7.5,y:5.5};hide.h.perch={x:2.5,y:5.5};hide.g.grid[7][7]='L';Object.assign(hide.g.player,{x:7.5,y:7.5});ticks(hide.g,2);assert.equal(hide.g.status,'playing');
});
test('bonus glow bugs only appear when the game rolls them, drift inside their tiles, and are caught by touch or tongue',()=>{
  const plain=new EscapeAdventure({levelId:'quiet-vault'});assert.equal(plain.glowbugs.length,0);
  const a=new EscapeAdventure({levelId:'quiet-vault',glowbugs:42}),b=new EscapeAdventure({levelId:'quiet-vault',glowbugs:42});
  assert.ok(a.glowbugs.length>=3&&a.glowbugs.length<=5);assert.deepEqual(a.glowbugs.map(g=>g.home),b.glowbugs.map(g=>g.home),'a seed places the same bugs');
  const start={x:a.player.x,y:a.player.y};for(const bug of a.glowbugs){assert.ok(Math.hypot(bug.home.x-start.x,bug.home.y-start.y)>=4);assert.ok(a.floor(Math.floor(bug.home.x),Math.floor(bug.home.y)));}
  a.hunters=[];for(let i=0;i<240;i++)a.advance(1/120,{});for(const bug of a.glowbugs){assert.equal(Math.floor(bug.x),Math.floor(bug.home.x));assert.equal(Math.floor(bug.y),Math.floor(bug.home.y));}
  const first=a.glowbugs[0];Object.assign(a.player,{x:first.x,y:first.y});a.advance(1/120,{});assert.equal(first.caught,true);assert.equal(a.glowbugsCaught,1);assert.ok(a.drainEvents().includes('glowbug'));
  const second=a.glowbugs[1];a.tongues=1;Object.assign(a.player,{x:second.x-1.5,y:second.y,facing:{x:1,y:0},tongueAim:null});a.grid[Math.floor(second.y)][Math.floor(second.x-1)]='.';
  assert.equal(a.useTongue(),true);for(let i=0;i<30;i++)a.advance(1/120,{});assert.equal(second.caught,true);assert.equal(a.glowbugsCaught,2);
});
function cobraArena(){const g=new EscapeAdventure();for(let y=2;y<=7;y++)for(let x=2;x<=13;x++)g.grid[y][x]='.';const h=g.hunter;Object.assign(h,g.makeHunter({kind:'cobra',spawn:[4,4],facing:0,patrol:[[4,4]]}));g.hunters=[h];g.motion.resetHunter(h,0);Object.assign(g.player,{x:7.5,y:4.5});return {g,h};}
test('the king cobra waits coiled, rears on sight, strikes along its aim, and a sidestep during the rear survives',()=>{
  const {g,h}=cobraArena();assert.equal(h.state,'coiled');const states=new Set();for(let i=0;i<240&&g.status==='playing';i++){g.advance(1/120,{});states.add(h.state);}
  assert.ok(states.has('rear')&&states.has('strike'));assert.equal(g.status,'caught');assert.match(g.result.message,/king cobra/);
  const d=cobraArena();for(let i=0;i<120*3&&d.g.status==='playing';i++){if(d.h.state==='rear'||d.h.state==='strike')d.g.advance(1/120,{y:1,sprint:true});else d.g.advance(1/120,{});if(d.h.state==='chase')break;}
  assert.equal(d.g.status,'playing','a sidestep while it rears dodges the strike');assert.equal(d.h.state,'chase','then it hunts');assert.equal(d.g.alarms,1);
});
test('a king cobra chases faster than a snake, then glides home and coils when it loses Sally',()=>{
  const run=kind=>{const {g,h}=cobraArena();h.kind=kind;g.player.hidden=true;g.grid[4][7]='L';Object.assign(g.player,{x:7.5,y:4.5});Object.assign(h,{state:'chase',awareness:1,lastKnown:{x:12.5,y:4.5},lastObserved:g.elapsed});const x=h.x;g.advance(.5,{});return h.x-x;};
  assert.ok(run('cobra')>run('snake')*1.12,'faster than a snake');
  const {g,h}=cobraArena();Object.assign(h,{state:'chase',awareness:1,lastKnown:{x:9.5,y:2.5},lastObserved:g.elapsed});
  g.player.hidden=true;Object.assign(g.player,{x:2.5,y:7.5});g.grid[7][2]='L';for(let i=0;i<120*20;i++)g.advance(1/120,{});assert.equal(h.state,'coiled');assert.ok(Math.hypot(h.x-h.post.x,h.y-h.post.y)<.2);
});
test('brushing the back half of a resting snake wakes it, while passing well clear does not',()=>{
  const g=new EscapeAdventure();for(let y=2;y<=7;y++)for(let x=2;x<=13;x++)g.grid[y][x]='.';const h=g.hunter;g.hunters=[h];Object.assign(h,{x:10.5,y:4.5,facing:0,patrol:[{x:10.5,y:4.5}],pauseUntil:1000,state:'patrol'});g.motion.resetHunter(h,0);
  const tail=g.motion.snakes[0].joints.at(-2);Object.assign(g.player,{x:tail.x,y:tail.y+1.5,facing:{x:0,y:1}});g.advance(.1,{});assert.notEqual(h.reason,'touched');
  Object.assign(g.player,{x:tail.x,y:tail.y});g.advance(1/120,{});assert.equal(h.reason,'touched');assert.equal(h.awareness,1);assert.ok(h.lastKnown);assert.match(g.message,/tail/);
});

// The angler sits under water at (7,6) with its lure glowing over the floor at (7,4).
function anglerArena(player){const r=arena('angler',[7,6],player,{lure:[7,4]});r.g.grid[6][7]='~';r.g.hasTail=false;return r;}
test('walking up to an angler lure springs the angler, which snaps where the lure hung',()=>{
  const {g,h}=anglerArena([3,4]);assert.equal(h.state,'lurking');
  for(let i=0;i<120*3&&g.status==='playing';i++)g.advance(1/120,{x:1});
  assert.equal(g.status,'caught');assert.match(g.result.message,/angler/);
});
test('a tongue grab at a lure makes the angler lunge, a quick sidestep survives, and the lure relights later',()=>{
  const {g,h}=anglerArena([4,4]);g.tongues=1;g.player.facing={x:1,y:0};g.player.tongueAim={x:1,y:0};
  assert.equal(g.tongueTarget().kind,'lure');assert.ok(g.useTongue());
  for(let i=0;i<120*.2;i++)g.advance(1/120,{});assert.equal(h.state,'snap');assert.equal(g.alarms,1);
  for(let i=0;i<120*.6;i++)g.advance(1/120,{y:-1,sprint:true});
  assert.equal(g.status,'playing');assert.equal(h.state,'sink');
  ticks(g,3.6);assert.equal(h.state,'lurking');
});
test('standing still where the tongue grab started is caught by the lunge',()=>{
  const {g,h}=anglerArena([4,4]);g.tongues=1;g.player.facing={x:1,y:0};g.player.tongueAim={x:1,y:0};g.useTongue();
  ticks(g,1);assert.equal(g.status,'caught');assert.equal(h.state,'sink');
});
test('a pebble that lands by the lure springs the angler harmlessly',()=>{
  const {g,h}=anglerArena([3,4]);g.decoy={x:7.3,y:4.6,expires:5};ticks(g,.5);assert.equal(h.state,'sink');assert.equal(g.status,'playing');
});

test('a flytrap snaps where Sally is heading when she comes within reach, then chews and lets her pass',()=>{
  const {g,h}=arena('flytrap',[7,4],[3,4]);assert.equal(h.state,'open');
  for(let i=0;i<120*3&&g.status==='playing';i++)g.advance(1/120,{x:1});assert.equal(g.status,'caught');assert.match(g.result.message,/flytrap/);
  const b=arena('flytrap',[7,4],[3,4]);b.g.decoy={x:7.5,y:5.5,expires:5};ticks(b.g,.5);assert.equal(b.h.state,'chew');
  for(let i=0;i<120*1.5&&b.g.status==='playing';i++)b.g.advance(1/120,{x:1,sprint:true});assert.equal(b.g.status,'playing');assert.ok(b.g.player.x>8);
});
function vineArena(){const r=arena('snake',[12,8],[3,4]);r.g.vines=[{x:5,y:4,key:'5,4',readyAt:0,holding:false}];r.h.facing=Math.PI;r.h.pauseUntil=100;return r;}
test('a tangle vine holds Sally for a moment and lets her go when nothing sees her',()=>{
  const {g,h}=vineArena();Object.assign(h,{x:12.5,y:9.5,facing:0});
  ticks(g,.9,{x:1});assert.ok(g.heldBy);const x=g.player.x;ticks(g,1,{x:1});assert.equal(g.player.x,x,'held still');
  ticks(g,.8,{x:1});assert.equal(g.heldBy,null);assert.ok(g.player.x>x+.5);assert.equal(g.status,'playing');
  // It withers for a while, so stepping back across it is safe at once.
  ticks(g,.6,{x:-1});assert.equal(g.heldBy,null);
});
test('a hunter that sees Sally in a vine catches her; a spare tail tears her free instead',()=>{
  // A snake resting on its post three tiles past the vine, looking straight at it.
  const watched=()=>{const r=arena('snake',[8,4],[3,4]);r.h.facing=Math.PI;r.g.player.hidden=true;r.g.vines=[{x:5,y:4,key:'5,4',readyAt:0,holding:false}];return r;};
  const {g}=watched();g.hasTail=false;Object.assign(g.player,{x:5.5,y:4.5});ticks(g,.05);assert.equal(g.status,'caught');assert.match(g.result.message,/vine/);
  const b=watched();b.g.tailDrop=true;b.g.hasTail=true;Object.assign(b.g.player,{x:5.5,y:4.5});ticks(b.g,.05);assert.equal(b.g.heldBy,null);assert.equal(b.g.tailsDropped,1);
});

test('a crack lets Sally slip through a wall, but a chasing snake can neither follow nor see into it',()=>{
  const {g,h}=arena('snake',[3,4],[6,4]);for(let y=1;y<g.height-1;y++)g.grid[y][8]='#';g.grid[4][8]='S';
  assert.ok(g.fits({x:8.5,y:4.5}),'Sally fits');assert.ok(!g.fits({x:8.5,y:4.5},.22,h),'the snake does not');
  assert.deepEqual(g.route(h,{x:10.5,y:4.5},h),[]);Object.assign(g.player,{x:8.5,y:4.5});assert.ok(!g.clear(h,g.player,true),'no sight into the crack');
  Object.assign(g.player,{x:6.5,y:4.5});Object.assign(h,{state:'chase',awareness:1,lastKnown:copyOf(g.player),lastObserved:0,pauseUntil:0});
  ticks(g,1.6,{x:1});assert.equal(g.status,'playing');assert.ok(g.player.x>9,'Sally is through');assert.ok(h.x<8,'the snake stays behind the wall');
});
function copyOf(p){return {x:p.x,y:p.y};}
test('a heavy plate ignores Sally and opens only under a beetle, for its duration',()=>{
  const {g,h}=arena('beetle',[3,8],[6,4]);g.gates=[{id:'slab',name:'Slab door',heavy:true,plates:[{x:3.5,y:8.5}],tiles:[[10,4]],duration:4,open:false,sealed:false,activations:0,expiresAt:null,closingAt:null,color:[1,2,3]}];g.grid[4][10]='G';
  Object.assign(g.player,{x:3.5,y:8.5});Object.assign(h,{x:12.5,y:10.5});g.activateSwitches();assert.equal(g.gates[0].open,false,'Sally is too light');
  Object.assign(g.player,{x:6.5,y:4.5});Object.assign(h,{x:3.5,y:8.5});g.activateSwitches();assert.equal(g.gates[0].open,true,'the beetle presses it');
  Object.assign(h,{x:12.5,y:10.5});g.updateHunter=()=>{};ticks(g,5);assert.equal(g.gates[0].open,false,'and it closes again');
});
