// TCFLiCK 운세·심리테스트 사이트의 Cloudflare Worker입니다.
// 정적 파일은 우선 ASSETS에서 제공하고, ASSETS 바인딩이 없는 환경에서는
// 현재 GitHub 저장소의 raw 파일로 자동 대체하여 빈 화면을 방지합니다.

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

function assetUrl(name) {
  return encodeURI('/' + name);
}

const IMAGE_SCRIPT = `<script>
(function(){
  const heroUrl=${JSON.stringify(assetUrl(IMAGE_MAP.hero))};
  const quickUrls=${JSON.stringify(IMAGE_MAP.quick.map(assetUrl))};
  function applyImages(){
    const hero=document.querySelector('.hero-art');
    if(hero) hero.style.setProperty('background-image','url(\"'+heroUrl+'\")','important');
    document.querySelectorAll('.quick-card').forEach(function(card,index){
      if(!quickUrls[index]) return;
      card.style.setProperty('background-image','linear-gradient(rgba(255,255,255,.56),rgba(255,255,255,.56)),url(\"'+quickUrls[index]+'\")','important');
      card.style.setProperty('background-size','cover','important');
      card.style.setProperty('background-position','center','important');
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyImages,{once:true});
  else applyImages();
})();
</script>`;

// 홈페이지의 인라인 스크립트가 ID를 전역 변수처럼 참조해도 안전하게 동작하도록
// 실제 DOM 요소를 명시적으로 window 속성에 연결합니다.
const DOM_BRIDGE_SCRIPT = `<script>
(function(){
  const ids=['summaryTitle','summaryText','score','luckyColor','luckyNumber','luckyTime','luckyDirection','luckyItem','money','moneyText','love','loveText','work','workText','health','healthText','zodiacList','categoryTabs','categoryName','categoryCount','testGrid'];
  ids.forEach(function(id){
    const el=document.getElementById(id);
    if(el && !(id in window)) window[id]=el;
  });
})();
</script>`;

function contentType(path) {
  if (path.endsWith('.html')) return 'text/html; charset=utf-8';
  if (path.endsWith('.css')) return 'text/css; charset=utf-8';
  if (path.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (path.endsWith('.json')) return 'application/json; charset=utf-8';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}

// ASSETS가 정상 작동하면 그대로 사용하고, 실패하면 GitHub 원본으로 대체합니다.
async function getStaticAsset(request, env) {
  const url = new URL(request.url);
  let path = decodeURIComponent(url.pathname);
  if (path === '/') path = '/index.html';
  else if (path.endsWith('/')) path += 'index.html';

  if (env?.ASSETS?.fetch) {
    try {
      const response = await env.ASSETS.fetch(request.url === url.href && path === '/index.html'
        ? new Request(new URL('/index.html', request.url), request)
        : request);
      if (response.status !== 404) return response;
    } catch (error) {
      console.error('ASSETS fetch failed:', error);
    }
  }

  const rawUrl = REPO_RAW + encodeURI(path);
  const rawResponse = await fetch(rawUrl);
  if (!rawResponse.ok) return rawResponse;

  const headers = new Headers(rawResponse.headers);
  headers.set('Content-Type', contentType(path));
  headers.set('Cache-Control', 'public, max-age=300');
  return new Response(rawResponse.body, { status: 200, headers });
}

async function generateGeminiImage(request, env, forcedPrompt = '') {
  if (!env.GEMINI_API_KEY) return jsonResponse({ error: 'GEMINI_API_KEY가 Cloudflare Secret에 등록되어 있지 않습니다.' }, 500);
  let body = {};
  if (request.method === 'POST') {
    try { body = await request.json(); }
    catch { return jsonResponse({ error: '요청 형식이 올바르지 않습니다.' }, 400); }
  }
  const prompt = forcedPrompt || (typeof body?.prompt === 'string' ? body.prompt.trim() : '');
  if (!prompt) return jsonResponse({ error: 'prompt가 필요합니다.' }, 400);
  const endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-image:generateContent';
  const response = await fetch(endpoint, {
    method:'POST',
    headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
    body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseModalities:['IMAGE']}})
  });
  const data = await response.json();
  if (!response.ok) return jsonResponse({error:'Gemini 이미지 생성에 실패했습니다.',detail:data?.error?.message||'Gemini API 오류'},response.status);
  const part=(data?.candidates?.[0]?.content?.parts||[]).find(x=>x?.inlineData?.data);
  if (!part) return jsonResponse({error:'Gemini 응답에서 생성된 이미지를 찾지 못했습니다.'},502);
  return jsonResponse({success:true,mimeType:part.inlineData.mimeType||'image/png',imageBase64:part.inlineData.data});
}

function jsonResponse(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}});
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);

    if(url.pathname==='/api/test-image'){
      if(request.method!=='GET') return jsonResponse({error:'GET 요청만 사용할 수 있습니다.'},405);
      try{
        const result=await generateGeminiImage(request,env,`Create one single standalone website illustration asset for a Korean fortune and psychology test website. A calm pastel anime editorial illustration of a young woman at a cozy desk beside a fluffy cat, lavender, blush pink and cream palette, gentle light, refined 2D/2.5D illustration, no text, no UI, no logos, no watermark, no collage.`);
        const data=await result.json();
        if(!data.success) return new Response(JSON.stringify(data),{status:result.status,headers:{'Content-Type':'application/json; charset=utf-8'}});
        const binary=Uint8Array.from(atob(data.imageBase64),c=>c.charCodeAt(0));
        return new Response(binary,{headers:{'Content-Type':data.mimeType,'Cache-Control':'no-store'}});
      }catch(e){ console.error(e); return jsonResponse({error:'테스트 이미지 생성 중 서버 오류가 발생했습니다.'},500); }
    }

    if(url.pathname==='/api/generate-image'){
      if(request.method!=='POST') return jsonResponse({error:'POST 요청만 사용할 수 있습니다.'},405);
      try{return await generateGeminiImage(request,env);}catch(e){console.error(e);return jsonResponse({error:'이미지 생성 중 서버 오류가 발생했습니다.'},500);}
    }

    const response = await getStaticAsset(request, env);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')) return response;

    const html=await response.text();
    if(response.status!==200 || !html.includes('</head>')) {
      return new Response(html,{status:response.status,statusText:response.statusText,headers:new Headers(response.headers)});
    }
    const updated=html.replace('</head>',IMAGE_SCRIPT+DOM_BRIDGE_SCRIPT+'</head>');
    return new Response(updated,{status:response.status,statusText:response.statusText,headers:new Headers(response.headers)});
  }
};
