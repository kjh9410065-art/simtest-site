// Cloudflare Worker가 사이트의 동적 이미지를 생성합니다.
// 브라우저가 직접 AI API를 호출하지 않도록 Workers AI 바인딩을 서버에서 사용합니다.

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
  return url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
}

function toImageResponse(base64, type, date) {
  // Workers AI가 반환하는 Base64 이미지를 브라우저가 바로 표시할 수 있는 JPEG 응답으로 변환합니다.
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new Response(bytes, {
    headers: {
      "Content-Type": "image/jpeg",
      // 날짜가 바뀌면 URL도 바뀌므로 하루 단위 이미지를 안정적으로 캐시할 수 있습니다.
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-AI-Image-Type": type,
      "X-AI-Image-Date": date
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 이미지 API 이외의 요청은 기존 정적 사이트 파일을 그대로 제공합니다.
    if (url.pathname !== "/api/image") {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const type = url.searchParams.get("type") || "hero";
    const prompt = PROMPTS[type];

    if (!prompt) {
      return new Response("Unknown image type", { status: 400 });
    }

    const date = getDateKey(request);

    try {
      // 같은 날짜에는 같은 시드를 사용해 페이지가 다시 열려도 이미지 콘셉트가 흔들리지 않게 합니다.
      const seedText = `${date}:${type}`;
      let seed = 0;
      for (let i = 0; i < seedText.length; i += 1) {
        seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
      }

      const result = await env.AI.run(IMAGE_MODEL, {
        prompt,
        seed,
        steps: 4
      });

      return toImageResponse(result.image, type, date);
    } catch (error) {
      // AI 생성에 실패했을 때 브라우저가 무한 로딩하지 않도록 명확한 오류를 반환합니다.
      console.error("AI image generation failed", error);
      return new Response("AI image generation failed", {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  }
};
