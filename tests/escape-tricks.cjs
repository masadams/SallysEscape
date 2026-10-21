const test=require('node:test'),assert=require('node:assert/strict');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const make=(map,extra={})=>new EscapeAdventure({level:escapeBuildCustom({id:'trick',name:'Trick',brief:'',guards:[],map,...extra})});
function run(g,input,seconds){for(let i=0;i<Math.round(seconds*120);i++)g.advance(1/120,input);return g;}
const PI=Math.PI;

test('moss muffles every step, even a sprint, and a mole feels nothing through it',()=>{
  const g=make(['############','#@mmmmmmmmK#','#.........X#','############'],{guards:[{kind:'mole',spawn:[6,2],facing:0,patrol:[[6,2]]}]});
  run(g,{x:1,y:0,sprint:true},.4);assert.equal(g.player.sprinting,true);assert.equal(g.player.noisy,false);assert.equal(g.player.loud,false);
  assert.equal(g.moleHears(g.hunters[0]),null);
  const gravel=make(['############','#@NNNNNNNNK#','#.........X#','############']);run(gravel,{x:1,y:0,sprint:true},.4);assert.equal(gravel.player.noisy,true);
});

test('an echo hall carries sound nearly twice as far',()=>{
  const map=['##################','#@...............#','#...............K#','#X...............#','##################'];
  const plain=make(map),hall=make(map,{echoes:[[1,1,16,3]]}),h={x:9.5,y:1.5},p={x:1.5,y:1.5};
  assert.equal(plain.audible(h,p,6),false);assert.equal(hall.audible(h,p,6),true);
});

test('a current carries a swimmer along it',()=>{
  const map=['############','#@~~~~~~~~K#','#.........X#','############'];
  const still=make(map),flow=make(map,{currents:[{area:[2,1,9,1],dir:[1,0],speed:1.2}]});
  for(const g of [still,flow]){g.player.x=2.5;run(g,{},1);}
  assert.equal(still.player.x,2.5);assert.ok(flow.player.x>3.2,'carried '+flow.player.x);
  const against=make(map,{currents:[{area:[2,1,9,1],dir:[-1,0],speed:1.6}]});against.player.x=4.5;run(against,{x:1,y:0},2.5);assert.ok(against.player.x<4.5,'too strong to swim against once it has hold of her: '+against.player.x);
});

test('a burrow pair takes Sally from one mound to the other, safe while underground',()=>{
  const g=make(['############','#@.##.....K#','#..##.....X#','############'],{tunnels:[[[2,1],[6,2]]]});
  g.player.x=2.5;g.player.y=1.5;assert.equal(g.burrow(),true);assert.ok(g.player.underground);run(g,{},.3);
  assert.equal(g.player.hidden,true);assert.equal(g.seesPlayer({x:3,y:1,facing:PI}),false);run(g,{x:1,y:0},.8);
  assert.equal(g.player.underground,null);assert.equal(Math.floor(g.player.x),6);assert.equal(Math.floor(g.player.y),2);assert.equal(g.tunnelsUsed,1);
  assert.equal(g.burrows,0,'a mound needs no burrow charge');
});

test('a spore pouch thrown makes a cloud that hides Sally, even moving, and blinds a hunter in it',()=>{
  const g=make(['############','#@........K#','#.........X#','############'],{spores:1});
  g.player.throwAim={x:1,y:0};assert.equal(g.throwSpore(0),true);assert.equal(g.spores,0);run(g,{},.5);
  assert.equal(g.clouds.length,1);const c=g.clouds[0];g.player.x=c.x;g.player.y=c.y;run(g,{x:0,y:.2},.1);assert.equal(g.player.hidden,true);
  run(g,{},7);assert.equal(g.clouds.length,0,'the cloud fades');assert.equal(g.throwSpore(0),false);
});

