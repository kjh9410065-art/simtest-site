/* v0.00.49
   빠른 메뉴의 이미지가 누락되어 빈 카드가 나오는 문제를 보정한다.
   실제 저장소에 존재하는 이미지 자산을 버튼 순서에 맞춰 직접 연결한다.
*/
(function(){
  function applyQuickImages(){
    const quick=document.querySelector('#home .quick');
    if(!quick) return;

    const buttons=quick.querySelectorAll('button');
    const images=[
      'assets/fortune/zodiac05.jpg?v=0.00.49',
      'assets/fortune/star01.jpg?v=0.00.49',
      'assets/tests_nonhuman/love-art.jpg?v=0.00.49',
      'assets/ui/quick-lucky.svg?v=0.00.49'
    ];

    buttons.forEach(function(button,index){
      if(index>=images.length) return;
      const ico=button.querySelector('.ico');
      if(!ico) return;

      /* 기존 문자 아이콘은 숨기고 실제 이미지 파일을 카드 배경으로 사용한다. */
      ico.textContent='';
      ico.style.backgroundImage='url("'+images[index]+'")';
      ico.style.backgroundSize='cover';
      ico.style.backgroundPosition='center';
      ico.style.backgroundRepeat='no-repeat';
    });
  }

  /* 행운 아이템 텍스트는 날짜가 바뀌면 기존 v0.00.46 로직이 처리하도록 유지한다. */
  function apply(){
    applyQuickImages();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply);
  else apply();
})();
