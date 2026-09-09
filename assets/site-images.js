// 실제 GitHub에 올라간 이미지 파일을 현재 화면의 실제 요소에 연결합니다.
(function(){
  const root='/';
  const images={
    // 첫 화면의 대표 이미지
    hero:'바다를 품은 아늑한 카페 공간.png',

    // 상단 4개 바로가기 카드
    quick:{
      '띠 운세':'고요한 창가의 타로 카드 정물.png',
      '별자리 운세':'꽃잎 흩날리는 호숫가의 봄 풍경.png',
      '심리테스트':'꽃잎 흩날리는 호숫가의 봄 풍경.png',
      '행운의 아이템':'꿈결 같은 태양 오라클 카드 정원.png'
    },

    // 인기 테스트 카드
    tests:{
      '연애':'햇살 가득한 카페의 즐거운 모임.png',
      '스트레스':'햇살 머무는 바닷가 작업 공간.png',
      '선택':'일곱 계절의 환상 아치홀.png',
      '동물':'햇살 가득한 카페의 즐거운 모임.png',
      '메시지':'꽃잎 흩날리는 호숫가의 봄 풍경.png'
    }
  };

  const url=(name)=>root+encodeURIComponent(name).replace(/%2F/g,'/');
  const css=document.createElement('style');
  css.textContent=`
    /* 히어로 오른쪽 빈 박스를 실제 이미지로 교체 */
    .hero-art{
      background-image:url("${url(images.hero)}") !important;
      background-size:cover !important;
      background-position:center !important;
      background-repeat:no-repeat !important;
    }

    /* 카드 이미지가 글자를 가리지 않도록 은은하게 깔기 */
    .quick-card,.test-card{position:relative;overflow:hidden}
    .quick-card::before,.test-card::before{
      content:"";position:absolute;inset:0;
      background-size:cover;background-position:center;
      opacity:.20;border-radius:inherit;pointer-events:none;
    }
    .quick-card>* ,.test-card>*{position:relative;z-index:1}
  `;
  document.head.appendChild(css);

  // 카드의 실제 제목을 읽어서 정확한 이미지 파일을 연결합니다.
  document.querySelectorAll('.quick-card').forEach(card=>{
    const text=(card.innerText||'').trim();
    const key=Object.keys(images.quick).find(k=>text.includes(k));
    if(key) card.style.setProperty('--card-image',`url("${url(images.quick[key])}")`);
  });

  document.querySelectorAll('.test-card').forEach(card=>{
    const text=(card.innerText||'').trim();
    const key=Object.keys(images.tests).find(k=>text.includes(k));
    if(key) card.style.setProperty('--card-image',`url("${url(images.tests[key])}")`);
  });

  // 위에서 넣은 CSS 변수로 실제 배경을 적용합니다.
  const apply=document.createElement('style');
  apply.textContent=`
    .quick-card::before,.test-card::before{background-image:var(--card-image)}
  `;
  document.head.appendChild(apply);
})();
