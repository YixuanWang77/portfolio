(() => {
const siteRoot = new URL('.', document.currentScript.src);
const assetUrl = value => new URL(value, siteRoot).href;
const dialog = document.querySelector('#media-dialog');
const content = document.querySelector('#media-content');
const title = document.querySelector('#media-title');
const media = window.PORTFOLIO_CONFIG?.media || {};
let opener;
function openMedia(trigger, heading) {
  opener = trigger;
  title.textContent = heading;
  content.replaceChildren();
  dialog.showModal();
  document.body.classList.add('modal-open');
  dialog.querySelector('[data-close-dialog]').focus();
}
function releaseMedia() {
  const video = content.querySelector('video');
  if (video) { video.pause(); video.removeAttribute('src'); video.querySelectorAll('source').forEach(s=>s.remove()); video.load(); }
  content.replaceChildren();
  document.body.classList.remove('modal-open');
  opener?.focus({preventScroll:true});
}
document.querySelectorAll('[data-demo]').forEach(button => {
  const settings = media[button.dataset.demo];
  button.hidden = !settings?.sources?.length;
  button.addEventListener('click', () => {
  const config = media[button.dataset.demo];
  if (!config?.sources?.length) return;
  openMedia(button, config.title);
  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'none';
  video.poster = assetUrl(config.poster);
  video.setAttribute('aria-label', config.title);
  for (const {src,type} of config.sources) {
    const source = document.createElement('source'); source.src = assetUrl(src); source.type = type; video.append(source);
  }
  content.append(video);
  const fallback = document.createElement('a');
  fallback.href=assetUrl(config.sources.at(-1).src); fallback.className='text-link'; fallback.textContent='Open video file';
  content.append(fallback);
  video.addEventListener('error',()=>{
    if(content.querySelector('.media-error'))return;
    const message=document.createElement('p');message.className='media-error';message.setAttribute('role','status');
    message.textContent='The video could not play in this browser. Use the video file link or read the demo overview on the case study.';
    content.append(message);
  });
  video.play().catch(()=>{}); // Native controls remain available if a browser blocks play.
  });
});
document.querySelectorAll('[data-zoom]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  const source=link.querySelector('img');
  openMedia(link, 'Project image');
  const img=document.createElement('img');img.src=link.href;img.alt=source.alt;
  const full=document.createElement('a');full.href=link.href;full.target='_blank';full.rel='noopener noreferrer';full.className='text-link';full.textContent='Open full resolution image ↗';
  content.append(img,full);
}));
dialog.querySelector('[data-close-dialog]').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',releaseMedia);
dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
});
document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
})();
