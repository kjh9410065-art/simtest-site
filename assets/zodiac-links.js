// 홈 화면의 메뉴와 개인 운세 입력 UI를 보정합니다.
(function(){
  function patchHome(){
    // 심리테스트 목록은 홈에서 숨기고 별도 목록 페이지로 이동합니다.
    const tests=document.getElementById('tests');
    if(tests)tests.style.display='none';
    document.querySelectorAll('a[href="#tests"]').forEach(link=>{link.href='/test/';});

    const form=document.getElementById('birthForm');
    const oldInput=document.getElementById('birthYear');
    const result=document.getElementById('birthResult');
    const badge=document.querySelector('#fortune .badge');
    const summaryTitle=document.getElementById('summaryTitle');
    const score=document.getElementById('score');
    const birthCopy=document.querySelector('#fortune .birth-copy span');

    // 홈의 기존 스크립트가 입력칸을 만든 뒤 한 번만 패치합니다.
    if(!form||!oldInput||!result){setTimeout(patchHome,50);return;}
    if(document.getElementById('birthDate'))return;

    // 안내 문구를 생년월일 기준으로 변경합니다.
    if(birthCopy)birthCopy.textContent='생년월일을 입력하면 나의 오늘의 운세를 확인할 수 있어요.';

    // 기존 숫자 입력칸을 날짜 선택 UI로 교체합니다.
    oldInput.outerHTML='<div class="birth-date-wrap" role="button" tabindex="0" aria-label="생년월일 선택"><span class="birth-date-icon">▣</span><input id="birthDate" type="date" min="1900-01-01" max="'+new Date().toISOString().slice(0,10)+'" aria-label="생년월일"><span class="birth-date-label">생년월일 선택</span></div>';
    const wrap=document.querySelector('.birth-date-wrap');
    const input=document.getElementById('birthDate');
    if(!input||!wrap)return;

    // 입력칸뿐 아니라 날짜 박스 어느 곳을 눌러도 달력이 열리게 합니다.
    function openDatePicker(){
      input.focus();
      if(typeof input.showPicker==='function'){
        try{input.showPicker();}catch(e){}
      }
    }
    wrap.addEventListener('click',function(e){
      if(e.target!==input)openDatePicker();
    });
    wrap.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();openDatePicker();}
    });

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

    // 날짜를 선택하면 바로 저장하고 결과를 갱신합니다.
    input.addEventListener('change',function(){
      if(input.value){
        localStorage.setItem('mira_birth_date',input.value);
        applyBirthDate(input.value);
      }
    });

    // 버튼을 누르면 생년월일을 저장하고 개인 운세를 갱신합니다.
    form.addEventListener('submit',function(e){
      e.preventDefault();
      const value=input.value;
      if(!/^\d{4}-\d{2}-\d{2}$/.test(value)){
        result.textContent='생년월일을 선택해주세요.';
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

// 날짜 입력 UI의 실제 디자인을 추가합니다.
(function(){
  const style=document.createElement('style');
  style.textContent=`
    .birth-date-wrap{position:relative;width:230px;height:48px;display:flex;align-items:center;background:#f8f5ed;border:1px solid #d7d0c1;border-radius:12px;transition:.18s ease;overflow:hidden;cursor:pointer}
    .birth-date-wrap:hover{border-color:#a9bda9;background:#fbf9f3}
    .birth-date-wrap:focus-within{border-color:#5c8d71;box-shadow:0 0 0 4px rgba(92,141,113,.12);background:#fffdf8}
    .birth-date-icon{width:42px;text-align:center;font-size:15px;color:#aa8f59;pointer-events:none}
    .birth-date-wrap input{width:100%;height:100%;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;padding:0 9px 0 0!important;font-size:14px!important;font-weight:700;color:#244638;outline:none;cursor:pointer}
    .birth-date-label{position:absolute;left:43px;top:50%;transform:translateY(-50%);font-size:11px;color:#89928a;pointer-events:none;transition:.15s ease}
    .birth-date-wrap input:not(:placeholder-shown)+.birth-date-label{display:none}
    .birth-date-wrap input::-webkit-calendar-picker-indicator{cursor:pointer;opacity:.65;padding:8px}
    @media(max-width:760px) and (hover:none) and (pointer:coarse){
      .birth-date-wrap{width:auto;flex:1;height:46px}
      .birth-date-icon{width:38px}
      .birth-date-label{left:39px}
    }
  `;
  document.head.appendChild(style);
})();