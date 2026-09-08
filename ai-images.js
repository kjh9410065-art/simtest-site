// Cloudflare Workers AI에서 생성된 이미지만 화면에 넣는 이미지 로더입니다.
(() => {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  // 코드가 바뀔 때마다 URL 버전을 올려 이전 응답과 완전히 분리합니다.
  const imageVersion = "ai-20260909-v5";

  // AI 이미지가 늦게 생성되어도 레이아웃이 갑자기 커지거나 줄어들지 않도록 크기를 고정합니다.
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

  const images = [...document.querySelectorAll("[data-ai-image]")];
  if (!images.length) return;

  // 한 번에 5개의 AI 생성 요청을 동시에 보내지 않습니다.
  // 순차 처리로 Workers AI의 순간적인 용량 오류와 동시 요청 실패를 줄입니다.
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function loadImage(image, type) {
    const url = `/api/image?type=${encodeURIComponent(type)}&date=${encodeURIComponent(date)}&v=${imageVersion}`;
    const maxAttempts = 3;

    image.decoding = "async";
    image.loading = "eager";
    image.setAttribute("aria-busy", "true");

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        // fetch로 먼저 응답이 실제 이미지인지 확인한 뒤에만 img.src를 설정합니다.
        // 그래서 API가 실패해도 브라우저에 깨진 이미지 아이콘이 나타나지 않습니다.
        const response = await fetch(url, {
          method: "GET",
          cache: "force-cache"
        });

        if (!response.ok) {
          throw new Error(`AI image HTTP ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.startsWith("image/")) {
          throw new Error(`Invalid AI image content type: ${contentType}`);
        }

        const blob = await response.blob();
        if (!blob.size) throw new Error("AI image response is empty");

        // 검증이 끝난 실제 AI 이미지 데이터만 브라우저에 연결합니다.
        const objectUrl = URL.createObjectURL(blob);
        image.onload = () => {
          URL.revokeObjectURL(objectUrl);
          image.removeAttribute("aria-busy");
        };
        image.src = objectUrl;
        return true;
      } catch (error) {
        console.error(`AI image load failed: ${type}, attempt ${attempt}`, error);
        if (attempt < maxAttempts) await wait(700 * attempt);
      }
    }

    // 실패 시 정적 이미지로 대체하지 않습니다.
    // 빈 영역을 유지해 깨진 이미지 아이콘이나 오래된 fallback 이미지가 나타나는 것을 막습니다.
    image.removeAttribute("src");
    image.setAttribute("aria-busy", "false");
    return false;
  }

  // 위에서부터 순서대로 하나씩 생성하고 검증합니다.
  // hero가 먼저 표시되고, 이후 네 개의 메뉴 카드 이미지가 차례대로 표시됩니다.
  (async () => {
    for (const image of images) {
      const type = image.dataset.aiImage;
      if (!type) continue;
      await loadImage(image, type);
    }
  })();
})();
