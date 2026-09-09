// Cloudflare Worker에서 생성된 이미지 연결 스크립트를 HTML에 주입합니다.
const IMAGE_SCRIPT = `<script src="/assets/site-images.js"></script>`;
export function addImageBridge(html) {
  return html.replace("</head>", `${IMAGE_SCRIPT}</head>`);
}
