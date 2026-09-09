// Cloudflare Workers에서 홈 화면에 부드러운 디자인 레이어를 적용합니다.
// 실제 콘텐츠와 기능은 기존 index.html을 그대로 사용하고, 시각적인 분위기만 이곳에서 조정합니다.
const SOFT_DESIGN = `
<style id="soft-design">
:root{
  --navy:#17183f;
  --navy2:#29265f;
  --violet:#8b72dc;
  --violet2:#b7a2f2;
  --ink:#29263d;
  --muted:#858196;
  --bg:#faf8f5;
  --line:#eee9e5;
  --white:#fffdfb;
  --shadow:0 18px 50px rgba(57,42,82,.07);
}
body{background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Noto Sans KR","Apple SD Gothic Neo",sans-serif}
.header{height:72px;background:rgba(23,24,63,.96);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.08);box-shadow:0 8px 30px rgba(19,17,45,.08)}
.brand strong{font-size:19px;letter-spacing:-1.2px}.brand small{color:#bbb5d6}
.nav{gap:26px}.nav button{font-weight:700;color:#b9b5cf;border-bottom:0;position:relative}.nav button:after{content:"";position:absolute;left:50%;bottom:17px;width:0;height:2px;border-radius:2px;background:#cdbcf8;transform:translateX(-50%);transition:width .2s}.nav button.active:after{width:18px}.nav button.active{color:#fff}
.head-actions button{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.07);border-radius:13px}
.hero{background:radial-gradient(circle at 78% 18%,rgba(188,157,255,.2),transparent 28%),radial-gradient(circle at 18% 90%,rgba(255,181,178,.12),transparent 30%),linear-gradient(135deg,#17183f 0%,#28265f 58%,#49386b 100%)}
.hero-inner{min-height:455px;padding:58px 28px 66px;gap:48px}
.eyebrow{color:#d7c9fb;letter-spacing:2.4px}
.hero h1{font-size:clamp(43px,5vw,64px);letter-spacing:-4.5px;line-height:1.12}.hero h1 em{color:#d8c8ff}
.hero p{color:#ddd9e8;max-width:510px}
.actions{gap:10px}.primary,.secondary{border-radius:16px;height:50px}.primary{background:linear-gradient(110deg,#8a70db,#b29bf0);box-shadow:0 14px 30px rgba(65,48,120,.25)}.secondary{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.15)}
.hero-visual{height:300px;border-radius:36px;background:radial-gradient(circle at 72% 24%,rgba(221,195,255,.42),transparent 20%),radial-gradient(circle at 26% 76%,rgba(241,166,191,.22),transparent 27%),linear-gradient(145deg,#20265d,#403877 58%,#684d82);border:1px solid rgba(255,255,255,.14);box-shadow:0 30px 70px rgba(5,7,31,.24);transform:rotate(.35deg)}
.hero-visual:before{width:220px;height:220px;right:10%;top:10%;border-color:rgba(255,255,255,.15);box-shadow:0 0 0 30px rgba(255,255,255,.025),0 0 0 62px rgba(255,255,255,.015)}
.hero-visual:after{content:"TODAY";left:30px;bottom:26px;color:rgba(255,255,255,.2);font-size:44px;letter-spacing:5px}
.quick{margin:-25px auto 0}.quick-grid{gap:14px}.quick-card{border:0;border-radius:22px;background:rgba(255,253,251,.98);box-shadow:var(--shadow);padding:21px;min-height:184px}.quick-card:hover{transform:translateY(-5px) rotate(-.2deg);box-shadow:0 24px 55px rgba(57,42,82,.11)}
.card-no{color:#9a83dd;margin-bottom:20px}.quick-card strong{font-size:17px;letter-spacing:-.5px}.quick-card span{color:#8b8797}.card-action{height:38px;border-radius:12px;background:#f2edff;color:#684fd0}
.section{padding:62px 28px}.section-head{margin-bottom:20px}.section-head h2{font-size:24px;letter-spacing:-1.7px}.section-head p{color:#8d8898}.more{color:#8065d4}
.fortune-grid,.test-grid{gap:14px}.fortune-card,.test-card,.test-select{border:0;border-radius:22px;background:#fffdfb;box-shadow:0 10px 32px rgba(57,42,82,.045)}.fortune-card{padding:24px}.fortune-card:after{background:linear-gradient(135deg,rgba(139,114,220,.12),rgba(240,160,184,.1));width:130px;height:130px;right:-45px;top:-45px}
.test-card{padding:21px;min-height:190px}.test-card:hover{transform:translateY(-4px)}.test-card button,.test-select button{border-radius:12px;background:#f2edff;color:#684fd0}
.lucky-banner{border-radius:26px;background:linear-gradient(135deg,#202052,#55407b);padding:34px;box-shadow:0 20px 50px rgba(42,31,72,.14)}
.footer{background:#121331;padding:34px 20px;color:#8e8ba8}
.fortune-page{background:radial-gradient(circle at 85% 10%,rgba(184,159,244,.15),transparent 28%),linear-gradient(180deg,#181a45,#302b66)}
.choice{border:2px solid transparent;border-radius:16px}.choice.active{border-color:#a58ce9;background:#f7f3ff}.result,.question,.result-card,.lucky-main{border-radius:24px;box-shadow:0 18px 50px rgba(32,27,61,.1)}
.progress{height:7px;border-radius:10px}.question{padding:27px}.answer{border-radius:15px}.answer.selected{border-color:#9278e4;background:#f5f0ff}
.lucky-page{background:radial-gradient(circle at 85% 12%,rgba(207,178,247,.16),transparent 25%),linear-gradient(180deg,#191b49,#352b66)}.lucky-main{padding:35px}
.overlay{background:rgba(20,18,43,.55);backdrop-filter:blur(6px)}.panel{border-radius:25px;box-shadow:0 30px 90px rgba(20,17,43,.2)}
@media(max-width:720px){
  .header{height:64px}.hero-inner{padding:38px 18px 45px;gap:25px}.hero h1{font-size:40px}.hero-visual{height:165px;border-radius:27px}.quick{margin:-12px auto 0}.quick-card{border-radius:18px;min-height:164px;padding:16px}.section{padding:43px 15px}.fortune-card,.test-card,.test-select{border-radius:19px}.lucky-banner{border-radius:21px;padding:26px}
}
@media(max-width:390px){.hero h1{font-size:35px}.hero-visual{height:150px}.quick-card{min-height:150px}}
@media(max-width:900px) and (orientation:landscape) and (max-height:600px){.hero-inner{padding:27px 30px 33px}.hero-visual{height:225px}}
</style>`;

export default {
  async fetch(request, env) {
    // 이미지나 기타 정적 파일은 원본 Assets를 그대로 전달합니다.
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";

    // HTML 문서에만 새로운 디자인 레이어를 주입합니다.
    if (!contentType.includes("text/html")) return response;

    const html = await response.text();
    const updated = html.replace("</head>", `${SOFT_DESIGN}</head>`);

    return new Response(updated, {
      status: response.status,
      headers: new Headers(response.headers)
    });
  }
};
