const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');const {escapeBuildCustom}=require('../public/escape-levels.js');
const run=(g,s,input={})=>{for(let i=0;i<Math.round(s*120);i++)g.advance(1/120,input);};
// An open room: Sally bottom left, a ladybird ambling mid-room, a snake asleep at its far side.
function room(extra={}){
  const map=['###############','#.............#','#.............#','#.....K.......#','#.............#','#.............#','#@...........X#','###############'];
  return new EscapeAdventure({level:escapeBuildCustom({id:'ladybird-test',name:'Test',map,pebbles:2,burrows:0,tongues:0,
    guards:[{kind:'ladybird',spawn:[4,5],patrol:[[4,5],[6,5]]},{kind:'snake',spawn:[9,2],patrol:[[9,2],[10,2]]}],...extra})});
}
const lady=g=>g.hunters.find(h=>h.kind==='ladybird');
test('a ladybird never catches Sally, and plays dead when she walks up to it',()=>{
  const g=room();g.player.x=lady(g).x-1.5;g.player.y=lady(g).y;run(g,.2);
  assert.equal(lady(g).state,'dead');assert.equal(g.status,'playing');
  g.player.x=lady(g).x;g.player.y=lady(g).y;run(g,.1);assert.equal(g.status,'playing','touching it is harmless');
});
test('crawling past, Sally never startles it',()=>{
  const g=room();g.player.x=lady(g).x-1.5;g.player.y=lady(g).y;run(g,1,{crawl:true});assert.equal(lady(g).state,'patrol');assert.equal(g.alarms||0,0);
});
test('rushing past while it lies still, it flies up and the hunters learn where Sally is',()=>{
  const g=room(),snake=g.hunters.find(h=>h.kind==='snake');g.player.x=lady(g).x-2;g.player.y=lady(g).y;run(g,.1);assert.equal(lady(g).state,'dead');
  run(g,.6,{x:1,sprint:true});assert.ok(['warn','away'].includes(lady(g).state));run(g,.8);
  assert.equal(lady(g).state,'away');assert.ok(g.alarms>=1);assert.ok(['chase','alert'].includes(snake.state)||snake.awareness===1);
});
test('a pebble near it startles it, and once it has flown it returns to its patrol',()=>{
  const g=room(),l=lady(g);g.hunters=g.hunters.filter(h=>h===l);g.decoy={x:l.x+.5,y:l.y,expires:g.elapsed+5};run(g,.1);assert.equal(l.state,'warn');run(g,1);assert.equal(l.state,'away');
  g.decoy=null;g.player.x=12;g.player.y=6;run(g,8.5);assert.equal(l.state,'patrol');
});
test('left alone it ambles between its patrol points',()=>{
  const g=room(),l=lady(g),x=l.x;g.player.x=12;g.player.y=6;run(g,2);assert.ok(Math.abs(l.x-x)>.5);
});
