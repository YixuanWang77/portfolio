import assert from 'node:assert/strict';
const origin=process.env.PREVIEW_URL||'http://127.0.0.1:4321/';
const get=route=>fetch(new URL(route,origin));
for(const route of ['', 'projects/digital-decay/','projects/google-news/','projects/archflow/','projects/sdg/','projects/ai-robotic-arm/','cv/']){
 const response=await get(route);assert.equal(response.status,200,route);assert((await response.text()).includes('<main id="main">'));
}
for(const route of ['source-materials/CV/ACG_CV素材收集表.docx','.local/materials/digital-decay/text.txt','%2e%2e%2fsource-materials/CV/','missing-page/','__local-media/not-configured.mp4']){
 const response=await get(route);assert.equal(response.status,404,`Private or missing path exposed: ${route}`);
}
for(const file of ['digital-decay-web-v1.webm','digital-decay-web-v1.mp4']){
 const response=await fetch(new URL('__local-media/'+file,origin),{headers:{Range:'bytes=0-1023'}});
 assert.equal(response.status,206,file);assert.equal(Number(response.headers.get('content-length')),1024);assert.match(response.headers.get('content-range'),/^bytes 0-1023\//);assert.equal((await response.arrayBuffer()).byteLength,1024);
 const head=await fetch(new URL('__local-media/'+file,origin),{method:'HEAD'});assert.equal(head.status,200);assert.equal(head.headers.get('accept-ranges'),'bytes');
 const invalid=await fetch(new URL('__local-media/'+file,origin),{headers:{Range:'bytes=99999999999-'}});assert.equal(invalid.status,416);
}
assert.equal((await fetch(origin,{method:'POST'})).status,405);
console.log('HTTP routes, direct visits, private-path isolation, video range requests and missing files passed.');
