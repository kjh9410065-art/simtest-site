// 홈 화면의 메뉴 구조를 정리합니다.
// 띠·별자리 카드는 홈에서 클릭하면 기존 모달이 열리도록 그대로 둡니다.
document.addEventListener('DOMContentLoaded',function(){
  // 심리테스트 목록은 홈에서 숨기고 별도 목록 페이지로 이동합니다.
  const tests=document.getElementById('tests');
  if(tests)tests.style.display='none';

  // 사이드 메뉴와 상단 메뉴의 심리테스트 버튼을 별도 페이지로 연결합니다.
  document.querySelectorAll('a[href="#tests"]').forEach(link=>{
    link.href='/test/';
  });
});