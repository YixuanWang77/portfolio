import fs from 'node:fs';
export function jpegSize(file){
 const b=fs.readFileSync(file);let offset=2;
 while(offset<b.length){
  if(b[offset]!==255){offset++;continue;}
  const marker=b[offset+1];offset+=2;
  if([0xc0,0xc1,0xc2].includes(marker))return {width:b.readUInt16BE(offset+5),height:b.readUInt16BE(offset+3)};
  if(marker===0xd9||marker===0xda)break;
  const size=b.readUInt16BE(offset);if(size<2)break;offset+=size;
 }
 throw new Error(`Unsupported JPEG: ${file}`);
}
