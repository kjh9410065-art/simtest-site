/* v0.00.50
   v0.00.49에서 실제 이미지가 보이지 않는 경우를 대비해 빠른 메뉴 이미지 경로를 다시 직접 지정한다.
   이미지 요소와 배경 이미지 방식을 모두 지원한다.
*/
(function(){
  function apply(){
    const quick=document.querySelector('#home .quick');
    if(!quick) return;

    const sources=[
      'assets/fortune/zodiac05.jpg?v=0.00.50',
      'assets/fortune/star01.jpg?v=0.00.50',
      'assets/tests_nonhuman/love-art.jpg?v=0.00.50',
      'assets/ui/quick-lucky.svg?v=0.00.50'
    ];

    quick.querySelectorAll('button').forEach(function(button,index){
      if(!sources[index]) return;
      const ico=button.querySelector('.ico');
      if(!ico) return;

      /* 기존 아이콘 문자를 제거하고 실제 이미지 파일을 사용한다. */
      ico.textContent='';
      ico.style.backgroundImage='url("'+sources[index]+'")';
      ico.style.backgroundSize='cover';
      ico.style.backgroundPosition='center';
      ico.style.backgroundRepeat='no-repeat';

      /* 혹시 기존 img가 들어 있다면 동일한 실제 파일로 교체한다. */
      const img=ico.querySelector('img');
      if(img){
        img.src=sources[index];
        img.alt='';
        img.style.display='block';
        img.style.width='100%';
        img.style.height='100%';
        img.style.objectFit='cover';
      }
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply);
  else apply();
})();
