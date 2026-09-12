// 홈 메뉴와 생년월일 운세 UI를 보정합니다.
(function(){
  function patchHome(){
    const tests=document.getElementById('tests');
    if(tests)tests.style.display='none';
    document.querySelectorAll('a[href="#tests"]').forEach(link=>link.href='/test/');

    const form=document.getElementById('birthForm');
    const oldInput=document.getElementById('birthYear');
    const result=document.getElementById('birthResult');
    if(!form||!oldInput||!result){setTimeout(patchHome,100);return;}
    if(document.getElementById('birthDate'))return;

    const heading=document.querySelector('#fortune .head h2');
    if(heading)heading.textContent='오늘의 운세';
    const copy=document.querySelector('#fortune .birth-copy span');
    if(copy)copy.textContent='생년월일을 설정한 후 운세 보기 버튼을 눌러주세요.';

    const overview=document.querySelector('#fortune .overview');
    const four=document.querySelector('#fortune .four');
    const originalOverview=overview?overview.innerHTML:'';
    const originalFour=four?four.innerHTML:'';

    // 입력 전에는 결과 카드와 같은 구조와 크기로 안내 문구만 보여줍니다.
    function renderEmptyState(){
      if(!overview||!four)return;
      overview.innerHTML=`
        <article class="card main">
          <span class="badge">오늘의 운세</span>
          <h3>생년월일을 설정하면 오늘의 운세를 확인할 수 있어요.</h3>
          <p>생년월일을 먼저 설정하고 <b>운세 보기</b> 버튼을 눌러주세요.</p>
        </article>
        <aside class="card lucky">
          <h3>오늘의 행운 포인트</h3>
          <div class="luckrow"><span>행운의 색</span><b>설정 후 확인</b></div>
          <div class="luckrow"><span>행운의 숫자</span><b>—</b></div>
          <div class="luckrow"><span>좋은 시간</span><b>—</b></div>
          <div class="luckrow"><span>좋은 방향</span><b>—</b></div>
          <div class="luckrow"><span>행운의 아이템</span><b>—</b></div>
        </aside>`;
      four.innerHTML=`
        <article class="card fortune"><h3>재물운</h3><strong>—</strong><small>생년월일을 설정하면 확인할 수 있어요.</small></article>
        <article class="card fortune"><h3>애정운</h3><strong>—</strong><small>생년월일을 설정하면 확인할 수 있어요.</small></article>
        <article class="card fortune"><h3>직장운</h3><strong>—</strong><small>생년월일을 설정하면 확인할 수 있어요.</small></article>
        <article class="card fortune"><h3>건강운</h3><strong>—</strong><small>생년월일을 설정하면 확인할 수 있어요.</small></article>`;
      overview.style.display='grid';
      four.style.display='grid';
    }

    // 운세 보기 후 원래 결과 카드 구조를 복원합니다.
    function restoreResultState(){
      if(!overview||!four)return;
      overview.innerHTML=originalOverview;
      four.innerHTML=originalFour;
      overview.style.display='grid';
      four.style.display='grid';
    }

    renderEmptyState();

    oldInput.outerHTML='<div class="birth-date-trigger" tabindex="0" role="button" aria-label="생년월일 선택"><span class="birth-date-icon">▣</span><span class="birth-date-value">생년월일 선택</span></div>';
    const trigger=document.querySelector('.birth-date-trigger');
    if(!trigger)return;
    const input=document.createElement('input');
    input.id='birthDate';
    input.type='hidden';
    trigger.appendChild(input);

    const valueText=trigger.querySelector('.birth-date-value');
    const today=new Date();
    const minYear=1900;
    const maxDate=new Date(today.getFullYear(),today.getMonth(),today.getDate());
    let viewYear=today.getFullYear();
    let viewMonth=today.getMonth();
    const saved=localStorage.getItem('mira_birth_date');
    if(saved){input.value=saved;const p=saved.split('-').map(Number);if(p.length===3){viewYear=p[0];viewMonth=p[1]-1;}}

    function renderDate(){
      if(input.value){const p=input.value.split('-');valueText.textContent=p[0]+'.'+p[1]+'.'+p[2];valueText.classList.add('has-value');}
      else{valueText.textContent='생년월일 선택';valueText.classList.remove('has-value');}
    }
    renderDate();

    const animals=['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
    function applyBirthDate(v){
      const p=v.split('-').map(Number);if(p.length!==3||p.some(Number.isNaN))return;
      const [y,m,d]=p,animal=animals[(y-2020+120)%12],now=new Date();
      const personal=76+((y*31+m*17+d*13+now.getDate()*7+now.getMonth()*11)%20);
      result.textContent=y+'.'+String(m).padStart(2,'0')+'.'+String(d).padStart(2,'0')+' · '+animal;
      const badge=document.querySelector('#fortune .badge'),summaryTitle=document.getElementById('summaryTitle'),score=document.getElementById('score');
      if(badge)badge.innerHTML='오늘의 '+animal+' 운세 <span class="personal-badge">PERSONAL</span>';
      if(summaryTitle)summaryTitle.textContent=personal>=90?'오늘은 흐름을 적극적으로 잡아보세요.':personal>=84?'차분하게 움직이면 좋은 흐름이 이어져요.':'작은 선택 하나가 오늘의 분위기를 바꿔요.';
      if(score)score.textContent=personal;
    }

    const picker=document.createElement('div');
    picker.className='birth-picker';
    picker.innerHTML='<div class="birth-picker-head"><button type="button" class="bp-prev">‹</button><button type="button" class="bp-title"></button><button type="button" class="bp-next">›</button></div><div class="bp-year-panel"></div><div class="bp-week"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span></div><div class="bp-days"></div>';
    document.body.appendChild(picker);
    const title=picker.querySelector('.bp-title'),days=picker.querySelector('.bp-days'),yearPanel=picker.querySelector('.bp-year-panel');
    const pad=n=>String(n).padStart(2,'0'),key=(y,m,d)=>y+'-'+pad(m+1)+'-'+pad(d);
    let yearMode=false;

    function renderCalendar(){
      yearMode=false;yearPanel.classList.remove('open');picker.querySelector('.bp-week').style.display='grid';days.style.display='grid';title.textContent=viewYear+'년 '+(viewMonth+1)+'월';days.innerHTML='';
      const first=new Date(viewYear,viewMonth,1).getDay(),last=new Date(viewYear,viewMonth+1,0).getDate();
      for(let i=0;i<first;i++){const e=document.createElement('span');e.className='bp-empty';days.appendChild(e);}
      for(let d=1;d<=last;d++){
        const k=key(viewYear,viewMonth,d),btn=document.createElement('button');btn.type='button';btn.className='bp-day';btn.textContent=d;
        const dt=new Date(viewYear,viewMonth,d);btn.disabled=dt>maxDate||viewYear<minYear;if(input.value===k)btn.classList.add('selected');if(dt.toDateString()===today.toDateString())btn.classList.add('today');
        btn.addEventListener('click',e=>{e.stopPropagation();input.value=k;localStorage.setItem('mira_birth_date',k);renderDate();closePicker();});days.appendChild(btn);
      }
      picker.querySelector('.bp-prev').disabled=viewYear===minYear&&viewMonth===0;
      picker.querySelector('.bp-next').disabled=viewYear===maxDate.getFullYear()&&viewMonth===maxDate.getMonth();
    }

    function renderYears(){
      yearMode=true;yearPanel.classList.add('open');picker.querySelector('.bp-week').style.display='none';days.style.display='none';
      const start=Math.max(minYear,Math.floor(viewYear/12)*12);yearPanel.innerHTML='';
      for(let y=start;y<start+12&&y<=maxDate.getFullYear();y++){
        const b=document.createElement('button');b.type='button';b.className='bp-year';b.textContent=y+'년';if(y===viewYear)b.classList.add('selected');
        b.addEventListener('click',e=>{e.stopPropagation();viewYear=y;if(viewYear===maxDate.getFullYear()&&viewMonth>maxDate.getMonth())viewMonth=maxDate.getMonth();renderCalendar();});yearPanel.appendChild(b);
      }
    }
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

    form.addEventListener('submit',e=>{
      e.preventDefault();
      if(!input.value){result.textContent='생년월일을 먼저 설정해주세요.';openPicker();return;}
      localStorage.setItem('mira_birth_date',input.value);renderDate();restoreResultState();applyBirthDate(input.value);closePicker();
    });

    const resetBtn=document.createElement('button');
    resetBtn.type='button';resetBtn.className='birth-reset';resetBtn.textContent='초기화';form.appendChild(resetBtn);
    resetBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();input.value='';localStorage.removeItem('mira_birth_date');renderDate();result.textContent='';renderEmptyState();closePicker();});
    renderEmptyState();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchHome);else patchHome();
})();

