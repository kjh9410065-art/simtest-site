// Cloudflare Workers AI에서 생성된 이미지만 화면에 넣는 이미지 로더입니다.
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

// 사이트 전체 이미지를 일본 애니메이션 일러스트 느낌으로 통일합니다.
// 정적인 사진풍 표현을 피하고, 선화와 색채, 빛의 흐름으로 장면의 움직임을 강조합니다.
const PROMPTS = {
  hero: "Japanese anime key visual, dynamic night scene at a quiet lakeside pavilion, a young traveler walking with a glowing lantern, hair and coat moving in the breeze, cherry blossom petals flying across the foreground, warm lantern light moving across the wooden floor, ripples spreading through the lake, firefly-like light trails, large moon behind layered mountains, elegant traditional pavilion on the right, strong anime background perspective, beautiful clean 2D Japanese anime illustration, hand-drawn linework, cel shading, luminous painted background, expressive lighting, rich indigo blue violet and soft pink palette, cinematic anime composition, lively sense of motion, polished commercial anime artwork, no photorealism, no 3D render, no static postcard feeling, no typography, no writing, no letters, no numbers, no Chinese characters, no Korean characters, no Japanese text, no symbols, no logo, no watermark, no border",
  zodiac: "Japanese anime character illustration, close-up portrait of a charming young Eastern dragon, friendly beautiful face, elegant anime character design, expressive bright eyes, smooth stylized scales, flowing whiskers and mane swept by wind, playful confident expression, dragon turning its head toward the viewer, soft moonlight and glowing particles moving around the face, blue violet and warm gold palette, clean Japanese anime line art, cel shading, polished anime key visual, attractive and magical, cute but not childish, dragon fills most of the frame, dynamic close-up composition, no photorealism, no horror, no monster realism, no gore, no frightening teeth, no typography, no writing, no letters, no numbers, no Chinese characters, no Korean characters, no Japanese text, no zodiac glyphs, no logo, no watermark",
  stars: "Japanese anime background illustration of a vast flowing Milky Way at night, luminous galaxy sweeping diagonally across the sky, dense sparkling stars, violet blue and rose nebula clouds visibly flowing through space, several shooting stars crossing the sky, soft clouds moving above a distant mountain and calm lake, beautiful luminous atmosphere, clean hand-painted Japanese anime background art, refined linework, cel-shaded foreground, rich deep blue and violet palette, cinematic anime composition, magical depth and visible motion, polished commercial anime artwork, not a photograph, no zodiac wheel, no astrology symbols, no glyphs, no typography, no writing, no letters, no numbers, no Chinese characters, no Korean characters, no Japanese text, no logo, no watermark",
  test: "Japanese anime illustration of a thoughtful young adult shown in elegant side-profile silhouette, walking gently through flowing translucent ribbons of lavender violet and muted rose light, hair and clothing moving in a soft breeze, layered shadow shapes drifting around the figure like thoughts, petals and luminous particles moving through the air, beautiful anime rim lighting, clean Japanese anime linework, soft cel shading, hand-painted background, sophisticated emotional anime key visual, graceful proportions, calm mysterious mood, clearly dynamic rather than static, polished commercial anime artwork, no photorealism, no text, no typography, no letters, no numbers, no symbols, no logo, no watermark, no frame",
  lucky: "Japanese anime illustration of a mysterious lucky gift object, elegant crystal orb resting on deep indigo velvet, a warm golden light visibly swirling inside the glass, tiny glowing particles orbiting around it, velvet folds flowing softly as if touched by wind, moving reflections across the glass surface, restrained gold accents, moonlight, clean Japanese anime linework, beautiful cel shading, hand-painted atmospheric background, sophisticated anime key visual, magical luxury mood, dynamic lighting, polished commercial anime artwork, no photorealism, no 3D product render, no Chinese lantern, no coins, no characters, no calligraphy, no typography, no writing, no letters, no numbers, no symbols, no logo, no watermark"
};

function getDateKey(request) {
  const url = new URL(request.url);
  return url.searchParams.get("date") || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
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
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/image" && url.pathname !== "/api/image-health") return env.ASSETS.fetch(request);

    if (url.pathname === "/api/image-health") {
      return json({ ok: Boolean(env.AI && env.ASSETS), aiBinding: Boolean(env.AI), assetsBinding: Boolean(env.ASSETS), model: IMAGE_MODEL });
    }

    if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });

    const type = url.searchParams.get("type") || "hero";
    const prompt = PROMPTS[type];
    if (!prompt) return new Response("Unknown image type", { status: 400 });

    try {
      // 8 step으로 선화와 색감의 디테일을 최대한 살립니다.
      const result = await env.AI.run(IMAGE_MODEL, { prompt, steps: 8 });
      if (!result || typeof result.image !== "string" || !result.image) throw new Error("Workers AI returned no image");

      return new Response(base64ToBytes(result.image), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
          "X-AI-Image-Type": type,
          "X-AI-Image-Source": "cloudflare-workers-ai"
        }
      });
    } catch (error) {
      // 정적 이미지 fallback은 사용하지 않습니다.
      console.error("Workers AI image generation failed", error);
      return new Response("Workers AI image generation failed", { status: 502, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
    }
  }
};
