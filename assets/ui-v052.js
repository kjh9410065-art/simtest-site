/* v0.00.64
   심리테스트 결과 이미지는 실제 저장된 JPG만 사용하고,
   생년월일은 새로고침이나 재방문 시 복원되지 않도록 처리한다.
*/
(function(){
  const VERSION='0.00.64';
  const RESULT_FALLBACK='assets/result.jpg?v='+VERSION;

  /* 결과 유형에 연결된 기존 JPG만 허용한다. */
  function stableResultImagePath(src){
    if(!src) return null;
    const clean=src.split('?')[0];
    const match=clean.match(/assets\/results\/([a-z]+)-(1|2|3|4)\.(?:svg|jpg)$/i);
    if(!match) return null;
    return 'assets/results/'+match[1]+'-'+match[2]+'.jpg?v='+VERSION;
  }

  /* 결과 이미지가 존재하지 않는 새 경로로 바뀌어도 화면에서 깨지지 않게 한다. */
  function ensureResultArtwork(){
    const img=document.getElementById('result-art-img');
    if(!img) return;

    const current=img.getAttribute('src')||'';
    const stable=stableResultImagePath(current);

    /* 기존 결과 SVG가 들어오면 같은 이름의 실제 JPG로 즉시 교체한다. */
    if(stable){
      if(current.split('?')[0]!==stable.split('?')[0]){
        img.style.visibility='hidden';
        img.src=stable;
      }
    }else if(current.split('?')[0].indexOf('assets/results/')===0){
      /* 결과 폴더의 알 수 없는 파일은 기본 결과 이미지로 안전하게 대체한다. */
      img.style.visibility='hidden';
      img.src=RESULT_FALLBACK;
    }

    img.alt='테스트 결과 일러스트';
    img.style.display='block';
    img.style.objectFit='cover';

    if(img.dataset.resultArtworkBound==='1') return;
    img.dataset.resultArtworkBound='1';
    img.addEventListener('load',function(){
      this.style.visibility='visible';
      this.style.opacity='1';
    });
    img.addEventListener('error',function(){
      if(this.dataset.resultFallbackUsed==='1'){
        this.style.display='none';
        return;
      }
      this.dataset.resultFallbackUsed='1';
      this.style.visibility='hidden';
      this.src=RESULT_FALLBACK;
    });
  }

  /* 결과 화면은 테스트 완료 후 동적으로 생성되므로 DOM 변화를 감시한다. */
  function observeResult(){
    if(!document.body||window.__resultArtworkObserver) return;
    const observer=new MutationObserver(function(records){
      records.forEach(function(record){
        if(record.type==='attributes' && record.target && record.target.id==='result-art-img'){
          ensureResultArtwork();
        }
        record.addedNodes.forEach(function(node){
          if(node.nodeType===1) ensureResultArtwork();
        });
      });
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
    window.__resultArtworkObserver=observer;
    ensureResultArtwork();
  }

  /* 생년월일은 브라우저 저장소에 남기지 않는다. */
  function clearTemporaryPersonalInfo(){
    try{ localStorage.removeItem('fortuneBirthDate'); }catch(error){}
    const input=document.getElementById('birth-date');
    if(input) input.value='';
  }

  function apply(){
    clearTemporaryPersonalInfo();
    observeResult();
    ensureResultArtwork();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',apply);
  }else{
    apply();
  }

  window.addEventListener('pageshow',apply);
  window.addEventListener('beforeunload',clearTemporaryPersonalInfo);
})();