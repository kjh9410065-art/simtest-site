/* v0.00.57
   심리테스트 결과 이미지가 배포 환경에서 깨질 때 alt 텍스트가 크게 노출되는 문제를 보강한다.
   결과 프로필의 파일명만 사용해 실제 JPG 경로를 다시 만들고, 실패하면 기본 결과 JPG로 대체한다.
   결과 이미지에는 새 이미지 파일을 생성하지 않고 기존 JPG 자산만 사용한다.
*/
(function(){
  const VERSION='0.00.57';
  const RESULT_FALLBACK='assets/result.jpg?v='+VERSION;

  const quickItems=[
    {label:'12띠 운세',image:'assets/fortune/zodiac05.jpg?v='+VERSION,action:'openFortune()'},
    {label:'별자리 운세',image:'assets/fortune/star01.jpg?v='+VERSION,action:'openStars()'},
    {label:'심리 테스트',image:'assets/tests/love-icon.jpg?v='+VERSION,action:'openTests()'},
    {label:'행운 아이템',image:'assets/ui/quick-lucky.svg?v='+VERSION,action:'showLucky()'}
  ];

  /* 생년월일은 새로고침이나 재진입 후 복원하지 않는다. */
  function clearTemporaryPersonalInfo(){
    try{ localStorage.removeItem('fortuneBirthDate'); }catch(error){}
    const input=document.getElementById('birth-date');
    if(input) input.value='';

    const card=document.getElementById('personal-luck-card');
    if(card){
      card.innerHTML=''
        +'<div class="personal-luck-icon">오늘</div>'
        +'<h3>나의 오늘 운세를 확인해보세요</h3>'
        +'<p>생년월일을 입력하면 나에게 맞는 오늘의 운세를 보여드려요.</p>'
        +'<button class="personal-luck-btn" onclick="openBirthModal()">생년월일 입력하고 확인</button>';
    }
  }

  /* 홈 빠른 메뉴는 기존 이미지 자산만 사용한다. */
  function rebuildQuickMenu(){
    const quick=document.querySelector('#home .quick');
    if(!quick) return;
    quick.querySelectorAll('button').forEach(function(button,index){
      const item=quickItems[index];
      if(!item) return;
      button.innerHTML='';
      button.setAttribute('onclick',item.action);
      button.setAttribute('aria-label',item.label);

      const visual=document.createElement('span');
      visual.className='quick-visual';
      visual.style.backgroundImage='url("'+item.image+'")';
      visual.setAttribute('aria-hidden','true');

      const label=document.createElement('span');
      label.className='quick-label';
      label.textContent=item.label;
      button.appendChild(visual);
      button.appendChild(label);
    });
  }

  /* 이전 결과 경로가 남아 있어도 파일명 기준으로 기존 JPG 자산을 사용한다. */
  function getResultJpgPath(src){
    if(!src) return null;
    const clean=String(src).split('?')[0];
    const file=clean.split('/').pop() || '';
    if(!/^[a-z0-9-]+\.jpg$/i.test(file)) return null;
    return 'assets/results/'+file+'?v='+VERSION;
  }

  /* 결과 이미지가 추가되면 잘못된 SVG 경로를 즉시 기존 JPG로 교체한다. */
  function normalizeResultImages(root){
    const scope=root || document;
    scope.querySelectorAll('img[src*="assets/results/"]').forEach(function(img){
      const target=getResultJpgPath(img.getAttribute('src'));
      if(target && img.getAttribute('src')!==target){
        img.alt='';
        img.src=target;
      }
    });
  }

  /* 결과 화면의 대표 이미지는 실패해도 alt 텍스트가 화면을 차지하지 않도록 처리한다. */
  function ensureResultArtwork(){
    const img=document.getElementById('result-art-img');
    if(!img) return;

    img.alt='';
    img.style.display='block';
    img.style.visibility='visible';
    img.style.opacity='1';
    img.style.objectFit='cover';
    img.loading='eager';
    img.decoding='async';

    if(img.dataset.resultFallbackBound!=='1'){
      img.dataset.resultFallbackBound='1';
      img.addEventListener('error',function(){
        /* 기본 JPG까지 실패한 경우에는 깨진 이미지와 alt 문구를 모두 숨긴다. */
        if(this.dataset.resultFallbackUsed==='1'){
          this.style.display='none';
          this.alt='';
          return;
        }
        this.dataset.resultFallbackUsed='1';
        this.alt='';
        this.src=RESULT_FALLBACK;
      });
    }

    const current=img.getAttribute('src');
    const fixed=getResultJpgPath(current);
    if(fixed && current!==fixed) img.src=fixed;
    if(!img.getAttribute('src')) img.src=RESULT_FALLBACK;
  }

  /* 결과가 동적으로 생성되거나 이미지 경로가 바뀌어도 계속 점검한다. */
  function watchDynamicResultImages(){
    if(!document.body || window.__resultJpgObserver) return;
    const observer=new MutationObserver(function(records){
      records.forEach(function(record){
        if(record.type==='attributes' && record.attributeName==='src'){
          const target=record.target;
          if(target && target.matches && target.matches('img[src*="assets/results/"]')){
            const fixed=getResultJpgPath(target.getAttribute('src'));
            if(fixed && target.getAttribute('src')!==fixed){
              target.alt='';
              target.src=fixed;
            }
          }
          if(target && target.id==='result-art-img') ensureResultArtwork();
        }
        record.addedNodes.forEach(function(node){
          if(node.nodeType===1){
            normalizeResultImages(node);
            if(node.id==='result' || (node.querySelector && node.querySelector('#result-art-img'))){
              ensureResultArtwork();
            }
          }
        });
      });
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
    window.__resultJpgObserver=observer;
    normalizeResultImages(document);
    ensureResultArtwork();
  }

  /* 최신 결과 화면 보정 CSS를 불러온다. */
  function loadFinalCss(){
    if(document.getElementById('ui-v052-final-link')) return;
    const link=document.createElement('link');
    link.id='ui-v052-final-link';
    link.rel='stylesheet';
    link.href='assets/ui-v052.css?v='+VERSION;
    document.head.appendChild(link);
  }

  function apply(){
    loadFinalCss();
    clearTemporaryPersonalInfo();
    rebuildQuickMenu();
    watchDynamicResultImages();
    ensureResultArtwork();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply);
  else apply();

  window.addEventListener('pageshow',function(){
    clearTemporaryPersonalInfo();
    rebuildQuickMenu();
    watchDynamicResultImages();
    ensureResultArtwork();
  });

  window.addEventListener('beforeunload',function(){
    try{localStorage.removeItem('fortuneBirthDate');}catch(error){}
  });
})();