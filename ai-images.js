// Workers AI 이미지 로더입니다.
(() => {
  // 사이트 기준 시간을 한국 시간으로 고정합니다.
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  // 홈 화면의 과도한 빈 공간을 줄이고 모든 화면 크기에서 이미지 영역을 안정적으로 유지합니다.
  const style = document.createElement("style");
  style.textContent = `
    .hero-inner{min-height:430px!important;padding-top:42px!important;padding-bottom:42px!important}
    .hero-art{min-height:0!important}
    .hero-art img{height:360px!important;object-fit:cover!important}
    .quick{margin-top:-24px!important}
    .quick-card img{height:128px!important;object-fit:cover!important}
    @media (max-width:1050px){.hero-inner{min-height:400px!important}.hero-art img{height:310px!important}.quick-card img{height:120px!important}}
    @media (max-width:720px){.hero-inner{min-height:0!important;grid-template-columns:1fr!important;padding-top:36px!important;padding-bottom:34px!important}.hero-art img{height:230px!important}.quick{margin-top:0!important}.quick-card img{height:150px!important}}
    @media (orientation:landscape) and (max-height:600px){.hero-inner{min-height:330px!important}.hero-art img{height:250px!important}.quick-card img{height:105px!important}}
    @media (min-width:1400px){.hero-inner{min-height:450px!important}.hero-art img{height:380px!important}}
  `;
  document.head.appendChild(style);

  document.querySelectorAll("[data-ai-image]").forEach((image) => {
    const type = image.dataset.aiImage;
    if (!type) return;

    image.loading = type === "hero" ? "eager" : "lazy";
    image.decoding = "async";

    // Worker가 JSON으로 돌려주는 data URI를 받아 브라우저에서 바로 표시합니다.
    fetch(`/api/image?type=${encodeURIComponent(type)}&date=${date}`, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`image api ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!data || !data.dataURI) throw new Error("image data missing");
        image.src = data.dataURI;
        image.style.visibility = "visible";
      })
      .catch((error) => {
        // API 실패 시 깨진 이미지 아이콘을 노출하지 않습니다.
        console.error("AI image load failed", type, error);
        image.style.visibility = "hidden";
      });
  });
})();
