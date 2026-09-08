/* v0.00.58
   심리테스트 결과 화면에는 새로 만든 전용 일러스트를 직접 사용한다.
   기존 결과 JPG나 삭제된 SVG를 중간 변환하는 방식은 결과 대표 이미지에서 사용하지 않는다.
   이미지가 실패하면 기존 기본 결과 이미지로 대체하고 깨진 alt 텍스트는 표시하지 않는다.
*/
(function(){
  const VERSION='0.00.58';
  const RESULT_ARTWORK='assets/results/result-main.svg?v='+VERSION;
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

  /* 결과 대표 이미지는 항상 새 전용 일러스트를 직접 사용한다. */
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

    if(img.dataset.resultArtworkBound!=='1'){
      img.dataset.resultArtworkBound='1';
      img.addEventListener('error',function(){
        /* 전용 이미지까지 실패하면 기존 기본 이미지를 사용한다. */
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

    /* 테스트 결과를 계산하는 코드가 어떤 기존 이미지를 지정하더라도 전용 이미지로 고정한다. */
    const current=img.getAttribute('src') || '';
    const clean=current.split('?')[0];
    if(clean!==RESULT_ARTWORK.split('?')[0] && img.dataset.resultFallbackUsed!=='1'){
      img.src=RESULT_ARTWORK;
    }else if(!current){
      img.src=RESULT_ARTWORK;
    }
  }

  /* 결과 화면이 동적으로 열리거나 src가 다시 바뀌는 경우에도 전용 이미지로 유지한다. */
  function watchResultArtwork(){
    if(!document.body || window.__resultArtworkObserver) return;
    const observer=new MutationObserver(function(records){
      records.forEach(function(record){
        if(record.type==='attributes' && record.attributeName==='src' && record.target && record.target.id==='result-art-img'){
          ensureResultArtwork();
        }
        record.addedNodes.forEach(function(node){
          if(node.nodeType===1 && (node.id==='result' || (node.querySelector && node.querySelector('#result-art-img')))){
            ensureResultArtwork();
          }
        });
      });
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
    window.__resultArtworkObserver=observer;
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
    watchResultArtwork();
    ensureResultArtwork();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply);
  else apply();

  window.addEventListener('pageshow',function(){
    clearTemporaryPersonalInfo();
    rebuildQuickMenu();
    watchResultArtwork();
    ensureResultArtwork();
  });

  window.addEventListener('beforeunload',function(){
    try{localStorage.removeItem('fortuneBirthDate');}catch(error){}
  });
})();