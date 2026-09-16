(()=>{
const D={volume:.4,loop:true,autoplay:true};
const OFF_KEY='weddingBgmManualOff';
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
let currentUrl='',gestureResume=null;
function getManualOff(){try{return sessionStorage.getItem(OFF_KEY)==='1'}catch{return false}}
function setManualOff(v){try{if(v)sessionStorage.setItem(OFF_KEY,'1');else sessionStorage.removeItem(OFF_KEY)}catch{}}
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
function unbindGestureResume(){
  if(!gestureResume)return;
  ['pointerdown','touchstart','keydown'].forEach(ev=>window.removeEventListener(ev,gestureResume));
  gestureResume=null;window.__bgmGestureBound=false;
}
async function play(showMessage=false){
  const audio=document.getElementById('weddingBgm');if(!audio?.src||getManualOff())return false;
  try{await audio.play();sync();return true}catch{sync();if(showMessage&&typeof toast==='function')toast('음악 재생을 위해 버튼을 한 번 더 눌러 주세요.');return false}
}
function bindGestureResume(){
  const audio=document.getElementById('weddingBgm');
  if(!audio||getManualOff()||window.__bgmGestureBound||typeof w==='undefined'||!w||w.bgm_autoplay===false)return;
  window.__bgmGestureBound=true;
  gestureResume=e=>{
    if(getManualOff()){unbindGestureResume();return}
    if(e?.target?.closest?.('#bgmToggle'))return;
    if(audio.paused)play(false);
    unbindGestureResume();
  };
  ['pointerdown','touchstart','keydown'].forEach(ev=>window.addEventListener(ev,gestureResume));
}
function apply(){
  ensureUI();if(typeof w==='undefined'||!w)return false;
  const audio=document.getElementById('weddingBgm'),btn=document.getElementById('bgmToggle');
  const enabled=w.bgm_enabled===true;const url=w.bgm_url||'';
  if(!enabled||!url){
    btn.classList.add('hidden');
    unbindGestureResume();
    if(!audio.paused)audio.pause();
    if(currentUrl){audio.removeAttribute('src');audio.load();currentUrl=''}
    sync();return true;
  }
  btn.classList.remove('hidden');
  if(currentUrl!==url){currentUrl=url;audio.src=url;audio.load()}
  audio.loop=w.bgm_loop!==false;audio.volume=clamp(Number(w.bgm_volume??D.volume),0,1);
  btn.onclick=async()=>{
    if(audio.paused){
      setManualOff(false);
      const ok=await play(true);
      if(!ok)sync();
    }else{
      setManualOff(true);
      unbindGestureResume();
      audio.pause();
      sync();
    }
  };
  audio.onplay=sync;audio.onpause=sync;audio.onended=sync;sync();
  if(getManualOff()){unbindGestureResume();return true}
  if(w.bgm_autoplay!==false&&!window.__bgmAutoplayTried){window.__bgmAutoplayTried=true;setTimeout(()=>{if(!getManualOff())play(false)},350)}
  if(w.bgm_autoplay!==false)bindGestureResume();
  return true;
}
ensureUI();let tries=0;const timer=setInterval(()=>{if(apply()||++tries>120)clearInterval(timer)},100);
})();