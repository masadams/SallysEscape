// The story of Sally's Escape, as data: three parts, an opening, a card for every area, the
// finale and what comes after, and the notes a lost Wayfinder left in the secret spots. Cards
// are collected the first time they are read and can be read again from the Journal (Story).
// Part One's cards are pages of Old Moss's garden journal; from Part Two on they are pages of
// the Great Map, and every map page found fills in a little more of the Overgrowth.
(function(root){
  // Each part begins at an area (its index on the trail).
  const PARTS=[
    {n:1,title:'Part One',name:'Carried Away',from:0,line:'A storm, a flood, and a very long way from home.'},
    {n:2,title:'Part Two',name:'The Wayfinder',from:8,line:'Old paths, glowing under small feet.'},
    {n:3,title:'Part Three',name:'The Great Map',from:15,line:'Every page carries the light a little further.'}
  ];
  const OPENING={id:'opening',kind:'journal',title:'The Night of the Flood',body:[
    'Sally is a small garden lizard. She lives in a little burrow under the warm stone by the old gate, where the sun lingers longest.',
    'One night a storm came. The rain fell so hard the garden became a river, and the river carried Sally away: over the wall, past the hedges, into the Overgrowth, a wild tangle of meadows and ruins and marsh and caves that was once one great garden.',
    'She woke in Sunny Meadow, muddy and lost, beside a very old tortoise. "I’m Old Moss," he said. "I kept these gardens once, with lanterns full of glow bugs. When the last lantern went dark the creatures grew frightened, and frightened creatures guard what little they have. If you want to go home, little one, you’ll have to sneak."']};
  // One card per area, in trail order. Part One: Old Moss's journal. Parts Two and Three: the Great Map.
  const AREAS=[
    {theme:'meadow',title:'Sunny Meadow',body:['The snakes here coil around anything shiny. They are not cruel, only afraid it will be taken. Keep to the long grass and they will never know you passed.','In the margin, in Old Moss’s spidery hand: the Wayfinders always started their walks here, at dawn.']},
    {theme:'garden',title:'Garden Ruins',body:['These walls kept the old garden’s beds tidy once. Now beetles guard them as if the walls still mattered.','The cracked ones crumble if you push. I always meant to mend them. I am glad, now, that I never did.']},
    {theme:'river',title:'Reedbanks',body:['The river that carried you here has a gentler side. Frogs sing in the reeds and nothing on land follows a swimmer.','A note, smudged by water: the Wayfinders said the river remembers every path it ever crossed.']},
    {theme:'ruins',title:'Restless Ruins',body:['Gates that open, gates that slam, switches no one remembers setting. The ruins were built by someone who loved puzzles.','Old Moss has drawn a little lizard beside a lever and written: clever paws. Whose, he does not say.']},
    {theme:'quarry',title:'Deep Trials',body:['The old quarry, where the garden’s stones were cut. Everything down here was built to test whoever came through.','Trials for whom? The page has been torn, and only one word is left at the edge: …finders.']},
    {theme:'desert',title:'Venom Depths',body:['Hot sand, scorpions and chests that bite. When the light went out here, the warmth stayed and the creatures grew fierce in it.','Move when the scorpion’s tail is down. Wait when it is up. Patience is a lizard’s oldest trick.']},
    {theme:'marsh',title:'The Waking Maze',body:['The maze moves while you sleep. Paths open and close like slow breathing.','The Wayfinders could walk it with their eyes shut, Old Moss writes. I never learned how. I always followed one of them.']},
    {theme:'jungle',title:'Hollow Jungle',body:['Vines, tangles and hunters that wait without moving. The jungle grew wild fastest once the lanterns failed.','The last page of the journal. After it, nothing but a pressed leaf and a drawing of a compass, its needle pointing down, below the jungle floor.']},
    // The turn: Sally learns what she is.
    {theme:'glow',title:'The Waystone',kind:'map',body:['Deep in the glowing caves, Sally found a stone carved with a lizard just like her, mid-stride, with a compass worked into the rock. When she touched it, old marks lit up beneath her feet: paths, glowing paths, running off in every direction.','Long ago the Wayfinders, small lizards who could feel the old paths, kept the Great Map of the Overgrowth. The map kept the paths true, and the paths carried the light from lantern to lantern. Then the Wayfinders vanished, the map was scattered, the paths drifted, and one by one the lanterns went dark.','Sally can feel the paths. She is a Wayfinder. Perhaps the last one.','Going home is not enough any more. If she gathers the Great Map and walks its paths again, the light can travel, and the frightened creatures can rest.']},
    {theme:'orchard',title:'Living Labyrinth',kind:'map',body:['Map page: hedges that grow while you watch. A Wayfinder’s note beside the sketch: never fight the garden, walk with it.','Old Moss, when Sally showed him the page: "So you know now. I was never a gardener first. I was a trail-runner. I ran messages between the lanterns for the Wayfinders. Quick as a lizard, they said. I was trying to be one of you."']},
    {theme:'coast',title:'Sun and Sea',kind:'map',body:['Map page: the coast, with tide marks and a hermit crab drawn in the corner, very cross.','Note: the crabs guarded the beach lanterns for us once. They still guard. They have only forgotten what.']},
    {theme:'hollow',title:'The Shedding Hollow',kind:'map',body:['Map page: a hollow where old skins hang like paper lanterns. A Wayfinder sheltered here from a storm, the note says, and left her old skin behind for luck.','Every lizard leaves something behind to grow. Remember that, if you ever lose your tail.']},
    {theme:'lantern',title:'The Lantern Marsh',kind:'map',body:['Map page: the marsh of a hundred lanterns, every one dark. Owls roost on the hooks where the lights hung.','Note: the owls kept watch over the lanterns at night. They watch still, only now they watch for us.']},
    {theme:'rooftops',title:'Sunbaked Rooftops',kind:'map',body:['Map page: tiles and chimneys, and a hawk circling in pencil. The Wayfinders crossed the roofs at noon, in the shadow of the awnings.','A smaller note, in a different hand: F. went over the roofs alone. Brave or foolish. Both, probably.']},
    {theme:'ants',title:'Ant Kingdom',kind:'map',body:['Map page: tunnels drawn so neatly they look like lace. The ants were the Wayfinders’ oldest friends, and they never forgot a path.','The ants marched aside for Sally today, just for a moment. As if they remembered.']},
    {theme:'frost',title:'Frost Hollow',kind:'map',body:['Map page: ice, warm stones and tall still figures drawn in blue. The frost sentinels were the Wayfinders’ guardians. When the last Wayfinder left, they froze at their posts deep in the ice caves to wait for one to come back. Their gaze bends off the ice because they are still looking for the old paths.','The last Wayfinder entry on this page just stops, halfway through a word: “we are going on, past the edge of the…”']},
    {theme:'vents',title:'Steam Vents',kind:'map',body:['Map page: pipes and jets that the old garden used to warm its glasshouses. The beetles keep the valves now, and keep them badly.','Note: count the bursts, then go. Every machine has a rhythm, even a broken one.']},
    {theme:'grotto',title:'Mushroom Grotto',kind:'map',body:['Map page: caps that glow, puffs that hide you, and the softest light in the Overgrowth.','When the lanterns failed, the mushrooms kept a little light alive down here. The grotto never forgot what light was for.']},
    {theme:'storm',title:'Storm Heights',kind:'map',body:['Map page: the heights where the storm that carried Sally away was born. Lightning shows everything for a moment, and then nothing.','Note: the light comes back, even here. Hide in the dark, cross in the flash.']},
    {theme:'tide',title:'Tide Pools',kind:'map',body:['Map page: pools that empty and fill twice a day. The last page before home, its edges worn soft from being carried a long way.','Sally can see her own garden wall from the rocks, small and far away. The paths on the map run straight towards it.']},
    {theme:'home',title:'The Road Home',kind:'map',body:['Map page: the road to the old gate, and at its end a warm stone, drawn with care, as if whoever drew it had sat there.','The first page of the Great Map was always the Wayfinder’s own home. Sally has been carrying the last page all along.']}
  ];
  const FINALE={id:'finale',kind:'map',title:'Home',body:['Sally reached the old gate with the last page of the Great Map. When she laid it down by the warm stone, the first lantern woke, the one by her own home, and its light ran out along the paths, from lantern to lantern, across the whole Overgrowth.','Old Moss was waiting by the stone. He had known what she was all along. "Your home was always the first place on the map," he said. "Every Wayfinder starts where they’re from."','The creatures settled. The paths stayed true. And for the first time since the flood, Sally slept in the sun on her own warm stone.']};
  const AFTER={id:'after',kind:'note',title:'One Page Missing',body:['One page of the Great Map is still missing. Its torn edge shows a coastline no one in the Overgrowth has ever seen, and a line of tiny lizard footprints walking off the paper.','"The other Wayfinders didn’t vanish," Old Moss says quietly. "They went somewhere."','To be continued…']};
  // Notes from Fennel, a Wayfinder who went ahead and was never seen again, one in each secret spot.
  const NOTES=[
    {spot:'star-garden',title:'A Note in the Star Garden',body:['If you are reading this, you can feel the paths too. Hello. I planted these beds the night the last lantern went out, so there would still be something bright to walk towards.','— F.']},
    {spot:'mossy-well',title:'A Note in the Mossy Well',body:['Talk into the well and it talks back. I used to tell it where I was going, so somebody would know. Nobody answered but the frogs.','— F.']},
    {spot:'cloud-nest',title:'A Note in the Cloud Nest',body:['From up here you can see the whole Overgrowth, and past it, the sea. There is something on the far side of the sea. I am sure of it.','— F.']},
    {spot:'challenge-shrine',title:'A Note in the Shrine',body:['The old trials. Every Wayfinder walked them once. I walked them twice, to be certain I was ready.','— F.']},
    {spot:'bestiary-grove',title:'A Note in the Grove',body:['I made friends with a chameleon here. He never once let me see him, but he left a beetle on my pillow every morning.','— F.']},
    {spot:'ice-cave',title:'A Note in the Ice Cave',body:['The sentinels will wait for us. I told them we would come back. I hope that was not a lie.','— F.']},
    {spot:'sunken-wreck',title:'A Note in the Wreck',body:['This boat did not sink by accident. We are building a better one. When it is ready, we sail. If you find this and we are gone, look for us past the edge of the map.','— Fennel, Wayfinder']},
    {spot:'magpie-roost',title:'A Note in the Magpie Roost',body:['Magpies keep anything that glints, so the old Wayfinders left their spare pebbles here and never ran short. Throw freely, but watch the black-and-white bird on its perch: it calls the hunters, and it flies off with anything shiny you toss. While it is away, its perch sees nothing.','— F.']},
    {spot:'blind-grove',title:'A Note in the Blind Grove',body:['The old Wayfinders practised here with their eyes on the creatures, never on the ground. A snake tells you everything if you watch it: the lift of its head, the turn before it looks.','— F.']},
    {spot:'gilded',title:'A Note in the Gilded Burrow',body:['All this gold, and not one lantern’s worth of light in it. The ones who hoarded it never understood the difference.','— F.']},
    {spot:'bramble',title:'A Note in the Bramble Maze',body:['I got lost in here for three days. A Wayfinder, lost! Do not tell anyone.','— F.']}
  ];
  const areaCard=(a,i)=>({id:'area:'+a.theme,kind:a.kind||'journal',title:a.title,body:a.body,area:i,part:PARTS.filter(p=>i>=p.from).length});
  const CARDS=[{...OPENING,part:1},...AREAS.map(areaCard),{...FINALE,part:3},{...AFTER,part:3},...NOTES.map(n=>({id:'note:'+n.spot,kind:'note',title:n.title,body:n.body,spot:n.spot}))];
  const byId=id=>CARDS.find(c=>c.id===id)||null;
  const partFor=area=>PARTS.filter(p=>area>=p.from).at(-1)||PARTS[0];
  // Which secret spot a hidden escape belongs to, for its note.
  const spotFor=level=>level?.secret||(level?.bonus?(level.id==='bramble-maze'?'bramble':null):level?.hidden?'gilded':null);
  const api={PARTS,CARDS,AREAS,NOTES,byId,partFor,spotFor,areaCard:i=>byId('area:'+AREAS[i]?.theme)};
  root.EscapeStory=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
