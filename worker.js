// Cloudflare Worker가 사이트의 동적 AI 이미지만 생성합니다.
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

// 모든 이미지가 같은 그림처럼 보이지 않도록 각 메뉴의 역할과 구도를 구체적으로 지정합니다.
// 특히 이미지 모델이 글자나 동양 문자처럼 보이는 요소를 만들어내지 않도록 강하게 제한합니다.
const PROMPTS = {
  hero: "Premium Korean lifestyle web editorial illustration, cinematic moonlit night over a calm indigo lake, distant layered mountains, one elegant small human silhouette standing beside a glowing lantern, soft lavender mist, deep navy and violet palette, sophisticated contemporary digital painting, subtle grain, atmospheric depth, refined luxury magazine art direction, generous negative space, beautiful lighting, polished professional illustration, no typography, no writing, no letters, no numbers, no Chinese characters, no Korean characters, no Japanese characters, no symbols, no logo, no watermark, no border, no frame",
  zodiac: "Premium editorial illustration for a modern Korean fortune website, twelve Chinese zodiac animals represented as elegant small animal silhouettes arranged naturally around a luminous moon, ram, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog and pig, rich indigo and plum night palette, sophisticated painterly digital illustration, layered depth, soft celestial glow, premium magazine art direction, balanced composition, animals clearly recognizable but tasteful, no circular chart, no calligraphy, no typography, no writing, no letters, no numbers, no Chinese characters, no Korean characters, no Japanese characters, no zodiac glyphs, no logo, no watermark",
  stars: "Premium editorial astrology illustration for a modern Korean lifestyle website, a deep midnight sky with a large luminous crescent moon, elegant connected points of light forming subtle constellation patterns, drifting clouds, a few glowing stars, soft lavender and indigo atmosphere, sophisticated cinematic digital painting, minimal luxurious composition, realistic light bloom, refined magazine cover art direction, no human face, no circular zodiac wheel, no astrology symbols, no glyphs, no typography, no writing, no letters, no numbers, no Chinese characters, no Korean characters, no Japanese characters, no logo, no watermark",
  test: "Premium editorial illustration for a psychological personality test, elegant side-profile silhouette of a thoughtful young adult surrounded by translucent layered shapes, flowing ribbons of lavender, violet and muted rose, subtle moonlight, abstract reflections suggesting thoughts and emotions, sophisticated contemporary Korean magazine illustration, tasteful human proportions, clean composition, premium digital painting, soft cinematic lighting, calm intelligent mood, no text, no typography, no letters, no numbers, no symbols, no logo, no watermark, no frame",
  lucky: "Premium editorial illustration for a modern Korean fortune website, one beautiful mysterious lucky object centered on a dark indigo velvet surface, elegant glass crystal orb with a small warm golden glow inside, subtle moonlit reflections, tiny floating particles, rich navy violet and restrained gold palette, sophisticated luxury product editorial photography mixed with painterly illustration, cinematic lighting, premium composition, clean background, no Chinese lantern, no coins, no characters, no calligraphy, no typography, no writing, no letters, no numbers, no symbols, no logo, no watermark"
};

function getDateKey(request) {
  const url = new URL(request.url);
  return url.searchParams.get("date") || new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul"
  }).format(new Date());
}

function base64ToBytes(base64) {
  // Workers AI의 FLUX 결과는 Base64 문자열이므로 브라우저가 바로 읽을 수 있는 바이트로 변환합니다.
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 실제 AI 이미지 API가 아닌 요청은 Cloudflare Assets에서 정적 사이트를 제공합니다.
    if (url.pathname !== "/api/image" && url.pathname !== "/api/image-health") {
      return env.ASSETS.fetch(request);
    }

    // 배포와 바인딩 상태를 확인할 수 있는 진단용 엔드포인트입니다.
    if (url.pathname === "/api/image-health") {
      return json({
        ok: Boolean(env.AI && env.ASSETS),
        aiBinding: Boolean(env.AI),
        assetsBinding: Boolean(env.ASSETS),
        model: IMAGE_MODEL
      });
    }

    if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });

    const type = url.searchParams.get("type") || "hero";
    const prompt = PROMPTS[type];
    if (!prompt) return new Response("Unknown image type", { status: 400 });

    const date = getDateKey(request);

    try {
      // FLUX.1 schnell은 최대 8 step을 지원하므로 8 step으로 품질을 우선합니다.
      const result = await env.AI.run(IMAGE_MODEL, {
        prompt,
        steps: 8
      });

      if (!result || typeof result.image !== "string" || !result.image) {
        throw new Error("Workers AI returned no image");
      }

      return new Response(base64ToBytes(result.image), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
          "X-AI-Image-Type": type,
          "X-AI-Image-Date": date,
          "X-AI-Image-Source": "cloudflare-workers-ai"
        }
      });
    } catch (error) {
      // 정적 이미지 fallback은 절대 사용하지 않습니다.
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
