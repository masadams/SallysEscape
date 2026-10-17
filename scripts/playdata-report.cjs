// Reads a player-data export (Admin → Player data → Export all runs) and reports, for each escape:
// plays, how runs end, the median winning time next to the recorded run's, what catches Sally and
// where, drawn on the escape's map. Escapes far harder than their neighbours stand out.
//
//   node scripts/playdata-report.cjs sally-playdata.ndjson [--only id,id] [--maps]
const fs=require('fs'),path=require('path');
const {EscapeCatalog,escapeGridFor}=require(path.join(__dirname,'../public/escape-levels.js'));
const file=process.argv[2];if(!file){console.log('Usage: node scripts/playdata-report.cjs export.ndjson [--only id,id] [--maps]');process.exit(2);}
const arg=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1];},only=arg('only')?.split(','),maps=process.argv.includes('--maps');
const runs=fs.readFileSync(file,'utf8').split('\n').filter(Boolean).map(l=>{try{return JSON.parse(l);}catch(_){return null;}}).filter(r=>r&&!r.ch);
const all=[...EscapeCatalog.levels.map((l,i)=>({l,n:String(i+1)})),...(EscapeCatalog.hidden||[]).map(l=>({l,n:'★'}))];
console.log(runs.length+' runs (challenges left out)\n');
console.log('  #  escape                          plays  won  quit  median win  caught most by');
for(const {l,n} of all){
  if(only&&!only.includes(l.id))continue;const mine=runs.filter(r=>r.id===l.id);if(!mine.length)continue;
  const won=mine.filter(r=>r.out==='won'),wins=won.map(r=>r.t).sort((a,b)=>a-b),by={},spots={};
  for(const r of mine)for(const [x,y,k] of r.catches||[]){by[k]=(by[k]||0)+1;spots[x+','+y]=(spots[x+','+y]||0)+1;}
  const top=Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,c])=>k+' ×'+c).join(', ');
  console.log(n.padStart(3)+'  '+l.name.slice(0,30).padEnd(30)+String(mine.length).padStart(7)+(Math.round(won.length/mine.length*100)+'%').padStart(5)+String(mine.filter(r=>r.out==='quit').length).padStart(6)+(wins.length?wins[Math.floor(wins.length/2)]+'s':'—').padStart(12)+'  '+top);
  if(maps&&Object.keys(spots).length){const max=Math.max(...Object.values(spots)),grid=escapeGridFor(l);
    for(let y=0;y<l.height;y++)console.log('      '+Array.from({length:l.width},(_,x)=>{const c=spots[x+','+y];return c?String(Math.min(9,Math.ceil(c/max*9))):grid[y][x]==='#'?'#':' ';}).join(''));console.log('');}
}
