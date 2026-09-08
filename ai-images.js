// 페이지의 이미지 파일을 사용하지 않고 Workers AI에서 이미지를 받아옵니다.
(() => {
  // 사이트 기준 시간은 한국 시간으로 고정해 매일 자정에 새 이미지가 시작되게 합니다.
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  document.querySelectorAll("[data-ai-image]").forEach((image) => {
    const type = image.dataset.aiImage;
    if (!type) return;

    // 첫 화면의 히어로 이미지는 즉시 요청하고 나머지는 필요할 때 요청합니다.
    image.loading = type === "hero" ? "eager" : "lazy";
    image.decoding = "async";
    image.src = `/api/image?type=${encodeURIComponent(type)}&date=${date}`;
  });
})();
