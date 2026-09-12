// 홈 메뉴와 생년월일 입력 UI를 보정합니다.
(function(){
  function patchHome(){
    const tests=document.getElementById('tests');
    if(tests)tests.style.display='none';
    document.querySelectorAll('a[href="#tests"]').forEach(link=>link.href='/test/');
    const form=document.getElementById('birthForm'),oldInput=document.getElementById('birthYear'),result=document.getElementById('birthResult');
    if(!form||!oldInput||!result){setTimeout(patchHome,100);return;}
    if(document.getElementById('birthDate'))return;
    const fortuneHeading=document.querySelector('#fortune .head h2');
    if(fortuneHeading)fortuneHeading.textContent='오늘의 운세';
    const birthCopy=document.querySelector('#fortune .birth-copy span'),badge=document.querySelector('#fortune .badge'),summaryTitle=document.getElementById('summaryTitle'),score=document.getElementById('score');
    if(birthCopy)birthCopy.textContent='생년월일을 설정한 후 운세 보기 버튼을 눌러주세요.';

    // 운세 결과가 나오기 전에도 실제 결과 카드와 같은 크기의 안내 영역을 보여줍니다.
    const overview=document.querySelector('#fortune .overview'),four=document.querySelector('#fortune .four');
    let emptySpace=document.querySelector('#fortune .fortune-empty');
    if(overview&&!emptySpace){
      emptySpace=document.createElement('div');
      emptySpace.className='fortune-empty';
      emptySpace.innerHTML='<div class="fortune-empty-main card"><span class="fortune-empty-badge">오늘의 운세</span><h3>생년월일을 설정해주세요.</h3><p>생년월일을 입력하고 <b>운세 보기</b>를 누르면 오늘의 운세가 이곳에 표시됩니다.</p><div class="fortune-empty-score">— <small>/ 100 오늘의 운세 점수</small></div></div><div class="fortune-empty-lucky card"><h3>오늘의 행운 포인트</h3><div class="fortune-empty-row"><span>행운의 색</span><b>설정 후 확인</b></div><div class="fortune-empty-row"><span>행운의 숫자</span><b>—</b></div><div class="fortune-empty-row"><span>좋은 시간</span><b>—</b></div><div class="fortune-empty-row"><span>좋은 방향</span><b>—</b></div><div class="fortune-empty-row"><span>행운의 아이템</span><b>—</b></div></div><div class="fortune-empty-four"><div class="fortune-empty-mini card"><b>재물운</b><strong>—</strong><small>생년월일 설정 후 확인할 수 있어요.</small></div><div class="fortune-empty-mini card"><b>애정운</b><strong>—</strong><small>생년월일 설정 후 확인할 수 있어요.</small></div><div class="fortune-empty-mini card"><b>직장운</b><strong>—</strong><small>생년월일 설정 후 확인할 수 있어요.</small></div><div class="fortune-empty-mini card"><b>건강운</b><strong>—</strong><small>생년월일 설정 후 확인할 수 있어요.</small></div></div>';
      overview.parentNode.insertBefore(emptySpace,overview);
    }

    // 직접 만든 날짜 선택 버튼으로 브라우저 기본 화살표 없이 작동시킵니다.
    oldInput.outerHTML='<div class="birth-date-trigger" tabindex="0" role="button" aria-label="생년월일 선택"><span class="birth-date-icon">▣</span><span class="birth-date-value">생년월일 선택</span></div>';
    const trigger=document.querySelector('.birth-date-trigger');
    if(!trigger)return;
    const input=document.createElement('input');input.id='birthDate';input.type='hidden';trigger.appendChild(input);
    const valueText=trigger.querySelector('.birth-date-value');
    const today=new Date(),minYear=1900,maxDate=new Date(today.getFullYear(),today.getMonth(),today.getDate());
    let viewYear=today.getFullYear(),viewMonth=today.getMonth();
    const saved=localStorage.getItem('mira_birth_date');
    if(saved){input.value=saved;const p=saved.split('-').map(Number);if(p.length===3){viewYear=p[0];viewMonth=p[1]-1;}}
    function renderDate(){if(input.value){const p=input.value.split('-');valueText.textContent=p[0]+'.'+p[1]+'.'+p[2];valueText.classList.add('has-value');}else{valueText.textContent='생년월일 선택';valueText.classList.remove('has-value');}}
    renderDate();
    const animals=[['쥐','子'],['소','丑'],['호랑이','寅'],['토끼','卯'],['용','辰'],['뱀','巳'],['말','午'],['양','未'],['원숭이','申'],['닭','酉'],['개','戌'],['돼지','亥']];
    function applyBirthDate(v){const p=v.split('-').map(Number);if(p.length!==3||p.some(Number.isNaN))return;const [y,m,d]=p,a=animals[(y-2020+120)%12],now=new Date(),personal=76+((y*31+m*17+d*13+now.getDate()*7+now.getMonth()*11)%20);result.textContent=y+'.'+String(m).padStart(2,'0')+'.'+String(d).padStart(2,'0')+' · '+a[0];if(badge)badge.innerHTML='오늘의 '+a[0]+' 운세 <span class="personal-badge">PERSONAL</span>';if(summaryTitle)summaryTitle.textContent=personal>=90?'오늘은 흐름을 적극적으로 잡아보세요.':personal>=84?'차분하게 움직이면 좋은 흐름이 이어져요.':'작은 선택 하나가 오늘의 분위기를 바꿔요.';if(score)score.textContent=personal;}

    // 달력 안에서 연도를 클릭하면 연도 선택 화면으로 전환합니다.
    const picker=document.createElement('div');picker.className='birth-picker';
    picker.innerHTML='<div class="birth-picker-head"><button type="button" class="bp-prev">‹</button><button type="button" class="bp-title"></button><button type="button" class="bp-next">›</button></div><div class="bp-year-panel"></div><div class="bp-week"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span></div><div class="bp-days"></div>';
    document.body.appendChild(picker);
    const title=picker.querySelector('.bp-title'),days=picker.querySelector('.bp-days'),yearPanel=picker.querySelector('.bp-year-panel');
    const pad=n=>String(n).padStart(2,'0'),key=(y,m,d)=>y+'-'+pad(m+1)+'-'+pad(d);
    let yearMode=false;
    function renderCalendar(){yearMode=false;yearPanel.classList.remove('open');picker.querySelector('.bp-week').style.display='grid';days.style.display='grid';title.textContent=viewYear+'년 '+(viewMonth+1)+'월';days.innerHTML='';const first=new Date(viewYear,viewMonth,1).getDay(),last=new Date(viewYear,viewMonth+1,0).getDate();for(let i=0;i<first;i++){const e=document.createElement('span');e.className='bp-empty';days.appendChild(e);}for(let d=1;d<=last;d++){const k=key(viewYear,viewMonth,d),btn=document.createElement('button');btn.type='button';btn.className='bp-day';btn.textContent=d;const dt=new Date(viewYear,viewMonth,d);btn.disabled=dt>maxDate||viewYear<minYear;if(input.value===k)btn.classList.add('selected');if(dt.toDateString()===today.toDateString())btn.classList.add('today');btn.addEventListener('click',e=>{e.stopPropagation();input.value=k;localStorage.setItem('mira_birth_date',k);renderDate();closePicker();});days.appendChild(btn);}picker.querySelector('.bp-prev').disabled=viewYear===minYear&&viewMonth===0;picker.querySelector('.bp-next').disabled=viewYear===maxDate.getFullYear()&&viewMonth===maxDate.getMonth();}
    function renderYears(){yearMode=true;yearPanel.classList.add('open');picker.querySelector('.bp-week').style.display='none';days.style.display='none';const start=Math.max(minYear,Math.floor(viewYear/12)*12);yearPanel.innerHTML='';for(let y=start;y<start+12&&y<=maxDate.getFullYear();y++){const b=document.createElement('button');b.type='button';b.className='bp-year';b.textContent=y+'년';if(y===viewYear)b.classList.add('selected');b.addEventListener('click',e=>{e.stopPropagation();viewYear=y;if(viewMonth>maxDate.getMonth()&&y===maxDate.getFullYear())viewMonth=maxDate.getMonth();renderCalendar();});yearPanel.appendChild(b);}}
    function positionPicker(){const r=trigger.getBoundingClientRect();picker.style.left=Math.max(12,Math.min(window.innerWidth-292,r.left))+'px';picker.style.top=Math.min(window.innerHeight-330,r.bottom+8)+'px';}
    function openPicker(){positionPicker();renderCalendar();picker.classList.add('open');}
    function closePicker(){picker.classList.remove('open');yearMode=false;}
    trigger.addEventListener('click',e=>{e.stopPropagation();picker.classList.contains('open')?closePicker():openPicker();});
    trigger.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();picker.classList.contains('open')?closePicker():openPicker();}});
    title.addEventListener('click',e=>{e.stopPropagation();yearMode?renderCalendar():renderYears();});
    picker.querySelector('.bp-prev').addEventListener('click',e=>{e.stopPropagation();if(yearMode){viewYear=Math.max(minYear,viewYear-12);renderYears();return;}if(viewMonth===0){viewYear--;viewMonth=11;}else viewMonth--;renderCalendar();});
    picker.querySelector('.bp-next').addEventListener('click',e=>{e.stopPropagation();if(yearMode){viewYear=Math.min(maxDate.getFullYear(),viewYear+12);renderYears();return;}if(viewMonth===11){viewYear++;viewMonth=0;}else viewMonth++;renderCalendar();});
    document.addEventListener('click',e=>{if(!trigger.contains(e.target)&&!picker.contains(e.target))closePicker();});
    window.addEventListener('resize',()=>{if(picker.classList.contains('open'))positionPicker();});
    form.addEventListener('submit',e=>{e.preventDefault();if(!input.value){result.textContent='생년월일을 먼저 설정해주세요.';openPicker();return;}localStorage.setItem('mira_birth_date',input.value);renderDate();applyBirthDate(input.value);showFortune();closePicker();});

    // 저장된 날짜가 있어도 버튼을 누르기 전에는 결과를 보여주지 않습니다.
    if(saved)renderDate();

    // 초기화 버튼을 만들어 저장된 생년월일과 운세 결과를 모두 지웁니다.
    const resetBtn=document.createElement('button');
    resetBtn.type='button';
    resetBtn.className='birth-reset';
    resetBtn.textContent='초기화';
    form.appendChild(resetBtn);
    resetBtn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      input.value='';
      localStorage.removeItem('mira_birth_date');
      renderDate();
      result.textContent='';
      if(badge)badge.innerHTML='';
      if(summaryTitle)summaryTitle.textContent='';
      if(score)score.textContent='';
      if(overview)overview.classList.remove('fortune-visible');
      if(four)four.classList.remove('fortune-visible');
      if(emptySpace)emptySpace.classList.remove('fortune-hidden');
      closePicker();
    });

    // 설정 완료 후 '운세 보기' 버튼을 눌렀을 때만 결과 영역을 공개합니다.
    function showFortune(){if(emptySpace)emptySpace.classList.add('fortune-hidden');if(overview)overview.classList.add('fortune-visible');if(four)four.classList.add('fortune-visible');}
    if(overview)overview.classList.remove('fortune-visible');
    if(four)four.classList.remove('fortune-visible');
    if(emptySpace)emptySpace.classList.remove('fortune-hidden');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchHome);else patchHome();
})();

