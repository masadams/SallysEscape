// Cosmetic state only. Uses the run clock, never changes facing, tools or hunters.
(function(root){
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const angleDelta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  const hiddenStates=new Set(['buried','dig','emerge','rooted','shell','hide','lurking','sink']);
  const urgentStates=new Set(['chase','charge','windup','sting','leap','lunge','swoop','rush','rear','follow','tongue','strike','snap','scuttle','crouch','pounce','aim','stab','dash','glare','raise']);
  class SallyCharacter{
    constructor({reducedMotion=false}={}){this.reducedMotion=reducedMotion;this.at=0;this.mood='calm';this.until=0;this.lastTongue=-Infinity;this.lostTailAt=-Infinity;this.tailCheckAt=-Infinity;this.tailCheckPending=false;this.lastGlance=-Infinity;this.cues=[];this.face={mood:'calm',look:0,wide:0,smile:0,blink:0,chew:0};}
    update(game,events=[]){
      // A pause and a result freeze the last pose, including its blink.
      if(game.paused)return this.face;
      this.at=game.elapsed;
      if(events.includes('tongue'))this.lastTongue=this.at;
      if(events.includes('tailDrop')){this.lostTailAt=this.at;this.tailCheckPending=true;this.tailCheckAt=-Infinity;this.mood='startled';this.until=this.at+.85;}
      else if(events.includes('regrow')){this.tailCheckPending=false;this.tailCheckAt=-Infinity;this.mood='pleased';this.until=this.at+1;}
      // Only a confirmed tongue pickup gets the satisfied face and chirrup.
      else if(this.at-this.lastTongue<.65&&events.some(e=>['key','treasure','glowbug'].includes(e))){
        this.mood='pleased';this.until=this.at+.8;this.lastTongue=-Infinity;this.cues.push('sallyPleased');
      }
      const p=game.player,angle=Math.atan2(p.facing.y,p.facing.x);
      let threat=null,nearest=4.5;
      for(const h of game.hunters){
        // Never reveal an enemy through a wall, fog, camouflage or an unopened mimic.
        if(hiddenStates.has(h.state)||h.kind==='gecko'||!game.visibleTile(Math.floor(h.x),Math.floor(h.y))||!game.playerSees(h))continue;
        const d=Math.hypot(h.x-p.x,h.y-p.y);if(d<nearest){threat=h;nearest=d;}
      }
      const lookingBack=game.lookUntil>this.at;
      if(lookingBack&&this.at-this.lastGlance>.65){this.lastGlance=this.at;this.cues.push('sallyGlance');}
      const danger=threat&&(urgentStates.has(threat.state)||nearest<2);
      let mood=lookingBack?'nervous':this.until>this.at?this.mood:danger?'alert':threat?'curious':p.exhausted?'winded':'calm';
      // A threat takes priority over a pleased face: the player must still read danger.
      if(danger&&!lookingBack&&mood==='pleased')mood='alert';
      let look=threat?clamp(angleDelta(Math.atan2(threat.y-p.y,threat.x-p.x),angle),-.65,.65):0;
      if(lookingBack)look=this.reducedMotion?0:Math.sin(this.at*13)*.23;
      // Once safe and stationary, she briefly checks the stump after losing her tail.
      if(!game.hasTail&&!threat&&!p.moving&&!lookingBack&&this.at-this.lostTailAt>.9){
        if(this.tailCheckPending){this.tailCheckAt=this.at;this.tailCheckPending=false;}
        if(this.at-this.tailCheckAt<1.2){mood='tail-check';look=Math.PI+(this.reducedMotion?0:Math.sin((this.at-this.tailCheckAt)*7)*.3);}
      }
      const blinkCycle=this.at%5.3,blink=blinkCycle>5.12?Math.sin((blinkCycle-5.12)/.18*Math.PI):0;
      this.face={mood,look,headAngle:lookingBack?angle:null,wide:['alert','startled','nervous'].includes(mood)?1:mood==='curious'?.35:0,
        smile:mood==='pleased'?1:0,blink:mood==='pleased'?.45:this.reducedMotion?0:blink,chew:mood==='pleased'&&!this.reducedMotion?(Math.sin((this.until-this.at)*23)+1)/2:0};
      return this.face;
    }
    drainCues(){const cues=this.cues;this.cues=[];return cues;}
  }
  function celebrationFor(result){
    if(result.status!=='won')return null;
    if(result.tailsDropped||result.alarms)return {mood:'relieved',label:result.hasTail===false?'Sally checks her missing tail, then gives a relieved wiggle.':'Sally catches her breath and gives a relieved wiggle.'};
    if(result.treasure>=Math.ceil(result.totalTreasure*.6))return {mood:'proud',label:'Sally hugs her treasure and does a proud little hop.'};
    return {mood:'sneaky',label:'Sally checks both ways, then gives a knowing smile.'};
  }
  function celebrationSVG(result,skin){
    const pose=celebrationFor(result);if(!pose)return '';
    const rgb=c=>'rgb('+c.join(',')+')',body=rgb(skin.body),dark=rgb(skin.dark),light=rgb(skin.light);
    const tail=result.hasTail===false?'<path d="M69 60q-9 0-12 7"/>':'<path class="sally-celebration-tail" d="M69 60C25 99 4 56 26 43c15-9 26 11 12 16"/>';
    const treasure=pose.mood==='proud'?'<g fill="#e5c271" stroke="#71512e" stroke-width="2"><path d="m119 55 9-8 10 8-10 10Z"/><path d="m130 68 8-7 9 7-9 9Z"/></g>':'';
    const eyes=pose.mood==='relieved'&&result.hasTail!==false?'<path d="m109 30 5 2 4-3m10 2 5 1 4-3" fill="none" stroke="#17382e" stroke-width="2.5"/>':'<g fill="#f7edc0"><ellipse cx="113" cy="30" rx="7" ry="9"/><ellipse cx="133" cy="30" rx="6" ry="8"/></g><g class="sally-celebration-eyes" fill="#18382f"><ellipse cx="'+(pose.mood==='sneaky'||result.hasTail===false?110:115)+'" cy="31" rx="3" ry="5"/><ellipse cx="'+(pose.mood==='sneaky'||result.hasTail===false?130:135)+'" cy="31" rx="2.5" ry="4.5"/></g>';
    return '<svg viewBox="0 0 180 100" aria-hidden="true" focusable="false"><ellipse cx="93" cy="87" rx="62" ry="5" fill="#061b21" opacity=".35"/><g class="sally-celebration-body sally-'+pose.mood+'"><g fill="none" stroke="'+body+'" stroke-width="12" stroke-linecap="round">'+tail+'</g><path d="M68 66q-18 3-15 14h16m42-14q11 1 12 13h15" fill="none" stroke="'+dark+'" stroke-width="9" stroke-linecap="round"/><ellipse cx="91" cy="59" rx="32" ry="22" fill="'+body+'"/><ellipse cx="102" cy="66" rx="18" ry="12" fill="'+light+'"/><g class="'+(result.hasTail===false?'sally-check-tail':'')+'"><path d="M101 53q-8-22 3-28 15-13 33 0l13 14q3 14-22 18Z" fill="'+body+'"/>'+eyes+'<path d="M128 44q9 5 15-1" fill="none" stroke="'+dark+'" stroke-width="2" stroke-linecap="round"/><circle cx="144" cy="35" r="1.6" fill="'+dark+'"/></g><path d="m79 51 10 14 14-4m14-7 3 10 10 1" fill="none" stroke="'+dark+'" stroke-width="7" stroke-linecap="round"/>'+treasure+'</g></svg>';
  }
  root.SallyCharacter=SallyCharacter;root.sallyCelebrationFor=celebrationFor;root.sallyCelebrationSVG=celebrationSVG;
  if(typeof module!=='undefined'&&module.exports)module.exports={SallyCharacter,celebrationFor,celebrationSVG};
})(typeof globalThis!=='undefined'?globalThis:this);
