// The bestiary: one card for every creature Sally can meet. A card fills in the first time she
// comes near that creature in an escape; until then it shows only where it lives.
(function(root){
  const entries=[
    {kind:'snake',name:'Snake',icon:'🐍',job:'Chaser',hunts:'Patrols, spots Sally, chases, searches, then gives up. Brushing the tail of a resting snake wakes it.',tip:'Break its sight at a corner, hide in leaves, or throw a pebble. Never step on a still snake’s tail.'},
    {kind:'beetle',name:'Beetle',icon:'🪲',job:'Battering ram',hunts:'Locks a lane toward where Sally is heading, then charges past its aim, flattening leaves and smashing cracked walls.',tip:'Step out of the striped lane. Lure it into a cracked wall to open a shortcut.'},
    {kind:'scorpion',name:'Scorpion',icon:'🦂',job:'Living trap',hunts:'Guards a ring. While its tail is up, anything entering the ring is stung. Noise keeps the tail up; some lie buried.',tip:'Cross while the tail is down, and change direction if it strikes.'},
    {kind:'spider',name:'Spider',icon:'🕷️',job:'Builder',hunts:'Leaves tripwire webs on its rounds. A touched web slows Sally and sends the spider rushing. Up close it spits.',tip:'Watch the floor and step around the webs.'},
    {kind:'moth',name:'Moth',icon:'🦋',job:'Lantern',hunts:'Its glow lights Sally up, so leaves stop hiding her and every hunter sees further. It swoops on glowing footprints.',tip:'Keep out of the light and cross while it drifts away.'},
    {kind:'mimic',name:'Mimic',icon:'🎁',job:'Greed trap',hunts:'Looks like a treasure chest, with a slow breath and a rare blink. Reach for it and it snaps.',tip:'Learn the tell, or throw a pebble to make it snap first.'},
    {kind:'cricket',name:'Cricket',icon:'🦗',job:'Alarm',hunts:'Harmless, but when it sees or hears Sally it chirps and every hunter in earshot comes running.',tip:'Stay quiet and out of its sight, or let it chirp somewhere useless.'},
    {kind:'toad',name:'Toad',icon:'🐸',job:'Sniper',hunts:'Fires its tongue down any clear straight line toward Sally, up to five tiles.',tip:'Break its line behind pillars, walls or leaves.'},
    {kind:'millipede',name:'Millipede',icon:'🐛',job:'Lurker',hunts:'Freezes while watched and creeps after Sally when she looks away, a little slower than she walks.',tip:'Keep it in view while you back away.'},
    {kind:'angler',name:'Angler',icon:'🎣',job:'Bait',hunts:'Hides under dark water and dangles a lure that looks like a glow bug. Step close and it lunges.',tip:'Walk around the lure, or spring it from afar with a pebble and pass while it sinks.'},
    {kind:'flytrap',name:'Flytrap',icon:'🌺',job:'Rooted biter',hunts:'Snaps at anything that comes within its marked reach, then chews for a couple of seconds.',tip:'Feed it a pebble and pass while it chews.'},
    {kind:'cobra',name:'King cobra',icon:'👑',job:'Striker',hunts:'Coils on its post. On sight it rears, strikes where Sally is heading, then chases faster than any snake.',tip:'Sidestep the moment it rears, then break its sight.'},
    {kind:'crab',name:'Hermit crab',icon:'🦀',job:'Lane guard',hunts:'Peeks out when Sally is close in plain sight, then scuttles sideways along its lane to pinch.',tip:'Cross its lane at a sprint, while it is tucked in, or after a pebble.'},
    {kind:'fish',name:'Reef fish',icon:'🐟',job:'Water guard',hunts:'Patrols the water and chases anything swimming in plain sight, but cannot follow ashore.',tip:'Climb out onto dry ground, or swim while it faces away.'},
    {kind:'sea-snake',name:'Sea snake',icon:'🌊',job:'Two-world chaser',hunts:'Hunts on land and in the water alike, so a swim is no escape.',tip:'Use cover on land; it loses Sally like any snake.'},
    {kind:'owl',name:'Owl',icon:'🦉',job:'Searchlight',hunts:'Turns between look-outs with a long narrow beam, glares, then swoops on its marked spot.',tip:'Hide in leaves or behind cover before it lands.'},
    {kind:'heron',name:'Bog heron',icon:'🦩',job:'Rooted striker',hunts:'Stands frozen with the line before its beak marked. Anything stepping into it is stabbed. It never sees a swimmer.',tip:'Cross while it looks away or recovers, or swim past.'},
    {kind:'hawk',name:'Hawk',icon:'🦅',job:'Sky',hunts:'Its shadow follows Sally across open ground and dives on a timer.',tip:'Shelter under an awning, in leaves, or with camouflage.'},
    {kind:'ants',name:'Ant column',icon:'🐜',job:'Moving wall',hunts:'Marches a fixed loop and catches anything it walks over.',tip:'Cross in the gaps between groups.'},
    {kind:'gecko',name:'Gecko',icon:'🦎',job:'Thief',hunts:'Steals the last treasure Sally picked up and runs for its burrow.',tip:'Catch it before it gets home.'},
    {kind:'mantis',name:'Praying mantis',icon:'🌿',job:'Ambusher',hunts:'Looks like a twig until Sally is close. Anything that moves into the short cone before it, a hunter included, is snatched after a quarter-second tell.',tip:'Look for the kinked twig. Cross behind it or while it recovers, or let it snatch a pebble or a hunter first.'},
    {kind:'fox',name:'Snow fox',icon:'🦊',job:'Ear hunter',hunts:'Hunts by sound. Footsteps, sprints or noisy ground and it pounces far and fast on the noise.',tip:'Stand still, walk on quiet ground, or toss a pebble to send its pounce elsewhere.'},
  ];
  // Where each creature first lives: the earliest escape that has it, worked out from the levels.
  function homes(catalog){
    const first={};
    catalog.levels.forEach((level,i)=>{
      for(const g of level.guards||[]){const k=g.kind||'snake';if(!(k in first))first[k]=i;}
      if(level.hawk&&!('hawk' in first))first.hawk=i;
      if(level.antTrails?.length&&!('ants' in first))first.ants=i;
    });
    return first;
  }
  const api={entries,homes,byKind:kind=>entries.find(e=>e.kind===kind)||null};
  if(typeof module!=='undefined'&&module.exports)module.exports={EscapeBestiary:api};else root.EscapeBestiary=api;
})(typeof globalThis!=='undefined'?globalThis:this);
