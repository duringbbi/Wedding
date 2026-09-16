(()=>{
const SUPABASE_URL='https://smijqljrxhafvizonqui.supabase.co';
const SUPABASE_KEY='sb_publishable_RLdYeKWJz2HixpCThdqVTg_TtSmH4H9';
const PUBLIC_URL='https://duringbbi.github.io/Wedding/';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const selectedSlug=new URLSearchParams(location.search).get('w');
let user=null,memberships=[],weddings=[];

function setAuthTab(tab){$('loginForm').classList.toggle('hidden',tab!=='login');$('signupForm').classList.toggle('hidden',tab!=='signup');$('showLogin').className='btn '+(tab==='login'?'primary':'ghost');$('showSignup').className='btn '+(tab==='signup'?'primary':'ghost')}
$('showLogin').onclick=()=>setAuthTab('login');$('showSignup').onclick=()=>setAuthTab('signup');
$('loginForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);$('loginStatus').textContent='로그인 중...';const r=await sb.auth.signInWithPassword({email:String(f.get('email')).trim(),password:String(f.get('password'))});if(r.error){$('loginStatus').textContent=r.error.message;return}location.reload()};
$('signupForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),email=String(f.get('email')).trim(),password=String(f.get('password'));$('signupStatus').textContent='가입 중...';const r=await sb.auth.signUp({email,password,options:{emailRedirectTo:'https://duringbbi.github.io/Wedding/manage/'}});if(r.error){$('signupStatus').textContent=r.error.message;return}if(r.data.session){$('signupStatus').textContent='가입되었습니다. 관리자에게 이 이메일을 전달해 청첩장을 연결해 주세요.';setTimeout(()=>location.reload(),700)}else $('signupStatus').textContent='가입 확인 메일을 보냈습니다. 이메일 인증 후 로그인해 주세요.'};

async function loadAccess(){
  const mr=await sb.from('wedding_members').select('wedding_id,role').eq('user_id',user.id);
  if(mr.error)throw mr.error;memberships=mr.data||[];
  const ids=memberships.map(x=>x.wedding_id);
  if(!ids.length){weddings=[];return}
  const wr=await sb.from('wedding').select('*').in('id',ids).order('wedding_date',{ascending:true});
  if(wr.error)throw wr.error;weddings=wr.data||[];
}
function roleFor(id){return memberships.find(x=>x.wedding_id===id)?.role||'editor'}
function showHome(){
  $('manageLogin').classList.add('hidden');$('editorHost').innerHTML='';$('manageHome').classList.remove('hidden');$('manageWho').textContent=user.email||'';
  const box=$('manageCards');
  if(!weddings.length){box.innerHTML='<div class="manageEmpty">연결된 청첩장이 없습니다.<br><b>'+(esc(user.email||''))+'</b> 이메일을 전체관리자에게 전달해 주세요.</div>';return}
  box.innerHTML=weddings.map(w=>`<article class="manageCard"><div><span class="manageRole">${roleFor(w.id)==='owner'?'소유자':'편집자'}</span></div><h2>${esc(w.groom_name)} ♥ ${esc(w.bride_name)}</h2><div class="manageMeta">${esc(w.wedding_date)} · ${esc(String(w.wedding_time||'').slice(0,5))}<br>${esc(w.venue_name||'')}<br>${w.is_published?'공개 중':'비공개'}</div><div class="manageBtns"><a class="btn primary" href="./?w=${encodeURIComponent(w.slug)}" style="text-decoration:none;color:inherit">청첩장 관리</a><a class="btn ghost" href="${PUBLIC_URL}?w=${encodeURIComponent(w.slug)}" target="_blank" style="text-decoration:none;color:inherit">청첩장 열기</a></div></article>`).join('')
}
$('manageRefresh').onclick=async()=>{await loadAccess();showHome()};$('manageLogout').onclick=async()=>{await sb.auth.signOut();location.href='./'};

function addScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)})}
async function loadEditor(wedding){
  $('manageHome').classList.add('hidden');$('manageLogin').classList.add('hidden');
  if(!document.getElementById('login')){const dummy=document.createElement('div');dummy.id='login';dummy.className='hidden';document.body.appendChild(dummy)}
  const html=await fetch('../admin/index.html?v=3',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('관리 화면을 불러오지 못했습니다.');return r.text()});
  const doc=new DOMParser().parseFromString(html,'text/html'),source=doc.getElementById('app');if(!source)throw Error('관리 화면 구조를 찾지 못했습니다.');
  const host=$('editorHost');host.innerHTML='';const app=source.cloneNode(true);host.appendChild(app);
  app.classList.remove('hidden');
  const title=app.querySelector('.top h1');if(title)title.textContent='내 청첩장 관리';
  const actions=app.querySelector('.top .actions');
  const openLink=actions?.querySelector('a');if(openLink)openLink.href=PUBLIC_URL+'?w='+encodeURIComponent(wedding.slug);
  if(actions){const back=document.createElement('a');back.className='btn ghost manageBack';back.href='./';back.textContent='내 청첩장 목록';back.style.textDecoration='none';back.style.color='inherit';actions.prepend(back)}
  const frame=app.querySelector('#previewFrame');if(frame)frame.src=PUBLIC_URL+'?w='+encodeURIComponent(wedding.slug);
  let src=await fetch('../admin/app.js?v=2',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('편집기 코드를 불러오지 못했습니다.');return r.text()});
  src=src.replace("const sb=supabase.createClient", "var sb=window.sb=supabase.createClient");
  src=src.replace("const SLUG='taehyung-chaeyeon',BUCKET=", `const SLUG=${JSON.stringify(wedding.slug)},BUCKET=`);
  src=src.replace("let w=null,u=null,owner=false,items=[]", "var w=window.w=null,u=null,owner=window.owner=false,items=[]");
  src=src.replace("if(r.error)throw r.error;w=r.data}", "if(r.error)throw r.error;w=window.w=r.data}");
  src=src.replace("function setLock(){owner=!!u&&u.id===w.admin_user_id;", "function setLock(){owner=window.owner=true;");
  src=src.replace("function refreshPreview(){$('previewFrame').src=PUBLIC+'?t='+Date.now()}", "function refreshPreview(){$('previewFrame').src=PUBLIC+'?w='+encodeURIComponent(SLUG)+'&t='+Date.now()}");
  src=src.replace("$('who').textContent=u.email+(u.id===w.admin_user_id?' · 관리자 인증 완료':'');", "$('who').textContent=u.email+' · 사용자 관리';");
  src+='\nwindow.refreshPreview=refreshPreview;';
  new Function(src)();
  await addScript('../admin/effect-settings.js?v=4');
  await addScript('../admin/bgm-settings.js?v=2');
}

async function init(){
  user=(await sb.auth.getUser()).data.user;
  if(!user){$('manageLogin').classList.remove('hidden');$('manageHome').classList.add('hidden');return}
  await loadAccess();
  if(selectedSlug){
    const wedding=weddings.find(x=>x.slug===selectedSlug);
    if(!wedding){$('manageHome').classList.remove('hidden');$('manageWho').textContent=user.email||'';$('manageCards').innerHTML='<div class="manageEmpty">이 계정으로 관리할 수 없는 청첩장입니다.<br><a class="btn ghost" href="./" style="display:inline-block;margin-top:12px;text-decoration:none;color:inherit">내 청첩장으로 돌아가기</a></div>';return}
    await loadEditor(wedding);return
  }
  showHome()
}
init().catch(e=>{console.error(e);$('manageLogin').classList.remove('hidden');$('loginStatus').textContent=e.message||'관리 페이지를 불러오지 못했습니다.'});
})();