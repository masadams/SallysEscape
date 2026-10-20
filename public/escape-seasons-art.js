// These are costumes, not new collision shapes. Every warning and hit test stays in the engine.
function seasonPalette(l){if((l.seasonal||l.costume)==='summer')return summerPalette(l);if((l.seasonal||l.costume)==='spring')return springPalette(l);if((l.seasonal||l.costume)==='winter')return l.seasonalTheme==='winter-workshop'?[[143,165,166],[101,76,66],[238,201,139]]:l.seasonalTheme==='winter-night'?[[66,99,121],[91,134,155],[202,230,233]]:[[142,178,192],[84,126,145],[232,243,232]];return l.seasonalTheme==='autumn-night'?[[39,43,51],[102,74,64],[194,151,91]]:l.seasonalTheme==='autumn-mill'?[[56,53,40],[107,80,49],[194,148,88]]:[[65,53,38],[126,81,49],[222,162,81]];}
function drawSeasonGhost(h,c,g){if(['spring','summer'].includes(g.level.seasonal||g.level.costume))return drawEscapeOwl(h,c,g);if((g.level.seasonal||g.level.costume)==='winter')return drawWinterWisp(h,c,g);
 // The same seven-tile, wall-clipped cone as the original owl; its cool colour belongs to the lantern.
 if(h.state==='patrol'){noStroke();fill(167,226,246,44);beginShape();vertex(h.x*c,h.y*c);for(let a=-Math.PI/9;a<=Math.PI/9+.001;a+=Math.PI/36){let reach=0;for(let d=.2;d<=7;d+=.2){if(!g.clear(h,{x:h.x+Math.cos(h.facing+a)*d,y:h.y+Math.sin(h.facing+a)*d},true))break;reach=d;}vertex((h.x+Math.cos(h.facing+a)*reach)*c,(h.y+Math.sin(h.facing+a)*reach)*c);}endShape(CLOSE);}
 const warn=h.state==='glare',bob=Math.sin(g.elapsed*3+h.x)*.035;push();translate(h.x*c,(h.y+bob)*c);scale(c);
 noStroke();fill(8,20,27,70);ellipse(0,.35,.85,.2);fill(warn?255:208,warn?218:236,239,235);
 beginShape();vertex(-.37,.3);vertex(-.34,-.18);bezierVertex(-.34,-.63,.34,-.63,.34,-.18);vertex(.37,.3);vertex(.2,.22);vertex(.08,.36);vertex(-.08,.23);vertex(-.23,.35);endShape(CLOSE);
 fill(45,68,88);ellipse(-.12,-.16,.075,warn?.16:.1);ellipse(.12,-.16,.075,warn?.16:.1);ellipse(0,.02,.08,warn?.13:.045);
 stroke(132,191,199);strokeWeight(.035);noFill();line(.26,0,.48,.08);arc(.49,.14,.19,.25,Math.PI,Math.PI*2);fill(warn?255:174,warn?200:230,236);rect(.39,.14,.21,.27,.04);line(.39,.15,.6,.15);pop();
}
// Whether a seasonal creature walked in the last moment (drawing only; it never touches the hunter).
const seasonGait=new WeakMap();
function seasonMoving(h,t){let s=seasonGait.get(h);const d=h.distanceMoved||0;if(!s){s={d,at:-9};seasonGait.set(h,s);}if(d!==s.d){s.d=d;s.at=t;}return t-s.at<.25;}
function drawSeasonCreature(h,model,c,g){if((g.level.seasonal||g.level.costume)==='summer')return drawSummerCreature(h,model,c,g);if((g.level.seasonal||g.level.costume)==='spring')return drawSpringCreature(h,model,c,g);if((g.level.seasonal||g.level.costume)==='winter')return drawWinterCreature(h,model,c,g);
 if(!EscapeSeasons.creatures[h.kind]||h.kind==='owl')return false;
 if(h.kind==='snake'){drawSeasonBones(h,model,c,g.elapsed);return true;}
 push();translate(h.x*c,h.y*c);rotate(h.facing+Math.PI/2);scale(c);const t=g.elapsed,hot=['windup','reveal','crouch','charge','lunge','pounce'].includes(h.state),stride=Math.sin(h.distanceMoved*10);
 noStroke();fill(6,16,16,100);ellipse(0,.04,.86,.7);
 if(h.kind==='beetle'){
  // The zombie gardener seen from above. Walking, both arms reach out in front; standing, it sways and nearly topples, then catches itself.
  const walk=seasonMoving(h,t),f=walk?stride*.16:0,lurch=walk?0:Math.pow(Math.max(0,Math.sin(t*.55+h.y*1.7)),6),lx=walk?0:Math.sin(t*1.3+h.x)*.07,ly=walk?-.03:-lurch*.2-Math.abs(lx)*.3,skin=hot?[191,198,119]:[162,180,119];
  fill(58,42,34);ellipse(-.14,f,.15,.24);ellipse(.14,-f,.15,.24);translate(lx,ly);
  for(const s of[-1,1]){let hx,hy;if(walk||hot){const wob=Math.sin(t*(hot?20:6)+s)*.03;hx=s*(hot?.27:.17)+wob;hy=hot?-.64:-.52;}else{hx=s*.36+Math.sin(t*1.3+h.x+s)*.05;hy=.23;}stroke(95,114,78);strokeWeight(.12);line(s*.25,-.01,(s*.25+hx)/2,(hy-.01)/2);stroke(...skin);strokeWeight(.09);line((s*.25+hx)/2,(hy-.01)/2,hx,hy);noStroke();fill(...skin);ellipse(hx,hy-.02,.13,.12);}
  noStroke();fill(76,92,62);ellipse(0,.04,.72,.42);fill(95,114,78);ellipse(0,.03,.64,.34);fill(122,68,61);rect(.12,-.02,.13,.12,.02);fill(76,92,62);ellipse(-.2,.08,.1,.06);
  translate(lx*.8,ly*.6);fill(...skin);ellipse(0,-.1,.34,.32);fill(hot?232:242,hot?60:216,hot?52:124);ellipse(-.07,-.25,.065,.055);ellipse(.07,-.25,.065,.055);
  fill(202,170,96);ellipse(0,-.02,.4,.34);stroke(232,204,128);strokeWeight(.02);for(let i=0;i<7;i++){const a=i*.9+.4;line(Math.cos(a)*.17,-.02+Math.sin(a)*.15,Math.cos(a)*.24,-.02+Math.sin(a)*.2);}noStroke();fill(176,140,72);ellipse(0,0,.22,.19);fill(122,68,61);rect(-.11,-.015,.22,.035);
 }else if(h.kind==='toad'){
  const pulse=hot?1+Math.sin(t*15)*.08:1;scale(pulse);stroke(100,137,65);strokeWeight(.05);noFill();for(const s of[-1,1])bezier(0,.1,s*.55,.5,s*.7,-.1,s*.39,-.13);noStroke();fill(184,83,34);ellipse(0,0,.83,.68);fill(216,111,35);ellipse(0,0,.6,.69);fill(233,140,45);ellipse(0,0,.3,.67);stroke(94,130,63);strokeWeight(.07);line(0,-.3,.06,-.48);noStroke();fill(hot?255:248,hot?243:203,hot?177:104);triangle(-.28,-.06,-.12,-.19,-.07,.02);triangle(.28,-.06,.12,-.19,.07,.02);beginShape();vertex(-.23,.14);vertex(-.08,.19);vertex(0,.13);vertex(.08,.19);vertex(.23,.14);vertex(.1,.3);vertex(-.1,.3);endShape(CLOSE);
 }else if(h.kind==='mimic'){
  // A treat basket seen from above: handle across the top, sweets inside, until the sweets part for eyes and teeth.
  const open=h.state!=='rooted',twitch=!open&&Math.sin(t*2+h.x)>.9?Math.sin(t*27)*.025:0;translate(twitch,0);
  fill(106,67,40);ellipse(0,0,.82,.72);stroke(178,119,67);strokeWeight(.022);noFill();for(let i=0;i<14;i++){const a=i*Math.PI/7;line(Math.cos(a)*.3,Math.sin(a)*.25,Math.cos(a)*.4,Math.sin(a)*.35);}
  noStroke();fill(open?39:84,open?31:52,open?42:32);ellipse(0,0,.64,.54);
  if(open||twitch){fill(255,223,147);ellipse(-.13,-.1,.08,.08);ellipse(.13,-.1,.08,.08);fill(253,236,186);for(let a=-2.6;a<=-.5;a+=.35)triangle(Math.cos(a)*.3,Math.sin(a)*.25,Math.cos(a+.17)*.3,Math.sin(a+.17)*.25,Math.cos(a+.08)*.22,Math.sin(a+.08)*.18);for(const [x,y,col]of[[-.18,.12,[99,152,99]],[.16,.13,[184,111,147]],[0,.17,[246,222,145]]]){fill(...col);ellipse(x,y,.11,.1);}}
  else for(const [x,y,col]of[[-.17,-.06,[99,152,99]],[.15,-.08,[184,111,147]],[0,.04,[246,222,145]],[-.08,.15,[226,120,70]],[.13,.12,[140,96,180]]]){fill(...col);ellipse(x,y,.15,.14);}
  stroke(177,126,69);strokeWeight(.06);line(-.4,0,.4,0);noStroke();
 }else if(h.kind==='fox'){
  // Roast turkey on a tiny platter: animated drumsticks, paper frills and a herb crest.
  const crouch=h.state==='crouch',lift=crouch?.1:Math.abs(stride)*.025;translate(0,lift);fill(154,165,161);ellipse(0,.07,1.02,.75);fill(205,216,199);ellipse(0,.02,.88,.63);fill(hot?193:169,hot?106:84,47);ellipse(0,-.06,.65,.67);fill(206,129,64);ellipse(-.07,-.13,.38,.45);
  for(const side of[-1,1]){push();translate(side*.32,.18+side*stride*.035);rotate(side*-.35);fill(166,83,40);ellipse(0,0,.26,.37);stroke(238,225,193);strokeWeight(.075);line(0,.14,0,.34);noStroke();fill(251,240,206);rect(-.09,.29,.18,.12,.025);pop();}
  fill(74,109,60);for(let i=0;i<3;i++)ellipse((i-1)*.08,-.4,.1,.14);fill(255,235,164);ellipse(-.09,-.1,.065,hot?.12:.07);ellipse(.1,-.1,.065,hot?.12:.07);fill(83,47,38);arc(0,.05,.19,.15,0,Math.PI);if(crouch){noFill();stroke(255,222,130);strokeWeight(.035);arc(0,-.2,1.05,1.05,Math.PI*1.05,Math.PI*1.95);}
 }
 pop();return true;
}
function drawSeasonBones(h,model,c,t){if(!model?.joints)return;const j=model.joints;push();noFill();stroke(74,58,46);strokeWeight(c*.15);beginShape();j.forEach(p=>vertex(p.x*c,p.y*c));endShape();stroke(230,221,182);strokeWeight(c*.045);beginShape();j.forEach(p=>vertex(p.x*c,p.y*c));endShape();
 for(let i=1;i<j.length-1;i++){const p=j[i],w=Math.max(.035,model.widths[i]*1.5);push();translate(p.x*c,p.y*c);rotate(model.angles[i]);stroke(231,222,184);strokeWeight(c*.04);noFill();arc(0,0,c*.16,c*w*2,Math.PI*.2,Math.PI*1.8);noStroke();fill(248,237,193);ellipse(0,0,c*.065,c*.09);pop();}
 const head=j[0];translate(head.x*c,head.y*c);rotate(model.headAngle);noStroke();fill(239,231,191);ellipse(c*.04,0,c*.47,c*.3);rect(c*.15,-c*.12,c*.2,c*.24,c*.04);fill(49,52,44);ellipse(c*.13,-c*.07,c*.1,c*.08);ellipse(c*.13,c*.07,c*.1,c*.08);fill(136,72,69);for(let i=0;i<3;i++)rect(c*(.22+i*.035),-c*.06,c*.013,c*.12);pop();
}
let seasonSceneryCache=null,seasonSceneryMotionQuery;
function clearSeasonScenery(){if(typeof clearSpringScenery==='function')clearSpringScenery();if(typeof clearSummerScenery==='function')clearSummerScenery();seasonSceneryCache?.image.remove?.();seasonSceneryCache=null;if(typeof campaignIceCache!=="undefined"&&campaignIceCache){campaignIceCache.image.remove?.();campaignIceCache=null;}}
function drawSeasonScenery(g,c){if((g.level.seasonal||g.level.costume)==='summer')return drawSummerScenery(g,c);if((g.level.seasonal||g.level.costume)==='spring')return drawSpringScenery(g,c);if((g.level.seasonal||g.level.costume)==='winter')return drawWinterScenery(g,c);
 // Static decorations are painted once per run/cell size, never per tile per frame.
 let cached=seasonSceneryCache;if(!cached||cached.game!==g||cached.cell!==c){cached?.image.remove?.();const art=createGraphics(Math.ceil(g.width*c),Math.ceil(g.height*c));art.pixelDensity(1);art.clear();
  for(const p of g.level.props||[]){const x=(p.at[0]+.5)*c,y=(p.at[1]+.5)*c;art.push();art.translate(x,y);art.noStroke();if(p.kind==='tree'){art.fill(92,57,38);art.rect(-c*.06,-c*.28,c*.12,c*.5);art.fill(178,99,47);art.ellipse(0,-c*.24,c*.65,c*.6);art.fill(225,156,59);art.ellipse(c*.14,-c*.32,c*.32,c*.3);art.fill(177,55,44);art.ellipse(-c*.08,-c*.2,c*.1,c*.1);}else if(p.kind==='lantern'){art.fill(76,55,39);art.rect(-c*.04,-c*.4,c*.08,c*.8);art.fill(104,70,42);art.rect(-c*.18,-c*.5,c*.36,c*.38,c*.05);art.fill(255,210,126);art.rect(-c*.12,-c*.45,c*.24,c*.26,c*.03);art.fill(130,87,44);art.triangle(-c*.23,-c*.5,0,-c*.65,c*.23,-c*.5);art.stroke(104,70,42);art.strokeWeight(c*.025);art.line(0,-c*.45,0,-c*.19);}else{art.fill(162,77,30);art.ellipse(0,0,c*.48,c*.35);art.fill(223,130,39);art.ellipse(0,0,c*.23,c*.36);art.fill(109,128,55);art.rect(-c*.03,-c*.24,c*.06,c*.1);}art.pop();}
  cached={game:g,cell:c,image:art};seasonSceneryCache=cached;
 }image(cached.image,0,0);
 // Decorative lanterns do not change visibility or glow-mushroom shelter rules.
 seasonSceneryMotionQuery??=window.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:false};
 const moving=escapeLightingFull()&&!seasonSceneryMotionQuery.matches;
 for(const flag of g.checkpoints){const x=flag.x*c,y=flag.y*c;noStroke();fill(248,193,88,flag.reached?220:110);rect(x-c*.34,y-c*.55,c*.2,c*.26,c*.04);}
 if(moving){for(let i=0;i<24;i++){const x=((i*5.73+g.elapsed*.28)%g.width),y=((i*3.17+g.elapsed*.19)%g.height);if(!g.floor(Math.floor(x),Math.floor(y)))continue;push();translate(x*c,y*c);rotate(Math.sin(g.elapsed+i)*.8);noStroke();fill(224,154+i%3*16,69,100);ellipse(0,0,c*.12,c*.055);pop();}}
 if(g.level.millWheel){push();translate((g.level.millWheel[0]+.5)*c,(g.level.millWheel[1]+.5)*c);rotate(moving?g.elapsed*.4:0);stroke(129,92,53);strokeWeight(c*.13);noFill();ellipse(0,0,c*1.7,c*1.7);for(let i=0;i<8;i++){const a=i*Math.PI/4;line(0,0,Math.cos(a)*c*.85,Math.sin(a)*c*.85);}pop();}
}
function seasonSoundCue(event,g){if(['spring','summer'].includes(g.level.seasonal||g.level.costume))return null;if(!['warning','spotted','charge','hoot','flutter','rustle','snap','tongue','skitter','rattle','gobble'].includes(event))return null;const kinds=g.level.seasonal==='winter'?{beetle:'winter-yeti',owl:'winter-wisp',snake:'winter-cane',toad:'winter-snowman',mimic:'winter-present',fox:'winter-snatcher',spider:'winter-krampus',sentinel:'winter-watchman'}:{beetle:'season-zombie',owl:'season-ghost',snake:'season-bones',toad:'season-pumpkin',mimic:'season-basket',fox:'season-turkey'};const source=g.lastEventAt?.[event];let candidates=g.hunters.filter(h=>['alert','chase','windup','charge','glare','swoop','reveal','crouch','pounce','lunge','tongue'].includes(h.state));if(source)candidates=candidates.filter(h=>Math.hypot(h.x-source.x,h.y-source.y)<1);return kinds[candidates[0]?.kind]||null;}
