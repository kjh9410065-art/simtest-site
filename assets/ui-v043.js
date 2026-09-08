/* v0.00.43
   메인 홈에서 실제 존재하는 이미지 자산을 사용하도록 렌더링을 보정한다.
   기존 테스트 데이터와 테스트 진행 로직은 그대로 두고 홈 화면 표시만 개선한다.
*/
(function(){
  /* 빠른 메뉴의 심리 테스트 이미지는 실제 저장된 JPG를 사용한다. */
  function fixQuickMenuImages(){
    var quick=document.querySelector('.quick-v041');
    if(!quick) return;
    var cards=quick.querySelectorAll('button');
    if(cards[2]){
      var img=cards[2].querySelector('img');
      if(img) img.src='assets/results/love-1.jpg?v=0.00.43';
    }
  }

  /* 홈 인기 테스트 카드는 작은 아이콘 대신 각 테스트의 대표 아트워크를 사용한다. */
  window.renderHome=function(){
    var target=document.getElementById('home-tests');
    if(!target || typeof TESTS==='undefined') return;
    target.innerHTML=TESTS.slice(0,4).map(function(t,i){
      return '<article class="test-card compact-test-card" onclick="startTest('+i+')">'
        +'<div class="compact-icon"><img src="'+t.img+'" alt=""></div>'
        +'<div class="test-body"><h3>'+t.title+'</h3>'
        +'<p>'+t.desc+'</p>'
        +'<div class="start-link">테스트 시작</div></div></article>';
    }).join('');
  };

  /* 이미지 로드 실패 시 깨진 이미지 표시를 숨겨 카드 레이아웃을 보호한다. */
  function protectImages(){
    document.querySelectorAll('#home img').forEach(function(img){
      if(img.dataset.imageGuarded==='1') return;
      img.dataset.imageGuarded='1';
      img.addEventListener('error',function(){
        this.style.display='none';
        if(this.parentElement) this.parentElement.classList.add('image-missing');
      });
    });
  }

  function apply(){
    fixQuickMenuImages();
    if(typeof TESTS!=='undefined') window.renderHome();
    protectImages();
  }

  /* 원본 스크립트가 홈을 렌더링한 뒤에도 개선된 홈 표시를 적용한다. */
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',apply);
  }else{
    apply();
  }
})();
