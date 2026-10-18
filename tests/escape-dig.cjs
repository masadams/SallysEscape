const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js'),{escapeBuildCustom,EscapeCatalog}=require('../public/escape-levels.js');
const level=escapeBuildCustom({id:'dig',name:'Dig',brief:'',hint:'',map:['#########','#@.dd..K#','#..dd...#','#X......#','#########'],guards:[{spawn:[6,2],facing:Math.PI,patrol:[[6,2],[6,3]]}]});
const make=()=>{const g=new EscapeAdventure({level});g.player.x=3.5;g.player.y=1.5;return g;},run=(g,s,i={})=>{for(let k=0;k<s*120;k++)g.advance(1/120,i);};

test('holding Burrow on soft dirt digs Sally in after 0.75 s; the digging is noisy',()=>{
  const g=make();run(g,.4,{dig:true});assert.ok(g.player.dig);assert.equal(g.player.dig.buried,false);assert.equal(g.player.noisy,true);assert.equal(g.player.hidden,false);
  run(g,.4,{dig:true});assert.equal(g.player.dig.buried,true);assert.equal(g.player.hidden,true);assert.equal(g.player.noisy,false);assert.equal(g.digs,1);
});
test('dug in, nothing sees or catches Sally, and she cannot move until she lets go',()=>{
  const g=make();run(g,.8,{dig:true});const h=g.hunters[0];h.x=g.player.x;h.y=g.player.y;h.state='chase';
  assert.equal(g.seesPlayer(h),false);run(g,.6,{dig:true,x:1});assert.equal(g.status,'playing');assert.equal(g.player.x,3.5);
  run(g,.05,{});assert.equal(g.player.dig,null);assert.equal(g.player.hidden,false);
});
test('only soft dirt can be dug: not stone floor, and Burrow there never claims a wall',()=>{
  const g=make();g.player.x=1.5;g.player.y=1.5;run(g,1,{dig:true});assert.ok(!g.player.dig);
  const h=make();assert.equal(h.burrow(),false);assert.notEqual(h.message,'Face a thin wall with an open tile on the other side.');
});
test('dirt patches are used sparingly: a couple of Ant Kingdom escapes',()=>{
  const withSoil=EscapeCatalog.levels.filter(l=>l.soil?.length).map(l=>l.id);assert.deepEqual(withSoil,['anthill-gate','sugar-store']);
});
