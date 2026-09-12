(() => {
  'use strict';
  const STORAGE_KEY = 'sensei-jitan-v12-tests';
  const state = { page: 'home', grade: '5年', subject: '算数', unit: '割合', level: '標準', result: null };
  const app = document.getElementById('app');
  const subjects = ['国語', '算数', '理科', '社会', '英語'];
  const units = { 国語: ['物語文の読み取り', '漢字の広場', '説明文の要旨'], 算数: ['割合', '小数のかけ算', '図形の面積'], 理科: ['天気の変化', '植物の発芽', '電流がつくる磁力'], 社会: ['日本の国土', '食料生産', '工業生産'], 英語: ['自己紹介', '道案内', 'ものの名前'] };
  const levels = ['やさしい', '標準', 'チャレンジ', '特別支援配慮'];
  const gradeOptions = ['1年', '2年', '3年', '4年', '5年', '6年'];
  const testSets = {
    '5年|算数|割合': [
      { format: '選択式', question: '120円の20%はいくらですか。', choices: ['12円', '24円', '60円', '100円'], answer: '24円', explain: '20%は100分の20です。120×0.2＝24なので、24円です。' },
      { format: '短答', question: '45人のうち女子が18人でした。女子は全体の何%ですか。', answer: '40%', explain: '18÷45＝0.4。0.4を百分率にすると40%です。' },
      { format: '説明問題', question: '定価800円の30%引きの値段を求める方法を説明しましょう。', answer: '800×(1−0.3)＝560円', explain: '30%引きは、もとの70%の値段になるという意味です。800×0.7で560円です。' },
      { format: '選択式', question: 'もとにする量が50、比べる量が15のとき、割合はどれですか。', choices: ['15%', '30%', '50%', '65%'], answer: '30%', explain: '割合は比べる量÷もとにする量。15÷50＝0.3なので30%です。' },
      { format: '短答', question: 'ある数の25%が10です。ある数はいくつですか。', answer: '40', explain: '25%は0.25なので、10÷0.25＝40です。' }
    ]
  };
  const genericTemplates = {
    国語: [{format:'短答',question:'文章の大事な内容を一文でまとめるとき、何に注目しますか。',answer:'中心となる話題と筆者の考え',explain:'くり返し出てくる言葉や段落の中心を探すと、要点を見つけやすくなります。'},{format:'選択式',question:'段落の役割として近いものを選びましょう。',choices:['話題を示す','計算する','地図を読む','実験する'],answer:'話題を示す',explain:'最初の段落には、これから何について書くかを示す役割があります。'}],
    算数: [{format:'短答',question:'この単元で使う大切な式を書きましょう。',answer:'比べる量÷もとにする量＝割合',explain:'割合は、比べる量がもとにする量のどれだけかを表します。'},{format:'選択式',question:'答えを確かめるときに大切なことはどれですか。',choices:['単位や大きさを見る','色だけを見る','速く書く','答えを隠す'],answer:'単位や大きさを見る',explain:'単位や答えの大きさが問題に合っているか確かめます。'}],
    理科: [{format:'選択式',question:'観察するときに記録するとよいものはどれですか。',choices:['日時や変化','好きな色だけ','友達の名前だけ','予想しない'],answer:'日時や変化',explain:'日時と変化を記録すると、結果を比べて考えられます。'},{format:'説明問題',question:'予想を立ててから実験するよさを説明しましょう。',answer:'結果を予想と比べて考えられること',explain:'予想と結果の違いに目を向けると、きまりを見つけやすくなります。'}],
    社会: [{format:'短答',question:'地図で方位を表す基本の4方向を書きましょう。',answer:'東・西・南・北',explain:'地図では方位を使うと、場所の関係を正確に表せます。'},{format:'選択式',question:'資料を読むとき最初に確かめるものはどれですか。',choices:['題名や単位','色の好み','紙の大きさ','文字の形'],answer:'題名や単位',explain:'題名と単位を確かめると、資料が何を表すか分かります。'}],
    英語: [{format:'短答',question:'「私は〜です」と自己紹介するときの表現を書きましょう。',answer:'I am 〜.',explain:'I amは「私は〜です」という意味の表現です。'}]
  };
  function el(selector){ return document.querySelector(selector); }
  function renderHome(){ app.innerHTML = `<section class="hero"><div class="eyebrow">TEACHER TIME-SAVING AI</div><h1>今日は何を準備しますか？</h1><p>学年と教科を選ぶだけで、授業準備に使える素材をすぐに作れます。</p></section><div class="section-title"><h2>学年を選ぶ</h2><p>まずは対象学年を選択</p></div><div class="grade-grid">${gradeOptions.map(g=>`<button class="choice ${g===state.grade?'selected':''}" data-grade="${g}"><strong>${g}</strong><span>授業素材を探す</span></button>`).join('')}</div><div class="section-title"><h2>教科を選ぶ</h2><p>${state.grade}の単元</p></div><div class="subject-grid">${subjects.map(s=>`<button class="choice ${s===state.subject?'selected':''}" data-subject="${s}"><strong>${s}</strong><span>${units[s].length}単元</span></button>`).join('')}</div><div class="section-title"><h2>単元を選ぶ</h2><p>単元詳細からAI機能を使えます</p></div><div class="unit-grid">${units[state.subject].map(u=>`<button class="unit-card" data-unit="${u}"><strong>${u}</strong><span>授業案・板書・ミニテスト</span></button>`).join('')}</div>`; }
  function renderDesk(){ const saved = loadSaved(); app.innerHTML = `<section class="hero"><div class="eyebrow">MY TEACHING DESK</div><h1>マイ授業デスク</h1><p>端末内に保存したミニテストを確認できます。保存データはこのブラウザだけに保管されます。</p></section>${saved.length?`<div class="desk-grid">${saved.map((x,i)=>`<article class="desk-card"><h3>${x.grade} ${x.subject}「${x.unit}」</h3><p>${x.level} / ${x.items.length}問</p><button class="secondary" data-open-saved="${i}" style="margin-top:12px">開く</button></article>`).join('')}</div>`:'<div class="empty">保存したミニテストはまだありません。<br>単元詳細から「ミニテストを生成」して保存できます。</div>'}`; }
  function renderDetail(){ app.innerHTML = `<div class="crumbs">ホーム / ${state.grade} / ${state.subject}</div><section class="panel"><div class="unit-head"><div><span class="pill">${state.grade}・${state.subject}</span><h1>「${state.unit}」</h1></div><button class="secondary" data-page="home">単元一覧に戻る</button></div><div class="tabs"><button class="tab active">単元概要</button><button class="tab">45分授業案</button><button class="tab">AI板書</button><button class="tab active">AIミニテスト</button></div><p class="notice">授業レベルを選び、必要な素材のボタンを押してください。MVPではブラウザ内テンプレートから生成します。</p><div class="levels">${levels.map(l=>`<button class="level ${l===state.level?'selected':''}" data-level="${l}">${l}</button>`).join('')}</div><div class="feature"><h2>AI授業案生成 MVP</h2><p>学習目標・授業の流れ・発問・つまずき対応をまとめます。</p><div class="actions"><button class="secondary" data-demo="lesson">45分授業案を生成</button><button class="secondary" data-demo="board">板書案を生成</button></div></div><div class="feature test"><h2>AIミニテスト生成 MVP</h2><p>約5問の選択式・短答・説明問題を、正答とやさしい解説つきで作成します。</p><div class="actions"><button class="primary" id="generate-test">ミニテストを生成</button></div><div id="test-result"></div></div></section>`; }
  function loadSaved(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');}catch(e){return [];} }
  function saveToDesk(){
    if(!state.result||!state.result.items){ showMessage('先にミニテストを生成してください。'); return false; }
    try{
      const all=loadSaved().filter(x=>!(x.grade===state.grade&&x.subject===state.subject&&x.unit===state.unit&&x.level===state.level));
      all.unshift({grade:state.grade,subject:state.subject,unit:state.unit,level:state.level,items:state.result.items,savedAt:new Date().toISOString()});
      localStorage.setItem(STORAGE_KEY,JSON.stringify(all.slice(0,20)));
      return true;
    }catch(e){ showMessage('保存できませんでした。ブラウザのプライベート設定をご確認ください。'); return false; }
  }
  function saveLocalFile(){
    if(!state.result||!state.result.items){ showMessage('先にミニテストを生成してください。'); return; }
    const payload={version:'v12',grade:state.grade,subject:state.subject,unit:state.unit,level:state.level,items:state.result.items,savedAt:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob); const link=document.createElement('a');
    link.href=url; link.download=`${state.grade}_${state.subject}_${state.unit}_ミニテスト.json`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    showMessage('ローカル保存しました。JSONファイルをダウンロードしました。');
  }
  function buildItems(){ const key=`${state.grade}|${state.subject}|${state.unit}`; if(testSets[key]) return testSets[key]; const base=genericTemplates[state.subject]||genericTemplates.算数; return Array.from({length:5},(_,i)=>({...base[i%base.length],question:`${state.unit}：${base[i%base.length].question}`})); }
  function renderTestResult(){ const r=state.result; if(!r)return; const html=`<div class="result"><h3>${state.grade} ${state.subject}「${state.unit}」のミニテスト（${state.level}）</h3>${r.items.map((q,i)=>`<article class="question"><div class="question-head"><span class="qno">${i+1}</span><span class="format">${q.format}</span></div><p><strong>${q.question}</strong></p>${q.choices?`<p>${q.choices.map((c,j)=>`${String.fromCharCode(65+j)}．${c}`).join('　')}</p>`:''}<p class="answer">正答：${q.answer}</p><p class="explain">やさしい解説：${q.explain}</p></article>`).join('')}<div class="actions"><button class="primary" id="regenerate-test">作り直す</button><button class="secondary" id="copy-test">コピー</button><button class="secondary" id="save-desk">マイ授業デスクに保存</button><button class="secondary" id="save-local-pdf">PDFでローカル保存</button></div><p id="result-message" class="notice" hidden></p></div>`; el('#test-result').innerHTML=html; }
  function copyText(){
    if(!state.result||!state.result.items){ showMessage('先にミニテストを生成してください。'); return; }
    const text=state.result.items.map((q,i)=>`${i+1}. ${q.question}\n${q.choices?q.choices.join(' / ')+'\n':''}正答：${q.answer}\nやさしい解説：${q.explain}`).join('\n\n');
    const fallback=()=>{ const area=document.createElement('textarea'); area.value=text; area.setAttribute('readonly',''); area.style.position='fixed'; area.style.opacity='0'; document.body.appendChild(area); area.select(); let ok=false; try{ok=document.execCommand('copy');}catch(e){ok=false;} area.remove(); showMessage(ok?'コピーしました。':'コピーできませんでした。問題文を選択してコピーしてください。'); };
    if(navigator.clipboard&&window.isSecureContext){ navigator.clipboard.writeText(text).then(()=>showMessage('コピーしました。')).catch(fallback); } else { fallback(); }
  }
  function printTestPdf(){
    if(!state.result||!state.result.items){ showMessage('先にミニテストを生成してください。'); return; }
    const popup=window.open('', '_blank');
    if(!popup){ showMessage('PDF画面を開けませんでした。ポップアップを許可してください。'); return; }
    const questions=state.result.items.map((q,i)=>`<article class="q ${q.format==='説明問題'?'q-explain':q.format==='短答'?'q-short':'q-choice'}"><div class="qtop"><span class="num">${i+1}</span></div><h2>${q.question}</h2>${q.choices?`<div class="choices">${q.choices.map((c,j)=>`<span>${String.fromCharCode(65+j)}　${c}</span>`).join('')}</div>`:''}<div class="work-label">${q.format==='説明問題'?'考え方を書きましょう。':q.format==='短答'?'答えを書きましょう。':'計算・メモ欄'}</div><div class="answer-line"></div></article>`).join('');
    const answers=state.result.items.map((q,i)=>`<article class="a"><div class="qtop"><span class="num">${i+1}</span><span class="tag">${q.format}</span></div><h2>${q.question}</h2><p class="correct"><b>正答</b>　${q.answer}</p><p><b>やさしい解説</b>　${q.explain}</p></article>`).join('');
    const css='*{box-sizing:border-box}body{margin:0;color:#203040;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans JP","Yu Gothic",sans-serif;line-height:1.7}.sheet{width:257mm;min-height:364mm;margin:0 auto;padding:17mm 19mm;page-break-after:always}header{display:flex;justify-content:space-between;align-items:end;border-bottom:4px solid #8ed0c1;padding-bottom:10px}.meta{font-size:23px;font-weight:700;color:#18324b;letter-spacing:.08em}.unit-meta{font-size:15px;font-weight:700;color:#18324b}.title{display:flex;align-items:center;gap:10px;margin:20px 0 4px}.title span{font-size:30px}.title h1{margin:0;font-size:30px;color:#18324b}.hint{background:#fff5e8;border-radius:10px;padding:9px 13px;margin:10px 0 16px;color:#805523;font-size:14px}.q,.a{border:2px solid #dbe4ed;border-radius:14px;padding:13px 18px;margin:10px 0;background:#fbfdff;break-inside:avoid}.q:nth-of-type(odd),.a:nth-of-type(odd){border-color:#bfe5dc;background:#f5fffc}.qtop{display:flex;align-items:center;gap:8px}.num{display:grid;place-items:center;background:#18324b;color:#fff;border-radius:50%;width:30px;height:30px;font-weight:800}.q h2,.a h2{font-size:18px;margin:7px 0;color:#203040}.choices{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:9px 0}.choices span{border:1px solid #dbe4ed;border-radius:8px;padding:6px 10px;background:#fff}.work-label{font-size:12px;color:#6b7b8d;margin-top:9px}.answer-line{height:32px;border-bottom:1px dashed #aebdca;margin-top:6px}.q-short .answer-line{height:48px}.q-explain .answer-line{height:78px}.a p{font-size:15px;margin:7px 0}.correct{background:#e8f7f1;border-radius:8px;padding:7px 10px;color:#146c4b}.a b{color:#18324b}footer{text-align:center;margin-top:18px;color:#6b7b8d;font-size:13px}@page{size:B4 portrait;margin:0}@media print{.sheet{margin:0}}';
    popup.document.write(`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${state.unit} 練習問題</title><style>${css}</style></head><body><section class="sheet"><header><div class="meta">名前：　　　　　　　　　　　　　　　　</div><div class="unit-meta">${state.grade} ${state.subject}「${state.unit}」</div></header><div class="title"><span>✏️</span><h1>練習問題</h1></div><p class="hint">あせらず、問題をよく読んで答えましょう。</p>${questions}<footer>できた問題に○をつけよう！</footer></section><section class="sheet"><header><div class="unit-meta">${state.grade} ${state.subject}「${state.unit}」</div></header><div class="title"><span>🌟</span><h1>答え・やさしい解説</h1></div>${answers}</section><script>window.onload=function(){window.print();};<\/script></body></html>`); popup.document.close();
  }
  function showMessage(msg){ const node=el('#result-message'); if(node){node.hidden=false;node.textContent=msg;} }
  function render(){ state.page==='home'?renderHome():state.page==='desk'?renderDesk():renderDetail(); }
  document.addEventListener('click', e=>{ const t=e.target.closest('button'); if(!t)return; if(t.dataset.page){state.page=t.dataset.page;document.querySelectorAll('.nav-link').forEach(n=>n.classList.toggle('active',n.dataset.page===state.page));render();return;} if(t.dataset.grade){state.grade=t.dataset.grade;render();return;} if(t.dataset.subject){state.subject=t.dataset.subject;state.unit=units[state.subject][0];render();return;} if(t.dataset.unit){state.unit=t.dataset.unit;state.page='detail';render();return;} if(t.dataset.level){state.level=t.dataset.level;render();return;} if(t.id==='generate-test'||t.id==='regenerate-test'){state.result={items:buildItems()};renderTestResult();return;} if(t.id==='copy-test'){copyText();return;} if(t.id==='save-desk'){if(saveToDesk())showMessage('マイ授業デスクに保存しました。');return;} if(t.id==='save-local-pdf'){printTestPdf();return;} if(t.dataset.openSaved){const x=loadSaved()[Number(t.dataset.openSaved)];if(x){Object.assign(state,x,{page:'detail'});render();state.result={items:x.items};renderTestResult();}} });
  render();
})();
