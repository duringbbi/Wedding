(()=>{
const SUPABASE_URL='https://smijqljrxhafvizonqui.supabase.co';
const SUPABASE_KEY='sb_publishable_RLdYeKWJz2HixpCThdqVTg_TtSmH4H9';
const PUBLIC_URL='https://duringbbi.github.io/Wedding/';
const selectedSlug=new URLSearchParams(location.search).get('w');

function addScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)})}

async function loadEditor(slug){
  const safe=/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)?slug:'taehyung-chaeyeon';
  const openLink=document.querySelector('#app>.top .actions a');
  if(openLink)openLink.href=PUBLIC_URL+'?w='+encodeURIComponent(safe);
  const actions=document.querySelector('#app>.top .actions');
  if(actions&&!document.getElementById('backToDashboard')){
    const a=document.createElement('a');a.id='backToDashboard';a.className='btn ghost';a.href='./';a.textContent='청첩장 목록';a.style.textDecoration='none';a.style.color='inherit';actions.prepend(a);
  }
  const frame=document.getElementById('previewFrame');if(frame)frame.src=PUBLIC_URL+'?w='+encodeURIComponent(safe);
  let src=await fetch('./app.js?v=2',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('편집기 코드를 불러오지 못했습니다.');return r.text()});
  src=src.replace("const sb=supabase.createClient", "var sb=window.sb=supabase.createClient");
  src=src.replace("const SLUG='taehyung-chaeyeon',BUCKET=", `const SLUG=${JSON.stringify(safe)},BUCKET=`);
  src=src.replace("let w=null,u=null,owner=false,items=[]", "var w=window.w=null,u=null,owner=window.owner=false,items=[]");
  src=src.replace("if(r.error)throw r.error;w=r.data}", "if(r.error)throw r.error;w=window.w=r.data}");
  src=src.replace("function setLock(){owner=!!u&&u.id===w.admin_user_id;", "function setLock(){owner=window.owner=!!u&&u.id===w.admin_user_id;");
  src=src.replace("function refreshPreview(){$('previewFrame').src=PUBLIC+'?t='+Date.now()}", "function refreshPreview(){$('previewFrame').src=PUBLIC+'?w='+encodeURIComponent(SLUG)+'&t='+Date.now()}");
  src+='\nwindow.refreshPreview=refreshPreview;';
  new Function(src)();
  await addScript('./effect-settings.js?v=4');
  await addScript('./bgm-settings.js?v=2');
}

function styleDashboard(){const s=document.createElement('style');s.textContent=`
.dashboardWrap{max-width:1180px;margin:0 auto;padding:28px 18px 70px}.dashboardHead{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:24px}.dashboardHead h1{margin:0 0 6px}.dashboardActions{display:flex;gap:8px;flex-wrap:wrap}.dashStats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:22px}.dashStat{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px}.dashStat small{display:block;color:var(--muted);font-size:12px}.dashStat strong{display:block;font-size:24px;margin-top:6px}.dashTools{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px}.weddingCards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.weddingCard{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px}.weddingCard.archived{opacity:.72;background:#fafafa}.cardTop{display:flex;justify-content:space-between;gap:12px}.couple{font-size:20px;font-weight:800}.slug{font-size:12px;color:var(--muted);margin-top:5px;word-break:break-all}.statusPill{height:max-content;padding:6px 9px;border-radius:999px;font-size:11px;font-weight:800;background:#eee}.statusPill.live{background:#e9f7ef;color:#227044}.statusPill.draft{background:#f5f0ea;color:#725840}.statusPill.archive{background:#eee;color:#666}.weddingMeta{margin:14px 0;color:#5f5751;font-size:13px;line-height:1.7}.miniStats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.miniStats div{background:#f8f5f2;border-radius:12px;padding:10px;text-align:center}.miniStats small{display:block;color:var(--muted);font-size:11px}.miniStats b{display:block;margin-top:3px}.cardActions{display:flex;gap:7px;flex-wrap:wrap}.dashEmpty{background:#fff;border:1px dashed var(--line);border-radius:18px;padding:42px 20px;text-align:center;color:var(--muted)}.dashOverlay{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.38);display:flex;align-items:center;justify-content:center;padding:18px}.dashModal{width:min(560px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.25)}.dashModal h2{margin-top:0}.dashModalGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.dashModal .wide{grid-column:1/-1}.dashModalActions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.dashHelp{font-size:12px;color:var(--muted);margin-top:5px}.hiddenDash{display:none!important}@media(max-width:760px){.dashboardHead{display:block}.dashboardActions{margin-top:14px}.dashStats{grid-template-columns:repeat(2,1fr)}.weddingCards{grid-template-columns:1fr}.dashModalGrid{grid-template-columns:1fr}.dashModal .wide{grid-column:auto}}
`;document.head.appendChild(s)}

