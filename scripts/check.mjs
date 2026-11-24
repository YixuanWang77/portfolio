// Optional validation only: reads the ready-to-serve site without generating files.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{assert(!entry.isSymbolicLink(),'Site cannot contain symlinks');return entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)];});}
const files=walk('site');
assert(files.every(f=>/\.(html|css|js|jpg|png|svg|pdf|txt|vtt|webp|ttf)$/.test(f)||path.basename(f)==='.nojekyll'),'Unexpected deployable file');
assert(!files.some(f=>/\.(ts|tsx|jsx|mjs|docx|mp4|webm)$/.test(f)),'Non-static source or private media in website');
for(const file of [...files.filter(f=>f.endsWith('.js')),...fs.readdirSync('scripts').filter(f=>f.endsWith('.mjs')).map(f=>'scripts/'+f)]){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});assert.equal(result.status,0,`${file}: ${result.stderr}`);}
const pages=files.filter(f=>f.endsWith('.html'));
const ids=new Map(pages.map(f=>[path.resolve(f),new Set([...fs.readFileSync(f,'utf8').matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]))]));
const textOf=html=>html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const baseline=process.argv.includes('--migration')&&fs.existsSync('.local/native-baseline.json')?JSON.parse(fs.readFileSync('.local/native-baseline.json')):null;
const results=[];
for(const base of ['/','/portfolio-review/']){
 let count=0;
 for(const file of pages){
  const html=fs.readFileSync(file,'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1,file);
  assert(html.includes('<html lang="en">')&&html.includes('name="description"')&&html.includes('og:title'));
  assert(!/<iframe|<embed|<object\b/i.test(html));
  assert(!/source-materials|__local-media|type="module"|media-config/.test(html));
  assert(!/src="[^"]*(?:page-\d+|\.pdf)/i.test(html));
  const pagePath=path.relative('site',file).replaceAll('\\','/');
  if(baseline)assert.equal(textOf(html),baseline[pagePath],`Existing content was lost in migration: ${pagePath}`);
  const sourceUrl='https://static.example'+base+pagePath;
  const resolve=target=>{
   if(/^(https?:|mailto:|data:)/.test(target))return;
   assert(!target.startsWith('/'),`Absolute link breaks portable deployment: ${file}: ${target}`);
   const parsed=new URL(target,sourceUrl);assert(parsed.pathname.startsWith(base),`Link escapes site base: ${target}`);
   let rel=decodeURIComponent(parsed.pathname.slice(base.length));if(!rel||rel.endsWith('/'))rel+='index.html';
   const dest=path.resolve('site',rel);assert(fs.existsSync(dest),`Missing asset/link: ${file}: ${target}`);
   if(parsed.hash&&ids.has(dest))assert(ids.get(dest).has(decodeURIComponent(parsed.hash.slice(1))),`Missing anchor: ${file}: ${target}`);
   count++;
  };
  for(const m of html.matchAll(/<(a|img|script|link)\b[^>]*?\b(href|src)="([^"]+)"[^>]*>/g)){
   resolve(m[3]);
   if(m[1]==='img')assert(/\balt="[^"]+"/.test(m[0])&&/\bwidth="\d+"/.test(m[0])&&/\bheight="\d+"/.test(m[0]),`${file}: image metadata`);
  }
  for(const m of html.matchAll(/\bsrcset="([^"]+)"/g))for(const candidate of m[1].split(','))resolve(candidate.trim().split(/\s+/)[0]);
 }
 results.push({base,pages:pages.length,linksAndImageVariants:count,status:'pass'});
}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync('site/config.js','utf8'),sandbox);
assert.equal(sandbox.window.PORTFOLIO_CONFIG.media['digital-decay'].sources.length,0,'Public default must not point at development-only media');
assert.equal(sandbox.window.PORTFOLIO_CONFIG.media['ai-robotic-arm'],null);
const home=fs.readFileSync('site/index.html','utf8');
const positions=['intro-title','id="background"','id="turn"','id="work"','id="more"','id="contact"'].map(s=>home.indexOf(s));
assert(positions.every((p,i)=>p>=0&&(i===0||p>positions[i-1])),'Homepage order changed');
assert(!fs.readFileSync('site/projects/ai-robotic-arm/index.html','utf8').includes('data-demo='));
assert(!/npm|setup-node|run:|dist/.test(fs.readFileSync('.github/workflows/pages.yml','utf8').replace(/^#.*$/gm,'')),'Deployment should not install or build');
assert.equal(pages.length,8);
console.log(JSON.stringify(results,null,2));
console.log('Native website: syntax, existing content, root/subpath links, image variants, privacy and no-build deployment passed.');
