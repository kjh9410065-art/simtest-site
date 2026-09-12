// 홈 화면의 메뉴와 개인 운세 입력 UI를 보정합니다.
(function(){
  function patchHome(){
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

    // 기존 홈 스크립트가 입력칸을 만든 뒤 한 번만 패치합니다.
    if(!form||!oldInput||!result){setTimeout(patchHome,50);return;}
    if(document.getElementById('birthDate'))return;

    if(birthCopy)birthCopy.textContent='생년월일을 입력하면 나의 오늘의 운세를 확인할 수 있어요.';

    // 실제 date input을 박스 전체에 투명하게 덮어씌워 어느 곳을 눌러도
    // 브라우저의 기본 날짜 선택창이 열리도록 합니다.
    oldInput.outerHTML='<div class="birth-date-wrap" tabindex="0" aria-label="생년월일 선택"><span class="birth-date-icon">▣</span><span class="birth-date-value">생년월일 선택</span><input id="birthDate" type="date" min="1900-01-01" max="'+new Date().toISOString().slice(0,10)+'" aria-label="생년월일"></div>';
    const wrap=document.querySelector('.birth-date-wrap');
    const input=document.getElementById('birthDate');
    const valueText=wrap&&wrap.querySelector('.birth-date-value');
    if(!input||!wrap)return;

    function renderDate(){
      if(input.value){
        const [y,m,d]=input.value.split('-');
        valueText.textContent=y+'.'+m+'.'+d;
        valueText.classList.add('has-value');
      }else{
        valueText.textContent='생년월일 선택';
        valueText.classList.remove('has-value');
      }
    }

    // 저장된 생년월일을 다시 불러옵니다.
    const saved=localStorage.getItem('mira_birth_date');
    if(saved)input.value=saved;
    renderDate();

    // 생년월일의 연도를 기준으로 띠를 계산합니다.
    const animals=[['쥐','子'],['소','丑'],['호랑이','寅'],['토끼','卯'],['용','辰'],['뱀','巳'],['말','午'],['양','未'],['원숭이','申'],['닭','酉'],['개','戌'],['돼지','亥']];
    function getAnimal(year){return animals[(year-2020+120)%12];}

    // 생년월일 전체를 사용해 개인 운세 점수를 계산합니다.
    function applyBirthDate(dateValue){
      const parts=dateValue.split('-').map(Number);
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

    // 날짜가 선택되면 즉시 저장하고 운세 결과를 갱신합니다.
    input.addEventListener('change',function(){
      renderDate();
      if(input.value){
        localStorage.setItem('mira_birth_date',input.value);
        applyBirthDate(input.value);
      }
    });

    form.addEventListener('submit',function(e){
      e.preventDefault();
      const value=input.value;
      if(!/^\d{4}-\d{2}-\d{2}$/.test(value)){
        result.textContent='생년월일을 선택해주세요.';
        return;
      }
      localStorage.setItem('mira_birth_date',value);
      renderDate();
      applyBirthDate(value);
    });

    // 접근성: 키보드로도 날짜 선택 영역을 열 수 있습니다.
    wrap.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){
        e.preventDefault();
        input.focus();
        if(typeof input.showPicker==='function'){
          try{input.showPicker();}catch(err){input.click();}
        }else input.click();
      }
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchHome);
  else patchHome();
})();

// 날짜 입력칸을 깔끔하게 만들고 실제 input을 박스 전체에 배치합니다.
(function(){
  const style=document.createElement('style');
  style.textContent=`
    .birth-date-wrap{position:relative;width:230px;height:48px;display:flex;align-items:center;background:#f8f5ed;border:1px solid #d7d0c1;border-radius:12px;overflow:hidden;cursor:pointer;transition:.18s ease}
    .birth-date-wrap:hover{border-color:#a9bda9;background:#fbf9f3}
    .birth-date-wrap:focus-within{border-color:#5c8d71;box-shadow:0 0 0 4px rgba(92,141,113,.12);background:#fffdf8}
    .birth-date-icon{width:42px;flex:0 0 42px;text-align:center;font-size:14px;color:#aa8f59;pointer-events:none}
    .birth-date-value{font-size:14px;font-weight:700;color:#89928a;pointer-events:none;user-select:none}
    .birth-date-value.has-value{color:#244638}
    .birth-date-wrap input{position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0!important;border-radius:12px!important;background:transparent!important;opacity:0;cursor:pointer;z-index:5}
    @media(max-width:760px) and (hover:none) and (pointer:coarse){.birth-date-wrap{width:auto;flex:1;height:46px}.birth-date-icon{width:38px;flex-basis:38px}}
  `;
  document.head.appendChild(style);
})();