async function initDashboard(){
  styleDashboard();
  document.getElementById('app')?.classList.add('hidden');
  const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const login=document.getElementById('login'),form=document.getElementById('loginForm'),status=document.getElementById('loginStatus');
  async function getUser(){return (await sb.auth.getUser()).data.user}
  let user=await getUser();
  if(!user){login.classList.remove('hidden');form.onsubmit=async e=>{e.preventDefault();const f=new FormData(form),r=await sb.auth.signInWithPassword({email:String(f.get('email')),password:String(f.get('password'))});status.textContent=r.error?r.error.message:'';if(!r.error){user=await getUser();login.classList.add('hidden');renderShell()}};return}
  login.classList.add('hidden');renderShell();

  function renderShell(){
    document.getElementById('dashboardApp')?.remove();
    const root=document.createElement('div');root.id='dashboardApp';root.className='dashboardWrap';root.innerHTML=`<div class="dashboardHead"><div><h1>청첩장 관리</h1><div class="note">여러 커플의 청첩장을 한 곳에서 생성하고 관리합니다. · ${escapeHtml(user.email||'')}</div></div><div class="dashboardActions"><button id="dashNew" class="btn primary">+ 새 청첩장</button><button id="dashRefresh" class="btn ghost">새로고침</button><button id="dashLogout" class="btn ghost">로그아웃</button></div></div><div id="dashStats" class="dashStats"></div><div class="dashTools"><b>청첩장 목록</b><label class="note"><input id="showArchived" type="checkbox"> 보관된 청첩장 보기</label></div><div id="weddingCards" class="weddingCards"><div class="dashEmpty">불러오는 중...</div></div>`;document.body.appendChild(root);
    document.getElementById('dashNew').onclick=()=>openForm();
    document.getElementById('dashRefresh').onclick=loadAll;
    document.getElementById('dashLogout').onclick=async()=>{await sb.auth.signOut();location.reload()};
    document.getElementById('showArchived').onchange=renderCards;
    loadAll();
  }

  let weddings=[],rsvp=[],guests=[],gallery=[];
  async function loadAll(){
    const wr=await sb.from('wedding').select('*').eq('admin_user_id',user.id).order('created_at',{ascending:false});
    if(wr.error){document.getElementById('weddingCards').innerHTML=`<div class="dashEmpty">${escapeHtml(wr.error.message)}</div>`;return}
    weddings=wr.data||[];const ids=weddings.map(x=>x.id);
    if(ids.length){
      const [rr,gr,garr]=await Promise.all([
        sb.from('rsvp').select('wedding_id,attendance,guest_count').in('wedding_id',ids),
        sb.from('guestbook').select('wedding_id,is_hidden').in('wedding_id',ids),
        sb.from('wedding_gallery').select('wedding_id').in('wedding_id',ids)
      ]);rsvp=rr.data||[];guests=gr.data||[];gallery=garr.data||[];
    }else{rsvp=[];guests=[];gallery=[]}
    renderStats();renderCards();
  }
  function renderStats(){const active=weddings.filter(x=>!x.archived_at),live=active.filter(x=>x.is_published),responses=rsvp.length;document.getElementById('dashStats').innerHTML=`<div class="dashStat"><small>전체 청첩장</small><strong>${weddings.length}</strong></div><div class="dashStat"><small>운영 중</small><strong>${active.length}</strong></div><div class="dashStat"><small>공개 중</small><strong>${live.length}</strong></div><div class="dashStat"><small>전체 RSVP</small><strong>${responses}</strong></div>`}
  function renderCards(){const showArchived=document.getElementById('showArchived')?.checked,rows=weddings.filter(x=>showArchived||!x.archived_at),box=document.getElementById('weddingCards');if(!box)return;if(!rows.length){box.innerHTML='<div class="dashEmpty">아직 청첩장이 없습니다.<br>새 청첩장을 만들어 시작하세요.</div>';return}box.innerHTML=rows.map(x=>{const rs=rsvp.filter(v=>v.wedding_id===x.id),yes=rs.filter(v=>v.attendance==='참석').reduce((n,v)=>n+Number(v.guest_count||0),0),gs=guests.filter(v=>v.wedding_id===x.id&&!v.is_hidden).length,photos=gallery.filter(v=>v.wedding_id===x.id).length,arch=!!x.archived_at,statusText=arch?'보관됨':x.is_published?'공개':'작성중',statusClass=arch?'archive':x.is_published?'live':'draft';return `<article class="weddingCard ${arch?'archived':''}" data-id="${x.id}"><div class="cardTop"><div><div class="couple">${escapeHtml(x.groom_name)} ♥ ${escapeHtml(x.bride_name)}</div><div class="slug">?w=${escapeHtml(x.slug)}</div></div><span class="statusPill ${statusClass}">${statusText}</span></div><div class="weddingMeta">${escapeHtml(x.wedding_date)} · ${escapeHtml(String(x.wedding_time||'').slice(0,5))}<br>${escapeHtml(x.venue_name||'')}</div><div class="miniStats"><div><small>RSVP</small><b>${rs.length}</b></div><div><small>참석 인원</small><b>${yes}</b></div><div><small>사진 / 방명록</small><b>${photos} / ${gs}</b></div></div><div class="cardActions"><a class="btn primary" href="./?w=${encodeURIComponent(x.slug)}" style="text-decoration:none;color:inherit">편집</a><a class="btn ghost" href="${PUBLIC_URL}?w=${encodeURIComponent(x.slug)}" target="_blank" style="text-decoration:none;color:inherit">미리보기</a><button class="btn ghost" data-copy="${x.slug}">링크 복사</button>${arch?`<button class="btn ghost" data-restore="${x.id}">복원</button>`:`<button class="btn ghost" data-publish="${x.id}">${x.is_published?'비공개':'공개'}</button><button class="btn ghost" data-duplicate="${x.id}">복제</button><button class="btn danger" data-archive="${x.id}">보관</button>`}</div></article>`}).join('');
    box.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copyUrl(b.dataset.copy));
    box.querySelectorAll('[data-publish]').forEach(b=>b.onclick=()=>togglePublish(b.dataset.publish));
    box.querySelectorAll('[data-archive]').forEach(b=>b.onclick=()=>archiveWedding(b.dataset.archive));
    box.querySelectorAll('[data-restore]').forEach(b=>b.onclick=()=>restoreWedding(b.dataset.restore));
    box.querySelectorAll('[data-duplicate]').forEach(b=>b.onclick=()=>openForm(weddings.find(x=>x.id===b.dataset.duplicate)));
  }
  async function copyUrl(slug){const url=PUBLIC_URL+'?w='+encodeURIComponent(slug);try{await navigator.clipboard.writeText(url);alert('청첩장 링크를 복사했습니다.')}catch{prompt('아래 주소를 복사해 주세요.',url)}}
  async function togglePublish(id){const x=weddings.find(v=>v.id===id);if(!x||x.archived_at)return;const r=await sb.from('wedding').update({is_published:!x.is_published,updated_at:new Date().toISOString()}).eq('id',id);if(r.error)return alert(r.error.message);await loadAll()}
  async function archiveWedding(id){if(!confirm('이 청첩장을 보관할까요? 하객에게는 즉시 비공개됩니다.'))return;const r=await sb.from('wedding').update({archived_at:new Date().toISOString(),is_published:false,updated_at:new Date().toISOString()}).eq('id',id);if(r.error)return alert(r.error.message);await loadAll()}
  async function restoreWedding(id){const r=await sb.from('wedding').update({archived_at:null,updated_at:new Date().toISOString()}).eq('id',id);if(r.error)return alert(r.error.message);await loadAll()}

  function openForm(source=null){
    const old=document.getElementById('dashOverlay');if(old)old.remove();const o=document.createElement('div');o.id='dashOverlay';o.className='dashOverlay';o.innerHTML=`<form id="weddingCreateForm" class="dashModal"><h2>${source?'청첩장 복제':'새 청첩장 만들기'}</h2><div class="note" style="margin-bottom:16px">${source?'기존 디자인 설정을 바탕으로 새 청첩장을 만듭니다. 사진·연락처·계좌·응답 데이터는 복사하지 않습니다.':'기본 정보만 입력하면 비공개 상태로 생성됩니다.'}</div><div class="dashModalGrid"><div class="field"><label>신랑 이름</label><input name="groom" required value="${escapeAttr(source?.groom_name||'')}"></div><div class="field"><label>신부 이름</label><input name="bride" required value="${escapeAttr(source?.bride_name||'')}"></div><div class="field wide"><label>청첩장 주소 ID</label><input name="slug" required placeholder="minsu-jiyoon" pattern="[a-z0-9]+(?:-[a-z0-9]+)*"><div class="dashHelp">영문 소문자·숫자·하이픈만 사용 · 예: minsu-jiyoon</div></div><div class="field"><label>예식 날짜</label><input name="date" type="date" required value="${escapeAttr(source?.wedding_date||'')}"></div><div class="field"><label>예식 시간</label><input name="time" type="time" required value="${escapeAttr(String(source?.wedding_time||'14:00').slice(0,5))}"></div><div class="field wide"><label>예식장</label><input name="venue" required value="${escapeAttr(source?.venue_name||'')}"></div></div><div id="createStatus" class="status"></div><div class="dashModalActions"><button id="cancelCreate" class="btn ghost" type="button">취소</button><button class="btn primary" type="submit">${source?'복제하기':'생성하기'}</button></div></form>`;document.body.appendChild(o);document.getElementById('cancelCreate').onclick=()=>o.remove();o.onclick=e=>{if(e.target===o)o.remove()};document.getElementById('weddingCreateForm').onsubmit=e=>createWedding(e,source,o)}
  async function createWedding(e,source,overlay){e.preventDefault();const st=document.getElementById('createStatus'),f=new FormData(e.currentTarget),slug=String(f.get('slug')).trim().toLowerCase();if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)){st.textContent='주소 ID 형식을 확인해 주세요.';return}const groom=String(f.get('groom')).trim(),bride=String(f.get('bride')).trim(),date=String(f.get('date')),time=String(f.get('time')),venue=String(f.get('venue')).trim();let payload={slug,groom_name:groom,bride_name:bride,wedding_date:date,wedding_time:time,venue_name:venue,admin_user_id:user.id,is_published:false,share_title:`${groom} ♥ ${bride} 결혼합니다`,share_description:`${date} ${venue}`,use_cover_as_share_image:true};if(source)Object.assign(payload,{venue_address:source.venue_address,venue_phone:source.venue_phone,greeting:source.greeting,subway_info:source.subway_info,bus_info:source.bus_info,parking_info:source.parking_info,hero_effect_enabled:source.hero_effect_enabled,hero_effect_top_px:source.hero_effect_top_px,hero_effect_left_pct:source.hero_effect_left_pct,hero_effect_width_pct:source.hero_effect_width_pct,hero_effect_duration_s:source.hero_effect_duration_s,bgm_enabled:false,bgm_autoplay:source.bgm_autoplay,bgm_loop:source.bgm_loop,bgm_volume:source.bgm_volume,bgm_url:null,bgm_path:null,cover_image_url:null,cover_image_path:null,share_image_url:null,groom_phone:null,bride_phone:null,groom_bank:null,groom_account:null,groom_account_name:null,bride_bank:null,bride_account:null,bride_account_name:null,groom_father_name:null,groom_father_phone:null,groom_mother_name:null,groom_mother_phone:null,bride_father_name:null,bride_father_phone:null,bride_mother_name:null,bride_mother_phone:null});st.textContent='생성 중...';const r=await sb.from('wedding').insert(payload).select('slug').single();if(r.error){st.textContent=r.error.code==='23505'?'이미 사용 중인 주소 ID입니다. 다른 값을 입력해 주세요.':r.error.message;return}overlay.remove();await loadAll();location.href='./?w='+encodeURIComponent(r.data.slug)}
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function escapeAttr(v){return escapeHtml(v)}
}

if(selectedSlug)loadEditor(selectedSlug).catch(e=>{console.error(e);const s=document.getElementById('loginStatus');if(s)s.textContent=e.message});else initDashboard().catch(e=>{console.error(e);const s=document.getElementById('loginStatus');if(s)s.textContent=e.message});
})();