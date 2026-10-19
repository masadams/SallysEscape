// These are costumes, not new collision shapes. Every warning and hit test stays in the engine.
function seasonPalette(l){return l.seasonalTheme==='autumn-night'?[[39,43,51],[102,74,64],[194,151,91]]:l.seasonalTheme==='autumn-mill'?[[56,53,40],[107,80,49],[194,148,88]]:[[65,53,38],[126,81,49],[222,162,81]];}
function drawSeasonGhost(h,c,g){
 // The same seven-tile, wall-clipped cone as the original owl; its cool colour belongs to the lantern.
 if(h.state==='patrol'){noStroke();fill(167,226,246,44);beginShape();vertex(h.x*c,h.y*c);for(let a=-Math.PI/9;a<=Math.PI/9+.001;a+=Math.PI/36){let reach=0;for(let d=.2;d<=7;d+=.2){if(!g.clear(h,{x:h.x+Math.cos(h.facing+a)*d,y:h.y+Math.sin(h.facing+a)*d},true))break;reach=d;}vertex((h.x+Math.cos(h.facing+a)*reach)*c,(h.y+Math.sin(h.facing+a)*reach)*c);}endShape(CLOSE);}
 const warn=h.state==='glare',bob=Math.sin(g.elapsed*3+h.x)*.035;push();translate(h.x*c,(h.y+bob)*c);scale(c);
 noStroke();fill(8,20,27,70);ellipse(0,.35,.85,.2);fill(warn?255:208,warn?218:236,239,235);
 beginShape();vertex(-.37,.3);vertex(-.34,-.18);bezierVertex(-.34,-.63,.34,-.63,.34,-.18);vertex(.37,.3);vertex(.2,.22);vertex(.08,.36);vertex(-.08,.23);vertex(-.23,.35);endShape(CLOSE);
 fill(45,68,88);ellipse(-.12,-.16,.075,warn?.16:.1);ellipse(.12,-.16,.075,warn?.16:.1);ellipse(0,.02,.08,warn?.13:.045);
 stroke(132,191,199);strokeWeight(.035);noFill();line(.26,0,.48,.08);arc(.49,.14,.19,.25,Math.PI,Math.PI*2);fill(warn?255:174,warn?200:230,236);rect(.39,.14,.21,.27,.04);line(.39,.15,.6,.15);pop();
}
function drawSeasonCreature(h,model,c,g){
 if(!EscapeSeasons.creatures[h.kind]||h.kind==='owl')return false;
 if(h.kind==='snake'){drawSeasonBones(h,model,c,g.elapsed);return true;}
 push();translate(h.x*c,h.y*c);rotate(h.facing+Math.PI/2);scale(c);const t=g.elapsed,hot=['windup','reveal','crouch','charge','lunge','pounce'].includes(h.state),stride=Math.sin(h.distanceMoved*10);
 noStroke();fill(6,16,16,100);ellipse(0,.16,.85,.5);
 if(h.kind==='beetle'){
  // A little scarecrow gardener: two booted feet and jointed, rising arms make the charge readable.
  stroke(63,64,62);strokeWeight(.13);line(-.14,.1,-.17,.4+stride*.04);line(.14,.1,.17,.4-stride*.04);noStroke();fill(58,42,34);ellipse(-.18,.42+stride*.04,.2,.13);ellipse(.18,.42-stride*.04,.2,.13);
  fill(95,114,78);rect(-.24,-.2,.48,.43,.08);fill(122,68,61);rect(-.2,-.15,.15,.24,.02);stroke(154,177,120);strokeWeight(.095);
  for(const side of[-1,1]){const yy=hot?-.45:-.03+stride*.04;line(side*.21,-.13,side*.39,yy);line(side*.39,yy,side*.24,hot?-.65:yy-.12);}noStroke();fill(hot?191:162,hot?198:180,119);rect(-.2,-.55,.4,.35,.09);fill(64,48,43);rect(-.31,-.57,.62,.075,.02);rect(-.19,-.72,.38,.17,.03);fill(242,216,124);ellipse(-.075,-.39,.065,.08);ellipse(.085,-.39,.065,.08);stroke(83,100,62);strokeWeight(.02);line(-.06,-.27,.1,-.3);
 }else if(h.kind==='toad'){
  const pulse=hot?1+Math.sin(t*15)*.08:1;scale(pulse);stroke(100,137,65);strokeWeight(.05);noFill();for(const s of[-1,1])bezier(0,.1,s*.55,.5,s*.7,-.1,s*.39,-.13);noStroke();fill(184,83,34);ellipse(0,0,.83,.68);fill(216,111,35);ellipse(0,0,.6,.69);fill(233,140,45);ellipse(0,0,.3,.67);stroke(94,130,63);strokeWeight(.07);line(0,-.3,.06,-.48);noStroke();fill(hot?255:248,hot?243:203,hot?177:104);triangle(-.28,-.06,-.12,-.19,-.07,.02);triangle(.28,-.06,.12,-.19,.07,.02);beginShape();vertex(-.23,.14);vertex(-.08,.19);vertex(0,.13);vertex(.08,.19);vertex(.23,.14);vertex(.1,.3);vertex(-.1,.3);endShape(CLOSE);
 }else if(h.kind==='mimic'){
  const open=h.state!=='rooted',twitch=!open&&Math.sin(t*2+h.x)>.9?Math.sin(t*27)*.025:0;translate(twitch,0);
  stroke(177,126,69);strokeWeight(.055);noFill();arc(0,-.22,.6,.65,Math.PI,Math.PI*2);noStroke();fill(106,67,40);rect(-.39,-.15,.78,.52,.1);stroke(178,119,67);strokeWeight(.025);for(let y=-.08;y<.36;y+=.1)line(-.34,y,.34,y);for(let x=-.25;x<.35;x+=.13)line(x,-.12,x,.33);
  noStroke();fill(233,173,99);rect(-.42,open?-.48:-.23,.84,.12,.04);fill(99,152,99);ellipse(-.2,-.25,.14,.13);fill(184,111,147);ellipse(.18,-.26,.15,.14);fill(246,222,145);ellipse(0,-.26,.12,.12);
  if(open||twitch){fill(255,223,147);ellipse(-.14,.01,.07,.07);ellipse(.14,.01,.07,.07);fill(39,31,42);rect(-.25,.1,.5,.14,.07);fill(253,236,186);for(let x=-.18;x<.2;x+=.12)triangle(x,.1,x+.07,.1,x+.03,.18);}
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
function clearSeasonScenery(){seasonSceneryCache?.image.remove?.();seasonSceneryCache=null;}
function drawSeasonScenery(g,c){
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
function seasonSoundCue(event,g){if(!['warning','spotted','charge','hoot','flutter','rustle','snap','tongue','skitter','rattle','gobble'].includes(event))return null;const kinds={beetle:'season-zombie',owl:'season-ghost',snake:'season-bones',toad:'season-pumpkin',mimic:'season-basket',fox:'season-turkey'};const source=g.lastEventAt?.[event];let candidates=g.hunters.filter(h=>['alert','chase','windup','charge','glare','swoop','reveal','crouch','pounce','lunge','tongue'].includes(h.state));if(source)candidates=candidates.filter(h=>Math.hypot(h.x-source.x,h.y-source.y)<1);return kinds[candidates[0]?.kind]||null;}
