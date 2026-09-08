/* v0.00.48
   기존 HTML에 남아 있는 오래된 인라인 스타일보다 마지막에 적용되도록
   v0.00.48 CSS를 DOM 마지막에 동적으로 추가한다.
*/
(function(){
  function apply(){
    if(document.getElementById('ui-v048-runtime')) return;
    var link=document.createElement('link');
    link.id='ui-v048-runtime';
    link.rel='stylesheet';
    link.href='assets/ui-v048.css?v=0.00.48';
    document.head.appendChild(link);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply);
  else apply();
})();
