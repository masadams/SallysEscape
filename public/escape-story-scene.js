// The story on screen: a part's title, then a card (a page of Old Moss's journal, a field sheet of
// the Great Map, a moment along the way, or a note from a lost Wayfinder). Cards wait in a queue
// and show on the world map, each once; the Journal's Story page lists every card found, lets
// them be read again, and draws the Great Map joining up as the garden recovers. While a card is open the world map holds still and the
// reading music plays (escapescene.js tickEscapeMusic).
let escapeStoryQueue=[],escapeStoryOpen=null;
// Queue a card the first time it comes up; a part's title goes in front of its first card.
function queueEscapeStory(id){
  if(typeof EscapeStory==='undefined')return false;const card=EscapeStory.byId(id);
  if(!card||escapeProgress.storySeen(id)||escapeStoryQueue.some(q=>q.id===id))return false;
  const part=card.area!==undefined?EscapeStory.PARTS.find(p=>p.from===card.area):card.id==='opening'?EscapeStory.PARTS[0]:null;
  if(part&&!escapeProgress.storySeen('part:'+part.n)&&!escapeStoryQueue.some(q=>q.id==='part:'+part.n))escapeStoryQueue.push({id:'part:'+part.n,part});
  escapeStoryQueue.push({id,card});return true;
}
// On the world map: the opening the first time in, a moment as soon as the area it leads into
// opens, then the card for each area as Sally first reaches it. Test mode (every area open)
// queues no moments, so it never plays a backlog.
function tickEscapeStory(){
  if(typeof EscapeStory==='undefined'||!escapeWorld||escapeStoryOpen)return;
  if(!escapeProgress.storySeen('opening'))queueEscapeStory('opening');
  else{if(!escapeProgress.unlockAll)for(const m of EscapeStory.MOMENTS)if(escapeWorld.regionOpen(m.opens))queueEscapeStory(m.id);
    const i=escapeWorld.chapterAt();if(escapeWorld.regionOpen(i)){const card=EscapeStory.areaCard(i);if(card)queueEscapeStory(card.id);}}
  if(escapeStoryQueue.length&&!escapeBestiaryOpen&&!escapeLibraryOpen)showEscapeStory(escapeStoryQueue.shift(),true);
}
// A won escape can earn a card: a secret spot's note, or the finale for Home. What comes after
// waits, unopened, in Sally's Burrow (and the Journal) so the ending can rest.
function escapeStoryForResult(level,won){
  if(!won||typeof EscapeStory==='undefined'||level.custom)return;
  const spot=EscapeStory.spotFor(level);if(spot)queueEscapeStory('note:'+spot);
  if(level.id==='home'&&!level.hidden)queueEscapeStory('finale');
}
// The cards that wait after the ending: open once the finale has been read.
function escapeStoryWaiting(){return typeof EscapeStory==='undefined'||!escapeProgress.storySeen('finale')?[]:EscapeStory.CARDS.filter(c=>c.later&&!escapeProgress.storySeen(c.id));}
// How far the garden has recovered (EscapeStory.stage), from progress alone.
function escapeStoryStage(){
  if(typeof EscapeStory==='undefined'||!escapeWorld)return 0;
  return EscapeStory.stage({open:i=>escapeWorld.regionOpen(i),home:Boolean(escapeProgress.data.levels.home?.stars)});
}
function escapeStoryPage(){
  let page=document.getElementById('story-card');
  if(!page){page=document.createElement('div');page.id='story-card';page.className='story-overlay';page.setAttribute('role','dialog');page.setAttribute('aria-modal','true');document.getElementById('game-area')?.appendChild(page);}
  return page;
}
// A painted scene for each card, from its area: a sky, three layers of land and a few things that
// belong there, drawn as one small SVG (no images, nothing to load). Clouds drift and night lights
// glow (CSS only, still when motion is reduced). The opening is the flood; a lost Wayfinder's note
// gets a lantern in the dark; the ending is the gate and the warm stone.
// Palette: sky top, sky bottom, far land, middle land, near ground, accent.
const ESCAPE_STORY_LANDS={
  autumn:['#b5b9b4','#f6d8a5','#c3a066','#ae7847','#775e3c','#ffd27a'],'autumn-dusk':['#727a9b','#d2ad91','#a48362','#825c49','#56483d','#ffc576'],'autumn-night':['#26334e','#647080','#6b7163','#655d47','#454536','#c4e6f1'],'autumn-mill':['#9bb8ba','#e1d8b7','#a19465','#8e714a','#645a3c','#ecc07b'],'autumn-festival':['#8887a5','#f2c79b','#b89564','#a47545','#73573d','#ffdb8a'],
  meadow:['#9fd0f0','#e8f6d8','#a9cf8a','#7fb066','#5a8f4a','#f6d65a'],garden:['#b5d4e6','#eef0dc','#a8bf8e','#86a66e','#617f50','#d9a066'],
  river:['#9cc9e8','#e2f2ea','#9cc49a','#6fa48c','#4f7f6a','#7cc4e4'],ruins:['#b9c7d6','#ece8dc','#a9b39a','#8a967e','#6a7460','#cfc6aa'],
  quarry:['#d8c9a8','#f3e8d2','#c9b38c','#a8916c','#7d6a4e','#e0c48a'],desert:['#f4c27a','#fbe7c2','#e7b878','#cf9a5a','#a87842','#f7e08a'],
  marsh:['#a9c3b2','#e2eadb','#93b294','#6e9478','#4c7058','#c9d98a'],jungle:['#8fc7a0','#d8efd2','#5f9a6a','#3f7a50','#2a5a3a','#f0d060'],
  glow:['#0e1a2e','#26405e','#1d3350','#16283f','#0f1d2e','#9ff0ff'],orchard:['#b9e0f0','#f4f0d6','#a6c97a','#86b05e','#648c44','#e86a4a'],
  coast:['#8fd0f0','#f6ecd0','#7cc0d8','#e8d6a0','#d6bf82','#f6f0e0'],hollow:['#c8b9a0','#efe6d4','#a89a7c','#8a7c60','#6a5e48','#efe2c0'],
  lantern:['#18233a','#3a4a5c','#2a3a40','#22302f','#1a2622','#ffd36a'],rooftops:['#f2b97a','#fde9c8','#c98a62','#a8644a','#7a4636','#f7d98a'],
  ants:['#d9c4a0','#f2e6d0','#b89a70','#9a7c54','#76603e','#5a3a22'],frost:['#a9c9e8','#eef4fa','#cfe0ee','#b2cade','#93b0c8','#ffffff'],
  vents:['#9aa6a8','#dcdcd2','#8a8e86','#6e7470','#525a58','#e8eef0'],grotto:['#1c1a30','#3a2f50','#2e2a44','#262238','#1c1a2c','#ff9ad8'],
  storm:['#3a4658','#7a8494','#56606e','#454e5a','#343c46','#f6f0a0'],tide:['#8ac8e6','#f2ead6','#6fb4d0','#5a98b6','#d8c690','#f0f6f8'],
  home:['#f6c890','#fdf0d8','#b8c88e','#94ac6e','#6e8a52','#ffd27a'],flood:['#3c4a5c','#6c7a88','#4e5c6a','#3e4a56','#2e3a44','#bcd6ee']
};
const ESCAPE_STORY_NIGHT=new Set(['glow','lantern','grotto','flood','storm','autumn-night']);
function escapeStoryLand(theme,tall){
  const [sky1,sky2,far,mid,near,acc]=ESCAPE_STORY_LANDS[theme]||ESCAPE_STORY_LANDS.meadow,night=ESCAPE_STORY_NIGHT.has(theme),id='sk'+theme;
  const tuft=(x,y,c)=>'<path d="M'+x+' '+y+'q-3-14-8-18M'+x+' '+y+'q1-16 2-22M'+x+' '+y+'q4-12 9-16" stroke="'+c+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  const rock=(x,y,s,c)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+(16*s)+'" ry="'+(9*s)+'" fill="'+c+'"/><ellipse cx="'+(x-4*s)+'" cy="'+(y-3*s)+'" rx="'+(7*s)+'" ry="'+(3*s)+'" fill="#fff" opacity=".18"/>';
  const tree=(x,y,s,c)=>'<rect x="'+(x-3*s)+'" y="'+(y-26*s)+'" width="'+(6*s)+'" height="'+(26*s)+'" fill="#5b4430"/><circle cx="'+x+'" cy="'+(y-36*s)+'" r="'+(20*s)+'" fill="'+c+'"/><circle cx="'+(x-12*s)+'" cy="'+(y-28*s)+'" r="'+(13*s)+'" fill="'+c+'"/><circle cx="'+(x+13*s)+'" cy="'+(y-29*s)+'" r="'+(12*s)+'" fill="'+c+'"/>';
  const lantern=(x,y,lit)=>'<path d="M'+x+' '+(y-40)+'v-12h16" stroke="#3a3026" stroke-width="2.5" fill="none"/><rect x="'+(x+10)+'" y="'+(y-46)+'" width="12" height="16" rx="3" fill="'+(lit?acc:'#4a4a44')+'" stroke="#3a3026" stroke-width="2"/>'+(lit?'<circle class="story-glow" cx="'+(x+16)+'" cy="'+(y-38)+'" r="18" fill="'+acc+'" opacity=".35"/>':'')+'<path d="M'+x+' '+(y-52)+'V'+y+'" stroke="#3a3026" stroke-width="3"/>';
  const mush=(x,y,s,c)=>'<rect x="'+(x-3*s)+'" y="'+(y-14*s)+'" width="'+(6*s)+'" height="'+(14*s)+'" rx="2" fill="#efe4d0"/><path d="M'+(x-14*s)+' '+(y-12*s)+'q14-20 28 0z" fill="'+c+'"/>'+(night?'<circle class="story-glow" cx="'+x+'" cy="'+(y-16*s)+'" r="'+(16*s)+'" fill="'+c+'" opacity=".3"/>':'');
  const pillar=(x,y,h)=>'<rect x="'+(x-8)+'" y="'+(y-h)+'" width="16" height="'+h+'" fill="#d8d2bc"/><path d="M'+(x-8)+' '+(y-h)+'l5-6l4 4l7-5v7z" fill="#d8d2bc"/><path d="M'+(x-3)+' '+(y-h+6)+'v'+(h-8)+'M'+(x+3)+' '+(y-h+6)+'v'+(h-8)+'" stroke="#b8b09a" stroke-width="1.5"/>';
  const reeds=x=>[0,6,12].map(d=>'<path d="M'+(x+d)+' 262q-2-30 2-48" stroke="#5a7a44" stroke-width="2" fill="none"/><ellipse cx="'+(x+d+1)+'" cy="214" rx="2.6" ry="7" fill="#6a4a2a"/>').join('');
  const cloud=(x,y,s,c)=>'<g class="story-cloud" opacity=".85"><ellipse cx="'+x+'" cy="'+y+'" rx="'+(30*s)+'" ry="'+(10*s)+'" fill="'+c+'"/><circle cx="'+(x-10*s)+'" cy="'+(y-6*s)+'" r="'+(11*s)+'" fill="'+c+'"/><circle cx="'+(x+8*s)+'" cy="'+(y-9*s)+'" r="'+(14*s)+'" fill="'+c+'"/></g>';
  const sally='<g class="story-sally" transform="translate(196 247)"><path d="M0 0c6-3 14-3 20 0c4 2 9 1 12-1c-2 4-7 6-12 5c-6 3-14 3-20 0z" fill="#5fae5a"/><path d="M-1 1c-8 1-16 4-24 2" stroke="#5fae5a" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="27" cy="-1" r="1.4" fill="#1c2a1a"/><path d="M6 3l-3 5M14 3l2 5M8-2l-2-5M16-2l3-5" stroke="#4e9a4a" stroke-width="2" stroke-linecap="round"/></g>';
  const props={
    autumn:tree(75,250,1.2,'#c48142')+tree(335,250,1,'#b9613e')+lantern(290,250,true),'autumn-dusk':tree(65,250,1,'#c48142')+lantern(320,250,true),'autumn-night':tree(55,250,1,'#9b7152')+lantern(315,250,true),'autumn-mill':tree(60,250,1,'#b67b44')+lantern(320,250,true),'autumn-festival':lantern(70,250,true)+lantern(320,250,true)+tree(285,250,.8,'#bc8144'),
    meadow:tuft(60,262,near)+tuft(330,258,near)+'<circle cx="92" cy="246" r="4" fill="#fff"/><circle cx="92" cy="246" r="1.6" fill="'+acc+'"/><circle cx="300" cy="240" r="4" fill="#f7a6c2"/>'+tree(350,224,.9,mid),
    garden:'<path d="M30 236h90v-22h-90z" fill="#b89070"/><path d="M30 214h90" stroke="#9a7458" stroke-width="3" stroke-dasharray="14 4"/><path d="M140 236h50v-14h-12v-8h-38z" fill="#a98466"/>'+tree(330,228,.8,'#7a9a5e')+tuft(250,258,near),
    river:'<path d="M0 238q100-14 200 0t200 0v30H0z" fill="'+acc+'" opacity=".75"/><path d="M40 246q20-4 40 0M220 250q20-4 40 0" stroke="#fff" stroke-width="2" opacity=".6" fill="none"/>'+reeds(40)+reeds(330),
    ruins:pillar(70,250,70)+pillar(110,250,44)+pillar(320,252,58)+'<rect x="150" y="242" width="40" height="10" fill="#cfc6aa"/>',
    quarry:'<path d="M0 220h60v-30h50v30h40v20H0z" fill="#b8a07a"/><path d="M260 240v-40h60v-24h80v64z" fill="#a88f68"/>'+rock(180,250,1.1,'#9c8a6a'),
    desert:'<circle class="story-glow" cx="320" cy="70" r="30" fill="'+acc+'" opacity=".9"/><path d="M80 252v-46q0-8 8-8t8 8v46M80 226h-10v-14M96 220h10v-14" stroke="#5f8a4a" stroke-width="10" fill="none" stroke-linecap="round"/>'+rock(300,254,.9,'#b88a52'),
    marsh:'<path d="M0 244q100-8 200 0t200 0v24H0z" fill="#5f8a7a" opacity=".7"/>'+reeds(70)+reeds(250)+'<ellipse cx="170" cy="248" rx="16" ry="5" fill="#7aa86a"/>',
    jungle:'<path d="M20 0q10 120-6 200M380 0q-14 110 4 210" stroke="#2f6a40" stroke-width="5" fill="none"/>'+tree(60,240,1.2,'#3f8a4e')+tree(340,236,1.1,'#2f7a44')+'<path d="M150 262q-14-30-40-34q30 0 44 30M250 262q12-34 44-40q-34 4-40 40" fill="#3f8a4e"/>',
    glow:mush(110,256,1.2,acc)+mush(292,252,1,'#b6a0ff')+'<ellipse cx="200" cy="246" rx="34" ry="10" fill="#24405e"/><path class="story-glow" d="M178 246h44" stroke="'+acc+'" stroke-width="2"/>',
    orchard:tree(70,236,1,'#7aa84e')+tree(330,232,1.1,'#6a9a44')+'<circle cx="62" cy="200" r="4" fill="'+acc+'"/><circle cx="84" cy="206" r="4" fill="'+acc+'"/><circle cx="340" cy="196" r="4" fill="'+acc+'"/><path d="M140 246h120v-26h-120z" fill="#5f8a3e"/>',
    coast:'<path d="M0 214q50-10 100 0t100 0t100 0t100 0v18H0z" fill="#5ab0d0"/><path d="M0 214q50-10 100 0t100 0t100 0t100 0" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/><path d="M300 250q8-14 18 0z" fill="#e87a5a"/><circle cx="304" cy="244" r="1.5" fill="#222"/><circle cx="312" cy="244" r="1.5" fill="#222"/>'+rock(80,254,.8,'#a89a7a'),
    hollow:'<path d="M0 60q120 30 400-10" stroke="#5e4a34" stroke-width="7" fill="none"/>'+[80,150,250,320].map((x,i)=>'<path d="M'+x+' '+(64+i%2*4)+'q-6 30 0 '+(46+i*6)+'q6-24 0-'+(46+i*6)+'" fill="#f4ead2" opacity=".75"/>').join('')+rock(200,254,1,'#8a7c60'),
    lantern:'<path d="M0 248q200-10 400 0v20H0z" fill="#2a4a48" opacity=".8"/>'+lantern(60,252,false)+lantern(170,248,false)+lantern(300,252,true)+'<circle cx="352" cy="70" r="16" fill="#e8eef8" opacity=".9"/>',
    rooftops:'<path d="M0 200h80l30-26l30 26h60v68H0z" fill="'+mid+'"/><path d="M220 210h70l26-22l26 22h58v58H220z" fill="'+far+'"/><rect x="60" y="150" width="12" height="30" fill="#7a4636"/><circle class="story-glow" cx="330" cy="62" r="24" fill="'+acc+'"/><path d="M120 70q14-8 28 0q-14 2-14 8q0-6-14-8z" fill="#5a4030"/>',
    ants:'<path d="M60 254q40-50 80 0z" fill="#9a7c54"/><path d="M96 252q4-8 8 0" fill="#3a2614"/><path d="M160 256h200" stroke="#7a603e" stroke-width="2" stroke-dasharray="2 8" fill="none"/>'+[180,214,248,282,316].map(x=>'<g fill="'+acc+'"><circle cx="'+x+'" cy="250" r="3"/><circle cx="'+(x+5)+'" cy="250" r="2.4"/><circle cx="'+(x-5)+'" cy="250" r="2.6"/></g>').join(''),
    frost:'<path d="M40 210l50-90l50 90z" fill="#e6eef6"/><path d="M90 120l-14 26l14-8l14 8z" fill="#fff"/><path d="M250 214l60-110l60 110z" fill="#d8e4f0"/><path d="M310 104l-16 30l16-8l16 8z" fill="#fff"/><rect x="186" y="200" width="20" height="54" rx="8" fill="#9ab8d6"/><circle cx="196" cy="194" r="10" fill="#9ab8d6"/><circle cx="192" cy="192" r="2" fill="#2a4a6a"/><circle cx="200" cy="192" r="2" fill="#2a4a6a"/>',
    vents:'<path d="M40 254v-60h20v60M300 254v-80h24v80M40 194h140" stroke="#5a6260" stroke-width="12" fill="none"/>'+[0,1,2].map(i=>'<circle class="story-cloud" cx="'+(312+i*6)+'" cy="'+(160-i*24)+'" r="'+(12+i*5)+'" fill="#f4f6f4" opacity="'+(.7-i*.18)+'"/>').join(''),
    grotto:mush(80,256,1.6,acc)+mush(140,258,1,'#9ad8ff')+mush(300,256,1.3,'#c4a0ff')+mush(350,258,.8,acc),
    storm:cloud(110,70,1.4,'#5a6474')+cloud(290,60,1.6,'#4e5866')+'<path class="story-glow" d="M220 80l-16 40h14l-12 36l30-46h-14l12-30z" fill="'+acc+'"/>'+rock(330,252,1.2,'#46505c'),
    tide:'<path d="M0 226q60-10 120 0t140 0t140 0v14H0z" fill="#4a9cc0"/>'+rock(70,248,1.2,'#7a8a8a')+rock(300,252,1,'#6a7a7c')+'<ellipse cx="190" cy="250" rx="24" ry="7" fill="#7cc4e4" opacity=".8"/><path d="M330 120h40v60h-40z" fill="#c8b890" opacity=".5"/>',
    home:'<path d="M250 254v-74M310 254v-74M250 186h60M250 206h60M250 226h60" stroke="#6a4e34" stroke-width="6"/><path d="M268 254q12-18 24 0z" fill="#3a2a1a"/><ellipse cx="160" cy="250" rx="40" ry="12" fill="#b8a080"/><ellipse cx="152" cy="245" rx="20" ry="4" fill="#fff" opacity=".2"/><circle class="story-glow" cx="80" cy="70" r="26" fill="'+acc+'"/>',
    flood:cloud(90,60,1.5,'#5a6676')+cloud(300,54,1.7,'#4c5866')+'<g class="story-rain" stroke="#bcd6ee" stroke-width="1.6" opacity=".6">'+[...Array(16)].map((_,i)=>'<path d="M'+(20+i*24)+' '+(90+(i%3)*14)+'l-6 16"/>').join('')+'</g><path d="M0 232q50-12 100 0t100 0t100 0t100 0v36H0z" fill="#3e6a86"/>'
  };
  const orb=['flood','storm','glow','grotto'].includes(theme)?'':night?'<circle cx="236" cy="84" r="15" fill="#eef2fa" opacity=".9"/><circle cx="242" cy="80" r="13" fill="'+sky1+'" opacity=".55"/>':'<circle class="story-glow" cx="232" cy="92" r="26" fill="#fff4c8" opacity=".55"/><circle cx="232" cy="92" r="17" fill="#fff0b0"/>';
  const birds=night?'':'<path d="M150 70q6-5 12 0q6-5 12 0M176 92q4-4 9 0q4-4 9 0" stroke="#4a5a5a" stroke-width="1.6" fill="none" opacity=".55"/>';
  const stars=night?[...Array(14)].map((_,i)=>'<circle class="story-star" cx="'+((i*53)%390+5)+'" cy="'+((i*37)%110+8)+'" r="'+(i%3?1:1.6)+'" fill="#fff" style="animation-delay:'+(-i*.7)+'s"/>').join(''):cloud(90,56,1,'#ffffff')+cloud(300,40,.8,'#ffffff');
  return '<svg class="story-land" viewBox="'+(tall?'80 36 240 232':'0 0 400 268')+'" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sky1+'"/><stop offset="1" stop-color="'+sky2+'"/></linearGradient></defs>'
    +'<rect width="400" height="268" fill="url(#'+id+')"/>'+stars+orb+birds
    +'<path d="M0 170q70-40 140-14t140-20t120 10v122H0z" fill="'+far+'"/><path d="M0 206q90-30 180-6t220-14v82H0z" fill="'+mid+'"/>'
    +'<path d="M0 238q120-16 240 0t160-4v34H0z" fill="'+near+'"/>'
    // The things in the scene gather towards the middle, so a tall picture beside the page keeps them all.
    +(tall?'<g transform="translate(200 262) scale(.72) translate(-200 -262)">'+(props[theme]||'')+'</g>':props[theme]||'')+(theme==='flood'?'':sally)+'</svg>';
}
function escapeStoryTheme(c){if(c.kind==='kids-sign'||c.kind==='season-sign')return c.theme||'garden';return c.id==='opening'?'flood':c.id==='after'?'coast':c.id==='finale'||c.later?'home':c.kind==='note'?'lantern':c.kind==='moment'?EscapeWorld.chapters[c.opens-1]?.theme:EscapeWorld.chapters[c.area]?.theme||'meadow';}
// A page of a card, as markup: short paragraphs, spoken lines set apart. A page in *italics* is
// something written down, shown as a letter on a slip of paper; a signature sits to the right.
function escapeStoryPageHtml(text){
  const lines=text.split('\n'),jot=lines.some(l=>/^\*.+\*$/.test(l))&&lines.every(l=>/^\*.+\*$/.test(l)||/^— /.test(l)),say=t=>t.replace(/(“[^”]+”|&quot;[^&]+?&quot;|"[^"]+")/g,'<q class="story-say">$1</q>');
  if(jot)return '<div class="story-letter-slip">'+lines.map(l=>/^— /.test(l)?'<p class="story-sign">'+escapeText(l)+'</p>':'<p>'+escapeText(l.slice(1,-1))+'</p>').join('')+'</div>';
  return lines.map(l=>/^— /.test(l)?'<p class="story-sign">'+escapeText(l)+'</p>':'<p>'+say(escapeText(l).replace(/\*([^*]+)\*/g,'<em>$1</em>'))+'</p>').join('');
}
// Show a part title or a card. fresh: it is being found now, so it is saved and the next queued one follows.
// A card is a page of a storybook: the picture on one side, one page of words on the other, turned
// with Next (or Back); the paragraphs fade in one after another and a press shows them all at once.
function showEscapeStory(entry,fresh,onDone){
  const page=escapeStoryPage();if(!page)return;const kindLabel={'season-sign':'Autumn Hollow - trail note','kids-sign':'Little Explorers — trail note',journal:'From Old Moss’s journal',map:'A field sheet of the Great Map',moment:'Along the way',note:'A note, left behind',found:entry.card?.what||'A page, found'};
  const reduced=Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  escapeStoryOpen=entry;
  const finish=()=>{if(fresh)escapeProgress.markStory(entry.id);page.style.display='none';escapeStoryOpen=null;
    if(onDone){onDone();return;}
    if(fresh&&escapeStoryQueue.length)showEscapeStory(escapeStoryQueue.shift(),true);else if(!fresh)openEscapeStoryBook();else renderEscapeWorldTotals?.();};
  if(entry.part){const p=entry.part;page.className='story-overlay story-part'+(reduced?' story-still':'');
    page.innerHTML='<div class="story-part-inner"><span class="story-eyebrow">'+escapeText(p.title)+'</span><h2>'+[...p.name].map((ch,i)=>'<span class="story-letter" style="animation-delay:'+(.3+i*.06)+'s">'+(ch===' '?'&nbsp;':escapeText(ch))+'</span>').join('')+'</h2><span class="story-rule" aria-hidden="true">❦</span><p>'+escapeText(p.line)+'</p><button type="button" class="escape-primary" id="story-next">Begin</button></div>';
    page.style.display='flex';escapeSound('glimmer');const next=document.getElementById('story-next');next.focus?.();next.onclick=finish;return;}
  const c=entry.card,last=c.body.length-1,doneLabel=fresh&&escapeStoryQueue.length?'Next':fresh?'Continue':'Close',area=c.area!==undefined?EscapeWorld.chapters[c.area]?.name:c.kind==='moment'?EscapeWorld.chapters[c.opens-1]?.name:null;
  page.className='story-overlay story-'+c.kind+(reduced?' story-still':'');
  page.innerHTML='<article class="story-card"><div class="story-picture">'+escapeStoryLand(escapeStoryTheme(c),window.innerWidth>560)+'</div><div class="story-paper">'
    +'<span class="story-eyebrow">'+escapeText(kindLabel[c.kind]||'')+(area?' · '+escapeText(area):'')+'</span><h2>'+escapeText(c.title)+'</h2>'
    +'<div class="story-pages" aria-live="polite"></div><div class="story-foot"><button type="button" class="story-back" id="story-back" aria-label="Previous page">‹</button><span class="story-count"></span><button type="button" class="escape-primary" id="story-next"></button></div></div></article>';
  page.style.display='flex';escapeSound('chest');
  const pages=page.querySelector('.story-pages'),next=document.getElementById('story-next'),back=document.getElementById('story-back'),count=page.querySelector('.story-count');
  let at=-1,timers=[];
  const settle=()=>{for(const t of timers)clearTimeout(t);timers=[];for(const el of pages.querySelectorAll('.story-wait'))el.classList.remove('story-wait');};
  const show=(i,dir=1)=>{settle();at=i;pages.innerHTML='<div class="story-page'+(dir<0?' story-from-left':'')+'">'+escapeStoryPageHtml(c.body[i])+'</div>';
    const page1=i===0&&!/^\*/.test(c.body[0]);pages.firstChild.classList.toggle('story-first',page1);
    count.textContent=c.body.length>1?(i+1)+' / '+c.body.length:'';back.hidden=i===0;next.textContent=i<last?'Next ›':doneLabel;
    if(pages.querySelector('.story-letter-slip'))escapeSound('flutter');
    if(!reduced){const parts=[...pages.querySelectorAll('.story-page > p, .story-letter-slip p')];parts.forEach((el,k)=>{if(!k)return;el.classList.add('story-wait');timers.push(setTimeout(()=>el.classList.remove('story-wait'),k*650));});}};
  const waiting=()=>pages.querySelector('.story-wait');
  next.onclick=()=>{if(waiting()){settle();return;}if(at<last){show(at+1);escapeSound('ping');return;}settle();finish();};
  back.onclick=()=>{if(at>0){show(at-1,-1);escapeSound('ping');next.focus?.();}};
  show(0);next.focus?.();
}
// Enter or Space turn the page (as A does), the left arrow turns back; Escape (or B) skips to the end
// of the card and closes it.
if(typeof document!=='undefined')document.addEventListener('keydown',e=>{if(!escapeStoryOpen||!['Enter',' ','Escape','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();e.stopPropagation();const next=document.getElementById('story-next');if(!next)return;
  if(e.key==='ArrowLeft'){document.getElementById('story-back')?.click();return;}
  if(e.key==='Escape'){for(let i=0;i<40&&escapeStoryOpen&&document.getElementById('story-next')===next;i++)next.click();return;}
  next.click();},true);
// Notes hidden in levels (escape-notes.js): one may lie on a floor tile of an ordinary escape. Walking
// onto it picks it up and saves it at once (being caught afterwards keeps it); a small banner says so
// and the page waits to be read, from the results or the Journal, never during the run.
let escapeNoteRun={game:null,note:null,fresh:false};
function escapeNoteFor(g){
  if(escapeNoteRun.game!==g){let note=typeof EscapeNotes==='undefined'?null:EscapeNotes.forLevel(g.level);
    // An anchor that is no longer open floor (a changed layout) shows nothing rather than a page in a wall.
    if(note&&!g.floor(note.at[0],note.at[1]))note=null;escapeNoteRun={game:g,note,fresh:false};}
  return escapeNoteRun.note;
}
function tickEscapeNote(g){
  const n=escapeNoteFor(g);if(!n||g.status!=='playing'||g.player.underground||g.player.dig?.buried||escapeProgress.noteFound(n.id))return;
  if(Math.hypot(g.player.x-(n.at[0]+.5),g.player.y-(n.at[1]+.5))>.6)return;
  if(escapeProgress.findNote(n.id)){escapeNoteRun.fresh=true;escapeBestiaryNote={text:'📜 You found a page: '+n.title,until:millis()+3800};escapeSound('flutter');}
}
// A page on the floor: a folded scrap with two lines of ink and a little glint; once found, faded.
function drawEscapeNote(g,cell){
  const n=escapeNoteFor(g);if(!n)return;const found=escapeProgress.noteFound(n.id),x=(n.at[0]+.5)*cell,y=(n.at[1]+.55)*cell,bob=Math.sin(g.elapsed*2.2)*cell*.02;
  push();translate(x,y+bob);rotate(-.18);noStroke();if(found)drawingContext.globalAlpha=.35;
  fill(0,0,0,50);ellipse(cell*.03,cell*.16,cell*.5,cell*.12);fill(246,236,210);rect(-cell*.22,-cell*.16,cell*.44,cell*.32,cell*.03);
  fill(214,196,158);triangle(cell*.22,-cell*.16,cell*.08,-cell*.16,cell*.22,-cell*.02);stroke(120,92,58,190);strokeWeight(cell*.025);line(-cell*.14,-cell*.04,cell*.08,-cell*.04);line(-cell*.14,cell*.05,cell*.12,cell*.05);
  noStroke();if(!found){const glint=Math.max(0,Math.sin(g.elapsed*1.7))**10;fill(255,250,220,200*glint);ellipse(-cell*.12,-cell*.1,cell*.12,cell*.12);}
  drawingContext.globalAlpha=1;pop();
}
// A found note as a card to read.
function escapeNoteCard(n){const {who,what}=EscapeNotes.signed(n);return {id:n.id,kind:'found',title:n.title,what:what?what[0].toUpperCase()+what.slice(1):'A page',area:n.area,body:['*'+n.body+'*'+(who&&!/^Unsigned/.test(who)?'\n— '+who:'')]};}
function showEscapeNote(n,onDone){escapeProgress.readNote(n.id);showEscapeStory({id:n.id,card:escapeNoteCard(n)},false,onDone);}
// The results offer the page found in this level when it has not been read yet.
function escapeNoteResultButton(){
  document.getElementById('escape-note-btn')?.remove?.();
  const n=escapeGame&&escapeNoteFor(escapeGame);if(!n||!escapeProgress.noteFound(n.id)||escapeProgress.noteRead(n.id))return;
  const b=document.createElement('button');b.id='escape-note-btn';b.type='button';b.className='escape-secondary escape-note-btn';b.textContent='📜 Read the page you found: '+n.title;
  b.onclick=()=>showEscapeNote(n,()=>{b.remove();document.getElementById('escape-next-btn')?.focus?.();});
  document.getElementById('escape-result-challenge')?.after?.(b);
}
// Pages found along the way, by area: two to an area, whose little sketch is whole once both are
// found; the journal's border gains a leaf, a lantern and a path at 14, 28 and 42 pages.
function escapeNotesBookHtml(){
  if(typeof EscapeNotes==='undefined')return '';const N=EscapeNotes.NOTES,found=N.filter(n=>escapeProgress.noteFound(n.id)),chapters=EscapeWorld.chapters;
  const marks=[[14,'🍃 A leaf in the border'],[28,'🏮 A lantern in the border'],[42,'✦ A path all the way round']].filter(([n])=>found.length>=n).map(([,t])=>'<span class="story-mark">'+t+'</span>').join('');
  const areas=chapters.map((c,i)=>{const two=N.filter(n=>n.area===i);if(!two.length)return '';const both=two.every(n=>escapeProgress.noteFound(n.id));
    return '<div class="story-area-notes"><b>'+escapeText(c.name)+(both?' <span title="Sketch complete: '+escapeText(two[0].sketch)+'">✎ '+escapeText(two[0].sketch)+'</span>':'')+'</b><div class="story-tiles">'+two.map(n=>escapeProgress.noteFound(n.id)
      ?'<button type="button" class="story-tile story-tile-found'+(escapeProgress.noteRead(n.id)?'':' story-tile-unread')+'" data-note="'+n.id+'"><b>'+escapeText(n.title)+'</b></button>':'<span class="story-tile story-locked">???</span>').join('')+'</div></div>';}).join('');
  return '<h3>Pages found along the way · '+found.length+' / '+N.length+'</h3>'+(marks?'<div class="story-marks">'+marks+'</div>':'')+'<div class="story-area-grid">'+areas+'</div>';
}
// The Journal's Story page: each part's cards (found ones can be read again; the ones waiting after
// the ending show unopened), the lost Wayfinder's notes, and the Great Map, an area joined for
// each one Sally has walked through (all of it once she is home).
function openEscapeStoryBook(){
  const ui=document.getElementById('escape-world-ui');if(!ui||typeof EscapeStory==='undefined')return;let page=document.getElementById('world-bestiary');
  if(!page){page=document.createElement('section');page.id='world-bestiary';page.className='world-bestiary';ui.appendChild(page);}
  const S=EscapeStory,seen=id=>escapeProgress.storySeen(id),found=S.CARDS.filter(c=>seen(c.id)).length,waiting=escapeStoryWaiting();
  const tile=c=>seen(c.id)?'<button type="button" class="story-tile story-tile-'+c.kind+'" data-story="'+c.id+'"><b>'+escapeText(c.title)+'</b></button>'
    :waiting.includes(c)?'<button type="button" class="story-tile story-tile-new" data-story="'+c.id+'" data-fresh="1"><b>✉ Unopened</b></button>':'<span class="story-tile story-locked">???</span>';
  const parts=S.PARTS.map(p=>{const cards=S.CARDS.filter(c=>c.part===p.n&&!c.spot);return '<h3>'+escapeText(p.title+' · '+p.name)+'</h3><div class="story-tiles">'+cards.map(tile).join('')+'</div>';}).join('');
  const notes=S.CARDS.filter(c=>c.spot);
  // The Great Map: the trail's areas as a winding row of tiles; an area is joined once the trail
  // past it opens, and the whole map once Sally is home.
  const home=escapeStoryStage()===4,chapters=EscapeWorld.chapters,joined=i=>home||(i+1<chapters.length&&escapeWorld?.regionOpen(i+1));
  const mapCells=S.AREAS.map((a,i)=>{const lit=joined(i),x=(i%7)*46+(Math.floor(i/7)%2?23:0)+8,y=Math.floor(i/7)*46+8;
    return '<g><rect x="'+x+'" y="'+y+'" width="40" height="40" rx="8" class="'+(lit?'map-lit':'map-dark')+'"/><text x="'+(x+20)+'" y="'+(y+25)+'" text-anchor="middle">'+(i+1)+'</text></g>';}).join('');
  const mapPages=S.AREAS.filter((_,i)=>joined(i)).length,mapTotal=S.AREAS.length;
  page.innerHTML='<div class="bestiary-head"><h2>Story</h2><span>'+found+' of '+S.CARDS.length+' pages found</span><button type="button" id="world-bestiary-close" class="escape-secondary">Close</button></div>'+
    '<div class="story-book">'+parts+'<h3>Notes from a lost Wayfinder · '+notes.filter(c=>seen(c.id)).length+' / '+notes.length+'</h3><div class="story-tiles">'+notes.map(tile).join('')+'</div>'+
    escapeNotesBookHtml()+'<h3>The Great Map · '+mapPages+' / '+mapTotal+' areas joined</h3><svg class="great-map" viewBox="0 0 360 154" role="img" aria-label="The Great Map: '+mapPages+' of '+mapTotal+' areas joined">'+mapCells+'</svg></div>';
  escapeBestiaryOpen=true;page.style.display='block';
  for(const b of page.querySelectorAll('[data-note]'))b.onclick=()=>{page.style.display='none';escapeBestiaryOpen=false;showEscapeNote(EscapeNotes.byId(b.dataset.note),openEscapeStoryBook);};
  for(const b of page.querySelectorAll('[data-story]'))b.onclick=()=>{page.style.display='none';escapeBestiaryOpen=false;showEscapeStory({id:b.dataset.story,card:S.byId(b.dataset.story)},Boolean(b.dataset.fresh));};
  const close=()=>{escapeBestiaryOpen=false;page.style.display='none';renderEscapeWorldTotals();};
  document.getElementById('world-bestiary-close').onclick=close;page.onkeydown=e=>{if(e.key==='Escape')close();};document.getElementById('world-bestiary-close').focus?.();
}


