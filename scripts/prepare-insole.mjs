// Composite the PDF image's original transparency onto the site's neutral field.
// No product details are generated or altered.
import fs from 'node:fs';
import zlib from 'node:zlib';
const s=fs.readFileSync('source-materials/ArchFlow/ArchFlow.pdf').toString('latin1');
function stream(id){const obj=s.match(new RegExp(`(?:^|\\n)${id} 0 obj([\\s\\S]*?)endobj`))[1];const offset=obj.indexOf('stream\n')+7;return zlib.inflateSync(Buffer.from(obj.slice(offset,obj.lastIndexOf('endstream')).replace(/[\r\n]+$/,''),'latin1'));}
const rgb=stream(8),alpha=stream(3),w=802,h=453,bg=[231,232,223];
if(rgb.length!==w*h*3||alpha.length!==w*h)throw new Error('Unexpected source image structure.');
const out=Buffer.alloc(rgb.length);
for(let i=0;i<w*h;i++)for(let c=0;c<3;c++)out[i*3+c]=Math.round((rgb[i*3+c]*alpha[i]+bg[c]*(255-alpha[i]))/255);
fs.writeFileSync('.local/materials/archflow/insole-public.ppm',Buffer.concat([Buffer.from(`P6\n${w} ${h}\n255\n`),out]));
