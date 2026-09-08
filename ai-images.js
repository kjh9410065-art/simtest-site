// Workers AI 이미지 로더입니다.
(() => {
  // 사이트 기준 시간을 한국 시간으로 고정해 하루 단위 이미지를 만듭니다.
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  // 이전에 저장된 fallback 이미지가 다시 노출되지 않도록 이미지 API 버전을 변경합니다.
  const imageVersion = "ai-20260909-v4";

  // AI 이미지가 로딩되는 동안에도 카드와 히어로의 크기가 흔들리지 않게 영역만 확보합니다.
  const style = document.createElement("style");
  style.textContent = `
    .home-hero h1{font-size:clamp(39px,4.3vw,58px)!important;line-height:1.13!important;letter-spacing:-3.4px!important;margin:0 0 16px!important}
    .home-hero p{max-width:470px!important;font-size:13px!important;line-height:1.75!important;margin:0 0 23px!important}
    .home-hero .hero-actions{display:flex!important;gap:9px!important;flex-wrap:wrap!important}
    .hero-inner{min-height:450px!important;padding:44px 28px 58px!important}
    .hero-art{min-width:0!important;min-height:0!important}
    .hero-art img{display:block!important;width:100%!important;height:360px!important;min-height:360px!important;aspect-ratio:16/10!important;object-fit:cover!important;background:#171d50!important}
    .quick{margin-top:-20px!important}
    .quick-card img{display:block!important;width:100%!important;height:128px!important;min-height:128px!important;object-fit:cover!important;background:#171d50!important}
    @media (min-width:1400px){.hero-inner{min-height:480px!important}.hero-art img{height:380px!important;min-height:380px!important}.quick-card img{height:138px!important;min-height:138px!important}}
    @media (max-width:1050px){.hero-inner{min-height:400px!important;padding:38px 22px 44px!important}.hero-art img{height:310px!important;min-height:310px!important}.quick-card img{height:120px!important;min-height:120px!important}}
    @media (max-width:720px){.hero-inner{min-height:0!important;padding:34px 18px 42px!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:25px!important}.hero-art{order:2!important}.hero-art img{height:230px!important;min-height:230px!important}.quick{margin-top:-13px!important}.quick-card img{height:105px!important;min-height:105px!important}}
    @media (max-width:390px){.quick-card img{height:130px!important;min-height:130px!important}}
    @media (max-width:900px) and (orientation:landscape) and (max-height:600px){.hero-inner{min-height:350px!important;padding:24px 30px 30px!important;display:grid!important;grid-template-columns:1fr 1fr!important}.hero-art{order:0!important}.hero-art img{height:280px!important;min-height:280px!important}.quick-card img{height:92px!important;min-height:92px!important}}
  `;
  document.head.appendChild(style);

  document.querySelectorAll("[data-ai-image]").forEach((image) => {
    const type = image.dataset.aiImage;
    if (!type) return;

    // 첫 화면의 이미지는 즉시 요청하고, 아래쪽 이미지는 브라우저가 필요할 때 불러옵니다.
    image.loading = type === "hero" || image.closest(".quick-card") ? "eager" : "lazy";
    image.decoding = "async";

    // 버전 값을 URL에 포함해 과거 fallback 응답이 캐시에서 다시 나오는 것을 차단합니다.
    image.src = `/api/image?type=${encodeURIComponent(type)}&date=${date}&v=${imageVersion}`;
  });
})();
