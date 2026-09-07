/* 0.00.38 동작 및 성능 보정
   - 이미지 로딩 최적화
   - 접근성 속성 보정
   - 오래된 장식 기호를 런타임에서도 제거
   - 동적으로 생성되는 카드에도 동일한 이미지 정책 적용
*/
(function(){
  'use strict';

  /* 프로젝트에서 사용하지 않기로 한 장식용 유니코드 기호를 텍스트에서 제거합니다. */
  const blocked=/[\u2190-\u21FF\u2200-\u22FF\u2300-\u23FF\u25A0-\u25FF\u2600-\u27BF\u2900-\u297F\u2B00-\u2BFF\u{1F000}-\u{1FFFF}]/gu;

  function cleanText(root){
    if(!root) return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      if(blocked.test(node.nodeValue||'')) node.nodeValue=(node.nodeValue||'').replace(blocked,'');
      blocked.lastIndex=0;
    });
  }

  /* 첫 화면의 핵심 이미지는 즉시, 나머지는 지연 로딩합니다. */
  function optimizeImages(){
    document.querySelectorAll('img').forEach(img=>{
      img.decoding='async';
      if(img.closest('.hero')){
        img.loading='eager';
        img.fetchPriority='high';
      }else{
        img.loading='lazy';
        img.fetchPriority='low';
      }
      if(!img.alt) img.alt='';
    });
  }

  /* 동적으로 만들어지는 테스트와 운세 카드에도 이미지 정책을 적용합니다. */
  const observer=new MutationObserver(mutations=>{
    let changed=false;
    mutations.forEach(m=>{
      m.addedNodes.forEach(node=>{
        if(node.nodeType===1){
          cleanText(node);
          changed=true;
        }
      });
    });
    if(changed) optimizeImages();
  });

  function markCurrentView(){
    document.querySelectorAll('.view').forEach(view=>{
      const active=view.classList.contains('on');
      view.setAttribute('aria-hidden',active?'false':'true');
    });
  }

  function init(){
    cleanText(document.body);
    optimizeImages();
    markCurrentView();
    observer.observe(document.body,{childList:true,subtree:true});

    /* 카드와 버튼에 키보드 접근을 위한 기본 역할을 보완합니다. */
    document.querySelectorAll('.test-card,.list-card,.z.clickable').forEach(el=>{
      if(!el.hasAttribute('tabindex')) el.setAttribute('tabindex','0');
    });

    /* 이미지 로딩이 끝난 뒤 레이아웃 이동을 줄입니다. */
    document.querySelectorAll('img').forEach(img=>{
      img.addEventListener('load',()=>img.classList.add('is-loaded'),{once:true});
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  /* 페이지 이동 함수가 실행된 뒤에도 현재 화면의 접근성 상태를 갱신합니다. */
  ['goHome','openFortune','openStars','openTests','startTest','showResult'].forEach(name=>{
    const wait=setInterval(()=>{
      if(typeof window[name]==='function'){
        const original=window[name];
        window[name]=function(){
          const result=original.apply(this,arguments);
          requestAnimationFrame(markCurrentView);
          requestAnimationFrame(optimizeImages);
          return result;
        };
        clearInterval(wait);
      }
    },50);
    setTimeout(()=>clearInterval(wait),5000);
  });
})();
