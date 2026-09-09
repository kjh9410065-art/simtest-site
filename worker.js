// 정적 사이트는 Cloudflare Assets에서 제공하고, CSS만으로 더 부드러운 분위기를 적용합니다.
const SOFT_DESIGN = `
<style id="soft-design">
:root{--navy:#30294f!important;--violet:#9178d4!important;--violet2:#bca9e8!important;--ink:#393447!important;--muted:#918c9b!important;--bg:#fbf9f7!important;--line:#eee9ef!important;--shadow:0 14px 34px rgba(69,57,89,.065)!important}
body{background:var(--bg)!important;color:var(--ink)!important}
.header{height:68px!important;background:rgba(255,255,255,.92)!important;color:var(--ink)!important;border-bottom:1px solid #eeeaf0!important;box-shadow:0 3px 18px rgba(55,46,72,.035)!important;backdrop-filter:blur(16px)!important}
.brand{color:#393447!important}.brand strong{font-size:18px!important}.brand small{color:#a19baa!important}.nav{gap:24px!important}.nav button{color:#938e9b!important;font-weight:700!important}.nav button.active{color:#6e5b9d!important;border-bottom-color:#a58fdd!important}.head-actions button{background:#f4f1f6!important;color:#625775!important;border-radius:14px!important}
.hero{background:linear-gradient(135deg,#f1ecfb 0%,#f8f0f6 52%,#fbf5ef 100%)!important;color:#393447!important;border:0!important;position:relative!important;overflow:hidden!important}.hero:before{content:"";position:absolute;width:420px;height:420px;border-radius:50%;right:-170px;top:-220px;background:rgba(171,146,225,.13)!important}.hero:after{content:"";position:absolute;width:300px;height:300px;border-radius:50%;left:-180px;bottom:-210px;background:rgba(231,168,190,.10)!important}.hero-inner{display:block!important;max-width:900px!important;min-height:385px!important;padding:58px 28px 68px!important;text-align:center!important;position:relative!important;z-index:1!important}.hero-inner>div:first-child{max-width:700px!important;margin:0 auto!important}.hero-visual{display:none!important}.eyebrow{color:#9279c9!important;letter-spacing:2.6px!important;margin-bottom:17px!important}.hero h1{color:#373245!important;font-size:clamp(42px,6vw,66px)!important;line-height:1.12!important;letter-spacing:-4px!important;margin-bottom:19px!important}.hero h1 em{color:#8069b3!important}.hero p{max-width:610px!important;color:#797382!important;font-size:14px!important;line-height:1.9!important;margin:0 auto 28px!important}.actions{justify-content:center!important;gap:9px!important}.primary{background:linear-gradient(105deg,#9276d8,#b29be5)!important;box-shadow:0 9px 23px rgba(129,104,193,.16)!important;border-radius:16px!important}.secondary{background:rgba(255,255,255,.66)!important;color:#665d70!important;border:1px solid rgba(126,110,154,.15)!important;border-radius:16px!important}.quick{margin:-22px auto 0!important;padding:0 28px!important}.quick-grid{gap:13px!important}.quick-card{background:#fff!important;border:1px solid #eeeaf0!important;border-radius:23px!important;min-height:170px!important;padding:21px!important;box-shadow:var(--shadow)!important}.quick-card:nth-child(1){background:linear-gradient(145deg,#fff,#f8f4ff)!important}.quick-card:nth-child(2){background:linear-gradient(145deg,#fff,#f8f5fd)!important}.quick-card:nth-child(3){background:linear-gradient(145deg,#fff,#fff5f8)!important}.quick-card:nth-child(4){background:linear-gradient(145deg,#fff,#f8f4fa)!important}.card-no{color:#9b85d0!important;margin-bottom:22px!important}.quick-card strong{color:#3d374b!important;font-size:16px!important}.quick-card span{color:#918c98!important}.card-action{background:#f3effa!important;color:#7560a5!important;border-radius:12px!important}.section{padding:58px 28px!important}.section-head{margin-bottom:18px!important}.section-head h2{color:#3d374a!important;font-size:23px!important}.section-head p{color:#9a95a0!important}.more{color:#826caf!important}.fortune-grid,.test-grid{gap:13px!important}.fortune-card,.test-card,.test-select,.question,.result-card,.result{border:1px solid #eeeaf0!important;border-radius:23px!important;box-shadow:var(--shadow)!important}.fortune-card{background:#fff!important;padding:23px!important}.fortune-card:after{background:linear-gradient(135deg,rgba(155,132,210,.10),rgba(231,174,194,.07))!important}.fortune-card small,.test-card .type,.test-select .type{color:#9a83d0!important}.fortune-card h3,.test-card h3,.test-select h2{color:#3c3749!important}.fortune-card p,.test-card p,.test-select p{color:#918c98!important}.test-card{padding:20px!important;min-height:185px!important}.test-card button,.test-select button{background:#f3effa!important;color:#7560a5!important;border-radius:12px!important}.lucky-banner{background:linear-gradient(135deg,#eee6fa,#f5e5eb)!important;color:#443c50!important;border-radius:25px!important;padding:31px!important;box-shadow:var(--shadow)!important}.lucky-banner:after{border-color:rgba(125,105,158,.09)!important}.lucky-banner small{color:#8068ae!important}.lucky-banner p{color:#817b89!important}.footer{background:#39334e!important;color:#aaa4b1!important}.fortune-page{background:linear-gradient(180deg,#eee9f7,#f9f5f5)!important;color:#393447!important}.inner,.subview{padding-top:42px!important}.back{color:#8068ae!important}.page-title h1,.subview h1{color:#393447!important}.page-title p,.lead{color:#918c99!important}.choice{background:#fff!important;color:#40394d!important;border:2px solid transparent!important;border-radius:15px!important;box-shadow:0 7px 20px rgba(68,56,89,.045)!important}.choice.active{border-color:#aa95df!important;background:#f5f0fd!important}.result{background:#fff!important;color:#393447!important}.score,.result-tag{background:#f3effa!important;color:#7560a5!important}.lucky-page{background:linear-gradient(180deg,#eee8f6,#faf4f5)!important;color:#393447!important}.lucky-main{border:1px solid #eeeaf0!important;box-shadow:var(--shadow)!important}.lucky-main:before{color:#f1ebf7!important}.lucky-info h1{color:#393447!important}.lucky-info p{color:#8a8492!important}.lucky-details div{background:#f8f5fa!important}.overlay{background:rgba(54,47,69,.36)!important;backdrop-filter:blur(5px)!important}.panel{border-radius:25px!important;box-shadow:0 25px 70px rgba(45,37,64,.14)!important}.search-input{border-color:#e9e4ec!important;border-radius:14px!important}.menu-list button{background:#f7f3f9!important;border-radius:13px!important}
@media(max-width:720px){.header{height:62px!important}.hero-inner{padding:43px 18px 50px!important;min-height:0!important}.hero h1{font-size:39px!important;letter-spacing:-3px!important}.hero p{font-size:12px!important;line-height:1.9!important}.primary,.secondary{height:49px!important;border-radius:15px!important}.quick{margin:-17px auto 0!important;padding:0 14px!important}.quick-grid{gap:9px!important}.quick-card{min-height:152px!important;padding:17px!important;border-radius:20px!important}.card-no{margin-bottom:17px!important}.quick-card strong{font-size:14px!important}.quick-card span{font-size:10px!important}.section{padding:44px 15px!important}.section-head h2{font-size:20px!important}.fortune-card,.test-card,.test-select{border-radius:20px!important}.fortune-card{padding:18px!important}.test-card{min-height:170px!important;padding:16px!important}.lucky-banner{border-radius:21px!important;padding:25px!important}.inner,.subview{padding:33px 15px 65px!important}.result,.question,.result-card,.lucky-main{border-radius:20px!important}}
@media(max-width:390px){.hero-inner{padding:38px 16px 45px!important}.hero h1{font-size:35px!important}.quick-grid,.test-grid,.test-list{grid-template-columns:1fr!important}.quick-card{min-height:140px!important}}
@media(max-width:900px) and (orientation:landscape) and (max-height:600px){.hero-inner{padding:30px 28px 38px!important}.hero h1{font-size:37px!important}.quick-grid,.test-grid{grid-template-columns:repeat(4,1fr)!important}}
@media(min-width:1400px){.hero-inner{min-height:420px!important;padding-top:66px!important;padding-bottom:70px!important}.section{padding-top:64px!important;padding-bottom:64px!important}}
</style>`;

