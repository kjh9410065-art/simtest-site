// Cloudflare Workers AI에서 생성된 이미지만 화면에 넣는 이미지 로더입니다.
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

// 사이트 전체의 그림 톤을 통일하면서 각 카드의 역할이 명확하게 보이도록 구성합니다.
const PROMPTS = {
  // 메인은 단순한 풍경이 아니라 바람, 빛, 움직임이 느껴지는 장면으로 구성합니다.
  hero: "Premium Korean lifestyle web editorial key visual, dynamic cinematic fantasy night scene, a graceful traveler walking across a wooden lakeside pavilion while holding a glowing lantern, long coat and hair gently flowing in the wind, cherry blossom petals visibly sweeping across the scene, luminous firefly-like particles trailing through the air, large moon behind layered mountains, deep indigo lake with bright moving reflections, subtle lavender mist, elegant traditional pavilion framing the right side, strong foreground-midground-background depth, dramatic but calm sense of motion, sophisticated contemporary Korean digital illustration, polished luxury magazine art direction, cinematic lighting, painterly realism with a refined animated-film atmosphere, visually rich but uncluttered, no typography, no writing, no letters, no numbers, no Chinese characters, no Korean characters, no Japanese characters, no symbols, no logo, no watermark, no border, no frame",

  // 띠 운세는 무서운 실사 용이 아니라 매력적인 애니메이션 영화풍 용의 얼굴 클로즈업으로 변경합니다.
  zodiac: "Premium animated fantasy film illustration, close-up portrait of a beautiful friendly Eastern dragon head, elegant youthful dragon design, expressive warm eyes, smooth stylized scales, refined flowing whiskers and mane, slightly playful confident expression, soft moonlight along the face, luminous blue and violet atmosphere, subtle warm highlights, dramatic close-up composition, dragon filling most of the frame, sophisticated Japanese animation film aesthetic blended with modern Korean web editorial art direction, highly polished character illustration, magical but not scary, charming rather than monstrous, clean refined shapes, cinematic depth, no gore, no horror, no aggressive teeth, no frightening expression, no typography, no writing, no letters, no numbers, no Chinese characters, no Korean characters, no Japanese characters, no zodiac glyphs, no logo, no watermark",

  // 별자리는 현재 은하수 이미지의 방향을 유지하되 조금 더 깊고 풍부하게 만듭니다.
  stars: "Premium cinematic astronomy illustration for a modern Korean lifestyle website, vast luminous Milky Way stretching diagonally across a deep midnight sky, dense layers of tiny stars and colorful cosmic dust, subtle violet blue and rose nebula clouds, distant mountain ridge and calm dark lake at the bottom, gentle atmospheric glow, realistic astronomical depth combined with refined digital painting, sophisticated luxury magazine art direction, immersive wide composition, elegant and peaceful, no zodiac wheel, no astrology symbols, no glyphs, no typography, no writing, no letters, no numbers, no Chinese characters, no Korean characters, no Japanese characters, no logo, no watermark",

  // 심리테스트는 현재 방향을 유지합니다.
  test: "Premium editorial illustration for a psychological personality test, elegant side-profile silhouette of a thoughtful young adult surrounded by translucent layered shapes, flowing ribbons of lavender, violet and muted rose, subtle moonlight, abstract reflections suggesting thoughts and emotions, sophisticated contemporary Korean magazine illustration, tasteful human proportions, clean composition, premium digital painting, soft cinematic lighting, calm intelligent mood, no text, no typography, no letters, no numbers, no symbols, no logo, no watermark, no frame",

  // 행운의 아이템은 현재 이미지 방향을 유지합니다.
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
