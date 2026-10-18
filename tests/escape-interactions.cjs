const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js'),{escapeBuildCustom}=require('../public/escape-levels.js');
const level=(map,extra={})=>escapeBuildCustom({id:'t',name:'t',brief:'',hint:'',pebbles:3,tongues:3,...extra,map});
const run=(g,s,i={})=>{for(let k=0;k<s*120;k++)g.advance(1/120,i);};
const face=(g,x,y)=>{g.player.facing={x,y};g.player.tongueAim={x,y};};

test('a pebble that hits a creature bonks it: dazed, then it goes to look where the pebble came from',()=>{
  const g=new EscapeAdventure({level:level(['###########','#@........#','#.........#','#X.......K#','###########'],{guards:[{spawn:[4,1],facing:0,patrol:[[4,1],[4,2]]}]})}),h=g.hunters[0];
  face(g,1,0);assert.equal(g.throwDecoy(0),true);run(g,.4);
  assert.equal(h.state,'steamed');assert.equal(g.bonks,1);assert.equal(g.decoy,null,'a bonked pebble makes no lure');
  run(g,1.2);assert.ok(['search','chase'].includes(h.state),h.state);assert.ok(Math.hypot(h.lastKnown.x-1.5,h.lastKnown.y-1.5)<.3,'it heads for where the throw came from');
});
test('a pebble thrown into water splashes and sinks; hunters come to the bank, and an eel darts at the ripples',()=>{
  const g=new EscapeAdventure({level:level(['###########','#@.~~~~...#','#..~~~~...#','#X.~~~~..K#','###########'],{guards:[{kind:'eel',spawn:[4,2],facing:0,patrol:[[4,2]]}]})});
  face(g,1,0);assert.equal(g.throwDecoy(0),true);const events=[];for(let k=0;k<70;k++){g.advance(1/120,{});events.push(...g.drainEvents());}
  assert.ok(events.includes('splash'));assert.ok(g.decoy&&!g.water(g.decoy),'the lure is on the bank');assert.equal(g.decoy.range,7);
  assert.ok(['ripple','lunge','sulk'].includes(g.hunters[0].state),'the eel went for the splash');
});
test('the ground decides how far a landing pebble carries: gravel far, leaves and mud near, moss hardly at all',()=>{
  const range=row=>{const g=new EscapeAdventure({level:level(['########',row,'#X....K#','########'],{guards:[]})});face(g,1,0);g.throwDecoy(0);run(g,.8);return g.decoy?.range;};
  assert.equal(range('#@.NNN.#'),12);assert.equal(range('#@.LLL.#'),5);assert.equal(range('#@.MMM.#'),5);assert.equal(range('#@.mmm.#'),2.5);assert.equal(range('#@.....#'),9);
});
test('the tongue flicks out even with nothing to grab, and that costs no grab',()=>{
  const g=new EscapeAdventure({level:level(['#########','#@......#','#X.....K#','#########'],{guards:[]})});face(g,1,0);
  assert.equal(g.useTongue(),false);assert.equal(g.tongue?.kind,'miss');assert.equal(g.tongues,3);assert.ok(g.drainEvents().includes('thwip'));
  run(g,.5);assert.equal(g.tongue,null);
});
test('the tongue snatches an insect: a cricket eaten chirps no more',()=>{
  const g=new EscapeAdventure({level:level(['##########','#@.......#','#X......K#','##########'],{guards:[{kind:'cricket',spawn:[3,1],facing:Math.PI,patrol:[[3,1]]}]})}),c=g.hunters[0];face(g,1,0);
  assert.equal(g.useTongue(),true);run(g,.3);assert.equal(c.eaten,true);assert.equal(g.insectsEaten,1);
  const alarms=g.alarms;g.player.x=6.5;run(g,4);assert.equal(g.alarms,alarms,'no chirp after it is eaten');
});
test('the tongue flicks a gate switch from a few tiles away',()=>{
  const g=new EscapeAdventure({level:level(['#########','#@......#','#####.###','#X....K.#','#########'],{guards:[],gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[4,1],tiles:[[5,2]]}]})});face(g,1,0);
  assert.equal(g.gates[0].open,false);assert.equal(g.useTongue(),true);run(g,.3);assert.equal(g.gates[0].open,true);
});
