
const K='senseiJitanAI_v81';
const state=JSON.parse(localStorage.getItem(K)||'null')||{subject:'math',grade:6,unit:'比とその利用',level:'standard',boardTemplate:'flow',favorites:[],recents:[],usage:{},total:0};

if(!state.boardTemplate) state.boardTemplate='flow';


if(!Array.isArray(state.bookmarks)) state.bookmarks=[];
if(!state.lastOpened) state.lastOpened=null;

function unitUrl(grade,subject,unitId){
  const u=new URL(window.location.href);
  u.searchParams.set('grade',grade);
  u.searchParams.set('subject',subject);
  u.searchParams.set('unit',unitId);
  return u.pathname+'?'+u.searchParams.toString();
}
function writeUnitUrl(){
  if(!state.unitId) return;
  const url=unitUrl(state.grade,state.subject,state.unitId);
  history.replaceState({view:'unit'},'',url);
}
function clearUnitUrl(){
  const u=new URL(window.location.href);
  u.searchParams.delete('grade');
  u.searchParams.delete('subject');
  u.searchParams.delete('unit');
  history.replaceState({view:'home'},'',u.pathname);
}
function applyUrlState(){
  const p=new URLSearchParams(location.search);
  const grade=Number(p.get('grade'));
  const subject=p.get('subject');
  const unitId=p.get('unit');
  if(grade>=1&&grade<=6&&subject&&subjects[subject]&&unitId){
    state.grade=grade;
    state.subject=subject;
    state.unitId=unitId;
    const rec=UNIT_DB.find(u=>u.unit_id===unitId);
    if(rec) state.unit=rec.canonical_unit_name;
    return 'unit';
  }
  return null;
}
function bookmarkKey(){
  return `${state.grade}:${state.subject}:${state.unitId}`;
}
function isBookmarked(){
  return state.bookmarks.some(b=>b.key===bookmarkKey());
}
function bookmarksForGrade(grade=state.grade){
  return state.bookmarks.filter(b=>Number(b.grade)===Number(grade));
}
function bookmarkCountForGrade(grade=state.grade){
  return bookmarksForGrade(grade).length;
}
function toggleBookmark(){
  const key=bookmarkKey();
  if(isBookmarked()){
    state.bookmarks=state.bookmarks.filter(b=>b.key!==key);
  }else{
    state.bookmarks.unshift({
      key,
      grade:state.grade,
      subject:state.subject,
      unitId:state.unitId,
      unit:state.unit,
      label:`小${state.grade} ${subjectUiName(state.subject)}「${state.unit}」`,
      savedAt:Date.now()
    });
  }
  save();
}
function rememberLastOpened(){
  state.lastOpened={
    grade:state.grade,
    subject:state.subject,
    unitId:state.unitId,
    unit:state.unit,
    label:`小${state.grade} ${subjectUiName(state.subject)}「${state.unit}」`,
    openedAt:Date.now()
  };
  save();
}
function openSavedUnit(item){
  if(!item) return;
  state.grade=item.grade;
  state.subject=item.subject;
  state.unitId=item.unitId;
  const rec=UNIT_DB.find(u=>u.unit_id===item.unitId);
  state.unit=rec?.canonical_unit_name||item.unit||'';
  mount('unit');
}

const subjects={
  jp:{name:'国語',icon:'📖',class:'jp',desc:'発問・心情・要約・音読',units:['物語文を読み深める','説明文の要旨を捉える','熟語の成り立ち','漢字の使い分け'],focus:['発問','心情変化','人物関係','要約','音読']},
  math:{name:'算数',icon:'➗',class:'math',desc:'図解・板書・つまずき対策',units:['比とその利用','分数のかけ算','分数のわり算','円の面積','比例と反比例'],focus:['図解','板書','解法比較','ミニテスト','つまずき']},
  science:{name:'理科',icon:'🔬',class:'science',desc:'実験・観察・安全・図解',units:['ものの燃え方','植物のからだ','水溶液の性質','月と太陽','電気の利用'],focus:['実験手順','安全','予想','観察','結果整理']},
  social:{name:'社会',icon:'🌏',class:'social',desc:'地図・年表・資料読み取り',units:['縄文から古墳へ','武士の世の中','江戸の社会','明治の国づくり','日本と世界のつながり'],focus:['地図','年表','資料','比較','問い']},
  english:{name:'英語',icon:'💬',class:'english',desc:'会話・音読・ゲーム・活動',units:['自己紹介をしよう','日常生活を伝えよう','行きたい国を紹介しよう','思い出を伝えよう'],focus:['会話','音読','単語','ペア活動','ゲーム']}
};

const grades=[1,2,3,4,5,6];