// 날짜 선택 UI와 초기화 버튼, 입력 전 안내 카드 영역을 깔끔하게 표시합니다.
(function(){const style=document.createElement('style');style.textContent=`
.birth-date-trigger{position:relative;width:230px;height:48px;display:flex;align-items:center;padding:0 14px;background:#f8f5ed;border:1px solid #d7d0c1;border-radius:12px;color:#89928a;cursor:pointer;overflow:hidden;box-sizing:border-box;user-select:none}.birth-date-trigger:hover{border-color:#a9bda9;background:#fbf9f3}.birth-date-trigger:focus{outline:none;border-color:#5c8d71;box-shadow:0 0 0 4px rgba(92,141,113,.12);background:#fffdf8}.birth-date-icon{width:28px;flex:0 0 28px;color:#aa8f59;font-size:13px;pointer-events:none}.birth-date-value{font-size:14px;font-weight:700;pointer-events:none}.birth-date-value.has-value{color:#244638}.birth-reset{height:38px;border:1px solid #d7d0c1;border-radius:9px;background:#fbf9f2;color:#7b837c;padding:0 13px;font-size:12px;font-weight:900;cursor:pointer}.birth-reset:hover{background:#f1eee5;border-color:#c8c0b1;color:#52675a}
.birth-picker{position:fixed;z-index:99999;width:280px;padding:14px;background:#fffdf8;border:1px solid #ddd6c7;border-radius:16px;box-shadow:0 16px 40px rgba(36,70,56,.16);display:none}.birth-picker.open{display:block}.birth-picker-head{display:grid;grid-template-columns:36px 1fr 36px;align-items:center;margin-bottom:10px}.bp-title{border:0;background:transparent;text-align:center;font-size:14px;font-weight:900;color:#244638;cursor:pointer;padding:7px;border-radius:8px}.bp-title:hover{background:#eaf2eb}.birth-picker-head button:not(.bp-title){width:32px;height:32px;border:0;border-radius:9px;background:#f1f4ee;color:#507960;font-size:22px;cursor:pointer}.birth-picker-head button:hover{background:#e4eee5}.birth-picker-head button:disabled{opacity:.3;cursor:default}.bp-year-panel{display:none;grid-template-columns:repeat(3,1fr);gap:6px;margin:4px 0 8px}.bp-year-panel.open{display:grid}.bp-year{height:38px;border:0;border-radius:9px;background:#f6f3eb;color:#52675a;font-size:11px;cursor:pointer}.bp-year:hover{background:#eaf2eb}.bp-year.selected{background:#5c8d71;color:#fff;font-weight:900}.bp-week,.bp-days{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}.bp-week span{text-align:center;font-size:10px;color:#999f98;padding:5px 0}.bp-days{margin-top:3px}.bp-day,.bp-empty{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:0;border-radius:9px;background:transparent;font-size:11px;color:#52675a;cursor:pointer}.bp-day:hover{background:#eaf2eb;color:#244638}.bp-day.today{box-shadow:inset 0 0 0 1px #b9ccb9}.bp-day.selected{background:#5c8d71;color:#fff;font-weight:900}.bp-day:disabled{color:#d4d2ca;cursor:default;background:transparent}
#fortune .overview,#fortune .four{display:none}#fortune .overview.fortune-visible{display:grid}#fortune .four.fortune-visible{display:grid}.fortune-empty{display:grid;grid-template-columns:1.35fr .65fr;gap:10px;width:100%;box-sizing:border-box}.fortune-empty .card{background:var(--paper);border:1px solid var(--line);border-radius:15px;box-shadow:0 8px 24px rgba(42,60,47,.06)}.fortune-empty-main{padding:17px 19px;min-height:190px}.fortune-empty-badge{display:inline-block;padding:6px 10px;border-radius:99px;background:var(--soft);color:#507960;font-size:11px;font-weight:900}.fortune-empty-main h3{font-size:24px;margin:11px 0 6px}.fortune-empty-main p{font-size:13px;color:var(--muted);line-height:1.75;margin:0}.fortune-empty-main p b{color:var(--deep)}.fortune-empty-score{display:flex;align-items:end;gap:6px;margin-top:10px;font-size:40px;color:#aeb6af;font-weight:700}.fortune-empty-score small{font-size:11px;color:#90978f;padding-bottom:6px;font-weight:400}.fortune-empty-lucky{padding:15px 17px}.fortune-empty-lucky h3{font-size:16px;margin:0 0 7px}.fortune-empty-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px dashed #e4dfd5;font-size:12px;color:#858c85}.fortune-empty-row:last-child{border:0}.fortune-empty-row b{padding:6px 9px;border-radius:8px;background:#f1f3ed;color:#a0a79f;font-size:11px}.fortune-empty-four{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.fortune-empty-mini{padding:14px;min-height:91px}.fortune-empty-mini b{display:block;font-size:12px;color:#7b837c;margin:0 0 8px}.fortune-empty-mini strong{font-size:18px;color:#aeb6af}.fortune-empty-mini small{display:block;color:#929990;font-size:10px;margin-top:6px;line-height:1.45}.fortune-empty.fortune-hidden{display:none}
@media(max-width:760px) and (hover:none) and (pointer:coarse){.birth-date-trigger{width:auto;flex:1;height:46px}.birth-date-icon{width:26px;flex-basis:26px}.birth-picker{width:calc(100vw - 24px);max-width:320px}.bp-day,.bp-empty{width:100%;height:34px}.birth-form{display:flex;flex-wrap:wrap}.birth-form .birth-date-trigger{flex:1;min-width:0}.birth-reset{height:38px}.fortune-empty{grid-template-columns:1fr}.fortune-empty-four{grid-template-columns:repeat(2,1fr)}.fortune-empty-main{min-height:170px}}
`;document.head.appendChild(style);})();