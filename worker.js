// Cloudflare Worker가 사이트의 동적 AI 이미지만 생성합니다.
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

// 승인된 홈페이지 시안과 같은 미술 방향을 유지합니다.
// 각 메뉴가 한눈에 구분되도록 주제와 구도를 강하게 지정하고 불필요한 문자 생성을 차단합니다.
const PROMPTS = {
  hero: "Premium cinematic Korean lifestyle editorial artwork for a sophisticated fortune website, a serene midnight lake surrounded by layered blue mountains, a traditional wooden lakeside pavilion on the right edge with warm paper lantern light, delicate pale pink cherry blossom branches framing the upper right corner, one small black cat silhouette sitting beside the lantern on the wooden deck, a luminous full moon reflected across the water, deep indigo navy and muted violet night palette, subtle mist, realistic atmospheric depth, elegant luxury magazine art direction, cinematic photography quality blended with refined digital painting, rich natural lighting, highly polished, calm mysterious premium mood, clean composition, no people, no text, no typography, no letters, no numbers, no Korean characters, no Chinese characters, no Japanese characters, no symbols, no logo, no watermark, no border, no frame",
  zodiac: "Premium close-up editorial fantasy portrait for a modern Korean fortune website, the head and face of ONE magnificent East Asian dragon filling most of the frame, detailed silver-white scales, elegant long horns, expressive amber eye, fine whiskers, refined powerful features, soft moonlight illuminating the dragon from the side, a luminous full moon softly blurred in the background, deep indigo and plum night atmosphere, cinematic shallow depth of field, sophisticated luxury magazine art direction, highly detailed realistic digital painting, dramatic but elegant, intimate close-up composition, the dragon head is the unmistakable focal point, no other animals, no group of animals, no poster layout, no circular chart, no Chinese painting lettering, no typography, no writing, no letters, no numbers, no Korean characters, no Chinese characters, no Japanese characters, no zodiac glyphs, no logo, no watermark, no border",
  stars: "Premium cinematic Milky Way landscape for a modern Korean astrology website, a spectacular bright Milky Way galaxy sweeping diagonally across a deep midnight sky above a quiet dark mountain lake, dense field of natural stars, luminous galactic core with blue violet and soft pink nebulae, subtle moonlit mountains and water reflection below, sophisticated long-exposure astrophotography aesthetic blended with refined digital painting, rich depth, elegant composition, luxurious magazine art direction, realistic natural star field, dreamy but believable, no zodiac wheel, no constellation diagram, no astrology symbols, no glyphs, no text, no typography, no writing, no letters, no numbers, no Korean characters, no Chinese characters, no Japanese characters, no logo, no watermark, no border",
  test: "Premium editorial silhouette portrait for a modern Korean psychological personality test, a single human side profile facing left, shown only as a dark elegant silhouette with no facial details, soft lavender rim light around the head and shoulders, translucent flowing layers of muted rose, violet and pale lavender behind and around the silhouette, delicate blurred cherry blossom atmosphere, cinematic backlighting, sophisticated contemporary Korean magazine art direction, tasteful minimal composition, calm introspective mood, premium digital painting, beautiful soft depth and texture, unmistakably a side-profile silhouette, no visible face details, no text, no typography, no letters, no numbers, no symbols, no logo, no watermark, no border",
  lucky: "Premium luxury editorial product photograph for a modern Korean fortune website, one elegant glass crystal orb centered on dark indigo velvet fabric, a small warm golden glowing object suspended inside the transparent orb, refined metallic base, subtle tiny golden reflections around it, dramatic soft studio lighting, deep navy background, rich material detail, realistic glass and velvet texture, sophisticated luxury product campaign, clean minimal composition, cinematic depth, polished professional photography, mysterious but tasteful, no lantern, no Chinese ornament, no coins, no characters, no calligraphy, no text, no typography, no letters, no numbers, no symbols, no logo, no watermark, no border"
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
      // FLUX.1 schnell은 최대 8 step을 지원하므로 품질을 우선해 8 step으로 생성합니다.
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
      // 정적 이미지 fallback은 사용하지 않습니다. AI 생성에 실패하면 해당 영역을 비워 둡니다.
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
