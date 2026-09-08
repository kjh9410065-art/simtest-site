/* v0.00.47
   오래된 버전에서 남은 문자 조각과 장식용 문자를 화면에서 제거한다.
   또한 행운 아이템 카드의 날짜별 표시를 다시 적용한다.
*/
(function(){
  /* 브라우저가 HTML 바깥의 잘못된 문자 조각을 body 안으로 재배치했을 때 제거한다. */
  function removeLegacyText(){
    const blockedExact=/^\s*(?:0\.00\.38\/>|0\.00\.39\/>|0\.00\.40\/>|0\.00\.41\/>|0\.00\.42\/>|0\.00\.43\/>|0\.00\.44\/>|0\.00\.45\/>|0\.00\.46\/>)\s*$/;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];
    let node;
    while((node=walker.nextNode())) nodes.push(node);
    nodes.forEach(function(textNode){
      if(blockedExact.test(textNode.nodeValue||'')) textNode.remove();
    });
  }

  /* UI에서 금지한 이모지와 장식용 유니코드 기호를 실제 화면 텍스트에서 제거한다. */
  function cleanVisibleSymbols(){
    const blocked=/[\u2190-\u21FF\u2200-\u22FF\u2300-\u23FF\u25A0-\u25FF\u2600-\u27BF\u2900-\u297F\u2B00-\u2BFF\uD800-\uDFFF]/g;
    document.querySelectorAll('body *').forEach(function(el){
      if(el.children.length>0) return;
      if(el.tagName==='SCRIPT'||el.tagName==='STYLE') return;
      if(el.dataset.symbolCleaned==='1') return;
      const value=el.textContent||'';
      if(blocked.test(value)){
        el.textContent=value.replace(blocked,'');
      }
      el.dataset.symbolCleaned='1';
    });
  }

  /* 기존 v0.00.46의 행운 아이템 함수를 다시 실행할 수 있도록 날짜별 데이터를 유지한다. */
  function refreshLucky(){
    if(typeof window.showLucky==='function'){
      const luckyModal=document.getElementById('lucky-modal');
      if(luckyModal && luckyModal.classList.contains('show')) window.showLucky();
    }
  }

  function apply(){
    removeLegacyText();
    cleanVisibleSymbols();
    refreshLucky();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply);
  else apply();
})();
