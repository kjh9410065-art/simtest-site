/* v0.00.45
   홈의 네 번째 운세 카드와 심리 테스트 카드 이미지 경로를 실제 존재하는 파일로 교정한다.
   기존 테스트 진행 기능에는 손대지 않는다.
*/
(function(){
  function fixHomeImages(){
    var quick=document.querySelector('#home .quick-final');
    if(quick){
      var quickImages=quick.querySelectorAll('.quick-art img');
      var quickSources=[
        'assets/fortune/zodiac05.jpg?v=0.00.45',
        'assets/fortune/star01.jpg?v=0.00.45',
        'assets/tests_nonhuman/love-art.jpg?v=0.00.45',
        'assets/ui/quick-lucky.svg?v=0.00.45'
      ];
      quickImages.forEach(function(img,index){
        if(quickSources[index]) img.src=quickSources[index];
      });
    }
  }

  function renderHomeCards(){
    var target=document.getElementById('home-tests');
    if(!target || typeof TESTS==='undefined') return;

    /* 홈 인기 테스트는 테스트 전용 일러스트를 사용한다. */
    target.innerHTML=TESTS.slice(0,4).map(function(t,i){
      return '<article class="test-card compact-test-card" onclick="startTest('+i+')">'
        +'<div class="compact-icon"><img src="'+t.img+'" alt=""></div>'
        +'<div class="test-body"><h3>'+t.title+'</h3>'
        +'<p>'+t.desc+'</p>'
        +'<div class="start-link">테스트 시작</div></div></article>';
    }).join('');
  }

  function apply(){
    fixHomeImages();
    renderHomeCards();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',apply);
  }else{
    apply();
  }
})();