const subjectDbMap={jp:'国語',math:'算数',science:'理科',social:'社会'};
function dbSubjectName(key,grade=state.grade){
  if(key==='english') return grade<=4?'外国語活動':'外国語';
  return subjectDbMap[key];
}
function isSubjectAvailable(key,grade=state.grade){
  if((key==='science'||key==='social') && grade<3) return false;
  if(key==='english' && grade<3) return false;
  return true;
}
function subjectUiName(key,grade=state.grade){
  if(key==='english'){
    if(grade<=2) return '英語';
    if(grade<=4) return '外国語活動';
    return '英語';
  }
  return subjects[key].name;
}
function unitsFor(grade,key){
  if(!isSubjectAvailable(key,grade)) return [];
  const dbName=dbSubjectName(key,grade);
  return UNIT_DB.filter(u=>u.grade===grade && u.subject===dbName);
}
function firstUnitFor(grade,key){
  const list=unitsFor(grade,key);
  return list.length?list[0]:null;
}
function currentUnitRecord(){
  const list=unitsFor(state.grade,state.subject);
  return list.find(u=>u.unit_id===state.unitId) ||
         list.find(u=>u.canonical_unit_name===state.unit) ||
         list[0] || null;
}

function materialsForCurrentUnit(){
  if(typeof MATERIAL_DB==='undefined') return [];
  return MATERIAL_DB.filter(m =>
    m.grade===state.grade &&
    m.subject===dbSubjectName(state.subject,state.grade) &&
    m.canonical_unit_name===state.unit
  );
}


function visualPict(){
  return `<span class="icon-pict icon-visual" aria-hidden="true">
    <svg viewBox="0 0 24 24" role="img" focusable="false">
      <rect x="3.5" y="5" width="17" height="14" rx="2.2" ry="2.2"></rect>
      <circle cx="9" cy="10" r="1.8"></circle>
      <path d="M6.5 16l3.2-3.4a1 1 0 0 1 1.45 0l2.1 2.2 1.9-1.9a1 1 0 0 1 1.4 0L19 15.3"></path>
    </svg>
  </span>`;
}


function lessonPict(){
  return `<span class="icon-pict icon-generic" aria-hidden="true"><svg viewBox="0 0 24 24" role="img" focusable="false"><rect x="5" y="3.8" width="14" height="16.4" rx="1.8" ry="1.8"></rect><path d="M8 8h8M8 12h8M8 16h5"></path></svg></span>`;
}
function boardPict(){
  return `<span class="icon-pict icon-generic" aria-hidden="true"><svg viewBox="0 0 24 24" role="img" focusable="false"><rect x="3.5" y="4" width="17" height="11.5" rx="1.5" ry="1.5"></rect><path d="M8 20h8M12 15.5V20"></path></svg></span>`;
}
function activityPict(){
  return `<span class="icon-pict icon-generic" aria-hidden="true"><svg viewBox="0 0 24 24" role="img" focusable="false"><circle cx="8" cy="12" r="2.5"></circle><circle cx="16" cy="12" r="2.5"></circle><path d="M10.7 12h2.6M8 9.5l.8-2M16 9.5l-.8-2"></path></svg></span>`;
}
function quizPict(){
  return `<span class="icon-pict icon-generic" aria-hidden="true"><svg viewBox="0 0 24 24" role="img" focusable="false"><rect x="6" y="4" width="12" height="16" rx="1.8" ry="1.8"></rect><path d="M9 9l1.5 1.5L13 8M9 14h6"></path></svg></span>`;
}
function bookmarkPict(){
  return `<span class="icon-pict icon-generic" aria-hidden="true"><svg viewBox="0 0 24 24" role="img" focusable="false"><path d="M7 4.5h10v15l-5-2.9-5 2.9z"></path></svg></span>`;
}
function recentPict(){
  return `<span class="icon-pict icon-generic" aria-hidden="true"><svg viewBox="0 0 24 24" role="img" focusable="false"><circle cx="12" cy="12" r="8"></circle><path d="M12 7.5v5l3 1.7"></path></svg></span>`;
}
function materialPict(){
  return `<span class="icon-pict icon-generic" aria-hidden="true"><svg viewBox="0 0 24 24" role="img" focusable="false"><path d="M6.5 4.5h8l3 3V19.5h-11z"></path><path d="M14.5 4.5v3h3M9 12h6M9 15h6"></path></svg></span>`;
}

function subjectPict(key, cls=''){
  const icons={
    jp:'<svg viewBox="0 0 24 24" role="img" focusable="false"><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H12v18H7.5A2.5 2.5 0 0 0 5 23.5z"></path><path d="M19 5.5A2.5 2.5 0 0 0 16.5 3H12v18h4.5A2.5 2.5 0 0 1 19 23.5z"></path><path d="M8 8.5h2.2M8 12h2.2"></path></svg>',
    math:'<svg viewBox="0 0 24 24" role="img" focusable="false"><path d="M7 6h4M9 4v4M14.5 6h4M14.5 17h4M15 12.5l3 3M18 12.5l-3 3"></path><circle cx="9" cy="17" r="1.1"></circle><circle cx="9" cy="13.5" r="1.1"></circle></svg>',
    science:'<svg viewBox="0 0 24 24" role="img" focusable="false"><path d="M9 3h6M11 3v5l-5 8.5A2.2 2.2 0 0 0 7.9 20h8.2a2.2 2.2 0 0 0 1.9-3.5L13 8V3"></path><path d="M8.3 14.5h7.4"></path><circle cx="10" cy="11" r=".8"></circle><circle cx="13.8" cy="13" r=".8"></circle></svg>',
    social:'<svg viewBox="0 0 24 24" role="img" focusable="false"><circle cx="12" cy="12" r="8"></circle><path d="M4 12h16M12 4c2.2 2.2 3.4 5 3.4 8s-1.2 5.8-3.4 8M12 4c-2.2 2.2-3.4 5-3.4 8s1.2 5.8 3.4 8"></path></svg>',
    english:'<svg viewBox="0 0 24 24" role="img" focusable="false"><path d="M5 5h14v10H9l-4 4v-4H5z"></path><path d="M9 9h6M9 12h4"></path><path d="M15.5 18.5h4"></path></svg>'
  };
  return `<span class="icon-pict icon-generic subject-pict ${key} ${cls}" aria-hidden="true">${icons[key]||icons.jp}</span>`;
}

