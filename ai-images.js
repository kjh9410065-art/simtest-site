// Cloudflare Workers AI에서 생성된 이미지만 화면에 넣는 이미지 로더입니다.
(() => {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  // 일본 애니메이션 스타일 프롬프트를 적용했으므로 새 이미지를 요청합니다.
  const imageVersion = "ai-20260909-v11";

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
    @media (min-width:1400px){.hero-inner{min-height:0!important;padding:48px 28px 54px!important}.hero-art img{height:360px!important;min-height:360px!important}.quick-card img{height:138px!important;min-height:138px!important}}
    @media (max-width:1180px){.hero-inner{grid-template-columns:minmax(250px,.9fr) minmax(320px,1.1fr)!important;gap:28px!important;padding-left:22px!important;padding-right:22px!important}.hero-art img{height:300px!important;min-height:300px!important}}
    @media (max-width:720px){.home-hero{min-height:0!important}.hero-inner{min-height:0!important;padding:34px 18px 40px!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:22px!important}.hero-copy{width:100%!important}.hero-art{order:2!important;width:100%!important}.hero-art img{height:230px!important;min-height:230px!important;border-radius:24px!important}.quick{margin-top:-10px!important}.quick-card img{height:105px!important;min-height:105px!important}}
    @media (max-width:900px) and (orientation:landscape) and (max-height:600px){.hero-inner{min-height:0!important;padding:24px 30px 28px!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:24px!important}.hero-art{order:0!important}.hero-art img{height:260px!important;min-height:260px!important}.quick-card img{height:92px!important;min-height:92px!important}}
    @media (max-width:390px){.hero-art img{height:205px!important;min-height:205px!important}.quick-card img{height:120px!important;min-height:120px!important}}
  `;
  document.head.appendChild(style);

  const images = [...document.querySelectorAll("[data-ai-image]")];
  if (!images.length) return;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function checkAIHealth() {
    try {
      const response = await fetch(`/api/image-health?v=${imageVersion}`, { method: "GET", cache: "no-store" });
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
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        // 실제 이미지 응답인지 검증합니다.
        const response = await fetch(url, { method: "GET", cache: "force-cache" });
        if (!response.ok) throw new Error(`AI image HTTP ${response.status}`);
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.startsWith("image/")) throw new Error(`Invalid AI image content type: ${contentType}`);
        const blob = await response.blob();
        if (!blob.size) throw new Error("AI image response is empty");
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error(`AI image request failed: ${type}, attempt ${attempt}`, error);
        if (attempt < 3) await wait(700 * attempt);
      }
    }
    return null;
  }

  (async () => {
    if (!(await checkAIHealth())) return;
    const types = [...new Set(images.map((image) => image.dataset.aiImage).filter(Boolean))];
    for (const type of types) {
      const objectUrl = await requestAIImage(type);
      if (!objectUrl) continue;
      images.filter((image) => image.dataset.aiImage === type).forEach((image) => {
        image.src = objectUrl;
        image.removeAttribute("aria-busy");
      });
    }
  })();
})();
