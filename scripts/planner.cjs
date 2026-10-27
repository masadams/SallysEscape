// A route planner that needs no hints: it plays the way a careful person does. It picks the next
// goal (treasure until there is enough or it opens the way, then the key, then the hatch), breaks
// the walk there into hops between cover (leaves and nooks near the path), and at each piece of
// cover waits for the shortest pause after which the next hop gets through. Where no pause works
// it backs up and tries a later window from the hop before. The route it finds is one a player
// could follow: hide, watch, go.
//
//   node scripts/planner.cjs <level-id> [--json]      plan one escape
//   node scripts/planner.cjs --all [--from 1]          report which escapes it can plan
const path=require('path');
const {EscapeCatalog}=require(path.join(__dirname,'../public/escape-levels.js'));
const {plan,goals,hops,triggers}=require(path.join(__dirname,'../public/escape-planner.js'));
const {verify,optionsFor}=require(path.join(__dirname,'route-solver.cjs'));
module.exports={plan,goals,hops,triggers};

if(require.main===module){
  const args=process.argv.slice(2),flag=n=>args.includes('--'+n),val=(n,d)=>{const i=args.indexOf('--'+n);return i<0?d:args[i+1];};
  const ids=flag('all')?EscapeCatalog.levels.map(l=>l.id).slice(+val('from',1)-1):[args[0]];
  let wins=0;
  for(const id of ids){const options=optionsFor(id),r=plan(options,{budget:+val('budget',60)*1000}),ok=r.won&&verify(options,r.commands);wins+=ok;
    const n=EscapeCatalog.levels.findIndex(l=>l.id===id)+1;
    console.error(String(n).padStart(3),id.padEnd(22),ok?'PLANNED':'stuck  ',r.seconds.toFixed(1)+'s',r.tries+' tries',ok?'':'got to '+r.reached.toFixed(1)+'s');
    if(flag('json')&&ok)console.log(JSON.stringify({options,commands:r.commands}));}
  if(ids.length>1)console.error(wins+'/'+ids.length+' planned');
}
