(function(root){
  // close: a phone's close view, which follows Sally at a readable size instead of shrinking the
  // whole map to fit a short landscape screen.
  function cameraFor(game,width,height,overview=false,close=false){
    let follow=Boolean((game.level.explore||height<250)&&(!overview||game.level.dark));
    const normal=height<250?Math.min(28,(height-16)/7):width<600?28:44,gazeSpan=2*(game.level.sightRadius||6)+1;
    let cell=follow?(game.level.gaze?Math.min(normal,(width-24)/gazeSpan,(height-24)/gazeSpan):normal):Math.min((width-24)/game.width,(height-46)/game.height);
    const near=Math.min(width/15,height/9.5);
    if(close&&!follow&&near>cell*1.15){follow=true;cell=near;}
    // A map too big to fit at a readable size (The Long Way Home on a laptop) follows Sally instead,
    // unless the player chose the whole-map view.
    const legible=width<600?18:26;
    if(!follow&&!overview&&cell<legible){follow=true;cell=Math.min(normal,Math.max(legible+4,Math.min(width/30,height/18)));}
    const clamp=(n,min,max)=>max<min?(min+max)/2:Math.max(min,Math.min(max,n));
    const cx=follow?clamp(game.player.x,width/(2*cell),game.width-width/(2*cell)):game.width/2;
    const cy=follow?clamp(game.player.y,height/(2*cell),game.height-height/(2*cell)):game.height/2;
    return {follow,cell,ox:width/2-cx*cell,oy:height/2-cy*cell};
  }
  root.escapeCameraFor=cameraFor;
  if(typeof module!=='undefined'&&module.exports)module.exports={escapeCameraFor:cameraFor};
})(typeof globalThis!=='undefined'?globalThis:this);
