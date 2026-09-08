/* v0.00.53
   결과 화면에서 삭제된 이전 SVG 일러스트가 잠깐 나타나지 않도록
   기존 결과 이미지 경로를 안정적인 JPG 자산으로 즉시 교체한다.
   생년월일 입력값도 새로고침 후 남지 않도록 초기화한다.
*/
(function(){
  const quickItems=[
    {label:'12띠 운세',image:'assets/fortune/zodiac05.jpg?v=0.00.53',action:'openFortune()'},
    {label:'별자리 운세',image:'assets/fortune/star01.jpg?v=0.00.53',action:'openStars()'},
    {label:'심리 테스트',image:'assets/tests/love-icon.jpg?v=0.00.53',action:'openTests()'},
    {label:'행운 아이템',image:'assets/ui/quick-lucky.svg?v=0.00.53',action:'showLucky()'}
  ];

  /* 생년월일과 개인 운세 결과는 브라우저 저장소에 남기지 않는다. */
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

  /* 홈 빠른 메뉴는 기존 이미지 자산만 사용하고 내부 중복 구조를 제거한다. */
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

  /* 삭제된 SVG 결과 이미지를 대응하는 기존 JPG로 바꾼다. */
  function stableResultImagePath(src){
    if(!src || src.indexOf('assets/results/')===-1) return null;
    const clean=src.split('?')[0];
    const file=clean.split('/').pop();
    if(!/\.svg$/i.test(file)) return null;

    /* love-1.svg -> love-1.jpg 같은 1:1 대응을 사용한다. */
    const base=file.replace(/\.svg$/i,'');
    return 'assets/results/'+base+'.jpg?v=0.00.53';
  }

  function normalizeResultImages(root){
    const scope=root || document;
    scope.querySelectorAll('img[src*="assets/results/"]').forEach(function(img){
      const target=stableResultImagePath(img.getAttribute('src'));
      if(!target) return;
      img.style.visibility='hidden';
      img.onload=function(){ this.style.visibility='visible'; };
      img.onerror=function(){ this.style.visibility='hidden'; };
      img.src=target;
    });
  }

  /* 결과가 테스트 완료 시 동적으로 생성되므로 src 변경도 감시한다. */
  function watchDynamicResultImages(){
    if(!document.body || window.__resultJpgObserver) return;
    const observer=new MutationObserver(function(records){
      records.forEach(function(record){
        if(record.type==='attributes' && record.attributeName==='src' && record.target.matches && record.target.matches('img[src*="assets/results/"]')){
          const img=record.target;
          const target=stableResultImagePath(img.getAttribute('src'));
          if(target && img.getAttribute('src')!==target){
            img.style.visibility='hidden';
            img.onload=function(){ this.style.visibility='visible'; };
            img.src=target;
          }
        }
        record.addedNodes.forEach(function(node){
          if(node.nodeType===1) normalizeResultImages(node);
        });
      });
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
    window.__resultJpgObserver=observer;
    normalizeResultImages(document);
  }

  function loadFinalCss(){
    if(document.getElementById('ui-v052-final-link')) return;
    const link=document.createElement('link');
    link.id='ui-v052-final-link';
    link.rel='stylesheet';
    link.href='assets/ui-v052.css?v=0.00.53';
    document.head.appendChild(link);
  }

  function apply(){
    loadFinalCss();
    clearTemporaryPersonalInfo();
    rebuildQuickMenu();
    watchDynamicResultImages();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply);
  else apply();

  window.addEventListener('pageshow',function(){
    clearTemporaryPersonalInfo();
    rebuildQuickMenu();
    watchDynamicResultImages();
  });

  window.addEventListener('beforeunload',function(){
    try{localStorage.removeItem('fortuneBirthDate');}catch(error){}
  });
})();
