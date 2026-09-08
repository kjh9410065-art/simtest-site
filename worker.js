// Cloudflare Worker가 사이트의 동적 AI 이미지만 생성합니다.
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
      // 날짜와 이미지 종류를 시드로 사용해 하루 동안 동일한 AI 이미지를 유지합니다.
      const seedText = `${date}:${type}`;
      let seed = 0;
      for (let i = 0; i < seedText.length; i += 1) seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;

      // Cloudflare Workers AI의 공식 FLUX 이미지 생성 모델을 호출합니다.
      const result = await env.AI.run(IMAGE_MODEL, {
        prompt,
        seed,
        steps: 4
      });

      if (!result || typeof result.image !== "string" || !result.image) {
        throw new Error("Workers AI returned no image");
      }

      // 생성된 Base64 이미지를 실제 JPEG 응답으로 반환합니다.
      return new Response(base64ToBytes(result.image), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          // 하루 동안 같은 날짜/종류 요청은 생성된 AI 이미지를 재사용합니다.
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
          "X-AI-Image-Type": type,
          "X-AI-Image-Date": date,
          "X-AI-Image-Source": "cloudflare-workers-ai"
        }
      });
    } catch (error) {
      // 정적 이미지로 대체하지 않습니다. 문제가 있으면 명확한 오류를 반환해 원인을 숨기지 않습니다.
      console.error("Workers AI image generation failed", error);
      return new Response("Workers AI image generation failed", {
        status: 502,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-AI-Image-Source": "cloudflare-workers-ai"
        }
      });
    }
  }
};
