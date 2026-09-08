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

// AI가 실패해도 깨진 이미지 아이콘이 나오지 않도록 실제 SVG 이미지 데이터를 만듭니다.
function fallbackImage(type) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111846"/><stop offset=".58" stop-color="#302c73"/><stop offset="1" stop-color="#7656df"/></linearGradient><radialGradient id="r"><stop stop-color="#e3d9ff" stop-opacity=".62"/><stop offset="1" stop-color="#d8caff" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="750" fill="url(#g)"/><circle cx="900" cy="210" r="240" fill="url(#r)"/><circle cx="925" cy="205" r="82" fill="#f4f0ff" opacity=".92"/><circle cx="190" cy="150" r="5" fill="#fff" opacity=".85"/><circle cx="320" cy="290" r="4" fill="#fff" opacity=".72"/><circle cx="600" cy="100" r="4" fill="#fff" opacity=".82"/><circle cx="720" cy="390" r="5" fill="#fff" opacity=".72"/><path d="M100 585 C300 430 430 650 630 500 C760 400 900 520 1110 380" fill="none" stroke="#cdbbff" stroke-width="4" opacity=".48"/><circle cx="270" cy="530" r="52" fill="#1b2054" opacity=".75"/><path d="M0 690 C230 590 420 690 620 610 C820 530 1000 640 1200 550 V750 H0Z" fill="#0c1237" opacity=".65"/></svg>`;
  const bytes = new TextEncoder().encode(svg);
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-AI-Image-Fallback": "true",
      "X-AI-Image-Type": type
    }
  });
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
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
      // 날짜와 이미지 종류를 시드로 사용해 같은 날짜에는 같은 이미지를 유지합니다.
      const seedText = `${date}:${type}`;
      let seed = 0;
      for (let i = 0; i < seedText.length; i += 1) seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;

      const result = await env.AI.run(IMAGE_MODEL, { prompt, seed, steps: 4 });
      if (!result || typeof result.image !== "string" || !result.image) throw new Error("Workers AI returned no image");

      // 브라우저가 별도의 JSON 처리 없이 일반 이미지 URL로 바로 표시할 수 있게 반환합니다.
      return new Response(base64ToBytes(result.image), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
          "X-AI-Image-Type": type,
          "X-AI-Image-Date": date
        }
      });
    } catch (error) {
      console.error("AI image generation failed", error);
      return fallbackImage(type);
    }
  }
};
