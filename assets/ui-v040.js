/* 0.00.40 퀵메뉴 이미지 보정
   - 기존 background-image에 의존하지 않고 실제 img 요소를 생성한다.
   - 이렇게 하면 외부 CSS의 background 재정의와 관계없이 이미지가 표시된다.
*/
(function(){
  function applyQuickArtwork(){
    const buttons = document.querySelectorAll('#home .quick button');
    const sources = [
      'assets/fortune/zodiac05.jpg',
      'assets/fortune/star01.jpg',
      'assets/ui/quick-heart.svg',
      'assets/ui/quick-lucky.svg'
    ];

    buttons.forEach(function(button,index){
      const box = button.querySelector('.ico');
      const src = sources[index];
      if(!box || !src) return;

      let img = box.querySelector('.quick-art');
      if(!img){
        img = document.createElement('img');
        img.className = 'quick-art';
        img.alt = '';
        box.textContent = '';
        box.appendChild(img);
      }
      img.src = src;
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',applyQuickArtwork,{once:true});
  }else{
    applyQuickArtwork();
  }
})();
