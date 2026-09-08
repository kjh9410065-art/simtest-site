/* v0.00.51
   빠른 메뉴의 실제 이미지 자산을 직접 연결하고 기존 문자 아이콘을 제거한다.
   이미지가 없는 경우에도 깨진 이미지 아이콘이 화면에 남지 않도록 img 요소를 정리한다.
*/
(function(){
  const sources=[
    'assets/fortune/zodiac05.jpg?v=0.00.51',
    'assets/fortune/star01.jpg?v=0.00.51',
    'assets/tests_nonhuman/love-art.jpg?v=0.00.51',
    'assets/ui/quick-lucky.svg?v=0.00.51'
  ];

  function fixQuick(){
    const quick=document.querySelector('#home .quick');
    if(!quick) return;

    quick.querySelectorAll('button').forEach(function(button,index){
      const source=sources[index];
      if(!source) return;

      let ico=button.querySelector('.ico');
      if(!ico){
        ico=document.createElement('span');
        ico.className='ico';
        button.insertBefore(ico,button.firstChild);
      }

      /* 기존 문자 아이콘을 제거하고 실제 이미지로 교체한다. */
      ico.textContent='';
      ico.style.backgroundImage='url("'+source+'")';
      ico.style.backgroundSize='cover';
      ico.style.backgroundPosition='center';
      ico.style.backgroundRepeat='no-repeat';

      /* 기존 img가 있으면 동일한 실제 파일을 사용한다. */
      let img=ico.querySelector('img');
      if(!img){
        img=document.createElement('img');
        ico.appendChild(img);
      }
      img.src=source;
      img.alt='';
      img.style.width='100%';
      img.style.height='100%';
      img.style.objectFit='cover';
      img.style.display='block';
      img.onerror=function(){this.style.display='none';};
    });
  }

  /* 완성된 홈 CSS를 문서의 가장 늦은 시점에 다시 연결한다. */
  function loadFinalCss(){
    if(document.getElementById('ui-v050-final-link')) return;
    const link=document.createElement('link');
    link.id='ui-v050-final-link';
    link.rel='stylesheet';
    link.href='assets/ui-v050.css?v=0.00.51';
    document.head.appendChild(link);
  }

  function apply(){
    loadFinalCss();
    fixQuick();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply);
  else apply();

  /* 모든 레거시 스타일이 파싱된 뒤 마지막으로 한 번 더 적용한다. */
  window.addEventListener('load',function(){
    apply();
    setTimeout(fixQuick,150);
  });
})();
