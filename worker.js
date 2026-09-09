// 사이트는 정적 HTML/CSS/JavaScript로 동작합니다.
// 이미지 API와 Workers AI 호출을 제거해 이미지 로딩 오류와 불필요한 AI 요청을 없앱니다.
export default {
  async fetch(request, env) {
    // 모든 페이지와 정적 파일은 Cloudflare Assets에서 그대로 제공합니다.
    return env.ASSETS.fetch(request);
  }
};
