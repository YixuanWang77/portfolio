// Local research only. Never copy .local or source-materials into the site.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const sources = {
  'digital-decay': 'Digital-Decay/Yixuan Wang_Digital Decay.pdf',
  'google-news': 'Google-News/Google News_作品集.pdf',
  archflow: 'ArchFlow/ArchFlow.pdf',
  sdg: 'SDG/SDG A3 Mainproject.pdf',
};
function literal(s) {
  const bytes = [];
  for (let i=0;i<s.length;i++) {
    if(s[i] !== '\\') { bytes.push(s.charCodeAt(i)); continue; }
    const c=s[++i];
    if(/[0-7]/.test(c)) { let oct=c; while(oct.length<3 && /[0-7]/.test(s[i+1]||'x')) oct+=s[++i]; bytes.push(parseInt(oct,8)); }
    else bytes.push(({n:10,r:13,t:9,b:8,f:12})[c] ?? c.charCodeAt(0));
  }
  const b=Buffer.from(bytes);
  if(b[0]===254 && b[1]===255) { let out=''; for(let i=2;i<b.length;i+=2)out+=String.fromCharCode(b.readUInt16BE(i));return out; }
  return b.toString('latin1').replace(/\x90/g,'’').replace(/\x93|\x94/g,'“');
}
for(const [slug,file] of Object.entries(sources)) {
 const dir=path.join('.local/materials',slug);fs.mkdirSync(dir,{recursive:true});
 const b=fs.readFileSync(path.join('source-materials',file)), s=b.toString('latin1');
 const objects=[...s.matchAll(/(?:^|\n)(\d+) \d+ obj\b([\s\S]*?)endobj/g)];
 const texts=[...s.matchAll(/\/ActualText\s*\(((?:\\[\s\S]|[^\\)])*)\)/g)].map(m=>literal(m[1]));
 fs.writeFileSync(path.join(dir,'text.txt'),texts.join('\n\n'));
 const images=[];
 for(const m of objects){
  const obj=m[2],head=obj.split('stream')[0];
  if(!/\/Subtype\s*\/Image/.test(head))continue;
  const w=+(head.match(/\/Width\s+(\d+)/)||[])[1],h=+(head.match(/\/Height\s+(\d+)/)||[])[1];
  if(w<300||h<180||/\/DeviceGray/.test(head))continue;
  const start=obj.indexOf('stream')+6;
  const offset=start+(obj[start]==='\r'?2:1);
  let data=Buffer.from(obj.slice(offset,obj.lastIndexOf('endstream')).replace(/[\r\n]+$/,''),'latin1');
  let ext;
  if(/DCTDecode/.test(head))ext='jpg';
  else if(/FlateDecode/.test(head)) { try {data=zlib.inflateSync(data);if(data.length===w*h*3){data=Buffer.concat([Buffer.from(`P6\n${w} ${h}\n255\n`),data]);ext='ppm';}}catch{} }
  if(!ext)continue;
  const name=`image-${m[1]}.${ext}`;fs.writeFileSync(path.join(dir,name),data);
  images.push({name,width:w,height:h});
 }
 fs.writeFileSync(path.join(dir,'images.json'),JSON.stringify(images,null,2));
 console.log(slug, 'paragraphs:',texts.length,'images:',images.length,'pages:',objects.filter(m=>/\/Type\s*\/Page\b/.test(m[2].split('stream')[0])).length);
}
