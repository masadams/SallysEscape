// Adaptive music: synchronised loop stems whose volumes follow the game.
// Everything about the music lives in a manifest (audio/music/manifest.json),
// so a different pack — or Sally's own theme — replaces it without code changes.
(function(root){
  const DEFAULT_FADE=1.5;
  // Pick the music state for what is happening right now. Pure, so it is easy to test.
  function stateFor({screen,game}={}){
    if(screen==='menu')return 'menu';
    if(screen==='world')return 'world';
    if(!game)return 'world';
    if(game.status==='won')return 'victory';
    if(game.status&&game.status!=='playing')return 'caught';
    const chasing=['chase','charge','sting','leap','swoop','lunge','dash','flee'],wary=['alert','search','windup','glimmer','glare','reveal','decoy'];
    const hunters=game.hunters||[];
    if(hunters.some(h=>chasing.includes(h.state))||game.hawk&&game.hawk.state==='dive'||game.droppedTail)return 'chase';
    if(hunters.some(h=>wary.includes(h.state))||game.hawk&&game.hawk.state==='stalk'||game.player?.chilled)return 'tension';
    return 'explore';
  }
  class EscapeMusic{
    constructor(options={}){
      this.manifestUrl=options.manifestUrl||'audio/music/manifest.json';this.fetch=options.fetch||root.fetch?.bind(root);
      this.context=null;this.manifest=null;this.layers=new Map();this.bus=null;this.state=null;this.volume=options.volume??.6;this.muted=false;
      this.loading=null;this.started=false;this.track=null;this.holdUntil=0;this.canPlay=options.canPlay||(type=>{try{return Boolean(root.document?.createElement('audio').canPlayType(type));}catch(_){return false;}});
    }
    // Load the manifest and decode one track's stems. Missing files leave the game silent, never broken.
    load(context,trackId){
      if(this.loading)return this.loading;this.context=context;
      this.loading=(async()=>{
        try{
          const response=await this.fetch(this.manifestUrl);if(!response?.ok)return false;
          this.manifest=await response.json();const id=trackId||this.manifest.defaultTrack||Object.keys(this.manifest.tracks||{})[0],track=this.manifest.tracks?.[id];if(!track||!track.loopSeconds)return false;this.track={id,...track}; // loopSeconds is written by the build once real stems exist.
          this.bus=context.createGain();this.bus.gain.value=this.muted?0:this.volume;this.bus.connect(context.destination);
          await Promise.all(Object.entries(track.layers||{}).map(async([name,sources])=>{
            const list=Array.isArray(sources)?sources:[sources],src=list.find(s=>this.canPlay(EscapeMusic.mimeFor(s)))||list[0];
            try{const file=await this.fetch(src);if(!file?.ok)return;const buffer=await context.decodeAudioData(await file.arrayBuffer());const gain=context.createGain();gain.gain.value=0;gain.connect(this.bus);this.layers.set(name,{buffer,gain,source:null});}
            catch(_){/* A missing or undecodable stem is skipped. */}
          }));
          return this.layers.size>0;
        }catch(_){return false;}
      })();
      return this.loading;
    }
    static mimeFor(file){const ext=String(file).split('.').pop().toLowerCase();return {ogg:'audio/ogg; codecs="vorbis"',opus:'audio/ogg; codecs="opus"',m4a:'audio/mp4; codecs="mp4a.40.2"',mp3:'audio/mpeg',wav:'audio/wav'}[ext]||'';}
    // Start every stem on the same sample so the layers stay locked together.
    start(){
      if(this.started||!this.context||!this.layers.size)return false;
      const at=this.context.currentTime+.08,loop=this.track.loopSeconds;
      for(const layer of this.layers.values()){const s=this.context.createBufferSource();s.buffer=layer.buffer;s.loop=true;if(loop&&loop<=layer.buffer.duration+1e-3){s.loopStart=0;s.loopEnd=loop;}s.connect(layer.gain);s.start(at);layer.source=s;}
      this.started=true;if(this.state)this.apply(this.state,0);return true;
    }
    // Fade each stem toward the mix the manifest gives for this state.
    setState(state,now=0){
      if(state===this.state)return false;
      // Chase music holds briefly so a hunter flickering in and out of sight does not pump the mix.
      if(this.state==='chase'&&!['victory','caught','world','menu'].includes(state)&&now<this.holdUntil)return false;
      const previous=this.state;this.state=state;if(state==='chase')this.holdUntil=now+(this.manifest?.chaseHoldSeconds??2.5);
      const fades=this.manifest?.fades||{},seconds=fades[previous+'>'+state]??fades['*>'+state]??fades[previous+'>*']??fades.default??DEFAULT_FADE;
      this.apply(state,seconds);return true;
    }
    apply(state,seconds){
      if(!this.context||!this.layers.size)return;const mix=this.manifest?.states?.[state]||{},t=this.context.currentTime;
      for(const [name,layer] of this.layers){const g=layer.gain.gain,target=Math.max(0,Math.min(1,mix[name]??0));g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(target,t+Math.max(.01,seconds));}
    }
    setVolume(volume,muted=this.muted){if(volume===this.volume&&muted===this.muted&&this.busReady)return;this.volume=volume;this.muted=muted;this.busReady=Boolean(this.bus);if(!this.bus||!this.context)return;const t=this.context.currentTime,g=this.bus.gain;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(muted?0:volume,t+.25);}
  }
  EscapeMusic.stateFor=stateFor;
  root.EscapeMusic=EscapeMusic;
  if(typeof module!=='undefined'&&module.exports)module.exports={EscapeMusic};
})(typeof globalThis!=='undefined'?globalThis:this);
