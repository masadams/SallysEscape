const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const tick=(g,seconds,input={},frame=1/120)=>{for(let n=0;n<Math.round(seconds/frame);n++)g.advance(frame,input);};
function room({kind='spider',spawn=[15,10],hunter=[19,10],patrol=[[24,10]],width=31,height=21,...extra}={}){
 const map=Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>!x||!y||x===width-1||y===height-1?'#':'.'));
 map[spawn[1]][spawn[0]]='@';map[1][width-2]='K';map[height-2][1]='X';
 return new EscapeAdventure({level:escapeBuildCustom({id:'glow-shelter',name:'Glow shelter',brief:'',map:map.map(r=>r.join('')),glows:3,explore:true,sightRadius:2,guards:[{kind,spawn:hunter,facing:Math.PI,patrol}],...extra})});
}
function glow(g,x=15.5,y=10.5,ttl=12){const l={x,y,r:4,born:g.elapsed,until:g.elapsed+ttl};g.lights.push(l);g.glowVersion++;g.updateVisibility(true);return l;}
const pos=h=>({x:h.x,y:h.y});

test('a real mushroom throw reveals a wider four-tile glow for twelve seconds, with walls blocking it',()=>{
 const g=room({spawn:[8,10],hunter:[27,15]});g.player.throwAim={x:1,y:0};assert.ok(g.throwGlow(1));tick(g,1);
 const l=g.lights[0];assert.equal(l.r,4);assert.equal(l.until-l.born,12);assert.ok(g.inLight({x:l.x+3.7,y:l.y}));
 assert.ok(g.visibleTile(Math.floor(l.x+3.7),Math.floor(l.y)));assert.equal(g.inLight({x:l.x+4.1,y:l.y}),false);
 for(let y=1;y<g.height-1;y++)g.grid[y][Math.floor(l.x)+2]='#';
 assert.equal(g.inLight({x:l.x+3,y:l.y}),false);g.updateVisibility(true);assert.equal(g.visibleTile(Math.floor(l.x+3),Math.floor(l.y)),false);
 tick(g,12);assert.equal(g.lights.length,0);
});

for(const kind of ['spider','millipede'])test(kind+' scurries to reachable shade, then waits outside a lit Sally',()=>{
 const g=room({kind,hunter:[18,10]});glow(g);const h=g.hunter,start=pos(h);let fled=false;
 for(let n=0;n<360;n++){g.advance(1/120,{});fled||=h.state==='light-flee';assert.ok(g.fits(h,.22,h));}
 assert.ok(fled);assert.ok(Math.hypot(h.x-start.x,h.y-start.y)>.5);assert.equal(g.inLight(h,.35),false);assert.equal(h.state,'light-watch');
 const waiting=pos(h);tick(g,3);assert.deepEqual(pos(h),waiting);assert.equal(g.status,'playing');assert.ok(h.glowFear.lastSeen);
});

test('a spider that watched Sally rushes her last seen spot as soon as the glow expires',()=>{
 const g=room();glow(g);const h=g.hunter;tick(g,11.9);assert.equal(h.state,'light-watch');assert.equal(g.status,'playing');
 tick(g,.2);assert.equal(g.lights.length,0);assert.equal(h.state,'rush');assert.deepEqual(h.aim,pos(g.player));
 tick(g,3);assert.equal(g.status,'caught','waiting in place after the light fades is dangerous');
});

test('an unobserved Sally does not grant a spider knowledge: it returns to its original patrol',()=>{
 const g=room({spawn:[2,2],patrol:[[19,10],[25,10]]}),h=g.hunter;h.facing=0;glow(g);tick(g,3);
 assert.equal(h.state,'light-watch');assert.equal(h.glowFear.lastSeen,null);assert.equal(h.routeIndex,0);const waiting=pos(h);
 tick(g,9.2);assert.equal(h.state,'patrol');assert.equal(h.glowFear,null);assert.equal(h.routeIndex,0);assert.ok(h.x<waiting.x);assert.equal(g.alarms,0);
});

