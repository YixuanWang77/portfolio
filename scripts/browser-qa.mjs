import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CDP} from './cdp.mjs';
const origin=process.env.PREVIEW_URL||'http://127.0.0.1:4321/';
const staticOnly=process.argv.includes('--static-only');
const label=process.env.QA_LABEL||'native';
const p=await CDP.page();
fs.mkdirSync('.local/qa',{recursive:true});
const errors=[],failedRequests=[],videoRequests=[];
p.on('Runtime.exceptionThrown',x=>errors.push(x.exceptionDetails.text));
p.on('Log.entryAdded',x=>{if(x.entry.level==='error')errors.push(x.entry.text);});
p.on('Network.loadingFailed',x=>{if(!x.canceled)failedRequests.push(x.errorText);});
p.on('Network.requestWillBeSent',x=>{if(x.request.url.includes('__local-media/'))videoRequests.push(x.request.url);});
await p.send('Page.enable');await p.send('Runtime.enable');await p.send('Log.enable');await p.send('Network.enable');
async function ready(){await p.evaluate(`(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));await document.fonts.ready;})()`);}
async function screenshot(name,width,full=true){const height=await p.evaluate('document.documentElement.scrollHeight');const shot=await p.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:full,clip:{x:0,y:0,width,height:full?height:1000,scale:1}});fs.writeFileSync(`.local/qa/${label}-${name}.png`,Buffer.from(shot.data,'base64'));}
const pages=['index.html','projects/digital-decay/index.html','projects/google-news/index.html','projects/archflow/index.html','projects/sdg/index.html','projects/ai-robotic-arm/index.html','cv/index.html'];
const results=[];
try{
 for(const [width,height] of [[1440,1000],[768,1024],[390,844],[320,740]]){
  await p.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});
  for(const route of pages){
   await p.navigate(origin+route);await ready();
   const metrics=await p.evaluate(`({title:document.title,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),h1:document.querySelectorAll('h1').length,main:document.querySelectorAll('main').length})`);
   assert(metrics.scrollWidth<=width+1,`${route} horizontal overflow at ${width}: ${metrics.scrollWidth}`);
   assert.equal(metrics.broken.length,0,`Broken image: ${route}`);assert.equal(metrics.h1,1);assert.equal(metrics.main,1);
   results.push({route:route||'/',viewport:width,status:'pass'});
   if([1440,390].includes(width)&&['index.html','projects/digital-decay/index.html'].includes(route))await screenshot(`${route==='index.html'?'home':'digital-decay'}-${width}`,width);
  }
 }
 await p.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await p.navigate(origin+'projects/digital-decay/index.html');await ready();
 assert.equal(await p.evaluate(`document.querySelectorAll('video').length`),0,'Media created before click');
 assert.equal(videoRequests.length,0,'Video downloaded before click');
 let playback=null,fallback=null;
 if(!staticOnly){
 await p.click('[data-demo="digital-decay"]');
 await p.evaluate(`(async()=>{const v=document.querySelector('video');if(v.readyState<2)await new Promise((resolve,reject)=>{v.addEventListener('loadeddata',resolve,{once:true});v.addEventListener('error',()=>reject(new Error('Video decode failed')),{once:true});setTimeout(()=>reject(new Error('Video load timeout')),15000)});})()`);
 playback=await p.evaluate(`(()=>{const v=document.querySelector('video');return {readyState:v.readyState,width:v.videoWidth,height:v.videoHeight,paused:v.paused,source:v.currentSrc,duration:v.duration,focused:document.querySelector('dialog').contains(document.activeElement)};})()`);
 assert(playback.readyState>=2&&playback.width>0&&!playback.paused,'Video did not play after click');assert(playback.focused);
 await screenshot('video-dialog',1440,false);
 for(let i=0;i<8;i++){await p.key('Tab');assert(await p.evaluate(`document.querySelector('dialog').contains(document.activeElement)`),'Focus escaped modal');}
 await p.key('Escape');
 await p.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
 assert.equal(await p.evaluate(`document.querySelector('dialog').open`),false);
 assert.equal(await p.evaluate(`document.querySelectorAll('video').length`),0);
 assert.equal(await p.evaluate(`document.activeElement.dataset.demo`),'digital-decay');
 await p.click('[data-zoom]');assert(await p.evaluate(`document.querySelector('dialog').open`));await p.key('Escape');
 await p.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
 assert(await p.evaluate(`document.activeElement.hasAttribute('data-zoom')`));
 // Confirm browser-native H.264/AAC fallback decodes too.
 await p.evaluate(`(async()=>{const v=document.createElement('video');v.muted=true;v.src=${JSON.stringify(origin+'__local-media/digital-decay-web-v1.mp4')};document.body.append(v);await v.play();if(!v.videoWidth)await new Promise(r=>v.addEventListener('loadeddata',r,{once:true}));window.__fallbackVideo={width:v.videoWidth,height:v.videoHeight};v.pause();v.removeAttribute('src');v.load();v.remove();})()`);
 fallback=await p.evaluate('window.__fallbackVideo');assert(fallback.width>0);
 await p.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await p.navigate(origin+'projects/digital-decay/index.html');await ready();await p.click('[data-demo]');
 assert(await p.evaluate(`document.querySelector('video').playsInline`));await p.key('Escape');
 }else{
  assert(await p.evaluate(`[...document.querySelectorAll('[data-demo]')].every(b=>b.hidden&&getComputedStyle(b).display==='none')`),'Unconfigured video button is visible');
  await p.click('[data-zoom]');assert(await p.evaluate(`document.querySelector('dialog').open`));await p.key('Escape');
 }
 await p.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 assert.equal(await p.evaluate(`getComputedStyle(document.documentElement).scrollBehavior`),'auto');
 await p.navigate(origin+'cv/index.html');await ready();
 if(process.argv.includes('--export-cv')){
  const pdf=await p.send('Page.printToPDF',{printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false});
  fs.writeFileSync('site/assets/yixuan-wang-cv.pdf',Buffer.from(pdf.data,'base64'));
 }
 assert.equal(errors.length,0,`Browser errors: ${errors.join('; ')}`);
 assert.equal(failedRequests.length,0,`Failed requests: ${failedRequests.join('; ')}`);
 const report={browser:'Chrome CDP',origin,results,video:staticOnly?{configured:false,buttonsHidden:true}:{webm:playback,mp4:fallback,beforeClickRequests:0,escapeClose:'pass',focusContainment:'pass',focusReturn:'pass',mobileInline:'pass'},reducedMotion:'pass',errors,failedRequests};
 fs.writeFileSync(`.local/qa/${label}-report.json`,JSON.stringify(report,null,2));
 console.log(`${results.length} page/viewport checks passed for ${origin}; media mode: ${staticOnly?'static/unconfigured':'local playback'}; no console errors or failed requests.`);
}finally{p.close();}
