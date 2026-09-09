// Cloudflare Workers에서 사이트 전체에 부드러운 디자인 레이어를 적용합니다.
// 이미지와 이모지를 사용하지 않고 CSS만으로 분위기와 간격을 조정합니다.
const SOFT_DESIGN = `
<style id="soft-design">
:root{
  --navy:#20204d;--violet:#806bd1;--violet2:#b19fe8;--ink:#303047;--muted:#88879a;
  --bg:#f8f7fa;--line:#eceaf1;--white:#fff;--shadow:0 6px 22px rgba(45,38,75,.055)
}
body{background:var(--bg);color:var(--ink)}
.header{height:66px;background:rgba(255,255,255,.94);color:var(--ink);border-bottom:1px solid #eeedf3;box-shadow:0 2px 15px rgba(35,31,63,.035);backdrop-filter:blur(16px)}
.brand{color:var(--ink)}.brand strong{font-size:18px}.brand small{color:#9997a8}
.nav{gap:22px}.nav button{color:#898899}.nav button.active{color:#6450b4;border-bottom-color:#8c78db}
.head-actions button{background:#f2f0f7;color:#55478c;border-radius:13px}
.hero{background:linear-gradient(135deg,#f1effd 0%,#f8f7ff 55%,#f7f0f7 100%);color:var(--ink);border-bottom:1px solid #eeebf5}
.hero-inner{min-height:350px;padding:45px 28px 46px;grid-template-columns:1fr;gap:0;position:relative}
.hero-inner>div:first-child{max-width:720px;z-index:2}
.eyebrow{color:#7b68c4;margin-bottom:13px}.hero h1{font-size:clamp(40px,5vw,62px);line-height:1.1;letter-spacing:-4px;margin-bottom:16px;color:#292943}.hero h1 em{color:#8069d4}
.hero p{color:#77768a;max-width:620px;font-size:13px;line-height:1.8;margin-bottom:22px}.actions{gap:8px}.primary,.secondary{height:46px;border-radius:14px}.primary{background:linear-gradient(105deg,#806bd5,#a693e8);box-shadow:0 7px 18px rgba(112,92,194,.16)}.secondary{background:#fff;color:#625d72;border-color:#e1dfe8}
.hero-visual{position:absolute;right:max(28px,calc((100vw - 1240px)/2));top:52px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(169,149,232,.25),rgba(169,149,232,.07) 45%,transparent 70%);border:0;box-shadow:none;opacity:.8}
.hero-visual:before{width:165px;height:165px;right:47px;top:47px;border-color:rgba(128,105,212,.18);box-shadow:0 0 0 22px rgba(128,105,212,.025),0 0 0 45px rgba(128,105,212,.018)}
.hero-visual:after{content:"";left:auto;bottom:auto;right:80px;top:80px;width:8px;height:8px;border-radius:50%;background:#a18ce1;box-shadow:48px 22px 0 rgba(161,140,225,.48),-28px 55px 0 rgba(161,140,225,.28);font-size:0}
.quick{margin:-8px auto 0;padding:0 28px}.quick-grid{gap:6px}.quick-card{min-height:150px;padding:17px;border:1px solid var(--line);border-radius:20px;background:#fff;box-shadow:var(--shadow)}.quick-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(45,38,75,.08)}
.card-no{margin-bottom:15px;color:#917ddd}.quick-card strong{font-size:15px;margin-bottom:4px}.quick-card span{font-size:10.5px;color:#898899}.card-action{height:34px;border-radius:11px;background:#f3f0fb;color:#6955bf}
.section{padding:38px 28px}.section-head{margin-bottom:11px}.section-head h2{font-size:21px;letter-spacing:-1.4px}.section-head p{color:#8d8b9c}.fortune-grid,.test-grid{gap:6px}
.fortune-card,.test-card,.test-select{border:1px solid var(--line);border-radius:20px;background:#fff;box-shadow:var(--shadow)}.fortune-card{padding:19px;min-height:112px}.fortune-card:after{width:88px;height:88px;right:-30px;top:-30px;opacity:.55}.test-card{padding:17px;min-height:155px}.test-card .type{margin-bottom:12px}.test-card button,.test-select button{border-radius:11px;background:#f3f0fb;color:#6955bf}
.lucky-banner{border-radius:22px;padding:25px;background:linear-gradient(135deg,#292958,#51417a);box-shadow:0 10px 28px rgba(45,35,77,.1)}.lucky-banner:after{width:170px;height:170px;right:-55px;top:-65px}.footer{padding:26px 20px;background:#171737}
.fortune-page{background:linear-gradient(180deg,#26285c,#35316b)}.inner,.subview{padding-top:34px}.choice-grid{gap:6px}.choice{border-radius:14px}.result,.question,.result-card,.lucky-main{border-radius:21px;box-shadow:var(--shadow)}.result{margin-top:8px;padding:19px}.question{padding:21px;margin-top:6px}.answer{border-radius:14px;padding:13px}.run-actions{gap:6px;margin-top:6px}.result-card{padding:23px}.result-grid,.luck-grid{gap:6px}.lucky-page{background:linear-gradient(180deg,#282a60,#39316c)}.lucky-main{padding:27px}.overlay{background:rgba(27,25,50,.48);backdrop-filter:blur(5px)}.panel{border-radius:22px}
@media(max-width:1050px){.nav{gap:14px}.hero-inner{min-height:330px}.hero-visual{width:220px;height:220px;right:24px}.quick-grid,.test-grid{gap:6px}}
@media(max-width:720px){
 .header{height:60px;padding:0 15px}.hero-inner{min-height:0;padding:32px 18px 36px}.hero h1{font-size:37px;letter-spacing:-3px}.hero p{font-size:12px;line-height:1.8}.hero-visual{width:170px;height:170px;right:-40px;top:175px;opacity:.4}.hero-visual:before{width:110px;height:110px;right:30px;top:30px}.hero-visual:after{right:53px;top:53px}.quick{padding:0 15px;margin:-7px auto 0}.quick-grid{gap:6px}.quick-card{min-height:138px;padding:14px;border-radius:18px}.card-no{margin-bottom:13px}.section{padding:32px 15px}.fortune-grid,.test-grid{gap:6px}.fortune-card,.test-card,.test-select{border-radius:18px}.fortune-card{padding:16px}.test-card{min-height:150px;padding:14px}.lucky-banner{border-radius:19px;padding:21px}.inner,.subview{padding:29px 15px 60px}.choice-grid{gap:5px}.choice{border-radius:13px;padding:13px 6px}.result,.question,.result-card,.lucky-main{border-radius:19px}
}
@media(max-width:390px){.hero h1{font-size:33px}.quick-grid,.test-grid,.test-list{grid-template-columns:1fr;gap:6px}.quick-card{min-height:132px}.hero-visual{display:none}}
@media(max-width:900px) and (orientation:landscape) and (max-height:600px){.hero-inner{min-height:260px;padding:24px 30px 28px}.hero-visual{width:190px;height:190px;right:30px;top:35px}.quick-grid,.test-grid{gap:6px}}
@media(min-width:1400px){.hero-inner{min-height:390px;padding-top:48px;padding-bottom:48px}.hero-visual{width:290px;height:290px}.section{padding-top:42px;padding-bottom:42px}}
</style>`;

export default {
  async fetch(request, env) {
    // 정적 파일은 원본 Assets에서 그대로 전달합니다.
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";

    // HTML에만 디자인 레이어를 추가합니다.
    if (!contentType.includes("text/html")) return response;

    const html = await response.text();
    const updated = html.replace("</head>", `${SOFT_DESIGN}</head>`);

    return new Response(updated, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers)
    });
  }
};
