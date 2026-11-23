/* Discovery workspace: hash navigation, editable records and durable autosave. */
'use strict';
const M=DiscoveryModel, $=s=>document.querySelector(s), esc=M.esc;
const KEY='portfolio-discovery-v2';
const SYNC_KEY='portfolio-discovery-sync-key';
const paths={home:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',bulb:'<path d="M9 18h6M9 21h6M8 14a7 7 0 1 1 8 0l-1 2H9z"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',check:'<path d="m7 12 3 3 7-7"/><rect x="3" y="3" width="18" height="18" rx="5"/>',layers:'<path d="m12 3 10 6-10 6L2 9zM2 13l10 6 10-6M2 17l10 6 10-6"/>',grid:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6M17 2v6M3 11h18M8 15h3M8 18h6"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',back:'<path d="M19 12H5m5-5-5 5 5 5"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',archive:'<rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v13h14V8M9 12h6"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',report:'<path d="M8 3h12v18H4V7zM8 3v4H4M8 11h8M8 15h8M8 18h5"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',plus:'<path d="M12 5v14M5 12h14"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>'};
function icon(name){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.file)+'</svg>'}
const extras={home:'Обзор',researchHub:'Интервью',researchPlan:'Research Plan',researchInterviews:'Глубинные интервью',researchSurveys:'Количественные опросы',researchAnalysis:'Анализ глубинных интервью',crud:'CRUD по ролям',report:'Основной отчёт',archive:'Архив',sync:'ChatGPT и облако'};
let state,seedState,revision=0,server=false,cloud=false,cloudToken='',proposals=[],dirty=false,generation=0,saving=false,blocked=false,saveTimer,toastTimer,preview=false;
let interviewStore=null,interviewSummary=null,interviewRevision=0,interviewLoading=false,interviewSummaryLoading=false,interviewError='';
let qualitativeAnalysis=null,deploy1Matrix=[];
let route={kind:'home',id:'',params:new URLSearchParams()},previousHash='',scrollPositions=new Map();
const colors=['purple','mint','blue','peach'];
const titleFor=kind=>M.config[kind]?.title||extras[kind]||'Обзор';
const alive=kind=>state[kind].filter(r=>!r.archived);
function uri(kind,id='',params={}){const p=new URLSearchParams(params);return '#/'+kind+(id?'/'+encodeURIComponent(id):'')+(p.size?'?'+p:'')}
function parseRoute(){try{const [path,query='']=location.hash.replace(/^#\/?/,'').split('?');const [kind='home',id='']=path.split('/');return {kind:M.kinds.includes(kind)||extras[kind]?kind:'home',id:decodeURIComponent(id),params:new URLSearchParams(query)}}catch{return {kind:'home',id:'',params:new URLSearchParams()}}}
function currentRecord(){return M.kinds.includes(route.kind)?state[route.kind].find(r=>M.recordId(route.kind,r)===route.id):null}
function refOf(){const row=currentRecord();return row?M.reference(route.kind,row):''}
function getParam(name,fallback=''){return route.params.get(name)||fallback}
function go(kind,id='',params={}){closeDialog();location.hash=uri(kind,id,params)}
function back(){if((history.state?.discoveryDepth||0)>0)history.back();else go(route.id?route.kind:'home')}
function filter(name,value){const focused=document.activeElement,selection=focused?.selectionStart;route.params.set(name,value);if(!value)route.params.delete(name);history.replaceState(history.state,'',uri(route.kind,route.id,Object.fromEntries(route.params)));render();const target=document.querySelector('[data-filter="'+name+'"]');if(target){target.focus();if(typeof selection==='number'&&target.setSelectionRange)target.setSelectionRange(selection,selection)}}
function tone(status=''){if(/открыт|гипотез|не определ|частич|идея|обсуж|пересмотр/i.test(status))return 'amber';if(/^(согласован[ао]?|принято|подтверждена|готово|завершено|зафиксировано)$/i.test(status))return 'green';if(/процесс|провер|работ|прорабаты/i.test(status))return 'blue';return 'gray'}
function pill(status){return '<span class="pill '+tone(status)+'">'+esc(status||'Не определено')+'</span>'}
function button(label,action,cls='',attrs=''){return '<button class="button '+cls+'" data-action="'+action+'" '+attrs+'>'+label+'</button>'}
function dateLabel(value){if(!value)return 'Из материалов проекта';const date=new Date(value);return Number.isNaN(date.getTime())?'Без даты':date.toLocaleDateString('ru-RU',{day:'numeric',month:'short',timeZone:'Europe/Moscow'})}
function heading(title,desc,actions='',eyebrow='DISCOVERY / PORTFOLIO'){return '<div class="heading"><div><div class="eyebrow">'+eyebrow+'</div><h1>'+esc(title)+'</h1><p>'+esc(desc)+'</p></div><div class="heading-actions">'+actions+'</div></div>'}
function empty(text,action=''){return '<div class="empty">'+icon('file')+'<p>'+esc(text)+'</p>'+action+'</div>'}
function lookup(ref){return M.resolve(state,ref)}
function titleRef(ref){const item=lookup(ref);return item?M.recordTitle(item.kind,item.row):'Недоступный материал'}
function linksFor(row){return Array.isArray(row.links)?row.links:[]}
function recordHref(kind,row){return uri(kind,M.recordId(kind,row))}
function textPreview(row){return (row.description||row.assumption||row.question||row.body||'Добавьте описание и основания.').replace(/[#*`>]/g,'').slice(0,140)}

function storageRead(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
async function cloudRequest(path,options={}){const response=await fetch(path,{...options,headers:{Authorization:'Bearer '+cloudToken,...options.headers}});const result=await response.json();if(!response.ok){const error=Error(result.error||'Ошибка облака');error.status=response.status;throw error}return result}
async function interviewRequest(summary=false){
  const path='/api/research-interviews'+(summary?'?summary=1':'');
  if(cloud)return cloudRequest(path);
  if(server){const response=await fetch(path);const result=await response.json();if(!response.ok)throw Error(result.error||'Не удалось загрузить интервью');return result;}
  throw Error('Подключи закрытое облако, чтобы открыть обезличенные интервью.');
}
async function importInterviewData(data){
  const interviews=data?.interviews,guide=data?.guide;
  if(data?.schemaVersion!==1||!Array.isArray(interviews)||interviews.length!==8||guide?.blocks?.length!==12||guide?.questions?.length!==120)throw Error('Ожидается набор: 8 интервью, 12 блоков и 120 вопросов.');
  for(let index=0;index<8;index++){const item=interviews[index],respondentId='R'+String(index+1).padStart(2,'0');if(item?.respondentId!==respondentId||!Array.isArray(item.answers)||item.answers.length!==120)throw Error('Некорректная структура '+respondentId+'.');const numbers=new Set(item.answers.map(answer=>answer.questionNumber));if(numbers.size!==120||![...numbers].every(number=>number>=1&&number<=120))throw Error('В '+respondentId+' есть пропуски или дубликаты.');}
  const payload={revision:interviewRevision,data};let result;
  if(cloud)result=await cloudRequest('/api/research-interviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  else if(server){const response=await fetch('/api/research-interviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});result=await response.json();if(!response.ok){const error=Error(result.error||'Импорт не выполнен');error.status=response.status;throw error;}}
  else throw Error('Подключи закрытое облако перед импортом.');
  interviewStore=data;interviewSummary={revision:result.revision,interviewCount:data.interviews.length,blockCount:data.guide.blocks.length,questionCount:data.guide.questions.length,answerCount:data.interviews.reduce((total,item)=>total+(item.answers?.length||0),0)};interviewRevision=result.revision;interviewError='';render();toast(result.unchanged?'Набор уже был импортирован':'Импортировано 8 интервью · 960 ответов');
}
function chooseInterviewImport(){
  const input=document.createElement('input');input.type='file';input.accept='application/json,.json';input.hidden=true;document.body.append(input);
  input.addEventListener('change',async()=>{try{const file=input.files[0];if(!file)return;if(file.size>4_000_000)throw Error('Файл больше 4 МБ');const parsed=JSON.parse(await file.text());await importInterviewData(parsed.data||parsed);}catch(error){toast('Импорт не выполнен: '+error.message)}finally{input.remove();}});
  input.click();
}
async function ensureInterviewSummary(force=false){
  if(interviewSummaryLoading||(!force&&interviewSummary))return;
  if(!server&&!cloud)return;
  interviewSummaryLoading=true;
  try{interviewSummary=await interviewRequest(true);interviewRevision=interviewSummary.revision||0;}
  catch(error){interviewSummary=null;}
  finally{interviewSummaryLoading=false;if(route.kind==='researchHub')render();}
}
async function ensureInterviewData(force=false){
  if(interviewLoading||(!force&&interviewStore))return;
  interviewLoading=true;interviewError='';if(route.kind==='researchInterviews')render();
  try{const result=await interviewRequest();interviewStore=result.data||null;interviewRevision=result.revision||0;if(interviewStore)interviewSummary={revision:result.revision,interviewCount:interviewStore.interviews?.length||0,blockCount:interviewStore.guide?.blocks?.length||0,questionCount:interviewStore.guide?.questions?.length||0,answerCount:(interviewStore.interviews||[]).reduce((total,item)=>total+(item.answers?.length||0),0)};if(!interviewStore)interviewError='Набор интервью ещё не импортирован в закрытое хранилище.';}
  catch(error){interviewStore=null;interviewError=error.message;}
  finally{interviewLoading=false;if(route.kind==='researchInterviews')render();}
}
function backup(){try{localStorage.setItem(KEY,JSON.stringify({state,revision,dirty,updatedAt:new Date().toISOString()}));return true}catch{showError('Не удалось сохранить резервную копию в браузере. Скачайте JSON через кнопку резервной копии.');return false}}
function setSaveStatus(text){$('#saveStatus').textContent=text}
function showError(text){const el=$('#saveError');el.hidden=false;el.innerHTML='<span>'+esc(text)+'</span>'+button('Скачать копию','export','small')+button('Повторить','retry','small')}
function changed(){dirty=true;generation++;backup();setSaveStatus(server||cloud?'Есть изменения · сохраняем…':'Изменения сохранены в этом браузере');clearTimeout(saveTimer);saveTimer=setTimeout(flush,650)}
async function flush(){
  clearTimeout(saveTimer);if(!dirty||saving||blocked)return;
  if(!server&&!cloud){dirty=false;backup();setSaveStatus('Сохранено в браузере · локальный режим');return;}
  saving=true;const gen=generation,snapshot=JSON.parse(JSON.stringify(state));setSaveStatus(cloud?'Сохраняем в облако…':'Сохраняем на диск…');
  try{
    let result;
    if(cloud)result=await cloudRequest('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:snapshot,revision})});
    else{const response=await fetch('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:snapshot,revision})});result=await response.json();if(!response.ok){const error=Error(result.error||'Ошибка сохранения');error.status=response.status;throw error}}
    revision=result.revision;dirty=generation!==gen;backup();$('#saveError').hidden=true;
    if(result.warning)showError(result.warning);
    setSaveStatus((cloud?'Сохранено в облаке · ':'Сохранено на диск · ')+new Date(result.savedAt).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Moscow'}));
  }catch(error){if(error.status===409)blocked=true;showError(error.message+' Несохранённая копия остаётся в этом браузере.');setSaveStatus(cloud?'Не сохранено в облаке':'Не сохранено на диск');}
  finally{saving=false;if(dirty&&generation!==gen&&!blocked)saveTimer=setTimeout(flush,150)}
}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800)}
function nav(){
  const groups=[['ПРОСТРАНСТВО',['home','documents','researchHub','hypotheses','research','decisions']],['МОДЕЛЬ ПРОДУКТА',['entities','matrix','crud']],['ОРГАНИЗАЦИЯ',['tasks','report','archive','sync']]];
  $('#navigation').innerHTML=groups.map(([title,items])=>'<div class="nav-label">'+title+'</div>'+items.map(kind=>'<a class="nav-link '+(route.kind===kind||(['researchPlan','researchInterviews','researchSurveys','researchAnalysis'].includes(route.kind)&&kind==='researchHub')?'active':'')+'" href="'+uri(kind)+'" '+(route.kind===kind?'aria-current="page"':'')+'>'+icon(M.config[kind]?.icon||({home:'home',researchHub:'search',crud:'lock',report:'report',archive:'archive',sync:'upload'})[kind])+'<span>'+titleFor(kind)+'</span><span class="nav-number">'+(M.kinds.includes(kind)?alive(kind).length:kind==='report'?state.reportItems.filter(r=>lookup(r)&&!lookup(r).row.archived).length:kind==='sync'&&cloud?proposals.filter(p=>p.status==='pending').length:'')+'</span></a>').join('')).join('');
}
function breadcrumbs(){const row=currentRecord();$('#breadcrumbs').innerHTML='<a class="root-crumb" href="'+uri('home')+'">Рабочее пространство</a><span class="root-crumb">/</span>'+(row?'<a href="'+uri(route.kind)+'">'+titleFor(route.kind)+'</a><span>/</span><b>'+esc(M.recordTitle(route.kind,row))+'</b>':'<b>'+titleFor(route.kind)+'</b>');$('#backButton').disabled=route.kind==='home'&&!(history.state?.discoveryDepth>0)}
function render(){if(!state)return;route=parseRoute();nav();breadcrumbs();let html;const row=currentRecord();if(route.id&&M.kinds.includes(route.kind))html=row?detailView(route.kind,row):empty('Материал не найден. Он мог быть удалён из импортированной копии.',button('Вернуться к разделу','parent'));else if(route.kind==='home')html=homeView();else if(route.kind==='researchHub')html=researchHubView();else if(route.kind==='researchPlan')html=researchPlanView();else if(route.kind==='researchInterviews')html=researchInterviewsView();else if(route.kind==='researchAnalysis')html=qualitativeAnalysisView();else if(route.kind==='researchSurveys')html=researchSubsectionView(route.kind);else if(route.kind==='matrix')html=matrixView();else if(route.kind==='crud')html=crudView();else if(route.kind==='report')html=reportView();else if(route.kind==='archive')html=archiveView();else if(route.kind==='sync')html=syncView();else html=collectionView(route.kind);$('#content').innerHTML=html;if(route.kind==='researchAnalysis'){bindQualitativeTypography($('#content .qa-page'));initQualitativePanels();}}

function findResearchPlan(){return state.documents.find(d=>d.id===M.researchPlan.id||d.title.trim().toLocaleLowerCase('ru-RU')===M.researchPlan.title.toLocaleLowerCase('ru-RU'))}
function researchHubView(){
  const plan=findResearchPlan(),storedInterviews=interviewSummary?.interviewCount??interviewStore?.interviews?.length??null,surveys=alive('research').filter(r=>r.format==='Количественный опрос').length,hypotheses=alive('hypotheses').length,analysis=qualitativeAnalysis?.patterns?.length||14;
  const interviewLabel=storedInterviews===null?'8 в источнике · хранилище не подключено':storedInterviews===8?'8 загружено · 7 независимых + SELF01':'8 в источнике · в закрытом хранилище: '+storedInterviews;
  const items=[['researchPlan','Research Plan','Согласованная методика: версия 1.0, 18 решений.',plan?'Документ сохранён в Discovery':'Утверждённый документ · v1.0'],['researchInterviews','Глубинные интервью','8 сессий: R01–R07 и отдельная самооценка SELF01.',interviewLabel+' · 960 ячеек ответов'],['researchSurveys','Количественные опросы','Анкеты и материалы опросов студентов и преподавателей.',surveys+' записей в рабочем пространстве'],['hypotheses','Гипотезы и доказательства','Текущий реестр проверяемых предположений.',hypotheses+' записей'],['researchAnalysis','Анализ глубинных интервью','14 паттернов, продуктовые границы и ограничения доказательств.',analysis+' паттернов']];
  return heading('Интервью','План, первичные материалы и качественный анализ Portfolio.',button('Все записи исследований','open-research','quiet'),'PORTFOLIO / RESEARCH')+'<div class="research-intro"><span class="research-intro-mark">R</span><div><span class="eyebrow">DISCOVERY / RESEARCH</span><h2>От исследовательского вопроса к обоснованному решению</h2><p>В исследовательском массиве 8 сессий: семь независимых участников R01–R07 и отдельная самооценка SELF01. R01 — внешний сравнительный участник. Набор Q1–Q120 содержит 960 ячеек «вопрос–ответ», а не 960 независимых наблюдений. Первичные ответы остаются в закрытом контуре.</p></div></div><div class="research-grid">'+items.map(([kind,title,desc,count])=>'<a class="card research-tile" href="'+uri(kind)+'"><span class="research-tile-icon">'+icon(kind==='researchPlan'?'file':kind==='hypotheses'?'bulb':kind==='researchAnalysis'?'report':'search')+'</span><span class="eyebrow">'+(kind==='researchPlan'?'МЕТОДОЛОГИЯ':kind==='researchAnalysis'?'ОТЧЁТНОСТЬ':'СБОР И АНАЛИЗ')+'</span><h2>'+esc(title)+'</h2><p>'+esc(desc)+'</p><span class="research-tile-meta">'+esc(count)+' '+icon('arrow')+'</span></a>').join('')+'</div>';
}
function researchPlanView(){
  const row=findResearchPlan();
  if(row)return heading(row.title,'Согласованный методологический документ. Изменения в сохранённой записи редактируются штатным редактором документов.',button('Открыть для редактирования','open-plan','primary')+reportButton(M.reference('documents',row)),'PORTFOLIO / RESEARCH PLAN')+'<div class="card research-plan-paper"><div class="research-plan-meta">'+pill(row.status)+'<span>Версия 1.0</span><span>Утверждён 06.11.2026</span><span>18 решений</span></div><article class="document-reader">'+M.markdown(row.body)+'</article></div>';
  const action=cloud?button('Сохранить в облачное рабочее пространство','research-plan-save','primary'):button('Подключить облако для сохранения','sync-connect','primary');
  return '<a class="text-link back-link" href="'+uri('researchHub')+'">'+icon('back')+'К разделу «Исследования»</a>'+heading(M.researchPlan.title,'Утверждённый методологический документ для продукта Portfolio.',action,'PORTFOLIO / RESEARCH PLAN')+'<div class="card research-plan-paper"><div class="research-plan-meta">'+pill(M.researchPlan.status)+'<span>Версия 1.0</span><span>Утверждён 06.11.2026</span><span>18 решений</span></div><article class="document-reader">'+M.markdown(M.researchPlan.body)+'</article><div class="info-banner research-save-note">'+icon('info')+(cloud?'План показан из утверждённого шаблона. Сохранение сначала сверит облачную ревизию, проверит дубликаты и сделает локальную резервную копию.':'План доступен для чтения. Подключи облачное рабочее пространство, чтобы сохранить его в документах и редактировать штатным редактором.')+'</div></div>';
}
function researchInterviewsView(){
  const backLink='<a class="text-link back-link" href="'+uri(route.id?'researchInterviews':'researchHub')+'">'+icon('back')+(route.id?'К списку интервью':'К разделу «Исследования»')+'</a>';
  if(interviewLoading)return backLink+heading('Глубинные интервью','Загружаем обезличенные исследовательские материалы из закрытого хранилища.','','PORTFOLIO / RESEARCH')+'<div class="card loading"><span class="spinner"></span>Загрузка интервью…</div>';
  if(interviewError||!interviewStore){
    const action=!server&&!cloud?button('Подключить облако','sync-connect','primary'):button('Импортировать набор','research-import','primary')+button('Повторить','research-retry');
    return backLink+heading('Глубинные интервью','Первичные ответы хранятся в отдельном закрытом контуре.',action,'PORTFOLIO / RESEARCH')+'<div class="card interview-state">'+icon('lock')+'<h2>Первичные ответы не загружены в эту сессию</h2><p>'+esc(interviewError||'Закрытое хранилище сейчас не подключено.')+'</p><div class="interview-summary"><div><strong>8</strong><span>сессий в подтверждённом наборе</span></div><div><strong>7 + 1</strong><span>R01–R07 и SELF01 отдельно</span></div><div><strong>120</strong><span>вопросов в руководстве</span></div><div><strong>960</strong><span>ячеек «вопрос–ответ», не наблюдений</span></div></div><a class="button quiet" href="'+uri('researchAnalysis')+'">Перейти к доступному анализу '+icon('arrow')+'</a></div>';
  }
  const interviews=interviewStore.interviews||[],guide=interviewStore.guide;
  if(route.id){
    const interview=interviews.find((item,index)=>item.respondentId===route.id||(index===7&&route.id==='SELF01'));
    if(!interview)return backLink+heading('Интервью не найдено','Проверь идентификатор респондента.')+'<div class="card">'+empty('В закрытом наборе нет интервью '+route.id+'.')+'</div>';
    const position=interviews.indexOf(interview),answers=new Map(interview.answers.map(answer=>[answer.questionId,answer.answer]));
    const blocks=guide.blocks.map((block,index)=>'<details class="card interview-block" '+(index===0?'open':'')+'><summary><span class="interview-block-number">'+String(block.number).padStart(2,'0')+'</span><span><strong>'+esc(block.title)+'</strong><small>10 вопросов и ответов</small></span>'+icon('arrow')+'</summary><div class="interview-answers">'+block.questionIds.map(id=>{const question=guide.questions.find(item=>item.id===id);return '<article class="interview-answer"><div class="interview-question"><span>'+esc(id)+'</span><h3>'+esc(question?.text||'Вопрос недоступен')+'</h3></div><p>'+esc(answers.get(id)||'Ответ отсутствует')+'</p></article>'}).join('')+'</div></details>').join('');
    const respondentRoute=index=>index===7?'SELF01':interviews[index].respondentId,respondentName=index=>index===7?'SELF01':interviews[index].respondentId;
    const navigation='<div class="interview-navigation">'+(position>0?'<a class="button quiet" href="'+uri('researchInterviews',respondentRoute(position-1))+'">'+icon('back')+esc(respondentName(position-1))+'</a>':'<span></span>')+'<span>'+(position+1)+' из '+interviews.length+'</span>'+(position<interviews.length-1?'<a class="button quiet" href="'+uri('researchInterviews',respondentRoute(position+1))+'">'+esc(respondentName(position+1))+icon('arrow')+'</a>':'<span></span>')+'</div>';
    const respondentLabel=position===7?'SELF01':interview.respondentId;
    return backLink+heading(position===7?'Самооценка SELF01':'Респондент '+respondentLabel,position===7?'Отдельная самооценка исследователя/команды; не независимый респондент. 120 ответов · 12 тематических блоков.':'120 сохранённых ответов · 12 тематических блоков. R01 — внешний сравнительный участник. Персональные данные не отображаются.','','PORTFOLIO / DEPTH INTERVIEW')+'<div class="interview-integrity"><span>'+pill('Проверено')+'</span><span>120 / 120 ответов</span><span>0 пропусков</span><span>Ревизия '+interviewRevision+'</span></div><div class="interview-blocks">'+blocks+'</div>'+navigation;
  }
  const answerCount=interviews.reduce((total,item)=>total+(item.answers?.length||0),0);
  return backLink+heading('Глубинные интервью','Обезличенные ответы хранятся отдельно от гипотез, требований и решений.','','PORTFOLIO / RESEARCH')+'<div class="interview-summary"><div><strong>'+interviews.length+'</strong><span>сессий · 7 независимых + SELF01</span></div><div><strong>'+guide.blocks.length+'</strong><span>тематических блоков</span></div><div><strong>'+answerCount+'</strong><span>ячеек «вопрос–ответ», не наблюдений</span></div></div><div class="interview-grid">'+interviews.map((item,index)=>{const self=index===7,label=self?'SELF01':item.respondentId;return '<a class="card interview-card '+(self?'self-interview':'')+'" href="'+uri('researchInterviews',label)+'"><span class="interview-avatar">'+esc(label)+'</span><span class="eyebrow">'+(self?'САМООЦЕНКА · ОТДЕЛЬНО':'НЕЗАВИСИМЫЙ УЧАСТНИК')+'</span><h2>'+(self?'Самооценка SELF01':'Интервью '+esc(label))+'</h2><p>12 блоков · '+item.answers.length+' ответов · без персональных данных</p><span class="research-tile-meta">Открыть материалы '+icon('arrow')+'</span></a>'}).join('')+'</div><p class="research-footnote">R01 — внешний сравнительный участник. SELF01 не входит в число независимых респондентов. Источник первичных ответов закрыт; доступ регулируется отдельным ключом.</p>';
}
function researchSubsectionView(kind){
  if(kind==='researchAnalysis'){
    const rows=alive('documents').filter(d=>d.category==='Результаты и аналитика');
    return '<a class="text-link back-link" href="'+uri('researchHub')+'">'+icon('back')+'К разделу «Исследования»</a>'+heading('Результаты и аналитика','Итоговые отчёты и аналитические материалы. Данные опросов и выводы не добавляются автоматически в требования.',button('+ Новый материал','new-analysis','primary'))+'<div class="card list-card">'+(rows.length?rows.map(r=>resourceRow('documents',r,pill(r.status))).join(''):empty('Здесь появятся аналитические материалы после того, как их добавят.'))+'</div>';
  }
  const format='Количественный опрос',title='Количественные опросы',audience=getParam('audience');
  const audiences=['Студенты','Преподаватели','Внешняя сравнительная группа'];
  const rows=alive('research').filter(r=>r.format===format&&(!audience||r.audience===audience));
  return '<a class="text-link back-link" href="'+uri('researchHub')+'">'+icon('back')+'К разделу «Исследования»</a>'+heading(title,'Анкеты и результаты количественных опросов студентов и преподавателей.',button('+ Добавить запись','new-research','primary','data-format="'+format+'"'))+'<div class="chips research-audiences"><button class="chip '+(!audience?'active':'')+'" data-action="audience" data-audience="">Все группы</button>'+audiences.map(a=>'<button class="chip '+(audience===a?'active':'')+'" data-action="audience" data-audience="'+esc(a)+'">'+esc(a)+'</button>').join('')+'</div><div class="card list-card">'+(rows.length?rows.map(r=>resourceRow('research',r,pill(r.status))).join(''):empty('Пока нет записей. Исследовательские данные не создаются автоматически.'))+'</div><p class="research-footnote">Для разделения материалов укажи формат и аудиторию в полях записи. Не добавляй персональные сведения респондентов.</p>';
}

function bindQualitativeTypography(root){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
    if(node.parentElement?.closest('svg,script,style'))return;
    node.nodeValue=node.nodeValue.replace(/(^|[^\p{L}])(в|во|на|по|с|со|к|ко|у|о|об|от|до|за|из|для|при|и|а|но) +(?=[\p{L}\p{N}«])/giu,'$1$2\u00a0');
  });
}
function qualitativeAnalysisView(){
  const data=qualitativeAnalysis;
  if(!data)return '<a class="text-link back-link" href="'+uri('researchHub')+'">'+icon('back')+'К разделу «Интервью»</a>'+heading('Анализ глубинных интервью','Аналитический набор не загрузился.')+empty('Повтори загрузку страницы. Исходные данные не изменены.');
  const paragraphs=items=>(items||[]).map(text=>'<p>'+esc(text)+'</p>').join('');
  const list=items=>'<ul>'+items.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ul>';
  const evidence=p=>(p.quotes||[]).map(q=>'<figure class="qa-quote"><figcaption>'+esc(q.meta)+'</figcaption><blockquote>'+esc(q.text)+'</blockquote></figure>').join('')+(p.evidenceNotes?.length?'<div class="qa-evidence-notes">'+paragraphs(p.evidenceNotes)+'</div>':'');
  const patterns=data.patterns.map(p=>{
    const panel='qa-panel-'+p.id.toLowerCase();
    const markup='<details class="qa-pattern" name="qa-patterns"><summary aria-expanded="false" aria-controls="'+panel+'"><svg class="qa-folder-shape" viewBox="0 0 400 380" preserveAspectRatio="none" aria-hidden="true"><defs><path id="'+panel+'-shape" d="M 0,106 Q 0,76 31,76 H 151 Q 160,76 168,85 L 188,106 Q 193,111 201,111 H 369 Q 400,111 400,141 V 349 Q 400,380 369,380 H 31 Q 0,380 0,349 Z"/><clipPath id="'+panel+'-clip"><use href="#'+panel+'-shape"/></clipPath><mask id="'+panel+'-outline" maskUnits="userSpaceOnUse" x="-10" y="-10" width="420" height="400"><use href="#'+panel+'-shape" fill="none" stroke="white" stroke-width="7" vector-effect="non-scaling-stroke"/><use href="#'+panel+'-shape" fill="none" stroke="black" stroke-width="5" vector-effect="non-scaling-stroke"/></mask></defs><use href="#'+panel+'-shape" fill="var(--blue)"/><use href="#'+panel+'-shape" fill="white" opacity=".2" clip-path="url(#'+panel+'-clip)" mask="url(#'+panel+'-outline)"/></svg><span class="qa-pattern-id">'+esc(p.id)+'</span><b>'+esc(p.title)+'</b><span class="qa-folder-meta"><span>'+esc(p.evidenceType)+'</span><span>'+esc(p.strength)+'</span></span></summary><article hidden class="qa-pattern-panel" id="'+panel+'"><header><span class="qa-pattern-id">'+esc(p.id)+'</span><h3>'+esc(p.title)+'</h3><p>'+esc(p.lead)+'</p></header><section><h4>Суть паттерна</h4>'+paragraphs(p.essence)+'</section>'+(p.formation?'<section><h4>Как сформировался паттерн</h4><p>'+esc(p.formation)+'</p></section>':'')+'<section><h4>Evidence</h4>'+evidence(p)+'</section>'+(p.synthesis?'<section><h4>Cross-interview synthesis</h4><p>'+esc(p.synthesis)+'</p></section>':'')+'<div class="qa-evidence-meta"><div><span>Evidence type</span><strong>'+esc(p.evidenceType)+'</strong></div><div><span>Evidence strength</span><strong>'+esc(p.strength)+'</strong></div></div><section><h4>Hypothesis impact</h4><p>'+esc(p.hypothesis)+'</p></section><section><h4>Product impact</h4>'+list(p.product)+'</section><section><h4>Граница интерпретации</h4><p>'+esc(p.boundary)+'</p></section><section class="qa-conclusion"><h4>Итог</h4><p>'+esc(p.conclusion)+'</p></section></article></details>';
    return markup;
  });
  const pipeline=['Ответы респондентов','Исследовательские выводы','Кросс-интервью паттерны','Гипотезы','Продуктовые решения'];
  return '<div class="qa-page"><a class="text-link back-link" href="'+uri('researchHub')+'">'+icon('back')+'К разделу «Интервью»</a>'+heading('Анализ глубинных интервью','','','PORTFOLIO / RESEARCH')+
    '<section class="qa-intro"><h2>Анализ качественных интервью</h2><p>Анализ основан на 8 глубинных интервью и 120 вопросах: R01–R07 — независимые респонденты, SELF01 — отдельное self-interview автора исследования. Ответы анализировались по отдельным вопросам и тематическим блокам, после чего повторяющиеся наблюдения, проблемы, модели поведения и продуктовые ограничения были объединены в кросс-интервью паттерны CP-01–CP-14.</p><p>R01–R07 используются как основная независимая качественная выборка. SELF01 рассматривается отдельно и не используется для искусственного увеличения частоты наблюдений. При анализе различаются фактический опыт респондентов, предполагаемое будущее поведение и реакция на предложенную концепцию Portfolio.</p><p>Качественная выборка преимущественно описывает опыт студентов дизайн-направлений IThub СПб. Она позволяет глубоко исследовать эту часть основной аудитории, но не является равномерным представлением всех специальностей и курсов колледжа.</p></section>'+
    '<section class="qa-section"><div class="qa-section-copy"><h2>Кросс-интервью паттерны CP-01–CP-14</h2><p>14 паттернов объединяют повторяющиеся проблемы, модели поведения, ценности и продуктовые ограничения, выявленные в разных блоках интервью. Каждый паттерн связан с исходными ответами и показывает его влияние на гипотезы, продуктовые решения и требования Portfolio.</p></div><div class="qa-pipeline" aria-label="Research pipeline">'+pipeline.map((item,index)=>'<span>'+esc(item)+(index<pipeline.length-1?'<i aria-hidden="true">→</i>':'')+'</span>').join('')+'</div><div class="qa-patterns">'+patterns.join('')+'</div></section>'+
    '<section class="qa-risk"><span class="eyebrow">PRODUCT RISK</span><h2>Ключевой риск после интервью</h2><h3>'+esc(data.risk.title)+'</h3>'+paragraphs(data.risk.text)+'<div class="qa-risk-chain" aria-label="Launch-risk model">'+data.risk.chain.map((item,index)=>'<span>'+esc(item)+(index<data.risk.chain.length-1?'<i aria-hidden="true">→</i>':'')+'</span>').join('')+'</div><small>Launch-risk model, а не доказанная причинная модель.</small></section></div>';
}

async function saveResearchPlan(){
  if(!cloud){toast('Сначала подключи облачное рабочее пространство');return}
  if(dirty||saving||blocked){toast('Дождись сохранения или разреши конфликт в разделе синхронизации');return}
  try{
    const remote=await cloudRequest('/api/workspace');
    if(remote.revision!==revision||(remote.state&&JSON.stringify(remote.state)!==JSON.stringify(state))){
      localStorage.setItem(KEY+'.before-research-plan',JSON.stringify({revision,savedAt:new Date().toISOString(),state}));
      if(remote.state){state=M.validate(remote.state);revision=remote.revision;dirty=false;blocked=false;backup();render();}
      toast('Облачная копия обновилась. Я перечитала её без записи — проверь состояние и нажми сохранение ещё раз.');return;
    }
    if(!remote.state){toast('Облачное рабочее пространство ещё не создано. Сначала подключи и сохрани его.');return}
    const duplicate=state.documents.find(d=>!d.archived&&(d.id===M.researchPlan.id||d.title.trim().toLocaleLowerCase('ru-RU')===M.researchPlan.title.toLocaleLowerCase('ru-RU')));
    if(duplicate){go('documents',duplicate.id);toast('План уже есть в документах; дубликат не создан');return}
    try{localStorage.setItem(KEY+'.before-research-plan',JSON.stringify({revision:remote.revision,savedAt:new Date().toISOString(),state:remote.state}));}catch{toast('Не удалось создать резервную копию. План не сохранён.');return}
    const doc=structuredClone(M.researchPlan),scope=state.documents.find(d=>d.id==='source-01-discovery--project-scope'||d.source==='01-discovery/project-scope.md');
    if(scope)doc.links=[M.reference('documents',scope)];
    state.documents.unshift(doc);changed();clearTimeout(saveTimer);await flush();
    if(blocked||dirty){toast('Конфликт ревизий: запись остановлена. Обнови копию и повтори действие.');return}
    go('documents',doc.id);toast('Research Plan сохранён в облачных документах');
  }catch(error){toast('План не сохранён: '+error.message)}
}
function newAnalysisDocument(){const now=new Date().toISOString(),row={id:crypto.randomUUID(),title:'Новый аналитический материал',category:'Результаты и аналитика',status:'Черновик',source:'',body:'# Новый аналитический материал\n\n## Вопрос исследования\n\n## Данные и источники\n\n## Анализ\n\n## Ограничения\n\n## Выводы для обсуждения\n',links:[],archived:false,updatedAt:now};state.documents.unshift(row);changed();go('documents',row.id);}
function newResearchRecord(format){const now=new Date().toISOString(),row={id:crypto.randomUUID(),title:format==='Глубинное интервью'?'Новое глубинное интервью':'Новый количественный опрос',status:'Планируем',format,audience:getParam('audience'),question:'',method:'',findings:'',source:'',conclusion:'',next:'',links:[],archived:false,updatedAt:now};state.research.unshift(row);changed();go('research',row.id);}

function resourceRow(kind,row,extra=''){return '<div class="resource-row"><a href="'+recordHref(kind,row)+'"><span class="icon-tile tone-'+colors[M.kinds.indexOf(kind)%4]+'">'+icon(M.config[kind].icon)+'</span><span class="resource-text"><strong>'+esc(M.recordTitle(kind,row))+'</strong><small>'+esc(row.category||M.config[kind].singular)+' · '+dateLabel(row.updatedAt)+'</small></span></a>'+extra+'<span class="arrow-muted">'+icon('arrow')+'</span></div>'}
function homeView(){
  const scope=alive('documents').find(d=>d.source==='01-discovery/project-scope.md');
  const docs=[...alive('documents')].sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
  if(scope){docs.splice(docs.indexOf(scope),1);docs.unshift(scope)}
  const tasks=alive('tasks'),done=tasks.filter(t=>t.status==='Готово').length;
  return heading('Твоё пространство Discovery','От первого вопроса до обоснованного продуктового решения.',button('Основной отчёт '+icon('arrow'),'report',''), 'PORTFOLIO / WORKSPACE')+
  '<section class="welcome"><div class="welcome-content"><div class="eyebrow">МЕСТО ДЛЯ МЫСЛЕЙ, СВЯЗЕЙ И РЕШЕНИЙ</div><h1>Большие продукты<br>начинаются с вопросов.</h1><p>Собирай знания, проверяй гипотезы и постепенно превращай идеи в понятную модель portfolio.</p><a class="button primary" href="'+(scope?recordHref('documents',scope):uri('documents'))+'">Продолжить Project Scope '+icon('arrow')+'</a></div><div class="welcome-art" aria-hidden="true"><div class="art-sheet"><div class="art-line"></div><div class="art-line short"></div><div class="art-line"></div></div><div class="art-circle">✳</div><div class="art-star">✦</div></div></section>'+
  '<div class="metrics">'+[['documents','Документов','purple'],['hypotheses','Гипотез','peach'],['entities','Сущностей','mint'],['matrix','Требований','blue']].map(([kind,label,color])=>'<a class="card metric" href="'+uri(kind)+'"><div class="icon-tile tone-'+color+'">'+icon(M.config[kind].icon)+'</div><div><strong>'+alive(kind).length+'</strong><span>'+label+'</span></div></a>').join('')+'</div>'+
  '<div class="home-grid"><section><div class="section-heading"><div><h2>Продолжить работу</h2><p>Документы и материалы проекта</p></div><a class="text-link" href="'+uri('documents')+'">Все документы '+icon('arrow')+'</a></div><div class="card list-card">'+docs.slice(0,4).map(d=>resourceRow('documents',d,pill(d.status))).join('')+'</div><div class="section-heading section"><div><h2>Следующие шаги</h2><p>'+done+' из '+tasks.length+' задач завершено</p></div><a class="text-link" href="'+uri('tasks')+'">План Discovery '+icon('arrow')+'</a></div><div class="card compact-card">'+(tasks.filter(t=>t.status!=='Готово').slice(0,3).map(t=>'<div class="resource-row"><button class="check-circle" data-action="task-done" data-id="'+esc(t.id)+'" aria-label="Завершить задачу '+esc(t.title)+'">'+icon('check')+'</button><a href="'+recordHref('tasks',t)+'"><span class="resource-text"><strong>'+esc(t.title)+'</strong><small>'+esc(t.owner||'Ответственный не указан')+'</small></span></a></div>').join('')||empty('Все запланированные задачи завершены.'))+'</div></section><section><div class="section-heading"><div><h2>В фокусе</h2><p>Предположения, которые стоит проверить</p></div></div><div class="card compact-card">'+(alive('hypotheses').filter(h=>!['Подтверждена','Опровергнута'].includes(h.status)).slice(0,3).map((h,i)=>'<article class="priority-card"><span class="mini-number">HYP / '+String(i+1).padStart(2,'0')+'</span>'+pill(h.status)+'<a href="'+recordHref('hypotheses',h)+'">'+esc(h.title)+'</a><p>'+esc(h.assumption.slice(0,110))+'</p></article>').join('')||empty('Добавь гипотезу, которую хочешь проверить.'))+'<p class="home-note">Статусы меняются вручную, когда появились основания для решения.</p></div><div class="card compact-card section"><div class="section-heading"><h2>Собери итоговый отчёт</h2>'+icon('report')+'</div><p class="home-note">Нажми «В основной отчёт» внутри материала. Его актуальная версия попадёт в общую отчётность.</p><a class="text-link" href="'+uri('report')+'">Открыть отчёт '+icon('arrow')+'</a></div></section></div>';
}

function searchToolbar(rows,kind){const q=getParam('q'),status=getParam('status');const statuses=[...new Set(alive(kind).map(r=>r.status||r.N).filter(Boolean))];return '<div class="toolbar"><label class="filter-search">'+icon('search')+'<input aria-label="Поиск в разделе" data-filter="q" value="'+esc(q)+'" placeholder="Найти в разделе…"></label><select class="filter-select" data-filter="status" aria-label="Статус"><option value="">Все статусы</option>'+statuses.map(s=>'<option '+(s===status?'selected':'')+'>'+esc(s)+'</option>').join('')+'</select><span class="result-count">Материалов: '+rows.length+'</span></div>'}
function filtered(kind){const q=getParam('q').toLowerCase(),status=getParam('status');return alive(kind).filter(r=>(!q||Object.values(r).join(' ').toLowerCase().includes(q))&&(!status||(r.status||r.N)===status))}
function card(kind,row,index){return '<a class="card '+(kind==='entities'?'entity-card':'document-card')+'" href="'+recordHref(kind,row)+'"><div class="document-cover tone-'+colors[index%4]+'">'+icon(M.config[kind].icon)+'<div class="cover-lines" aria-hidden="true"><i></i><i></i><i></i></div></div><div class="document-info"><h3>'+esc(M.recordTitle(kind,row))+'</h3><p>'+esc(textPreview(row))+'</p><div class="card-meta">'+pill(row.status)+'<span>'+esc(kind==='entities'?(row.blocks||[]).length+' блоков':row.category||dateLabel(row.updatedAt))+'</span></div></div></a>'}
function collectionView(kind){
  const cfg=M.config[kind];if(!cfg)return homeView();let rows=filtered(kind),category=getParam('category');
  const intro=heading(cfg.title,cfg.desc,button('+ '+cfg.singular,'new','primary','data-kind="'+kind+'"'));
  let chips='';if(kind==='documents'){const cats=[...new Set([...M.categories,...alive(kind).map(d=>d.category)])];chips='<div class="chips">'+['',...cats].map(c=>'<button class="chip '+(c===category?'active':'')+'" data-action="category" data-category="'+esc(c)+'">'+esc(c||'Все документы')+'</button>').join('')+'</div>';if(category)rows=rows.filter(r=>r.category===category)}
  const tools=searchToolbar(rows,kind);if(!rows.length)return intro+chips+tools+'<div class="card">'+empty('Здесь пока нет материалов. Создай первый или измени фильтры.',button('+ '+cfg.singular,'new','primary','data-kind="'+kind+'"'))+'</div>';
  if(kind==='hypotheses'||kind==='tasks'){
    const groups=kind==='hypotheses'?M.config.hypotheses.statuses.map(status=>[status,[status]]):[['Запланировано',['Запланировано']],['В работе',['В работе']],['Завершено / отложено',['Готово','Отложено']]];
    return intro+tools+'<div class="board">'+groups.map(([name,statuses])=>{const items=rows.filter(r=>statuses.includes(r.status));return '<section class="board-column"><div class="board-heading">'+name+'<span>'+items.length+'</span></div>'+items.map(r=>'<a class="card idea-card" href="'+recordHref(kind,r)+'">'+pill(r.status)+'<h3>'+esc(r.title)+'</h3><p>'+esc(textPreview(r))+'</p><div class="card-meta"><span>'+esc(kind==='tasks'?(r.owner||'Без ответственного'):linksFor(r).length+' связей')+'</span><span>'+esc(r.due||dateLabel(r.updatedAt))+'</span></div></a>').join('')+(items.length?'':'<div class="empty">Пока пусто</div>')+'</section>'}).join('')+'</div>';
  }
  if(['research','decisions'].includes(kind))return intro+tools+'<div class="card list-card">'+rows.map(r=>resourceRow(kind,r,pill(r.status))).join('')+'</div>';
  return intro+chips+tools+(kind==='entities'?'<div class="info-banner">'+icon('info')+'Границы сущностей пока предложены для обсуждения. Открой карточку, чтобы уточнить поля, состояния и связанные требования.</div>':'')+'<div class="card-grid">'+rows.map((r,i)=>card(kind,r,i)).join('')+'<button class="card-add" data-action="new" data-kind="'+kind+'"><span>+</span>Добавить '+(kind==='documents'?'документ':'сущность')+'</button></div>';
}

function field(key,label,type,value){const id='field-'+key;return '<div class="field '+(['textarea','lines'].includes(type)?'full':'')+'"><label for="'+id+'">'+esc(label)+'</label>'+(['textarea','lines'].includes(type)?'<textarea id="'+id+'" data-field="'+key+'" '+(type==='lines'?'data-lines="true"':'')+'>'+esc(Array.isArray(value)?value.join('\n'):value)+'</textarea>':'<input id="'+id+'" type="'+(type==='date'?'date':'text')+'" data-field="'+key+'" value="'+esc(value)+'">')+'</div>'}
function selection(key,values,value,label){return '<select data-field="'+key+'" aria-label="'+label+'">'+[...new Set([value,...values].filter(Boolean))].map(v=>'<option '+(v===value?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select>'}
function reportButton(ref){const inReport=state.reportItems.includes(ref);return button(icon(inReport?'check':'plus')+(inReport?'В основном отчёте':'В основной отчёт'),'toggle-report',inReport?'selected':'','data-ref="'+esc(ref)+'"')}
function relatedPanel(kind,row){
  const ref=M.reference(kind,row),links=linksFor(row);let options=[];for(const k of M.kinds)for(const r of alive(k)){const other=M.reference(k,r);if(other!==ref&&!links.includes(other))options.push('<option value="'+esc(other)+'">'+esc(titleFor(k)+' / '+M.recordTitle(k,r).slice(0,85))+'</option>')}
  const incoming=[];for(const k of M.kinds)for(const r of alive(k))if(linksFor(r).includes(ref))incoming.push({kind:k,row:r});
  return '<div class="aside-section"><h3>Связанные материалы</h3>'+links.map(r=>{const x=lookup(r);return '<div class="related-item">'+(x?'<a class="related-link" href="'+recordHref(x.kind,x.row)+'">'+esc(titleRef(r))+'</a>':'<span class="related-link">Недоступная связь: '+esc(r)+'</span>')+'<button class="text-link" data-action="unlink" data-ref="'+esc(r)+'">Убрать связь</button></div>'}).join('')+'<select class="related-select" id="addLink" aria-label="Добавить связь"><option value="">+ Связать с материалом</option>'+options.join('')+'</select></div>'+(incoming.length?'<div class="aside-section"><h3>Ссылаются на этот материал</h3>'+incoming.map(x=>'<a class="related-link" href="'+recordHref(x.kind,x.row)+'">'+esc(M.recordTitle(x.kind,x.row))+'</a>').join('')+'</div>':'');
}
function outline(body){return '<div class="aside-section"><h3>Содержание документа</h3><div class="outline">'+(String(body).split('\n').map((line,i)=>{const m=line.match(/^(#{1,3})\s+(.+)$/);return m?'<button class="level-'+m[1].length+'" data-action="outline" data-line="'+i+'">'+esc(m[2])+'</button>':''}).join('')||'<p>Добавь заголовки с помощью # или ##.</p>')+'</div></div>'}
function detailView(kind,row){
  const ref=M.reference(kind,row),cfg=M.config[kind];
  let header='<button class="text-link back-link" data-action="back">'+icon('back')+'Назад</button>'+heading(kind==='matrix'?row.A:cfg.singular,'Изменения сохраняются автоматически.',reportButton(ref)+button(icon('download'),'download-record','','aria-label="Скачать материал"')+button(icon('archive')+(row.archived?'Восстановить':'В архив'),'archive','','data-ref="'+esc(ref)+'"'),'DISCOVERY / '+titleFor(kind));
  if(row.archived)header+='<div class="archive-banner">Материал в архиве. Его можно восстановить; в основной отчёт он пока не включается.</div>';
  let editor='<textarea class="document-title" rows="2" data-field="'+(kind==='matrix'?'C':'title')+'" aria-label="Название" placeholder="Название материала">'+esc(M.recordTitle(kind,row))+'</textarea>';
  if(kind==='documents'){
    editor+='<div class="editor-meta">'+selection('category',M.categories,row.category,'Раздел документа')+selection('status',cfg.statuses,row.status,'Статус документа')+'</div><div class="editor-toolbar">'+(preview?'':[['heading','H₂','Заголовок'],['bold','B','Жирный текст'],['list','≡','Список'],['quote','❞','Цитата']].map(([act,text,title])=>'<button data-action="format" data-format="'+act+'" title="'+title+'" aria-label="'+title+'">'+text+'</button>').join(''))+'<span class="separator"></span><button class="mode" data-action="preview">'+(preview?'Редактировать':'Предпросмотр')+'</button></div>'+(preview?'<article class="document-reader">'+M.markdown(row.body)+'</article>':'<textarea class="markdown-editor" id="documentBody" data-field="body" aria-label="Текст документа" placeholder="Начни писать… Заголовок: ##, список: -, выделение: **текст**">'+esc(row.body)+'</textarea>')+'<div class="word-count" id="wordCount">'+String(row.body||'').trim().split(/\s+/).filter(Boolean).length+' слов · Markdown</div>';
  }else{
    if(kind!=='matrix')editor+='<div class="editor-meta">'+selection('status',cfg.statuses,row.status,'Статус')+'</div>';
    editor+='<div class="form-grid">'+cfg.fields.map(([key,label,type])=>field(key,label,type,row[key]||'')).join('')+'</div>';
  }
  let aside=kind==='documents'?outline(row.body):'';
  if(kind==='entities'){const rows=alive('matrix').filter(r=>(row.blocks||[]).includes(r.B));aside+='<div class="aside-section"><h3>Связанные требования · '+rows.length+'</h3>'+[...new Set(row.blocks||[])].map(block=>'<a class="related-link" href="'+uri('matrix','',{block,entity:row.id})+'">'+esc(block)+' '+icon('arrow')+'</a>').join('')+'</div>'}
  aside+=relatedPanel(kind,row)+'<div class="aside-section"><h3>В основной отчёт</h3><p>Выбранные материалы собираются в один документ. Последующие правки обновляют отчёт автоматически.</p><a class="related-link" href="'+uri('report')+'">Открыть отчёт '+icon('arrow')+'</a></div>';
  return header+'<div class="detail-layout"><section class="card editor-paper">'+editor+(row.source?'<div class="source-info">Источник: '+esc(row.source)+'<br>Здесь редактируется рабочая копия документа.</div>':'')+'</section><aside class="detail-aside">'+aside+'</aside></div>';
}

function matrixView(){let rows=filtered('matrix'),block=getParam('block');if(block)rows=rows.filter(r=>r.B===block);const entity=state.entities.find(e=>e.id===getParam('entity'));
  return (entity?'<a class="text-link back-link" href="'+recordHref('entities',entity)+'">'+icon('back')+'К сущности «'+esc(entity.title)+'»</a>':'')+heading('Матрица требований',M.config.matrix.desc,button('+ Требование','new','primary','data-kind="matrix"'))+searchToolbar(rows,'matrix')+'<div class="toolbar"><select class="filter-select" data-filter="block" aria-label="Блок матрицы"><option value="">Все блоки</option>'+[...new Set(alive('matrix').map(r=>r.B))].map(b=>'<option '+(block===b?'selected':'')+'>'+esc(b)+'</option>').join('')+'</select>'+(block?button('Сбросить фильтр','clear-filters','quiet small'):'')+'</div><div class="card table-wrap"><table class="matrix-table requirements-table"><thead><tr><th>ID</th><th>Элемент / функция</th><th>Блок</th><th>Статус решения</th><th>Открытые вопросы</th><th></th></tr></thead><tbody>'+rows.map(r=>'<tr><td><a class="row-id" href="'+recordHref('matrix',r)+'">'+esc(r.A)+'</a></td><td><a class="row-title" href="'+recordHref('matrix',r)+'">'+esc(r.C)+'</a><small>'+esc(r.D)+'</small></td><td>'+esc(r.B)+'</td><td>'+pill(r.N)+'</td><td class="question-cell">'+esc((r.P||'—').slice(0,95))+'</td><td><a class="icon-button" href="'+recordHref('matrix',r)+'" aria-label="Открыть '+esc(r.A)+'">'+icon('arrow')+'</a></td></tr>').join('')+'</tbody></table>'+(rows.length?'':empty('Требований по этим фильтрам нет.'))+'<div class="table-footer"><span>Показано '+rows.length+' из '+alive('matrix').length+'</span><span>Нажми на название, чтобы открыть все поля</span></div></div>';
}
function crudView(){const role=getParam('role','Student'),scope=getParam('owner','any'),objectState=getParam('state','any'),mode=getParam('mode','entities'),q=getParam('q').toLowerCase();const kind=mode==='matrix'?'matrix':'entities',objects=alive(kind).filter(r=>M.recordTitle(kind,r).toLowerCase().includes(q)),roleLabels={Student:'Студент',Teacher:'Преподаватель',Moderator:'Модератор',Administrator:'Администратор',Guest:'Гость'};
  return heading('CRUD по ролям','Проверяй права с учётом владельца и состояния объекта. Неопределённость отмечается отдельно от запрета.')+'<div class="roles">'+M.roles.map(r=>'<button class="role-button '+(r===role?'active':'')+'" data-action="role" data-role="'+r+'">'+esc(roleLabels[r]||r)+'</button>').join('')+'</div><div class="toolbar"><select class="filter-select" data-filter="mode" aria-label="Тип объектов"><option value="entities" '+(mode==='entities'?'selected':'')+'>Сущности</option><option value="matrix" '+(mode==='matrix'?'selected':'')+'>Элементы матрицы</option></select><select class="filter-select" data-filter="owner" aria-label="Владелец объекта">'+[['any','Любой владелец'],['own','Свой объект'],['other','Чужой объект']].map(([v,l])=>'<option value="'+v+'" '+(scope===v?'selected':'')+'>'+l+'</option>').join('')+'</select><select class="filter-select" data-filter="state" aria-label="Состояние объекта">'+[['any','Любое состояние'],['draft','Черновик'],['published','Опубликован'],['moderation','На модерации']].map(([v,l])=>'<option value="'+v+'" '+(objectState===v?'selected':'')+'>'+l+'</option>').join('')+'</select></div><div class="info-banner">'+icon('info')+'Каждая комбинация роли, владельца и состояния хранится отдельно. Разрешения здесь — спецификация для обсуждения.</div><div class="card table-wrap"><table class="matrix-table crud-table"><thead><tr><th>Объект</th><th>C · Создать</th><th>R · Читать</th><th>U · Изменить</th><th>D · Удалить</th><th>Условия</th></tr></thead><tbody>'+objects.map(row=>{const base=JSON.stringify([kind,M.recordId(kind,row),role,scope,objectState]);return '<tr><td><a href="'+recordHref(kind,row)+'" class="row-title">'+esc(M.recordTitle(kind,row))+'</a></td>'+['C','R','U','D'].map(action=>{let value=state.crud[base+':'+action];if(value===undefined&&kind==='matrix'&&scope==='any'&&objectState==='any')value=state.crud[row.C+'::'+role+'::'+action];if(value===true)value='yes';if(value===false)value='no';return '<td><select class="crud-select" data-crud="'+esc(base+':'+action)+'" aria-label="'+action+' — '+esc(M.recordTitle(kind,row))+'">'+[['','Не решено'],['yes','Разрешено'],['no','Запрещено'],['conditional','С условиями']].map(([v,l])=>'<option value="'+v+'" '+((value||'')===v?'selected':'')+'>'+l+'</option>').join('')+'</select></td>'}).join('')+'<td><input class="crud-note" aria-label="Условия для '+esc(M.recordTitle(kind,row))+'" data-crud="'+esc(base+':note')+'" value="'+esc(state.crud[base+':note']||'')+'" placeholder="Уточнить условие…"></td></tr>'}).join('')+'</tbody></table></div>';
}

function reportView(){const items=state.reportItems.map(ref=>lookup(ref)).filter(x=>x&&!x.row.archived);return heading('Основной отчёт','Выбранные материалы и их актуальные версии — для итогового обсуждения Discovery.',button(icon('download')+' Скачать Markdown','download-report','primary'))+'<div class="report-cover"><div class="eyebrow">DISCOVERY / REPORT</div><h2>От исследования к решению</h2><p>Материалов в отчёте: '+items.length+'. Добавляй документы и записи кнопкой «В основной отчёт». Статус материала сохраняется — гипотеза не становится подтверждённым решением автоматически.</p></div>'+(items.length?'<div class="card list-card">'+items.map(({kind,row})=>resourceRow(kind,row,button('Убрать','toggle-report','quiet small','data-ref="'+esc(M.reference(kind,row))+'"'))).join('')+'</div>':'<div class="card">'+empty('Начни с Project Scope или одного принятого решения.',button('Открыть документы','documents','primary'))+'</div>')+'<p class="home-note">'+(server?'Отчёт автоматически записывается в reports/discovery-report.md при сохранении рабочего пространства.':'В режиме без сервера скачай отчёт кнопкой выше.')+'</p>'}
function archiveView(){const rows=M.kinds.flatMap(kind=>state[kind].filter(row=>row.archived).map(row=>({kind,row})));return heading('Архив','Материалы остаются доступными и могут быть восстановлены.')+'<div class="card list-card">'+(rows.length?rows.map(({kind,row})=>resourceRow(kind,row,button('Восстановить','archive','small','data-ref="'+esc(M.reference(kind,row))+'"'))).join(''):empty('Архив пуст.'))+'</div>'}

function syncView(){
  const pending=proposals.filter(p=>p.status==='pending');
  return heading('ChatGPT и облако','Рабочая копия между устройствами и предложения из личного Plugin Portfolio Discovery.',cloud?button('Обновить','sync-refresh','primary')+button('Отключить','sync-disconnect'):button('Подключить облако','sync-connect','primary'))+
    '<div class="card sync-panel"><div><div class="eyebrow">СОСТОЯНИЕ</div><h2>'+(cloud?'Облако подключено':'Работа в этом браузере')+'</h2><p>'+(cloud?'Изменения сохраняются в закрытом хранилище Vercel. Личный Plugin читает эту копию и присылает структурированные предложения.':'Для синхронизации между телефоном, компьютером и ChatGPT подключи закрытое облачное хранилище.')+'</p></div><div class="sync-steps"><span>01 · Обсудить с Plugin в ChatGPT</span><span>02 · Проверить входящее предложение</span><span>03 · Добавить в Discovery</span></div></div>'+
    (cloud?'<div class="section-heading section"><div><h2>Входящие из ChatGPT · '+pending.length+'</h2><p>Обсуждения не меняют подтверждённые решения автоматически.</p></div></div><div class="sync-list">'+(pending.length?pending.map(p=>'<article class="card sync-proposal"><div class="eyebrow">'+esc(p.type)+' · '+esc(dateLabel(p.createdAt))+'</div><h3>'+esc(p.title)+'</h3><p class="sync-source">Источник: '+esc(p.sourceChat)+'</p><p class="sync-body">'+esc(p.body)+'</p>'+(p.basis?'<p class="sync-basis">Основание: '+esc(p.basis)+'</p>':'')+'<div class="heading-actions">'+button('Добавить в Discovery','sync-apply','primary','data-id="'+esc(p.id)+'"')+button('Отклонить','sync-dismiss','','data-id="'+esc(p.id)+'"')+'</div></article>').join(''):empty('Новых предложений пока нет. Plugin добавит сюда только выводы, которые требуют фиксации.'))+'</div>':'<div class="info-banner">'+icon('info')+'Без подключения сайт сохраняет правки только в текущем браузере. Резервную копию можно скачать в меню слева.</div>');
}

function connectDialog(){if(['localhost','127.0.0.1'].includes(location.hostname)){toast('Подключи облако на опубликованном сайте');return}modal('Подключить облако','<p class="dialog-note">Введи ключ рабочего пространства. Он передаётся только на этот сайт для доступа к закрытой копии. Тот же ключ потребуется при подключении личного Plugin через страницу авторизации этого сайта.</p><div class="field"><label for="syncToken">Ключ синхронизации</label><input id="syncToken" type="password" autocomplete="off" placeholder="Ключ из настроек Vercel"></div><label class="sync-remember"><input id="syncRemember" type="checkbox"> Запомнить ключ в этом браузере</label><div class="dialog-footer"><button class="button" data-action="close">Отмена</button><button class="button primary" id="syncConfirm">Подключить</button></div>');$('#syncConfirm').onclick=connectCloud}
async function connectCloud(){const token=$('#syncToken').value.trim();if(!token){toast('Введи ключ синхронизации');return}const old=cloudToken;cloudToken=token;try{const remote=await cloudRequest('/api/workspace');if(remote.state){exportState();state=M.validate(remote.state);revision=remote.revision;dirty=false;blocked=false;}else{revision=0;dirty=true;blocked=false;}cloud=true;sessionStorage.setItem(SYNC_KEY,token);if($('#syncRemember').checked)localStorage.setItem(SYNC_KEY,token);$('#storageDescription').textContent='Автосохранение в закрытом облаке\nи копия в браузере';closeDialog();backup();render();if(dirty)await flush();await loadProposals();if(route.kind==='researchInterviews')await ensureInterviewData(true);if(route.kind==='researchHub')await ensureInterviewSummary(true);toast('Облако подключено')}catch(error){cloudToken=old;cloud=false;toast(error.message)}}
function disconnectCloud(){cloud=false;cloudToken='';revision=0;blocked=false;dirty=false;interviewStore=null;interviewSummary=null;interviewRevision=0;interviewError='';sessionStorage.removeItem(SYNC_KEY);localStorage.removeItem(SYNC_KEY);$('#storageDescription').textContent='Сохранение в этом браузере. Облако подключается в разделе «ChatGPT и облако».';backup();render();toast('Облако отключено; рабочая копия осталась в браузере')}
async function loadProposals(){if(!cloud)return;try{const result=await cloudRequest('/api/gpt');proposals=result.proposals||[];if(route.kind==='sync')render()}catch(error){toast(error.message)}}
async function refreshCloud(){if(!cloud)return;try{const remote=await cloudRequest('/api/workspace');if(remote.state&&remote.revision!==revision){if(dirty)exportState();state=M.validate(remote.state);revision=remote.revision;dirty=false;blocked=false;backup()}await loadProposals();render();toast('Облачная копия обновлена')}catch(error){toast(error.message)}}
function proposalRecord(p){const id='gpt-'+p.id,link=M.resolve(state,p.targetRef||'')?[p.targetRef]:[],stamp=new Date().toISOString(),source='ChatGPT Plugin · '+p.sourceChat;let kind,row;
  if(p.type==='requirement'){kind='matrix';row={A:'GPT-'+p.id.slice(0,8).toUpperCase(),B:'На уточнении',C:p.title,D:'Роли не определены',F:p.body,H:p.basis||source,N:'Предложение GPT · требует проверки',P:'Проверить основание, границы и связь с Project Scope',links:link,archived:false,updatedAt:stamp};}
  else{kind={document:'documents',hypothesis:'hypotheses',research:'research',decision:'decisions',entity:'entities',task:'tasks'}[p.type];row={id,title:p.title,status:M.config[kind].statuses[0],links:link,archived:false,updatedAt:stamp};for(const [key,,type] of M.config[kind].fields)row[key]=type==='lines'?[]:'';if(kind==='documents')Object.assign(row,{category:'Заметки',body:p.body+'\n\nИсточник: '+source+(p.basis?'\nОснование: '+p.basis:''),source});if(kind==='hypotheses')Object.assign(row,{assumption:p.body,evidence:p.basis||source});if(kind==='research')Object.assign(row,{question:p.title,findings:p.body,source:source,conclusion:p.basis});if(kind==='decisions')Object.assign(row,{description:p.body,rationale:p.basis||source});if(kind==='entities')Object.assign(row,{description:p.body,body:p.basis});if(kind==='tasks')row.description=p.body;}
  return {kind,row};
}
async function reviewProposal(id,status){const p=proposals.find(item=>item.id===id&&item.status==='pending');if(!p||!cloud)return;try{let result=null;if(status==='applied'){result=proposalRecord(p);if(!state[result.kind].some(r=>M.recordId(result.kind,r)===M.recordId(result.kind,result.row))){state[result.kind].push(result.row);changed();await flush();if(dirty||blocked)throw Error('Сначала восстанови синхронизацию; предложение осталось во входящих.')}}await cloudRequest('/api/gpt',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})});p.status=status;render();toast(status==='applied'?'Предложение добавлено в Discovery':'Предложение отклонено');if(result)go(result.kind,M.recordId(result.kind,result.row))}catch(error){toast(error.message)}}

function modal(title,html){closeDialog();$('#dialog').innerHTML='<div class="dialog-head"><h2>'+esc(title)+'</h2><button class="icon-button" data-action="close" aria-label="Закрыть">'+icon('close')+'</button></div><div class="dialog-body">'+html+'</div>';$('#dialog').showModal()}
function closeDialog(){if($('#dialog').open)$('#dialog').close()}
function createMenu(){modal('Добавить в рабочее пространство','<p class="dialog-note">С чего начнём?</p><div class="create-grid">'+M.kinds.map(kind=>'<button class="create-option" data-action="new" data-kind="'+kind+'"><span class="icon-tile">'+icon(M.config[kind].icon)+'</span><span><strong>'+M.config[kind].singular+'</strong><small>'+titleFor(kind)+'</small></span></button>').join('')+'</div>')}
function newRecord(kind,templateIndex){
  if(kind==='documents'&&templateIndex===undefined){modal('Новый документ','<p class="dialog-note">Выбери структуру. Все разделы можно изменить.</p>'+M.templates.map((t,i)=>'<button class="template-button" data-action="template" data-index="'+i+'">'+esc(t.title)+'<small> · '+esc(t.category)+'</small></button>').join(''));return;}
  if(!M.kinds.includes(kind))return;
  const id=crypto.randomUUID();let row;
  if(kind==='matrix'){let n=1;while(state.matrix.some(r=>r.A==='REQ-'+String(n).padStart(3,'0')))n++;row=Object.fromEntries(Object.keys(M.labels).map(key=>[key,'']));Object.assign(row,{A:'REQ-'+String(n).padStart(3,'0'),C:'Новое требование',B:getParam('block'),N:'Не определено',O:'Не определено',links:[],archived:false});}
  else{row={id,title:'Новый материал',status:M.config[kind].statuses[0],links:[],archived:false};for(const [key,,type] of M.config[kind].fields)row[key]=type==='lines'?[]:'';if(kind==='documents'){const t=M.templates[templateIndex||0];Object.assign(row,{title:t.title==='Пустой документ'?'Без названия':t.title,category:t.category,body:t.body,source:''});}else row.title='Новая запись: '+M.config[kind].singular.toLowerCase();}
  row.updatedAt=new Date().toISOString();state[kind].unshift(row);changed();go(kind,M.recordId(kind,row));toast('Материал создан');
}
function download(name,text,type='application/json'){const url=URL.createObjectURL(new Blob([text],{type})),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportState(){download('portfolio-discovery-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({format:'portfolio-discovery',version:2,exportedAt:new Date().toISOString(),state},null,2));toast('Резервная копия скачана')}
function downloadRecord(){const row=currentRecord(),kind=route.kind;if(!row)return;let text=kind==='documents'?'# '+row.title+'\n\n'+row.body:M.report({...state,reportItems:[M.reference(kind,row)]});download((M.recordId(kind,row).replace(/[^a-zA-Z0-9_-]/g,'_')||'document')+'.md',text,'text/markdown;charset=utf-8')}
async function downloadReport(){await flush();if(server&&!dirty&&!blocked){try{const result=await fetch('/api/report');if(!result.ok)throw Error();download('discovery-report.md',await result.text(),'text/markdown;charset=utf-8');return}catch{}}download('discovery-report.md',M.report(state),'text/markdown;charset=utf-8');toast('Скачан отчёт из текущей рабочей копии')}
function searchDialog(){modal('Поиск по всему Discovery','<input class="dialog-search" id="globalSearch" placeholder="Документ, требование, фрагмент текста…" aria-label="Поиск по всему пространству"><div class="search-results" id="searchResults"></div>');$('#globalSearch').focus();globalSearch('')}
function globalSearch(query){const term=query.trim().toLowerCase(),results=[];for(const kind of M.kinds)for(const row of alive(kind))if(term?Object.values(row).join(' ').toLowerCase().includes(term):kind==='documents')results.push({kind,row});$('#searchResults').innerHTML=results.slice(0,35).map(({kind,row})=>'<a class="search-result" href="'+recordHref(kind,row)+'">'+icon(M.config[kind].icon)+'<span><strong>'+esc(M.recordTitle(kind,row))+'</strong><small>'+titleFor(kind)+' · '+esc(row.status||row.N||'')+'</small></span></a>').join('')||empty('Ничего не найдено. Попробуй другую формулировку.')}
function formatText(type){const input=$('#documentBody');if(!input)return;const start=input.selectionStart,end=input.selectionEnd,selected=input.value.slice(start,end);const parts={bold:['**','**'],heading:['\n## ',''],list:['\n- ',''],quote:['\n> ','']}[type];input.setRangeText(parts[0]+(selected||'текст')+parts[1],start,end,'select');input.dispatchEvent(new Event('input',{bubbles:true}));input.focus()}
function toggleReport(ref){if(!lookup(ref))return;state.reportItems=state.reportItems.includes(ref)?state.reportItems.filter(r=>r!==ref):[...state.reportItems,ref];changed();render();toast(state.reportItems.includes(ref)?'Материал добавлен в основной отчёт':'Материал убран из отчёта')}
function archive(ref){const item=lookup(ref);if(!item)return;item.row.archived=!item.row.archived;item.row.updatedAt=new Date().toISOString();changed();render();toast(item.row.archived?'Материал перенесён в архив':'Материал восстановлен')}

document.addEventListener('toggle',event=>{
  const current=event.target;
  if(!(current instanceof HTMLDetailsElement)||!current.classList.contains('qa-pattern'))return;
  const trigger=current.querySelector(':scope > summary');
  trigger?.setAttribute('aria-expanded',String(current.open));
  const panel=document.getElementById(trigger?.getAttribute('aria-controls'));
  if(panel)panel.hidden=!current.open;
  const grid=current.closest('.qa-patterns');
  if(current.open){
    document.querySelectorAll('.qa-pattern[open]').forEach(other=>{if(other!==current)other.open=false;});
    if(matchMedia('(min-width:1201px)').matches)showQualitativeSplit(grid);
    else positionQualitativePanel(current);
  }else if(grid?.classList.contains('qa-split')){
    requestAnimationFrame(()=>{if(grid.isConnected&&!grid.querySelector('.qa-pattern[open]'))restoreQualitativeGrid(grid);});
  }
},true);

function initQualitativePanels(){
  document.querySelectorAll('.qa-page .qa-pattern').forEach(pattern=>{
    const panel=pattern.querySelector('.qa-pattern-panel');
    if(panel)pattern.after(panel);
  });
}
let qualitativeTopObserver;
function showQualitativeSplit(grid){
  if(grid.classList.contains('qa-split'))return;
  const focused=document.activeElement;
  const patterns=Array.from(grid.querySelectorAll(':scope > .qa-pattern'));
  const nav=document.createElement('div');
  const pane=document.createElement('div');
  nav.className='qa-split-nav';
  pane.className='qa-split-pane';
  patterns.forEach(pattern=>{
    const panel=document.getElementById(pattern.querySelector('summary').getAttribute('aria-controls'));
    nav.append(pattern);
    if(panel){panel.style.gridColumn='';pane.append(panel);}
  });
  grid.append(nav,pane);
  grid.classList.add('qa-split');
  setupQualitativeReturn(grid);
  if(focused?.matches('.qa-pattern summary'))focused.focus({preventScroll:true});
}
function setupQualitativeReturn(grid){
  const anchor=document.createElement('span');
  const button=document.createElement('button');
  anchor.className='qa-return-anchor';
  anchor.setAttribute('aria-hidden','true');
  button.type='button';
  button.className='qa-return-top';
  button.setAttribute('aria-label','Вернуться к началу анализа');
  button.setAttribute('aria-hidden','true');
  button.tabIndex=-1;
  button.innerHTML='<span aria-hidden="true">↑</span>';
  button.addEventListener('click',()=>grid.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));
  grid.append(anchor,button);
  const headerHeight=document.querySelector('.topbar')?.getBoundingClientRect().height||74;
  qualitativeTopObserver?.disconnect();
  qualitativeTopObserver=new IntersectionObserver(([entry])=>{
    const visible=!entry.isIntersecting&&entry.boundingClientRect.top<headerHeight+12;
    button.classList.toggle('is-visible',visible);
    button.setAttribute('aria-hidden',String(!visible));
    button.tabIndex=visible?0:-1;
  },{rootMargin:`-${Math.ceil(headerHeight+12)}px 0px 0px 0px`,threshold:0});
  qualitativeTopObserver.observe(anchor);
}
function restoreQualitativeGrid(grid){
  if(!grid.classList.contains('qa-split'))return;
  qualitativeTopObserver?.disconnect();
  qualitativeTopObserver=null;
  grid.querySelector('.qa-return-anchor')?.remove();
  grid.querySelector('.qa-return-top')?.remove();
  const focused=document.activeElement;
  const patterns=Array.from(grid.querySelectorAll('.qa-split-nav > .qa-pattern'));
  patterns.forEach(pattern=>{
    const panel=document.getElementById(pattern.querySelector('summary').getAttribute('aria-controls'));
    grid.append(pattern);
    if(panel)grid.append(panel);
  });
  grid.querySelector('.qa-split-nav')?.remove();
  grid.querySelector('.qa-split-pane')?.remove();
  grid.classList.remove('qa-split');
  if(focused?.matches('.qa-pattern summary'))focused.focus({preventScroll:true});
}
function positionQualitativePanel(pattern){
  const grid=pattern.closest('.qa-patterns');
  const patterns=Array.from(grid.querySelectorAll(':scope > .qa-pattern'));
  const panel=document.getElementById(pattern.querySelector('summary').getAttribute('aria-controls'));
  panel.style.gridColumn='';
  const columns=getComputedStyle(grid).gridTemplateColumns.split(' ').length;
  const index=patterns.indexOf(pattern);
  const rowEnd=Math.min(patterns.length-1,Math.floor(index/columns)*columns+columns-1);
  patterns[rowEnd].after(panel);
  panel.style.gridColumn=columns===1?'1':columns===2?'1 / span 2':(index%columns<2?'1 / span 2':'3 / span 2');
}
window.addEventListener('resize',()=>{
  const grid=document.querySelector('.qa-page .qa-patterns');
  const pattern=grid?.querySelector('.qa-pattern[open]');
  if(!grid||!pattern)return;
  if(matchMedia('(min-width:1201px)').matches)showQualitativeSplit(grid);
  else{restoreQualitativeGrid(grid);positionQualitativePanel(pattern);}
});

function closeQualitativePattern(pattern,restoreFocus=false){
  const trigger=pattern.querySelector(':scope > summary');
  pattern.open=false;
  trigger?.setAttribute('aria-expanded','false');
  const panel=document.getElementById(trigger?.getAttribute('aria-controls'));
  if(panel)panel.hidden=true;
  if(restoreFocus)trigger?.focus({preventScroll:true});
  requestAnimationFrame(()=>{
    if(!pattern.isConnected)return;
    const rect=trigger.getBoundingClientRect();
    if(rect.bottom<0||rect.top>window.innerHeight){
      trigger.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    }
  });
}
document.addEventListener('click',event=>{
  if(route.kind!=='researchAnalysis'||!event.target.closest)return;
  const pattern=document.querySelector('.qa-page .qa-pattern[open]');
  if(!pattern||window.getSelection()?.toString().trim())return;
  if(event.target.closest('a,button,input,textarea,select,option,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="link"],[role="checkbox"],[role="switch"],[role="textbox"],[role="combobox"],[role="menuitem"]'))return;
  if(event.target.closest('.qa-pattern summary'))return;
  if(matchMedia('(min-width:1201px)').matches&&event.target.closest('.qa-split-pane'))return;
  closeQualitativePattern(pattern);
});
document.addEventListener('keydown',event=>{
  if(route.kind!=='researchAnalysis'||event.key!=='Escape'||event.defaultPrevented)return;
  const pattern=document.querySelector('.qa-page .qa-pattern[open]');
  if(pattern&&!event.target.closest('dialog,[role="dialog"]')){event.preventDefault();closeQualitativePattern(pattern,true);}
});

document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el){if(event.target.closest('#dialog a'))closeDialog();if(event.target.closest('.nav-link'))$('#sidebar').classList.remove('open');return;}
  const action=el.dataset.action;
  if(action==='back')back();else if(action==='parent')go(route.kind);else if(action==='menu')$('#sidebar').classList.toggle('open');else if(action==='create')createMenu();else if(action==='new')newRecord(el.dataset.kind);else if(action==='new-research')newResearchRecord(el.dataset.format);else if(action==='new-analysis')newAnalysisDocument();else if(action==='open-plan'){const row=findResearchPlan();if(row)go('documents',row.id)}else if(action==='research-plan-save')saveResearchPlan();else if(action==='research-retry')ensureInterviewData(true);else if(action==='research-import')chooseInterviewImport();else if(action==='open-research')go('research');else if(action==='audience')filter('audience',el.dataset.audience);else if(action==='template')newRecord('documents',Number(el.dataset.index));else if(action==='close')closeDialog();else if(action==='search')searchDialog();else if(action==='category')filter('category',el.dataset.category);else if(action==='role')filter('role',el.dataset.role);else if(action==='clear-filters'){route.params=new URLSearchParams();filter('q','');}else if(action==='export')exportState();else if(action==='import')$('#importFile').click();else if(action==='retry'){if(blocked){toast('Скачай копию, затем обнови страницу и импортируй её для разрешения конфликта.');return}flush();}else if(action==='report')go('report');else if(action==='documents')go('documents');else if(action==='sync-connect')connectDialog();else if(action==='sync-disconnect')disconnectCloud();else if(action==='sync-refresh')refreshCloud();else if(action==='sync-apply')reviewProposal(el.dataset.id,'applied');else if(action==='sync-dismiss')reviewProposal(el.dataset.id,'dismissed');else if(action==='preview'){preview=!preview;render();}else if(action==='format')formatText(el.dataset.format);else if(action==='outline'){const line=Number(el.dataset.line);preview=true;render();$('#heading-'+line)?.scrollIntoView({behavior:'smooth',block:'start'});}else if(action==='toggle-report')toggleReport(el.dataset.ref);else if(action==='archive')archive(el.dataset.ref);else if(action==='unlink'){const row=currentRecord();row.links=linksFor(row).filter(r=>r!==el.dataset.ref);changed();render();}else if(action==='task-done'){const task=state.tasks.find(t=>t.id===el.dataset.id);if(task){task.status='Готово';task.updatedAt=new Date().toISOString();changed();render();}}else if(action==='download-record')downloadRecord();else if(action==='download-report')downloadReport();
});
document.addEventListener('input',event=>{const el=event.target;if(el.id==='globalSearch'){globalSearch(el.value);return}if(el.dataset.filter){filter(el.dataset.filter,el.value);return}if(el.dataset.field&&el.tagName!=='SELECT'){updateField(el);return}if(el.dataset.crud&&el.tagName==='INPUT'){state.crud[el.dataset.crud]=el.value;changed();}});
document.addEventListener('change',event=>{const el=event.target;if(el.dataset.filter){filter(el.dataset.filter,el.value);return}if(el.dataset.field&&el.tagName==='SELECT'){updateField(el);return}if(el.dataset.crud){state.crud[el.dataset.crud]=el.value;changed();return}if(el.id==='addLink'&&el.value){const row=currentRecord();row.links=[...new Set([...linksFor(row),el.value])];changed();render();}});
function updateField(el){const row=currentRecord();if(!row)return;row[el.dataset.field]=el.dataset.lines!==undefined?el.value.split('\n').map(s=>s.trim()).filter(Boolean):el.value;row.updatedAt=new Date().toISOString();changed();if(el.dataset.field==='title'||el.dataset.field==='C')breadcrumbs();if(el.dataset.field==='body'&&$('#wordCount'))$('#wordCount').textContent=el.value.trim().split(/\s+/).filter(Boolean).length+' слов · Markdown';}
$('#importFile').addEventListener('change',async event=>{
  const file=event.target.files[0];event.target.value='';if(!file)return;
  try{if(file.size>15_000_000)throw Error('Файл больше 15 МБ');const data=JSON.parse(await file.text());let imported;if(data.state)imported=data.state;else if(data.version===2)imported=data;else if(Array.isArray(data.matrix)&&data.crud){imported={...structuredClone(state),matrix:data.matrix,crud:data.crud};}else throw Error('Формат файла не распознан');M.validate(imported);
    modal('Восстановить рабочее пространство?','<p class="dialog-note">Импорт заменит текущую рабочую копию. Перед заменой автоматически скачивается резервная копия текущих данных.</p><p class="dialog-note">Документов: '+imported.documents.length+' · Требований: '+imported.matrix.length+'</p><div class="dialog-footer">'+button('Отмена','close')+'<button class="button primary" id="confirmImport">Восстановить</button></div>');
    $('#confirmImport').onclick=()=>{exportState();state=imported;changed();closeDialog();go('home');render();toast('Рабочее пространство восстановлено');};
  }catch(error){toast('Импорт не выполнен: '+error.message)}
});
window.addEventListener('hashchange',()=>{
  if(previousHash)scrollPositions.set(previousHash,window.scrollY);
  if(!history.state?.discoveryPage)history.replaceState({discoveryPage:true,discoveryDepth:(window.discoveryDepth||0)+1},'',location.href);
  window.discoveryDepth=history.state?.discoveryDepth||0;previousHash=location.hash;preview=false;closeDialog();flush();render();if(route.kind==='sync'&&cloud)loadProposals();if(route.kind==='researchInterviews')ensureInterviewData();if(route.kind==='researchHub')ensureInterviewSummary();window.scrollTo(0,scrollPositions.get(location.hash)||0);
});
window.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();searchDialog()}if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='s'){event.preventDefault();flush();toast('Сохраняем рабочее пространство')}});
window.addEventListener('beforeunload',event=>{if(dirty){backup();event.preventDefault();event.returnValue='';}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
$('#dialog').addEventListener('click',event=>{if(event.target===$('#dialog')){const box=$('#dialog').getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeDialog()}});

function applyDeploy1Migration(){
  const marker='2026-11-21-audit-safe-v2';if(state.deploy1Revision===marker)return false;
  const now=new Date().toISOString();
  // Never replace an existing matrix snapshot here: it may contain newer cloud edits.
  // The static sheet snapshot is only used to seed an empty workspace.
  if(!state.matrix.length&&deploy1Matrix.length)state.matrix=structuredClone(deploy1Matrix);
  // The previous migration created synthetic hypotheses and decisions. Keep their text
  // for history, but remove them from active registers so they cannot masquerade as approved.
  for(const row of state.hypotheses)if(/^H-Q\d{2}$/.test(row.id))row.archived=true;
  for(const row of state.decisions)if(row.id.startsWith('D-Q-')&&row.links?.includes('documents:deploy1-qualitative-analysis'))row.archived=true;
  for(const id of ['deploy1-qualitative-analysis','deploy1-risk-cold-start']){const old=state.documents.find(doc=>doc.id===id);if(old)old.archived=true;}
  const falseScopePrefix='# DEPLOY #1 · QUALITATIVE COMPLETE\n\nКачественный этап завершён: 7 независимых интервью + SELF01/R08 отдельно, 960 ответов, 14 паттернов. Количественный этап и неподтверждённые числовые решения остаются открытыми.\n\n';
  const scope=state.documents.find(doc=>doc.id==='source-01-discovery--project-scope'||doc.source==='01-discovery/project-scope.md');
  if(scope?.body.startsWith(falseScopePrefix))scope.body=scope.body.slice(falseScopePrefix.length);
  const v1Timestamp='2026-11-20T12:00:00.000Z';
  for(const id of ['case','access']){
    const row=state.entities.find(entity=>entity.id===id),seed=seedState.entities.find(entity=>entity.id===id);
    if(row&&seed&&row.updatedAt===v1Timestamp)Object.assign(row,structuredClone(seed));
  }
  const researchTask=state.tasks.find(task=>task.id==='research-task'),seedResearchTask=seedState.tasks.find(task=>task.id==='research-task');
  if(researchTask&&seedResearchTask&&researchTask.updatedAt===v1Timestamp)Object.assign(researchTask,structuredClone(seedResearchTask));
  const analysisId='qualitative-analysis-cp-20261121';
  if(qualitativeAnalysis.schemaVersion<2&&!state.documents.some(doc=>doc.id===analysisId)){
    const body='# Анализ глубинных интервью\n\n'+qualitativeAnalysis.patterns.map(p=>'## '+p.id+' — '+p.title+'\n\n'+p.lead+'\n\n**Итог:** '+p.conclusion).join('\n\n')+'\n\n## Cold Start\n\n'+qualitativeAnalysis.risk.text.join('\n\n');
    state.documents.unshift({id:analysisId,title:'Качественный анализ интервью',category:'Результаты и аналитика',status:'Рабочий вывод',source:'Агрегированная исследовательская сводка; без первичных ответов',body,links:[],archived:false,updatedAt:now});
  }
  state.reportItems=[...new Set([...state.reportItems,'documents:'+analysisId])];state.deploy1Revision=marker;return true;
}

async function init(){
  $('#backButton').innerHTML=icon('back');$('#searchIcon').innerHTML=icon('search');$('#backupButton').innerHTML=icon('download')+'Резервная копия';$('#importButton').innerHTML=icon('upload')+'Импортировать';
  try{
    const [matrixResponse,docsResponse,analysisResponse]=await Promise.all([fetch('data/deploy1-matrix.json'),fetch('data/discovery.json'),fetch('data/qualitative-analysis.json')]);if(!matrixResponse.ok||!docsResponse.ok||!analysisResponse.ok)throw Error('Не удалось загрузить исходные материалы');
    const matrixData=await matrixResponse.json();deploy1Matrix=matrixData.rows;qualitativeAnalysis=await analysisResponse.json();seedState=M.seed(deploy1Matrix,(await docsResponse.json()).documents);
    const local=storageRead(KEY);let remote=null,cloudError='';
    const isLocal=['localhost','127.0.0.1'].includes(location.hostname);
    if(isLocal){try{const response=await fetch('/api/workspace');if(response.ok){remote=await response.json();server=true;}else if(response.status!==404)throw Error('Хранилище недоступно: '+response.status);}catch(error){if(error.message.startsWith('Хранилище'))throw error;}}
    else{cloudToken=sessionStorage.getItem(SYNC_KEY)||localStorage.getItem(SYNC_KEY)||'';if(cloudToken)try{remote=await cloudRequest('/api/workspace');cloud=true;}catch(error){cloudError=error.message;}}
    if(remote?.state){state=M.validate(remote.state);revision=remote.revision;}
    else if(local?.state){state=M.validate(local.state);revision=remote?.revision||0;}
    else{state=structuredClone(seedState);const legacyMatrix=storageRead('portfolio-training-matrix'),legacyCrud=storageRead('portfolio-training-crud');if(Array.isArray(legacyMatrix))state.matrix=legacyMatrix;if(legacyCrud&&typeof legacyCrud==='object')state.crud=legacyCrud;M.validate(state);}
    let added=false;for(const doc of seedState.documents)if(!state.documents.some(d=>d.id===doc.id)){state.documents.push(doc);added=true;}if(applyDeploy1Migration())added=true;M.validate(state);
    $('#storageDescription').textContent=cloud?'Автосохранение в закрытом облаке\nи копия в браузере':server?'Автосохранение на диск\nи резервная копия в браузере':'Сохранение в этом браузере. Облако подключается в разделе «ChatGPT и облако».';
    if(!location.hash.startsWith('#/'))history.replaceState(null,'',uri('home'));history.replaceState({discoveryPage:true,discoveryDepth:0},'',location.href);previousHash=location.hash;window.discoveryDepth=0;render();setSaveStatus(cloud?'Облачная копия загружена':server?'Рабочее пространство загружено с диска':'Локальный режим · сохранение в браузере');if(cloudError)showError('Облако недоступно: '+cloudError+' Данные открыты из браузера.');if(cloud)loadProposals();if(route.kind==='researchInterviews')ensureInterviewData();if(route.kind==='researchHub')ensureInterviewSummary();
    if(local?.dirty&&remote?.state){
      modal('Найдена несохранённая копия','<p class="dialog-note">В браузере остались изменения, которые могли не попасть на диск. Можно восстановить их или скачать отдельно, сохранив текущую версию с диска.</p><div class="dialog-footer"><button class="button" id="downloadDraft">Скачать копию</button><button class="button primary" id="recoverDraft">Восстановить</button></div>');
      $('#downloadDraft').onclick=()=>download('portfolio-unsaved-copy.json',JSON.stringify({version:2,state:local.state},null,2));
      $('#recoverDraft').onclick=()=>{try{state=M.validate(local.state);blocked=false;changed();closeDialog();render();toast('Несохранённая копия восстановлена')}catch(error){toast(error.message)}};
    }else if(!remote?.state||added){changed();flush();}
  }catch(error){$('#content').innerHTML='<div class="card">'+empty('Не удалось открыть пространство: '+error.message)+ '</div>';showError('Запусти приложение командой python3 server.py из его папки. Существующие данные не перезаписаны.');}
}
init();
