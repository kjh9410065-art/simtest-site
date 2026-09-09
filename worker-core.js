// 기존 Worker 원본을 보존합니다.
// 홈 화면 이미지가 JS 실행 순서나 한글 파일명 URL 문제로 빠지지 않도록
// Worker가 HTML에 직접 이미지 CSS를 주입합니다.
const SOFT_DESIGN = `<style id="site-image-fix">
.hero-art{
  background-image:url("https://raw.githubusercontent.com/kjh9410065-art/simtest-site/main/바다를%20품은%20아늑한%20카페%20공간.png") !important;
  background-size:cover !important;
  background-position:center !important;
  background-repeat:no-repeat !important;
}
.quick-card{background-color:rgba(255,255,255,.72) !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important;}
.quick-card:nth-child(1){background-image:linear-gradient(rgba(255,255,255,.72),rgba(255,255,255,.72)),url("https://raw.githubusercontent.com/kjh9410065-art/simtest-site/main/고요한%20창가의%20타로%20카드%20정물.png") !important;}
.quick-card:nth-child(2){background-image:linear-gradient(rgba(255,255,255,.72),rgba(255,255,255,.72)),url("https://raw.githubusercontent.com/kjh9410065-art/simtest-site/main/꽃잎%20흩날리는%20호숫가의%20봄%20풍경.png") !important;}
.quick-card:nth-child(3){background-image:linear-gradient(rgba(255,255,255,.72),rgba(255,255,255,.72)),url("https://raw.githubusercontent.com/kjh9410065-art/simtest-site/main/바다를%20품은%20아늑한%20카페%20공간.png") !important;}
.quick-card:nth-child(4){background-image:linear-gradient(rgba(255,255,255,.72),rgba(255,255,255,.72)),url("https://raw.githubusercontent.com/kjh9410065-art/simtest-site/main/따뜻한%20햇살%20아래%20온라인%20커뮤니티%20카페.png") !important;}
</style>`;

async function generateGeminiImage(request, env, forcedPrompt = "") {
  if (!env.GEMINI_API_KEY) return jsonResponse({ error: "GEMINI_API_KEY가 Cloudflare Secret에 등록되어 있지 않습니다." }, 500);
  let body = {};
  if (request.method === "POST") { try { body = await request.json(); } catch { return jsonResponse({ error: "요청 형식이 올바르지 않습니다." }, 400); } }
  const prompt = forcedPrompt || (typeof body?.prompt === "string" ? body.prompt.trim() : "");
  if (!prompt) return jsonResponse({ error: "prompt가 필요합니다." }, 400);
  const endpoint = "https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-image:generateContent";
  const r = await fetch(endpoint, { method:"POST", headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY}, body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseModalities:["IMAGE"]}}) });
  const data = await r.json();
  if (!r.ok) return jsonResponse({error:"Gemini 이미지 생성에 실패했습니다.",detail:data?.error?.message||"Gemini API 오류"},r.status);
  const part=(data?.candidates?.[0]?.content?.parts||[]).find(x=>x?.inlineData?.data);
  if (!part) return jsonResponse({error:"Gemini 응답에서 생성된 이미지를 찾지 못했습니다."},502);
  return jsonResponse({success:true,mimeType:part.inlineData.mimeType||"image/png",imageBase64:part.inlineData.data});
}
function jsonResponse(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}})}
export default {async fetch(request,env){const url=new URL(request.url);if(url.pathname==="/api/test-image"){if(request.method!=="GET")return jsonResponse({error:"GET 요청만 사용할 수 있습니다."},405);try{const result=await generateGeminiImage(request,env,`Create one single standalone website illustration asset for a Korean fortune and psychology test website. A calm pastel anime editorial illustration of a young woman at a cozy desk beside a fluffy cat, lavender, blush pink and cream palette, gentle light, refined 2D/2.5D illustration, no text, no UI, no logos, no watermark, no collage.`);const data=await result.json();if(!data.success)return new Response(JSON.stringify(data),{status:result.status,headers:{"Content-Type":"application/json; charset=utf-8"}});const binary=Uint8Array.from(atob(data.imageBase64),c=>c.charCodeAt(0));return new Response(binary,{headers:{"Content-Type":data.mimeType,"Cache-Control":"no-store"}})}catch(e){console.error(e);return jsonResponse({error:"테스트 이미지 생성 중 서버 오류가 발생했습니다."},500)}}if(url.pathname==="/api/generate-image"){if(request.method!=="POST")return jsonResponse({error:"POST 요청만 사용할 수 있습니다."},405);try{return await generateGeminiImage(request,env)}catch(e){console.error(e);return jsonResponse({error:"이미지 생성 중 서버 오류가 발생했습니다."},500)}}const response=await env.ASSETS.fetch(request);const type=response.headers.get("content-type")||"";if(!type.includes("text/html"))return response;const html=await response.text();return new Response(html.replace("</head>",`${SOFT_DESIGN}</head>`),{status:response.status,statusText:response.statusText,headers:new Headers(response.headers)})}};
