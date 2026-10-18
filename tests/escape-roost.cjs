const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');
const {EscapeCatalog,escapeBuildCustom}=require('../public/escape-levels.js');
const B=require('../public/escape-builder.js');
function ticks(g,s,input={}){for(let n=0;n<Math.ceil(s*120);n++)g.advance(1/120,input);}
// An open room built in the builder: Sally on the left, the given creatures placed by the test.
function room(extra={}){const m=B.blank(25,13);B.paint(m,2,6,'@');B.setSettings(m,extra);return m;}

test('the Magpie Roost holds five escapes, every one with bottomless pouches',()=>{
  const roost=EscapeCatalog.hidden.filter(l=>l.secret==='magpie-roost');
  assert.deepEqual(roost.map(l=>l.id),['roost-gate','glint-alley','burrow-warren','seedfall-court','glitter-keep']);
  assert.ok(roost.every(l=>l.unlimited),'every roost escape is unlimited');
  assert.ok(roost.some(l=>l.guards.some(g=>g.kind==='magpie')),'magpies live there');
});
test('with unlimited pouches a pebble never runs out; without, it does',()=>{
  const m=room({unlimited:true});m.pebbles=1;const g=new EscapeAdventure({level:escapeBuildCustom(B.toRoute(m))});g.player.facing={x:1,y:0};
  for(let i=0;i<4;i++){ticks(g,1.5);g.decoy=null;assert.equal(g.throwDecoy(),true,'throw '+(i+1));}
  const plain=room();plain.pebbles=1;const p=new EscapeAdventure({level:escapeBuildCustom(B.toRoute(plain))});p.player.facing={x:1,y:0};
  assert.equal(p.throwDecoy(),true);ticks(p,1.5);p.decoy=null;assert.equal(p.throwDecoy(),false,'an ordinary pouch empties');
});
test('a magpie that sees Sally caws, and the snakes in earshot come for her where she is, not where she stood',()=>{
  const m=room();B.addEnemy(m,'magpie',8,6);B.addEnemy(m,'snake',13,3);const g=new EscapeAdventure({level:escapeBuildCustom(B.toRoute(m))});
  const [bird,snake]=g.hunters;bird.facing=Math.PI;snake.facing=0;Object.assign(g.player,{x:4.5,y:6.5});
  ticks(g,.6);assert.equal(bird.state,'recover','it cawed');assert.equal(snake.state,'chase','the snake heard the call and gives chase');
  assert.ok(Math.hypot(snake.lastKnown.x-g.player.x,snake.lastKnown.y-g.player.y)<.6,'it knows where Sally is');assert.equal(g.decoy,null,'a caw is no lure');
});
test('a magpie flies off to steal a thrown pebble, ending the distraction, and is blind while it is away',()=>{
  const m=room({unlimited:true});B.addEnemy(m,'magpie',12,6);const g=new EscapeAdventure({level:escapeBuildCustom(B.toRoute(m))});const bird=g.hunters[0];bird.facing=0;
  Object.assign(g.player,{x:9.5,y:6.5,facing:{x:1,y:0}});assert.equal(g.throwDecoy(),true);
  let flew=false;for(let i=0;i<240&&g.decoy;i++){g.advance(1/120,{});flew||=bird.state==='fly';}
  assert.ok(flew,'it flew for the pebble');assert.equal(g.decoy,null,'and took it');assert.equal(g.magpieSees(bird),false,'it sees nothing on the wing');
});
test('the builder places magpies and keeps Unlimited pouches through a round trip',()=>{
  const m=room({unlimited:true});assert.ok(B.addEnemy(m,'magpie',10,6));const route=B.toRoute(m);
  assert.equal(route.unlimited,true);assert.equal(route.guards[0].kind,'magpie');assert.deepEqual(route.guards[0].patrol,[route.guards[0].spawn],'a magpie stays on its perch');
  const back=B.fromRoute(route);assert.equal(back.unlimited,true);assert.equal(B.sanitize(JSON.parse(JSON.stringify(back))).unlimited,true);
  B.setSettings(m,{unlimited:false});assert.equal(B.toRoute(m).unlimited,undefined);
});
