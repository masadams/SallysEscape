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
 function lantern(x,y){
  glow(x,y,.82,1.65,'#ffcb6b38');softShadow(x,y,.27,.13,.25);const faces=[];
  tube(faces,[x,y,.02],[x,y,.81],.052,.035,'#4a5a4c',8);mesh(faces);
  block(x-.11,y-.11,.22,.22,.99,'#d4b677','#d7b474','#be9358',.72);
  poly3([[x-.11,y+.115,.76],[x+.11,y+.115,.76],[x+.11,y+.115,.96],[x-.11,y+.115,.96]],'#ffdc8f');
  poly3([[x+.115,y-.11,.76],[x+.115,y+.11,.76],[x+.115,y+.11,.96],[x+.115,y-.11,.96]],'#edbf6c');
  for(const [dx,dy]of [[-.12,-.12],[.12,-.12],[.12,.12],[-.12,.12]])line([[x+dx,y+dy,.72],[x+dx,y+dy,1]],'#4a5847',.025);
  poly3([[x-.17,y-.17,.99],[x+.17,y-.17,.99],[x,y,1.14]],'#64715a');poly3([[x+.17,y-.17,.99],[x+.17,y+.17,.99],[x,y,1.14]],'#415743');poly3([[x+.17,y+.17,.99],[x-.17,y+.17,.99],[x,y,1.14]],'#526449');
 }
 const treeMeshes=new Map();
 function tree(x,y){
  softShadow(x+.25,y+.2,.9,.4,.37);const id=x+','+y;
  if(!treeMeshes.has(id)){const faces=[];tube(faces,[x,y,.03],[x,y,1.35],.12,.075,'#8a7250',9);tube(faces,[x,y,.75],[x-.28,y,1.35],.07,.03,'#8a7250',7);tube(faces,[x,y,.94],[x+.28,y+.03,1.5],.06,.025,'#8a7250',7);
   for(const [dx,dy,z,rx,ry,rz,c]of [[-.27,0,1.3,.48,.4,.4,'#527c4b'],[.27,.04,1.42,.5,.44,.46,'#648d54'],[0,-.15,1.72,.55,.46,.52,'#78a05e'],[-.12,-.1,1.97,.37,.33,.34,'#88ab68']])sphere(faces,[x+dx,y+dy,z],[rx,ry,rz],c,0,6,10);
   treeMeshes.set(id,faces);
  }mesh(treeMeshes.get(id));
 }
 function grain(x,y,n=0){const v=Math.sin(x*127.1+y*311.7+n*74.7)*43758.5453;return v-Math.floor(v);}
 function stone(x,y,edge,h){
  softShadow(x+.5,y+.5,.72,.24,.19);
  const colors=edge?['#738369','#78876b','#6c7c63']:['#a5a68b','#acac90','#9da187'],c=colors[Math.floor(grain(x,y)*colors.length)];
  block(x+.03,y+.03,.94,.94,h,c,edge?'#52634e':'#7a826b',edge?'#405646':'#63735e');
  // Bevel highlights, horizontal mortar and little weathered chips follow the solid faces.
  line([[x+.05,y+.96,h-.045],[x+.95,y+.96,h-.045]],edge?'#8d9a77':'#c4c2a0',.025);
  line([[x+.96,y+.05,h-.045],[x+.96,y+.95,h-.045]],'#7e8b6d',.018);
  if(h>.4){line([[x+.04,y+.972,h*.43],[x+.95,y+.972,h*.43]],'#5f715b',.018);line([[x+.972,y+.04,h*.43],[x+.972,y+.95,h*.43]],'#4c6453',.018);}
  for(let i=0;i<5;i++){const u=.12+grain(x,y,i+4)*.72,v=.12+grain(x,y,i+13)*.72;
   line([[x+u,y+v,h+.004],[x+u+.045,y+v+.02,h+.004]],i%2?'#cad0ab66':'#657e5a66',.018);
  }
  if(grain(x,y,22)>.6){const u=.15+grain(x,y,26)*.5;line([[x+u,y+.12,h+.008],[x+u+.08,y+.27,h+.008],[x+u+.04,y+.35,h+.008]],'#79896b',.015);}
 }
 function paver(x,y){
  const n=grain(x,y),c=['#b2b294','#b9b79a','#aeb197','#b8b69a'][Math.floor(n*4)],a=.065,b=.935,cut=.08;
  const pts=[[x+a+cut,y+a,.015],[x+b-cut,y+a,.015],[x+b,y+a+cut,.015],[x+b,y+b-cut,.015],[x+b-cut,y+b,.015],[x+a+cut,y+b,.015],[x+a,y+b-cut,.015],[x+a,y+a+cut,.015]];
  poly3(pts,c,'#7f9271');line([[x+a+cut,y+a,.021],[x+b-cut,y+a,.021],[x+b,y+a+cut,.021]],'#d5cfaa88',.018);
  for(let i=0;i<4;i++){const u=.12+grain(x,y,i+31)*.72,v=.12+grain(x,y,i+39)*.72;line([[x+u,y+v,.023],[x+u+.035,y+v,.023]],i%2?'#d2cdb166':'#7f95735e',.018);}
  if(n>.76)line([[x+.25,y+.2,.024],[x+.4,y+.45,.024],[x+.37,y+.61,.024]],'#8d9b7b88',.012);
 }
 // Small world-space meshes give the creatures real rounded volume under the same projection.
 const sun={x:-.35,y:-.5,z:.79};
 function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
 function lit(color,n){const c=rgb(color),d=.59+Math.max(0,n.x*sun.x+n.y*sun.y+n.z*sun.z)*.48,bounce=Math.max(0,-n.z)*.09;return 'rgb('+c.map((v,i)=>Math.round(Math.min(255,v*(d+bounce)+(i===0?6:i===1?7:5)))).join(',')+')';}
 function face(list,points,color,inside){
  const a=points[0],b=points[1],c=points[2],u=b.map((v,i)=>v-a[i]),v=c.map((q,i)=>q-a[i]);
  let n={x:u[1]*v[2]-u[2]*v[1],y:u[2]*v[0]-u[0]*v[2],z:u[0]*v[1]-u[1]*v[0]};
  const mid=[0,1,2].map(i=>points.reduce((s,p)=>s+p[i],0)/points.length);
  if(inside&&n.x*(mid[0]-inside[0])+n.y*(mid[1]-inside[1])+n.z*(mid[2]-inside[2])<0)n={x:-n.x,y:-n.y,z:-n.z};
  if(Math.hypot(n.x,n.y,n.z)<1e-8){const w=points.at(-1).map((q,i)=>q-a[i]);n={x:u[1]*w[2]-u[2]*w[1],y:u[2]*w[0]-u[0]*w[2],z:u[0]*w[1]-u[1]*w[0]};if(inside&&n.x*(mid[0]-inside[0])+n.y*(mid[1]-inside[1])+n.z*(mid[2]-inside[2])<0)n={x:-n.x,y:-n.y,z:-n.z};}const length=Math.hypot(n.x,n.y,n.z);if(length<1e-8)return;n={x:n.x/length,y:n.y/length,z:n.z/length};
  if(n.x+n.y+n.z<-.02)return;
  list.push({points,color:lit(color,n),depth:mid[0]+mid[1]+mid[2]});
 }
 function mesh(list){list.sort((a,b)=>a.depth-b.depth);for(const f of list)poly3(f.points,f.color);}
 function sphere(list,center,radii,color,angle=0,rings=7,slices=12){
  const point=(i,j)=>{const lat=-Math.PI/2+Math.PI*i/rings,theta=Math.PI*2*j/slices,x=Math.cos(lat)*Math.cos(theta)*radii[0],y=Math.cos(lat)*Math.sin(theta)*radii[1];return [center[0]+x*Math.cos(angle)-y*Math.sin(angle),center[1]+x*Math.sin(angle)+y*Math.cos(angle),center[2]+Math.sin(lat)*radii[2]];};
  for(let i=0;i<rings;i++)for(let j=0;j<slices;j++){const p=[point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)];face(list,p,i>rings-2?color:color,center);}
 }
 function tube(list,a,b,ra,rb,color,slices=8){
  const axis=b.map((v,i)=>v-a[i]),n=Math.hypot(...axis)||1,d=axis.map(v=>v/n),ref=Math.abs(d[2])>.9?[1,0,0]:[0,0,1],u=[d[1]*ref[2]-d[2]*ref[1],d[2]*ref[0]-d[0]*ref[2],d[0]*ref[1]-d[1]*ref[0]],un=Math.hypot(...u);for(let k=0;k<3;k++)u[k]/=un;
  const v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]];
  const p=(q,r,i)=>q.map((x,k)=>x+r*(u[k]*Math.cos(i*Math.PI*2/slices)+v[k]*Math.sin(i*Math.PI*2/slices)));
  for(let i=0;i<slices;i++)face(list,[p(a,ra,i),p(b,rb,i),p(b,rb,i+1),p(a,ra,i+1)],color,a.map((v,i)=>(v+b[i])/2));
 }
 function softShadow(x,y,rx,ry,alpha=.3){const p=P(x+.14,y+.15,.005);ctx.save();ctx.translate(...p);ctx.scale(rx*S,ry*S);const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba(10,32,29,'+alpha+')');g.addColorStop(1,'rgba(10,32,29,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();}
 function actor(rig,color,belly,headColor,z=.12){
  if(!rig?.joints?.length)return;const joints=rig.joints,faces=[],sally=!!rig.legs,base=sally?.23:.12;
  for(let i=0;i<joints.length;i+=3)softShadow(joints[i].x,joints[i].y,.34,.16,.2);
  if(sally)for(const l of rig.legs){
   const a=[l.root.x,l.root.y,.25],b=[l.elbow.x,l.elbow.y,.13],c=[l.foot.x,l.foot.y,.045+(l.lift||0)*.1];
   tube(faces,a,b,.06,.045,color);tube(faces,b,c,.045,.025,color);sphere(faces,b,[.052,.052,.05],headColor,0,4,8);
   for(let i=-1;i<=1;i++){const angle=(l.footAngle||0)+i*.38;line([c,[c[0]+Math.cos(angle)*.11,c[1]+Math.sin(angle)*.11,c[2]]],'#91ac6b',.025);}
  }
  // The body is an elliptical tube following the native spine, with lit sides and belly.
  const sections=10,rings=joints.map((p,i)=>{const a=rig.angles[i]??rig.headAngle,r=Math.max(.014,rig.widths[i]||.1);return Array.from({length:sections},(_,j)=>{const theta=j*Math.PI*2/sections,side=Math.cos(theta)*r;return [p.x-Math.sin(a)*side,p.y+Math.cos(a)*side,base+Math.sin(theta)*r*.78];});});
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<sections;j++){
   const theta=(j+.5)*Math.PI*2/sections,top=Math.sin(theta),p=joints[i],next=joints[i+1],inside=[(p.x+next.x)/2,(p.y+next.y)/2,base];
   const material=top<-.2?belly:top>.7&&i%4===1?(sally?'#a3cc80':'#d3bf7d'):color;
   face(faces,[rings[i][j],rings[i+1][j],rings[i+1][(j+1)%sections],rings[i][(j+1)%sections]],material,inside);
  }
  const h=rig.head,a=rig.headAngle,headZ=base+.045;
  sphere(faces,[h.x,h.y,headZ],[sally?.29:.24,sally?.22:.18,sally?.2:.14],headColor,a,8,14);
  // Raised eye sockets and pupils are small meshes, not painted circles.
  for(const side of [-1,1]){
   const ex=h.x+Math.cos(a)*.12-Math.sin(a)*side*.16,ey=h.y+Math.sin(a)*.12+Math.cos(a)*side*.16;
   sphere(faces,[ex,ey,headZ+.14],[.085,.073,.09],sally?'#c3d78e':'#e7d6a1',a,5,9);
   const forward=.045;sphere(faces,[ex+Math.cos(a)*forward,ey+Math.sin(a)*forward,headZ+.185],[.038,.035,.046],'#20352d',a,5,8);
   sphere(faces,[ex+Math.cos(a)*forward-.012,ey+Math.sin(a)*forward-.012,headZ+.218],[.011,.011,.014],'#fff5cb',0,3,6);
  }
  if(sally)for(let i=3;i<Math.min(joints.length-2,11);i+=2){const p=joints[i],a=rig.angles[i],r=rig.widths[i]||.1;face(faces,[[p.x-Math.cos(a)*.075,p.y-Math.sin(a)*.075,base+r*.6],[p.x,p.y,base+r*.8+.11],[p.x+Math.cos(a)*.075,p.y+Math.sin(a)*.075,base+r*.6]],'#d3d99a');}
  mesh(faces);
  // A small mouth seam follows the front of the snout in world space.
  const nose=[h.x+Math.cos(a)*.24,h.y+Math.sin(a)*.24,headZ-.015];
  if(Math.cos(a)+Math.sin(a)>-.1)line([[nose[0]-Math.sin(a)*.09,nose[1]+Math.cos(a)*.09,nose[2]],[nose[0]+Math.sin(a)*.09,nose[1]-Math.cos(a)*.09,nose[2]]],'#426040',.018);
 }
 function key(x,y){glow(x,y,.38,.8,'#ffe18924');ellipse(x,y,.45,.18,.12,'#ffe19a');ellipse(x,y,.45,.095,.055,'#b1813f');line([[x+.1,y,.45],[x+.5,y,.45],[x+.5,y+.16,.45]],'#ffe19a',.08);}
 function coin(p){softShadow(p.x,p.y,.25,.12,.22);const faces=[];sphere(faces,[p.x,p.y,.23],[.12,.12,.19],'#f4cc73',Math.PI/4,4,6);mesh(faces);}
 function bridge(x,y,open){
  if(!open){line([[x+.15,y+.2,.1],[x+.85,y+.2,.1]],'#ab7b49',.12);return;}
  block(x,y,1,1,.06,'#c6aa75','#8e704f','#6b593e',-.25);
  for(let i=0;i<5;i++){
   const a=x+i*.2;poly3([[a+.012,y+.025,.065],[a+.188,y+.025,.065],[a+.188,y+.975,.065],[a+.012,y+.975,.065]],['#bd9d66','#c9ac75','#bfa16f'][i%3]);
   for(let j=0;j<2;j++)line([[a+.045+j*.07,y+.15,.07],[a+.06+j*.065,y+.35,.07],[a+.04+j*.075,y+.65,.07],[a+.05+j*.07,y+.86,.07]],'#8f724a66',.012);
   for(const v of [.12,.88])ellipse(a+.1,y+v,.073,.018,.01,'#62624f');
  }
  for(const side of [.06,.94]){line([[x,y+side,.48],[x+1,y+side,.48]],'#b99b65',.055);block(x+.04,y+side-.03,.06,.06,.56,'#dec997','#8c764d','#706245');}
 }
 function render(){
  camera();const g=state.game,t=reduced.matches?0:state.clock;
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#193d36');bg.addColorStop(.6,'#102f2d');bg.addColorStop(1,'#0b2328');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ellipse(8,7,-1.1,12,4.5,'#081d2266');
  // Diorama foundation and river are painted before depth-sorted solids.
  block(.05,.05,16.9,12.9,-.15,'#54745a','#354e42','#263f3c',-1.05);
  for(let y=0;y<13;y++)for(let x=0;x<17;x++){
   const c=g.grid[y][x],river=x>=7&&x<=9;
   if(river){tile(x,y,-.16,x===8?'#286a77':x===7?'#3c8789':'#348089');for(let i=0;i<3;i++){const flow=(y*.23+t*.25+i*.31)%1,u=.1+grain(x,y,i)*.55;line([[x+u,y+flow,-.15],[x+u+.18,y+flow+.06,-.15],[x+u+.29,y+flow+.02,-.15]],x===8?'#7ab6b855':'#9cc8bc66',.016);}if(x===7||x===9)line([[x+(x===7?.025:.97),y,-.14],[x+(x===7?.025:.97),y+1,-.14]],'#afc6a680',.055);}
   else tile(x,y,0,['#718967','#78906b','#7d936c'][Math.floor(grain(x,y)*3)],'#4f755f33');
   if(c==='L'){tile(x+.04,y+.04,.025,'#5a8257');for(let i=0;i<4;i++)ellipse(x+.2+(i%2)*.4,y+.2+Math.floor(i/2)*.4,.06,.21,.12,i%2?'#6c945f':'#739965');}
   else if(c==='N')for(let i=0;i<5;i++)ellipse(x+.12+i*.17,y+.22+(i%2)*.3,.015,.05,.025,'#b5b18a');
   else if(!river&&c!== '#'){paver(x,y);}
  }
  for(const gate of g.gates){for(const [x,y]of gate.tiles)bridge(x,y,gate.open);if(gate.switch){const p=gate.switch;ellipse(p.x,p.y,.04,.38,.17,'#484f3d');ellipse(p.x,p.y,.08,.29,.13,gate.open?'#add6a1':'#edb65d');}}
  ellipse(g.exit.x,g.exit.y,.03,.42,.2,'#224739');line([[g.exit.x-.25,g.exit.y,.09],[g.exit.x+.25,g.exit.y,.09]],'#a7d6a1',.07);glow(g.exit.x,g.exit.y,.1,1.2,g.hasKey?'#b4e9a339':'#b4e9a315');
  if(state.path.length){ctx.setLineDash([3,5]);line([[g.player.x,g.player.y,.04],...state.path.map(p=>[p.x,p.y,.04])],'#f5e2b8',.025);ctx.setLineDash([]);}
  // Render actors and scenery by their ground depth. Tall front walls fade near Sally.
  const draw=[];
  for(let y=0;y<13;y++)for(let x=0;x<17;x++)if(g.grid[y][x]==='#'){
   draw.push({d:x+y+1,draw:()=>{const edge=x===0||y===0||x===16||y===12,h=edge?.34:.72,p=g.player,near=p.x+p.y<x+y+1&&Math.hypot(p.x-x-.5,p.y-y-.5)<2.8;ctx.save();if(near&&state.walls)ctx.globalAlpha=.28;stone(x,y,edge,state.walls?h:.18);ctx.restore();}});
  }
  const props=[{x:1.7,y:1.7,kind:'tree'},{x:5.8,y:9.5,kind:'tree'},{x:1.5,y:5.4,kind:'tree'},{x:11,y:1.4,kind:'lantern'},{x:6.4,y:3.5,kind:'lantern'},{x:10.5,y:9.5,kind:'lantern'},{x:3.5,y:10.9,kind:'lantern'},{x:15,y:11,kind:'tree'}];
  for(const p of props)draw.push({d:p.x+p.y,draw:()=>p.kind==='tree'?tree(p.x,p.y):lantern(p.x,p.y)});
  // A mill shed is rooted in the solid eastern garden wall; its roof lifts near the player.
  draw.push({d:18.1,draw:()=>{ctx.save();const p=g.player;if(p.x+p.y<18&&Math.hypot(p.x-14,p.y-4)<3)ctx.globalAlpha=.32;block(13,3,2,1,1.35,'#a18c63','#b4a778','#8e8c67');poly3([[12.8,2.85,1.35],[14,2.85,2.2],[14,4.2,2.2],[12.8,4.2,1.35]],'#566d59');poly3([[14,2.85,2.2],[15.2,2.85,1.35],[15.2,4.2,1.35],[14,4.2,2.2]],'#3a554b');for(let i=0;i<5;i++){const y=2.93+i*.26;line([[12.85,y,1.39],[14,y,2.2]],'#84916a',.018);line([[14,y,2.2],[15.15,y,1.39]],'#28493d',.018);}for(let i=1;i<4;i++){const x=12.8+i*.3,z=1.35+(x-12.8)/1.2*.85;line([[x,2.86,z+.012],[x,4.18,z+.012]],'#3f5d49',.014);}for(let i=0;i<5;i++){const z=.12+i*.22;line([[13.02,4.012,z],[14.98,4.012,z]],'#7b7b59',.018);}poly3([[13.32,4.022,.05],[13.88,4.022,.05],[13.88,4.022,1],[13.32,4.022,1]],'#6b6547');line([[13.6,4.03,.08],[13.6,4.03,.96]],'#8b8055',.025);ellipse(13.8,4.04,.52,.025,.025,'#edce82');poly3([[14.35,4.025,.58],[14.83,4.025,.58],[14.83,4.025,1.02],[14.35,4.025,1.02]],'#5c6448');poly3([[14.41,4.03,.63],[14.77,4.03,.63],[14.77,4.03,.97],[14.41,4.03,.97]],'#f4d18a');line([[14.59,4.04,.64],[14.59,4.04,.96]],'#9b8859',.025);glow(14.6,4.1,.8,1.15,'#f4c66b23');ctx.restore();}});
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
