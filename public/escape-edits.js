// The level workshop's drafts: behind-the-scenes edits of the game's own escapes, made in the
// builder from the admin area. Drafts live only in this browser and are never published. With
// the test-in-game switch on, each draft replaces its escape in this browser (the catalog reads
// EscapeEdits.overrides() as it is built), so a draft can be played from the map like the real
// thing; runs on a draft never count toward progress. Export turns drafts into a file that
// scripts/apply-level-edits.cjs brings into the game.
(function(root){
  const KEY='sally-escape-workshop-v1';
  const store=(()=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch(_){return null;}})();
  function read(){try{const s=JSON.parse(store?.getItem(KEY)||'{}');return {on:Boolean(s.on),drafts:s.drafts&&typeof s.drafts==='object'?s.drafts:{}};}catch(_){return {on:false,drafts:{}};}}
  function write(state){try{store?.setItem(KEY,JSON.stringify(state));return true;}catch(_){return false;}}
  // Drafts are keyed 'level:<id>' for trail escapes, 'hidden:<id>' for the Gilded Burrow's, 'seasonal:<id>'
  // and 'kids:<id>' for the seasonal and Little Explorers adventures.
  const api={
    KEY,
    all(){return read().drafts;},
    get(key){return read().drafts[key]||null;},
    save(key,model,route){const s=read(),runs=s.drafts[key]?.runs;s.drafts[key]={model,route,...(runs?{runs}:{}),savedAt:new Date().toISOString()};return write(s);},
    // A winning run edited in the builder's step list, kept with the draft ('main' or 'treasure');
    // null drops it, so the recorded run is used again.
    saveRun(key,variant,commands){const s=read(),d=s.drafts[key];if(!d)return false;d.runs={...(d.runs||{})};
      if(commands)d.runs[variant]=commands;else delete d.runs[variant];if(!Object.keys(d.runs).length)delete d.runs;return write(s);},
    remove(key){const s=read();delete s.drafts[key];return write(s);},
    active(){return read().on;},
    setActive(on){const s=read();s.on=Boolean(on);return write(s);},
    // What the catalog swaps in: every draft's route, but only while the switch is on.
    overrides(){const s=read();if(!s.on)return {};const out={};for(const [k,d] of Object.entries(s.drafts))if(d?.route)out[k]=d.route;return out;},
    // The export file: every draft (or the chosen ones), ready for scripts/apply-level-edits.cjs.
    exportFile(keys){const d=read().drafts;return {kind:'sally-level-edits',version:1,exportedAt:new Date().toISOString(),
      edits:Object.entries(d).filter(([k])=>!keys||keys.includes(k)).map(([key,v])=>({key,savedAt:v.savedAt,model:v.model,route:v.route,...(v.runs?{runs:v.runs}:{})}))};},
  };
  root.EscapeEdits=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
