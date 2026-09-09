// 홈 화면의 이미지 연결만 관리합니다. 레이아웃/텍스트/버튼은 건드리지 않습니다.
const IMAGE_MAP = {
  // 히어로: 현재보다 밝고 넓은 공간감의 이미지로 교체
  hero: '햇살 머무는 바닷가 작업 공간.png',
  // 현재 홈 카드 순서: 띠 운세 / 별자리 운세 / 심리테스트 / 행운의 아이템
  quick: [
    '햇살 가득한 카페의 즐거운 모임.png',
    '꿈결 같은 태양 오라클 카드 정원.png',
    '고요한 창가의 타로 카드 정물.png',
    '따뜻한 햇살 아래 온라인 커뮤니티 카페.png'
  ]
};

function assetUrl(name) {
  // 한글 파일명을 안전하게 URL로 변환합니다.
  return encodeURI('/' + name);
}

// 실제 페이지의 이미지 부분만 교체하는 스크립트입니다.
const IMAGE_SCRIPT = `<script>
(function(){
  const heroUrl=${JSON.stringify(assetUrl(IMAGE_MAP.hero))};
  const quickUrls=${JSON.stringify(IMAGE_MAP.quick.map(assetUrl))};

  function applyImages(){
    const hero=document.querySelector('.hero-art');
    if(hero){
      hero.style.setProperty('background-image','url("'+heroUrl+'")','important');
      hero.style.setProperty('background-size','cover','important');
      hero.style.setProperty('background-position','center','important');
      hero.style.setProperty('background-repeat','no-repeat','important');
    }

    document.querySelectorAll('.quick-card').forEach(function(card,index){
      const image=quickUrls[index];
      if(!image) return;
      // 카드의 기존 흰 배경을 살짝 투명하게 만들어 이미지가 보이게 합니다.
      card.style.setProperty('background-image','linear-gradient(rgba(255,255,255,.56),rgba(255,255,255,.56)),url("'+image+'")','important');
      card.style.setProperty('background-size','cover','important');
      card.style.setProperty('background-position','center','important');
      card.style.setProperty('background-repeat','no-repeat','important');
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',applyImages,{once:true});
  }else{
    applyImages();
  }
  setTimeout(applyImages,300);
  setTimeout(applyImages,1000);
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

    // 정적 HTML을 가져온 뒤 이미지 연결 코드만 삽입합니다.
    const response=await env.ASSETS.fetch(request);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')) return response;
    const html=await response.text();
    const updated=html.replace('</head>',IMAGE_SCRIPT+'</head>');
    return new Response(updated,{status:response.status,statusText:response.statusText,headers:new Headers(response.headers)});
  }
};
