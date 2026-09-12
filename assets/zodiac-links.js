// 띠·별자리 목록 카드를 클릭하면 상세 페이지로 이동하도록 연결합니다.
document.addEventListener('DOMContentLoaded',function(){
  const list=document.getElementById('zodiacList');
  if(!list)return;
  const sync=()=>list.querySelectorAll('.z').forEach(card=>{
    if(card.tagName==='A')return;
    const type=card.dataset.ztype||'animal';
    const index=card.dataset.zindex||'0';
    const link=document.createElement('a');
    link.className=card.className;
    link.href=`/zodiac/?type=${encodeURIComponent(type)}&index=${encodeURIComponent(index)}`;
    link.innerHTML=card.innerHTML;
    [...card.attributes].forEach(a=>{if(a.name!=='class')link.setAttribute(a.name,a.value)});
    card.replaceWith(link);
  });
  new MutationObserver(sync).observe(list,{childList:true});
  sync();
});