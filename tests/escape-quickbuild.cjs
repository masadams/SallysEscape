const test=require('node:test'),assert=require('node:assert/strict');
const Q=require('../public/escape-quickbuild.js'),B=require('../public/escape-builder.js');
const {escapeBuildCustom}=require('../public/escape-levels.js');const {rules}=require('../scripts/lint-levels.cjs');
const FLYING=new Set(['owl','moth','dragonfly','bat']);

test('the same settings and seed always make the same level, and a new seed a new one',()=>{
  const a=Q.generate({size:'medium',theme:'jungle',difficulty:2,seed:1234}),b=Q.generate({size:'medium',theme:'jungle',difficulty:2,seed:1234});
  assert.deepEqual(a.model,b.model);assert.equal(a.seed,b.seed);
  const c=Q.generate({size:'medium',theme:'jungle',difficulty:2,seed:98765});assert.notDeepEqual(c.model.map,a.model.map);
});

test('every size, theme and difficulty makes a fair draft: it builds, passes the linter and the start is safe',()=>{
  let seed=11;
  for(const size of Object.keys(Q.SIZES))for(const theme of Object.keys(Q.THEMES))for(const difficulty of [1,2,3]){
    const r=Q.generate({size,theme,difficulty,seed:seed+=101}),m=r.model,label=size+' '+theme+' '+difficulty+' seed '+r.seed;
    assert.deepEqual(r.problems,[],label);assert.deepEqual(B.validate(m),[],label);
    assert.equal(m.map[0].length,Q.SIZES[size].w,label);assert.equal(B.treasureTotal(m),10,label+': ten treasure');
    assert.ok(m.requiredTreasure<=10&&m.requiredTreasure>0,label);assert.ok(m.guards.length>=1,label);
    const start=m.map.join('\n').split('\n').flatMap((row,y)=>[...row].map((c,x)=>c==='@'?[x,y]:null)).find(Boolean);
    for(const g of m.guards)if(!FLYING.has(g.kind))assert.ok(Math.hypot(g.spawn[0]-start[0],g.spawn[1]-start[1])>=6,label+': '+g.kind+' by the start');
    const level=escapeBuildCustom(B.toRoute(m)),errors=rules(level,{level}).filter(f=>f.level==='error');
    assert.deepEqual(errors.map(f=>f.msg),[],label);
  }
});

test('a featured creature is in the level, the theme sets its extras, and the draft survives the builder’s own checks',()=>{
  for(const feature of Q.FEATURES){const r=Q.generate({size:'small',theme:'meadow',difficulty:1,seed:5,feature});assert.ok(r.model.guards.some(g=>g.kind===feature),feature);assert.deepEqual(r.problems,[],feature);}
  const frost=Q.generate({size:'medium',theme:'frost',difficulty:2,seed:3}).model;assert.ok(frost.cold.length>50&&frost.warm.length>=6);
  const glow=Q.generate({size:'medium',theme:'grotto',difficulty:2,seed:3}).model;assert.equal(glow.dark,true);assert.ok(glow.glowPlants.length>=6);
  const desert=Q.generate({size:'medium',theme:'desert',difficulty:3,seed:3}).model;assert.equal(desert.biome,'desert');assert.ok(desert.hawk&&desert.shade.length);
  for(const m of [frost,glow,desert]){const again=B.sanitize(JSON.parse(JSON.stringify(m)));assert.deepEqual(B.validate(again),[]);assert.deepEqual(again.map,m.map);}
});
