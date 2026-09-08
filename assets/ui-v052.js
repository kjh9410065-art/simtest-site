/* v0.00.63
   모든 심리테스트 결과 화면에서 동일한 새 결과 전용 이미지를 사용한다.
*/
(function(){
  const VERSION='0.00.63';
  const RESULT_ARTWORK='assets/results/result-hero.png?v='+VERSION;
  const RESULT_FALLBACK='assets/result.jpg?v='+VERSION;
  function ensureResultArtwork(){const img=document.getElementById('result-art-img');if(!img)return;img.alt='';img.style.display='block';img.style.visibility='visible';img.style.opacity='1';img.style.objectFit='cover';if((img.getAttribute('src')||'').split('?')[0]!==RESULT_ARTWORK.split('?')[0])img.src=RESULT_ARTWORK;if(img.dataset.resultArtworkBound==='1')return;img.dataset.resultArtworkBound='1';img.addEventListener('error',function(){if(this.dataset.resultFallbackUsed==='1'){this.style.display='none';return;}this.dataset.resultFallbackUsed='1';this.src=RESULT_FALLBACK;});}
  function observeResult(){if(!document.body||window.__resultArtworkObserver)return;const observer=new MutationObserver(function(records){records.forEach(function(record){record.addedNodes.forEach(function(node){if(node.nodeType===1)ensureResultArtwork();});if(record.type==='attributes'&&record.target&&record.target.id==='result-art-img')ensureResultArtwork();});});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});window.__resultArtworkObserver=observer;ensureResultArtwork();}
  function apply(){observeResult();ensureResultArtwork();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  window.addEventListener('pageshow',apply);
})();