/* v0.00.55
   결과 화면의 기존 JPG 일러스트가 항상 최신 표시 스타일을 사용하도록
   CSS 캐시 버전을 갱신하고, 삭제된 SVG 경로가 남아 있을 경우에만 JPG로 교체한다.
   생년월일 입력값은 새로고침이나 재진입 후 복원하지 않는다.
*/
(function(){
  const VERSION='0.00.55';

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

  /* 삭제된 SVG 결과 경로가 소스에 남아 있는 경우에만 같은 이름의 JPG로 바꾼다. */
  function stableResultImagePath(src){
    if(!src || src.indexOf('assets/results/')===-1) return null;
    const clean=src.split('?')[0];
    const file=clean.split('/').pop();
    if(!/\.svg$/i.test(file)) return null;
    const base=file.replace(/\.svg$/i,'');
    return 'assets/results/'+base+'.jpg?v='+VERSION;
  }

  /* 결과 이미지가 동적으로 생성되는 경우에도 삭제된 SVG만 JPG로 치환한다. */
  function normalizeResultImages(root){
    const scope=root || document;
    scope.querySelectorAll('img[src*="assets/results/"]').forEach(function(img){
      const target=stableResultImagePath(img.getAttribute('src'));
      if(!target) return;
      img.src=target;
    });
  }

  /* 테스트 완료 후 결과 영역에 새 이미지가 추가되거나 src가 바뀌는 경우를 감시한다. */
  function watchDynamicResultImages(){
    if(!document.body || window.__resultJpgObserver) return;
    const observer=new MutationObserver(function(records){
      records.forEach(function(record){
        if(record.type==='attributes' && record.attributeName==='src' && record.target.matches && record.target.matches('img[src*="assets/results/"]')){
          const img=record.target;
          const target=stableResultImagePath(img.getAttribute('src'));
          if(target && img.getAttribute('src')!==target) img.src=target;
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
