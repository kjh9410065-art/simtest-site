// TCFLiCK 운세·심리테스트 사이트 Worker
// 정적 파일을 안정적으로 제공하고, 홈페이지의 ID 전역변수 오류를 보정합니다.

const REPO_RAW = 'https://raw.githubusercontent.com/kjh9410065-art/mira/main';

const TYPES = {
  '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg',
  '.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'
};

function typeOf(path){
  const key=Object.keys(TYPES).find(x=>path.toLowerCase().endsWith(x));
  return TYPES[key]||'application/octet-stream';
}

// 기존 홈페이지 JS가 summaryTitle 같은 ID를 변수로 직접 참조해도 동작하도록 getter를 먼저 등록합니다.
const DOM_BRIDGE=`<script>(function(){
['summaryTitle','summaryText','score','luckyColor','luckyNumber','luckyTime','luckyDirection','luckyItem','money','moneyText','love','loveText','work','workText','health','healthText','zodiacList','categoryTabs','categoryName','categoryCount','testGrid','today'].forEach(function(id){
try{Object.defineProperty(window,id,{configurable:true,get:function(){return document.getElementById(id)}})}catch(e){}
});})();</script>`;

async function asset(request,env){
  const incoming=new URL(request.url);
  let path=decodeURIComponent(incoming.pathname);
  if(path==='/')path='/index.html';
  if(path.endsWith('/'))path+='index.html';

  // Cloudflare Assets를 먼저 사용합니다.
  if(env?.ASSETS?.fetch){
    try{
      const r=await env.ASSETS.fetch(new Request(new URL(path,incoming.origin),request));
      if(r.status!==404)return r;
    }catch(e){console.error('ASSETS',e)}
  }

  // Assets가 없거나 파일을 못 찾으면 현재 mira 저장소를 직접 사용합니다.
  try{
    const r=await fetch(REPO_RAW+encodeURI(path),{cf:{cacheTtl:0,cacheEverything:false}});
    if(!r.ok)return r;
    const h=new Headers(r.headers);
    h.set('Content-Type',typeOf(path));
    h.set('Cache-Control',path.endsWith('.html')?'no-store':'public, max-age=300');
    return new Response(r.body,{status:r.status,headers:h});
  }catch(e){
    console.error('GitHub fallback',e);
    return new Response('MIRA static asset unavailable',{status:503});
  }
}

function json(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}});
}

async function generateImage(request,env){
  if(!env.GEMINI_API_KEY)return json({error:'GEMINI_API_KEY가 Cloudflare Secret에 등록되어 있지 않습니다.'},500);
  let body={};
  try{body=await request.json()}catch{return json({error:'요청 형식이 올바르지 않습니다.'},400)}
  const prompt=typeof body.prompt==='string'?body.prompt.trim():'';
  if(!prompt)return json({error:'prompt가 필요합니다.'},400);
  const r=await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-image:generateContent',{
    method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
    body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseModalities:['IMAGE']}})
  });
  const data=await r.json();
  if(!r.ok)return json({error:'Gemini 이미지 생성에 실패했습니다.',detail:data?.error?.message||'Gemini API 오류'},r.status);
  const part=(data?.candidates?.[0]?.content?.parts||[]).find(x=>x?.inlineData?.data);
  if(!part)return json({error:'생성된 이미지를 찾지 못했습니다.'},502);
  return json({success:true,mimeType:part.inlineData.mimeType||'image/png',imageBase64:part.inlineData.data});
}

export default{async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/api/generate-image'){
    if(request.method!=='POST')return json({error:'POST 요청만 사용할 수 있습니다.'},405);
    try{return await generateImage(request,env)}catch(e){console.error(e);return json({error:'이미지 생성 중 서버 오류가 발생했습니다.'},500)}
  }

  const response=await asset(request,env);
  const contentType=response.headers.get('content-type')||'';
  if(response.status!==200||!contentType.includes('text/html'))return response;

  const html=await response.text();
  const headers=new Headers(response.headers);
  headers.set('Content-Type','text/html; charset=utf-8');
  headers.set('Cache-Control','no-store');
  // 반드시 <head> 안에 넣어 기존 inline script보다 먼저 실행되게 합니다.
  const fixed=html.includes('</head>')?html.replace('</head>',DOM_BRIDGE+'</head>'):html;
  return new Response(fixed,{status:200,headers});
}};