test('a spider can pursue Sally when she leaves the light in plain sight',()=>{
 const g=room();glow(g);tick(g,2);Object.assign(g.player,{x:17.75,y:13.85});tick(g,.05);
 assert.equal(g.inLight(),false);assert.equal(g.hunter.state,'rush');assert.equal(g.hunter.glowFear,null);
});

test('a spider forgets a Sally hidden behind a wall, rather than tracking her through it',()=>{
 const g=room();glow(g);tick(g,2);for(let y=1;y<g.height-1;y++)g.grid[y][18]='#';tick(g,10.2);
 assert.equal(g.hunter.glowFear,null);assert.equal(g.hunter.state,'patrol');assert.equal(g.clear(g.hunter,g.player,true),false);assert.equal(g.status,'playing');
});

test('overlapping mushrooms protect until the last covering light expires',()=>{
 const g=room();glow(g,15.5,10.5,2);glow(g,16,10.5,4);tick(g,2.2);
 assert.equal(g.lights.length,1);assert.equal(g.hunter.glowFear.sources.length,1);assert.equal(g.hunter.state,'light-watch');assert.equal(g.status,'playing');tick(g,2);assert.equal(g.hunter.state,'rush');
});

test('a magpie stealing the light immediately ends the shelter',()=>{
 const g=room(),l=glow(g);tick(g,2);const bird=g.makeHunter({kind:'magpie',spawn:[17,12],facing:0,patrol:[[17,12]]});bird.prize=l;
 g.magpieTake(bird);tick(g,.05);assert.equal(g.lights.length,0);assert.equal(g.hunter.state,'rush');
});

test('walls block the fear response as well as the light',()=>{
 const g=room();for(let y=1;y<g.height-1;y++)g.grid[y][18]='#';glow(g);tick(g,.5);
 assert.equal(g.inLight(g.hunter),false);assert.equal(g.hunter.glowFear,undefined);assert.equal(g.hunter.state,'patrol');
});

test('retreat takes a real path around masonry instead of escaping through the nearest wall',()=>{
 const g=room({hunter:[18,10]});for(let y=8;y<=12;y++)g.grid[y][19]='#';glow(g);
 for(let n=0;n<360;n++){g.advance(1/120,{});assert.ok(g.fits(g.hunter,.22,g.hunter));assert.ok(g.hunter.x<19);}
 assert.equal(g.inLight(g.hunter,.35),false);assert.equal(g.hunter.state,'light-watch');
});

test('a new mushroom at a waiting creature makes it retreat again, beyond both lights',()=>{
 const g=room();glow(g);tick(g,2);const h=g.hunter,start=pos(h);glow(g,h.x,h.y,8);tick(g,3);
 assert.equal(g.inLight(h,.35),false);assert.ok(Math.hypot(h.x-start.x,h.y-start.y)>3);assert.equal(g.status,'playing');
});

test('landing light cancels an armed spider spit, without cancelling a pebble stun',()=>{
 const g=room({hunter:[18,10]}),h=g.hunter;h.state='windup';h.aim=pos(g.player);h.phaseUntil=.1;glow(g);tick(g,.2);
 assert.equal(h.state,'light-flee');assert.equal(g.webs.length,0);
 h.state='steamed';h.phaseUntil=g.elapsed+1;const before=pos(h);tick(g,.2);assert.equal(h.state,'steamed');assert.deepEqual(pos(h),before);
});

test('a fully lit dead end makes a creature cower safely, with bounded retreat retries',()=>{
 const g=room({width:7,height:7,spawn:[2,2],hunter:[3,3],patrol:[[3,3]]});glow(g,3.5,3.5,3);
 let searches=0;const find=g.glowShade;g.glowShade=function(h){searches++;return find.call(this,h);};tick(g,2);
 assert.equal(g.status,'playing');assert.ok(searches<=5,'no repeated full search each frame: '+searches);assert.ok(g.fits(g.hunter,.22,g.hunter));
 assert.equal(g.hunter.state,'light-flee');tick(g,1.2);assert.equal(g.hunter.glowFear,null);
});

