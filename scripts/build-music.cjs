// Prepare adaptive music stems: verify loops line up, then encode for the web.
//   node scripts/build-music.cjs <pack folder> [--no-encode] [--bpm 90]
// Reads scripts/music-sources.json, checks every stem has the same length
// (sample-exact), reports bars at the given tempo and the size of each loop
// seam, copies the pack's licence, encodes .ogg + .m4a with ffmpeg and writes
// loopSeconds into public/audio/music/manifest.json.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public/audio/music'),manifestPath=path.join(out,'manifest.json');

function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
// Minimal RIFF/WAVE reader: PCM 16/24-bit or 32-bit float.
function readWav(file){
  const b=fs.readFileSync(file);if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WAVE')throw new Error(file+' is not a WAV file');
  let fmt=null,data=null;for(let o=12;o+8<=b.length;){const id=b.toString('ascii',o,o+4),size=b.readUInt32LE(o+4);if(id==='fmt ')fmt={format:b.readUInt16LE(o+8),channels:b.readUInt16LE(o+10),rate:b.readUInt32LE(o+12),bits:b.readUInt16LE(o+22)};if(id==='data')data={offset:o+8,size:Math.min(size,b.length-o-8)};o+=8+size+(size%2);}
  if(!fmt||!data)throw new Error(file+' has no fmt/data chunk');
  const bytes=fmt.bits/8,frames=Math.floor(data.size/(bytes*fmt.channels)),sample=(f,c)=>{const o=data.offset+(f*fmt.channels+c)*bytes;return fmt.format===3?b.readFloatLE(o):fmt.bits===16?b.readInt16LE(o)/32768:fmt.bits===24?(b.readIntLE(o,3))/8388608:b.readInt32LE(o)/2147483648;};
  return {...fmt,frames,seconds:frames/fmt.rate,sample};
}
// The jump between the last and first sample of a loop; large jumps click.
function seam(w){let worst=0;for(let c=0;c<w.channels;c++)worst=Math.max(worst,Math.abs(w.sample(w.frames-1,c)-w.sample(0,c)));return worst;}

function plan(packDir,config){
  const wavs=walk(packDir).filter(f=>/\.wav$/i.test(f)),name=f=>path.basename(f).toLowerCase(),inTrack=wavs.filter(f=>!config.match||name(f).includes(config.match.toLowerCase()));
  const layers={};for(const [layer,pattern] of Object.entries(config.layers)){
    const hits=inTrack.filter(f=>name(f).includes(pattern.toLowerCase()));const pick=hits.find(f=>config.prefer&&name(f).includes(config.prefer))||hits[0];
    if(pick)layers[layer]=pick;
  }
  const licence=walk(packDir).find(f=>/licen[cs]e|readme|terms/i.test(path.basename(f))&&/\.(txt|md|pdf)$/i.test(f))||null;
  return {layers,licence};
}
function verify(layers,{bpm,beatsPerBar=4}={}){
  const info=Object.fromEntries(Object.entries(layers).map(([k,f])=>[k,readWav(f)]));const entries=Object.entries(info);if(!entries.length)throw new Error('No stems matched');
  const frames=entries[0][1].frames,rate=entries[0][1].rate,problems=[];
  for(const [k,w] of entries){if(w.rate!==rate)problems.push(k+' sample rate '+w.rate+' ≠ '+rate);if(w.frames!==frames)problems.push(k+' is '+(w.frames-frames)+' samples off ('+((w.frames-frames)/rate*1000).toFixed(1)+' ms)');}
  const seconds=frames/rate,report={seconds,rate,frames,layers:Object.fromEntries(entries.map(([k,w])=>[k,{frames:w.frames,channels:w.channels,bits:w.bits,seam:+seam(w).toFixed(4)}])),problems};
  if(bpm){const bars=seconds*bpm/60/beatsPerBar;report.bars=+bars.toFixed(3);if(Math.abs(bars-Math.round(bars))>.02)problems.push('loop is '+bars.toFixed(3)+' bars at '+bpm+' BPM, not a whole number');}
  for(const [k,w] of Object.entries(report.layers))if(w.seam>.2)problems.push(k+' loop seam jumps '+w.seam+' (may click)');
  return report;
}
function main(argv){
  const packDir=argv.find(a=>!a.startsWith('--')),encode=!argv.includes('--no-encode'),bpmFlag=argv.indexOf('--bpm');
  if(!packDir)throw new Error('Usage: node scripts/build-music.cjs <pack folder> [--no-encode] [--bpm N]');
  const config=JSON.parse(fs.readFileSync(path.join(__dirname,'music-sources.json'),'utf8'));if(bpmFlag>=0)config.bpm=Number(argv[bpmFlag+1]);
  const {layers,licence}=plan(packDir,config),report=verify(layers,config);
  console.log(JSON.stringify({track:config.track,stems:Object.fromEntries(Object.entries(layers).map(([k,f])=>[k,path.relative(packDir,f)])),licence:licence&&path.relative(packDir,licence),...report},null,2));
  if(report.problems.length){console.error('Loop check failed:\n - '+report.problems.join('\n - '));process.exitCode=1;return;}
  if(!licence){console.error('No licence file found in the pack. Check the licence before shipping the music.');process.exitCode=1;return;}
  const trackDir=path.join(out,config.track);fs.mkdirSync(trackDir,{recursive:true});fs.copyFileSync(licence,path.join(out,'LICENSE-lurking-layers'+(path.extname(licence)||'.txt')));
  if(encode)for(const [layer,file] of Object.entries(layers)){
    execFileSync('ffmpeg',['-y','-v','error','-i',file,'-c:a','libvorbis','-q:a','5',path.join(trackDir,layer+'.ogg')]);
    execFileSync('ffmpeg',['-y','-v','error','-i',file,'-c:a','aac','-b:a','160k',path.join(trackDir,layer+'.m4a')]);
  }
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));manifest.tracks[config.track].loopSeconds=+report.seconds.toFixed(6);if(config.bpm)manifest.tracks[config.track].bpm=config.bpm;
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');console.log('Music ready: '+Object.keys(layers).length+' stems, '+report.seconds.toFixed(3)+'s loop.');
}
if(require.main===module)try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=1;}
module.exports={readWav,verify,plan,seam};
