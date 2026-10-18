const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('version.json lists every game file, with names the Android app accepts',()=>{
  execFileSync(process.execPath,[path.join(root,'scripts/prepare-static.cjs')],{env:{...process.env,VERSION:'test-build'}});
  const v=JSON.parse(read('public/version.json'));assert.equal(v.version,'test-build');
  for(const f of ['index.html','escape-engine.js','style.css','vendor/p5.min.js','vendor/Tone.js'])assert.ok(v.files.includes(f),f);
  assert.ok(!v.files.includes('version.json'),'it does not list itself');
  // The same rule as GameFiles.SAFE_NAME in the app: no leading slash, no "..", plain characters only.
  const safe=/^[A-Za-z0-9][A-Za-z0-9._-]*(\/[A-Za-z0-9][A-Za-z0-9._-]*)*$/;
  for(const f of v.files){assert.match(f,safe);assert.ok(!f.includes('..'));assert.ok(fs.statSync(path.join(root,'public',f)).isFile(),f);}
  const java=read('android/app/src/main/java/com/masonrobert/savesally/GameFiles.java');assert.ok(java.includes(safe.source.slice(1,-1).split('\\/').join('/')),'the app checks names with the same rule');
});
test('the Android app is one app for phones and TV, HTTPS only, with no bridge into Android',()=>{
  const manifest=read('android/app/src/main/AndroidManifest.xml'),main=read('android/app/src/main/java/com/masonrobert/savesally/MainActivity.java');
  assert.match(manifest,/category\.LAUNCHER/);assert.match(manifest,/category\.LEANBACK_LAUNCHER/);assert.match(manifest,/android:banner=/);
  assert.match(manifest,/touchscreen" android:required="false"/);assert.match(manifest,/leanback" android:required="false"/);
  assert.match(manifest,/usesCleartextTraffic="false"/);assert.deepEqual(manifest.match(/uses-permission android:name="([^"]+)"/g),['uses-permission android:name="android.permission.INTERNET"']);
  assert.ok(!main.includes('addJavascriptInterface'),'no bridge from the page into Android');assert.match(main,/setAllowFileAccess\(false\)/);
  assert.match(main,/HOST = "savesally\.masonrobert\.com"/);
  for(const d of ['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi'])assert.ok(fs.existsSync(path.join(root,'android/app/src/main/res/mipmap-'+d,'ic_launcher.png')),d);
  assert.ok(fs.existsSync(path.join(root,'android/app/src/main/res/drawable-xhdpi/banner.png')));
});
