// 페이지의 이미지 파일을 사용하지 않고 Workers AI에서 이미지를 받아옵니다.
(() => {
  const date = new Date().toISOString().slice(0, 10);
  document.querySelectorAll("[data-ai-image]").forEach((image) => {
    const type = image.dataset.aiImage;
    if (!type) return;
    image.loading = type === "hero" ? "eager" : "lazy";
    image.decoding = "async";
    image.src = `/api/image?type=${encodeURIComponent(type)}&date=${date}`;
  });
})();
