// 홈 화면의 메뉴와 개인 운세 입력을 보정합니다.
document.addEventListener('DOMContentLoaded',function(){
  // 심리테스트 목록은 홈에서 숨기고 별도 목록 페이지로 이동합니다.
  const tests=document.getElementById('tests');
  if(tests)tests.style.display='none';

  // 사이드 메뉴와 상단 메뉴의 심리테스트 버튼을 별도 목록 페이지로 연결합니다.
  document.querySelectorAll('a[href="#tests"]').forEach(link=>{
    link.href='/test/';
  });

  // 기존 홈 운세 스크립트가 먼저 초기화된 뒤 생년월일 입력 UI로 교체합니다.
  // 전체 index.html을 다시 작성하지 않고 개인 운세 부분만 안전하게 패치합니다.
  setTimeout(function(){
    const form=document.getElementById('birthForm');
    const oldInput=document.getElementById('birthYear');
    const result=document.getElementById('birthResult');
    const badge=document.querySelector('#fortune .badge');
    const summaryTitle=document.getElementById('summaryTitle');
    const score=document.getElementById('score');
    if(!form||!oldInput||!result)return;

    // 출생년도 입력을 생년월일 입력으로 교체합니다.
    oldInput.outerHTML='<input id="birthDate" type="date" min="1900-01-01" max="2026-12-31" aria-label="생년월일">';
    const input=document.getElementById('birthDate');
    if(!input)return;

    // 저장된 생년월일을 다시 불러옵니다.
    const saved=localStorage.getItem('mira_birth_date');
    if(saved)input.value=saved;

    // 생년월일에서 띠를 계산합니다. 2020년을 쥐띠 기준으로 사용합니다.
    const animals=[['쥐','子'],['소','丑'],['호랑이','寅'],['토끼','卯'],['용','辰'],['뱀','巳'],['말','午'],['양','未'],['원숭이','申'],['닭','酉'],['개','戌'],['돼지','亥']];
    function getAnimal(year){return animals[(year-2020+120)%12]}

    // 생년월일 전체를 사용해 개인 운세 점수를 계산합니다.
    function applyBirthDate(value){
      const parts=value.split('-').map(Number);
      if(parts.length!==3||parts.some(Number.isNaN))return;
      const [year,month,day]=parts;
      const animal=getAnimal(year);
      const personal=76+((year*31+month*17+day*13+new Date().getDate()*7+new Date().getMonth()*11)%20);
      result.textContent=`${year}.${String(month).padStart(2,'0')}.${String(day).padStart(2,'0')} · ${animal[0]}`;
      if(badge)badge.innerHTML=`오늘의 ${animal[0]} 운세 <span class="personal-badge">PERSONAL</span>`;
      if(summaryTitle)summaryTitle.textContent=personal>=90?'오늘은 흐름을 적극적으로 잡아보세요.':personal>=84?'차분하게 움직이면 좋은 흐름이 이어져요.':'작은 선택 하나가 오늘의 분위기를 바꿔요.';
      if(score)score.textContent=personal;
    }

    // 버튼을 누르면 생년월일을 저장하고 개인 운세를 갱신합니다.
    form.addEventListener('submit',function(e){
      e.preventDefault();
      const value=input.value;
      if(!/^\d{4}-\d{2}-\d{2}$/.test(value)){
        result.textContent='생년월일을 입력해주세요.';
        return;
      }
      const date=new Date(value+'T00:00:00');
      if(Number.isNaN(date.getTime())){
        result.textContent='올바른 생년월일을 입력해주세요.';
        return;
      }
      localStorage.setItem('mira_birth_date',value);
      applyBirthDate(value);
    });

    // 저장된 생년월일이 있으면 자동으로 개인 운세를 복원합니다.
    if(saved)applyBirthDate(saved);
  },0);
});