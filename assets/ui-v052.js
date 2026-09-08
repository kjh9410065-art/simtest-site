/* v0.00.65
   결과 이미지 경로를 실제 JPG로 고정하고,
   모바일, 폴드, 플립, 가로모드, PC에서 화면이 깨지지 않도록 보정한다.
   이모지와 장식용 문자에 의존하지 않는 UI를 유지한다.
*/
(function(){
  const VERSION='0.00.65';
  const RESULT_FALLBACK='assets/result.jpg?v='+VERSION;

  /* 결과 유형에 연결된 실제 JPG만 허용한다. */
  function stableResultImagePath(src){
    if(!src) return null;
    const clean=src.split('?')[0];
    const match=clean.match(/assets\/results\/([a-z]+)-(1|2|3|4)\.(?:svg|jpg)$/i);
    if(!match) return null;
    return 'assets/results/'+match[1]+'-'+match[2]+'.jpg?v='+VERSION;
  }

  /* 결과 화면에서 잘못된 이미지가 들어오면 안전한 JPG로 교체한다. */
  function ensureResultArtwork(){
    const img=document.getElementById('result-art-img');
    if(!img) return;

    const current=img.getAttribute('src')||'';
    const stable=stableResultImagePath(current);

    if(stable){
      if(current.split('?')[0]!==stable.split('?')[0]){
        img.style.visibility='hidden';
        img.src=stable;
      }
    }else if(current.split('?')[0].indexOf('assets/results/')===0){
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

  /* 결과 화면은 테스트 완료 후 동적으로 만들어지므로 DOM 변화를 감시한다. */
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

  /* 브라우저에 남아 있을 수 있는 테스트용 개인 정보를 제거한다. */
  function clearTemporaryPersonalInfo(){
    try{ localStorage.removeItem('fortuneBirthDate'); }catch(error){}
    const input=document.getElementById('birth-date');
    if(input) input.value='';
  }

  /* 이전 패치에서 들어온 잘못된 문자만 텍스트에서 제거한다. */
  function cleanLegacyDecorations(){
    const replacements=[
      ['🌙',''],
      ['→',''],
      ['←',''],
      ['➡',''],
      ['➜',''],
      ['➤','']
    ];
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];
    let node;
    while((node=walker.nextNode())) nodes.push(node);
    nodes.forEach(function(textNode){
      let value=textNode.nodeValue;
      replacements.forEach(function(pair){ value=value.split(pair[0]).join(pair[1]); });
      if(value!==textNode.nodeValue) textNode.nodeValue=value;
    });

    /* 아이콘처럼 쓰이던 단일 문자 닫기 버튼은 의미 있는 텍스트로 바꾼다. */
    document.querySelectorAll('.birth-close').forEach(function(button){
      if(button.textContent.trim()==='×') button.textContent='닫기';
    });
    document.querySelectorAll('.search-head button').forEach(function(button){
      if(button.textContent.trim()==='×') button.textContent='닫기';
    });
  }

  /* 빠른 메뉴는 실제 이미지 파일만 사용한다. */
  function normalizeQuickMenu(){
    const quick=document.querySelector('.quick');
    if(!quick) return;

    const items=quick.querySelectorAll('.ico');
    const imageMap=[
      'assets/fortune/zodiac05.jpg',
      'assets/fortune/star01.jpg',
      'assets/ui/quick-heart.svg',
      'assets/ui/quick-lucky.svg'
    ];

    items.forEach(function(icon,index){
      if(!imageMap[index]) return;
      icon.classList.add('quick-image-fixed');
      icon.style.backgroundImage="url('"+imageMap[index]+"')";
      icon.style.backgroundSize='cover';
      icon.style.backgroundPosition='center';
      icon.style.backgroundRepeat='no-repeat';
      icon.textContent='';
      while(icon.firstChild) icon.removeChild(icon.firstChild);
    });
  }

  /* 모든 화면 크기에서 가로 넘침과 결과 레이아웃 붕괴를 방지한다. */
  function installResponsivePatch(){
    if(document.getElementById('ui-v065-responsive')) return;
    const style=document.createElement('style');
    style.id='ui-v065-responsive';
    style.textContent='\
      html,body{width:100%;max-width:100%;overflow-x:hidden}\
      .app{width:100%;max-width:720px;min-height:100dvh}\
      img{max-width:100%}\
      button,input{font:inherit}\
      .quick-image-fixed{font-size:0!important;background-color:#171553!important;border:1px solid rgba(255,255,255,.22)!important}\
      .quick-image-fixed:before,.quick-image-fixed:after{content:none!important;display:none!important}\
      .quick-image-fixed>*{display:none!important}\
      .result{max-width:100%;overflow:hidden}\
      .result-art{width:100%;max-width:100%;height:auto;aspect-ratio:16/10;min-height:220px}\
      .result-art img{width:100%;height:100%;display:block;object-fit:cover}\
      .result-section{max-width:100%;overflow-wrap:anywhere}\
      .test-grid,.luck,.zodiac{width:100%}\
      @media (max-width:699px){\
        .app{max-width:none;border-radius:0}\
        .top{height:58px}\
        .brand{font-size:16px}\
        .hero{min-height:460px}\
        .hero-content{min-height:460px}\
        .quick{grid-template-columns:1fr 1fr}\
        .quick button{min-width:0}\
        .quick span:last-child{min-width:0}\
        .test-grid{grid-template-columns:1fr 1fr}\
        .result{padding:14px 12px 28px}\
      }\
      @media (max-width:390px){\
        .hero{min-height:430px}\
        .hero-content{min-height:430px;padding:22px 16px 22px}\
        .hero h1{font-size:28px}\
        .hero p{font-size:14px}\
        .quick{gap:8px;padding:9px}\
        .quick button{min-height:88px;padding:10px;gap:9px}\
        .quick .ico{width:48px;height:48px;flex-basis:48px;border-radius:14px}\
        .quick span:last-child{font-size:14px}\
        .test-grid{grid-template-columns:1fr}\
        .art{height:180px}\
        .list-card{grid-template-columns:112px 1fr}\
        .list-body h2{font-size:15px}\
        .result-art{aspect-ratio:4/3}\
        .result h1{font-size:25px}\
      }\
      @media (min-width:700px){\
        body{padding:18px 12px}\
        .app{border-radius:26px;box-shadow:0 20px 70px rgba(0,0,0,.5)}\
        .quick{grid-template-columns:repeat(4,1fr)}\
        .quick button{min-height:118px;flex-direction:column;justify-content:center;align-items:flex-start}\
        .quick .ico{width:58px;height:58px;flex-basis:58px}\
        .test-grid{grid-template-columns:repeat(3,1fr)}\
        .result{padding:24px}\
        .result-art{max-width:680px;margin:0 auto}\
      }\
      @media (min-width:700px) and (orientation:landscape){\
        .app{max-width:980px}\
        .hero{min-height:440px}\
        .hero-content{min-height:440px;max-width:720px}\
        .quick{grid-template-columns:repeat(4,1fr)}\
        .test-grid{grid-template-columns:repeat(3,1fr)}\
        .result{display:grid;grid-template-columns:minmax(280px,420px) minmax(0,1fr);gap:18px;align-items:start}\
        .result-art{grid-column:1;grid-row:1 / span 2;width:100%;max-width:none;margin:0;aspect-ratio:1/1}\
        .result h1,.result .tagrow{grid-column:2}\
        .result-section,.result-actions{grid-column:2}\
      }\
      @media (max-height:560px) and (orientation:landscape){\
        .hero{min-height:390px}\
        .hero-content{min-height:390px;padding-top:18px}\
        .hero-character{height:330px}\
        .bottom{height:64px}\
      }\
      @media (min-width:1200px){\
        .app{max-width:1100px}\
        .test-grid{grid-template-columns:repeat(4,1fr)}\
      }\
    ';
    document.head.appendChild(style);
  }

  function removeStrayTextNodes(){
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];
    let node;
    while((node=walker.nextNode())) nodes.push(node);
    nodes.forEach(function(textNode){
      const value=textNode.nodeValue;
      if(value && /^\\n+$/.test(value.trim())) textNode.remove();
    });
  }

  function apply(){
    installResponsivePatch();
    cleanLegacyDecorations();
    normalizeQuickMenu();
    removeStrayTextNodes();
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
