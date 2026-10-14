(function(root){
  function cameraFor(game,width,height,overview=false){
    const follow=Boolean((game.level.explore||height<250)&&(!overview||game.level.dark));
    const normal=height<250?Math.min(28,(height-16)/7):width<600?28:44,gazeSpan=2*(game.level.sightRadius||6)+1;
    const cell=follow?(game.level.gaze?Math.min(normal,(width-24)/gazeSpan,(height-24)/gazeSpan):normal):Math.min((width-24)/game.width,(height-46)/game.height);
    const clamp=(n,min,max)=>max<min?(min+max)/2:Math.max(min,Math.min(max,n));
    const cx=follow?clamp(game.player.x,width/(2*cell),game.width-width/(2*cell)):game.width/2;
    const cy=follow?clamp(game.player.y,height/(2*cell),game.height-height/(2*cell)):game.height/2;
    return {follow,cell,ox:width/2-cx*cell,oy:height/2-cy*cell};
  }
  root.escapeCameraFor=cameraFor;
  if(typeof module!=='undefined'&&module.exports)module.exports={escapeCameraFor:cameraFor};
})(typeof globalThis!=='undefined'?globalThis:this);
