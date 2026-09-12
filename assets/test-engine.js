/* 한 문제씩 보여주는 공통 심리테스트 엔진입니다. 추가 데이터도 함께 사용합니다. */
const ALL_TEST_DATA=Object.assign({},typeof TEST_DATA!=='undefined'?TEST_DATA:{},typeof EXTRA_TEST_DATA!=='undefined'?EXTRA_TEST_DATA:{},typeof FEAR_TEST_DATA!=='undefined'?FEAR_TEST_DATA:{});
const d=ALL_TEST_DATA[TEST_ID];
let n=0,answers=[];
const $=id=>document.getElementById(id);
$('cat').textContent=d.cat;
function render(){
 $('progress').textContent=`${n+1} / ${d.questions.length}`;
 $('bar').style.width=`${((n+1)/d.questions.length)*100}%`;
 $('question').textContent=d.questions[n];
 $('choices').innerHTML=d.opts[n].map((x,i)=>`<button class="choice ${answers[n]===i?'selected':''}" data-i="${i}">${x}</button>`).join('');
 $('prev').disabled=n===0;
 $('next').textContent=n===d.questions.length-1?'결과 보기':'다음';
}
$('choices').onclick=e=>{const b=e.target.closest('[data-i]');if(!b)return;answers[n]=+b.dataset.i;render()};
$('prev').onclick=()=>{if(n>0){n--;render()}};
$('next').onclick=()=>{if(answers[n]==null){alert('답을 하나 골라주세요.');return}if(n<d.questions.length-1){n++;render()}else showResult()};
function showResult(){
 const counts=[0,0,0,0],sum=answers.reduce((a,b)=>a+b,0);
 answers.forEach(v=>counts[v]++);
 const type=counts.indexOf(Math.max(...counts));
 const r=d.types[(type+sum)%d.types.length];
 $('quiz').classList.add('hide');$('result').classList.remove('hide');
 $('result').innerHTML=`<div class="result-k">YOUR TYPE · ${d.cat}</div><h2>${r[0]}</h2><p class="lead">${r[1]}</p><div class="grid"><div><b>강점</b><p>${r[2]}</p></div><div><b>숨겨진 약점</b><p>${r[3]}</p></div><div><b>사람들과 있을 때</b><p>${r[4]}</p></div><div><b>연애할 때</b><p>${r[5]}</p></div><div><b>스트레스가 쌓이면</b><p>${r[6]}</p></div><div><b>의외의 모습</b><p>${r[7]}</p></div></div><div class="tip"><b>오늘의 추천</b><br>${r[8]}</div><div class="share"><button onclick="location.reload()">다시 테스트</button><a href="/">다른 테스트 보기</a></div>`;
}
$('titleText').textContent=d.title;$('intro').textContent=d.intro;document.title=d.title+' | 운세·심리테스트';render();