// Gemini 이미지 생성 API를 호출합니다.
// API 키는 GitHub 코드에 넣지 않고 Cloudflare Secret(GEMINI_API_KEY)에서만 읽습니다.
async function generateGeminiImage(request, env, forcedPrompt = "") {
  if (!env.GEMINI_API_KEY) return jsonResponse({ error: "GEMINI_API_KEY가 Cloudflare Secret에 등록되어 있지 않습니다." }, 500);

  let body = {};
  if (request.method === "POST") {
    try { body = await request.json(); } catch { return jsonResponse({ error: "요청 형식이 올바르지 않습니다." }, 400); }
  }

  const prompt = forcedPrompt || (typeof body?.prompt === "string" ? body.prompt.trim() : "");
  if (!prompt) return jsonResponse({ error: "prompt가 필요합니다." }, 400);
  if (prompt.length > 6000) return jsonResponse({ error: "prompt는 6000자 이하로 입력해주세요." }, 400);

  // Google 공식 REST 문서의 Gemini 3.1 Flash Image 엔드포인트를 사용합니다.
  const endpoint = "https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-image:generateContent";
  const geminiResponse = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        responseFormat: { image: { aspectRatio: "16:9", imageSize: "1K" } }
      }
    })
  });

  const data = await geminiResponse.json();
  if (!geminiResponse.ok) return jsonResponse({ error: "Gemini 이미지 생성에 실패했습니다.", detail: data?.error?.message || "Gemini API 오류" }, geminiResponse.status);

  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(part => part?.inlineData?.data);
  if (!imagePart) return jsonResponse({ error: "Gemini 응답에서 생성된 이미지를 찾지 못했습니다." }, 502);

  return jsonResponse({ success: true, mimeType: imagePart.inlineData.mimeType || "image/png", imageBase64: imagePart.inlineData.data });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 실제 사이트에서 Gemini 연결이 살아있는지 한 번 클릭으로 확인할 수 있는 테스트용 엔드포인트입니다.
    // 테스트 성공 후에는 이 경로를 제거하거나 관리자 전용으로 제한할 수 있습니다.
    if (url.pathname === "/api/test-image") {
      if (request.method !== "GET") return jsonResponse({ error: "GET 요청만 사용할 수 있습니다." }, 405);
      const testPrompt = `Create one single standalone website illustration asset for a Korean fortune and psychology test website. A dreamy pastel anime editorial illustration of a young Korean woman sitting at a cozy desk beside a fluffy cat, soft lavender, blush pink and cream palette, gentle morning light, refined 2D/2.5D illustration, elegant and airy, premium web design mood, clean composition, no text, no letters, no UI, no buttons, no logos, no watermark, no collage, no multiple panels. Wide 16:9 composition with generous negative space and the subject grouped naturally on one side.`;
      try {
        const result = await generateGeminiImage(request, env, testPrompt);
        const data = await result.json();
        if (!data.success) return new Response(JSON.stringify(data), { status: result.status, headers: { "Content-Type": "application/json; charset=utf-8" } });
        const binary = Uint8Array.from(atob(data.imageBase64), c => c.charCodeAt(0));
        return new Response(binary, { headers: { "Content-Type": data.mimeType, "Cache-Control": "no-store" } });
      } catch (error) {
        console.error("Gemini test image error:", error);
        return jsonResponse({ error: "테스트 이미지 생성 중 서버 오류가 발생했습니다." }, 500);
      }
    }

    if (url.pathname === "/api/generate-image") {
      if (request.method !== "POST") return jsonResponse({ error: "POST 요청만 사용할 수 있습니다." }, 405);
      try { return await generateGeminiImage(request, env); }
      catch (error) { console.error("Gemini image generation error:", error); return jsonResponse({ error: "이미지 생성 중 서버 오류가 발생했습니다." }, 500); }
    }

    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;
    const html = await response.text();
    const updated = html.replace("</head>", `${SOFT_DESIGN}</head>`);
    return new Response(updated, { status: response.status, statusText: response.statusText, headers: new Headers(response.headers) });
  }
};
