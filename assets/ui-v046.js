/* v0.00.46
   날짜를 기준으로 오늘의 행운 아이템을 결정한다.
   같은 날에는 같은 결과가 나오고 날짜가 바뀌면 다른 항목으로 바뀐다.
*/
(function(){
  const luckyItems=[
    {item:'보라색 소품',number:'7',direction:'남동쪽',tip:'오늘은 보라색 계열의 작은 소품을 가까이 두어보세요. 중요한 선택이 있다면 조금 더 자신 있게 움직여도 좋은 날입니다.'},
    {item:'실버 액세서리',number:'3',direction:'동쪽',tip:'은빛이 도는 작은 액세서리가 오늘의 분위기와 잘 맞습니다. 새로운 일을 시작할 때는 첫 단계를 빠르게 정해보세요.'},
    {item:'파란색 문구류',number:'9',direction:'북쪽',tip:'파란색 계열의 문구류가 집중력을 높이는 데 좋은 분위기를 만들어줍니다. 중요한 일은 오전에 먼저 처리해보세요.'},
    {item:'흰색 손수건',number:'2',direction:'서쪽',tip:'깔끔한 흰색 소품이 오늘의 행운 아이템입니다. 복잡한 일은 하나씩 정리하면 생각보다 빠르게 풀릴 수 있습니다.'},
    {item:'나무 소재 소품',number:'5',direction:'남쪽',tip:'나무 소재의 자연스러운 소품을 가까이 두어보세요. 사람과의 대화에서는 먼저 편하게 말을 꺼내는 것이 좋습니다.'},
    {item:'노란색 소품',number:'1',direction:'북동쪽',tip:'노란색 계열의 작은 소품이 오늘의 포인트입니다. 망설이던 일이 있다면 너무 오래 미루지 않는 것이 좋습니다.'},
    {item:'향이 은은한 캔들',number:'8',direction:'남서쪽',tip:'은은한 향이 나는 소품이 오늘의 행운 아이템입니다. 잠시 주변을 정리하고 마음을 가볍게 만드는 시간을 가져보세요.'},
    {item:'초록색 파우치',number:'4',direction:'북서쪽',tip:'초록색 계열의 소품이 좋은 기운을 더해줍니다. 오늘은 새로운 사람과의 대화에서 의외의 공통점을 발견할 수 있습니다.'},
    {item:'검은색 카드지갑',number:'6',direction:'동남쪽',tip:'차분한 검은색 소품이 오늘의 행운 아이템입니다. 중요한 결정은 주변 의견보다 자신의 기준을 먼저 생각해보세요.'},
    {item:'작은 금속 키링',number:'11',direction:'서북쪽',tip:'작은 금속 소품을 가까이 두어보세요. 오늘은 사소해 보이는 기회가 다음 일로 이어질 가능성이 있습니다.'},
    {item:'분홍색 파우치',number:'10',direction:'남동쪽',tip:'부드러운 분홍색 소품이 오늘의 포인트입니다. 가까운 사람에게 먼저 따뜻한 말을 건네면 좋은 분위기가 만들어집니다.'},
    {item:'베이지색 노트',number:'12',direction:'북동쪽',tip:'차분한 베이지색 노트가 오늘의 행운 아이템입니다. 해야 할 일을 글로 정리하면 우선순위가 쉽게 보일 수 있습니다.'}
  ];

  function getDailyIndex(){
    const now=new Date();
    const key=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
    let hash=0;
    for(let i=0;i<key.length;i++) hash=((hash*31)+key.charCodeAt(i))>>>0;
    return hash%luckyItems.length;
  }

  function renderLucky(){
    const data=luckyItems[getDailyIndex()];
    const main=document.querySelector('#lucky-modal .lucky-main');
    const info=document.querySelectorAll('#lucky-modal .lucky-info strong');
    const tip=document.querySelector('#lucky-modal .lucky-tip');
    if(main) main.textContent=data.item;
    if(info[0]) info[0].textContent=data.number;
    if(info[1]) info[1].textContent=data.direction;
    if(tip) tip.textContent=data.tip;
  }

  const originalShowLucky=window.showLucky;
  window.showLucky=function(){
    renderLucky();
    if(typeof originalShowLucky==='function') originalShowLucky();
    else document.getElementById('lucky-modal')?.classList.add('show');
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',renderLucky);
  else renderLucky();
})();
