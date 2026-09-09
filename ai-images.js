// 홈 화면 이미지를 안정적으로 연결합니다.
// 메인 이미지는 저장소의 확정 이미지를 사용하고, 카드 이미지는 Cloudflare Workers AI에서 직접 받아옵니다.
(() => {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
  const imageVersion = "ai-20260909-v18";
  const localHeroUrl = `/hero-main.jpg?v=${imageVersion}`;
  const remoteHeroUrl = `https://raw.githubusercontent.com/kjh9410065-art/simtest-site/main/hero-main.jpg?v=${imageVersion}`;

  const style = document.createElement("style");
  style.textContent = `
    .home-hero{height:auto!important;min-height:0!important;overflow:hidden!important}
    .hero-inner{height:auto!important;min-height:0!important;padding:44px 28px 50px!important;align-items:center!important}
    .home-hero h1{font-size:clamp(39px,4.3vw,58px)!important;line-height:1.13!important;letter-spacing:-3.4px!important;margin:0 0 16px!important}
    .home-hero p{max-width:470px!important;font-size:13px!important;line-height:1.75!important;margin:0 0 23px!important}
    .home-hero .hero-actions{display:flex!important;gap:9px!important;flex-wrap:wrap!important}
    .hero-art{min-width:0!important;min-height:0!important}
    .hero-art img{display:block!important;width:100%!important;height:350px!important;min-height:350px!important;aspect-ratio:16/10!important;object-fit:cover!important;background:#171d50!important}
    .quick{margin-top:-24px!important}
    .quick-card img{display:block!important;width:100%!important;height:205px!important;min-height:205px!important;object-fit:cover!important;background:#171d50!important}
    .quick-copy{padding:18px!important}
    .quick-copy strong{font-size:16px!important}
    .quick-copy span{font-size:12px!important}
    .quick-copy .card-action{height:40px!important;font-size:11px!important}
    .fortune-card .date-art{display:block!important;width:130px!important;height:92px!important;min-height:92px!important;object-fit:cover!important;background:#171d50!important}
    .lucky-banner img{display:block!important;width:100%!important;height:100%!important;min-height:170px!important;object-fit:cover!important;background:#171d50!important}
    @media (min-width:1400px){.hero-inner{padding:48px 28px 54px!important}.hero-art img{height:370px!important;min-height:370px!important}.quick-card img{height:220px!important;min-height:220px!important}}
    @media (max-width:1180px) and (min-width:721px){.hero-inner{grid-template-columns:minmax(250px,.9fr) minmax(320px,1.1fr)!important;gap:28px!important;padding-left:22px!important;padding-right:22px!important}.hero-art img{height:300px!important;min-height:300px!important}.quick-card img{height:160px!important;min-height:160px!important}}
    @media (max-width:720px){.hero-inner{min-height:0!important;padding:34px 18px 40px!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:22px!important}.hero-copy{width:100%!important}.hero-art{order:2!important;width:100%!important}.hero-art img{height:230px!important;min-height:230px!important;border-radius:24px!important}.quick{margin-top:-10px!important}.quick-card img{height:105px!important;min-height:105px!important}.quick-copy{padding:15px!important}}
    @media (max-width:900px) and (orientation:landscape) and (max-height:600px){.hero-inner{min-height:0!important;padding:24px 30px 28px!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:24px!important}.hero-art{order:0!important}.hero-art img{height:260px!important;min-height:260px!important}.quick-card img{height:92px!important;min-height:92px!important}}
    @media (max-width:390px){.hero-art img{height:205px!important;min-height:205px!important}.quick-card img{height:120px!important;min-height:120px!important}}
  `;
  document.head.appendChild(style);

  const images = [...document.querySelectorAll("[data-ai-image]")];
  if (!images.length) return;

  // 메인 이미지는 먼저 Cloudflare 정적 자산을 사용하고, 자산 라우팅이 실패하면 GitHub 원본으로 한 번만 전환합니다.
  images
    .filter((image) => image.dataset.aiImage === "hero")
    .forEach((image) => {
      image.src = localHeroUrl;
      image.loading = "eager";
      image.decoding = "async";
      image.dataset.heroFallback = "0";
      image.onerror = () => {
        if (image.dataset.heroFallback === "1") {
          image.style.visibility = "hidden";
          return;
        }
        image.dataset.heroFallback = "1";
        image.src = remoteHeroUrl;
      };
      image.removeAttribute("aria-busy");
    });

  // Workers AI 상태 확인에 실패해도 실제 이미지 요청은 계속합니다.
  // 기존 health-gate 때문에 이미지 전체가 중단되던 문제를 제거했습니다.
  const cardTypes = [...new Set(
    images
      .map((image) => image.dataset.aiImage)
      .filter((type) => type && type !== "hero")
  )];

  cardTypes.forEach((type) => {
    const url = `/api/image?type=${encodeURIComponent(type)}&date=${encodeURIComponent(date)}&v=${imageVersion}`;
    images
      .filter((image) => image.dataset.aiImage === type)
      .forEach((image) => {
        image.src = url;
        image.loading = "lazy";
        image.decoding = "async";
        image.dataset.retryDone = "0";
        image.removeAttribute("aria-busy");

        image.onerror = () => {
          if (image.dataset.retryDone === "1") {
            image.style.visibility = "hidden";
            return;
          }
          image.dataset.retryDone = "1";
          image.src = `/api/image?type=${encodeURIComponent(type)}&date=${encodeURIComponent(date)}&v=${imageVersion}-retry`;
        };
      });
  });
})();
