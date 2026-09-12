// TCFLiCK 운세·심리테스트 사이트 Worker
// 정적 페이지는 Cloudflare ASSETS를 우선 사용하고, 문제가 있으면
// 현재 mira 저장소의 GitHub 원본으로 자동 대체합니다.

const REPO_RAW = 'https://raw.githubusercontent.com/kjh9410065-art/mira/main';

const IMAGE_MAP = {
  hero: '햇살 머무는 바닷가 작업 공간.png',
  quick: [
    '햇살 가득한 카페의 즐거운 모임.png',
    '꿈결 같은 태양 오라클 카드 정원.png',
    '고요한 창가의 타로 카드 정물.png',
    '따뜻한 햇살 아래 온라인 커뮤니티 카페.png'
  ]
};

function contentType(path) {
  const p = path.toLowerCase();
  if (p.endsWith('.html')) return 'text/html; charset=utf-8';
  if (p.endsWith('.css')) return 'text/css; charset=utf-8';
  if (p.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (p.endsWith('.json')) return 'application/json; charset=utf-8';
  if (p.endsWith('.svg')) return 'image/svg+xml';
  if (p.endsWith('.png')) return 'image/png';
  if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg';
  if (p.endsWith('.webp')) return 'image/webp';
  if (p.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}

function imageUrl(name) {
  return encodeURI('/' + name);
}

// 홈페이지의 장식 이미지만 보정합니다. 기능 로직은 건드리지 않습니다.
const IMAGE_SCRIPT = `<script>
(function(){
  const hero=${JSON.stringify(imageUrl(IMAGE_MAP.hero))};
  const quick=${JSON.stringify(IMAGE_MAP.quick.map(imageUrl))};
  function apply(){
    const h=document.querySelector('.hero-art');
    if(h) h.style.setProperty('background-image','url("'+hero+'")','important');
    document.querySelectorAll('.quick-card').forEach(function(card,i){
      if(!quick[i]) return;
      card.style.setProperty('background-image','linear-gradient(rgba(255,255,255,.56),rgba(255,255,255,.56)),url("'+quick[i]+'")','important');
      card.style.setProperty('background-size','cover','important');
      card.style.setProperty('background-position','center','important');
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
})();
</script>`;

// 홈페이지의 일부 인라인 JS가 요소 ID를 전역 변수처럼 사용하는 경우를 안전하게 지원합니다.
const DOM_BRIDGE_SCRIPT = `<script>
(function(){
  ['summaryTitle','summaryText','score','luckyColor','luckyNumber','luckyTime','luckyDirection','luckyItem','money','moneyText','love','loveText','work','workText','health','healthText','zodiacList','categoryTabs','categoryName','categoryCount','testGrid'].forEach(function(id){
    const el=document.getElementById(id);
    if(el && !(id in window)) window[id]=el;
  });
})();
</script>`;

async function getAsset(request, env) {
  const incoming = new URL(request.url);
  let path = decodeURIComponent(incoming.pathname);
  if (path === '/') path = '/index.html';
  if (path.endsWith('/')) path += 'index.html';

  // 1. Cloudflare 정적 자산을 먼저 확인합니다.
  if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
    try {
      const assetRequest = new Request(new URL(path, incoming.origin), request);
      const response = await env.ASSETS.fetch(assetRequest);
      if (response.status !== 404) return response;
    } catch (error) {
      console.error('ASSETS:', error);
    }
  }

  // 2. ASSETS에서 못 찾으면 mira GitHub 원본을 사용합니다.
  const rawUrl = REPO_RAW + encodeURI(path);
  try {
    const raw = await fetch(rawUrl, { cf: { cacheTtl: 0, cacheEverything: false } });
    if (!raw.ok) return raw;
    const headers = new Headers(raw.headers);
    headers.set('Content-Type', contentType(path));
    headers.set('Cache-Control', path.endsWith('.html') ? 'no-store' : 'public, max-age=300');
    return new Response(raw.body, { status: 200, headers });
  } catch (error) {
    console.error('GitHub fallback:', error);
    return new Response('MIRA static asset unavailable', { status: 503 });
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function generateGeminiImage(request, env, forcedPrompt = '') {
  if (!env.GEMINI_API_KEY) {
    return jsonResponse({ error: 'GEMINI_API_KEY가 Cloudflare Secret에 등록되어 있지 않습니다.' }, 500);
  }

  let body = {};
  if (request.method === 'POST') {
    try { body = await request.json(); }
    catch { return jsonResponse({ error: '요청 형식이 올바르지 않습니다.' }, 400); }
  }

  const prompt = forcedPrompt || (typeof body.prompt === 'string' ? body.prompt.trim() : '');
  if (!prompt) return jsonResponse({ error: 'prompt가 필요합니다.' }, 400);

  const endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-image:generateContent';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'] }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    return jsonResponse({
      error: 'Gemini 이미지 생성에 실패했습니다.',
      detail: data?.error?.message || 'Gemini API 오류'
    }, response.status);
  }

  const part = (data?.candidates?.[0]?.content?.parts || []).find(x => x?.inlineData?.data);
  if (!part) return jsonResponse({ error: 'Gemini 응답에서 생성된 이미지를 찾지 못했습니다.' }, 502);

  return jsonResponse({
    success: true,
    mimeType: part.inlineData.mimeType || 'image/png',
    imageBase64: part.inlineData.data
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 이미지 테스트 API
    if (url.pathname === '/api/test-image') {
      if (request.method !== 'GET') return jsonResponse({ error: 'GET 요청만 사용할 수 있습니다.' }, 405);
      try {
        const result = await generateGeminiImage(
          request,
          env,
          'Create one single standalone website illustration asset for a Korean fortune and psychology test website. A calm pastel anime editorial illustration of a young woman at a cozy desk beside a fluffy cat, lavender, blush pink and cream palette, gentle light, refined 2D/2.5D illustration, no text, no UI, no logos, no watermark, no collage.'
        );
        const data = await result.json();
        if (!data.success) return jsonResponse(data, result.status);
        const binary = Uint8Array.from(atob(data.imageBase64), c => c.charCodeAt(0));
        return new Response(binary, {
          headers: {
            'Content-Type': data.mimeType,
            'Cache-Control': 'no-store'
          }
        });
      } catch (error) {
        console.error(error);
        return jsonResponse({ error: '테스트 이미지 생성 중 서버 오류가 발생했습니다.' }, 500);
      }
    }

    // 이미지 생성 API
    if (url.pathname === '/api/generate-image') {
      if (request.method !== 'POST') return jsonResponse({ error: 'POST 요청만 사용할 수 있습니다.' }, 405);
      try {
        return await generateGeminiImage(request, env);
      } catch (error) {
        console.error(error);
        return jsonResponse({ error: '이미지 생성 중 서버 오류가 발생했습니다.' }, 500);
      }
    }

    // 모든 일반 요청은 정적 자산 처리기로 보냅니다.
    const response = await getAsset(request, env);
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html') || response.status !== 200) return response;

    const html = await response.text();
    if (!html.includes('</head>')) return new Response(html, {
      status: response.status,
      headers: new Headers(response.headers)
    });

    // 홈페이지/HTML의 기존 기능을 유지하면서 필요한 보정 코드만 삽입합니다.
    const updated = html.replace('</head>', IMAGE_SCRIPT + DOM_BRIDGE_SCRIPT + '</head>');
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('Cache-Control', 'no-store');
    return new Response(updated, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
