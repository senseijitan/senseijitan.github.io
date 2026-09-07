
const K='senseiJitanAI_v3';
const state=JSON.parse(localStorage.getItem(K)||'null')||{subject:'math',grade:6,unit:'比とその利用',level:'standard',boardTemplate:'flow',favorites:[],recents:[],usage:{},total:0};

if(!state.boardTemplate) state.boardTemplate='flow';

const subjects={
  jp:{name:'国語',icon:'📖',class:'jp',desc:'発問・心情・要約・音読',units:['物語文を読み深める','説明文の要旨を捉える','熟語の成り立ち','漢字の使い分け'],focus:['発問','心情変化','人物関係','要約','音読']},
  math:{name:'算数',icon:'➗',class:'math',desc:'図解・板書・つまずき対策',units:['比とその利用','分数のかけ算','分数のわり算','円の面積','比例と反比例'],focus:['図解','板書','解法比較','ミニテスト','つまずき']},
  science:{name:'理科',icon:'🔬',class:'science',desc:'実験・観察・安全・図解',units:['ものの燃え方','植物のからだ','水溶液の性質','月と太陽','電気の利用'],focus:['実験手順','安全','予想','観察','結果整理']},
  social:{name:'社会',icon:'🌏',class:'social',desc:'地図・年表・資料読み取り',units:['縄文から古墳へ','武士の世の中','江戸の社会','明治の国づくり','日本と世界のつながり'],focus:['地図','年表','資料','比較','問い']},
  english:{name:'英語',icon:'💬',class:'english',desc:'会話・音読・ゲーム・活動',units:['自己紹介をしよう','日常生活を伝えよう','行きたい国を紹介しよう','思い出を伝えよう'],focus:['会話','音読','単語','ペア活動','ゲーム']}
};

const grades=[1,2,3,4,5,6];

const levels={
  easy:{label:'やさしい',desc:'図・具体例を多めにして、説明を短く、1ステップずつ進めます。'},
  standard:{label:'標準',desc:'通常授業向け。発問・思考・交流・まとめをバランス良くします。'},
  challenge:{label:'チャレンジ',desc:'理由説明・比較・応用を増やして、考えを深めます。'},
  support:{label:'特別支援配慮',desc:'文字量を抑え、視覚支援・選択式・スモールステップを優先します。'}
};


const boardResearchSources=[
  {
    name:'東洋館出版社「板書で見る全単元・全時間の授業のすべて 算数」',
    teacher:'田中博史先生監修・筑波大学附属小学校算数部',
    note:'板書を授業設計そのものとして見せる構成。問題→問い→児童の考え→比較→まとめの流れが明確。',
    url:'https://www.toyokan.co.jp/products/4029'
  },
  {
    name:'東京書籍 math connect「思考を見せる板書例」',
    teacher:'各実践執筆教員',
    note:'答えだけでなく、考え方の理由・図・誤答・比較を板書に残す構成が参考になる。',
    url:'https://mathconnect.tokyo-shoseki.co.jp/tokusyu/bansyo/'
  },
  {
    name:'東京書籍「どうとくのわ」板書例',
    teacher:'全国の実践教員',
    note:'写真を使い、発問・児童の意見・価値の整理が視覚的に追える。算数以外の板書設計にも応用可能。',
    url:'https://sites.google.com/tokyo-shoseki.co.jp/doutokunowa/%E5%B0%8F%E5%AD%A6%E6%A0%A1/%E6%9D%BF%E6%9B%B8%E4%BE%8B'
  },
  {
    name:'東洋館出版社「小学校算数 板書とノートを変えると子どもが伸びる」',
    teacher:'二宮裕之先生・鴨田均先生ほか',
    note:'板書と児童ノートの連動、学習過程を見える形に残す考え方が参考になる。',
    url:'https://www.toyokan.co.jp/products/2812'
  }
];