function bookPict(){
  return `<span class="icon-pict icon-generic" aria-hidden="true"><svg viewBox="0 0 24 24" role="img" focusable="false"><path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h5v17H7a2.5 2.5 0 0 0-2.5 2.5z"></path><path d="M19.5 5.5A2.5 2.5 0 0 0 17 3h-5v17h5a2.5 2.5 0 0 1 2.5 2.5z"></path></svg></span>`;
}

function supportPict(){
  return `<span class="icon-pict icon-support" aria-hidden="true">
    <svg viewBox="0 0 24 24" role="img" focusable="false">
      <circle cx="12" cy="5" r="2.6"></circle>
      <path d="M12 8.5c-2.2 0-4 1.8-4 4v1.6H6.3c-.7 0-1.2.5-1.2 1.2v.2c0 .7.5 1.2 1.2 1.2h1.8v3.8c0 .8.6 1.4 1.4 1.4h.6c.8 0 1.4-.6 1.4-1.4v-3.6h1.1v3.6c0 .8.6 1.4 1.4 1.4h.6c.8 0 1.4-.6 1.4-1.4v-3.8h1.8c.7 0 1.2-.5 1.2-1.2v-.2c0-.7-.5-1.2-1.2-1.2H16v-1.6c0-2.2-1.8-4-4-4Z"></path>
    </svg>
  </span>`;
}

function materialCategoryIcon(cat){
  if(cat.includes('プリント')) return quizPict();
  if(cat.includes('板書')) return boardPict();
  if(cat.includes('指導案')) return lessonPict();
  if(cat.includes('授業実践')) return activityPict();
  if(cat.includes('ICT')) return visualPict();
  if(cat.includes('公的')) return materialPict();
  if(cat.includes('教科書')) return bookPict();
  return materialPict();
}

function aliasesForUnit(unitId){
  return UNIT_ALIASES.filter(a=>a.unit_id===unitId);
}
function ensureStateUnit(){
  if(!isSubjectAvailable(state.subject,state.grade)) state.subject='jp';
  const rec=currentUnitRecord() || firstUnitFor(state.grade,state.subject);
  if(rec){
    state.unitId=rec.unit_id;
    state.unit=rec.canonical_unit_name;
  }else{
    state.unitId=null;
    state.unit='';
  }
}


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
if(!boardTemplates.some(t=>t.id===state.boardTemplate)) state.boardTemplate='flow';

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
function btnView(){
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{
    const view=b.dataset.view;

    if(view==='home'){
      clearUnitUrl();
      history.replaceState({view:'home'},'',location.pathname);
    }

    const root=document.querySelector('#app');
    if(root) root.replaceChildren();

    mount(view);
    window.scrollTo({top:0,left:0,behavior:'auto'});
  });
}

