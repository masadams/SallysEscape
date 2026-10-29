// Actual engine inputs; no teleports, altered hunters or unlimited supplies.
const assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js'),M=require('../public/isometric-model.js');
function solve(all=false){
 const g=new EscapeAdventure({level:M.level()}),frames=[];
 const advance=(x=0,y=0)=>{const i={x,y};frames.push(i);g.advance(1/120,i);assert.notEqual(g.status,'caught','caught at '+g.player.x+','+g.player.y);};
 const go=(x,y)=>{
  const dest={x:x+.5,y:y+.5},path=g.route(g.player,dest);assert.ok(path.length||Math.hypot(g.player.x-dest.x,g.player.y-dest.y)<.08,'unreachable '+x+','+y);
  for(const p of path){let steps=0;while(Math.hypot(g.player.x-p.x,g.player.y-p.y)>.025&&g.status==='playing'){
   assert.ok(++steps<1200,'stalled at '+JSON.stringify(p));const dx=p.x-g.player.x,dy=p.y-g.player.y,d=Math.hypot(dx,dy),scale=Math.min(1,d*25);advance(dx/d*scale,dy/d*scale);
  }}
 };
 if(all)for(const p of [[3,9],[5,10],[4,11],[5,7],[2,4],[6,2]])go(...p);
 go(5,3);assert.equal(g.gates[0].open,true);
 go(10,3);if(all){go(11,5);go(10,7);go(10,3);}go(10,2);if(all)go(11,2);go(14,2);if(all)go(14,1);
 assert.equal(g.hasKey,true);assert.equal(g.gates[1].open,true);
 go(10,2);go(10,9);go(6,9);go(2,11);
 for(let i=0;i<180&&g.status==='playing';i++)advance();
 assert.equal(g.status,'won');if(all)assert.equal(g.treasure,10);
 return {frames,result:g.result};
}
module.exports={solve};
if(require.main===module)for(const all of [false,true]){const r=solve(all);console.log((all?'All treasure':'Normal')+' solved: '+r.result.time.toFixed(2)+'s, '+r.result.treasure+'/10');}
