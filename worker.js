// Cloudflare Workers AI에서 생성된 이미지만 화면에 넣는 이미지 로더입니다.
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

// 사이트 전체 이미지를 일본 애니메이션 일러스트로 통일합니다.
// 일본풍 작화만 사용하고 이미지 안에는 어떤 언어의 문자도 생성하지 않도록 강하게 제한합니다.
const PROMPTS = {
  hero: "Japanese anime illustration style only, modern Korean fortune website hero key visual, beautiful sunset seen from a quiet rooftop above a Japanese-style town, a young person sitting beside a calm black cat and looking toward the glowing horizon, backpack and a few books resting nearby, warm orange pink and violet sky, several shooting stars crossing the evening sky, distant mountains and city lights, a hanging paper lantern moving gently in the breeze, cherry blossom branches swaying at the edge of the rooftop, hair and clothing subtly moving in the wind, reflective peaceful coming-of-age mood, clean hand-drawn Japanese anime linework, cel shading, richly painted anime background, cinematic perspective, beautiful color grading, polished commercial Japanese anime illustration, dynamic atmosphere and layered depth, NO TEXT OF ANY KIND, absolutely no Japanese writing, no kana, no kanji, no Chinese characters, no Korean characters, no Hangul, no English, no Latin letters, no numbers, no typography, no captions, no signs, no labels, no logo, no watermark, no readable marks, no symbols, no border, no text on buildings, no text on books, no text on lantern",
  zodiac: "Japanese anime illustration style only, close-up of a beautiful elegant Eastern dragon shown in three-quarter profile looking clearly toward the LEFT side of the frame, head and neck angled left, long flowing mane and whiskers sweeping backward in the wind toward the right, expressive friendly blue eyes, refined anime dragon design, graceful stylized scales, soft youthful face, calm confident expression, pale blue and white body with subtle warm golden highlights, moonlit sky behind the dragon, drifting luminous particles and flowing clouds, clean hand-drawn Japanese anime linework, polished cel shading, cinematic close-up, sophisticated commercial Japanese anime artwork, charming rather than frightening, NO TEXT OF ANY KIND, absolutely no Japanese writing, no kana, no kanji, no Chinese characters, no Korean characters, no English, no letters, no numbers, no zodiac glyphs, no typography, no logo, no watermark",
  stars: "Japanese anime illustration style only, vast luminous Milky Way sweeping diagonally across a deep blue and violet night sky, dense sparkling stars and colorful rose violet nebula clouds flowing like a river, multiple shooting stars streaking across the sky, soft moving cloud layers, distant mountains and a calm lake reflecting the galaxy, tiny solitary figure sitting by the water for scale, rich hand-painted Japanese anime background, clean atmospheric linework, cel-shaded foreground, cinematic depth, luminous magical mood, polished commercial Japanese anime artwork, energetic flowing sky rather than a static astronomy photograph, NO TEXT OF ANY KIND, absolutely no Japanese writing, no kana, no kanji, no Chinese characters, no Korean characters, no English, no letters, no numbers, no zodiac wheel, no astrology symbols, no glyphs, no typography, no logo, no watermark",
  test: "Japanese anime illustration style only, psychological personality test key visual, elegant young woman shown in side profile as a dark silhouette, facing LEFT, long hair and loose strands flowing gently in the wind, standing against a soft pink lavender sunset with translucent flowing ribbons of light and drifting cherry blossom petals, subtle moving particles and layered shadows suggesting thoughts and emotions, beautiful rim light around the silhouette, clean hand-drawn Japanese anime linework, refined cel shading, soft painted background, sophisticated emotional anime artwork, calm mysterious mood, cinematic composition, polished commercial Japanese anime illustration, NO TEXT OF ANY KIND, absolutely no Japanese writing, no kana, no kanji, no Chinese characters, no Korean characters, no English, no letters, no numbers, no symbols, no typography, no logo, no watermark",
  lucky: "Japanese anime illustration style only, beautiful mysterious lucky crystal orb on deep indigo velvet, a warm golden star-shaped light glowing and gently swirling inside the transparent orb, tiny luminous particles orbiting the glass, soft flower petals drifting around it, subtle moving reflections on the glass and flowing velvet folds, moonlit blue and violet atmosphere with restrained gold accents, clean hand-drawn Japanese anime linework, polished cel shading, richly painted background, elegant magical luxury mood, cinematic lighting, dynamic atmosphere, commercial Japanese anime artwork, NO TEXT OF ANY KIND, absolutely no Japanese writing, no kana, no kanji, no Chinese characters, no Korean characters, no English, no letters, no numbers, no symbols, no calligraphy, no typography, no logo, no watermark"
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
      console.error("Workers AI image generation failed", error);
      return new Response("Workers AI image generation failed", { status: 502, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
    }
  }
};