function wireCommon(view){
  btnView();

  document.querySelectorAll('[data-anchor]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.anchor;
    const target=document.getElementById(id);
    if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
  });

  // ホーム表示中は、単元/教科ページ用の戻るボタンが残らないよう明示的に除去
  if(view==='home'){
    document.querySelectorAll('#app .nav-row').forEach(el=>el.remove());
  }
}
function renderSubjectTabs(){
  const wrap=document.querySelector('#global-tabs');
  if(!wrap) return;
  wrap.innerHTML=`
    <div class="grade-subject-nav">
      <div class="grade-row">
        <span class="grade-label">学年</span>
        ${grades.map(g=>`<button class="grade-tab ${state.grade===g?'active':''}" data-grade="${g}">${g}年</button>`).join('')}
        <div class="nav-current"><span>現在</span><b>${state.grade}年・${subjectUiName(state.subject)}</b></div>
      </div>
      <div class="subject-tabs">
        ${Object.entries(subjects).map(([k,s])=>`
          <button class="subject-tab ${s.class} ${state.subject===k?'active':''} ${!isSubjectAvailable(k)?'disabled':''}"
                  data-top-subject="${k}" ${!isSubjectAvailable(k)?'disabled':''}>
            ${subjectPict(k)} ${subjectUiName(k)}
          </button>`).join('')}
      </div>
      <div class="grade-bookmark-row">
        <button class="grade-bookmark-btn" data-view="bookmarks">
          ${bookmarkPict()} <span>${state.grade}年のしおり</span>
          <strong>${bookmarkCountForGrade(state.grade)}件</strong>
        </button>
      </div>
    </div>`;
  document.querySelectorAll('[data-grade]').forEach(b=>{
    b.onclick=()=>{
      state.grade=Number(b.dataset.grade);
      if(!isSubjectAvailable(state.subject,state.grade)) state.subject='jp';
      const first=firstUnitFor(state.grade,state.subject);
      state.unitId=first?.unit_id||null;
      state.unit=first?.canonical_unit_name||'';
      track('grade',`${state.grade}年`);
      mount('subject');
    };
  });
  document.querySelectorAll('[data-top-subject]').forEach(b=>{
    b.onclick=()=>{
      if(b.disabled) return;
      state.subject=b.dataset.topSubject;
      const first=firstUnitFor(state.grade,state.subject);
      state.unitId=first?.unit_id||null;
      state.unit=first?.canonical_unit_name||'';
      track('subject',`${state.grade}年 ${subjectUiName(state.subject)}`);
      mount('subject');
    };
  });
  const gradeBookmarkBtn=document.querySelector('.grade-bookmark-btn');
  if(gradeBookmarkBtn) gradeBookmarkBtn.onclick=()=>mount('bookmarks');
}
function mount(view='home'){
  ensureStateUnit();
  renderSubjectTabs();
  if(view==='unit'){
    writeUnitUrl();
    rememberLastOpened();
  }else if(view==='home'){
    clearUnitUrl();
  }
  if(view==='home') renderHome();
  else if(view==='subject') renderSubject();
  else if(view==='unit') renderUnit();
  else if(view==='desk') renderDesk();
  else if(view==='bookmarks') renderBookmarks();
  else if(view==='analytics') renderAnalytics();
  wireCommon(view);
}
function renderHome(){
  document.querySelectorAll('#app .nav-row').forEach(el=>el.remove());
  const subjectCards=Object.entries(subjects).map(([k,s])=>{
    const available=isSubjectAvailable(k);
    const count=unitsFor(state.grade,k).length;
    return `<button class="subject-card ${s.class} ${available?'':'disabled-card'}" data-subject="${k}" ${available?'':'disabled'}>
      <span class="subject-icon">${subjectPict(k, "lg")}</span><h3>${subjectUiName(k)}</h3>
      <p>${available?s.desc:'この学年では対象外です'}</p>
      <small>${available?`${count}単元を登録`:'—'}</small>
    </button>`;
  }).join('');
  const last=state.lastOpened;
  document.querySelector('#app').innerHTML=`
    ${last?`<section class="continue-card card">
      <div><span class="eyebrow">前回の続き</span><h2>${last.label}</h2><p>最後に開いていた単元からすぐ再開できます。</p></div>
      <button id="continue-last">続きから開く →</button>
    </section>`:''}
    <section class="hero card">
      <div><p class="eyebrow">全学年・5教科 単元DB統合版</p><h1>今日は何を<br>準備しますか？</h1>
      <p>学年 → 教科 → 単元を選択。現在 <b>${UNIT_DB.length}単元</b> を登録しています。</p>
      <div class="db-warning">⚠ 現在の単元DBは調査データ取り込み版です。全件「公式確認待ち（needs_review）」として管理しています。</div></div>
      <div class="hero-visual">
        <div class="visual-chip"><b>${bookPict()} ${UNIT_DB.length}単元</b><span>1〜6年を収録</span></div>
        <div class="visual-chip"><b>${bookmarkPict()} ${state.bookmarks.length}件</b><span>しおり保存</span></div>
        <div class="visual-chip"><b>${boardPict()} 板書</b><span>5テンプレート</span></div>
        <div class="visual-chip"><b>${quizPict()} テスト</b><span>答え＋解説</span></div>
      </div>
    </section>
    <section class="section"><div class="section-head"><h2>教科を選ぶ</h2><span class="muted">小学校${state.grade}年</span></div><div class="subject-grid">${subjectCards}</div></section>
    <section class="section two-col">
      <div class="card panel"><h2>${bookmarkPict()} ${state.grade}年のしおり</h2>
        <div class="list">${bookmarksForGrade(state.grade).length?bookmarksForGrade(state.grade).slice(0,5).map((b,i)=>`<button class="list-item bookmark-home" data-grade-bookmark-index="${i}">${subjectPict(b.subject)} ${subjectUiName(b.subject,b.grade)}「${b.unit}」</button>`).join(''):'<div class="list-item muted">この学年のしおりはまだありません</div>'}</div>
        <button class="bookmark-list-open" data-view="bookmarks">${bookmarkPict()} しおり一覧を見る</button>
      </div>
      <div class="card panel"><h2>${recentPict()} 最近使った</h2><div class="list">${state.recents.length?state.recents.slice(0,5).map(x=>`<div class="list-item">${x.label}</div>`).join(''):'<div class="list-item muted">まだありません</div>'}</div></div>
    </section>`;
  document.querySelectorAll('[data-subject]').forEach(b=>b.onclick=()=>{
    if(b.disabled) return;
    state.subject=b.dataset.subject;
    const first=firstUnitFor(state.grade,state.subject);
    state.unitId=first?.unit_id||null;
    state.unit=first?.canonical_unit_name||'';
    track('subject',subjectUiName(state.subject));
    mount('subject');
  });
  const cont=document.querySelector('#continue-last');
  if(cont) cont.onclick=()=>openSavedUnit(state.lastOpened);
  document.querySelectorAll('[data-grade-bookmark-index]').forEach(b=>b.onclick=()=>{
    const items=bookmarksForGrade(state.grade);
    openSavedUnit(items[Number(b.dataset.gradeBookmarkIndex)]);
  });
  document.querySelectorAll('.bookmark-list-open[data-view="bookmarks"]').forEach(b=>b.onclick=()=>mount('bookmarks'));
}
function renderSubject(){
  const s=subjects[state.subject];
  const list=unitsFor(state.grade,state.subject);
  const displayName=subjectUiName(state.subject);
  document.querySelector('#app').innerHTML=`
  <div class="nav-row">
    <button class="back-btn" data-view="home">← ホームに戻る</button>
    <div class="breadcrumb"><button data-view="home">ホーム</button><span>›</span><span>小学校${state.grade}年</span><span>›</span><span>${displayName}</span></div>
  </div>
  <section class="subject-header card">
    <div><span class="subject-badge ${s.class}">${subjectPict(state.subject)} ${displayName}</span><h1>小${state.grade} ${displayName}の授業準備</h1>
    <p>${s.desc}を中心に、${s.focus.join('・')}をまとめます。</p></div>
    <div class="figure-card"><b>単元DB</b><div class="figure">${list.length}<br><small>登録単元</small></div></div>
  </section>
  <section class="section card panel">
    <div class="section-head"><div><h2>単元を選ぶ</h2><span class="muted">${list.length}単元・全件公式確認待ち</span></div></div>
    <div class="unit-filter-row">
      <input id="unit-search" type="search" placeholder="単元名・キーワードで検索" />
      <select id="term-filter">
        <option value="">全学期</option><option value="1">1学期</option><option value="2">2学期</option><option value="3">3学期</option>
      </select>
    </div>
    <div id="unit-db-grid" class="unit-grid">${renderUnitCards(list)}</div>
  </section>
  <section class="section card panel"><h2>この教科で特に強化するもの</h2>
    <div class="quick-grid">${s.focus.slice(0,4).map(x=>`<div class="quick"><b>${x}</b><span>${displayName}専用の表示・生成に最適化</span></div>`).join('')}</div>
  </section>`;
  const search=document.querySelector('#unit-search');
  const term=document.querySelector('#term-filter');
  const refresh=()=>{
    const q=(search.value||'').trim().toLowerCase();
    const t=term.value;
    const filtered=list.filter(u=>(!t||String(u.term)===t) &&
      (!q||`${u.canonical_unit_name} ${u.learning_objective} ${u.key_concepts}`.toLowerCase().includes(q)));
    document.querySelector('#unit-db-grid').innerHTML=renderUnitCards(filtered);
    wireUnitCards();
  };
  search.oninput=refresh; term.onchange=refresh;
  wireUnitCards();
}
function renderUnitCards(list){
  if(!list.length) return '<div class="empty-db">該当する単元がありません。</div>';
  return list.map(u=>`<button class="unit-card db-unit-card" data-unit-id="${u.unit_id}">
    <span class="term-chip">${u.term?`${u.term}学期`:'時期未設定'}</span>
    <b>${u.canonical_unit_name}</b>
    <small>${u.key_concepts||''}</small>
    <span class="review-chip">要公式確認</span>
  </button>`).join('');
}
function wireUnitCards(){
  document.querySelectorAll('[data-unit-id]').forEach(b=>b.onclick=()=>{
    const rec=UNIT_DB.find(u=>u.unit_id===b.dataset.unitId);
    if(!rec) return;
    state.unitId=rec.unit_id;
    state.unit=rec.canonical_unit_name;
    track('unit',`${subjectUiName(state.subject)} ${state.unit}`);
    mount('unit');
  });
}