const boardTemplates=[
  {id:'flow',name:'思考の流れ型',short:'問題→問い→考え→比較→まとめ',best:'算数・理科',desc:'授業の時間の流れを左から右へ残す。明日の授業をそのままイメージしやすい標準型。'},
  {id:'compare',name:'考え比較型',short:'考えA｜考えB｜共通点・違い',best:'算数・国語・社会',desc:'複数の児童の考えや資料を並列表示し、比較から学びを深める型。'},
  {id:'visual',name:'図解中心型',short:'大きな図＋式＋短い言葉',best:'算数・理科・特別支援',desc:'文字量を抑え、数直線・実験図・関係図などを中心に理解させる型。'},
  {id:'question',name:'問い深掘り型',short:'大きな問い→予想→根拠→再考',best:'国語・社会・理科',desc:'中心発問を板書の中央に置き、児童の意見や根拠を周囲に集める型。'},
  {id:'minimal',name:'シンプル時短型',short:'めあて→要点3つ→まとめ',best:'全教科',desc:'板書量を最小限にして、準備と書く時間を減らす。短時間授業や復習にも向く。'}
];

const demo={
  jp:{
    goal:'登場人物の行動や会話を根拠に、心情の変化を読み取る。',
    hook:'「この一言の前と後で、気持ちはどう変わった？」と2つの場面カードを比較する。',
    board:['めあて：心情の変化を読み取ろう','根拠：行動・会話・情景','心情の変化 → 理由 → 自分の言葉でまとめ'],
    timeline:[['0〜5分','場面カードで心情予想'],['5〜15分','音読と根拠探し'],['15〜28分','個人→ペア交流'],['28〜38分','全体で心情変化を整理'],['38〜45分','要約・振り返り']],
    quiz:[['心情を読み取るときに根拠にしやすいものは？','行動・会話・情景描写','本文に書かれた行動や会話、情景を根拠にすると、気持ちを思いつきではなく説明できます。']],
    extra:'人物相関図・心情曲線・音読ポイント'
  },
  math:{
    goal:'2つの数量の関係を比で表し、等しい比の関係を説明する。',
    hook:'「原液2杯＋水3杯」と「原液4杯＋水6杯。濃さは同じ？」',
    board:['めあて：2つの量の関係を比で表そう','2：3 ⇄ 4：6','両方を同じ数倍すると関係は変わらない'],
    timeline:[['0〜5分','ジュース問題で予想'],['5〜15分','比の表し方を確認'],['15〜28分','図・式・言葉で個人思考'],['28〜38分','全体交流'],['38〜45分','練習・振り返り']],
    quiz:[['4：6を簡単な整数の比にすると？','2：3','4と6はどちらも2で割れます。4÷2＝2、6÷2＝3なので、2：3です。']],
    extra:'二重数直線・図解・つまずき別支援'
  },
  science:{
    goal:'実験の条件をそろえ、結果から科学的に説明する。',
    hook:'「火が消えるのはなぜ？」を写真やイラストから予想する。',
    board:['予想','実験条件','結果','結果から言えること'],
    timeline:[['0〜5分','現象写真から予想'],['5〜12分','実験条件を確認'],['12〜27分','実験・観察'],['27〜38分','結果整理'],['38〜45分','考察・安全確認']],
    quiz:[['実験で条件をそろえる主な理由は？','結果を公平に比べるため','変える条件以外をそろえると、結果の違いが何によって起きたのか判断しやすくなります。']],
    extra:'実験手順図・安全チェック・観察記録'
  },
  social:{
    goal:'複数の資料を比べ、社会の変化や因果関係を説明する。',
    hook:'昔と今の2枚の資料を並べ「何が変わった？」から始める。',
    board:['資料①','資料②','共通点・相違点','なぜ変わった？','まとめ'],
    timeline:[['0〜5分','資料比較クイズ'],['5〜15分','資料読み取り'],['15〜28分','ペアで比較'],['28〜38分','原因と結果を整理'],['38〜45分','一文まとめ']],
    quiz:[['社会の資料を比べるときに大切な見方は？','共通点・相違点・変化','複数資料を比べると、何が同じで何が変わったかが見え、背景や理由を考えやすくなります。']],
    extra:'地図・年表・人物カード・資料比較'
  },
  english:{
    goal:'身近なことについて、短い表現を使って伝え合う。',
    hook:'先生が短い会話を実演し「何について話している？」と当ててもらう。',
    board:['Today’s phrase','Key words','Model conversation','Pair challenge'],
    timeline:[['0〜5分','会話デモ'],['5〜12分','表現と発音確認'],['12〜25分','ペア練習'],['25〜35分','ゲーム活動'],['35〜43分','発表'],['43〜45分','振り返り']],
    quiz:[['“I like soccer.” が表している内容は？','自分の好きなもの','I like ～. は、自分が好きなものやことを伝えるときに使う表現です。']],
    extra:'会話カード・単語カード・発音・ゲーム'
  }
};

