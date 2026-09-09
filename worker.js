// Cloudflare Worker에서 홈 이미지 연결을 처리합니다.
// Cloudflare Assets에서 한글 파일명이 제대로 제공되지 않는 경우를 피하기 위해
// 공개 GitHub 원본 파일을 이미지 주소로 직접 사용합니다.

const IMAGE_MAP = {
  hero: '바다를 품은 아늑한 카페 공간.png',
  quick: [
    '고요한 창가의 타로 카드 정물.png',
    '꽃잎 흩날리는 호숫가의 봄 풍경.png',
    '바다를 품은 아늑한 카페 공간.png',
    '따뜻한 햇살 아래 온라인 커뮤니티 카페.png'
  ]
};

// GitHub에 저장된 실제 이미지 파일의 공개 원본 주소를 만듭니다.
function assetUrl(name) {
  return 'https://raw.githubusercontent.com/kjh9410065-art/simtest-site/main/' + encodeURIComponent(name);
}

// 실제 홈 화면 요소에 이미지 스타일을 직접 적용합니다.
const IMAGE_SCRIPT = `<script>
(function(){
  const heroUrl=${JSON.stringify(assetUrl(IMAGE_MAP.hero))};
  const quickUrls=${JSON.stringify(IMAGE_MAP.quick.map(assetUrl))};

  function apply(){
    // 히어로 영역에 대표 이미지를 강제로 적용합니다.
    const hero=document.querySelector('.hero-art');
    if(hero){
      hero.style.setProperty('background-image','url("'+heroUrl+'")','important');
      hero.style.setProperty('background-size','cover','important');
      hero.style.setProperty('background-position','center','important');
      hero.style.setProperty('background-repeat','no-repeat','important');
    }

    // 상단 바로가기 카드 4개에 각각 다른 이미지를 적용합니다.
    document.querySelectorAll('.quick-card').forEach(function(card,i){
      if(!quickUrls[i]) return;
      card.style.setProperty('background-image','linear-gradient(rgba(255,255,255,.58),rgba(255,255,255,.58)),url("'+quickUrls[i]+'")','important');
      card.style.setProperty('background-size','cover','important');
      card.style.setProperty('background-position','center','important');
      card.style.setProperty('background-repeat','no-repeat','important');
    });
  }

  // DOM이 만들어진 뒤 적용하고, 페이지 내부에서 홈 화면이 다시 렌더링되는 경우도 대비합니다.
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  setTimeout(apply,300);
  setTimeout(apply,1000);
  setTimeout(apply,2000);
})();
</script>`;

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
  const r = await fetch(endpoint, {
    method:'POST',
    headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
    body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseModalities:['IMAGE']}})
  });
  const data = await r.json();
  if (!r.ok) return jsonResponse({error:'Gemini 이미지 생성에 실패했습니다.',detail:data?.error?.message||'Gemini API 오류'},r.status);
  const part=(data?.candidates?.[0]?.content?.parts||[]).find(x=>x?.inlineData?.data);
  if (!part) return jsonResponse({error:'Gemini 응답에서 생성된 이미지를 찾지 못했습니다.'},502);
  return jsonResponse({success:true,mimeType:part.inlineData.mimeType||'image/png',imageBase64:part.inlineData.data});
}

function jsonResponse(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
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
      }catch(e){
        console.error(e);
        return jsonResponse({error:'테스트 이미지 생성 중 서버 오류가 발생했습니다.'},500);
      }
    }

    if(url.pathname==='/api/generate-image'){
      if(request.method!=='POST') return jsonResponse({error:'POST 요청만 사용할 수 있습니다.'},405);
      try{return await generateGeminiImage(request,env);}catch(e){console.error(e);return jsonResponse({error:'이미지 생성 중 서버 오류가 발생했습니다.'},500);}
    }

    // 정적 사이트 HTML을 가져온 뒤 이미지 연결 스크립트를 삽입합니다.
    const response=await env.ASSETS.fetch(request);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')) return response;
    const html=await response.text();
    const updated=html.replace('</head>',IMAGE_SCRIPT+'</head>');
    return new Response(updated,{status:response.status,statusText:response.statusText,headers:new Headers(response.headers)});
  }
};
