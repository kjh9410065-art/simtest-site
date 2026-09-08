// Cloudflare Workers AI에서 생성된 이미지만 화면에 넣는 이미지 로더입니다.
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

// 사이트 전체 이미지를 애니메이션 영화풍으로 통일합니다.
// 정물처럼 보이는 구도 대신 움직임이 느껴지는 장면을 사용합니다.
const PROMPTS = {
  hero: "Premium Korean animation film key visual, cinematic moving scene at a moonlit lakeside pavilion, a young traveler walking naturally while holding a glowing lantern, coat and hair flowing in the night breeze, cherry blossom petals sweeping dynamically through the air, warm lantern light streaks, ripples spreading across the lake, firefly light trails, moonlight reflecting on moving water, layered mountains and elegant wooden pavilion, strong depth and cinematic perspective, beautiful modern 2D animated feature film aesthetic, sophisticated Korean animation concept art, hand-painted backgrounds, expressive atmospheric lighting, refined indigo violet and soft pink palette, lively sense of motion, premium web editorial composition, no static postcard feeling, no photorealism, no typography, no writing, no letters, no numbers, no Chinese characters, no Korean characters, no Japanese characters, no symbols, no logo, no watermark, no border",
  zodiac: "Premium 2D animated fantasy film illustration, close-up of a charming young Eastern dragon turning its head toward the viewer as if caught in motion, flowing mane and whiskers lifted by wind, expressive bright friendly eyes, elegant stylized scales, soft rounded facial design, playful confident expression, one visible sweep of the neck and mane creating motion, moonlit blue and violet atmosphere with warm highlights, dynamic cinematic close-up composition, dragon filling the frame, polished hand-painted animation concept art, beautiful Korean animation movie aesthetic, magical and appealing, cute without being childish, no horror, no monster realism, no gore, no frightening teeth, no photorealism, no typography, no writing, no letters, no numbers, no Chinese characters, no Korean characters, no Japanese characters, no zodiac glyphs, no logo, no watermark",
  stars: "Premium 2D animated cinematic night-sky illustration, enormous flowing Milky Way sweeping dynamically across the sky like a luminous river, stars visibly streaking and drifting through space, colorful violet blue rose nebula clouds curling through the composition, several shooting stars crossing the sky, soft moving cloud layers above a distant mountain and dark lake, magical atmospheric depth, elegant modern animation film background art, hand-painted celestial effects, sophisticated Korean animation concept art, immersive wide composition, luminous but refined, clearly energetic and alive rather than a static astronomy photograph, no zodiac wheel, no astrology symbols, no glyphs, no typography, no writing, no letters, no numbers, no Chinese characters, no Korean characters, no Japanese characters, no logo, no watermark",
  test: "Premium 2D animated psychological illustration, elegant side-profile silhouette of a young adult walking slowly through flowing translucent ribbons of lavender violet and muted rose light, hair and clothing subtly moving in a gentle breeze, layered shadow shapes drifting around the figure like thoughts, soft petals and light particles moving through the scene, cinematic rim light, sophisticated hand-painted animation film aesthetic, refined Korean animation concept art, graceful human proportions, emotional but calm, dynamic composition with visible motion, no photorealism, no text, no typography, no letters, no numbers, no symbols, no logo, no watermark, no frame",
  lucky: "Premium 2D animated fantasy illustration of a beautiful lucky gift object in motion, an elegant crystal orb resting on deep indigo velvet while a small warm golden light swirls and rises inside it, tiny glowing particles orbiting the orb, velvet folds flowing softly as if touched by a breeze, subtle reflections moving across the glass, restrained gold accents, cinematic moonlight, sophisticated hand-painted animation film aesthetic, polished Korean animation concept art, luxurious but magical, dynamic lighting and atmospheric motion, clean premium composition, no photorealism, no Chinese lantern, no coins, no characters, no calligraphy, no typography, no writing, no letters, no numbers, no symbols, no logo, no watermark"
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

    // 이미지 API가 아닌 요청은 Cloudflare Assets에서 사이트를 제공합니다.
    if (url.pathname !== "/api/image" && url.pathname !== "/api/image-health") return env.ASSETS.fetch(request);

    if (url.pathname === "/api/image-health") {
      return json({ ok: Boolean(env.AI && env.ASSETS), aiBinding: Boolean(env.AI), assetsBinding: Boolean(env.ASSETS), model: IMAGE_MODEL });
    }

    if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });

    const type = url.searchParams.get("type") || "hero";
    const prompt = PROMPTS[type];
    if (!prompt) return new Response("Unknown image type", { status: 400 });

    try {
      // 최대 8 step으로 애니메이션 일러스트의 디테일을 우선합니다.
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