test('patrol paths detour round a mushroom and invalidate a previously cached route',()=>{
 const g=room({spawn:[2,2],hunter:[9,10],patrol:[[23,10]]}),h=g.hunter;
 h.path=g.route(h,{x:23.5,y:10.5},h);h.targetId='23,10';glow(g,15.5,10.5,60);
 let detoured=false;for(let n=0;n<120*28;n++){g.advance(1/120,{});assert.equal(g.inLight(h,.34),false,'patrol never cuts across the light');detoured||=Math.abs(h.y-10.5)>4;}
 assert.ok(detoured);assert.ok(h.x>21,'the detour reaches the other side');
});

test('a blocked patrol retries at most twice a second instead of pathfinding every frame',()=>{
 const g=room({spawn:[2,2],hunter:[9,10],patrol:[[15,10]]}),h=g.hunter;glow(g,15.5,10.5,60);
 let routes=0;const route=g.route;g.route=function(...args){routes++;return route.apply(this,args);};tick(g,2);
 assert.ok(routes<=5,'bounded blocked-route attempts: '+routes);assert.equal(g.inLight(h),false);
});

test('a door closing during retreat cannot trigger repeated pathfinding every frame',()=>{
 const g=room({hunter:[18,10]});glow(g);tick(g,.025);for(let y=1;y<g.height-1;y++)g.grid[y][19]='#';
 let routes=0;const route=g.route;g.route=function(...args){routes++;return route.apply(this,args);};tick(g,.3);
 assert.ok(routes<=1,'the blocked retreat route waits before retrying: '+routes);tick(g,3);
 assert.ok(g.hunter.x<19);assert.ok(g.fits(g.hunter,.22,g.hunter));assert.equal(g.inLight(g.hunter,.35),false);
});

test('pause freezes shelter time, and a fresh attempt restores ordinary creatures and tools',()=>{
 const g=room();glow(g);tick(g,2);g.paused=true;const before={elapsed:g.elapsed,light:g.lights[0].until,h:pos(g.hunter)};tick(g,20);
 assert.equal(g.elapsed,before.elapsed);assert.equal(g.lights[0].until,before.light);assert.deepEqual(pos(g.hunter),before.h);
 const fresh=new EscapeAdventure({level:g.level});assert.equal(fresh.lights.length,0);assert.equal(fresh.hunter.glowFear,undefined);assert.equal(fresh.glows,3);
});

test('millipedes keep their freeze-when-watched rule after shelter expires',()=>{
 const g=room({kind:'millipede',sightRadius:8,gaze:true});g.player.facing={x:1,y:0};glow(g);tick(g,12.2);
 assert.equal(g.hunter.state,'still');const before=pos(g.hunter);tick(g,1);assert.deepEqual(pos(g.hunter),before);
 g.player.facing={x:-1,y:0};tick(g,1.3);assert.equal(g.hunter.state,'follow');assert.ok(g.hunter.x<before.x);
});

test('tripwire webs cannot override a spider watching a lit Sally',()=>{
 const g=room();glow(g);tick(g,2);g.webs.push({...pos(g.player),expires:Infinity,trip:true,owner:g.hunter});tick(g,.1);
 assert.equal(g.hunter.state,'light-watch');assert.equal(g.status,'playing');
});

test('ordinary hunters remain dangerous inside the glow, while natural plant light is not a repellent',()=>{
 const g=room({kind:'snake',hunter:[15,10]});glow(g);tick(g,.02);assert.equal(g.status,'caught');
 const natural=room({glowPlants:[[19,10]]});assert.equal(natural.updateGlowFear(.01,natural.hunter),false);
 for(const kind of ['toad','beetle','moth','bat','magpie']){const plain=room({kind});glow(plain);assert.equal(plain.updateGlowFear(.01,plain.hunter),false,kind);}
});

test('flee and watch behave identically under normal and batched frame times',()=>{
 const a=room(),b=room();glow(a);glow(b);tick(a,3);tick(b,3,{},.1);
 assert.equal(a.hunter.state,b.hunter.state);assert.ok(Math.hypot(a.hunter.x-b.hunter.x,a.hunter.y-b.hunter.y)<1e-8);assert.equal(a.status,b.status);
});