function levelButtons(){return Object.entries(levels).map(([k,l])=>`<button data-level="${k}" class="${state.level===k?'active':''}">${l.label}</button>`).join('')}
function renderUnit(){
  const s=subjects[state.subject];
  const rec=currentUnitRecord();
  const alias=rec?aliasesForUnit(rec.unit_id)[0]:null;
  const base=demo[state.subject];
  const d={...base,
    goal:rec?.learning_objective||base.goal,
    board:[
      `めあて：${rec?.learning_objective||base.board[0]}`,
      base.board[1],
      base.board[2]
    ]
  };
  const lv=levels[state.level];
  const displayName=subjectUiName(state.subject);
  document.querySelector('#app').innerHTML=`
    <div class="nav-row">
      <button class="back-btn" data-view="subject">← ${displayName}の単元一覧に戻る</button>
      <div class="breadcrumb"><button data-view="home">ホーム</button><span>›</span><button data-view="subject">${displayName}</button><span>›</span><span>${state.unit}</span></div>
    </div>
    <section class="subject-header card unit-detail-hero"><div><p class="eyebrow">単元詳細ページ ｜ 小学校${state.grade}年 ＞ ${displayName}</p><h1>${state.unit}</h1>
      <p><span class="review-chip">DB登録済・要公式確認</span> ${rec?.term?`${rec.term}学期`:'時期未設定'}</p>
      <div class="unit-page-nav">
        <button data-anchor="lesson">45分授業案</button>
        <button data-anchor="board">板書</button>
        ${materialsForCurrentUnit().length?'<button data-anchor="materials">実在教材</button>':''}
        <button data-anchor="activity">楽しい活動</button>
        <button data-anchor="quiz">ミニテスト</button>
      </div></div>
      <div class="unit-detail-actions">
        <button id="bookmark" class="bookmark-btn">${isBookmarked()?`${bookmarkPict()} しおり済み`:`${bookmarkPict()} この単元をしおり保存`}</button>
        <button class="bookmark-list-open compact-bookmark-list" data-view="bookmarks">${bookmarkPict()} ${state.grade}年のしおり一覧</button>
      </div></section>
    ${rec?`<section class="unit-db-meta card">
      <div><b>学習目標</b><span>${rec.learning_objective||'未設定'}</span></div>
      <div><b>キーワード</b><span>${rec.key_concepts||'未設定'}</span></div>
      <div><b>前の学習</b><span>${rec.previous_learning||'—'}</span></div>
      <div><b>次の学習</b><span>${rec.next_learning||'—'}</span></div>
      ${alias?`<div class="publisher-meta"><b>出版社での表記（要確認）</b><span>${alias.publisher}「${alias.publisher_unit_name}」 / ${alias.textbook_name}</span><a href="${alias.source_url}" target="_blank" rel="noopener noreferrer">出版社ページ ↗</a></div>`:''}
    </section>`:''}
    <section class="level-panel card"><h2>授業レベル</h2><div class="level-buttons">${levelButtons()}</div><p class="muted">${lv.desc}</p></section>
    <section class="board-shortcut card">
      <div><b>🧑‍🏫 板書をすぐ見る</b><span>5種類の板書テンプレートから選べます</span></div>
      <button data-anchor="board">板書を見る</button>
    </section>
    <section class="unit-layout">
      <aside class="side card">
        <button data-anchor="lesson">${lessonPict()} 授業</button><button data-anchor="board">${boardPict()} 板書</button><button data-anchor="visual">${visualPict()} 図・挿絵</button>
        <button data-anchor="activity">${activityPict()} 活動</button><button data-anchor="quiz">${quizPict()} ミニテスト</button><button data-anchor="support">${supportPict()} つまずき</button>
      </aside>
      <div class="stack">
        <section id="lesson" class="content card"><h2>${lessonPict()} 45分授業案 <span class="muted">・${lv.label}</span></h2>
          <div class="mini"><b>ねらい</b><div>${adapt(d.goal)}</div></div><div class="mini"><b>楽しい導入</b><div>${adapt(d.hook)}</div></div>
          <div class="timeline">${d.timeline.map(x=>`<div class="timeline-row"><b>${x[0]}</b><span>${adapt(x[1])}</span></div>`).join('')}</div></section>
        <section id="board" class="content card">
          <div class="section-head"><div><h2>${boardPict()} 板書サンプル</h2><div class="muted">人気の実践板書に共通する構成を分析した「先生時短AI独自板書」です。元画像の転載はしません。</div></div></div>
          <div class="board-template-tabs">${boardTemplates.map(t=>`<button data-board-template="${t.id}" class="${state.boardTemplate===t.id?'active':''}">${t.name}</button>`).join('')}</div>
          <div class="board-template-note"><b>${currentBoardTemplate().name}</b>：${currentBoardTemplate().desc}</div>
          ${safeBoardHtml(state.boardTemplate,d)}
          <div class="board-actions">
            <button class="unit-card" data-anchor="research">実践板書の参考元を見る</button>
            <button class="unit-card" id="board-large">板書を大きく見る</button>
          </div>
        </section>
        ${materialsForCurrentUnit().length?`
        <section id="materials" class="content card">
          <div class="section-head">
            <div>
              <h2>${materialPict()} この単元で使える実在教材</h2>
              <div class="muted">授業準備に使いやすい教材・実践・指導案をまとめました。第三者サイトの画像やPDFは転載せず、外部リンクで紹介します。</div>
            </div>
          </div>

          <div class="material-filter">
            <button class="active" data-mat-filter="all">すべて</button>
            ${[...new Set(materialsForCurrentUnit().map(m=>m.category))].map(c=>`<button data-mat-filter="${c}">${materialCategoryIcon(c)} ${c}</button>`).join('')}
          </div>

          <div id="material-grid" class="material-grid">
            ${materialsForCurrentUnit().map(m=>`
              <article class="material-card" data-material-category="${m.category}">
                <div class="material-card-head">
                  <span class="material-cat">${materialCategoryIcon(m.category)} ${m.category}</span>
                  <span class="material-status ${m.status==='verified'?'verified':'review'}">${m.status==='verified'?'確認済':'要確認'}</span>
                </div>
                <h3>${m.title}</h3>
                <p class="material-provider">${m.provider}</p>
                <p>${m.description}</p>
                <div class="material-scores">
                  <span>品質 <b>${m.quality_score}/5</b></span>
                  <span>時短 <b>${m.time_saving_score}/5</b></span>
                  <span>見やすさ <b>${m.visual_score}/5</b></span>
                  <span>楽しさ <b>${m.student_engagement_score}/5</b></span>
                </div>
                <div class="material-use"><b>おすすめ用途</b><span>${m.recommended_use}</span></div>
                <a class="material-link" href="${m.url}" target="_blank" rel="noopener noreferrer">教材・実践を見る ↗</a>
              </article>
            `).join('')}
          </div>
        </section>`:''}
        <section id="research" class="content card"><h2>🔎 実践板書リサーチ</h2>
          <p>先生時短AIでは、公開されている優れた板書実践の<strong>構成・見せ方・授業の流れ</strong>を研究し、独自板書に反映します。第三者の板書画像は許諾なく転載しません。</p>
          <div class="research-grid">${boardResearchSources.map((r,i)=>`<article class="research-card"><span class="source-no">参考${i+1}</span><h3>${r.name}</h3><p class="muted">${r.teacher}</p><p>${r.note}</p><a href="${r.url}" target="_blank" rel="noopener noreferrer">公式・公開ページを見る ↗</a></article>`).join('')}</div>
          <h3 style="margin-top:22px">先生時短AI 板書テンプレート5種</h3>
          <div class="lesson-grid">${boardTemplates.map(t=>`<div class="mini"><b>${t.name}</b><div>${t.short}</div><div class="muted">おすすめ：${t.best}</div></div>`).join('')}</div>
        </section>
        <section id="visual" class="content card"><h2>${visualPict()} 図・挿絵・視覚支援</h2>
          <div class="lesson-grid">${visualIdeas(state.subject).map(x=>`<div class="figure-card"><div class="figure">${x[0]}</div><b>${x[1]}</b><div class="muted">${x[2]}</div></div>`).join('')}</div></section>
        <section id="activity" class="content card"><h2>${activityPict()} 楽しい活動 / あと5分</h2>
          <div class="lesson-grid">${activities(state.subject).map(x=>`<div class="mini"><b>${x[0]}</b><div>${adapt(x[1])}</div></div>`).join('')}</div></section>
        <section id="quiz" class="content card"><h2>${quizPict()} ミニテスト</h2>
          <div class="mini"><b>Q. ${d.quiz[0][0]}</b><div class="answer"><b>答え：${d.quiz[0][1]}</b><p>${adapt(d.quiz[0][2])}</p></div></div>
          <button id="regen" class="unit-card">別の問題を作る（デモ）</button></section>
        <section id="support" class="content card"><h2>${supportPict()} つまずき対応</h2>
          <div class="lesson-grid">${supportIdeas(state.subject).map(x=>`<div class="mini"><b>${x[0]}</b><div>${adapt(x[1])}</div></div>`).join('')}</div></section>
      </div>
    </section>`;
  document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{state.level=b.dataset.level;track('level',`${s.name} ${levels[state.level].label}`);mount('unit')});
  document.querySelectorAll('[data-board-template]').forEach(b=>b.onclick=()=>{
    state.boardTemplate=b.dataset.boardTemplate;
    track('boardTemplate',currentBoardTemplate().name);
    mount('unit');
  });
  
  document.querySelectorAll('[data-mat-filter]').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('[data-mat-filter]').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
      const filter=btn.dataset.matFilter;
      document.querySelectorAll('[data-material-category]').forEach(card=>{
        card.style.display=(filter==='all'||card.dataset.materialCategory===filter)?'':'none';
      });
      track('materialFilter', filter);
    };
  });

