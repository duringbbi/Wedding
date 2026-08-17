(()=>{
const STROKES=[
  'M28 5 C22 16 14 30 5 41 C38 40 76 40 110 43 C123 45 136 49 147 53',
  'M147 53 C139 47 132 40 130 32 C127 23 132 16 140 13 C148 10 154 15 154 23 C154 31 148 36 141 36 C135 36 131 32 132 27 C136 31 143 31 151 30 C164 34 178 35 190 32 C202 29 212 24 220 20',
  'M220 20 C218 29 212 43 216 48 C220 53 226 48 232 40 C243 27 254 12 264 5 C258 17 249 29 241 34 C244 38 250 42 258 44 C278 48 300 42 319 33',
  'M319 33 C329 27 342 24 352 19 C361 15 365 9 361 6 C356 2 347 5 339 12 C330 20 322 29 320 37 C317 47 324 54 335 56 C352 59 374 54 395 45'
];
const D={top:-18,left:-6,width:112,duration:3.4};
const n=(v,d)=>Number.isFinite(Number(v))?Number(v):d;
function shape(){
  const svg=document.querySelector('.heroHandwriting svg');
  if(!svg)return false;
  svg.setAttribute('viewBox','0 0 410 100');
  svg.innerHTML=STROKES.map((d,i)=>`<path class="heroInk heroInk${i+1}" pathLength="1" d="${d}"/>`).join('');
  return true;
}
function apply(){
  shape();
  if(typeof w==='undefined'||!w)return false;
  const el=document.querySelector('.heroHandwriting');
  if(!el)return false;
  el.style.display=w.hero_effect_enabled===false?'none':'block';
  el.style.top=n(w.hero_effect_top_px,D.top)+'px';
  el.style.left=n(w.hero_effect_left_pct,D.left)+'%';
  el.style.width=n(w.hero_effect_width_pct,D.width)+'%';
  el.style.setProperty('--hero-duration',n(w.hero_effect_duration_s,D.duration)+'s');
  return true;
}
shape();
let tries=0;
const t=setInterval(()=>{if(apply()||++tries>100)clearInterval(t)},100);
})();