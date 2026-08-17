(()=>{
  const root=document.documentElement;
  function lockHeroHeight(){
    const h=Math.round(window.visualViewport?.height||window.innerHeight||document.documentElement.clientHeight);
    if(h>0)root.style.setProperty('--hero-lock-h',h+'px');
  }
  lockHeroHeight();
  window.addEventListener('orientationchange',()=>setTimeout(lockHeroHeight,260),{passive:true});

  let currentIndex=-1,touchX=0,touchY=0,touching=false;
  const lb=document.getElementById('lightbox'),img=document.getElementById('lightboxImage');
  if(!lb||!img)return;

  const prev=document.createElement('button');
  prev.type='button';prev.className='lightboxNav lightboxPrev';prev.setAttribute('aria-label','이전 사진');prev.textContent='‹';
  const next=document.createElement('button');
  next.type='button';next.className='lightboxNav lightboxNext';next.setAttribute('aria-label','다음 사진');next.textContent='›';
  const counter=document.createElement('div');counter.className='lightboxCounter';counter.setAttribute('aria-live','polite');
  lb.append(prev,next,counter);

  function allImages(){return Array.isArray(gallery)?gallery:[]}
  function updateNav(){
    const list=allImages();
    prev.disabled=currentIndex<=0;
    next.disabled=currentIndex<0||currentIndex>=list.length-1;
    counter.textContent=currentIndex>=0&&list.length?`${currentIndex+1} / ${list.length}`:'';
    counter.style.display=list.length>1?'block':'none';
    prev.style.display=list.length>1?'grid':'none';
    next.style.display=list.length>1?'grid':'none';
  }
  function showIndex(i,dir=0){
    const list=allImages();
    if(!list.length||i<0||i>=list.length)return;
    currentIndex=i;
    lb.classList.add('lbChanging');
    const target=list[i].image_url;
    const preload=new Image();
    preload.onload=preload.onerror=()=>{
      img.src=target;
      requestAnimationFrame(()=>lb.classList.remove('lbChanging'));
    };
    preload.src=target;
    updateNav();
  }
  function openAt(i){
    showIndex(i);
    lb.classList.add('open');
    document.body.classList.add('lightboxOpen');
  }
  function close(){
    lb.classList.remove('open');
    document.body.classList.remove('lightboxOpen');
    currentIndex=-1;
  }
  function findIndexBySrc(src){return allImages().findIndex(x=>x.image_url===src)}
  function wireGallery(){
    document.querySelectorAll('#galleryGrid button[data-src]').forEach(btn=>{
      if(btn.dataset.swipeReady)return;
      btn.dataset.swipeReady='1';
      btn.addEventListener('click',e=>{
        e.preventDefault();
        e.stopImmediatePropagation();
        const i=findIndexBySrc(btn.dataset.src);
        openAt(i>=0?i:0);
      },true);
    });
  }
  wireGallery();
  const grid=document.getElementById('galleryGrid');
  if(grid)new MutationObserver(wireGallery).observe(grid,{childList:true,subtree:true});

  prev.addEventListener('click',e=>{e.stopPropagation();showIndex(currentIndex-1,-1)});
  next.addEventListener('click',e=>{e.stopPropagation();showIndex(currentIndex+1,1)});
  const closeBtn=document.getElementById('lightboxClose');
  if(closeBtn)closeBtn.addEventListener('click',()=>document.body.classList.remove('lightboxOpen'));
  lb.addEventListener('click',e=>{if(e.target===lb)document.body.classList.remove('lightboxOpen')});

  lb.addEventListener('touchstart',e=>{
    if(e.touches.length!==1)return;
    touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;touching=true;
  },{passive:true});
  lb.addEventListener('touchend',e=>{
    if(!touching||!e.changedTouches.length)return;
    touching=false;
    const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;
    if(Math.abs(dx)<42||Math.abs(dx)<=Math.abs(dy)*1.15)return;
    if(dx<0&&currentIndex<allImages().length-1)showIndex(currentIndex+1,1);
    else if(dx>0&&currentIndex>0)showIndex(currentIndex-1,-1);
  },{passive:true});

  document.addEventListener('keydown',e=>{
    if(!lb.classList.contains('open'))return;
    if(e.key==='ArrowLeft'&&currentIndex>0){e.preventDefault();showIndex(currentIndex-1,-1)}
    else if(e.key==='ArrowRight'&&currentIndex<allImages().length-1){e.preventDefault();showIndex(currentIndex+1,1)}
    else if(e.key==='Escape'){e.preventDefault();close()}
  });
})();