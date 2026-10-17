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
    // Exact subset routing is cheap for small treasure sets. Cap its size so
    // custom maps cannot turn this heuristic into an unbounded tour search.
    // It estimates walking only; every suggested route still runs in-engine.
    if(kind==='treasure'&&targets.length<=10){
      const reachable=targets.filter(p=>from.has(tile(p))),n=reachable.length,needed=g.requiredTreasure-g.treasure;
      if(n&&reachable.reduce((sum,p)=>sum+p.value,0)>=needed){
        const fields=reachable.map(p=>distances(g,p)),exit=distances(g,g.exit),values=new Float64Array(1<<n),memo=new Map();
        for(let mask=1;mask<values.length;mask++){const bit=mask&-mask;values[mask]=values[mask^bit]+reachable[31-Math.clz32(bit)].value;}
        const tour=(last,mask)=>{
          const key=mask*n+last;if(memo.has(key))return memo.get(key);
          if(values[mask]>=needed)return {cost:exit.get(tile(reachable[last]))??Infinity,next:-1};
          let best={cost:Infinity,next:-1};
          for(let next=0;next<n;next++)if(!(mask&(1<<next))){
            const distance=fields[next].get(tile(reachable[last]));if(distance===undefined)continue;
            const cost=distance+tour(next,mask|(1<<next)).cost;
            if(cost<best.cost)best={cost,next};
          }
          memo.set(key,best);return best;
        };
        let best=null;
        for(let next=0;next<n;next++){
          const distance=from.get(tile(reachable[next])),totalDistance=distance+tour(next,1<<next).cost;
          if(Number.isFinite(totalDistance)&&(!best||totalDistance<best.totalDistance))best={kind,target:{x:reachable[next].x,y:reachable[next].y},distance,totalDistance};
        }
        if(best)return best;
      }
    }
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
