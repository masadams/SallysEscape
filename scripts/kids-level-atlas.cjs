// Exact layout overview for review; this is a map diagram, not an in-game screenshot.
const fs=require('fs'),path=require('path');
const levels=require('../public/escape-kids.js').filter(l=>l.adventure),cell=9,W=810,H=860;
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const parts=[`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Exact maps of the six Little Explorers adventures"><rect width="100%" height="100%" fill="#f6f3e8"/><g font-family="sans-serif"><text x="20" y="28" font-size="20" font-weight="bold" fill="#253f31">Little Explorers — six bigger adventures</text><text x="20" y="49" font-size="11" fill="#405d48">S start · K key · E exit · red creatures · white flags checkpoints · N readable notes</text>`];
const colors={'#':'#42634e','.':'#dce6c5','L':'#79b470','~':'#8fc6dc','N':'#b2aa9c','d':'#b68e65','o':'#b396cb','S':'#b8c59b','_':'#eae6dc','B':'#9c8c73'};
for(let i=0;i<levels.length;i++){
 const l=levels[i],x0=20+(i%2)*400,y0=85+Math.floor(i/2)*250;
 parts.push(`<text x="${x0}" y="${y0-10}" font-size="14" font-weight="bold" fill="#253f31">${i+21}. ${esc(l.name)}</text><g transform="translate(${x0} ${y0})">`);
 for(let y=0;y<l.map.length;y++)for(let x=0;x<l.map[y].length;x++){const c=l.map[y][x];parts.push(`<rect x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}" fill="${colors[c]||colors['.']}"/>`);if(/[1-5]/.test(c))parts.push(`<text x="${(x+.5)*cell}" y="${(y+.8)*cell}" text-anchor="middle" font-size="7" fill="#8b5715">${c}</text>`);}
 const badge=(at,label,color,ink='#fff')=>parts.push(`<rect x="${at[0]*cell+.4}" y="${at[1]*cell+.4}" width="8.2" height="8.2" rx="2" fill="${color}"/><text x="${(at[0]+.5)*cell}" y="${(at[1]+.77)*cell}" text-anchor="middle" font-size="7" font-weight="bold" fill="${ink}">${label}</text>`);
 for(const gate of l.gates||[]){const color='rgb('+gate.color.join(',')+')';for(const at of gate.tiles)badge(at,'',color);for(const at of [gate.switch,...(gate.plates||[])].filter(Boolean))badge(at,'•',color,'#253f31');}
 for(let y=0;y<l.map.length;y++)for(let x=0;x<l.map[y].length;x++){const c=l.map[y][x];if(c==='@')badge([x,y],'S','#2d6aaf');if(c==='K')badge([x,y],'K','#efc649','#4d3715');if(c==='X')badge([x,y],'E','#14764d');}
 for(const c of l.caps||[]){parts.push(`<path d="M${(c.at[0]+.5)*cell} ${(c.at[1]+.5)*cell}L${(c.to[0]+.5)*cell} ${(c.to[1]+.5)*cell}" stroke="#7750a3" stroke-width="1" stroke-dasharray="2 3" fill="none"/>`);badge(c.at,'↑','#7750a3');}
 for(const at of l.checkpoints||[])parts.push(`<path d="M${(at[0]+.25)*cell} ${(at[1]+.9)*cell}v-7l6 2-6 2" stroke="#486047" fill="#fff" stroke-width=".8"/>`);
 for(const h of l.guards)badge(h.spawn,h.kind==='beetle'?'B':h.kind==='toad'?'T':'s','#b84d40');
 for(const n of l.fieldNotes)badge(n.at,'N','#73552f');
 parts.push('</g>');
}
parts.push('<text x="20" y="825" font-size="11" fill="#405d48">Green leaves hide a still Sally · blue water is swimmable · purple dotted lines are bounce flights</text><text x="20" y="844" font-size="11" fill="#405d48">Every treasure is optional. Main routes have reusable crossings and checkpoints. Source: public/escape-kids.js</text></g></svg>');
const output=path.join(__dirname,'../docs/little-explorers/LEVELS.svg');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,parts.join('\n')+'\n');console.log('Wrote '+output);
