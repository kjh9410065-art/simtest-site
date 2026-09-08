/* 0.00.41 행운 아이템 이미지 보정
   - 행운 아이템 카드가 하나의 이미지에 고정되지 않도록 날짜 기준으로 이미지를 교체한다.
   - 서버 없이도 같은 날짜에는 같은 결과가 보이도록 날짜 숫자를 기준으로 선택한다.
*/
(function(){
  function applyHomeQuickCards(){
    const home = document.querySelector('#home');
    if(!home) return;

    const buttons = home.querySelectorAll('.quick button');
    const sources = [
      'assets/fortune/zodiac05.jpg',
      'assets/fortune/star01.jpg',
      'assets/results/love01.svg',
      'assets/ui/quick-lucky.svg'
    ];

    buttons.forEach(function(button,index){
      const box = button.querySelector('.ico');
      if(!box || !sources[index]) return;

      let img = box.querySelector('.quick-art');
      if(!img){
        img = document.createElement('img');
        img.className = 'quick-art';
        img.alt = '';
        box.textContent = '';
        box.appendChild(img);
      }
      img.src = sources[index];
    });

    /* 행운 아이템은 날짜마다 다른 실제 이미지로 바꾼다. */
    const luckyBox = buttons[3] && buttons[3].querySelector('.quick-art');
    if(luckyBox){
      const day = Math.floor(Date.now() / 86400000);
      const luckySources = [
        'assets/ui/quick-lucky.svg',
        'assets/results/soulmate02.svg',
        'assets/results/first01.svg',
        'assets/results/personality04.svg'
      ];
      luckyBox.src = luckySources[day % luckySources.length];
    }
  }

  function start(){
    applyHomeQuickCards();
    setTimeout(applyHomeQuickCards,300);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
})();
