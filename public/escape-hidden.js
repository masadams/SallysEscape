// The Gilded Burrow. Nothing in the game mentions it.
(function(root){
  const PI=Math.PI;
  const routes=[
{id:"gilded-gate",name:"Gilded Gate",brief:"Three gilded lanes, and every one of them is watched.",hint:"The hatch wants six treasure.",pebbles:1,tongues:1,explore:false,requiredTreasure:6,map:[
 "#############################",
 "#X..........L.......N......K#",
 "#.L....#.........#..........#",
 "#1.......N...2..............#",
 "####.#########.#########.####",
 "####.#########.#########.####",
 "#2.........................1#",
 "#.............3...........L.#",
 "#...........................#",
 "#########.#########.#########",
 "#########.#########.#########",
 "#.......................L...#",
 "#.....L....#..N......#......#",
 "#@..............L..........1#",
 "#############################"],logs:[{from:[27,7],to:[1,7],period:4,offset:0,speed:7},{from:[1,7],to:[27,7],period:4,offset:2,speed:7}],thorns:[{tiles:[[4,4],[4,5]],period:2.4,up:1.2},{tiles:[[14,4],[14,5]],period:2.4,up:1.2,offset:0.8},{tiles:[[24,4],[24,5]],period:2.4,up:1.2,offset:1.6},{tiles:[[9,9],[9,10]],period:2.6,up:1.3},{tiles:[[19,9],[19,10]],period:2.6,up:1.3,offset:1.3}],guards:[{spawn:[20,2],facing:PI,patrol:[[3,2],[26,2]]},{spawn:[8,12],facing:0,patrol:[[25,12],[3,12]]},{kind:"scorpion",spawn:[26,2],facing:PI,patrol:[[26,2]]},{kind:"beetle",spawn:[20,13],facing:PI,patrol:[[13,13],[25,13]]},{kind:"scorpion",spawn:[6,3],facing:0,buried:true,patrol:[[6,3]]}]},
{id:"hall-of-mirrors",name:"Hall of Mirrors",brief:"A dark hall of pillars and one bridge that rises once.",hint:"The plate raises the bridge once. Do not dawdle on the far side.",gaze:true,pebbles:1,tongues:1,explore:true,sightRadius:4.5,map:[
 "#############################",
 "#1...........___....1.....L.#",
 "#.........L..___............#",
 "#..#..#..#...___..#..#..#...#",
 "#X.....N.....___..........K.#",
 "#............___............#",
 "#..#..#..#...___..#..#..#...#",
 "#L......1....___.......3....#",
 "#............___...L........#",
 "#..#..#..#...___..#..#..#...#",
 "#............___cc....N.....#",
 "#...L........___cc..........#",
 "#..#..#..#...___..#..#..#L..#",
 "#.@........2.___...........2#",
 "#############################"],gates:[{id:"mirror",name:"Mirror",color:[255,206,90],bridge:true,duration:5,once:true,plates:[[11,10]],tiles:[[13,10],[14,10],[15,10]]},{id:"return",name:"Return",color:[255,206,90],bridge:true,tiles:[[13,2],[14,2],[15,2]]}],reactions:[{id:"mirror-key",when:"key",open:["return"],spawn:["mirror-spider"],message:"A second bridge rises in the north, and something drops from the ceiling.",objective:"Cross the north bridge and reach the hatch."}],reinforcements:[{id:"mirror-spider",kind:"spider",spawn:[22,4],facing:PI,patrol:[[20,4],[26,5]]}],guards:[{kind:"millipede",spawn:[5,8],facing:PI,patrol:[[5,8]]},{kind:"millipede",spawn:[20,11],facing:PI,patrol:[[20,11]]},{kind:"millipede",spawn:[23,2],facing:PI,patrol:[[23,2]]},{kind:"cricket",spawn:[8,10],facing:PI,patrol:[[7,10],[10,8]]},{kind:"spider",spawn:[19,5],facing:0,patrol:[[17,5],[26,8]]},{kind:"toad",spawn:[11,4],facing:PI,patrol:[[11,4]]}]},
{id:"the-hoard",name:"The Hoard",brief:"Four treasure chambers, and every chest is a trap.",hint:"The hatch wants every treasure.",pebbles:2,tongues:1,explore:false,requiredTreasure:10,map:[
 "###############################",
 "#.......3.###########.2.......#",
 "#.L.......###########.........#",
 "#....#......#######......#....#",
 "#...N.....#.#######.#.......L.#",
 "#1........#.L.......#.........#",
 "###########....N....###########",
 "###########..#...#..###########",
 "###########....@....###########",
 "#.........#.......L.#........2#",
 "#.........#.###.###.#.....N...#",
 "#....#......###.###......#....#",
 "#.L.......#####.#####.......L.#",
 "#K......2.###..X..###.........#",
 "###############################"],gates:[{id:"nook",name:"Hoard door",color:[255,206,90],tiles:[[15,10]]}],reactions:[{id:"hoard-nw",when:"treasure",at:[8,1],spawn:["hoard-nw"],message:"The chest wakes something in the hall.",objective:"Take every treasure."},{id:"hoard-ne",when:"treasure",at:[22,1],spawn:["hoard-ne"],message:"Another chest, another den.",objective:"Take every treasure."},{id:"hoard-key",when:"key",open:["nook"],spawn:["hoard-sw"],message:"The hoard door opens beneath the hall.",objective:"Bring all ten treasure to the hatch."}],reinforcements:[{id:"hoard-nw",spawn:[12,6],facing:0,patrol:[[12,6],[18,6],[18,8],[12,8]]},{id:"hoard-ne",kind:"toad",spawn:[28,2],facing:PI,patrol:[[28,2]]},{id:"hoard-sw",kind:"spider",spawn:[3,10],facing:0,patrol:[[2,10],[8,12]]}],guards:[{kind:"scorpion",spawn:[7,2],facing:PI,patrol:[[7,2]]},{kind:"scorpion",spawn:[23,2],facing:0,patrol:[[23,2]]},{kind:"beetle",spawn:[27,11],facing:PI,patrol:[[22,11],[29,11]]},{spawn:[4,10],facing:0,patrol:[[2,10],[8,10],[8,13],[2,13]]},{kind:"mimic",spawn:[24,13],facing:PI,patrol:[[24,13]]},{kind:"mimic",spawn:[6,1],facing:0,patrol:[[6,1]]}]}
  ];
  root.EscapeHidden=routes;
  if(typeof module!=='undefined'&&module.exports)module.exports=routes;
})(typeof globalThis!=='undefined'?globalThis:this);
