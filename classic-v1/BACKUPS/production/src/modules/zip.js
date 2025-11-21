// zip.js - ZIP 생성 유틸 (필요 시 확장)
export async function createZip(files){
  if(typeof JSZip === 'undefined') throw new Error('JSZip not loaded');
  const zip = new JSZip();
  files.forEach(f => zip.file(f.name, f.content));
  const blob = await zip.generateAsync({ type:'blob' });
  return blob;
}
