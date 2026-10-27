// The builder's 🤖 Try to solve runs the route planner here, off the page's thread, so the builder
// stays responsive while it thinks. It gets a built level and a budget and posts back the run.
importScripts('creature-rig.js','escape-ice.js','escape-levels.js','escape-engine.js','escape-planner.js');
onmessage=e=>{
  const {level,budget}=e.data||{};
  try{const r=EscapePlanner.plan({level},{budget});postMessage({ok:true,won:r.won,commands:r.commands,tries:r.tries,reached:r.reached});}
  catch(err){postMessage({ok:false,error:String(err&&err.message||err)});}
};