function save(){localStorage.setItem(K,JSON.stringify(state))}
function track(feature,label){
  state.usage[feature]=(state.usage[feature]||0)+1; state.total++;
  state.recents.unshift({label,ts:Date.now()}); state.recents=state.recents.slice(0,16); save();
}
function btnView(){document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>mount(b.dataset.view))}
function renderSubjectTabs(){
  const wrap=document.querySelector('#global-tabs');
  if(!wrap) return;
  wrap.innerHTML=`
    <div class="grade-subject-nav">
      <div class="grade-row">
        <span class="grade-label">学年</span>
        ${grades.map(g=>`<button class="grade-tab ${state.grade===g?'active':''}" data-grade="${g}">${g}年</button>`).join('')}
        <div class="nav-current"><span>現在</span><b>${state.grade}年・${subjects[state.subject].name}</b></div>
      </div>
      <div class="subject-tabs">
        ${Object.entries(subjects).map(([k,s])=>`
          <button class="subject-tab ${s.class} ${state.subject===k?'active':''}" data-top-subject="${k}">
            ${s.icon} ${s.name}
          </button>`).join('')}
      </div>
    </div>`;
  document.querySelectorAll('[data-grade]').forEach(b=>{
    b.onclick=()=>{
      state.grade=Number(b.dataset.grade);
      state.unit=subjects[state.subject].units[0];
      track('grade',`${state.grade}年`);
      mount('subject');
    };
  });
  document.querySelectorAll('[data-top-subject]').forEach(b=>{
    b.onclick=()=>{
      state.subject=b.dataset.topSubject;
      state.unit=subjects[state.subject].units[0];
      track('subject',`${state.grade}年 ${subjects[state.subject].name}`);
      mount('subject');
    };
  });
}
function mount(view='home'){
  renderSubjectTabs();
  if(view==='home') renderHome();
  if(view==='subject') renderSubject();
  if(view==='unit') renderUnit();
  if(view==='desk') renderDesk();
  if(view==='analytics') renderAnalytics();
  btnView();
  window.scrollTo({top:0,behavior:'smooth'});
}
function renderHome(){
  const subjectCards=Object.entries(subjects).map(([k,s])=>`
    <button class="subject-card ${s.class}" data-subject="${k}">
      <span class="subject-icon">${s.icon}</span><h3>${s.name}</h3><p>${s.desc}</p>
    </button>`).join('');
  document.querySelector('#app').innerHTML=`
    <section class="hero card">
      <div><p class="eyebrow">5教科対応ビジュアルMVP</p><h1>今日は何を<br>準備しますか？</h1>
      <p>教科 → 単元 → レベルを選ぶだけ。授業・板書・ミニテスト・5分活動まで、教科特性に合わせて表示します。</p></div>
      <div class="hero-visual">
        <div class="visual-chip"><b>🧑‍🏫 板書</b><span>画像イメージ中心</span></div>
        <div class="visual-chip"><b>📝 テスト</b><span>答え＋生徒向け解説</span></div>
        <div class="visual-chip"><b>🎮 楽しく</b><span>教科別アクティビティ</span></div>
        <div class="visual-chip"><b>⭐ マイ化</b><span>お気に入り・履歴</span></div>
      </div>
    </section>
    <section class="section"><div class="section-head"><h2>教科を選ぶ</h2><span class="muted">小学校${state.grade}年のデモ</span></div><div class="subject-grid">${subjectCards}</div></section>
    <section class="section"><div class="section-head"><h2>よく使う機能</h2></div>
      <div class="quick-grid">
        <button class="quick"><span>🧑‍🏫</span><b>板書を見る</b><span>図・挿絵・レベル別</span></button>
        <button class="quick"><span>📚</span><b>45分授業案</b><span>教科特性に合わせる</span></button>
        <button class="quick"><span>📝</span><b>ミニテスト</b><span>答え＋わかりやすい解説</span></button>
        <button class="quick"><span>⏱</span><b>あと5分</b><span>準備ほぼ不要</span></button>
      </div>
    </section>
    <section class="section two-col">
      <div class="card panel"><h2>⭐ お気に入り</h2><div class="list">${state.favorites.length?state.favorites.slice(0,5).map(x=>`<div class="list-item">${x}</div>`).join(''):'<div class="list-item muted">まだありません</div>'}</div></div>
      <div class="card panel"><h2>🕘 最近使った</h2><div class="list">${state.recents.length?state.recents.slice(0,5).map(x=>`<div class="list-item">${x.label}</div>`).join(''):'<div class="list-item muted">まだありません</div>'}</div></div>
    </section>`;
  document.querySelectorAll('[data-subject]').forEach(b=>b.onclick=()=>{state.subject=b.dataset.subject;state.unit=subjects[state.subject].units[0];track('subject',subjects[state.subject].name);mount('subject')});
}
function renderSubject(){
  const s=subjects[state.subject];
  document.querySelector('#app').innerHTML=`
  <div class="nav-row">
    <button class="back-btn" data-view="home">← ホームに戻る</button>
    <div class="breadcrumb"><button data-view="home">ホーム</button><span>›</span><span>小学校${state.grade}年</span><span>›</span><span>${s.name}</span></div>
  </div>
  <section class="subject-header card">
    <div><span class="subject-badge ${s.class}">${s.icon} ${s.name}</span><h1>小${state.grade} ${s.name}の授業準備</h1><p>${s.desc}を中心に、${s.focus.join('・')}をまとめます。</p></div>
    <div class="figure-card"><b>教科別ビジュアル</b><div class="figure">${s.icon}<br>${s.focus.slice(0,3).join('・')}</div></div>
  </section>
  <section class="section"><div class="section-head"><h2>単元を選ぶ</h2><span class="muted">デモ単元</span></div>
    <div class="unit-grid">${s.units.map((u,i)=>`<button class="unit-card" data-unit="${u}"><b>${u}</b><small>${state.grade===6?(i===0?'完全デモ対応':'UI確認用'):'学年切替UIデモ'}</small></button>`).join('')}</div>
  </section>
  <section class="section card panel"><h2>この教科で特に強化するもの</h2>
    <div class="quick-grid">${s.focus.slice(0,4).map(x=>`<div class="quick"><b>${x}</b><span>${s.name}専用の表示・生成に最適化</span></div>`).join('')}</div>
  </section>`;
  document.querySelectorAll('[data-unit]').forEach(b=>b.onclick=()=>{state.unit=b.dataset.unit;track('unit',`${s.name} ${state.unit}`);mount('unit')});
}
function levelButtons(){return Object.entries(levels).map(([k,l])=>`<button data-level="${k}" class="${state.level===k?'active':''}">${l.label}</button>`).join('')}
function renderUnit(){
  const s=subjects[state.subject], d=demo[state.subject];
  const lv=levels[state.level];
  document.querySelector('#app').innerHTML=`
    <div class="nav-row">
      <button class="back-btn" data-view="subject">← ${s.name}の単元一覧に戻る</button>
      <div class="breadcrumb"><button data-view="home">ホーム</button><span>›</span><button data-view="subject">${s.name}</button><span>›</span><span>${state.unit}</span></div>
    </div>
    <section class="subject-header card"><div><p class="eyebrow">小学校${state.grade}年 ＞ ${s.name}</p><h1>${state.unit}</h1><p>${state.unit===s.units[0]?(state.grade===6?'教科別完全デモ':'UIデモ（単元データは6年を仮表示）'):'UI確認用サンプル。正式版では単元別データを追加します。'}</p></div>
      <button id="fav" class="unit-card">☆ お気に入り</button></section>
    <section class="level-panel card"><h2>授業レベル</h2><div class="level-buttons">${levelButtons()}</div><p class="muted">${lv.desc}</p></section>
    <section class="unit-layout">
      <aside class="side card">
        <button data-anchor="lesson">📚 授業</button><button data-anchor="board">🧑‍🏫 板書</button><button data-anchor="visual">🖼 図・挿絵</button>
        <button data-anchor="activity">🎮 活動</button><button data-anchor="quiz">📝 ミニテスト</button><button data-anchor="support">😵 つまずき</button>
      </aside>
      <div class="stack">
        <section id="lesson" class="content card"><h2>📚 45分授業案 <span class="muted">・${lv.label}</span></h2>
          <div class="mini"><b>ねらい</b><div>${adapt(d.goal)}</div></div><div class="mini"><b>楽しい導入</b><div>${adapt(d.hook)}</div></div>
          <div class="timeline">${d.timeline.map(x=>`<div class="timeline-row"><b>${x[0]}</b><span>${adapt(x[1])}</span></div>`).join('')}</div></section>
        <section id="board" class="content card">
          <div class="section-head"><div><h2>🧑‍🏫 板書サンプル</h2><div class="muted">人気の実践板書に共通する構成を分析した「先生時短AI独自板書」です。元画像の転載はしません。</div></div></div>
          <div class="board-template-tabs">${boardTemplates.map(t=>`<button data-board-template="${t.id}" class="${state.boardTemplate===t.id?'active':''}">${t.name}</button>`).join('')}</div>
          <div class="board-template-note"><b>${boardTemplates.find(t=>t.id===state.boardTemplate).name}</b>：${boardTemplates.find(t=>t.id===state.boardTemplate).desc}</div>
          ${renderBoardByTemplate(state.boardTemplate,d)}
          <div class="board-actions">
            <button class="unit-card" data-anchor="research">実践板書の参考元を見る</button>
            <button class="unit-card" id="board-large">板書を大きく見る</button>
          </div>
        </section>
        <section id="research" class="content card"><h2>🔎 実践板書リサーチ</h2>
          <p>先生時短AIでは、公開されている優れた板書実践の<strong>構成・見せ方・授業の流れ</strong>を研究し、独自板書に反映します。第三者の板書画像は許諾なく転載しません。</p>
          <div class="research-grid">${boardResearchSources.map((r,i)=>`<article class="research-card"><span class="source-no">参考${i+1}</span><h3>${r.name}</h3><p class="muted">${r.teacher}</p><p>${r.note}</p><a href="${r.url}" target="_blank" rel="noopener noreferrer">公式・公開ページを見る ↗</a></article>`).join('')}</div>
          <h3 style="margin-top:22px">先生時短AI 板書テンプレート5種</h3>
          <div class="lesson-grid">${boardTemplates.map(t=>`<div class="mini"><b>${t.name}</b><div>${t.short}</div><div class="muted">おすすめ：${t.best}</div></div>`).join('')}</div>
        </section>
        <section id="visual" class="content card"><h2>🖼 図・挿絵・視覚支援</h2>
          <div class="lesson-grid">${visualIdeas(state.subject).map(x=>`<div class="figure-card"><div class="figure">${x[0]}</div><b>${x[1]}</b><div class="muted">${x[2]}</div></div>`).join('')}</div></section>
        <section id="activity" class="content card"><h2>🎮 楽しい活動 / あと5分</h2>
          <div class="lesson-grid">${activities(state.subject).map(x=>`<div class="mini"><b>${x[0]}</b><div>${adapt(x[1])}</div></div>`).join('')}</div></section>
        <section id="quiz" class="content card"><h2>📝 ミニテスト</h2>
          <div class="mini"><b>Q. ${d.quiz[0][0]}</b><div class="answer"><b>答え：${d.quiz[0][1]}</b><p>${adapt(d.quiz[0][2])}</p></div></div>
          <button id="regen" class="unit-card">別の問題を作る（デモ）</button></section>
        <section id="support" class="content card"><h2>😵 つまずき対応</h2>
          <div class="lesson-grid">${supportIdeas(state.subject).map(x=>`<div class="mini"><b>${x[0]}</b><div>${adapt(x[1])}</div></div>`).join('')}</div></section>
      </div>
    </section>`;
  document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{state.level=b.dataset.level;track('level',`${s.name} ${levels[state.level].label}`);mount('unit')});
  document.querySelectorAll('[data-board-template]').forEach(b=>b.onclick=()=>{
    state.boardTemplate=b.dataset.boardTemplate;
    track('boardTemplate',boardTemplates.find(t=>t.id===state.boardTemplate).name);
    mount('unit');
  });
  const boardLarge=document.querySelector('#board-large');
  if(boardLarge) boardLarge.onclick=()=>{
    const board=document.querySelector('#board .visual-board');
    if(board?.requestFullscreen) board.requestFullscreen();
    else board.scrollIntoView({behavior:'smooth',block:'center'});
  };
  document.querySelectorAll('[data-anchor]').forEach(b=>b.onclick=()=>document.querySelector('#'+b.dataset.anchor).scrollIntoView({behavior:'smooth',block:'start'}));
  document.querySelector('#fav').onclick=()=>{const lab=`小${state.grade} ${s.name}「${state.unit}」`;if(!state.favorites.includes(lab))state.favorites.unshift(lab);track('favorite',lab);mount('unit')};
  document.querySelector('#regen').onclick=()=>{track('quiz',`${s.name}ミニテスト`);alert('正式版では、教科・単元・レベルに応じてAIが別問題と生徒向け解説を生成します。')};
  btnView();
}
function adapt(t){
  if(state.level==='easy') return t+' ※図や例を多めにします。';
  if(state.level==='challenge') return t+' ※理由説明・比較・応用まで扱います。';
  if(state.level==='support') return t+' ※短い文・視覚支援・選択式を優先します。';
  return t;
}

