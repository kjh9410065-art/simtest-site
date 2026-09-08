/* v0.00.50
   기존 index.html에 오래된 스타일이 문서 뒤쪽에 남아 있어도 마지막에 새 CSS가 적용되도록 한다.
   동시에 빠른 메뉴의 실제 이미지 경로를 직접 보정한다.
*/
(function(){
  /* 빠른 메뉴 네 개의 실제 이미지 파일을 직접 연결한다. */
  function applyQuickImages(){
    const quick=document.querySelector('#home .quick');
    if(!quick) return;

    const sources=[
      'assets/fortune/zodiac05.jpg?v=0.00.50',
      'assets/fortune/star01.jpg?v=0.00.50',
      'assets/tests_nonhuman/love-art.jpg?v=0.00.50',
      'assets/ui/quick-lucky.svg?v=0.00.50'
    ];

    quick.querySelectorAll('button').forEach(function(button,index){
      const source=sources[index];
      if(!source) return;

      /* .ico가 있는 기존 카드 구조를 실제 이미지 배경으로 교체한다. */
      const ico=button.querySelector('.ico');
      if(ico){
        ico.textContent='';
        ico.style.backgroundImage='url("'+source+'")';
        ico.style.backgroundSize='cover';
        ico.style.backgroundPosition='center';
        ico.style.backgroundRepeat='no-repeat';
      }

      /* .ico 밖에 남아 있는 기존 img도 실제 파일로 교체한다. */
      button.querySelectorAll('img').forEach(function(img){
        img.src=source;
        img.alt='';
        img.style.display='block';
        img.style.width='100%';
        img.style.height='100%';
        img.style.objectFit='cover';
      });
    });
  }

  /* 오래된 CSS보다 마지막에 적용되도록 CSS 링크를 문서의 가장 뒤에 추가한다. */
  function applyFinalCss(){
    if(document.getElementById('ui-v050-final-link')) return;

    const link=document.createElement('link');
    link.id='ui-v050-final-link';
    link.rel='stylesheet';
    link.href='assets/ui-v050.css?v=0.00.50-final';

    /* body 끝에 붙여 문서 뒤쪽에 남아 있는 레거시 스타일보다 우선 적용되게 한다. */
    (document.body || document.documentElement).appendChild(link);
  }

  /* 페이지가 완전히 로드된 뒤 한 번 더 적용해 이미지와 CSS를 확실히 보정한다. */
  function apply(){
    applyFinalCss();
    applyQuickImages();
    setTimeout(applyQuickImages,100);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',apply);
  }else{
    apply();
  }

  window.addEventListener('load',function(){
    applyFinalCss();
    applyQuickImages();
  });
})();
