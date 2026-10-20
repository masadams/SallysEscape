/* Review-only isometric scene. Rendering never changes engine collision or saves. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id),canvas=$('iso-canvas'),ctx=canvas.getContext('2d'),M=SallyIsometric;
 const state={game:null,keys:new Set(),stick:{x:0,y:0},holds:{},path:[],close:innerWidth<900,walls:true,mode:'keyboard',held:null,padButtons:[],padAxes:[0,0],last:0,clock:0,read:false};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let W=0,H=0,S=30,OX=0,OY=0;
 function reset(){state.game=new EscapeAdventure({level:M.level()});state.path=[];state.keys.clear();state.held=null;state.holds={};state.stick={x:0,y:0};$('knob').style.transform='';state.read=false;$('result').hidden=true;$('pause').textContent='Pause';$('pause').setAttribute('aria-pressed','false');canvas.focus({preventScroll:true});}
 function mode(m){if(state.mode===m)return;clearControls();state.mode=m;document.body.classList.toggle('touch',m==='touch');$('touch').hidden=m!=='touch';$('help').textContent=m==='pad'?'Left stick move · RT sprint · LT crawl · X pebble · LB glow · Y tongue · Start pause · A retry after a run':'WASD / arrows move on screen · Click a path to walk · Shift sprint · C crawl · Q pebble · L glow · R tongue · Esc pause';}
 function clearControls(){state.keys.clear();state.holds={};state.stick={x:0,y:0};state.held=null;$('knob').style.transform='';}
 function pause(){if(state.game.status!=='playing')return;state.game.paused=!state.game.paused;clearControls();$('pause').textContent=state.game.paused?'Resume':'Pause';$('pause').setAttribute('aria-pressed',String(state.game.paused));}
 function tool(kind,power=0){const g=state.game;if(!g.active())return;if(kind==='pebble')g.throwDecoy(power);if(kind==='glow')g.throwGlow(power);if(kind==='tongue')g.useTongue();}
 function beginTool(kind){if(!state.held&&state.game.active())state.held={kind,at:performance.now()};}
 function releaseTool(){if(!state.held)return;const h=state.held;state.held=null;tool(h.kind,Math.min(1,(performance.now()-h.at)/750));}
 function keyboardVector(){return {x:Number(state.keys.has('d')||state.keys.has('arrowright'))-Number(state.keys.has('a')||state.keys.has('arrowleft')),y:Number(state.keys.has('s')||state.keys.has('arrowdown'))-Number(state.keys.has('w')||state.keys.has('arrowup'))};}
 document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key.toLowerCase();if(!['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift','c','q','l','r','escape','enter'].includes(k))return;if(e.target.closest('button,a')&&(k==='enter'||k===' '))return;e.preventDefault();mode('keyboard');state.keys.add(k);if(e.repeat)return;if(k==='escape')pause();else if(k==='enter'&&state.game.status!=='playing')reset();else if(k==='q'||k==='l')beginTool(k==='q'?'pebble':'glow');else if(k==='r')tool('tongue');});
 document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();state.keys.delete(k);if(k==='q'||k==='l')releaseTool();});
 document.addEventListener('pointerdown',e=>mode(e.pointerType==='touch'?'touch':'keyboard'),{capture:true});
 $('pause').onclick=pause;$('retry').onclick=reset;$('again').onclick=reset;
 $('view').onclick=()=>{state.close=!state.close;$('view').textContent=state.close?'View: Close':'View: Whole';};
 $('walls').onclick=()=>{state.walls=!state.walls;$('walls').textContent=state.walls?'Walls: Solid':'Walls: Low';$('walls').setAttribute('aria-pressed',String(state.walls));};
 let stickPointer=null;
 $('stick').addEventListener('pointerdown',e=>{if(stickPointer!==null)return;stickPointer=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);moveStick(e);});
 function moveStick(e){if(e.pointerId!==stickPointer)return;const b=$('stick').getBoundingClientRect(),x=(e.clientX-b.left-b.width/2)/35,y=(e.clientY-b.top-b.height/2)/35,n=Math.max(1,Math.hypot(x,y));state.stick={x:x/n,y:y/n};$('knob').style.transform='translate('+state.stick.x*28+'px,'+state.stick.y*28+'px)';}
 $('stick').addEventListener('pointermove',moveStick);
 function endStick(e){if(e.pointerId!==stickPointer)return;stickPointer=null;state.stick={x:0,y:0};$('knob').style.transform='';}
 for(const e of ['pointerup','pointercancel','lostpointercapture'])$('stick').addEventListener(e,endStick);
 document.querySelectorAll('[data-hold]').forEach(b=>{b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);state.holds[b.dataset.hold]=true;};for(const n of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(n,()=>delete state.holds[b.dataset.hold]);});
 document.querySelectorAll('[data-tool]').forEach(b=>{b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);if(b.dataset.tool==='tongue')tool('tongue');else beginTool(b.dataset.tool);};b.onpointerup=releaseTool;b.onpointercancel=()=>{state.held=null;};});
 canvas.addEventListener('pointerdown',e=>{if(state.game.status!=='playing'||state.game.paused)return;camera();const p=M.unproject((e.clientX-OX)/S,(e.clientY-OY)/S),q={x:Math.floor(p.x)+.5,y:Math.floor(p.y)+.5};if(state.game.floor(Math.floor(q.x),Math.floor(q.y)))state.path=state.game.route(state.game.player,q);});
 function loseFocus(){state.game.paused=true;clearControls();stickPointer=null;$('pause').textContent='Resume';$('pause').setAttribute('aria-pressed','true');}
 addEventListener('blur',loseFocus);document.addEventListener('visibilitychange',()=>{if(document.hidden)loseFocus();});
 function padInput(){const pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p?.connected);if(!pad){if(state.mode==='pad')mode('keyboard');state.padButtons=[];state.padAxes=[0,0];return null;}const buttons=pad.buttons.map(b=>b.pressed),axes=[pad.axes[0]||0,pad.axes[1]||0],fresh=buttons.some((b,i)=>b&&!state.padButtons[i])||axes.some((v,i)=>Math.abs(v)>.22&&Math.abs(v-state.padAxes[i])>.08);if(fresh)mode('pad');const press=i=>buttons[i]&&!state.padButtons[i],up=i=>!buttons[i]&&state.padButtons[i];if(state.mode==='pad'){if(press(9))pause();if(press(0)&&state.game.status!=='playing')reset();if(press(2))beginTool('pebble');if(up(2))releaseTool();if(press(4))beginTool('glow');if(up(4))releaseTool();if(press(3))tool('tongue');}state.padButtons=buttons;state.padAxes=axes;if(state.mode!=='pad')return null;return {x:Math.abs(axes[0])>.18?axes[0]:Number(buttons[15])-Number(buttons[14]),y:Math.abs(axes[1])>.18?axes[1]:Number(buttons[13])-Number(buttons[12]),sprint:buttons[7],crawl:buttons[6]};}
 function input(){const pad=padInput();let v=state.mode==='touch'?state.stick:pad||keyboardVector(),world=M.screenInput(v.x,v.y);const moving=Math.hypot(v.x,v.y)>.06;if(moving)state.path=[];else if(state.path.length&&!state.held){const p=state.game.player,q=state.path[0],dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);if(d<.06)state.path.shift();else world={x:dx/d*Math.min(1,d*25),y:dy/d*Math.min(1,d*25)};}return {...world,sprint:!!(pad?.sprint||state.keys.has('shift')||state.holds.sprint),crawl:!!(pad?.crawl||state.keys.has('c')||state.holds.crawl),aiming:!!state.held};}
 function resize(){W=innerWidth;H=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);}
 addEventListener('resize',resize);
 function camera(){const fit=Math.min((W-50)/30,(H-170)/16);S=Math.max(8,fit)*(state.close?1.75:1);const p=state.close?M.project(state.game.player.x,state.game.player.y):M.project(8.5,6.5);OX=W/2-p.x*S;OY=(H<500?H*.52:H*.54)-p.y*S;}
 function P(x,y,z=0){const p=M.project(x,y,z);return [OX+p.x*S,OY+p.y*S];}
 function polygon(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.65;ctx.stroke();}}
 function poly3(points,fill,stroke){polygon(points.map(p=>P(...p)),fill,stroke);}
 function tile(x,y,z,color,stroke){poly3([[x,y,z],[x+1,y,z],[x+1,y+1,z],[x,y+1,z]],color,stroke);}
 function block(x,y,w,d,z,top,left,right,base=0){poly3([[x,y+d,base],[x+w,y+d,base],[x+w,y+d,z],[x,y+d,z]],left);poly3([[x+w,y,base],[x+w,y+d,base],[x+w,y+d,z],[x+w,y,z]],right);poly3([[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]],top,'#173c3444');}
 function ellipse(x,y,z,rx,ry,color){const p=P(x,y,z);ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(p[0],p[1],rx*S,ry*S,0,0,Math.PI*2);ctx.fill();}
 function line(points,color,width){ctx.beginPath();points.map(p=>P(...p)).forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width*S;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
 function glow(x,y,z,r,color){const p=P(x,y,z),g=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],r*S);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(p[0]-r*S,p[1]-r*S,r*S*2,r*S*2);}
 function lantern(x,y){glow(x,y,.5,1.5,'#f7c76728');block(x-.045,y-.045,.09,.09,.7,'#677365','#35483b','#243f38');ellipse(x,y,.74,.16,.19,'#ffe0a0');line([[x-.18,y,.98],[x+.18,y,.98]],'#4c5946',.07);}
 function tree(x,y){ellipse(x,y,0,.65,.26,'#102e2655');block(x-.08,y-.08,.16,.16,1,'#786846','#665337','#4b4834');for(const [dx,dy,z,r,c]of [[-.25,0,1.05,.48,'#365e47'],[.25,.05,1.2,.5,'#457653'],[0,-.15,1.5,.55,'#5d8b5c'],[-.1,-.2,1.75,.38,'#749b64']])ellipse(x+dx,y+dy,z,r,r*.7,c);}
 function actor(rig,color,belly,headColor,z=.12){if(!rig?.joints?.length)return;const joints=rig.joints;ellipse(rig.head.x,rig.head.y,0,.45,.18,'#0b292955');if(rig.legs)for(const l of rig.legs){line([[l.root.x,l.root.y,z],[l.elbow.x,l.elbow.y,z*.7],[l.foot.x,l.foot.y,.03]],'#263f2d',.14);line([[l.root.x,l.root.y,z+.02],[l.elbow.x,l.elbow.y,z*.7+.03],[l.foot.x,l.foot.y,.05]],color,.09);}
 const side=(i,sign,scale=1)=>{const p=joints[i],a=rig.angles[i]??rig.headAngle,r=Math.max(.018,rig.widths[i]||.1)*scale;return [p.x-Math.sin(a)*r*sign,p.y+Math.cos(a)*r*sign,z+.03];};const outline=[...joints.map((_p,i)=>side(i,1)),...joints.map((_p,i)=>side(joints.length-1-i,-1))];poly3(outline,color,'#234a37');for(let i=3;i<joints.length-2;i+=3){const p=joints[i],r=rig.widths[i]||.1;ellipse(p.x,p.y,z+.06,r*.27,r*.17,belly);}const hp=rig.head,ha=rig.headAngle,head=[];for(let k=0;k<16;k++){const a=k*Math.PI/8,u=Math.cos(a)*.25,v=Math.sin(a)*.2;head.push([hp.x+Math.cos(ha)*u-Math.sin(ha)*v,hp.y+Math.sin(ha)*u+Math.cos(ha)*v,z+.07]);}poly3(head,headColor,'#31513d');
 const h=rig.head,a=rig.headAngle;for(const side of [-1,1]){const ex=h.x+Math.cos(a)*.12-Math.sin(a)*side*.13,ey=h.y+Math.sin(a)*.12+Math.cos(a)*side*.13;ellipse(ex,ey,z+.14,.067,.05,'#edf0b4');ellipse(ex+Math.cos(a)*.02,ey+Math.sin(a)*.02,z+.16,.027,.028,'#132c27');}}
 function key(x,y){glow(x,y,.38,.8,'#ffe18924');ellipse(x,y,.45,.18,.12,'#ffe19a');ellipse(x,y,.45,.095,.055,'#b1813f');line([[x+.1,y,.45],[x+.5,y,.45],[x+.5,y+.16,.45]],'#ffe19a',.08);}
 function coin(p){ellipse(p.x,p.y,0,.2,.08,'#30493444');poly3([[p.x,p.y-.15,.24],[p.x+.15,p.y,.37],[p.x,p.y+.15,.24],[p.x-.15,p.y,.37]],'#f3cb76','#fff0b1');}
 function bridge(x,y,open){if(!open){line([[x+.15,y+.2,.1],[x+.85,y+.2,.1]],'#ab7b49',.12);return;}block(x,y,1,1,.06,'#c6aa75','#8e704f','#6b593e',-.25);for(let i=1;i<5;i++)line([[x+i*.2,y,.065],[x+i*.2,y+1,.065]],'#8a754d',.018);for(const side of [.06,.94]){line([[x,y+side,.48],[x+1,y+side,.48]],'#b99b65',.045);block(x+.04,y+side-.025,.05,.05,.55,'#dec997','#8c764d','#706245');}}
 function render(){
  camera();const g=state.game,t=reduced.matches?0:state.clock;
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#193d36');bg.addColorStop(.6,'#102f2d');bg.addColorStop(1,'#0b2328');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ellipse(8,7,-1.1,12,4.5,'#081d2266');
  // Diorama foundation and river are painted before depth-sorted solids.
  block(.05,.05,16.9,12.9,-.15,'#54745a','#354e42','#263f3c',-1.05);
  for(let y=0;y<13;y++)for(let x=0;x<17;x++){
   const c=g.grid[y][x],river=x>=7&&x<=9;
   if(river){tile(x,y,-.16,(x+y)%2?'#357d83':'#397f86');if(y%2===0){const offset=Math.sin(t*.6+y)*.1;line([[x+.15+offset,y+.35,-.15],[x+.65+offset,y+.35,-.15]],'#80bbb4',.025);}}
   else tile(x,y,0,(x+y)%2?'#80956c':'#879d72','#4f755f33');
   if(c==='L'){tile(x+.04,y+.04,.025,'#5a8257');for(let i=0;i<4;i++)ellipse(x+.2+(i%2)*.4,y+.2+Math.floor(i/2)*.4,.06,.21,.12,i%2?'#6c945f':'#739965');}
   else if(c==='N')for(let i=0;i<5;i++)ellipse(x+.12+i*.17,y+.22+(i%2)*.3,.015,.05,.025,'#b5b18a');
   else if(!river&&c!== '#'){tile(x+.07,y+.07,.012,(x*7+y*3)%5===0?'#b6b394':'#a9af8b','#78907655');}
  }
  for(const gate of g.gates){for(const [x,y]of gate.tiles)bridge(x,y,gate.open);if(gate.switch){const p=gate.switch;ellipse(p.x,p.y,.04,.38,.17,'#484f3d');ellipse(p.x,p.y,.08,.29,.13,gate.open?'#add6a1':'#edb65d');}}
  ellipse(g.exit.x,g.exit.y,.03,.42,.2,'#224739');line([[g.exit.x-.25,g.exit.y,.09],[g.exit.x+.25,g.exit.y,.09]],'#a7d6a1',.07);glow(g.exit.x,g.exit.y,.1,1.2,g.hasKey?'#b4e9a339':'#b4e9a315');
  if(state.path.length){ctx.setLineDash([3,5]);line([[g.player.x,g.player.y,.04],...state.path.map(p=>[p.x,p.y,.04])],'#f5e2b8',.025);ctx.setLineDash([]);}
  // Render actors and scenery by their ground depth. Tall front walls fade near Sally.
  const draw=[];
  for(let y=0;y<13;y++)for(let x=0;x<17;x++)if(g.grid[y][x]==='#'){
   draw.push({d:x+y+1,draw:()=>{const edge=x===0||y===0||x===16||y===12,h=edge?.34:.72,p=g.player,near=p.x+p.y<x+y+1&&Math.hypot(p.x-x-.5,p.y-y-.5)<2.8;ctx.save();if(near&&state.walls)ctx.globalAlpha=.28;block(x+.03,y+.03,.94,.94,state.walls?h:.18,edge?'#66805f':'#a5a78b',edge?'#465d49':'#747e68',edge?'#354d43':'#5e715f');if(!edge&&state.walls)line([[x+.1,y+.5,h+.005],[x+.9,y+.5,h+.005]],'#c2bda0',.022);ctx.restore();}});
  }
  const props=[{x:1.7,y:1.7,kind:'tree'},{x:5.8,y:9.5,kind:'tree'},{x:1.5,y:5.4,kind:'tree'},{x:11,y:1.4,kind:'lantern'},{x:6.4,y:3.5,kind:'lantern'},{x:10.5,y:9.5,kind:'lantern'},{x:3.5,y:10.9,kind:'lantern'},{x:15,y:11,kind:'tree'}];
  for(const p of props)draw.push({d:p.x+p.y,draw:()=>p.kind==='tree'?tree(p.x,p.y):lantern(p.x,p.y)});
  // A mill shed is rooted in the solid eastern garden wall; its roof lifts near the player.
  draw.push({d:18.1,draw:()=>{ctx.save();const p=g.player;if(p.x+p.y<18&&Math.hypot(p.x-14,p.y-4)<3)ctx.globalAlpha=.32;block(13,3,2,1,1.35,'#a18c63','#b4a778','#8e8c67');poly3([[12.8,2.85,1.35],[14,2.85,2.2],[14,4.2,2.2],[12.8,4.2,1.35]],'#566d59');poly3([[14,2.85,2.2],[15.2,2.85,1.35],[15.2,4.2,1.35],[14,4.2,2.2]],'#3a554b');ellipse(14.8,4.02,.85,.15,.19,'#ffd88a');ctx.restore();}});
  for(const p of g.loot)if(!p.taken)draw.push({d:p.x+p.y,draw:()=>coin(p)});
  if(!g.hasKey)draw.push({d:g.key.x+g.key.y,draw:()=>key(g.key.x,g.key.y)});
  g.hunters.forEach((h,i)=>draw.push({d:h.x+h.y+.1,draw:()=>{actor(g.motion.snakes[i],'#b8a669','#e1cf96','#c8b776',.12);if(h.awareness>.1){const p=P(h.x,h.y,.85);ctx.fillStyle='#ffe0a3';ctx.font='bold '+Math.max(12,S*.4)+'px system-ui';ctx.textAlign='center';ctx.fillText(h.state==='chase'?'!':'?',p[0],p[1]);}}}));
  draw.push({d:g.player.x+g.player.y+.15,draw:()=>actor(g.motion.lizard,g.player.hidden?'#88a76a':'#91bf74','#d3e4a1','#add58b',.17)});
  draw.sort((a,b)=>a.d-b.d);for(const item of draw)item.draw();
  for(const light of g.lights){glow(light.x,light.y,.1,Math.min(4,light.radius||4),'#d4ed9735');ellipse(light.x,light.y,.18,.13,.1,'#e1f9b8');}
  for(const f of g.flights)if(f.pos)ellipse(f.pos.x,f.pos.y,.35,.1,.08,f.kind==='glow'?'#deef9e':'#d9d4bb');
  if(g.decoy)ellipse(g.decoy.x,g.decoy.y,.05,.09,.06,'#d9d4bb');
  if(g.tongue)line([[g.player.x,g.player.y,.2],[g.tongue.point.x,g.tongue.point.y,.2]],'#ed9b9e',.055);
  if(state.held){const p=g.player,d=p.throwAim||p.facing;ctx.setLineDash([4,5]);line([[p.x,p.y,.12],[p.x+d.x*3,p.y+d.y*3,.12]],'#f5e8ba',.03);ctx.setLineDash([]);}
  $('stats').textContent='Treasure '+g.treasure+' / '+g.totalTreasure+'  ·  Pebbles '+g.decoys+'  ·  Glow '+g.glows+'  ·  Tongue '+g.tongues;
  $('objective').textContent=g.hasKey?'Key found · The south bridge leads home':g.gates[0].open?'North bridge open · Find the key beyond the mill':'Step on the amber switch · Lower the north bridge';
  $('message').textContent=g.paused?'Paused · Resume when you are ready':g.elapsed<g.messageUntil?g.message:g.level.hint;
  if(g.status!=='playing'&&!state.read){state.read=true;clearControls();$('result').hidden=false;$('result-title').textContent=g.status==='won'?'A new way home':'Nearly. Try another way';$('result-copy').textContent=g.status==='won'?'The Lantern Mill is complete. '+g.treasure+' of '+g.totalTreasure+' treasure found.':g.message;$('again').focus();}
 }
 function tick(now){const dt=Math.min(.05,Math.max(0,(now-state.last)/1000||0));state.last=now;state.clock+=dt;const i=input();state.game.advance(dt,i);render();requestAnimationFrame(tick);}
 // Exposed only on this isolated review page for reproducible browser checks.
 window.IsometricExample={state,reset,render,input,camera,project:(x,y,z=0)=>P(x,y,z),pause,tool,mode};
 reset();resize();if(navigator.maxTouchPoints>0)mode('touch');$('view').textContent=state.close?'View: Close':'View: Whole';requestAnimationFrame(tick);
})();