function renderBoardByTemplate(type,d){
  if(type==='compare'){
    return `<div class="visual-board compare-board">
      <div><h3>問題・めあて</h3><div class="chalk">${adapt(d.board[0])}</div></div>
      <div><h4>考えA</h4><div class="chalk">図や言葉で考える<br>${boardIllust(state.subject)}</div><h4>考えB</h4><div class="chalk">${adapt(d.board[1])}</div></div>
      <div><h4>比べる</h4><div class="chalk">同じところ／違うところ</div><h4>まとめ</h4><div class="chalk">${adapt(d.board[2])}</div></div>
    </div>`;
  }
  if(type==='visual'){
    return `<div class="visual-board visual-focus-board">
      <div><h3>めあて</h3><div class="chalk">${adapt(d.board[0])}</div></div>
      <div class="big-visual"><h4>大きな図・関係</h4><div class="illust">${boardIllust(state.subject)}</div><div class="chalk">${adapt(d.board[1])}</div></div>
      <div><h4>式・短い言葉</h4><div class="chalk">${adapt(d.board[2])}</div></div>
    </div>`;
  }
  if(type==='question'){
    return `<div class="visual-board question-board">
      <div><h3>今日の問い</h3><div class="chalk">${adapt(d.board[0])}</div><div class="chalk">予想：どうなる？</div></div>
      <div><h4>根拠・考え</h4><div class="chalk">${adapt(d.board[1])}</div><div class="illust">${boardIllust(state.subject)}</div></div>
      <div><h4>もう一度考える</h4><div class="chalk">最初の予想と比べよう</div><h4>まとめ</h4><div class="chalk">${adapt(d.board[2])}</div></div>
    </div>`;
  }
  if(type==='minimal'){
    return `<div class="visual-board minimal-board">
      <div><h3>めあて</h3><div class="chalk">${adapt(d.board[0])}</div></div>
      <div><h4>要点</h4><div class="chalk">① ${adapt(d.board[1])}<br>② ${boardIllust(state.subject)}<br>③ 大事な言葉</div></div>
      <div><h4>まとめ</h4><div class="chalk">${adapt(d.board[2])}</div></div>
    </div>`;
  }
  return `<div class="visual-board">
    <div><h3>めあて</h3><div class="chalk">${adapt(d.board[0])}</div></div>
    <div><h4>考える・比べる</h4><div class="chalk">${adapt(d.board[1])}</div><div class="illust">${boardIllust(state.subject)}</div></div>
    <div><h4>まとめ</h4><div class="chalk">${adapt(d.board[2])}</div><small>${d.extra}</small></div>
  </div>`;
}

