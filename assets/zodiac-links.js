// 홈 화면의 메뉴와 개인 운세 입력을 보정합니다.
(function(){
  // 페이지가 이미 로드된 경우 즉시 실행하고, 아직 로드 전이면 DOMContentLoaded 후 실행합니다.
  function patchHome(){
    // 심리테스트 목록은 홈에서 숨기고 별도 목록 페이지로 이동합니다.
    const tests=document.getElementById('tests');
    if(tests)tests.style.display='none';

    // 심리테스트 메뉴를 별도 목록 페이지로 연결합니다.
    document.querySelectorAll('a[href="#tests"]').forEach(link=>{link.href='/test/';});

    const form=document.getElementById('birthForm');
    const oldInput=document.getElementById('birthYear');
    const result=document.getElementById('birthResult');
    const badge=document.querySelector('#fortune .badge');
    const summaryTitle=document.getElementById('summaryTitle');
    const score=document.getElementById('score');
    const birthCopy=document.querySelector('#fortune .birth-copy span');

    // 필요한 요소가 아직 만들어지지 않았다면 잠시 후 다시 확인합니다.
    if(!form||!oldInput||!result){setTimeout(patchHome,50);return;}

    // 이미 생년월일 입력으로 교체된 경우 중복 실행하지 않습니다.
    if(document.getElementById('birthDate'))return;

    // 안내 문구도 출생년도에서 생년월일 기준으로 변경합니다.
    if(birthCopy)birthCopy.textContent='생년월일을 입력하면 나의 오늘의 운세를 확인할 수 있어요.';

    // 출생년도 입력을 생년월일 입력으로 교체합니다.
    oldInput.outerHTML='<input id="birthDate" type="date" min="1900-01-01" max="'+new Date().toISOString().slice(0,10)+'" aria-label="생년월일">';
    const input=document.getElementById('birthDate');
    if(!input)return;

    // 저장된 생년월일을 다시 불러옵니다.
    const saved=localStorage.getItem('mira_birth_date');
    if(saved)input.value=saved;

    // 생년월일의 연도를 기준으로 띠를 계산합니다.
    const animals=[['쥐','子'],['소','丑'],['호랑이','寅'],['토끼','卯'],['용','辰'],['뱀','巳'],['말','午'],['양','未'],['원숭이','申'],['닭','酉'],['개','戌'],['돼지','亥']];
    function getAnimal(year){return animals[(year-2020+120)%12];}

    // 생년월일 전체를 사용해 개인 운세 점수를 계산합니다.
    function applyBirthDate(value){
      const parts=value.split('-').map(Number);
      if(parts.length!==3||parts.some(Number.isNaN))return;
      const [year,month,day]=parts;
      const animal=getAnimal(year);
      const now=new Date();
      const personal=76+((year*31+month*17+day*13+now.getDate()*7+now.getMonth()*11)%20);
      result.textContent=year+'.'+String(month).padStart(2,'0')+'.'+String(day).padStart(2,'0')+' · '+animal[0];
      if(badge)badge.innerHTML='오늘의 '+animal[0]+' 운세 <span class="personal-badge">PERSONAL</span>';
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
      localStorage.setItem('mira_birth_date',value);
      applyBirthDate(value);
    });

    // 저장된 생년월일이 있으면 자동으로 개인 운세를 복원합니다.
    if(saved)applyBirthDate(saved);
  }

  // DOM이 준비되면 패치를 적용합니다.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchHome);
  else patchHome();
})();