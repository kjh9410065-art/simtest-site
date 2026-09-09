// 홈 화면 이미지 연결 + 이미지 업로드 브리지입니다.
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
  // 한글 파일명을 안전하게 URL로 변환합니다.
  return encodeURI('/' + name);
}

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
      card.style.setProperty('background-image','linear-gradient(rgba(255,255,255,.56),rgba(255,255,255,.56)),url("'+image+'")','important');
      card.style.setProperty('background-size','cover','important');
      card.style.setProperty('background-position','center','important');
      card.style.setProperty('background-repeat','no-repeat','important');
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyImages,{once:true});
  else applyImages();
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

// Cloudflare Worker에서 GitHub에 바이너리 이미지를 직접 커밋합니다.
// GITHUB_TOKEN Secret이 있어야 하며, 이미지 생성 결과를 이 엔드포인트로 전달할 수 있습니다.
async function uploadImageToGitHub(request, env) {
  if (request.method !== 'POST') return jsonResponse({error:'POST 요청만 사용할 수 있습니다.'},405);
  if (!env.GITHUB_TOKEN) return jsonResponse({error:'GITHUB_TOKEN이 Cloudflare Secret에 등록되어 있지 않습니다.'},500);

  const form = await request.formData();
  const file = form.get('file');
  const requestedName = String(form.get('name') || (file && file.name) || '');
  if (!(file instanceof File) || !requestedName) return jsonResponse({error:'file과 name이 필요합니다.'},400);

  // 경로 탈출과 특수문자를 막고 assets/incoming 아래에만 저장합니다.
  const safeName = requestedName.replace(/[^\w가-힣.()\- ]/g,'_').trim();
  if (!safeName || !/\.(png|jpe?g|webp|gif)$/i.test(safeName)) {
    return jsonResponse({error:'png, jpg, jpeg, webp, gif 이미지만 업로드할 수 있습니다.'},400);
  }
  if (file.size > 8 * 1024 * 1024) return jsonResponse({error:'이미지는 8MB 이하로 업로드해주세요.'},413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i=0; i<bytes.length; i+=chunk) binary += String.fromCharCode(...bytes.subarray(i,i+chunk));
  const content = btoa(binary);
  const path = `assets/incoming/${safeName}`;
  const apiUrl = `https://api.github.com/repos/kjh9410065-art/simtest-site/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}`;

  // 같은 파일명이 이미 있으면 현재 SHA를 먼저 조회해 업데이트합니다.
  let sha;
  const existing = await fetch(apiUrl, {
    headers:{Authorization:`Bearer ${env.GITHUB_TOKEN}`,'User-Agent':'FLiCK-image-bridge','Accept':'application/vnd.github+json'}
  });
  if (existing.ok) {
    const existingData = await existing.json();
    sha = existingData.sha;
  }

  const payload = {message:`Upload site image: ${safeName}`,content,branch:'main'};
  if (sha) payload.sha = sha;
  const response = await fetch(apiUrl, {
    method:'PUT',
    headers:{Authorization:`Bearer ${env.GITHUB_TOKEN}`,'User-Agent':'FLiCK-image-bridge','Accept':'application/vnd.github+json','Content-Type':'application/json'},
    body:JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) return jsonResponse({error:'GitHub 이미지 업로드에 실패했습니다.',detail:data?.message||'GitHub API 오류'},response.status);
  return jsonResponse({success:true,path,commit:data?.commit?.sha||null,message:'GitHub 업로드 완료'});
}

function jsonResponse(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}});
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);

    if (url.pathname==='/api/upload-image') {
      try { return await uploadImageToGitHub(request,env); }
      catch(e){ console.error(e); return jsonResponse({error:'이미지 업로드 중 서버 오류가 발생했습니다.'},500); }
    }

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

    const response=await env.ASSETS.fetch(request);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')) return response;
    const html=await response.text();
    const updated=html.replace('</head>',IMAGE_SCRIPT+'</head>');
    return new Response(updated,{status:response.status,statusText:response.statusText,headers:new Headers(response.headers)});
  }
};
