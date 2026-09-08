/* v0.00.61
   결과 화면 전용 일러스트를 새 디자인으로 교체했다.
   기존 결과 유형별 이미지는 사용하지 않고 하나의 안정적인 결과 아트워크를 표시한다.
   모든 UI 아이콘은 기존 이미지 자산만 사용하며 이모지 문자는 사용하지 않는다.
*/
(function(){
  const VERSION='0.00.61';
  const RESULT_ARTWORK='assets/results/result-main.svg?v='+VERSION;
  const RESULT_FALLBACK='assets/result.jpg?v='+VERSION;

  const quickItems=[
    {label:'12띠 운세',image:'assets/fortune/zodiac05.jpg?v='+VERSION,action:'openFortune()'},
    {label:'별자리 운세',image:'assets/fortune/star01.jpg?v='+VERSION,action:'openStars()'},
    {label:'심리 테스트',image:'assets/tests/love-icon.jpg?v='+VERSION,action:'openTests()'},
    {label:'행운 아이템',image:'assets/ui/quick-lucky.svg?v='+VERSION,action:'showLucky()'}
  ];

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

  function removeStrayTextNodes(){
    if(!document.body) return;
    Array.from(document.body.childNodes).forEach(function(node){
      if(node.nodeType!==Node.TEXT_NODE) return;
      const value=node.nodeValue||'';
      if(/^\\s*\\n\\s*$/.test(value) || value.trim()==='\\n') node.remove();
    });
  }

  /* 결과 화면에는 새 전용 아트워크만 사용한다. */
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

    const current=img.getAttribute('src') || '';
    const clean=current.split('?')[0];
    const artwork=RESULT_ARTWORK.split('?')[0];
    if(clean!==artwork && img.dataset.resultFallbackUsed!=='1') img.src=RESULT_ARTWORK;
    else if(!current) img.src=RESULT_ARTWORK;
  }

  function watchResultArtwork(){
    if(!document.body || window.__resultArtworkObserver) return;
    const observer=new MutationObserver(function(records){
      records.forEach(function(record){
        if(record.type==='attributes' && record.attributeName==='src' && record.target && record.target.id==='result-art-img') ensureResultArtwork();
        record.addedNodes.forEach(function(node){
          if(node.nodeType===1 && (node.id==='result' || (node.querySelector && node.querySelector('#result-art-img')))) ensureResultArtwork();
        });
      });
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
    window.__resultArtworkObserver=observer;
    ensureResultArtwork();
  }

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
    removeStrayTextNodes();
    watchResultArtwork();
    ensureResultArtwork();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply);
  else apply();

  window.addEventListener('pageshow',function(){
    clearTemporaryPersonalInfo();
    rebuildQuickMenu();
    removeStrayTextNodes();
    watchResultArtwork();
    ensureResultArtwork();
  });

  window.addEventListener('beforeunload',function(){
    try{localStorage.removeItem('fortuneBirthDate');}catch(error){}
  });
})();
