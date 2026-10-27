// A recorded winning run as steps a person can read and edit: go to a spot (walking or sprinting),
// wait, use a tool facing a way, push, ride a bounce cap. A recording is frame-by-frame input; the
// steps group it so the builder can show it as a short list, change a step, and play it again.
// Everything before the first changed step is replayed from the recording exactly, so an edit late
// in a run can never disturb what came before it.
(function(root){
  const Engine=typeof module!=='undefined'&&module.exports?require('./escape-engine.js').EscapeAdventure:root.EscapeAdventure;
  const ACT={pebble:'throwDecoy',burrow:'burrow',tongue:'useTongue',seed:'plantSeed',camo:'camouflage',glow:'throwGlow',spore:'throwSpore'};
  const push=(rec,cmd)=>{const last=rec[rec.length-1];if(cmd.kind==='move'&&last&&last.kind==='move'&&last.x===cmd.x&&last.y===cmd.y&&last.sprint===cmd.sprint&&!last.crawl&&!cmd.crawl)last.frames+=cmd.frames;else rec.push({...cmd});};
  const round=v=>Math.round(v*100)/100;

  // The steps of a recording. Each remembers the frame it starts at, so a replay can take everything
  // before it straight from the recording, and a go keeps its own input to replay as it was.
  function toSteps(options,commands){
    // First every frame: where Sally was, what was pressed; tool uses sit between frames.
    const g=new Engine(options),items=[];let frame=0,lastInput=null;
    for(const c of commands){
      if(c.kind!=='move'){const aim=lastInput&&(lastInput.x||lastInput.y)?{x:Math.sign(Math.round(lastInput.x)),y:Math.sign(Math.round(lastInput.y))}:null;
        items.push({act:{type:'act',kind:c.kind,aim,frame,at:{x:round(g.player.x),y:round(g.player.y)},...(c.power!==undefined?{power:c.power}:{})}});g[ACT[c.kind]]?.(c.power);continue;}
      for(let n=0;n<c.frames;n++){const from={x:g.player.x,y:g.player.y},flying=Boolean(g.player.flight),crates=g.crateVersion;
        g.advance(1/120,c);items.push({frame,input:c,from,to:{x:g.player.x,y:g.player.y},moving:Boolean(c.x||c.y),cap:!flying&&Boolean(g.player.flight),pushed:g.crateVersion!==crates});frame++;if(c.x||c.y)lastInput=c;}
    }
    // Then group: a stretch of movement is one go (pauses under a quarter second inside it belong to
    // it), a longer pause is a wait, and each tool use is a step of its own. Every frame lands in
    // exactly one step, with its input kept, so untouched steps replay the recording exactly.
    const steps=[],add=(s,f)=>{push(s.raw,{...f.input,frames:1});if(s.type!=='go')return;
      if(f.moving){s.moved++;if(f.input.sprint)s.sprinted++;}if(f.cap)s.cap=true;if(f.pushed)s.pushes=true;
      const lp=s.points[s.points.length-1];if(f.moving&&(!lp||Math.hypot(f.to.x-lp.x,f.to.y-lp.y)>=.35))s.points.push({x:round(f.to.x),y:round(f.to.y)});
      s.to={x:round(f.to.x),y:round(f.to.y)};};
    let i=0;
    while(i<items.length){const it=items[i];
      if(it.act){steps.push(it.act);i++;continue;}
      let j=i;while(j<items.length&&!items[j].act&&!items[j].moving)j++;
      const last=steps[steps.length-1],intoGo=last&&last.type==='go',moveNext=j<items.length&&!items[j].act;
      if(j>i&&(j-i>=30||!intoGo&&!moveNext)){const w={type:'wait',t:round((j-i)/120),frames:j-i,frame:it.frame,at:{x:round(it.from.x),y:round(it.from.y)},raw:[]};for(;i<j;i++)add(w,items[i]);steps.push(w);continue;}
      let go=intoGo?last:null;
      if(!go){go={type:'go',frame:it.frame,from:{x:round(it.from.x),y:round(it.from.y)},exact:{...it.from},points:[],raw:[],sprinted:0,moved:0,to:{x:round(it.from.x),y:round(it.from.y)}};steps.push(go);}
      for(;i<j;i++)add(go,items[i]);
      for(;i<items.length&&items[i].moving&&!items[i].act;i++)add(go,items[i]);
    }
    for(const s of steps)if(s.type==='go'){s.sprint=s.sprinted*2>s.moved;delete s.sprinted;delete s.moved;}
    steps.push({type:'end',frame});
    return steps;
  }

  // Walk or sprint to a point: straight at it, along the engine's route if a wall is in the way.
  function goTo(g,rec,to,sprint){
    const via=g.clear(g.player,to)?[to]:[...g.route(g.player,to),to];
    for(const p of via){
      for(let i=0,limit=Math.ceil((Math.hypot(p.x-g.player.x,p.y-g.player.y)+1.5)*120);i<limit&&g.status==='playing';i++){
        if(g.player.flight){while(g.player.flight&&g.status==='playing')frame(g,rec,0,0,false);return;}
        const dx=p.x-g.player.x,dy=p.y-g.player.y,L=Math.hypot(dx,dy);if(L<.06)break;
        const step=(sprint?4:2.45)/120,scale=L<step?L/step:1;frame(g,rec,+(dx/L*scale).toFixed(4),+(dy/L*scale).toFixed(4),sprint);
      }
    }
  }
  function frame(g,rec,x,y,sprint){g.advance(1/120,{x,y,sprint});push(rec,{kind:'move',frames:1,x,y,sprint});}

  // Play steps into a recording. An untouched step replays its own recorded input exactly, so
  // everything before the first edit comes out as it was; an edited step is played from its settings.
  function play(options,steps){
    const g=new Engine(options),rec=[];let changed=false;
    for(const s of steps){if(g.status!=='playing')break;
      if(s.edited)changed=true;
      const exact=!s.edited&&s.raw&&(!changed||s.type==='wait'||s.type==='go'&&Math.hypot(g.player.x-s.exact.x,g.player.y-s.exact.y)<.05);
      if(exact)for(const c of s.raw){for(let n=0;n<c.frames&&g.status==='playing';n++)g.advance(1/120,c);push(rec,c);}
      else if(s.type==='wait')for(let i=0,n=Math.round(s.t*120);i<n&&g.status==='playing';i++)frame(g,rec,0,0,false);
      else if(s.type==='act'){if(s.aim&&s.edited)frame(g,rec,s.aim.x,s.aim.y,false);g[ACT[s.kind]]?.(s.power);rec.push({kind:s.kind,...(s.power!==undefined?{power:s.power}:{})});}
      else if(s.type==='go')for(const p of s.edited?[s.to]:s.points)goTo(g,rec,p,s.sprint);
      else if(s.type==='end')for(let i=0;i<360&&g.status==='playing';i++)frame(g,rec,0,0,false);
    }
    return {commands:rec,status:g.status,time:round(g.elapsed),message:g.message,at:{x:round(g.player.x),y:round(g.player.y)}};
  }

  // One line for a step, for the list.
  const NAMES={pebble:'Throw a pebble',tongue:'Tongue',camo:'Camouflage',burrow:'Burrow',seed:'Plant a seed',glow:'Throw a glow mushroom',spore:'Throw a spore pouch'};
  const WAY=a=>!a?'':a.x>0?' →':a.x<0?' ←':a.y>0?' ↓':' ↑';
  function describe(s){
    if(s.type==='go')return (s.sprint?'Sprint':'Walk')+' to '+Math.floor(s.to.x)+','+Math.floor(s.to.y)+(s.cap?' (bounce cap)':s.pushes?' (pushing)':'');
    if(s.type==='wait')return 'Wait '+s.t+' s';
    if(s.type==='act')return (NAMES[s.kind]||s.kind)+WAY(s.aim);
    return 'Escape';
  }
  const api={toSteps,play,describe,ACT};
  root.EscapeSteps=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
