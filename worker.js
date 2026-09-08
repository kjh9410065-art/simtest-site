// Cloudflare Worker가 사이트의 동적 이미지를 생성합니다.
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

const PROMPTS = {
  hero: "A premium editorial illustration for a Korean daily fortune website, dreamy midnight indigo and violet atmosphere, elegant celestial landscape, subtle moonlight, refined modern Korean web design, sophisticated flat-meets-painterly illustration, no text, no letters, no numbers, no logo, no watermark, clean composition",
  zodiac: "A premium editorial illustration representing zodiac fortune and the twelve Chinese zodiac animals, sophisticated Korean lifestyle web design, mystical midnight indigo and violet palette, elegant celestial atmosphere, refined modern illustration, balanced composition, no text, no letters, no numbers, no logo, no watermark",
  stars: "A premium editorial illustration representing zodiac constellations and astrology, elegant constellation lines, stars, moon and subtle cosmic glow, sophisticated Korean lifestyle web design, indigo violet lavender palette, refined modern illustration, no text, no letters, no numbers, no logo, no watermark",
  test: "A premium editorial illustration representing a personality psychology test, thoughtful human silhouette with abstract shapes, gentle cosmic atmosphere, sophisticated Korean lifestyle web design, lavender violet and muted pink palette, refined modern illustration, no text, no letters, no numbers, no logo, no watermark",
  lucky: "A premium editorial illustration representing a lucky item and good fortune, elegant mysterious treasure object with subtle celestial details, sophisticated Korean lifestyle web design, deep indigo violet and warm gold palette, refined modern illustration, no text, no letters, no numbers, no logo, no watermark"
};

function getDateKey(request) {
  const url = new URL(request.url);
  return url.searchParams.get("date") || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

// AI가 일시적으로 실패해도 깨진 이미지 대신 사용할 안전한 SVG입니다.
function fallbackImage(type) {
  const labels = { hero: "TODAY", zodiac: "ZODIAC", stars: "STARS", test: "TEST", lucky: "LUCK" };
  const label = labels[type] || "TODAY";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111846"/><stop offset=".58" stop-color="#302c73"/><stop offset="1" stop-color="#7656df"/></linearGradient><radialGradient id="r"><stop stop-color="#d8caff" stop-opacity=".55"/><stop offset="1" stop-color="#d8caff" stop-opacity="0"/></radialGradient></defs><rect width="900" height="600" fill="url(#g)"/><circle cx="690" cy="160" r="180" fill="url(#r)"/><circle cx="710" cy="155" r="68" fill="#f1ecff" opacity=".9"/><circle cx="210" cy="140" r="5" fill="#fff" opacity=".9"/><circle cx="290" cy="250" r="4" fill="#fff" opacity=".7"/><circle cx="530" cy="90" r="4" fill="#fff" opacity=".8"/><circle cx="600" cy="330" r="5" fill="#fff" opacity=".7"/><path d="M130 470 C270 350 410 520 560 390 C650 312 740 390 820 330" fill="none" stroke="#cdbbff" stroke-width="3" opacity=".5"/><text x="70" y="520" fill="#fff" font-family="Arial,sans-serif" font-size="30" font-weight="700" letter-spacing="7">${label}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 이미지 API가 아니면 정적 사이트를 그대로 제공합니다.
    if (url.pathname !== "/api/image") return env.ASSETS.fetch(request);
    if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });

    const type = url.searchParams.get("type") || "hero";
    const prompt = PROMPTS[type];
    if (!prompt) return new Response("Unknown image type", { status: 400 });

    const date = getDateKey(request);

    try {
      // 날짜와 이미지 종류를 시드로 사용해 하루 동안 동일한 결과를 유지합니다.
      const seedText = `${date}:${type}`;
      let seed = 0;
      for (let i = 0; i < seedText.length; i += 1) seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;

      const result = await env.AI.run(IMAGE_MODEL, { prompt, seed, steps: 4 });
      if (!result || typeof result.image !== "string" || !result.image) throw new Error("Workers AI returned no image");

      // Cloudflare 공식 FLUX 예제와 동일하게 Base64를 data URI로 전달합니다.
      return Response.json(
        { dataURI: `data:image/jpeg;charset=utf-8;base64,${result.image}`, type, date, fallback: false },
        { headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } }
      );
    } catch (error) {
      console.error("AI image generation failed", error);
      // AI 호출 실패가 사이트 전체 레이아웃을 깨뜨리지 않도록 정상적인 200 응답으로 fallback을 반환합니다.
      return Response.json(
        { dataURI: fallbackImage(type), type, date, fallback: true },
        { headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600", "X-AI-Image-Fallback": "true" } }
      );
    }
  }
};
