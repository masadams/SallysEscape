const http=require('node:http'),fs=require('node:fs'),path=require('node:path');const {createLevelApi}=require('./levels.cjs');const {createAdminApi}=require('./admin.cjs');const {createPlayDataApi}=require('./playdata.cjs');const {createSolutionApi}=require('./solutions.cjs');
const root=path.resolve(__dirname,'../public'),types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.mp3':'audio/mpeg','.ogg':'audio/ogg','.m4a':'audio/mp4','.wav':'audio/wav','.png':'image/png','.svg':'image/svg+xml'};
// Deadlines so a slow or stalled client cannot hold a connection open: headers in 15 seconds, the
// whole request in 30, and idle keep-alive connections close after 5.
// Static files: an ETag so a returning player's browser revalidates with a tiny 304 instead of
// downloading the game again, and gzip for text (the game's code shrinks by about 70%). Each
// file is compressed once and kept until it changes.
const zlib=require('node:zlib'),gzipped=new Map();
function serveStatic(req,res,file){
  fs.stat(file,(error,stat)=>{if(error||!stat.isFile()){res.writeHead(404);res.end();return;}
    const type=types[path.extname(file)]||'application/octet-stream',etag='"'+stat.size.toString(36)+'-'+Math.floor(stat.mtimeMs).toString(36)+'"';
    const headers={'Content-Type':type,'Cache-Control':file.includes(path.sep+'vendor'+path.sep)?'public, max-age=86400':'no-cache',ETag:etag,Vary:'Accept-Encoding'};
    if(req.headers['if-none-match']===etag){res.writeHead(304,headers);res.end();return;}
    const gzip=/^(text\/|application\/json)/.test(type)&&stat.size>1024&&/\bgzip\b/.test(req.headers['accept-encoding']||'');
    if(!gzip){res.writeHead(200,{...headers,'Content-Length':stat.size});if(req.method==='HEAD'){res.end();return;}const stream=fs.createReadStream(file);stream.on('error',()=>res.destroy());stream.pipe(res);return;}
    const send=body=>{res.writeHead(200,{...headers,'Content-Encoding':'gzip','Content-Length':body.length});res.end(req.method==='HEAD'?undefined:body);};
    const cached=gzipped.get(file);if(cached?.etag===etag){send(cached.body);return;}
    fs.readFile(file,(readError,raw)=>{if(readError){res.writeHead(404);res.end();return;}zlib.gzip(raw,{level:9},(zipError,body)=>{if(zipError){res.writeHead(500);res.end();return;}gzipped.set(file,{etag,body});send(body);});});
  });
}
function createServer(options={}){const admin=createAdminApi(options);const levels=createLevelApi({...options,isAdmin:admin.isAdmin});const playdata=createPlayDataApi({...options,isAdmin:admin.isAdmin});const solutions=createSolutionApi({...options,isAdmin:admin.isAdmin});const server=http.createServer({requestTimeout:30000,headersTimeout:15000,keepAliveTimeout:5000},async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'; object-src 'none'");res.setHeader('Cross-Origin-Opener-Policy','same-origin');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=(), usb=(), publickey-credentials-create=(self), publickey-credentials-get=(self)');
 // Admin sign-in, play data and the community shelf live under /api; everything else is the static game.
 let pathname;try{pathname=new URL(req.url,'http://localhost').pathname;}catch(_){res.writeHead(400);res.end();return;}
 // The recorded winning runs sit under /api/admin but are their own module, so they go first.
 if(await solutions.handle(req,res,pathname))return;
 if(await admin.handle(req,res,pathname))return;
 if(await playdata.handle(req,res,pathname))return;
 if(await levels.handle(req,res,pathname))return;
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
 if(req.url==='/healthz'){res.writeHead(200,{'Content-Type':'application/json'});res.end(req.method==='HEAD'?undefined:'{"ok":true}');return;}
 let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch(_){res.writeHead(400);res.end();return;}
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)){res.writeHead(404);res.end();return;}
 serveStatic(req,res,file);
});server.timeout=0;server.admin=admin;return server;}
if(require.main===module)createServer().listen(Number(process.env.PORT||8080),'0.0.0.0',()=>{console.log("Sally's Escape ready");});
module.exports={createServer};
