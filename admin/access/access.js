(()=>{
const SUPABASE_URL='https://smijqljrxhafvizonqui.supabase.co';
const SUPABASE_KEY='sb_publishable_RLdYeKWJz2HixpCThdqVTg_TtSmH4H9';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
let user=null,weddings=[],members=[],profiles=[];

$('accessLoginForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);$('accessLoginStatus').textContent='로그인 중...';const r=await sb.auth.signInWithPassword({email:String(f.get('email')).trim(),password:String(f.get('password'))});if(r.error){$('accessLoginStatus').textContent=r.error.message;return}location.reload()};
$('accessLogout').onclick=async()=>{await sb.auth.signOut();location.href='../'};

async function verifyAdmin(){const r=await sb.from('system_admins').select('user_id').eq('user_id',user.id).maybeSingle();if(r.error)throw r.error;return !!r.data}
async function load(){
  const wr=await sb.from('wedding').select('id,slug,groom_name,bride_name,wedding_date,wedding_time,venue_name,is_published,archived_at,admin_user_id').eq('admin_user_id',user.id).order('created_at',{ascending:false});if(wr.error)throw wr.error;weddings=wr.data||[];
  const ids=weddings.map(x=>x.id);
  if(!ids.length){members=[];profiles=[];render();return}
  const mr=await sb.from('wedding_members').select('wedding_id,user_id,role,created_at').in('wedding_id',ids);if(mr.error)throw mr.error;members=mr.data||[];
  const userIds=[...new Set(members.map(x=>x.user_id))];
  if(userIds.length){const pr=await sb.from('user_profiles').select('user_id,email').in('user_id',userIds);if(pr.error)throw pr.error;profiles=pr.data||[]}else profiles=[];
  render()
}
function emailFor(id){return profiles.find(x=>x.user_id===id)?.email||id}
function render(){
  const box=$('accessList');if(!weddings.length){box.innerHTML='<div class="accessEmpty">관리 중인 청첩장이 없습니다.</div>';return}
  box.innerHTML=weddings.map(w=>{const ms=members.filter(x=>x.wedding_id===w.id);return `<section class="accessCard" data-wedding="${w.id}"><h2>${esc(w.groom_name)} ♥ ${esc(w.bride_name)}</h2><div class="accessMeta">${esc(w.wedding_date)} · ${esc(String(w.wedding_time||'').slice(0,5))} · ${w.is_published?'공개':'비공개'}<br>?w=${esc(w.slug)}</div><div class="memberList">${ms.length?ms.map(m=>{const mail=emailFor(m.user_id);return `<div class="memberRow"><div class="memberInfo"><b>${esc(mail)}</b><small>${m.user_id===user.id?'전체관리자 · ':''}${m.role==='owner'?'소유자':'편집자'}</small></div><div class="memberActions"><select data-role-user="${m.user_id}" data-role-wedding="${w.id}" ${m.user_id===user.id?'disabled':''}><option value="owner" ${m.role==='owner'?'selected':''}>소유자</option><option value="editor" ${m.role==='editor'?'selected':''}>편집자</option></select>${m.user_id===user.id?'':`<button class="btn ghost" data-resend-user="${m.user_id}" data-resend-wedding="${w.id}" data-resend-email="${esc(mail)}" data-resend-role="${m.role}">메일 재발송</button><button class="btn danger" data-remove-user="${m.user_id}" data-remove-wedding="${w.id}">연결 해제</button>`}</div></div>`}).join(''):'<div class="note">연결된 고객이 없습니다.</div>'}</div><form class="connectForm" data-connect="${w.id}"><input name="email" type="email" placeholder="초대할 고객 이메일" autocomplete="email" required><select name="role"><option value="owner">소유자</option><option value="editor">편집자</option></select><button class="btn primary" type="submit">초대메일 발송</button></form><div class="status" data-status="${w.id}"></div></section>`}).join('');
  box.querySelectorAll('[data-connect]').forEach(f=>f.onsubmit=e=>invite(e,f.dataset.connect));
  box.querySelectorAll('[data-resend-user]').forEach(b=>b.onclick=()=>resend(b));
  box.querySelectorAll('[data-remove-user]').forEach(b=>b.onclick=()=>remove(b.dataset.removeWedding,b.dataset.removeUser));
  box.querySelectorAll('[data-role-user]').forEach(s=>s.onchange=()=>changeRole(s.dataset.roleWedding,s.dataset.roleUser,s.value));
}
async function functionErrorMessage(error){let msg=error?.message||'초대 메일 발송에 실패했습니다.';try{if(error?.context?.json){const j=await error.context.json();if(j?.error)msg=j.error}}catch{}return msg}
async function sendInvite(weddingId,email,role,status,button){
  status.className='status';status.textContent='초대 메일을 발송하고 있습니다.';if(button){button.disabled=true;button.dataset.oldText=button.textContent;button.textContent='발송 중...'}
  try{
    const {data,error}=await sb.functions.invoke('invite-wedding-customer',{body:{wedding_id:weddingId,email,role}});
    if(error)throw error;if(data?.error)throw new Error(data.error);
    status.className='status '+(data?.email_sent===false?'warn':'success');status.textContent=data?.message||'초대 메일을 발송했습니다.';
    await load();return true
  }catch(error){status.className='status';status.textContent=await functionErrorMessage(error);return false}
  finally{if(button){button.disabled=false;button.textContent=button.dataset.oldText||'초대메일 발송'}}
}
async function invite(e,weddingId){e.preventDefault();const form=e.currentTarget,f=new FormData(form),email=String(f.get('email')).trim().toLowerCase(),role=String(f.get('role')||'owner'),status=document.querySelector(`[data-status="${CSS.escape(weddingId)}"]`),button=form.querySelector('button[type="submit"]');const ok=await sendInvite(weddingId,email,role,status,button);if(ok)form.reset()}
async function resend(button){const weddingId=button.dataset.resendWedding,email=button.dataset.resendEmail,role=button.dataset.resendRole||'owner',status=document.querySelector(`[data-status="${CSS.escape(weddingId)}"]`);await sendInvite(weddingId,email,role,status,button)}
async function remove(weddingId,userId){if(!confirm('이 고객의 청첩장 관리 권한을 해제할까요?'))return;const r=await sb.from('wedding_members').delete().eq('wedding_id',weddingId).eq('user_id',userId);if(r.error)return alert(r.error.message);await load()}
async function changeRole(weddingId,userId,role){const r=await sb.from('wedding_members').update({role}).eq('wedding_id',weddingId).eq('user_id',userId);if(r.error){alert(r.error.message);await load();return}await load()}

async function init(){user=(await sb.auth.getUser()).data.user;if(!user){$('accessLogin').classList.remove('hidden');return}if(!await verifyAdmin()){$('accessLogin').classList.remove('hidden');$('accessLoginStatus').textContent='이 계정은 전체관리자 권한이 없습니다.';await sb.auth.signOut();return}$('accessApp').classList.remove('hidden');$('accessWho').textContent=(user.email||'')+' · 전체관리자';await load()}
init().catch(e=>{console.error(e);$('accessLogin').classList.remove('hidden');$('accessLoginStatus').textContent=e.message||'페이지를 불러오지 못했습니다.'});
})();