const boardLarge=document.querySelector('#board-large');
  if(boardLarge) boardLarge.onclick=()=>{
    const board=document.querySelector('#board .visual-board');
    if(board?.requestFullscreen) board.requestFullscreen();
    else board.scrollIntoView({behavior:'smooth',block:'center'});
  };
  document.querySelectorAll('[data-anchor]').forEach(b=>b.onclick=()=>{
    const target=document.querySelector('#'+b.dataset.anchor);
    if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
  });
  
  const bm=document.querySelector('#bookmark');
  if(bm) bm.onclick=()=>{
    toggleBookmark();
    bm.innerHTML=isBookmarked()?`${bookmarkPict()} しおり済み`:`${bookmarkPict()} この単元をしおり保存`;
    track('bookmark',`${state.grade}年 ${subjectUiName(state.subject)} ${state.unit}`);
  };
  document.querySelectorAll('.bookmark-list-open[data-view="bookmarks"]').forEach(b=>b.onclick=()=>mount('bookmarks'));
  document.querySelector('#regen').onclick=()=>{track('quiz',`${s.name}ミニテスト`);alert('正式版では、教科・単元・レベルに応じてAIが別問題と生徒向け解説を生成します。')};
  btnView();
}
function adapt(t){
  if(state.level==='easy') return t+' ※図や例を多めにします。';
  if(state.level==='challenge') return t+' ※理由説明・比較・応用まで扱います。';
  if(state.level==='support') return t+' ※短い文・視覚支援・選択式を優先します。';
  return t;
}

