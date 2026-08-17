(()=>{
  const btn=document.getElementById('calendarBtn');
  if(!btn)return;

  function stamp(date){
    const parts=new Intl.DateTimeFormat('en-CA',{
      timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
    }).formatToParts(date).reduce((o,p)=>(o[p.type]=p.value,o),{});
    return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`;
  }

  btn.onclick=()=>{
    if(typeof w==='undefined'||!w)return;
    const time=String(w.wedding_time||'14:00').slice(0,5);
    const start=new Date(`${w.wedding_date}T${time}:00+09:00`);
    const end=new Date(start.getTime()+3*60*60*1000);
    const title=`${w.groom_name} ♥ ${w.bride_name} 결혼식`;
    const location=[w.venue_name,w.venue_address].filter(Boolean).join(' · ');
    const details=[
      `${w.groom_name} ♥ ${w.bride_name} 결혼식`,
      w.venue_name||'',
      w.venue_phone?`예식장 연락처: ${w.venue_phone}`:'',
      `모바일 청첩장: ${typeof SHARE_URL!=='undefined'?SHARE_URL:'https://duringbbi.github.io/Wedding/'}`
    ].filter(Boolean).join('\n');
    const q=new URLSearchParams({
      action:'TEMPLATE',
      text:title,
      dates:`${stamp(start)}/${stamp(end)}`,
      details,
      location,
      ctz:'Asia/Seoul'
    });
    window.location.href=`https://calendar.google.com/calendar/render?${q.toString()}`;
  };
})();