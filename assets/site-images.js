// 사이트의 실제 이미지 파일을 화면 요소에 연결합니다.
(function () {
  const images = {
    // 상단 4개 바로가기 카드
    quick: [
      'file_000000000bac8209a8781428bf1685be.png',
      '꽃잎 흩날리는 호숫가의 봄 풍경.png',
      '바다를 품은 아늑한 카페 공간.png',
      '따뜻한 햇살 아래 온라인 커뮤니티 카페.png'
    ],
    // 인기 심리테스트 카드
    tests: [
      '햇살 가득한 카페의 즐거운 모임.png',
      '햇살 머무는 바닷가 작업 공간.png',
      '일곱 계절의 환상 아치홀.png',
      '햇살 가득한 카페의 즐거운 모임.png'
    ],
    // 히어로 이미지
    hero: '바다를 품은 아늑한 카페 공간.png'
  };

  // 한글/공백이 포함된 파일명을 브라우저 URL로 안전하게 변환합니다.
  const url = (name) => '/' + encodeURIComponent(name);

  function applyImages() {
    // 히어로 이미지는 선명하게 표시합니다.
    const hero = document.querySelector('.hero-art');
    if (hero) {
      hero.style.backgroundImage = `url("${url(images.hero)}")`;
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundPosition = 'center';
      hero.style.backgroundRepeat = 'no-repeat';
    }

    // 상단 4개 카드의 이미지 밝기/선명도를 동일하게 맞춥니다.
    document.querySelectorAll('.quick-card').forEach((card, index) => {
      const file = images.quick[index];
      if (!file) return;
      card.style.backgroundImage = `linear-gradient(rgba(255,255,255,.15), rgba(255,255,255,.15)), url("${url(file)}")`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
      card.style.backgroundRepeat = 'no-repeat';
    });

    // 인기 테스트 카드도 동일한 선명도로 맞춥니다.
    document.querySelectorAll('.test-card').forEach((card, index) => {
      const file = images.tests[index];
      if (!file) return;
      card.style.backgroundImage = `linear-gradient(rgba(255,255,255,.15), rgba(255,255,255,.15)), url("${url(file)}")`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
      card.style.backgroundRepeat = 'no-repeat';
    });
  }

  // Worker가 이 스크립트를 <head>에 넣기 때문에 DOM 생성 후 실행합니다.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyImages, { once: true });
  } else {
    applyImages();
  }

  // 동적으로 생성되는 테스트 카드에도 같은 이미지 스타일을 적용합니다.
  new MutationObserver(applyImages).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
