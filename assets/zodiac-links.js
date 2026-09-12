// 홈 화면의 메뉴와 생년월일 입력 UI를 보정합니다.
(function(){
  function patchHome(){
    // 심리테스트 메뉴는 별도 페이지로 이동합니다.
    const tests=document.getElementById('tests');
    if(tests)tests.style.display='none';
    document.querySelectorAll('a[href="#tests"]').forEach(link=>link.href='/test/');

    const form=document.getElementById('birthForm');
    const oldInput=document.getElementById('birthYear');
    const result=document.getElementById('birthResult');
    if(!form||!oldInput||!result){setTimeout(patchHome,100);return;}
    if(document.getElementById('birthDate'))return;

    const birthCopy=document.querySelector('#fortune .birth-copy span');
    const badge=document.querySelector('#fortune .badge');
    const summaryTitle=document.getElementById('summaryTitle');
    const score=document.getElementById('score');
    if(birthCopy)birthCopy.textContent='생년월일을 입력하면 나의 오늘의 운세를 확인할 수 있어요.';

    // 날짜 입력을 버튼처럼 보이는 하나의 큰 영역으로 교체합니다.
    oldInput.outerHTML='<button type="button" class="birth-date-trigger" aria-label="생년월일 선택"><span class="birth-date-icon">▣</span><span class="birth-date-value">생년월일 선택</span><span class="birth-date-arrow">⌄</span><input id="birthDate" type="date" min="1900-01-01" max="'+new Date().toISOString().slice(0,10)+'" tabindex="-1" aria-hidden="true"></button>';

    const trigger=document.querySelector('.birth-date-trigger');
    const input=document.getElementById('birthDate');
    const valueText=trigger&&trigger.querySelector('.birth-date-value');
    if(!trigger||!input)return;

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

    // 버튼 전체 클릭을 브라우저의 실제 날짜 선택창 호출로 연결합니다.
    function openPicker(){
      input.focus({preventScroll:true});
      try{
        if(typeof input.showPicker==='function') input.showPicker();
        else input.click();
      }catch(e){
        input.click();
      }
    }
    trigger.addEventListener('click',openPicker);

    // 날짜를 선택하면 즉시 표시와 운세 결과를 갱신합니다.
    input.addEventListener('change',function(){
      renderDate();
      if(input.value){
        localStorage.setItem('mira_birth_date',input.value);
        applyBirthDate(input.value);
      }
    });

    const saved=localStorage.getItem('mira_birth_date');
    if(saved)input.value=saved;
    renderDate();

    // 생년월일 연도를 기준으로 띠를 계산합니다.
    const animals=[['쥐','子'],['소','丑'],['호랑이','寅'],['토끼','卯'],['용','辰'],['뱀','巳'],['말','午'],['양','未'],['원숭이','申'],['닭','酉'],['개','戌'],['돼지','亥']];
    function getAnimal(year){return animals[(year-2020+120)%12];}

    // 생년월일과 오늘 날짜를 이용해 개인 운세 점수를 계산합니다.
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

    // 기존 운세 확인 버튼도 생년월일을 기준으로 작동하게 합니다.
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!input.value){
        result.textContent='생년월일을 선택해주세요.';
        openPicker();
        return;
      }
      localStorage.setItem('mira_birth_date',input.value);
      renderDate();
      applyBirthDate(input.value);
    });

    if(saved)applyBirthDate(saved);
  }

  // 기존 홈 스크립트가 입력칸을 만든 뒤 패치를 적용합니다.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchHome);
  else patchHome();
})();

// 생년월일 선택 영역의 디자인입니다.
(function(){
  const style=document.createElement('style');
  style.textContent=`
    .birth-date-trigger{position:relative;width:230px;height:48px;display:flex;align-items:center;gap:0;margin:0;padding:0 12px;background:#f8f5ed;border:1px solid #d7d0c1;border-radius:12px;color:#89928a;cursor:pointer;overflow:hidden;text-align:left;font:inherit}
    .birth-date-trigger:hover{border-color:#a9bda9;background:#fbf9f3}
    .birth-date-trigger:focus{outline:none;border-color:#5c8d71;box-shadow:0 0 0 4px rgba(92,141,113,.12);background:#fffdf8}
    .birth-date-icon{width:28px;flex:0 0 28px;text-align:left;font-size:13px;color:#aa8f59;pointer-events:none}
    .birth-date-value{font-size:14px;font-weight:700;line-height:1;pointer-events:none;user-select:none}
    .birth-date-value.has-value{color:#244638}
    .birth-date-arrow{margin-left:auto;font-size:19px;line-height:1;color:#66736a;pointer-events:none;transform:translateY(-2px)}
    .birth-date-trigger input{position:absolute;inset:0;width:100%;height:100%;opacity:0;pointer-events:none}
    @media(max-width:760px) and (hover:none) and (pointer:coarse){.birth-date-trigger{width:auto;flex:1;height:46px}.birth-date-icon{width:26px;flex-basis:26px}}
  `;
  document.head.appendChild(style);
})();