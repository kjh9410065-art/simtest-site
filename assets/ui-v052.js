/* v0.00.56
   테스트 결과 화면에서 JPG 일러스트가 로드되지 않아 빈 영역으로 보이는 문제를 보강한다.
   결과 이미지는 숨기지 않고 즉시 표시하며, 로드 실패 시 기본 결과 이미지로 안전하게 대체한다.
   생년월일 입력값은 새로고침이나 재진입 후 복원하지 않는다.
*/
(function(){
  const VERSION='0.00.56';
  const RESULT_FALLBACK='assets/result.jpg?v='+VERSION;

  const quickItems=[
    {label:'12띠 운세',image:'assets/fortune/zodiac05.jpg?v='+VERSION,action:'openFortune()'},
    {label:'별자리 운세',image:'assets/fortune/star01.jpg?v='+VERSION,action:'openStars()'},
    {label:'심리 테스트',image:'assets/tests/love-icon.jpg?v='+VERSION,action:'openTests()'},
    {label:'행운 아이템',image:'assets/ui/quick-lucky.svg?v='+VERSION,action:'showLucky()'}
  ];

  /* 생년월일과 개인 운세 결과를 브라우저 저장소에 남기지 않는다. */
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

  /* 홈 빠른 메뉴를 이미지와 텍스트가 겹치지 않는 구조로 다시 만든다. */
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

  /* 과거 소스에 삭제된 SVG 결과 경로가 남아 있더라도 같은 이름의 JPG로 교체한다. */
  function stableResultImagePath(src){
    if(!src || src.indexOf('assets/results/')===-1) return null;
    const clean=src.split('?')[0];
    const file=clean.split('/').pop();
    if(!/\.svg$/i.test(file)) return null;
    const base=file.replace(/\.svg$/i,'');
    return 'assets/results/'+base+'.jpg?v='+VERSION;
  }

  /* 결과 이미지가 동적으로 만들어지는 경우에도 SVG만 JPG로 치환한다. */
  function normalizeResultImages(root){
    const scope=root || document;
    scope.querySelectorAll('img[src*="assets/results/"]').forEach(function(img){
      const target=stableResultImagePath(img.getAttribute('src'));
      if(target) img.src=target;
    });
  }

  /* 결과 이미지가 실제로 표시되는지 확인하고, 실패하면 기본 JPG를 사용한다. */
  function ensureResultArtwork(){
    const img=document.getElementById('result-art-img');
    if(!img) return;

    /* 기존 CSS나 이전 스크립트가 이미지를 숨겨도 결과 화면에서는 반드시 보이게 한다. */
    img.style.display='block';
    img.style.visibility='visible';
    img.style.opacity='1';
    img.loading='eager';
    img.decoding='async';

    /* 실패한 특정 결과 이미지 대신 프로젝트에 항상 존재하는 기본 결과 이미지를 보여준다. */
    if(img.dataset.resultFallbackBound!=='1'){
      img.dataset.resultFallbackBound='1';
      img.addEventListener('error',function(){
        if(this.dataset.resultFallbackUsed==='1') return;
        this.dataset.resultFallbackUsed='1';
        this.src=RESULT_FALLBACK;
      });
    }

    /* 현재 src가 비어 있거나 잘못된 경우에도 기본 이미지를 즉시 지정한다. */
    if(!img.getAttribute('src')) img.src=RESULT_FALLBACK;

    /* 결과 화면이 다시 열릴 때마다 SVG 잔재와 숨김 상태를 다시 점검한다. */
    const fixed=stableResultImagePath(img.getAttribute('src'));
    if(fixed) img.src=fixed;
  }

  /* 테스트 완료 후 결과 이미지 src가 바뀌는 상황을 감시한다. */
  function watchDynamicResultImages(){
    if(!document.body || window.__resultJpgObserver) return;
    const observer=new MutationObserver(function(records){
      records.forEach(function(record){
        if(record.type==='attributes' && record.attributeName==='src'){
          const target=record.target;
          if(target && target.matches && target.matches('img[src*="assets/results/"]')){
            const fixed=stableResultImagePath(target.getAttribute('src'));
            if(fixed && target.getAttribute('src')!==fixed) target.src=fixed;
          }
          if(target && target.id==='result-art-img') ensureResultArtwork();
        }
        record.addedNodes.forEach(function(node){
          if(node.nodeType===1){
            normalizeResultImages(node);
            if(node.id==='result' || (node.querySelector && node.querySelector('#result-art-img'))) ensureResultArtwork();
          }
        });
      });
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
    window.__resultJpgObserver=observer;
    normalizeResultImages(document);
    ensureResultArtwork();
  }

  /* 최신 결과 이미지 표시용 CSS를 강제로 다시 읽게 한다. */
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