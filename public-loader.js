(()=>{
const DEFAULT_SLUG='taehyung-chaeyeon';
const params=new URLSearchParams(location.search);
const requested=params.get('w');
const slug=requested&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requested)?requested:DEFAULT_SLUG;
const base='https://duringbbi.github.io/Wedding/';
const shareUrl=slug===DEFAULT_SLUG&&!requested?base:base+'?w='+encodeURIComponent(slug);
function addScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)})}
(async()=>{
  let src=await fetch('./app.js?v=4',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('청첩장 코드를 불러오지 못했습니다.');return r.text()});
  src=src.replace("const SHARE_URL='https://duringbbi.github.io/Wedding/';",`const SHARE_URL=${JSON.stringify(shareUrl)};`);
  src=src.replace("const SLUG='taehyung-chaeyeon';",`const SLUG=${JSON.stringify(slug)};`);
  src=src.replace("const sb=supabase.createClient", "var sb=window.sb=supabase.createClient");
  src=src.replace("let w=null,gallery=[]", "var w=window.w=null,gallery=[]");
  src=src.replace("if(wr.error)throw wr.error;w=wr.data;", "if(wr.error)throw wr.error;w=window.w=wr.data;");
  src+='\nwindow.toast=toast;';
  new Function(src)();
  await addScript('./hero-settings.js?v=3');
  await addScript('./interaction-enhancements.js?v=2');
  await addScript('./bgm.js?v=4');
})().catch(e=>{console.error(e);const loading=document.getElementById('loading');if(loading)loading.textContent='청첩장을 불러오지 못했습니다.'});
})();