// 날짜 선택 UI와 입력 전 운세 카드가 결과 카드와 같은 크기로 보이도록 스타일을 적용합니다.
(function(){
  const style=document.createElement('style');
  style.textContent=`
.birth-date-trigger{position:relative;width:230px;height:48px;display:flex;align-items:center;padding:0 14px;background:#f8f5ed;border:1px solid #d7d0c1;border-radius:12px;color:#89928a;cursor:pointer;overflow:hidden;box-sizing:border-box;user-select:none}.birth-date-trigger:hover{border-color:#a9bda9;background:#fbf9f3}.birth-date-trigger:focus{outline:none;border-color:#5c8d71;box-shadow:0 0 0 4px rgba(92,141,113,.12);background:#fffdf8}.birth-date-icon{width:28px;flex:0 0 28px;color:#aa8f59;font-size:13px;pointer-events:none}.birth-date-value{font-size:14px;font-weight:700;pointer-events:none}.birth-date-value.has-value{color:#244638}.birth-reset{height:38px;border:1px solid #d7d0c1;border-radius:9px;background:#fbf9f2;color:#7b837c;padding:0 13px;font-size:12px;font-weight:900;cursor:pointer}.birth-reset:hover{background:#f1eee5;border-color:#c8c0b1;color:#52675a}
.birth-picker{position:fixed;z-index:99999;width:280px;padding:14px;background:#fffdf8;border:1px solid #ddd6c7;border-radius:16px;box-shadow:0 16px 40px rgba(36,70,56,.16);display:none}.birth-picker.open{display:block}.birth-picker-head{display:grid;grid-template-columns:36px 1fr 36px;align-items:center;margin-bottom:10px}.bp-title{border:0;background:transparent;text-align:center;font-size:14px;font-weight:900;color:#244638;cursor:pointer;padding:7px;border-radius:8px}.bp-title:hover{background:#eaf2eb}.birth-picker-head button:not(.bp-title){width:32px;height:32px;border:0;border-radius:9px;background:#f1f4ee;color:#507960;font-size:22px;cursor:pointer}.birth-picker-head button:hover{background:#e4eee5}.birth-picker-head button:disabled{opacity:.3;cursor:default}.bp-year-panel{display:none;grid-template-columns:repeat(3,1fr);gap:6px;margin:4px 0 8px}.bp-year-panel.open{display:grid}.bp-year{height:38px;border:0;border-radius:9px;background:#f6f3eb;color:#52675a;font-size:11px;cursor:pointer}.bp-year:hover{background:#eaf2eb}.bp-year.selected{background:#5c8d71;color:#fff;font-weight:900}.bp-week,.bp-days{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}.bp-week span{text-align:center;font-size:10px;color:#999f98;padding:5px 0}.bp-days{margin-top:3px}.bp-day,.bp-empty{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:0;border-radius:9px;background:transparent;font-size:11px;color:#52675a;cursor:pointer}.bp-day:hover{background:#eaf2eb;color:#244638}.bp-day.today{box-shadow:inset 0 0 0 1px #b9ccb9}.bp-day.selected{background:#5c8d71;color:#fff;font-weight:900}.bp-day:disabled{color:#d4d2ca;cursor:default;background:transparent}
/* 입력 전 카드의 기본 크기와 결과 카드의 읽기 영역을 맞춥니다. */
#fortune .overview{grid-template-columns:1.35fr .65fr;gap:10px}
#fortune .overview>.main,#fortune .overview>.lucky{height:232px;min-height:232px;box-sizing:border-box;overflow:hidden}
#fortune .four{grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
#fortune .four>.fortune{height:116px;min-height:116px;box-sizing:border-box;overflow:hidden}
#fortune .overview>.main{padding:17px 19px}
#fortune .overview>.lucky{padding:15px 17px}
#fortune .overview>.lucky .luckrow{padding:5px 0}
#fortune .overview>.lucky .luckrow b{padding:5px 8px}
#fortune .four>.fortune small{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
@media(max-width:760px) and (hover:none) and (pointer:coarse){
  .birth-date-trigger{width:auto;flex:1;height:46px}.birth-date-icon{width:26px;flex-basis:26px}.birth-picker{width:calc(100vw - 24px);max-width:320px}.bp-day,.bp-empty{width:100%;height:34px}.birth-form{display:flex;flex-wrap:wrap}.birth-form .birth-date-trigger{flex:1;min-width:0}.birth-reset{height:38px}
  #fortune .overview>.main,#fortune .overview>.lucky{height:232px;min-height:232px}
  #fortune .four{grid-template-columns:repeat(2,1fr)}
  #fortune .four>.fortune{height:116px;min-height:116px}
}
`;
  document.head.appendChild(style);
})();

