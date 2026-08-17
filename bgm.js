(()=>{
const D={volume:.4,loop:true,autoplay:true};
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
let currentUrl='';
function ensureUI(){
  if(document.getElementById('weddingBgm'))return;
  const audio=document.createElement('audio');audio.id='weddingBgm';audio.preload='metadata';audio.setAttribute('playsinline','');
  const btn=document.createElement('button');btn.id='bgmToggle';btn.className='bgmToggle hidden';btn.type='button';btn.setAttribute('aria-label','배경음악 재생 또는 정지');btn.innerHTML='<span class="bgmNote">♪</span><span class="bgmState">OFF</span>';
  document.body.append(audio,btn);
}
function sync(){
  const audio=document.getElementById('weddingBgm'),btn=document.getElementById('bgmToggle');if(!audio||!btn)return;
  const playing=!audio.paused&&!audio.ended;
  btn.classList.toggle('isPlaying',playing);btn.querySelector('.bgmState').textContent=playing?'ON':'OFF';btn.setAttribute('aria-pressed',playing?'true':'false');
}
async function play(showMessage=false){
  const audio=document.getElementById('weddingBgm');if(!audio?.src)return false;
  try{await audio.play();sync();return true}catch{sync();if(showMessage&&typeof toast==='function')toast('음악 재생을 위해 버튼을 한 번 더 눌러 주세요.');return false}
}
function apply(){
  ensureUI();if(typeof w==='undefined'||!w)return false;
  const audio=document.getElementById('weddingBgm'),btn=document.getElementById('bgmToggle');
  const enabled=w.bgm_enabled===true;const url=w.bgm_url||'';
  if(!enabled||!url){btn.classList.add('hidden');if(!audio.paused)audio.pause();if(currentUrl){audio.removeAttribute('src');audio.load();currentUrl=''}return true}
  btn.classList.remove('hidden');
  if(currentUrl!==url){currentUrl=url;audio.src=url;audio.load()}
  audio.loop=w.bgm_loop!==false;audio.volume=clamp(Number(w.bgm_volume??D.volume),0,1);
  btn.onclick=()=>audio.paused?play(true):audio.pause();audio.onplay=sync;audio.onpause=sync;audio.onended=sync;sync();
  if(w.bgm_autoplay!==false&&!window.__bgmAutoplayTried){window.__bgmAutoplayTried=true;setTimeout(()=>play(false),350)}
  if(w.bgm_autoplay!==false&&!window.__bgmGestureBound){window.__bgmGestureBound=true;const resume=()=>{if(audio.paused)play(false);['pointerdown','touchstart','keydown'].forEach(ev=>window.removeEventListener(ev,resume));};['pointerdown','touchstart','keydown'].forEach(ev=>window.addEventListener(ev,resume,{once:true}));}
  return true;
}
ensureUI();let tries=0;const timer=setInterval(()=>{if(apply()||++tries>120)clearInterval(timer)},100);
})();