function currentBoardTemplate(){ return boardTemplates.find(t=>t.id===state.boardTemplate) || boardTemplates[0]; }

function safeBoardHtml(type,d){
  try{
    return renderBoardByTemplate(type,d);
  }catch(e){
    return `<div class="visual-board"><div><h3>めあて</h3><div class="chalk">${adapt(d.board[0])}</div></div><div><h4>考える</h4><div class="chalk">${adapt(d.board[1])}</div></div><div><h4>まとめ</h4><div class="chalk">${adapt(d.board[2])}</div></div></div>`;
  }
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

function renderBookmarks(){
  const items=bookmarksForGrade(state.grade);
  const groups=Object.entries(subjects).map(([key,s])=>{
    const subjectItems=items.filter(b=>b.subject===key);
    if(!isSubjectAvailable(key,state.grade)) return '';
    return `
      <section class="bookmark-subject-group card">
        <div class="bookmark-subject-head">
          <div class="bookmark-subject-title">${subjectPict(key,'lg')}<div><b>${subjectUiName(key,state.grade)}</b><span>${subjectItems.length}件</span></div></div>
        </div>
        <div class="bookmark-shortcut-grid">
          ${subjectItems.length?subjectItems.map((b,i)=>{
            const globalIndex=state.bookmarks.findIndex(x=>x.key===b.key);
            return `<article class="bookmark-shortcut">
              <div><span class="term-chip">小${b.grade}</span><h3>${b.unit}</h3></div>
              <div class="bookmark-shortcut-actions">
                <button data-open-bookmark-key="${b.key}">この単元を開く</button>
                <button data-remove-bookmark-global="${globalIndex}" class="ghost">削除</button>
              </div>
            </article>`;
          }).join(''):'<p class="bookmark-empty muted">この教科のしおりはありません。</p>'}
        </div>
      </section>`;
  }).join('');

  document.querySelector('#app').innerHTML=`
    <div class="nav-row">
      <button class="back-btn" data-view="subject">← ${subjectUiName(state.subject)}の単元一覧に戻る</button>
      <div class="breadcrumb"><button data-view="home">ホーム</button><span>›</span><span>${state.grade}年のしおり</span></div>
    </div>
    <section class="bookmark-page-hero card">
      <div>
        <p class="eyebrow">${bookmarkPict()} 学年別しおり</p>
        <h1>小学校${state.grade}年のしおり</h1>
        <p>教科ごとに保存した単元をまとめています。ボタンから単元詳細へすぐ移動できます。</p>
      </div>
      <div class="bookmark-count-large"><b>${items.length}</b><span>保存単元</span></div>
    </section>
    <section class="bookmark-grade-switch card">
      ${grades.map(g=>`<button data-bookmark-grade="${g}" class="${state.grade===g?'active':''}">${g}年 <span>${bookmarkCountForGrade(g)}</span></button>`).join('')}
    </section>
    <div class="bookmark-subject-groups">${groups}</div>`;

  document.querySelectorAll('[data-bookmark-grade]').forEach(b=>b.onclick=()=>{
    state.grade=Number(b.dataset.bookmarkGrade);
    if(!isSubjectAvailable(state.subject,state.grade)) state.subject='jp';
    save();
    mount('bookmarks');
  });
  document.querySelectorAll('[data-open-bookmark-key]').forEach(b=>b.onclick=()=>{
    const item=state.bookmarks.find(x=>x.key===b.dataset.openBookmarkKey);
    openSavedUnit(item);
  });
  document.querySelectorAll('[data-remove-bookmark-global]').forEach(b=>b.onclick=()=>{
    const i=Number(b.dataset.removeBookmarkGlobal);
    if(i>=0){
      state.bookmarks.splice(i,1);
      save();
      mount('bookmarks');
    }
  });
  btnView();
}

function renderDesk(){
  document.querySelector('#app').innerHTML=`
    <div class="nav-row"><button class="back-btn" data-view="home">← ホームに戻る</button></div>
    <section class="card panel">
      <div class="section-head"><div><h1>${bookmarkPict()} マイ授業デスク</h1><p class="muted">前回の続きと、学年別しおりへすぐ移動できます。</p></div></div>
      ${state.lastOpened?`<div class="continue-card compact"><div><span class="eyebrow">前回の続き</span><h3>${state.lastOpened.label}</h3></div><button id="desk-continue">開く →</button></div>`:''}
      <div class="desk-grade-bookmarks">
        ${grades.map(g=>`<button data-desk-grade="${g}" class="${state.grade===g?'active':''}">${bookmarkPict()} ${g}年のしおり <b>${bookmarkCountForGrade(g)}</b></button>`).join('')}
      </div>
    </section>`;
  const c=document.querySelector('#desk-continue');
  if(c) c.onclick=()=>openSavedUnit(state.lastOpened);
  document.querySelectorAll('[data-desk-grade]').forEach(b=>b.onclick=()=>{
    state.grade=Number(b.dataset.deskGrade);
    if(!isSubjectAvailable(state.subject,state.grade)) state.subject='jp';
    save();
    mount('bookmarks');
  });
  btnView();
}
function renderAnalytics(){
  const entries=Object.entries(state.usage).sort((a,b)=>b[1]-a[1]); const total=entries.reduce((a,b)=>a+b[1],0)||1;
  document.querySelector('#app').innerHTML=`
    <section class="card panel"><p class="eyebrow">運営者向け</p><h1>利用分析</h1><p>人気教科・機能を見て、強いジャンルを優先的に充実させます。</p></section>
    <section class="section metric-grid">${[['総操作',state.total],['利用種類',entries.length],['しおり',state.bookmarks.length],['履歴',state.recents.length]].map(x=>`<div class="metric card"><div class="muted">${x[0]}</div><div class="num">${x[1]}</div></div>`).join('')}</section>
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
function label(k){return ({grade:'学年選択',subject:'教科選択',unit:'単元選択',level:'レベル切替',quiz:'ミニテスト',boardTemplate:'板書テンプレート',materialFilter:'教材フィルター',bookmark:'しおり'}[k]||k)}
const initialView=applyUrlState()||'home';
mount(initialView);