// 결과 카드에 실제 운세 문구와 행운 정보를 채웁니다.
(function(){
  function bind(){
    const form=document.getElementById('birthForm');
    if(!form||form.dataset.resultPatch==='1'){if(!form)setTimeout(bind,100);return;}
    form.dataset.resultPatch='1';

    const colors=['연한 초록','아이보리','하늘색','베이지','연보라','세이지 그린'];
    const times=['09:00~11:00','11:00~13:00','13:00~15:00','15:00~17:00','17:00~19:00','19:00~21:00'];
    const directions=['동쪽','남동쪽','남쪽','서쪽','북서쪽','북쪽'];
    const items=['작은 지갑','손목시계','노트','향수','텀블러','이어폰'];
    const money=['계획했던 지출부터 정리하면 금전 흐름이 안정됩니다.','작은 절약이 생각보다 좋은 결과로 이어지는 날입니다.','충동구매만 피하면 무난하게 흐름을 지킬 수 있습니다.','미뤄둔 정산이나 금전 계획을 확인하기 좋은 날입니다.','새로운 지출보다 현재 가진 것을 정리하는 데 집중해보세요.','가벼운 기회가 들어오지만 결정은 한 번 더 확인하는 게 좋습니다.'];
    const love=['가까운 사람에게 먼저 따뜻하게 말을 건네면 분위기가 좋아집니다.','상대의 말을 끝까지 들어주는 것이 좋은 인상을 만듭니다.','작은 표현 하나가 관계를 부드럽게 만들어줍니다.','오늘은 서두르기보다 편안한 대화를 나누는 것이 좋습니다.','혼자 판단하기보다 상대의 입장을 한 번 생각해보세요.','새로운 만남보다 현재 관계를 다지는 데 좋은 흐름입니다.'];
    const work=['한 가지 일에 집중하면 생각보다 빠르게 결과를 만들 수 있습니다.','미뤄둔 일을 하나씩 끝내면 전체 흐름이 깔끔해집니다.','동료와의 짧은 소통이 업무 진행에 도움이 됩니다.','중요한 결정은 서두르지 말고 마지막 조건을 확인하세요.','작은 아이디어라도 메모해두면 다음 기회로 이어질 수 있습니다.','오늘은 속도보다 실수를 줄이는 것이 더 중요한 날입니다.'];
    const health=['무리해서 일정을 채우기보다 충분한 휴식을 챙겨주세요.','물을 자주 마시고 가볍게 몸을 움직이면 좋습니다.','오래 앉아 있었다면 중간중간 스트레칭을 해주세요.','오늘은 수면 시간을 평소보다 조금 더 챙기는 게 좋습니다.','식사 시간을 너무 늦추지 않는 것이 컨디션 유지에 도움이 됩니다.','몸이 보내는 작은 피로 신호를 무시하지 않는 것이 좋습니다.'];
    const grades=['좋음','매우 좋음','안정','좋음','상승','안정'];

    form.addEventListener('submit',function(){
      // 기존 운세 계산이 먼저 끝난 다음 카드 내용을 채우기 위해 한 박자 뒤에 실행합니다.
      setTimeout(function(){
        const input=document.getElementById('birthDate');
        if(!input||!input.value)return;
        const p=input.value.split('-').map(Number);
        if(p.length!==3||p.some(Number.isNaN))return;
        const [y,m,d]=p;
        const seed=(y*31+m*17+d*13+new Date().getDate()*7)%6;
        const scoreEl=document.getElementById('score');
        const score=scoreEl?Number(scoreEl.textContent)||76:76;

        // 행운 포인트 5개를 현재 결과 카드에 표시합니다.
        const luckRows=document.querySelectorAll('#fortune .lucky .luckrow b');
        const luck=[colors[seed],String((y+m+d)%9+1),times[(seed+1)%times.length],directions[(seed+2)%directions.length],items[(seed+3)%items.length]];
        luckRows.forEach((el,i)=>{if(luck[i])el.textContent=luck[i];});

        // 재물/애정/직장/건강 카드를 점수와 생년월일을 기준으로 채웁니다.
        const texts=[money,love,work,health];
        const cards=document.querySelectorAll('#fortune .four .fortune');
        cards.forEach((card,i)=>{
          const value=Math.max(72,Math.min(96,score+((seed+i*2)%7)-3));
          const strong=card.querySelector('strong'),small=card.querySelector('small');
          if(strong)strong.textContent=value+'점 · '+grades[(seed+i)%grades.length];
          if(small)small.textContent=texts[i][(seed+i)%texts[i].length];
        });
      },0);
    });

    // 초기화하면 결과 카드의 동적 내용도 다시 비워집니다.
    const reset=form.querySelector('.birth-reset');
    if(reset)reset.addEventListener('click',function(){
      setTimeout(function(){
        const rows=document.querySelectorAll('#fortune .lucky .luckrow b');
        rows.forEach((el,i)=>el.textContent=i===0?'설정 후 확인':'—');
        document.querySelectorAll('#fortune .four .fortune').forEach(card=>{
          const strong=card.querySelector('strong'),small=card.querySelector('small');
          if(strong)strong.textContent='—';
          if(small)small.textContent='생년월일을 설정하면 확인할 수 있어요.';
        });
      },0);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();