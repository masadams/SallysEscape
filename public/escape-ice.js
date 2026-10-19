// Shared fixed-step traction for authored skating surfaces and the seasonal sled.
(function(root){
 'use strict';
 function steer(v,input,speed,dt,{ice=true,brake=false,grip=1}={}){
  const n=Math.max(1,Math.hypot(input.x||0,input.y||0)),x=(input.x||0)/n,y=(input.y||0)/n;
  const moving=Math.hypot(x,y)>0,accel=(ice?(brake?7:2.6):20)*grip;
  if(moving){const dx=x*speed-v.x,dy=y*speed-v.y,d=Math.hypot(dx,dy),step=Math.min(d,accel*dt);if(d>0){v.x+=dx/d*step;v.y+=dy/d*step;}}
  else{const drag=ice?(brake?7:.7):22,k=Math.exp(-drag*dt);v.x*=k;v.y*=k;}
  const max=4.5,L=Math.hypot(v.x,v.y);if(L>max){v.x*=max/L;v.y*=max/L;}
  if(Math.hypot(v.x,v.y)<.018){v.x=0;v.y=0;}
  return {x:v.x*dt,y:v.y*dt};
 }
 function currentAt(currents,p,water=false){return currents.find(c=>(c.surface==='ground'?!water:water)&&p.x>=c.x1&&p.x<c.x2+1&&p.y>=c.y1&&p.y<c.y2+1)||null;}
 const api={steer,currentAt};root.EscapeIce=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
