(()=>{
const SUPABASE_URL='https://smijqljrxhafvizonqui.supabase.co';
const SUPABASE_KEY='sb_publishable_RLdYeKWJz2HixpCThdqVTg_TtSmH4H9';
const PUBLIC_URL='https://duringbbi.github.io/Wedding/';
const hashParams=new URLSearchParams(location.hash.replace(/^#/,''));
const arrivedFromInvite=hashParams.get('type')==='invite'||new URLSearchParams(location.search).get('invited')==='1';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const selectedSlug=new URLSearchParams(location.search).get('w');
let user=null,memberships=[],weddings=[];

function setTopNav(visible){const nav=$('manageTopNav');if(nav)nav.classList.toggle('hidden',!visible)}
function setAuthTab(tab){$('loginForm').classList.toggle('hidden',tab!=='login');$('signupForm').classList.toggle('hidden',tab!=='signup');$('showLogin').className='btn '+(tab==='login'?'primary':'ghost');$('showSignup').className='btn '+(tab==='signup'?'primary':'ghost')}
$('showLogin').onclick=()=>setAuthTab('login');$('showSignup').onclick=()=>setAuthTab('signup');
$('loginForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);$('loginStatus').textContent='로그인 중...';const r=await sb.auth.signInWithPassword({email:String(f.get('email')).trim(),password:String(f.get('password'))});if(r.error){$('loginStatus').textContent=r.error.message;return}location.reload()};
$('signupForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),email=String(f.get('email')).trim(),password=String(f.get('password'));$('signupStatus').textContent='가입 중...';const r=await sb.auth.signUp({email,password,options:{emailRedirectTo:'https://duringbbi.github.io/Wedding/manage/'}});if(r.error){$('signupStatus').textContent=r.error.message;return}if(r.data.session){$('signupStatus').textContent='가입되었습니다. 전체관리자가 이 이메일을 청첩장에 연결하면 관리할 수 있습니다.';setTimeout(()=>location.reload(),700)}else $('signupStatus').textContent='가입 확인 메일을 보냈습니다. 이메일 인증 후 로그인해 주세요.'};

function needsPasswordSetup(){return !!(user?.user_metadata?.wedding_id&&user?.user_metadata?.invite_password_set!==true)}
function updateInviteNotice(){const n=$('inviteNotice');if(!n)return;n.classList.toggle('hidden',!needsPasswordSetup())}
function openPasswordSetup(){if(!user)return;$('passwordStatus').textContent='';$('passwordForm').reset();$('passwordOverlay').classList.remove('hidden')}
function closePasswordSetup(){$('passwordOverlay').classList.add('hidden')}
$('managePassword').onclick=openPasswordSetup;$('passwordCancel').onclick=closePasswordSetup;
$('passwordOverlay').onclick=e=>{if(e.target===$('passwordOverlay'))closePasswordSetup()};
$('passwordForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),password=String(f.get('password')||''),confirmPassword=String(f.get('confirm')||''),status=$('passwordStatus'),btn=e.currentTarget.querySelector('button[type="submit"]');if(password.length<8){status.textContent='비밀번호는 8자 이상으로 입력해 주세요.';return}if(password!==confirmPassword){status.textContent='비밀번호가 서로 다릅니다.';return}btn.disabled=true;btn.textContent='저장 중...';status.textContent='';const metadata={...(user?.user_metadata||{}),invite_password_set:true};const r=await sb.auth.updateUser({password,data:metadata});btn.disabled=false;btn.textContent='비밀번호 저장';if(r.error){status.textContent=r.error.message;return}user=r.data.user||user;status.textContent='비밀번호가 설정되었습니다. 다음부터 이메일과 비밀번호로 로그인할 수 있습니다.';updateInviteNotice();setTimeout(closePasswordSetup,900)};

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
  setTopNav(true);$('manageLogin').classList.add('hidden');$('editorHost').innerHTML='';$('manageHome').classList.remove('hidden');$('manageWho').textContent=user.email||'';updateInviteNotice();
  const box=$('manageCards');
  if(!weddings.length){box.innerHTML='<div class="manageEmpty">연결된 청첩장이 없습니다.<br><b>'+(esc(user.email||''))+'</b> 이메일을 전체관리자에게 전달해 주세요.</div>';return}
  box.innerHTML=weddings.map(w=>`<article class="manageCard"><div><span class="manageRole">${roleFor(w.id)==='owner'?'소유자':'편집자'}</span></div><h2>${esc(w.groom_name)} ♥ ${esc(w.bride_name)}</h2><div class="manageMeta">${esc(w.wedding_date)} · ${esc(String(w.wedding_time||'').slice(0,5))}<br>${esc(w.venue_name||'')}<br>${w.is_published?'공개 중':'비공개'}</div><div class="manageBtns"><a class="btn primary" href="./?w=${encodeURIComponent(w.slug)}" style="text-decoration:none;color:inherit">청첩장 관리</a><a class="btn ghost" href="${PUBLIC_URL}?w=${encodeURIComponent(w.slug)}" target="_blank" style="text-decoration:none;color:inherit">청첩장 열기</a></div></article>`).join('')
}
$('manageRefresh').onclick=async()=>{await loadAccess();showHome()};$('manageLogout').onclick=async()=>{await sb.auth.signOut();location.href='./'};

function addScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)})}
async function loadEditor(wedding){
  setTopNav(true);$('manageHome').classList.add('hidden');$('manageLogin').classList.add('hidden');
  if(!document.getElementById('login')){const dummy=document.createElement('div');dummy.id='login';dummy.className='hidden';document.body.appendChild(dummy)}
  const html=await fetch('../admin/index.html?v=4',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('관리 화면을 불러오지 못했습니다.');return r.text()});
  const doc=new DOMParser().parseFromString(html,'text/html'),source=doc.getElementById('app');if(!source)throw Error('관리 화면 구조를 찾지 못했습니다.');
  const host=$('editorHost');host.innerHTML='';const app=source.cloneNode(true);host.appendChild(app);
  app.classList.remove('hidden');
  const title=app.querySelector('.top h1');if(title)title.textContent='내 청첩장 관리';
  const actions=app.querySelector('.top .actions');
  const userManageLink=[...(actions?.querySelectorAll('a')||[])].find(a=>a.textContent.trim()==='사용자 관리');if(userManageLink)userManageLink.remove();
  const openLink=[...(actions?.querySelectorAll('a')||[])].find(a=>a.textContent.trim()==='청첩장 열기');if(openLink)openLink.href=PUBLIC_URL+'?w='+encodeURIComponent(wedding.slug);
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

async function resolveUser(){let u=(await sb.auth.getUser()).data.user;if(!u&&arrivedFromInvite){await new Promise(r=>setTimeout(r,450));u=(await sb.auth.getUser()).data.user}return u}
async function init(){
  user=await resolveUser();
  if(!user){setTopNav(false);$('manageLogin').classList.remove('hidden');$('manageHome').classList.add('hidden');return}
  if(location.hash&&/(?:access_token|refresh_token|type=invite)/.test(location.hash))history.replaceState(null,'',location.pathname+location.search);
  await loadAccess();
  if(selectedSlug){
    const wedding=weddings.find(x=>x.slug===selectedSlug);
    if(!wedding){setTopNav(true);$('manageHome').classList.remove('hidden');$('manageWho').textContent=user.email||'';$('manageCards').innerHTML='<div class="manageEmpty">이 계정으로 관리할 수 없는 청첩장입니다.<br><a class="btn ghost" href="./" style="display:inline-block;margin-top:12px;text-decoration:none;color:inherit">내 청첩장으로 돌아가기</a></div>';if(arrivedFromInvite||needsPasswordSetup())setTimeout(openPasswordSetup,200);return}
    await loadEditor(wedding);if(arrivedFromInvite||needsPasswordSetup())setTimeout(openPasswordSetup,250);return
  }
  showHome();if(arrivedFromInvite||needsPasswordSetup())setTimeout(openPasswordSetup,250)
}
init().catch(e=>{console.error(e);setTopNav(false);$('manageLogin').classList.remove('hidden');$('loginStatus').textContent=e.message||'관리 페이지를 불러오지 못했습니다.'});
})();