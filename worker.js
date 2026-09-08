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

function cacheKey(request, type, date) {
  // 날짜와 이미지 종류가 같은 요청은 같은 AI 결과를 재사용합니다.
  // URL의 v 값까지 포함되므로 새 버전 배포 시 이전 결과와 확실히 분리됩니다.
  const url = new URL(request.url);
  return new Request(`${url.origin}/__ai-cache/${encodeURIComponent(type)}/${encodeURIComponent(date)}?v=${encodeURIComponent(url.searchParams.get("v") || "1")}`);
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
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 실제 AI 이미지 API가 아닌 요청은 Cloudflare Assets에서 정적 사이트를 제공합니다.
    if (url.pathname !== "/api/image" && url.pathname !== "/api/image-health") {
      return env.ASSETS.fetch(request);
    }

    // 배포와 바인딩 상태를 확인할 수 있는 진단용 엔드포인트입니다.
    // 실제 AI 생성은 수행하지 않으므로 진단 때문에 AI 사용량이 발생하지 않습니다.
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
    const key = cacheKey(request, type, date);

    try {
      // 먼저 Workers의 엣지 캐시를 확인합니다.
      // 같은 날짜/종류 이미지를 매번 새로 생성하지 않도록 하여 AI 호출 실패 가능성과 사용량을 줄입니다.
      const cached = await caches.default.match(key);
      if (cached) return cached;

      // Cloudflare Workers AI의 공식 FLUX.1 schnell 모델을 호출합니다.
      // 모델 문서에서 안내하는 필수 prompt와 안정적인 4-step 설정만 사용합니다.
      const result = await env.AI.run(IMAGE_MODEL, {
        prompt,
        steps: 4
      });

      if (!result || typeof result.image !== "string" || !result.image) {
        throw new Error("Workers AI returned no image");
      }

      const response = new Response(base64ToBytes(result.image), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          // URL에 날짜와 버전이 포함되어 있으므로 이 결과는 장기간 재사용해도 안전합니다.
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-AI-Image-Type": type,
          "X-AI-Image-Date": date,
          "X-AI-Image-Source": "cloudflare-workers-ai"
        }
      });

      // 응답을 반환하는 동안 엣지 캐시에 저장해 다음 요청에서 AI를 다시 호출하지 않게 합니다.
      ctx.waitUntil(caches.default.put(key, response.clone()));
      return response;
    } catch (error) {
      // 정적 이미지 fallback은 절대 사용하지 않습니다.
      // 오류를 숨기지 않고 상태 코드와 원인을 서버 로그에 남깁니다.
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
