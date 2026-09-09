// 실제 GitHub에 올라간 이미지 파일을 현재 화면의 실제 요소에 연결합니다.
(function(){
  function connectImages(){
    const root='/';
    const images={
      // 현재 첫 화면 오른쪽 히어로 영역
      hero:'바다를 품은 아늑한 카페 공간.png',

      // 상단 4개 바로가기 카드
      quick:{
        '띠 운세':'고요한 창가의 타로 카드 정물.png',
        '별자리 운세':'꽃잎 흩날리는 호숫가의 봄 풍경.png',
        '심리테스트':'꽃잎 흩날리는 호숫가의 봄 풍경.png',
        '행운의 아이템':'꿈결 같은 태양 오라클 카드 정원.png'
      },

      // 홈의 인기 심리테스트 카드
      tests:{
        '연애':'햇살 가득한 카페의 즐거운 모임.png',
        '스트레스':'햇살 머무는 바닷가 작업 공간.png',
        '선택':'일곱 계절의 환상 아치홀.png',
        '동물':'햇살 가득한 카페의 즐거운 모임.png',
        '메시지':'꽃잎 흩날리는 호숫가의 봄 풍경.png'
      }
    };

    // 한글 파일명을 브라우저가 안전하게 읽도록 URL로 변환합니다.
    const fileUrl=(name)=>root+encodeURIComponent(name);

    // 히어로 영역은 기존 빈 박스의 배경을 실제 이미지로 교체합니다.
    const style=document.createElement('style');
    style.textContent=`
      .hero-art{
        background-image:url("${fileUrl(images.hero)}") !important;
        background-size:cover !important;
        background-position:center !important;
        background-repeat:no-repeat !important;
      }
      .quick-card,.test-card{position:relative;overflow:hidden}
      .quick-card::before,.test-card::before{
        content:"";
        position:absolute;
        inset:0;
        background-image:var(--card-image);
        background-size:cover;
        background-position:center;
        opacity:.22;
        border-radius:inherit;
        pointer-events:none;
      }
      .quick-card>*,.test-card>*{position:relative;z-index:1}
    `;
    document.head.appendChild(style);

    // 카드가 실제로 생성된 뒤 제목을 기준으로 알맞은 이미지를 붙입니다.
    document.querySelectorAll('.quick-card').forEach(card=>{
      const text=card.innerText||'';
      const key=Object.keys(images.quick).find(k=>text.includes(k));
      if(key) card.style.setProperty('--card-image',`url("${fileUrl(images.quick[key])}")`);
    });

    document.querySelectorAll('.test-card').forEach(card=>{
      const text=card.innerText||'';
      const key=Object.keys(images.tests).find(k=>text.includes(k));
      if(key) card.style.setProperty('--card-image',`url("${fileUrl(images.tests[key])}")`);
    });
  }

  // 이 스크립트는 Worker가 <head>에 주입하므로 DOM이 만들어진 뒤 실행해야 합니다.
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',connectImages,{once:true});
  }else{
    connectImages();
  }
})();
