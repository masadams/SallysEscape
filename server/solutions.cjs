// The recorded winning runs, for the admin's level workshop. Every escape in the game has at least
// one run in tests/fixtures/ that the tests replay to prove it can be won; the workshop asks for one
// escape's runs to draw the route over the map or to watch Sally play it. Admin only: they are the
// answers. The fixtures are read once, on the first request.
const path=require('node:path');
const {send}=require('./http-util.cjs');
const FIXTURES=['escape-playthroughs.json','escape-kids-adventures.json','escape-seasons.json','escape-winter.cjs','escape-spring.cjs','escape-summer.cjs'];

function createSolutionApi({fixturesDir=process.env.FIXTURES_DIR||path.join(__dirname,'../tests/fixtures'),isAdmin=()=>false}={}){
  let index=null;
  // key ('level:<id>', 'hidden:<id>', 'kids:<id>' or 'seasonal:<id>') → its runs, the main run first.
  function load(){
    if(index)return index;index=new Map();
    for(const f of FIXTURES){let runs;try{runs=require(path.join(fixturesDir,f));}catch(_){continue;}
      for(const r of Array.isArray(runs)?runs:[]){const o=r?.options||{};if(r.pending||o.challengeId||!Array.isArray(r.commands))continue;
        const key=o.levelId?'level:'+o.levelId:o.hiddenId?'hidden:'+o.hiddenId:o.kidsId?'kids:'+o.kidsId:o.seasonalId?'seasonal:'+o.seasonalId:null;if(!key)continue;
        const list=index.get(key)||[];list.push({variant:r.variant||'main',...(typeof r.time==='number'?{time:r.time}:{}),commands:r.commands});index.set(key,list);}}
    for(const list of index.values())list.sort((a,b)=>(a.variant!=='main')-(b.variant!=='main'));
    return index;
  }
  async function handle(req,res,pathname){
    if(pathname!=='/api/admin/runs')return false;
    if(req.method!=='GET'){send(res,405,{error:'GET only.'},{Allow:'GET'});return true;}
    if(!isAdmin(req)){send(res,401,{error:'Sign in with your passkey first.'});return true;}
    const key=new URL(req.url,'http://localhost').searchParams.get('key')||'';
    if(!/^(level|hidden|kids|seasonal):[a-z0-9-]{1,60}$/.test(key)){send(res,400,{error:'Which escape?'});return true;}
    send(res,200,{key,runs:load().get(key)||[]});return true;
  }
  return {handle};
}
module.exports={createSolutionApi};
