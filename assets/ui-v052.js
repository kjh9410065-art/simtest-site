/* v0.00.52
   메인 홈의 빠른 메뉴를 깨끗한 이미지 카드로 다시 구성하고,
   사용자가 입력한 생년월일이 새로고침 후 남지 않도록 저장 데이터를 제거한다.
*/
(function(){
  /* 빠른 메뉴에 사용할 기존 저장소 이미지만 연결한다. 새 이미지는 생성하지 않는다. */
  const quickItems=[
    {label:'12띠 운세',image:'assets/fortune/zodiac05.jpg?v=0.00.52',action:'openFortune()'},
    {label:'별자리 운세',image:'assets/fortune/star01.jpg?v=0.00.52',action:'openStars()'},
    {label:'심리 테스트',image:'assets/tests/love-icon.jpg?v=0.00.52',action:'openTests()'},
    {label:'행운 아이템',image:'assets/ui/quick-lucky.svg?v=0.00.52',action:'showLucky()'}
  ];

  /* 생년월일은 개인정보성 입력값이므로 브라우저에 남겨두지 않는다. */
  function clearTemporaryPersonalInfo(){
    try{
      localStorage.removeItem('fortuneBirthDate');
    }catch(error){}

    const input=document.getElementById('birth-date');
    if(input) input.value='';
  }

  /* 기존 빠른 메뉴 내부의 중복 텍스트와 오래된 아이콘 구조를 통째로 교체한다. */
  function rebuildQuickMenu(){
    const quick=document.querySelector('#home .quick');
    if(!quick) return;

    const buttons=quick.querySelectorAll('button');
    buttons.forEach(function(button,index){
      const item=quickItems[index];
      if(!item) return;

      /* 기존 onclick을 유지하되 화면에 남아 있던 내부 구조는 제거한다. */
      button.innerHTML='';
      button.setAttribute('onclick',item.action);
      button.setAttribute('aria-label',item.label);

      /* 이미지 영역과 제목 영역을 완전히 분리한다. */
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

  /* v0.00.52 CSS를 기존 패치보다 늦게 연결해 레거시 스타일을 확실히 덮는다. */
  function loadFinalCss(){
    if(document.getElementById('ui-v052-final-link')) return;
    const link=document.createElement('link');
    link.id='ui-v052-final-link';
    link.rel='stylesheet';
    link.href='assets/ui-v052.css?v=0.00.52';
    document.head.appendChild(link);
  }

  function apply(){
    loadFinalCss();
    clearTemporaryPersonalInfo();
    rebuildQuickMenu();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',apply);
  }else{
    apply();
  }

  /* 뒤로가기나 브라우저 복원으로 화면이 되살아나도 입력값을 다시 지운다. */
  window.addEventListener('pageshow',function(){
    clearTemporaryPersonalInfo();
    rebuildQuickMenu();
  });

  /* 새로고침 직전에도 저장된 생년월일을 제거한다. */
  window.addEventListener('beforeunload',function(){
    try{localStorage.removeItem('fortuneBirthDate');}catch(error){}
  });
})();
