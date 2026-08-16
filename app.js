const SUPABASE_URL='https://smijqljrxhafvizonqui.supabase.co';
const SUPABASE_KEY='sb_publishable_RLdYeKWJz2HixpCThdqVTg_TtSmH4H9';
const KAKAO_KEY='ff86439aeba2d4f60d8ff3fa249b2911';
const SHARE_URL='https://duringbbi.github.io/Wedding/';
const SLUG='taehyung-chaeyeon';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);
let w=null,gallery=[],guestEntries=[],guestExpanded=false,newGuestId=null;
const esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const digits=v=>String(v||'').replace(/[^0-9+]/g,'');
const dateText=v=>new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date(v+'T00:00:00+09:00'));
const timeText=v=>{const [h,m]=String(v||'').slice(0,5).split(':').map(Number);return `${h<12?'오전':'오후'} ${h%12||12}시${m?` ${m}분`:''}`};
function toast(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),2200)}
async function copyText(text,msg='복사되었습니다.'){try{await navigator.clipboard.writeText(text);toast(msg)}catch{toast('복사하지 못했습니다.')}}
function setLink(id,prefix,value){const el=$(id);if(!value){el.classList.add('hidden');return}el.href=prefix+digits(value)}
async function load(){
  const wr=await sb.from('wedding').select('*').eq('slug',SLUG).single();
  if(wr.error)throw wr.error;w=wr.data;
  const gr=await sb.from('wedding_gallery').select('id,image_url,sort_order').eq('wedding_id',w.id).order('sort_order');
  gallery=gr.data||[];render();await loadGuestbook();
}
function render(){
  document.title=w.share_title||`${w.groom_name} ♥ ${w.bride_name} 결혼합니다`;
  $('coverImage').src=w.cover_image_url||gallery[0]?.image_url||'';
  $('heroGroom').textContent=w.groom_name;$('heroBride').textContent=w.bride_name;
  $('heroMeta').innerHTML=`${dateText(w.wedding_date)} · ${timeText(w.wedding_time)}<br>${esc(w.venue_name)}`;
  $('greetingText').textContent=w.greeting||'';$('coupleTitle').textContent=`${w.groom_name} · ${w.bride_name}`;
  $('groomName').textContent=w.groom_name;$('brideName').textContent=w.bride_name;
  setLink('groomCall','tel:',w.groom_phone);setLink('groomSms','sms:',w.groom_phone);setLink('brideCall','tel:',w.bride_phone);setLink('brideSms','sms:',w.bride_phone);
  renderParents();renderGallery();renderDate();renderLocation();renderAccounts();
}
function renderParents(){
  const rows=[['신랑 아버지',w.groom_father_name,w.groom_father_phone],['신랑 어머니',w.groom_mother_name,w.groom_mother_phone],['신부 아버지',w.bride_father_name,w.bride_father_phone],['신부 어머니',w.bride_mother_name,w.bride_mother_phone]].filter(x=>x[1]);
  $('parentsDetails').classList.toggle('hidden',!rows.length);
  $('parentsWrap').innerHTML=rows.map(([role,name,phone])=>`<div class="detailRow"><span>${esc(role)} ${esc(name)}</span><div class="pills">${phone?`<a href="tel:${digits(phone)}">전화</a><a href="sms:${digits(phone)}">문자</a>`:''}</div></div>`).join('');
}
function renderGallery(){
  const grid=$('galleryGrid'),more=$('galleryMore');let expanded=false;
  const draw=()=>{const items=expanded?gallery:gallery.slice(0,9);grid.innerHTML=items.map((x,i)=>`<button type="button" data-src="${esc(x.image_url)}"><img src="${esc(x.image_url)}" alt="웨딩 사진 ${i+1}" loading="lazy" decoding="async"></button>`).join('');grid.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{$('lightboxImage').src=btn.dataset.src;$('lightbox').classList.add('open')});if(gallery.length>9){more.classList.remove('hidden');more.textContent=expanded?'사진 접기':`사진 더보기 +${gallery.length-9}`}else more.classList.add('hidden')};
  more.onclick=()=>{expanded=!expanded;draw()};draw();
}
function renderDate(){
  const d=new Date(w.wedding_date+'T00:00:00+09:00');$('dateTitle').textContent=dateText(w.wedding_date);$('monthText').textContent=d.toLocaleString('en-US',{month:'long'}).toUpperCase();$('dayText').textContent=String(d.getDate()).padStart(2,'0');$('dateMeta').innerHTML=`${timeText(w.wedding_time)}<br>${esc(w.venue_name)}`;
  const target=new Date(`${w.wedding_date}T${String(w.wedding_time).slice(0,5)}:00+09:00`),days=Math.ceil((target-new Date())/864e5);$('dday').textContent=days>0?`D-${days}`:days===0?'오늘, 저희 결혼합니다 ♥':'함께해 주셔서 감사합니다.';
}
function renderLocation(){
  $('venueName').textContent=w.venue_name;$('venueAddress').textContent=w.venue_address||'';$('subwayText').textContent=w.subway_info||'';$('parkingText').textContent=w.parking_info||'';
  $('mapFrame').src=`https://www.google.com/maps?q=${encodeURIComponent(w.venue_address||w.venue_name)}&output=embed`;
  $('naverMap').href=`https://map.naver.com/p/search/${encodeURIComponent(w.venue_name)}`;$('kakaoMap').href=`https://map.kakao.com/link/search/${encodeURIComponent(w.venue_name)}`;
}
function renderAccounts(){
  const groom=w.groom_account&&w.groom_bank,bride=w.bride_account&&w.bride_bank;$('accountSection').classList.toggle('hidden',!groom&&!bride);
  $('groomAccountRow').classList.toggle('hidden',!groom);$('brideAccountRow').classList.toggle('hidden',!bride);
  if(groom){$('groomAccountText').innerHTML=`<b>${esc(w.groom_account_name||w.groom_name)}</b><br>${esc(w.groom_bank)} ${esc(w.groom_account)}`;$('groomCopy').onclick=()=>copyText(w.groom_account,'계좌번호가 복사되었습니다.')}
  if(bride){$('brideAccountText').innerHTML=`<b>${esc(w.bride_account_name||w.bride_name)}</b><br>${esc(w.bride_bank)} ${esc(w.bride_account)}`;$('brideCopy').onclick=()=>copyText(w.bride_account,'계좌번호가 복사되었습니다.')}
}
async function loadGuestbook(){
  const r=await sb.from('guestbook').select('id,name,message,created_at').eq('wedding_id',w.id).eq('is_hidden',false).order('created_at',{ascending:false}).limit(100);
  guestEntries=r.error?[]:(r.data||[]);guestExpanded=false;drawGuestbook();
}
function drawGuestbook(){
  $('guestCount').textContent=`${guestEntries.length}개의 메시지`;const list=$('guestList'),more=$('guestMore');
  if(!guestEntries.length){list.innerHTML='<div class="guestEmpty">아직 남겨진 방명록이 없습니다.<br>첫 번째 축하 메시지를 남겨주세요.</div>';more.classList.add('hidden');return}
  const shown=guestExpanded?guestEntries:guestEntries.slice(0,6);list.innerHTML=shown.map(x=>`<article class="guestCard ${x.id===newGuestId?'guestCardNew':''}" data-guest-id="${esc(x.id)}"><header><b>${esc(x.name)}${x.id===newGuestId?'<i class="newBadge">방금 등록됨</i>':''}</b><span>${new Date(x.created_at).toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'})}</span></header><p>${esc(x.message)}</p></article>`).join('');
  if(guestEntries.length>6){more.classList.remove('hidden');more.textContent=guestExpanded?'방명록 접기':`방명록 더보기 +${guestEntries.length-6}`}else more.classList.add('hidden');
}
$('guestMore').onclick=()=>{guestExpanded=!guestExpanded;drawGuestbook()};
$('guestForm').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,btn=$('guestSubmit'),status=$('guestStatus'),f=new FormData(form),payload={wedding_id:w.id,name:String(f.get('name')).trim(),message:String(f.get('message')).trim()};btn.disabled=true;btn.textContent='등록 중...';status.className='status';status.textContent='방명록을 등록하고 있습니다.';const r=await sb.from('guestbook').insert(payload).select('id,name,message,created_at').single();btn.disabled=false;btn.textContent='방명록 남기기';if(r.error){status.className='status statusError';status.textContent='등록 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';return}form.reset();newGuestId=r.data.id;guestEntries=[r.data,...guestEntries.filter(x=>x.id!==r.data.id)];guestExpanded=false;drawGuestbook();status.className='status statusSuccess';status.textContent='✓ 방명록이 등록되었습니다. 아래 목록에서 바로 확인할 수 있어요.';requestAnimationFrame(()=>document.querySelector(`[data-guest-id="${CSS.escape(r.data.id)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}));setTimeout(()=>{if(newGuestId===r.data.id){newGuestId=null;drawGuestbook()}},3500)};
function syncRsvp(){const no=$('attendanceSelect').value==='불참',gc=$('rsvpForm').elements.guest_count,meal=$('rsvpForm').elements.meal;$('guestCountField').classList.toggle('disabledField',no);$('mealField').classList.toggle('disabledField',no);gc.disabled=no;meal.disabled=no;if(no)gc.value=1}
$('attendanceSelect').onchange=syncRsvp;syncRsvp();
$('rsvpForm').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,btn=$('rsvpSubmit'),status=$('rsvpStatus'),result=$('rsvpResult'),f=new FormData(form),attendance=String(f.get('attendance')||''),payload={wedding_id:w.id,name:String(f.get('name')).trim(),side:f.get('side'),attendance,guest_count:attendance==='참석'?Number(f.get('guest_count')||1):1,meal:attendance==='참석'?(f.get('meal')||'미정'):null,message:String(f.get('message')||'').trim()||null};btn.disabled=true;btn.textContent='전달 중...';status.className='status';status.textContent='참석 여부를 전달하고 있습니다.';result.classList.add('hidden');const r=await sb.from('rsvp').insert(payload);btn.disabled=false;btn.textContent='참석 여부 전달하기';if(r.error){status.className='status statusError';status.textContent='전달 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';return}const summary=[payload.side,payload.attendance,payload.attendance==='참석'?`${payload.guest_count}명`:null,payload.attendance==='참석'&&payload.meal?`식사 ${payload.meal}`:null].filter(Boolean).join(' · ');$('rsvpResultText').textContent=summary+(payload.message?`\n“${payload.message}”`:'');status.className='status statusSuccess';status.textContent='✓ 정상적으로 전달되었습니다.';result.classList.remove('hidden');result.classList.remove('flash');void result.offsetWidth;result.classList.add('flash');form.reset();syncRsvp();requestAnimationFrame(()=>result.scrollIntoView({behavior:'smooth',block:'center'}))};
$('calendarBtn').onclick=()=>{const s=new Date(`${w.wedding_date}T${String(w.wedding_time).slice(0,5)}:00+09:00`),e=new Date(s.getTime()+72e5),z=x=>x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z'),ics=['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',`DTSTART:${z(s)}`,`DTEND:${z(e)}`,`SUMMARY:${w.groom_name} ♥ ${w.bride_name} 결혼식`,`LOCATION:${w.venue_name} ${w.venue_address||''}`,'END:VEVENT','END:VCALENDAR'].join('\r\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='wedding.ics';a.click()};
function initKakao(){try{if(!window.Kakao)return false;if(!Kakao.isInitialized())Kakao.init(KAKAO_KEY);return Kakao.isInitialized()}catch(e){console.error(e);return false}}
$('kakaoShareBtn').onclick=()=>{if(!initKakao()){toast('카카오 공유 설정을 확인해 주세요.');return}const image=(w.use_cover_as_share_image?w.cover_image_url:(w.share_image_url||w.cover_image_url))||w.cover_image_url;try{Kakao.Share.sendDefault({objectType:'feed',content:{title:w.share_title||`${w.groom_name} ♥ ${w.bride_name} 결혼합니다`,description:w.share_description||`${w.wedding_date} ${w.venue_name}`,imageUrl:image,link:{mobileWebUrl:SHARE_URL,webUrl:SHARE_URL}},buttonTitle:'청첩장 보기'})}catch(e){console.error(e);toast('카카오톡 공유 중 문제가 발생했습니다.')}};
$('copyShareBtn').onclick=()=>copyText(SHARE_URL,'청첩장 링크를 복사했습니다.');
$('lightboxClose').onclick=()=>$('lightbox').classList.remove('open');$('lightbox').onclick=e=>{if(e.target===$('lightbox'))$('lightbox').classList.remove('open')};
load().then(()=>{$('loading').classList.add('hidden');$('app').classList.remove('hidden')}).catch(e=>{$('loading').textContent='청첩장을 불러오지 못했습니다.';console.error(e)});