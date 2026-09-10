// FLiCK 이미지 연결 설정
(function () {
  const images = {
    // 홈 상단 4개 카드: 내용과 어울리는 기존 이미지를 사용합니다.
    quick: [
      'file_000000000bac8209a8781428bf1685be.png',
      '꽃잎 흩날리는 호숫가의 봄 풍경.png',
      '햇살 머무는 바닷가 작업 공간.png',
      '꿈결 같은 태양 오라클 카드 정원.png'
    ],
    // 인기 테스트도 서로 다른 기존 일러스트를 사용합니다.
    tests: [
      '햇살 가득한 카페의 즐거운 모임.png',
      '햇살 머무는 바닷가 작업 공간.png',
      '일곱 계절의 환상 아치홀.png',
      '고요한 창가의 타로 카드 정물.png'
    ],
    hero: '바다를 품은 아늑한 카페 공간.png'
  };

  // 한글/공백 파일명을 안전한 브라우저 URL로 변환합니다.
  const url = (name) => '/' + encodeURIComponent(name);

  function applyImages() {
    // 메인 일러스트는 원본을 그대로 선명하게 보여줍니다.
    const hero = document.querySelector('.hero-art');
    if (hero) {
      hero.style.backgroundImage = `url("${url(images.hero)}")`;
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundPosition = 'center';
      hero.style.backgroundRepeat = 'no-repeat';
      hero.style.filter = 'none';
    }

    // 4개 카드에는 흰색 그라데이션을 제거하고 원본 이미지를 사용합니다.
    document.querySelectorAll('.quick-card').forEach((card, index) => {
      const file = images.quick[index];
      if (!file) return;
      card.style.backgroundImage = `url("${url(file)}")`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
      card.style.backgroundRepeat = 'no-repeat';
      card.style.filter = 'none';
    });

    // 인기 테스트 카드 역시 동일한 방식으로 표시합니다.
    document.querySelectorAll('.test-card').forEach((card, index) => {
      const file = images.tests[index];
      if (!file) return;
      card.style.backgroundImage = `url("${url(file)}")`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
      card.style.backgroundRepeat = 'no-repeat';
      card.style.filter = 'none';
    });
  }

  // DOM이 준비된 뒤 한 번 적용합니다.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyImages, { once: true });
  } else {
    applyImages();
  }

  // 화면 전환으로 카드가 다시 만들어져도 이미지 연결을 유지합니다.
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applyImages();
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
