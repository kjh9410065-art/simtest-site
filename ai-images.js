// Cloudflare Workers AI에서 생성된 이미지만 화면에 넣는 이미지 로더입니다.
(() => {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  // 코드가 바뀔 때마다 URL 버전을 올려 이전 응답과 완전히 분리합니다.
  const imageVersion = "ai-20260909-v7";

  // 원본 CSS의 큰 히어로 영역을 강제로 정리해 화면 아래에 불필요한 빈 공간이 생기지 않게 합니다.
  // 이미지 생성 여부와 관계없이 같은 레이아웃 높이를 유지합니다.
  const style = document.createElement("style");
  style.textContent = `
    .home-hero{height:auto!important;min-height:0!important;overflow:hidden!important}
    .hero-inner{height:auto!important;min-height:0!important;padding:44px 28px 50px!important;align-items:center!important}
    .home-hero h1{font-size:clamp(39px,4.3vw,58px)!important;line-height:1.13!important;letter-spacing:-3.4px!important;margin:0 0 16px!important}
    .home-hero p{max-width:470px!important;font-size:13px!important;line-height:1.75!important;margin:0 0 23px!important}
    .home-hero .hero-actions{display:flex!important;gap:9px!important;flex-wrap:wrap!important}
    .hero-art{min-width:0!important;min-height:0!important}
    .hero-art img{display:block!important;width:100%!important;height:330px!important;min-height:330px!important;aspect-ratio:16/10!important;object-fit:cover!important;background:#171d50!important}
    .quick{margin-top:-16px!important}
    .quick-card img{display:block!important;width:100%!important;height:128px!important;min-height:128px!important;object-fit:cover!important;background:#171d50!important}
    .fortune-card .date-art{display:block!important;width:130px!important;height:92px!important;min-height:92px!important;object-fit:cover!important;background:#171d50!important}
    .lucky-banner img{display:block!important;width:100%!important;height:100%!important;min-height:170px!important;object-fit:cover!important;background:#171d50!important}

    @media (min-width:1400px){
      .hero-inner{min-height:0!important;padding:48px 28px 54px!important}
      .hero-art img{height:360px!important;min-height:360px!important}
      .quick-card img{height:138px!important;min-height:138px!important}
    }

    @media (max-width:1180px){
      .hero-inner{grid-template-columns:minmax(250px,.9fr) minmax(320px,1.1fr)!important;gap:28px!important;padding-left:22px!important;padding-right:22px!important}
      .hero-art img{height:300px!important;min-height:300px!important}
    }

    @media (max-width:720px){
      .home-hero{min-height:0!important}
      .hero-inner{min-height:0!important;padding:34px 18px 40px!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:22px!important}
      .hero-copy{width:100%!important}
      .hero-art{order:2!important;width:100%!important}
      .hero-art img{height:230px!important;min-height:230px!important;border-radius:24px!important}
      .quick{margin-top:-10px!important}
      .quick-card img{height:105px!important;min-height:105px!important}
    }

    @media (max-width:900px) and (orientation:landscape) and (max-height:600px){
      .hero-inner{min-height:0!important;padding:24px 30px 28px!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:24px!important}
      .hero-art{order:0!important}
      .hero-art img{height:260px!important;min-height:260px!important}
      .quick-card img{height:92px!important;min-height:92px!important}
    }

    @media (max-width:390px){
      .hero-art img{height:205px!important;min-height:205px!important}
      .quick-card img{height:120px!important;min-height:120px!important}
    }
  `;
  document.head.appendChild(style);

  const images = [...document.querySelectorAll("[data-ai-image]")];
  if (!images.length) return;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function checkAIHealth() {
    // 이미지 생성 전에 Workers AI 바인딩이 실제 배포에 연결되어 있는지 확인합니다.
    try {
      const response = await fetch(`/api/image-health?v=${imageVersion}`, {
        method: "GET",
        cache: "no-store"
      });
      if (!response.ok) throw new Error(`AI health HTTP ${response.status}`);
      const data = await response.json();
      if (!data.aiBinding) throw new Error("Workers AI binding is unavailable");
      return true;
    } catch (error) {
      console.error("Workers AI preflight failed", error);
      return false;
    }
  }

  async function requestAIImage(type) {
    const url = `/api/image?type=${encodeURIComponent(type)}&date=${encodeURIComponent(date)}&v=${imageVersion}`;
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        // 먼저 실제 이미지 응답인지 검증합니다.
        const response = await fetch(url, {
          method: "GET",
          cache: "force-cache"
        });
        if (!response.ok) throw new Error(`AI image HTTP ${response.status}`);

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.startsWith("image/")) {
          throw new Error(`Invalid AI image content type: ${contentType}`);
        }

        const blob = await response.blob();
        if (!blob.size) throw new Error("AI image response is empty");

        return URL.createObjectURL(blob);
      } catch (error) {
        console.error(`AI image request failed: ${type}, attempt ${attempt}`, error);
        if (attempt < maxAttempts) await wait(700 * attempt);
      }
    }

    return null;
  }

  // 같은 종류의 이미지를 여러 곳에서 요청하더라도 AI를 여러 번 호출하지 않습니다.
  // 예를 들어 lucky 이미지는 홈 카드, 배너, 상세 화면에서 하나의 생성 결과를 공유합니다.
  async function loadType(type, targets) {
    targets.forEach((image) => {
      image.decoding = "async";
      image.loading = "eager";
      image.setAttribute("aria-busy", "true");
    });

    const objectUrl = await requestAIImage(type);
    if (!objectUrl) {
      // 실패 시 정적 이미지로 대체하지 않습니다.
      // src를 비워 두어 깨진 이미지 아이콘과 오래된 fallback을 표시하지 않습니다.
      targets.forEach((image) => {
        image.removeAttribute("src");
        image.setAttribute("aria-busy", "false");
      });
      return;
    }

    // 같은 type의 모든 영역에 검증된 실제 AI 이미지를 연결합니다.
    targets.forEach((image) => {
      image.onload = () => image.removeAttribute("aria-busy");
      image.src = objectUrl;
    });
  }

  (async () => {
    if (!(await checkAIHealth())) return;

    // 페이지 전체의 이미지 요청을 종류별로 묶습니다.
    // hero, zodiac, stars, test, lucky 총 5종만 AI에 요청합니다.
    const grouped = new Map();
    images.forEach((image) => {
      const type = image.dataset.aiImage;
      if (!type) return;
      if (!grouped.has(type)) grouped.set(type, []);
      grouped.get(type).push(image);
    });

    // 한 번에 여러 AI 요청을 보내지 않고 순차 생성합니다.
    for (const [type, targets] of grouped) {
      await loadType(type, targets);
    }
  })();
})();
