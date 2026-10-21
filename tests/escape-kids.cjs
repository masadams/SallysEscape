const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js'),{EscapeCatalog}=require('../public/escape-levels.js');
const run=(g,seconds,input={})=>{for(let i=0;i<seconds*120;i++)g.advance(1/120,input);};

test('Little Explorers has thirty-one gentle levels outside the trail, each with its own sticker',()=>{
  assert.equal(EscapeCatalog.kids.length,31);assert.equal(new Set(EscapeCatalog.kids.map(l=>l.sticker)).size,31);
  for(const l of EscapeCatalog.kids){assert.equal(l.kids,true);assert.equal(l.cunning,0);assert.ok(l.gentle>0&&l.gentle<1,l.id);assert.ok(l.sticker,l.id);
    assert.ok(!EscapeCatalog.levels.some(c=>c.id===l.id),'not on the campaign trail');}
});
test('a catch in a gentle level is an "Oops!": Sally hops back to the last checkpoint and plays on',()=>{
  const g=new EscapeAdventure({kidsId:'leafy-hide'}),start={x:g.player.x,y:g.player.y},snake=g.hunters[0];
  // Reach the checkpoint, then let a snake catch her somewhere else.
  const cp=g.checkpoints[0];g.player.x=cp.x;g.player.y=cp.y;run(g,.1);assert.equal(cp.reached,true);assert.deepEqual(g.checkpoint,{x:cp.x,y:cp.y});
  g.player.x=start.x+3;g.player.y=start.y+2;snake.x=g.player.x;snake.y=g.player.y;snake.state='chase';run(g,.2);
  assert.equal(g.status,'playing');assert.equal(g.oopses,1);assert.ok(Math.hypot(g.player.x-cp.x,g.player.y-cp.y)<.01,'back at the checkpoint');
  assert.ok(g.hunters.every(h=>h.awareness===0&&h.state!=='chase'),'the creatures forget her');
  run(g,1);assert.equal(g.oopses,1,'safe for a moment after an oops');
});
test('the creatures in a gentle level move slower',()=>{
  const level=EscapeCatalog.kids.find(l=>l.id==='leafy-hide'),moved=gentle=>{const g=new EscapeAdventure({level:{...level,gentle}}),h=g.hunters[0],y=h.y;g.player.x=1.5;g.player.y=5.5;run(g,1);return Math.abs(h.y-y);};
  const slow=moved(.6),usual=moved(false);assert.ok(slow>0&&slow<usual*.75,slow+' vs '+usual);
});
test('holding crouch crouches Sally where she stands, and a crouch is quieter even standing still',()=>{
  const g=new EscapeAdventure({levelId:'quiet-vault'});run(g,.2,{crawl:true});
  assert.equal(g.player.crawling,true);assert.equal(g.player.moving,false);
  run(g,.2,{});assert.equal(g.player.crawling,false);
});

