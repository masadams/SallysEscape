// A review-only custom route and projection. No campaign/catalog/save registration.
(function(root){
 'use strict';
 const raw={
  id:'isometric-lantern-mill',name:'The Lantern Mill',width:17,height:13,cunning:0,revision:1,
  rooms:[[1,1,15,11]],spawn:[2,10],exit:[2,11],key:[14,2],
  walls:[[12,3],[13,3],[14,3],[15,3],[12,5],[13,5],[14,5],[15,5],[12,6],[12,7],[12,8],[12,9],[3,6],[4,6],[5,6]],
  cover:[[2,7],[2,8],[3,8],[5,4],[6,4],[11,7],[11,8]],
  gravel:[[4,2],[5,2],[6,2]],cracks:[],burrows:0,pebbles:3,tongues:2,glows:1,
  gaps:Array.from({length:11},(_,y)=>[7,8,9].map(x=>[x,y+1])).flat(),
  loot:[[3,9,1],[5,7,1],[2,4,1],[6,2,1],[11,2,1],[14,1,1],[11,5,1],[10,7,1],[5,10,1],[4,11,1]],
  gates:[
   {id:'mill-bridge',name:'mill bridge',tiles:[[7,3],[8,3],[9,3]],switch:[5,3],bridge:true,color:[233,181,92]},
   {id:'return-bridge',name:'return bridge',tiles:[[7,9],[8,9],[9,9]],bridge:true,color:[145,197,166]}
  ],
  reactions:[{id:'key-home',when:'key',open:['return-bridge'],message:'The key lowers the south bridge. A short way home!'}],
  guards:[{kind:'snake',spawn:[14,7],patrol:[[14,7],[14,9],[13,9],[13,7]],facing:Math.PI/2}],
  hint:'Step on the amber switch to lower the north bridge. Find the key, then take the south bridge home.'
 };
 function clone(){return JSON.parse(JSON.stringify(raw));}
 function project(x,y,z=0){return {x:x-y,y:(x+y)*.5-z};}
 function unproject(x,y){return {x:y+x*.5,y:y-x*.5};}
 function screenInput(x,y){return {x:(x+y)*Math.SQRT1_2,y:(y-x)*Math.SQRT1_2};}
 const api={level:clone,project,unproject,screenInput};
 root.SallyIsometric=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
