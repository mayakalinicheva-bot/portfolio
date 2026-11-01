/* Pure data, validation and text rendering shared by the workspace and checks. */
globalThis.DiscoveryModel = (() => {
  const labels = {A:'ID',B:'Блок',C:'Элемент / функция',D:'Роль',E:'Сценарий / триггер',F:'Требование / поведение',G:'UI / состояние',H:'Данные / зависимости',I:'Метрики',J:'Edge cases',K:'Corner cases',L:'Восстановление / выход',M:'Критерии приёмки',N:'Статус решения',O:'MVP',P:'Открытые вопросы'};
  const kinds = ['documents','hypotheses','research','decisions','entities','tasks','matrix'];
  const categories = ['Продукт','Теории и модели','Исследования','Решения','Референсы','Источники','Заметки'];
  const roles = ['Студент','Преподаватель','Модератор','Руководитель','Администратор','Гость'];
  const config = {
    documents:{title:'Документы',singular:'Документ',icon:'file',desc:'Рамка продукта, исследования и знания — в одном месте.',statuses:['Черновик','На обсуждении','Согласовано','Материал источника'],fields:[]},
    hypotheses:{title:'Гипотезы',singular:'Гипотеза',icon:'bulb',desc:'Формулируй предположения, собирай свидетельства и проверяй выводы.',statuses:['Идея','Проверяем','Подтверждена','Опровергнута','Отложена'],fields:[['assumption','Что предполагаем','textarea'],['audience','Для кого','text'],['experiment','Как проверим','textarea'],['criterion','Критерий успеха','textarea'],['evidence','Свидетельства и источники','textarea'],['conclusion','Вывод','textarea']]},
    research:{title:'Исследования',singular:'Исследование',icon:'search',desc:'Интервью, наблюдения, опросы и разбор референсов.',statuses:['Планируем','В процессе','Завершено','Отложено'],fields:[['question','Исследовательский вопрос','textarea'],['method','Метод и участники','text'],['findings','Наблюдения и цитаты','textarea'],['source','Источник / ссылка','text'],['conclusion','Выводы','textarea'],['next','Следующий шаг','textarea']]},
    decisions:{title:'Решения',singular:'Решение',icon:'check',desc:'Фиксируй основания, альтернативы и последствия продуктовых решений.',statuses:['Обсуждаем','Принято','Пересматриваем','Отменено'],fields:[['description','Формулировка решения','textarea'],['rationale','На чём основано','textarea'],['alternatives','Рассмотренные альтернативы','textarea'],['consequences','Последствия и ограничения','textarea'],['owner','Кто принимает решение','text']]},
    entities:{title:'Сущности',singular:'Сущность',icon:'layers',desc:'Уточняй модель продукта и связывай её с требованиями и исследованиями.',statuses:['Гипотеза','Прорабатываем','Согласовано'],fields:[['description','Назначение и ценность','textarea'],['body','Поля, состояния, связи и правила','textarea'],['blocks','Связанные блоки матрицы (по одному на строке)','lines']]},
    tasks:{title:'План Discovery',singular:'Задача',icon:'calendar',desc:'Следующие шаги, ответственные и результаты работы.',statuses:['Запланировано','В работе','Готово','Отложено'],fields:[['description','Что нужно сделать и какой результат получить','textarea'],['owner','Ответственный','text'],['due','Срок','date']]},
    matrix:{title:'Матрица требований',singular:'Требование',icon:'grid',desc:'Поведение, роли, состояния и исключения. Основа — 48 строк рабочей матрицы.',statuses:[],fields:Object.entries(labels).filter(([k])=>k!=='A'&&k!=='C').map(([k,v])=>[k,v,['B','D','N','O'].includes(k)?'text':'textarea'])}
  };
  const templates = [
    {title:'Пустой документ',category:'Заметки',body:''},
    {title:'Project Scope',category:'Продукт',body:'# Контекст и проблема\n\nКакую проблему решаем? На каких наблюдениях это основано?\n\n## Цели продукта\n\n## Пользователи и потребности\n\n## Границы MVP\n\n### Входит в первую версию\n\n### За рамками первой версии\n\n## Ограничения и зависимости\n\n## Критерии успеха\n\n## Риски и открытые вопросы\n\n## Основания и связанные решения\n'},
    {title:'Теория продукта',category:'Теории и модели',body:'# Продуктовая теория\n\n## Для кого создаём продукт\n\n## Какую проблему решаем\n\n## Как люди решают её сейчас\n\n## Предлагаемая ценность\n\n## Почему решение должно сработать\n\n## Ключевые предположения\n\n## Что может опровергнуть теорию\n\n## Как будем проверять\n\n## Свидетельства и выводы\n'},
    {title:'JTBD / потребность пользователя',category:'Теории и модели',body:'# Потребность пользователя\n\n## Контекст\n\nКогда …\n\n## Мотивация\n\nЯ хочу …\n\n## Ожидаемый результат\n\nЧтобы …\n\n## Текущее решение\n\n## Барьеры и тревоги\n\n## Свидетельства из исследования\n'},
    {title:'План интервью',category:'Исследования',body:'# План интервью\n\n## Цель и исследовательские вопросы\n\n## Кого приглашаем\n\n## Согласие и формат записи\n\n## Вопросы о прошлом опыте\n\n## Наблюдения и дословные цитаты\n\n## Интерпретация\n\n## Что проверить следующим\n'},
    {title:'Метрики и критерии успеха',category:'Продукт',body:'# Метрики продукта\n\n## Цель измерения\n\n## Метрика и формула\n\n## Источник данных\n\n## Исходное значение\n\nНе получено.\n\n## Целевое значение и основание\n\nНе согласовано.\n\n## Период измерения\n\n## Ограничения интерпретации\n'}
  ];
  const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const recordId = (kind,row) => kind==='matrix'?row.A:row.id;
  const recordTitle = (kind,row) => (kind==='matrix'?row.C:row.title)||'Без названия';
  const reference = (kind,row) => kind+':'+recordId(kind,row);
  function resolve(state,ref){const at=ref.indexOf(':');const kind=ref.slice(0,at),id=ref.slice(at+1);if(!kinds.includes(kind))return null;const row=state[kind].find(r=>recordId(kind,r)===id);return row?{kind,row}:null;}
  function seed(matrix,documents){
    const notes='documents:source-04-requirements--decision-notes';
    const entity=(id,title,description,blocks)=>({id,title,description,blocks,status:'Гипотеза',body:'Предварительная группировка требований. Поля, состояния и границы сущности нужно уточнить.',links:[],archived:false,updatedAt:''});
    const hypothesis=(id,title,assumption)=>({id,title,assumption,status:'Идея',audience:'',experiment:'',criterion:'',evidence:'Обсуждение владельца проекта; подтверждение исследованием ещё не получено.',conclusion:'',links:[notes],archived:false,updatedAt:''});
    return {version:2,matrix,documents,crud:{},reportItems:[],entities:[
      entity('profile','Пользователь и профиль','Публичное представление автора, контакты, награды и активность.',['Профиль','Контакты','Награды','Активность']),
      entity('case','Работа / кейс','Содержание работы, представление, черновик и настройки публикации.',['Работы','Просмотр','Настройки кейса','Черновики']),
      entity('editor','Редактор и сохранение','Изменения, медиа, версии и восстановление. Группу предстоит разделить на отдельные сущности.',['Редактор проекта','Сохранение','Облачное хранение','Загрузка файлов','Обработка медиа','Статусы сохранения','Локальное восстановление','Технические сессии','Журнал операций','Контрольные точки','Восстановление','История версий','Синхронизация']),
      entity('access','Роли и доступ','Гостевой сценарий и правила доступа.',['Гостевой доступ','Инфраструктура и безопасность']),
      entity('recommendation','Рекомендации','Обнаружение работ и переходы между материалами.',['Рекомендации']),
      entity('coauthor','Соавторство','Приглашение, принятие участия и согласование изменений — сценарий для обсуждения.',['Настройки кейса'])
    ],hypotheses:[
      hypothesis('lxp','Данные профиля из LXP','Если интеграция доступна к MVP, имя, группа, курс и статус обучения могут поступать из LXP. Доступность интеграции не подтверждена.'),
      hypothesis('coauthor-approval','Согласие соавтора перед публикацией','Удерживать кейс от появления в профилях до принятия приглашения. Условие публикации и поведение при отказе ещё открыты.'),
      hypothesis('role-verification','Подтверждение роли без LXP','Администратор или модератор проверяет принадлежность колледжу; основание проверки и полномочия требуется определить.')
    ],research:[],decisions:[],tasks:[
      {id:'scope-task',title:'Уточнить границы первого MVP',status:'Запланировано',description:'Пройти Project Scope и зафиксировать, что входит в первый выпуск и что остаётся за его рамками.',owner:'',due:'',links:['documents:source-01-discovery--project-scope'],archived:false,updatedAt:''},
      {id:'research-task',title:'Подготовить исследование студентов и преподавателей',status:'Запланировано',description:'Согласовать выборку, метод, вопросы и порядок сбора данных до начала интервью и опроса.',owner:'',due:'',links:[],archived:false,updatedAt:''},
      {id:'coauthor-task',title:'Разобрать права соавторов по CRUD',status:'Запланировано',description:'Определить права инициатора и принявших соавторов, свои и чужие объекты, статусы и порядок согласования.',owner:'',due:'',links:['entities:coauthor','hypotheses:coauthor-approval'],archived:false,updatedAt:''}
    ]};
  }
  function validate(state){
    if(!state||state.version!==2)throw Error('Неподдерживаемый формат рабочего пространства');
    for(const kind of kinds){
      if(!Array.isArray(state[kind])||state[kind].length>10000)throw Error('Некорректный раздел: '+kind);
      const ids=new Set();for(const row of state[kind]){
        if(!row||typeof row!=='object'||Array.isArray(row))throw Error('Некорректная запись');
        const id=recordId(kind,row);if(typeof id!=='string'||!id.trim()||ids.has(id))throw Error('Пустой или повторный ID в '+kind);ids.add(id);
        for(const [key,value] of Object.entries(row)){
          if(['__proto__','constructor','prototype'].includes(key))throw Error('Недопустимое поле');
          if(key==='links'||key==='blocks'){if(!Array.isArray(value)||!value.every(v=>typeof v==='string'))throw Error('Некорректный список');}
          else if(key==='archived'){if(typeof value!=='boolean')throw Error('Некорректный статус архива');}
          else if(typeof value!=='string')throw Error('Ожидается текст в поле '+key);
        }
      }
    }
    if(!state.crud||typeof state.crud!=='object'||Array.isArray(state.crud)||!Object.values(state.crud).every(v=>typeof v==='string'||typeof v==='boolean'))throw Error('Некорректная матрица CRUD');
    if(!Array.isArray(state.reportItems)||!state.reportItems.every(v=>typeof v==='string'))throw Error('Некорректный состав отчёта');
    return state;
  }
  function inline(text){return esc(text).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');}
  function markdown(text){
    const lines=String(text||'').replace(/\r/g,'').split('\n');let out=[],list='',code=null;
    const closeList=()=>{if(list){out.push('</'+list+'>');list='';}};
    for(let i=0;i<lines.length;i++){
      const line=lines[i];if(line.startsWith('```')){closeList();if(code!==null){out.push('<pre><code>'+esc(code.join('\n'))+'</code></pre>');code=null;}else code=[];continue;}
      if(code!==null){code.push(line);continue;}
      let match=line.match(/^(#{1,6})\s+(.+)$/);
      if(match){closeList();out.push('<h'+match[1].length+' id="heading-'+i+'" class="reader-heading">'+inline(match[2])+'</h'+match[1].length+'>');continue;}
      if(/^\s*[-*]\s+/.test(line)||/^\s*\d+\.\s+/.test(line)){let type=/^\s*\d/.test(line)?'ol':'ul';if(list!==type){closeList();list=type;out.push('<'+list+'>');}out.push('<li>'+inline(line.replace(/^\s*(?:[-*]|\d+\.)\s+/,''))+'</li>');continue;}
      closeList();if(!line.trim())continue;
      if(/^\s*\|/.test(line)&&i+1<lines.length&&/^\s*\|?[\s:|-]+\|/.test(lines[i+1])){
        const cells=l=>l.trim().replace(/^\||\|$/g,'').split('|');out.push('<table><thead><tr>'+cells(line).map(c=>'<th>'+inline(c.trim())+'</th>').join('')+'</tr></thead><tbody>');i+=2;
        while(i<lines.length&&/^\s*\|/.test(lines[i])){out.push('<tr>'+cells(lines[i]).map(c=>'<td>'+inline(c.trim())+'</td>').join('')+'</tr>');i++;}i--;out.push('</tbody></table>');continue;
      }
      if(/^---+$/.test(line.trim())){out.push('<hr>');continue;}
      if(line.startsWith('> ')){out.push('<blockquote>'+inline(line.slice(2))+'</blockquote>');continue;}
      out.push('<p>'+inline(line)+'</p>');
    }
    closeList();if(code!==null)out.push('<pre><code>'+esc(code.join('\n'))+'</code></pre>');return out.join('\n');
  }
  function report(state){
    const items=state.reportItems.map(ref=>resolve(state,ref)).filter(x=>x&&!x.row.archived);
    return '# portfolio — основной отчёт Discovery\n\nСтатусы и основания приведены из выбранных материалов.\n\n'+items.map(({kind,row})=>{
      const fields=kind==='matrix'?Object.entries(labels):[['status','Статус'],['category','Раздел'],...config[kind].fields.map(([key,label])=>[key,label]),['source','Источник']];
      let text='## '+recordTitle(kind,row)+'\n\n';if(kind==='documents'){const body=String(row.body||'').split('\n');if(body[0]?.replace(/^#+\s*/, '').trim()===row.title.trim())body.shift();text+=body.map(line=>{const match=line.match(/^(#{1,6})(\s.*)$/);return match?'#'.repeat(Math.min(match[1].length+2,6))+match[2]:line}).join('\n')+'\n\n';}
      for(const [key,label] of fields)if(row[key])text+='**'+label+':** '+(Array.isArray(row[key])?row[key].join(', '):row[key])+'\n\n';return text;
    }).join('---\n\n');
  }
  return {labels,kinds,categories,roles,config,templates,esc,recordId,recordTitle,reference,resolve,seed,validate,markdown,report};
})();
