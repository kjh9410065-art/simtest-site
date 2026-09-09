// 생성된 사이트 이미지를 현재 카드 UI에 연결합니다.
(function(){
  const root='';
  const images={
    quick:[
      '고요한 창가의 타로 카드 정물.png',
      '꽃잎 흩날리는 호숫가의 봄 풍경.png',
      '바다를 품은 아늑한 카페 공간.png',
      '따뜻한 햇살 아래 온라인 커뮤니티 카페.png'
    ],
    tests:[
      '꿈결 같은 태양 오라클 카드 정원.png',
      '바다 가득한 MBTI 아지트.png',
      '수많은 카페의 즐거운 모임.png',
      '수영하는 사람들은 작업 공간.png'
    ]
  };
  const esc=s=>encodeURIComponent(s);
  const style=document.createElement('style');
  style.textContent=`
    .quick-card,.test-card{position:relative;overflow:hidden}
    .quick-card:before,.test-card:before{content:"";position:absolute;inset:0;background-size:cover;background-position:center;opacity:.22;border-radius:inherit;pointer-events:none}
    .quick-card>*,.test-card>*{position:relative;z-index:1}
    ${images.quick.map((x,i)=>`.quick-card:nth-child(${i+1}):before{background-image:url("${root}${esc(x)}")}`).join('')}
    ${images.tests.map((x,i)=>`.test-card:nth-child(${i+1}):before{background-image:url("${root}${esc(x)}")}`).join('')}
  `;
  document.head.appendChild(style);
})();
