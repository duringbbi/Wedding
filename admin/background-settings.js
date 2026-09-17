(()=>{
const DEFAULT='#fffdf9';
const HEX=/^#[0-9a-f]{6}$/i;
const $=id=>document.getElementById(id);
const normalize=v=>HEX.test(String(v||'').trim())?String(v).trim().toLowerCase():null;

const style=document.createElement('style');
style.textContent=`
.backgroundThemePanel .backgroundPreview{height:92px;border:1px solid var(--line);border-radius:16px;margin:16px 0;display:flex;align-items:center;justify-content:center;font-size:12px;color:#655d57;transition:background .18s ease}.backgroundColorRow{display:grid;grid-template-columns:64px minmax(0,180px) 1fr;gap:10px;align-items:end}.backgroundColorRow input[type=color]{width:64px;height:44px;border:1px solid var(--line);border-radius:10px;background:#fff;padding:4px}.backgroundColorRow input[type=text]{text-transform:uppercase}.backgroundThemeBtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}@media(max-width:560px){.backgroundColorRow{grid-template-columns:64px 1fr}.backgroundColorRow .backgroundHelp{grid-column:1/-1}}
`;
document.head.appendChild(style);

function applyPreview(color){
  const preview=$('backgroundThemePreview');if(preview)preview.style.background=color;
  const frame=$('previewFrame');
  try{
    const doc=frame?.contentDocument;
    if(doc){doc.documentElement.style.setProperty('--wedding-bg',color);const meta=doc.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',color)}
  }catch{}
}
function setColor(color){
  const c=normalize(color)||DEFAULT;
  if($('backgroundColorPicker'))$('backgroundColorPicker').value=c;
  if($('backgroundColorHex'))$('backgroundColorHex').value=c.toUpperCase();
  if($('backgroundThemeStatus'))$('backgroundThemeStatus').textContent='';
  applyPreview(c);
}
function currentColor(){return normalize($('backgroundColorHex')?.value)||null}
function panel(){
  if($('backgroundThemePanel'))return;
  const p=document.createElement('section');p.id='backgroundThemePanel';p.className='panel backgroundThemePanel';
  p.innerHTML=`<h2>청첩장 배경색</h2><div class="note">기본 콘텐츠 영역의 배경색을 변경합니다. 갤러리·RSVP·방명록의 보조 배경색은 가독성을 위해 유지됩니다.</div><div id="backgroundThemePreview" class="backgroundPreview">실시간 배경색 미리보기</div><div class="backgroundColorRow"><div class="field"><label>색상</label><input id="backgroundColorPicker" type="color" value="${DEFAULT}"></div><div class="field"><label>HEX</label><input id="backgroundColorHex" type="text" value="${DEFAULT.toUpperCase()}" maxlength="7" placeholder="#FFFDF9"></div><div class="backgroundHelp guide">예: #FFFDF9 · 6자리 HEX 형식</div></div><div class="backgroundThemeBtns"><button id="backgroundReset" class="btn ghost" type="button">기본색으로 복원</button><button id="backgroundSave" class="btn primary" type="button">배경색 저장</button></div><div id="backgroundThemeStatus" class="status"></div>`;
  const effect=document.querySelector('.heroEffectPanel');
  const mainImage=document.querySelector('.panel .imagebox')?.closest('.panel');
  if(effect)effect.before(p);else if(mainImage)mainImage.before(p);else document.getElementById('app')?.appendChild(p);
}
function fill(){
  if(!window.w)return false;
  setColor(window.w.background_color||DEFAULT);
  return true;
}
async function save(){
  const status=$('backgroundThemeStatus');
  const color=currentColor();
  if(!color){status.textContent='HEX 색상은 #FFFFFF 형식으로 입력해 주세요.';return}
  if(window.owner!==true||!window.w||!window.sb){status.textContent='수정 권한을 확인할 수 없습니다.';return}
  status.textContent='저장 중...';
  const payload={background_color:color,updated_at:new Date().toISOString()};
  const r=await window.sb.from('wedding').update(payload).eq('id',window.w.id);
  if(r.error){status.textContent=r.error.message;return}
  Object.assign(window.w,payload);
  status.textContent='저장 완료 · 하객 페이지에 바로 반영됩니다.';
  if(typeof window.refreshPreview==='function')window.refreshPreview();
}
function init(){
  panel();
  $('backgroundColorPicker').addEventListener('input',e=>setColor(e.target.value));
  $('backgroundColorHex').addEventListener('input',e=>{const c=normalize(e.target.value);if(c){$('backgroundColorPicker').value=c;applyPreview(c);$('backgroundThemeStatus').textContent=''}else $('backgroundThemeStatus').textContent='HEX 색상은 #FFFFFF 형식으로 입력해 주세요.'});
  $('backgroundReset').onclick=()=>setColor(DEFAULT);
  $('backgroundSave').onclick=save;
  const frame=$('previewFrame');if(frame)frame.addEventListener('load',()=>{const c=currentColor();if(c)applyPreview(c)});
  let tries=0;const t=setInterval(()=>{if(fill()||++tries>120)clearInterval(t)},100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();