// Little Explorers' guide knows about Sally's special crossings, but never plays for her.
// It returns a walk ending at the next action, rather than drawing dots through a wall or gap.
(function(root){
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]],tile=p=>[Math.floor(p.x),Math.floor(p.y)],key=p=>p.join(','),centre=([x,y])=>({x:x+.5,y:y+.5});
  function search(g,from){
    const nodes=new Map([[key(from),{at:from,prev:null}]]),queue=[from];
    const add=(at,prev,action)=>{const k=key(at);if(!nodes.has(k)&&g.floor(...at)){nodes.set(k,{at,prev:key(prev),action});queue.push(at);}};
    for(let i=0;i<queue.length;i++){
      const at=queue[i],[x,y]=at;
      const cap=g.caps.find(c=>key(c.at)===key(at));
      if(cap){add(cap.to,at,{kind:'bounce',at,target:cap.to});continue;}
      for(const [dx,dy]of dirs)add([x+dx,y+dy],at);
      for(const t of g.tunnels){const a=tile(t.a),b=tile(t.b);if(key(a)===key(at))add(b,at,{kind:'tunnel',at,target:b});else if(key(b)===key(at))add(a,at,{kind:'tunnel',at,target:a});}
      // Only advertise authored cracked walls. Ordinary walls are never a suggested shortcut.
      if(g.burrows>0)for(const [dx,dy]of dirs)if(g.grid[y+dy]?.[x+dx]==='B')add([x+dx*2,y+dy*2],at,{kind:'burrow',at,target:[x+dx*2,y+dy*2],face:[dx,dy]});
    }
    return nodes;
  }
  function reconstruct(nodes,end,lastAction=null){
    const steps=[];for(let n=nodes.get(key(end));n;n=n.prev===null?null:nodes.get(n.prev))steps.push(n);steps.reverse();
    const path=[];for(const n of steps){if(n.action)return {path,action:n.action};path.push(n.at);}
    return {path,action:lastAction};
  }
  function toward(g,nodes,target,canTongue){
    if(nodes.has(key(target)))return reconstruct(nodes,target);
    if(!canTongue||!g.tongues)return null;
    // Prefer a little spare reach: the player need not stand on an exact tile centre.
    for(const reach of [g.tongueRange-.4,g.tongueRange])for(const n of nodes.values()){
      const [dx,dy]=[target[0]-n.at[0],target[1]-n.at[1]],d=Math.abs(dx)+Math.abs(dy);
      if((dx===0||dy===0)&&d>0&&d<=reach&&g.clear(centre(n.at),centre(target),true))
        return reconstruct(nodes,n.at,{kind:'tongue',at:n.at,target,face:[Math.sign(dx),Math.sign(dy)]});
    }
    return null;
  }
  function plan(g){
    const from=tile(g.player),target=tile(g.hasKey?g.exit:g.key),nodes=search(g,from);
    let found=toward(g,nodes,target,!g.hasKey);if(found)return found;
    for(const gate of g.gates){
      if(gate.open||gate.sealed||gate.heavy)continue;
      for(const p of [...(gate.switch?[gate.switch]:[]),...(gate.plates||[]),...(gate.levers||[])]){
        found=toward(g,nodes,tile(p),Boolean(gate.switch===p||gate.levers?.includes(p))&&!gate.duration&&!gate.shut);
        if(found)return {...found,gateId:gate.id};
      }
    }
    return {path:[],action:null};
  }
  const api={plan};root.EscapeKidsGuide=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