test('the builder places moss, echo halls, currents, burrow pairs and spore pouches, and they survive saving',()=>{
  const B=require('../public/escape-builder.js');const m=B.blank(21,13);
  assert.ok(B.paint(m,4,4,'m'));for(let x=3;x<9;x++)B.paint(m,x,8,'~');
  assert.ok(B.addEcho(m,10,2,16,5));assert.ok(B.addCurrent(m,3,8,8,8));B.setCurrent(m,0,{dir:2,speed:1.6});
  assert.ok(B.addTunnel(m,[2,2],[15,9]));assert.equal(B.addTunnel(m,[2,2],[2,2]),false,'a mound needs a partner elsewhere');assert.equal(B.addTunnel(m,[0,0],[3,3]),false,'not in a wall');
  B.setSettings(m,{spores:2});assert.deepEqual(B.validate(m),[]);
  const r=B.toRoute(m);assert.deepEqual(r.echoes,[[10,2,16,5]]);assert.deepEqual(r.currents,[{area:[3,8,8,8],dir:[-1,0],speed:1.6}]);assert.deepEqual(r.tunnels,[[[2,2],[15,9]]]);assert.equal(r.spores,2);assert.ok(r.map[4].includes('m'));
  const again=B.sanitize(JSON.parse(JSON.stringify(m)));assert.deepEqual(B.toRoute(again),r,'saving and loading keeps them');
  assert.equal(B.removeExtraAt(m,2,2),true);assert.equal(m.tunnels.length,0);
  const g=new EscapeAdventure({level:escapeBuildCustom(r)});assert.equal(g.spores,2);assert.equal(g.moss.size,1);assert.equal(g.tunnels.length,1);
});

test('water has weight: a stream builds up, Sally drifts on after leaving it, and a pulsing current surges and eases',()=>{
  const map=['##############','#@~~~~~~~~~~K#','#...........X#','##############'];
  const g=make(map,{currents:[{area:[2,1,5,1],dir:[1,0],speed:1.2}]});g.player.x=2.5;run(g,{},.1);const early=g.player.x-2.5;run(g,{},.6);
  assert.ok(early<.1,'a stream does not shove her to full speed at once: '+early);
  while(g.player.x<6.05)run(g,{},1/60);const out=g.player.x;run(g,{},.4);assert.ok(g.player.x>out+.15,'she drifts on past the end of the stream');const x=g.player.x;run(g,{},2);assert.ok(g.player.x-x<.25,'then the still water lets go');
  const pulse=make(map,{currents:[{area:[2,1,11,1],dir:[1,0],speed:1,pulse:4}]});const speeds=[];for(let i=0;i<8;i++){speeds.push(pulse.flowSpeed(pulse.currents[0]));run(pulse,{},.5);}
  assert.ok(Math.max(...speeds)>1.4&&Math.min(...speeds)<.6,'it surges and eases: '+speeds.map(v=>v.toFixed(2)));
});

test('a pebble that lands in a stream floats away with it',()=>{
  const g=make(['##############','#@~~~~~~~~~~K#','#...........X#','##############'],{currents:[{area:[2,1,11,1],dir:[1,0],speed:1.2}]});
  g.decoy={x:3.5,y:1.5,expires:g.elapsed+3,noticed:false,range:7};run(g,{},1);assert.ok(g.decoy.x>4.4&&g.decoy.floating,'it drifted to '+g.decoy.x);
});

test('mud sucks at a lizard that lingers: she sinks after a moment, moves slower the deeper she is, and walks free',()=>{
  const g=make(['############','#@MMMMMMMMK#','#.........X#','############']);g.player.x=4.5;g.player.y=1.5;
  run(g,{},.8);assert.equal(g.player.sink||0,0,'a short pause is free');run(g,{},1.6);assert.ok(g.player.sink>.5,'lingering sinks her: '+g.player.sink);
  const x=g.player.x;run(g,{x:1,y:0},.3);const stuck=g.player.x-x;const free=make(['############','#@MMMMMMMMK#','#.........X#','############']);free.player.x=4.5;free.player.y=1.5;run(free,{x:1,y:0},.3);
  assert.ok(stuck<(free.player.x-4.5)*.8,'deep mud holds her back: '+stuck.toFixed(2)+' vs '+(free.player.x-4.5).toFixed(2));
  run(g,{x:1,y:0},2);assert.ok(g.player.sink<.1,'keeping on the move pulls her free');
});

test('running through mud splashes loudly; walking or crawling through it does not',()=>{
  const g=make(['############','#@MMMMMMMMK#','#.........X#','############']);g.player.x=3.5;g.player.y=1.5;
  run(g,{x:1,y:0},.3);assert.equal(g.player.noisy,false,'walking is quiet');run(g,{x:1,y:0,sprint:true},.3);assert.equal(g.player.noisy,true,'running splashes');
});