function boardIllust(sub){return {jp:'👤💭➡️😊',math:'🥤2：3 ⇄ 4：6',science:'🔥🧪➡️📊',social:'🗾📜➡️🔎',english:'🗣️ “I like…” ↔ 👥'}[sub]}
function visualIdeas(sub){
  return {
    jp:[['👤↔️👤','人物関係図','登場人物同士の関係を一目で'],['📈💭','心情曲線','気持ちの変化を可視化']],
    math:[['📏','数直線・関係図','数量関係を図で整理'],['🧩','図解問題','式の意味を絵で理解']],
    science:[['🧪','実験手順図','順番と安全確認を視覚化'],['👀','観察カード','見るポイントを絵で示す']],
    social:[['🗺️','地図','場所と広がりを視覚化'],['🕰️','年表','時系列の流れを整理']],
    english:[['🗨️','会話カード','場面別の会話例'],['🔤','単語カード','絵＋単語で覚える']]
  }[sub];
}
function activities(sub){
  return {
    jp:[['根拠さがし','本文から心情が分かる一文を1分で探す。'],['30秒要約','今日読んだ場面を30秒で相手に説明する。']],
    math:[['比さがし','教室にある2量を比で表す。'],['間違い探し','わざと間違えた式を見て修正する。']],
    science:[['予想投票','実験結果を3択で予想する。'],['安全チェック','実験前に危険ポイントを探す。']],
    social:[['資料どこ違う？','2枚の資料の違いを3つ探す。'],['年表並べ','出来事カードを時代順に並べる。']],
    english:[['ペア会話','今日の表現を使って30秒会話。'],['単語ジェスチャー','ジェスチャーを見て英単語を当てる。']]
  }[sub];
}
function supportIdeas(sub){
  return {
    jp:[['文章量が多い','読む範囲を小さく区切り、根拠に色を付ける。'],['心情がつかみにくい','表情アイコンと会話文を対応させる。']],
    math:[['式が選べない','図→言葉→式の順に固定する。'],['数字関係が見えない','色分けした数直線・ブロック図を使う。']],
    science:[['実験手順が混乱','1工程1カードで提示する。'],['観察点が不明','「色・形・量」など見る項目を限定する。']],
    social:[['資料が多い','最初は2資料だけを比較する。'],['因果関係が難しい','「なぜ→結果」を矢印でつなぐ。']],
    english:[['発話が不安','モデル文を見ながら選択式で話す。'],['単語が出ない','絵カードから選んで文に入れる。']]
  }[sub];
}
function renderDesk(){
  const top=Object.entries(state.usage).sort((a,b)=>b[1]-a[1]).slice(0,6);
  document.querySelector('#app').innerHTML=`
    <section class="card panel"><p class="eyebrow">個人最適化</p><h1>マイ授業デスク</h1><p>固定レイアウトのまま、よく使う教科・機能・最近の単元だけを優先表示します。</p></section>
    <section class="section three-col">
      <div class="card panel"><h2>📌 よく使う</h2><div class="list">${top.length?top.map(x=>`<div class="list-item">${label(x[0])} <b>${x[1]}</b></div>`).join(''):'<div class="list-item muted">利用すると表示されます</div>'}</div></div>
      <div class="card panel"><h2>⭐ お気に入り</h2><div class="list">${state.favorites.length?state.favorites.map(x=>`<div class="list-item">${x}</div>`).join(''):'<div class="list-item muted">まだありません</div>'}</div></div>
      <div class="card panel"><h2>🕘 最近使った</h2><div class="list">${state.recents.length?state.recents.slice(0,8).map(x=>`<div class="list-item">${x.label}</div>`).join(''):'<div class="list-item muted">まだありません</div>'}</div></div>
    </section>`;
}
function renderAnalytics(){
  const entries=Object.entries(state.usage).sort((a,b)=>b[1]-a[1]); const total=entries.reduce((a,b)=>a+b[1],0)||1;
  document.querySelector('#app').innerHTML=`
    <section class="card panel"><p class="eyebrow">運営者向け</p><h1>利用分析</h1><p>人気教科・機能を見て、強いジャンルを優先的に充実させます。</p></section>
    <section class="section metric-grid">${[['総操作',state.total],['利用種類',entries.length],['お気に入り',state.favorites.length],['履歴',state.recents.length]].map(x=>`<div class="metric card"><div class="muted">${x[0]}</div><div class="num">${x[1]}</div></div>`).join('')}</section>
    <section class="section two-col">
      <div class="card panel"><h2>人気機能</h2>${entries.length?entries.map(([k,v])=>`<div class="bar-row"><span>${label(k)}</span><div class="bar"><i style="width:${Math.round(v/total*100)}%"></i></div><b>${v}</b></div>`).join(''):'<p class="muted">まだデータがありません。</p>'}</div>
      <div class="card panel"><h2>次に強化する候補</h2><div class="list">${entries.slice(0,3).map(([k,v],i)=>`<div class="list-item"><b>${i+1}. ${label(k)}</b><span class="muted">${v}回利用</span></div>`).join('')||'<div class="list-item">まず5教科を触って傾向を集めます。</div>'}</div></div>
    </section>
    <section class="section card panel"><h2>教科別機能マトリクス</h2>${matrixHtml()}</section>`;
}
function matrixHtml(){
  const rows=[
    ['授業案','◎','◎','◎','◎','◎'],['板書・視覚化','◎','◎','◎','◎','○'],['ミニテスト','◎','◎','◎','◎','◎'],
    ['図・挿絵','○','◎','◎','◎','◎'],['実験/観察','△','△','◎','△','△'],['地図/年表','△','△','△','◎','△'],
    ['会話/音読','○','△','△','△','◎'],['つまずき対策','◎','◎','◎','◎','◎'],['5分活動','◎','◎','◎','◎','◎']
  ];
  return `<div style="overflow:auto"><table class="matrix"><thead><tr><th>機能</th><th>国語</th><th>算数</th><th>理科</th><th>社会</th><th>英語</th></tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function label(k){return ({grade:'学年選択',subject:'教科選択',unit:'単元選択',level:'レベル切替',favorite:'お気に入り',quiz:'ミニテスト',boardTemplate:'板書テンプレート'}[k]||k)}
mount('home');
