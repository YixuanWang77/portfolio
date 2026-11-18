import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
// Optional local preview utility. It serves site/ directly and never builds it.
let base=process.env.PREVIEW_BASE||'/';
if(!base.startsWith('/'))base='/'+base;
if(!base.endsWith('/'))base+='/';
if(!/^\/[\w/-]*$/.test(base))throw new Error('Invalid PREVIEW_BASE');
const config={base,localMedia:!process.argv.includes('--public-only')};
const root=path.resolve('site');
const localFiles=new Map([
 ['digital-decay-web-v1.webm',path.resolve('.local/media/digital-decay-web-v1.webm')],
 ['digital-decay-web-v1.mp4',path.resolve('.local/media/digital-decay-web-v1.mp4')],
]);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.mp4':'video/mp4','.webm':'video/webm','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.vtt':'text/vtt; charset=utf-8'};
const server=http.createServer((req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
  let request=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(request===config.base.slice(0,-1)&&config.base!=='/'){res.writeHead(308,{Location:config.base}).end();return;}
  if(!request.startsWith(config.base)){res.writeHead(404).end('Not found');return;}
  let rel=request.slice(config.base.length);
  if(rel.split('/').some(s=>s.startsWith('.')||s.includes('\\'))||rel.includes('\0')){res.writeHead(404).end('Not found');return;}
  if(rel==='config.js'&&config.localMedia){
   const sources=[...localFiles].filter(([,file])=>fs.existsSync(file)).map(([name])=>({src:'__local-media/'+name,type:name.endsWith('.webm')?'video/webm':'video/mp4'}));
   const settings=fs.readFileSync(path.join(root,'config.js'),'utf8');
   const override=`\n// Local-only override, supplied in memory. The deployable file stays unchanged.\nwindow.PORTFOLIO_CONFIG.media['digital-decay'].sources=${JSON.stringify(sources)};\n`;
   const body=settings+override;
   res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store','Content-Length':Buffer.byteLength(body)});
   res.end(req.method==='HEAD'?undefined:body);return;
  }
  let file;
  if(rel.startsWith('__local-media/')){
   if(!config.localMedia){res.writeHead(404).end();return;}
   file=localFiles.get(rel.slice('__local-media/'.length));
   if(!file||!fs.existsSync(file)){res.writeHead(404).end('Local media not prepared');return;}
  }else{
   file=path.resolve(root,rel);
   if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(404).end();return;}
   if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){
    if(!request.endsWith('/')){res.writeHead(308,{Location:request+'/'}).end();return;}
    file=path.join(file,'index.html');
   }
  }
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){
   res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});if(req.method==='HEAD')res.end();else fs.createReadStream(path.join(root,'404.html')).pipe(res);return;
  }
  const real=fs.realpathSync(file);
  if(!real.startsWith(root+path.sep)&&!Array.from(localFiles.values()).includes(real)){res.writeHead(404).end();return;}
  const size=fs.statSync(real).size;
  const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes','Referrer-Policy':'strict-origin-when-cross-origin'};
  let start=0,end=size-1,status=200;
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}
   if(!match[1])start=Math.max(0,size-Number(match[2]));else {start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),end);}
   if(start>end||start>=size||!Number.isSafeInteger(start)){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(status,headers);
  if(req.method==='HEAD'){res.end();return;}
  fs.createReadStream(real,{start,end}).on('error',()=>res.destroy()).pipe(res);
 }catch{res.writeHead(400).end('Bad request');}
});
const port=Number(process.env.PORT||4321);
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}${config.base}`));
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
