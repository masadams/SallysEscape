'use strict';
const DIRS=[[1,0],[0,1],[-1,0],[0,-1]],tile=p=>Math.floor(p.x)+','+Math.floor(p.y);
function field(g,target,extra=new Set()){
  const values=new Map(),queue=[[Math.floor(target.x),Math.floor(target.y),0]];
  for(let index=0;index<queue.length;index++){
    const [x,y,d]=queue[index],key=x+','+y;
    if(values.has(key)||(!g.actorFloor(x,y,null)&&!extra.has(key)))continue;
    values.set(key,d);for(const [dx,dy]of DIRS)queue.push([x+dx,y+dy,d+1]);
  }
  return values;
}
function createPlanner(){
  const cache=new Map();
  const distances=(g,target,extra=new Set())=>{
    const key=g.grid.map(row=>row.join('')).join('\n')+'@'+tile(target)+'@'+[...extra].join(';');
    if(cache.has(key))return cache.get(key);
    const result=field(g,target,extra);cache.set(key,result);
    if(cache.size>256)cache.delete(cache.keys().next().value);
    return result;
  };
  return g=>{
    const kind=!g.hasKey?'key':g.treasure<g.requiredTreasure?'treasure':'exit';
    const targets=kind==='key'?[g.key]:kind==='treasure'?g.loot.filter(p=>!p.taken):[g.exit];
    const from=distances(g,g.player),origin=tile(g.player);
    let best=null;
    for(const target of targets){
      const distance=from.get(tile(target));
      if(distance!==undefined&&(!best||distance<best.distance))best={kind,target:{x:target.x,y:target.y},distance};
    }
    if(best)return best;
    // Dependency estimates only: a hypothetical flood fill does not open a
    // simulator gate. The actual branch must reach a real, usable trigger.
    for(const gate of g.gates){
      if(gate.open||gate.sealed||gate.shut||!(gate.duration||gate.switch||gate.stay||gate.levers.length))continue;
      const triggers=[...(!gate.heavy?[...(gate.switch?[gate.switch]:[]),...gate.plates]:[]),...gate.levers];
      const extra=new Set(gate.tiles.map(p=>p.join(',')));
      for(const target of targets){
        const beyond=distances(g,target,extra);
        for(const trigger of triggers){
          const approach=from.get(tile(trigger)),remainder=beyond.get(tile(trigger));
          if(approach===undefined||remainder===undefined)continue;
          const distance=approach+remainder;
          if(!best||distance<best.distance)best={kind:'trigger',goalKind:kind,gateId:gate.id,target:{x:trigger.x,y:trigger.y},distance};
        }
      }
    }
    return best||{kind:'unresolved-dependency',target:targets[0]&&{x:targets[0].x,y:targets[0].y},distance:null,origin};
  };
}
module.exports={field,createPlanner};
