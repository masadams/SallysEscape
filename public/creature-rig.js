// Articulated silhouettes and jointed feet, following the original Chain/FABRIK
// approach. All coordinates are in tiles; this rig never moves a game collider.
(function(root){
  const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const copy=p=>({x:p.x,y:p.y}),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
  const difference=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  const offset=(p,angle,length)=>({x:p.x+Math.cos(angle)*length,y:p.y+Math.sin(angle)*length});
  function fits(p,r,floor){
    return [[0,0],[-r,-r],[-r,r],[r,-r],[r,r]].every(([x,y])=>floor(Math.floor(p.x+x),Math.floor(p.y+y)));
  }
  function clear(a,b,r,floor){
    const steps=Math.max(1,Math.ceil(distance(a,b)/.045));
    for(let i=0;i<=steps;i++)if(!fits(mix(a,b,i/steps),r,floor))return false;
    return true;
  }
  function safeOffset(origin,target,r,floor){
    for(let t=1;t>=0;t-=.125){const p=mix(origin,target,t);if(clear(origin,p,r,floor))return p;}
    return copy(origin);
  }
  // A distance-sampled spine remembers the route round corners. A conventional
  // unconstrained follower chain can pull a long tail straight through a wall.
  class Trail{
    constructor(head,angle,length,floor){
      this.length=length+.2;this.points=[copy(head)];this.head=copy(head);
      let p=copy(head),heading=angle+Math.PI;
      for(let s=0;s<this.length;s+=.07){
        let next=offset(p,heading,.07);
        if(!clear(p,next,.21,floor)){
          const turn=[heading-Math.PI/2,heading+Math.PI/2,heading+Math.PI].find(a=>clear(p,offset(p,a,.07),.21,floor));
          if(turn===undefined)break;heading=turn;next=offset(p,heading,.07);
        }
        this.points.push(next);p=next;
      }
    }
    update(head){
      const travelled=distance(this.head,head);this.head=copy(head);
      if(distance(head,this.points[0])>.022)this.points.unshift(copy(head));
      let length=distance(head,this.points[0]);
      for(let i=1;i<this.points.length;i++){
        length+=distance(this.points[i-1],this.points[i]);
        if(length>this.length){this.points.length=i+1;break;}
      }
      return travelled;
    }
    sample(behind){
      let a=this.head;
      for(const b of this.points){
        const length=distance(a,b);
        if(length>1e-8&&behind<=length)return mix(a,b,behind/length);
        behind-=length;a=b;
      }
      return copy(a);
    }
  }
  // Exact two-bone IK keeps the elbow bent instead of interpolating an entire
  // limb towards a moving target. Side chooses the outward elbow bend.
  function elbow(root,foot,upper,lower,side){
    const length=clamp(distance(root,foot),.00001,upper+lower-.00001);
    const angle=Math.atan2(foot.y-root.y,foot.x-root.x);
    const bend=Math.acos(clamp((upper*upper+length*length-lower*lower)/(2*upper*length),-1,1));
    return offset(root,angle+side*bend,upper);
  }
  class EscapeCreatureMotion{
    constructor(game){
      this.floor=(x,y)=>game.floor(x,y);this.clock=0;
      this.resetPlayer(game.player);this.snakes=[];
      (game.hunters||[game.hunter]).forEach((h,i)=>this.resetHunter(h,i));
    }
    resetPlayer(p){
      const angle=Math.atan2(p.facing.y,p.facing.x);
      this.lizard={head:copy(p),headAngle:angle,distance:0,speed:0,phase:0,stride:.46,
        trail:new Trail(p,angle,1.3,this.floor),joints:[],angles:[],widths:[],legs:[]};
      this.pose(this.lizard,'lizard');
      for(let i=0;i<4;i++){
        const leg={index:i,bodyIndex:i<2?3:7,side:i%2===0?1:-1,upper:i<2?.17:.16,lower:.18,cycle:i===1||i===2?0:-1,swing:false,lift:0};
        leg.root=this.shoulder(leg);leg.foot=this.restFoot(leg,0);leg.bendSign=this.kneeSide(leg,leg.foot);
        leg.elbow=elbow(leg.root,leg.foot,leg.upper,leg.lower,leg.bendSign);leg.footAngle=this.lizard.angles[leg.bodyIndex]+leg.side*.12;
        this.lizard.legs.push(leg);
      }
    }
    resetHunter(h,index=0){
      const snake={head:copy(h),headAngle:h.facing,distance:0,speed:0,tongue:0,
        trail:new Trail(h,h.facing,3.25,this.floor),joints:[],angles:[],widths:[]};
      this.pose(snake,'snake');this.snakes[index]=snake;this.snake=this.snakes[0];
    }
    update(dt,game){
      if(!Number.isFinite(dt)||dt<=0)return;
      this.clock+=dt;
      if(distance(this.lizard.head,game.player)>.65)this.resetPlayer(game.player);
      const hunters=game.hunters||[game.hunter];
      hunters.forEach((h,i)=>{if(distance(this.snakes[i].head,h)>.65)this.resetHunter(h,i);});
      for(const [kind,model,actor] of [['lizard',this.lizard,game.player],...hunters.map((h,i)=>['snake',this.snakes[i],h])]){
        const travelled=distance(model.head,actor),speed=travelled/dt;
        if(actor.kind==='millipede'&&travelled<1e-7)continue;
        if(kind==='lizard'){
          const target=travelled>1e-7?Math.atan2(actor.y-model.head.y,actor.x-model.head.x):Math.atan2(actor.facing.y,actor.facing.x);
          model.headAngle+=clamp(difference(target,model.headAngle),-9*dt,9*dt);
        }else model.headAngle=actor.facing; // The nose and visible gaze agree with actual perception.
        model.trail.update(actor);model.head=copy(actor);model.distance+=travelled;
        model.instantSpeed=speed;
        model.speed+=(speed-model.speed)*(1-Math.exp(-dt*14));
        this.pose(model,kind);
      }
      this.updateFeet(dt);
      this.snakes.forEach((snake,i)=>{const flick=(this.clock+i*.71)%3.7;snake.tongue=flick>3.36&&flick<3.58?Math.sin((flick-3.36)/.22*Math.PI):0;});
    }
    pose(model,kind){
      const snake=kind==='snake',count=snake?34:15,spacing=snake?.098:.086;
      const profile=[52,58,40,60,68,71,65,50,28,15,11,9,7,4,0];
      model.joints=[];model.widths=[];model.angles=[];
      for(let i=0;i<count;i++){
        const s=i*spacing,base=model.trail.sample(s),front=model.trail.sample(Math.max(0,s-.08)),back=model.trail.sample(s+.08);
        const angle=Math.atan2(front.y-back.y,front.x-back.x);
        const t=i/(count-1),width=snake?(i===0?.205:i===1?.19:.17*Math.pow(1-t,.58)+.007):profile[i]*.00265;
        const amplitude=i===0?0:snake?.135*Math.min(1,s/.4)*Math.sin(Math.PI*t)*(.65+.35*Math.min(model.speed/1.25,1)):i<7?.012:Math.sin(Math.PI*(i-6)/9)*.057;
        const wave=Math.sin(model.distance*(snake?8:TAU/.55)-s*(snake?6.3:5))*amplitude;
        model.joints.push(safeOffset(base,offset(base,angle+Math.PI/2,wave),width,this.floor));
        model.widths.push(width*(snake?1:i>2&&i<8?1+Math.sin(this.clock*2.2)*.014:1));
      }
      for(let i=0;i<count;i++){
        const front=model.joints[Math.max(0,i-1)],back=model.joints[Math.min(count-1,i+1)];
        const angle=i===0?model.headAngle:Math.atan2(front.y-back.y,front.x-back.x);
        model.angles.push(i===0?angle:model.angles[i-1]+clamp(difference(angle,model.angles[i-1]),-.7,.7));
      }
    }
    shoulder(leg){
      const m=this.lizard,i=leg.bodyIndex;
      return offset(m.joints[i],m.angles[i]+leg.side*Math.PI/2,m.widths[i]*.72);
    }
    restFoot(leg,lead){
      const m=this.lizard,angle=m.angles[leg.bodyIndex];
      let target=offset(leg.root,angle,lead+(leg.index<2?.045:-.04));
      target=offset(target,angle+leg.side*Math.PI/2,.16);
      return safeOffset(leg.root,target,.025,this.floor);
    }
    kneeSide(leg,foot){
      const angle=this.lizard.angles[leg.bodyIndex];
      const pole=offset(offset(leg.root,angle,leg.index<2?-.035:.065),angle+leg.side*Math.PI/2,.15);
      const a=elbow(leg.root,foot,leg.upper,leg.lower,1),b=elbow(leg.root,foot,leg.upper,leg.lower,-1);
      return distance(a,pole)<=distance(b,pole)?1:-1;
    }
    updateFeet(dt){
      const m=this.lizard;m.phase=m.distance/m.stride;
      for(const leg of m.legs){
        leg.root=this.shoulder(leg);
        const cycle=Math.floor(m.phase+(leg.index===1||leg.index===2?.5:0));
        // A stance foot stays at its world position. Opposite diagonal pairs
        // lift in turn; a blocked movement input never advances the gait.
        const reach=leg.upper+leg.lower-.025,angle=m.angles[leg.bodyIndex];
        const across=(leg.foot.x-leg.root.x)*Math.cos(angle+leg.side*Math.PI/2)+(leg.foot.y-leg.root.y)*Math.sin(angle+leg.side*Math.PI/2);
        if(!leg.swing&&((cycle!==leg.cycle&&m.speed>.08)||distance(leg.root,leg.foot)>reach||across<.01||!fits(leg.foot,.025,this.floor))){
          leg.cycle=cycle;leg.from=copy(leg.foot);leg.to=this.restFoot(leg,leg.index<2?.18:.255);
          leg.control=offset(leg.root,angle+leg.side*Math.PI/2,.07);leg.elbowFrom=copy(leg.elbow);
          leg.angleFrom=leg.footAngle;leg.angleTo=angle+leg.side*.12;leg.bendSign=this.kneeSide(leg,leg.to);
          leg.progress=0;leg.duration=clamp(m.stride/Math.max(m.instantSpeed,1)*.32,.055,.16);leg.swing=true;
        }
        if(leg.swing){
          leg.progress=Math.min(1,leg.progress+dt/leg.duration);
          const t=leg.progress,smooth=t*t*(3-2*t);
          leg.foot=safeOffset(leg.root,mix(mix(leg.from,leg.control,smooth),mix(leg.control,leg.to,smooth),smooth),.025,this.floor);
          leg.footAngle=leg.angleFrom+difference(leg.angleTo,leg.angleFrom)*smooth;leg.lift=Math.sin(t*Math.PI);
          if(t===1){leg.swing=false;leg.lift=0;}
        }
        // A sharp reversal may put an old planted foot beyond the limb's reach.
        if(distance(leg.root,leg.foot)>reach)leg.foot=safeOffset(leg.root,offset(leg.root,Math.atan2(leg.foot.y-leg.root.y,leg.foot.x-leg.root.x),reach),.025,this.floor);
        const knee=elbow(leg.root,leg.foot,leg.upper,leg.lower,leg.bendSign);
        leg.elbow=leg.swing?mix(leg.elbowFrom,knee,leg.progress*leg.progress*(3-2*leg.progress)):knee;
      }
    }
  }
  root.EscapeCreatureMotion=EscapeCreatureMotion;
  if(typeof module!=='undefined'&&module.exports)module.exports={EscapeCreatureMotion};
})(typeof globalThis!=='undefined'?globalThis:this);
