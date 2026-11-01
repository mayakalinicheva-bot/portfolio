# Behance публичная карта продукта и полная архитектура независимой платформы

Углублённая карта публично подтверждаемых функций, ролей, прав, сущностей и механик веб-платформы

Актуальность открытых источников: 27 октября 2026 года

## Как читать этот документ

Это карта публично описанного веб-продукта Behance и план самостоятельного продукта для творческих портфолио. В нём собраны роли, функции, экраны, пользовательские сценарии, сущности, приоритеты, архитектурные решения, черновая схема данных и дизайн-спецификация. Объём включает web; мобильные приложения не исследовались.

**Уровни достоверности:** «подтверждено» — поведение описано в официальных материалах Behance/Adobe; «вывод» — проектное следствие из материалов; «неизвестно» — открытой документации недостаточно, требуется осмотр экрана. Официальные страницы могут отставать от интерфейса, а коммерческие функции зависят от страны, аккаунта и подписки.

REA CLI установлен и зарегистрирован для Codex, но MCP-инструменты REA отсутствуют в текущей сессии. Диагностика рекомендует перезапустить Codex для подключения. В этом документе нет REA Evidence и нет приватных account-derived данных; используются публичные страницы и официальная справка.

Архитектура и дизайн описывают независимый продукт, а не внутреннее устройство Adobe/Behance. Не переносить бренд, тексты, активы, чужой контент, аудиторию или закрытые алгоритмы.

## Содержание

1. Краткий обзор и роли
2. Источники и подтверждённые функции
3. Карта продукта и экранов
4. Пользовательские потоки
5. Компоненты и состояния
6. Модель данных и приоритеты
7. Архитектура независимого продукта
8. Дизайн-система и доступность
9. Схема данных SQL
10. Ограничения и следующий этап исследования
11. Иерархия ролей, прав и доступа
12. Каталог сущностей, состояний, событий и API
13. Предложенная логическая backend-архитектура
14. Расширения экранов и сценариев независимого продукта

---

# Behance — полная карта продукта (Web)

Дата исследования: 2026-10-27  
Основание: открытая версия сайта и публичный официальный Help Center Behance.  
Границы: пользовательские функции сайта, описанные публично. Не включены внутренние инструменты Adobe, закрытые API и действия внутри авторизованного аккаунта, которые невозможно подтвердить публичными источниками.

## 1. Краткое описание

Behance — профессиональная сеть и площадка для творческих портфолио. В ней соединены публикация проектов, открытие работ и авторов, социальные действия, вакансии и поиск исполнителей, сообщения и коммерческие инструменты для креативных специалистов.

**Основная ценность для автора:** собрать представительное портфолио, привлечь аудиторию и клиентов.  
**Для зрителя:** находить и сохранять интересные работы, следить за авторами.  
**Для клиента/рекрутера:** находить специалистов и связываться с ними, публиковать вакансии и управлять кандидатами.  
**Для подписчика/покупателя:** поддерживать автора или покупать цифровые творческие материалы там, где эти функции доступны.

## 2. Роли и основные режимы

| Роль/режим | Основная цель | Типичные возможности |
| --- | --- | --- |
| Гость | Найти и просмотреть публичные работы | Search, Discover, публичные профили и проекты; действия, требующие аккаунта, могут вести к регистрации |
| Creative | Публиковать и развивать портфолио | For You, проекты, профиль, подписки на авторов, Moodboards, сообщения, Jobs |
| Hirer / клиент | Найти и нанять специалиста | Hiring Dashboard, поиск исполнителей и услуг, вакансии, кандидаты и переписка |
| Автор-фрилансер | Получать запросы, продавать услуги | Hire Me, Freelance Services, предложения и платежи при доступности региона/платежного провайдера |
| Pro creator | Получить дополнительные инструменты | расширенная аналитика, приватность и планирование публикаций, продвижение, профильные настройки и другие преимущества Pro |
| Покупатель/подписчик | Получить цифровой контент от автора | покупка Asset или подписка на премиальный контент; доступность зависит от программы и региона |

Публичные справочные материалы документируют переключение Creative/Hirer. Точный актуальный набор пунктов меню может зависеть от аккаунта, региона и подписки.

## 3. Источники

Все источники ниже — публичные страницы Behance/Adobe Help Center; информация из них может зависеть от региона, типа аккаунта и текущего состояния функций.

| # | Тема | URL | Использование |
| --- | --- | --- | --- |
| 1 | Что такое Behance | https://help.behance.net/hc/en-us/articles/204483894-What-is-Behance | Модель профилей, проектов, ленты, подписок |
| 2 | Discover creative work | https://help.behance.net/hc/en-us/articles/204484044-Guide-Discover-Creative-Work-on-Behance | For You, поиск, curated galleries, Hire |
| 3 | For You feed | https://help.behance.net/hc/en-us/articles/204484454-Guide-For-You-Feed | Лента и рекомендации |
| 4 | Search & Filter | https://help.behance.net/hc/en-us/articles/204483864-Guide-Search-Filter-Creative-Work | Поиск, вкладки, фильтры и сортировки |
| 5 | Search ranking FAQ | https://help.behance.net/hc/en-us/articles/204483624-FAQ-I-published-my-project-but-I-can-t-find-my-project-in-Search-Why-not | Индексация и сигналы поиска |
| 6 | Создание и публикация проекта | https://help.behance.net/hc/en-us/articles/204483684-Guide-Create-Publish-A-Project | Редактор проекта, черновик, публикация |
| 7 | Основы проектов | https://help.behance.net/hc/en-us/articles/204483644-Guide-Project-Basics | Содержимое проекта и редактор |
| 8 | Настройка профиля | https://help.behance.net/hc/en-us/articles/360034538213-Guide-Fill-Out-Your-Profile | Профиль, поля, разделы, порядок проектов |
| 9 | Following Creatives | https://help.behance.net/hc/en-us/articles/204484424-Guide-Following-Creatives-On-Behance | Подписки на авторов |
| 10 | Moodboards | https://help.behance.net/hc/en-us/articles/204484004-Guide-Moodboards | Подборки и сохранение проектов/изображений |
| 11 | Notifications | https://help.behance.net/hc/en-us/articles/204483834-Guide-Notifications | Уведомления о событиях и сообщениях |
| 12 | Hire Me / доступность | https://help.behance.net/hc/en-us/articles/1260804035970-Guide-Hire-Me-Availability | Статус автора и запросы на контакт |
| 13 | Клиентский поиск | https://help.behance.net/hc/en-us/articles/57325844657179-Guide-How-Clients-Find-You-on-Behance | Hirer mode, каталог авторов, условия видимости |
| 14 | Freelance Services | https://help.behance.net/hc/en-us/articles/13758658902939-FAQ-How-do-Freelance-Services-work | Услуги автора и запросы от клиента |
| 15 | Freelance Jobs | https://help.behance.net/hc/en-us/articles/25287666847643-FAQ-How-do-I-create-a-new-Freelance-Job | Брифы, shortlist, приглашение фрилансеров |
| 16 | Creative Jobs | https://help.behance.net/hc/en-us/articles/360033898514-Guide-Creative-Jobs-on-Behance | Публикация вакансий и кандидаты |
| 17 | Apply for Jobs | https://help.behance.net/hc/en-us/articles/360034476413-Guide-Applying-For-Jobs-On-Behance | Поиск вакансий, отклик и сохраненные вакансии |
| 18 | Recruiter Pro / Hirer mode | https://help.behance.net/hc/en-us/articles/51497855366427-Guide-Use-Hirer-Mode-in-Recruiter-Pro | Dashboard, воронка кандидатов, организация найма |
| 19 | Livestreaming | https://help.behance.net/hc/en-us/articles/360041354574-Guide-Livestreaming-Content-On-Behance | Правила и ограничения эфиров |
| 20 | Work in Progress lifetime | https://help.behance.net/hc/en-us/articles/360006183653-How-long-does-it-take-for-a-Work-in-Progress-to-expire | Срок жизни WIP |
| 21 | Pro overview | https://help.behance.net/hc/en-us/articles/23707029830043-Behance-Pro-Overview | Сводка платных инструментов |
| 22 | Pro features | https://help.behance.net/hc/en-us/articles/23707509178011-Guide-Behance-Pro-Features | Настройки видимости/публикации, Analytics, Boosts, кастомизация |
| 23 | Advanced Analytics | https://help.behance.net/hc/en-us/articles/23707595489051-Guide-Advanced-Analytics | Статистика аудитории и источников трафика |
| 24 | Boosting projects | https://help.behance.net/hc/en-us/articles/30644451222427-Guide-Boosting-Your-Projects | Продвижение проектов, аудитория, модерация и результаты |
| 25 | Продажа Assets | https://help.behance.net/hc/en-us/articles/10768784072731-FAQ-How-do-I-sell-an-asset-on-Behance | Цифровые файлы, лицензия и подключение Stripe |
| 26 | Подписки (публичная справка) | https://help.behance.net/hc/en-us/article_attachments/4844402075163 | Модель premium content; справочный материал описывает ограниченную программу |
| 27 | Account Settings | https://help.behance.net/hc/en-us/articles/360034434393-Guide-Account-Settings | Раздел общих настроек аккаунта |
| 28 | Community Guidelines | https://www.behance.net/misc/community | Контентная политика и запрещенные сценарии |
| 29 | Report Abuse | https://help.behance.net/hc/en-us/articles/360036949214-Guide-Report-Abuse-on-Behance | Жалобы на профиль, проект, WIP, вакансию, сообщение |
| 30 | Ограничение частых действий | https://help.behance.net/hc/en-us/articles/57160621491995-Why-can-t-I-comment-appreciate-or-message-right-now | Антиспам для публикаций, реакций и сообщений |

## 4. Карта продукта по разделам

### A. Открытие и потребление контента

- **For You:** персональная лента для creative-режима, сочетает контент от авторов, на которых пользователь подписан, и рекомендации.
- **Discover / Explore:** Best of Behance и тематические creative-field галереи, включая курируемые подборки.
- **Search:** поиск проектов, изображений/Assets, Moodboards и людей; тип результата выбирается через отдельные вкладки/разделы.
- **Project viewer:** публичная страница проекта с последовательностью изображений/видео/текста и метаданными проекта.
- **Профиль:** идентичность автора, ссылки, биография и организованные проекты; отдельные разделы видны только если они заполнены.
- **Livestreams:** эфиры творческого процесса и их просмотр; конкретное состояние каталога и расписания зависит от текущей доступности продукта.
- **Jobs:** отдельный каталог вакансий и возможностей.

### B. Создание и управление портфолио

- Редактор проектов собирает работу из блоков: изображения, текст, галереи/сетки, видео/аудио, embed и импорты; порядок блоков можно менять.
- Настройки проекта: обложка, заголовок, creative fields, теги, инструменты, описание, credits/co-owners, display options, лицензия, взрослый контент и видимость.
- Состояния проекта включают draft, preview, published, обновленный проект, а для Pro — scheduled, link-only и password protected.
- Совместное авторство: приглашенный co-owner должен принять приглашение; опубликованный проект показывается в профилях соавторов.
- Профиль редактируется отдельно: базовые сведения, социальные ссылки, About Me, опыт, web references и custom sections; проекты можно переставлять.
- Work in Progress (WIP) позволяет делиться незавершенным творческим процессом; справка указывает, что фото/видео WIP истекают через 24 часа.

### C. Социальный слой и сохранение

- Follow/unfollow автора и feed-обновления по его активности.
- Appreciation (реакция/одобрение проекта) и комментарии.
- Moodboards — тематические подборки проектов и отдельных изображений; можно создавать, переименовывать, добавлять co-owner, менять приватность и удалять элементы.
- Уведомления: новые подписчики, appreciation, комментарии, приглашение в соавторы/Team и другие события.
- Inbox: прямые разговоры и сообщения, включая контекст запросов по работе и кандидатов.
- Report/block: жалоба на профиль, проект, WIP, вакансию или сообщение; доступность отдельных действий зависит от состояния аккаунта.

### D. Найм и карьера

- **Hire Me:** автор сообщает, что ищет full-time работу или freelance/commission-заказы; профиль предлагает релевантные формы связи.
- **Freelance Services:** карточки услуг с примерами работ, описанием и стартовой ценой; клиент отправляет inquiry.
- **Freelance job brief:** клиент задает описание, бюджет и сроки; система предлагает авторов, которых можно сохранить и пригласить.
- **Creative Jobs:** публикация full-time, part-time, contract/freelance вакансий или internships; заявка может идти внутри Behance или на внешний URL.
- **Заявки:** просмотр кандидатов из Inbox/job dashboard, открытие мини-профиля или полного профиля, Follow и переписка.
- **Recruiter Pro:** в отдельном Hirer mode доступны вакансии, поиск портфолио, shortlist, управление приложениями/кандидатами по ролям и прямые сообщения.

### E. Платные и профессиональные инструменты

- **Behance Pro:** расширенные настройки проекта, статистика, Boosts, кастомизация профиля, Pricing Guidance, некоторые интеграции Adobe и снижение комиссии платформы в описанных сценариях.
- **Analytics:** взаимодействия, регионы просмотров, источники трафика, поисковые запросы и интересы подписчиков.
- **Boost:** выбор аудитории, модерация, временное продвижение проекта и отчет по результатам.
- **Assets:** автор прикрепляет к проекту файл на продажу, задает категорию, лицензию и цену; оплата обрабатывается через поддерживаемый платежный сервис.
- **Subscriptions:** публичные материалы описывают платный доступ к премиальным проектам, стримам или исходным файлам; доступность выглядит ограниченной/зависимой от программы, поэтому нельзя считать универсальной функцией для всех аккаунтов.
- **Adobe Portfolio/Creative Cloud:** связанная экосистема; некоторые опции принадлежат Adobe и не должны считаться обязательной частью независимого продукта.

## 5. Экранная карта

Стабильные ID используются ниже в flows и features. Маршруты обозначены как известные, если они устойчивы; иначе указан путь навигации. Непроверенные состояния помечены явно.

| ID | Экран/состояние | Доступ | Назначение и основные элементы | Состояния/уверенность |
| --- | --- | --- | --- | --- |
| S01 | Публичный вход / Search landing | Гость, `/` или Search | Начать поиск творческих работ | Текущий вариант лендинга меняется; известен старт поиска для гостей, детали визуального состояния не сняты |
| S02 | Creative For You | Creative после входа | Лента подписок и рекомендаций | Документировано; пустая/ошибочная лента не исследована |
| S03 | Discover / Best of Behance | Discover/Explore | Курируемые проекты и категории | Документированы галереи; точные полки и порядок меняются |
| S04 | Creative field gallery | Discover → поле | Просмотр работ в конкретной дисциплине | Категории документированы; конкретная страница не инспектировалась вручную |
| S05 | Search Projects | Search → Projects | Поиск проектов по title/tags/creator/field | Фильтры: field, tools, color, location; сортировки: Recommended, Curated, Most Appreciated, Most Viewed, Most Discussed, Most Recent |
| S06 | Search Creatives | Search → Creatives | Поиск по имени/username | Документировано; нулевые результаты не проверены |
| S07 | Search Moodboards | Search → Moodboards | Найти подборки и авторов подборок | Поиск/фильтры по времени, полю и локации указаны в справке Moodboards |
| S08 | Search Assets | Search → Assets/файлы | Найти творческие ресурсы | Существование поиска Assets следует из справки; актуальный UX/доступность требует проверки в браузере |
| S09 | Project detail/viewer | Переход по карточке проекта | Просмотр медиа, описания и данных автора | Публичный контент; ограниченная видимость может потребовать пароль/ссылку/возрастную проверку |
| S10 | Profile — Work | Переход по автору | Профиль и портфолио | Публичные поля, карточки работ, Follow и возможный Hire Me |
| S11 | Profile — sections/tabs | Вкладки профиля | Moodboards, Appreciations, Drafts, Services, Assets, Subscriber Area, Stats и др. | Состав зависит от заполнения, Pro и включенных продуктов; не все вкладки есть у каждого автора |
| S12 | Edit Profile | Владелец профиля → Edit Your Profile | Редактирование биографии, ссылок, опыта и секций | Поля автосохраняются при потере фокуса; пустые разделы не показываются публике |
| S13 | Project editor — canvas | Share Your Work → Project | Сборка проекта из блоков и медиа | Draft/filled/uploading; автосохранения нет; ошибка загрузки не инспектировалась |
| S14 | Project editor — settings | Continue/Settings | Метаданные, доступ, кредиты и публикация | Incomplete/valid/preview/draft/published/scheduled; часть продвинутых опций Pro |
| S15 | Project preview/public result | Preview или открыть опубликованный проект | Проверка композиции/публикация | Preview и опубликованный проект документированы; responsive-поведение не проверено |
| S16 | Co-owner/Credits dialog | Project Settings → Co-owners, Credits, and More | Совместное авторство и атрибуция | Приглашение ожидает принятия; авторские права и владение требуют аккуратного моделирования |
| S17 | Work in Progress composer/viewer | Create/Share WIP | Короткие обновления рабочего процесса | Фото/видео истекают через 24 часа; полный актуальный интерфейс не подтвержден |
| S18 | Moodboards list/detail/editor | Профиль → Moodboards / Add to Moodboard | Создание, просмотр и управление подборками | Public по умолчанию, можно сделать private; до 1000 элементов на board по справке |
| S19 | Notifications | Значок колокольчика | Лента событий аккаунта | Непрочитанные/прочитанные; виды событий документированы |
| S20 | Inbox / message thread | Значок конверта | Прямые разговоры и рабочие обращения | Треды, job-context и непрочитанные; детали удаления/архивации не изучены |
| S21 | Hire Me / Edit Availability | Профиль автора | Настройка поиска работы/приема заказов | Full-time, freelance/project commissions или выключено |
| S22 | Freelance Service profile/editor | Profile Services / Edit | Опубликовать услугу, примеры, цену и описание | Услуга может быть найдена клиентом; лимиты/доступ зависят от актуальной политики |
| S23 | Browse Freelancers/Services | Hirer mode → Hire | Выбор подходящего автора/услуги | Сортировка/ранжирование динамические; eligibility зависит от страны, платежей, Pro и возраста |
| S24 | Freelance Job brief | Hirer mode → New Freelance Job | Описать проект и получить список кандидатов | Черновик/отправка/список рекомендаций/shortlist; клиент рассылает бриф конкретным людям |
| S25 | Job listing/search | Jobs | Поиск карьерных вакансий | Фильтры: тип, локация, поле, ключевые слова |
| S26 | Job detail/application | Открыть вакансию | Прочитать требования и подать заявку | Внутренняя форма или внешний сайт; на одну вакансию можно подать один раз по старой справке |
| S27 | My Jobs / applicant manager | Jobs → My Jobs / Inbox | Управлять опубликованными вакансиями и кандидатами | Активная вакансия, заявки, архивирование/повторная активация; обновление материала может изменить детали |
| S28 | Hirer Dashboard / Recruiter Pro | Switch to Hirer | Управление поиском и воронкой найма | Поиск портфолио, кандидаты, shortlists, сообщения и dashboard по ролям; Pro-доступ |
| S29 | Livestream browse/watch | Livestreams | Смотреть прямой эфир или запись | Правила эфиров документированы; наличие и точные состояния каталога не исследованы |
| S30 | Livestream setup/manage | Create/Share → Livestream | Запустить творческую трансляцию | Ограничения возраста/контента; технические этапы запуска не подтверждены источником |
| S31 | Asset attached to project | Project detail/editor | Купить/предложить файл, связанный с проектом | Страница проекта показывает asset; цена, лицензия, покупка зависят от доступности |
| S32 | Asset creation/manage | Project editor → Attach Assets / profile Assets | Добавить/изменить цифровой файл и цену | Категории/лицензия/обложка; Stripe и доступность рынка влияют на продажу |
| S33 | Subscription creator/member area | Профиль → Subscriber Area | Публиковать/потреблять эксклюзивный контент | Справка содержит beta/ограниченный доступ; экран доступен не всем, высокий риск устаревания |
| S34 | Analytics / Pro Stats | Profile → Insights/Stats | Анализ аудитории, просмотров и взаимодействий | Время/география/поиск и источники; некоторые метрики собираются только после Pro |
| S35 | Boost setup/review/results | Project settings → Boost | Продвигать проект по аудитории | выбор аудитории → модерация → кампания → отчет; отклонение может вернуть кредит |
| S36 | Behance Pro plan/manage | Pro page / Account Settings | Оформить, просмотреть и отменить Pro | Цена/страна/пробный период меняются; биллинг через Adobe |
| S37 | Account Settings | Avatar → Settings | Настройки аккаунта и предпочтений | Существование раздела документировано; точный список настроек не включен в доступную справку |
| S38 | Report / block / restriction notice | меню профиля/проекта/сообщения | Безопасность и модерация | Жалобы по типу контента; лимиты отдельных действий могут сниматься автоматически |

## 6. Пользовательские потоки

Счет кликов приблизительный: публичная справка описывает шаги, но не каждое промежуточное действие.

```text
F01 Гость находит творческую работу
    S01 -> S05 или S03 -> S09 -> S10
    цель: открыть проект, понять автора, перейти в портфолио
    happy path: 2–3 перехода после попадания на Behance
    края: пустая выдача; сброс фильтра; проект скрыт/за паролем/18+; автор удалил работу

F02 Автор оформляет профиль
    S10 -> S12 -> S10
    цель: показать профессиональную идентичность, ссылки и портфолио
    happy path: открыть редактирование, внести информацию; сохранение полей происходит автоматически
    края: отсутствует обязательная локация; незаполненные секции не видны посетителям

F03 Автор публикует проект
    S10 -> S13 -> S14 -> S15/S09
    цель: собрать историю работы и сделать ее публичной
    действия: добавить/упорядочить блоки, заполнить обязательные поля, Preview, Save Draft или Publish
    края: потерянные несохраненные изменения; upload error; невалидная обложка/название/field; private/link-only

F04 Автор выпускает проект совместно с соавторами
    S13 -> S14 -> S16 -> S19 -> S09
    цель: добавить соавтора/кредиты и опубликовать после принятия приглашения
    края: приглашение не принято; конфликт прав; удаление/снятие публикации влияет на всех владельцев

F05 Зритель подписывается на автора
    S05/S09 -> S10 -> S02
    цель: включить обновления автора в For You
    края: follow limit; повторное действие отменяет подписку; автор блокирует/удаляет профиль

F06 Зритель сохраняет подборку вдохновения
    S09 -> S18 -> S18
    цель: сохранить проект/изображение в новую или существующую Moodboard
    края: нет подборок; private board; лимит элементов; проект стал недоступен

F07 Автор публикует WIP
    S17 -> S19/S02
    цель: показать незавершенный процесс на ограниченное время
    края: фото/видео истекают через 24 часа; нарушение правил; неудачная загрузка

F08 Клиент находит автора или услугу
    S28/S23 -> S10/S22 -> S21 -> S20
    цель: отобрать исполнителя и начать разговор
    края: автор не принимает заказы; профиль не допущен к каталогу; региональные платежные ограничения

F09 Клиент отправляет freelance brief нескольким авторам
    S24 -> S23 -> S10 -> S20
    цель: создать бриф, просмотреть рекомендации/shortlist, отправить приглашения
    края: бриф не рассылается автоматически; рекомендации не подходят; кандидат не отвечает

F10 Клиент покупает Freelance Service / нанимает автора
    S22/S23 -> S20 -> proposal -> payment -> delivery/acceptance
    цель: согласовать объем работ, принять предложение и завершить проект
    края: нет Stripe/PayPal; платеж отклонен; спор/возврат; налоговая/географическая доступность

F11 Автор ищет и откликается на вакансию
    S25 -> S26 -> S20
    цель: найти роль и подать портфолио как заявление
    края: внешний apply URL; повторная заявка запрещена; мошенническая вакансия

F12 Рекрутер публикует вакансию и работает с кандидатами
    S28 -> S27 -> S20/S10
    цель: опубликовать job, просмотреть кандидатов, перейти к профилям и сообщить им
    края: job истек; отклик идет внешне; вакансия отклонена за несоответствие правилам

F13 Автор продает цифровой Asset
    S13 -> S32 -> S14 -> S31 -> purchase
    цель: привязать файл, лицензию и цену к проекту
    края: Stripe не подключен; неподдерживаемый файл; refund/license issue; регион/налоги

F14 Автор включает платную подписку на контент
    S33 -> premium project/stream/asset -> subscription checkout
    цель: предложить эксклюзивный материал подписчикам
    края: ограниченная программа/доступ; отмена подписки; биллинг и исключение из доступа

F15 Автор продвигает проект и смотрит результаты
    S35 -> moderation -> S34
    цель: задать целевую аудиторию, получить дополнительный охват и измерить результат
    края: модерация отклоняет; проект заблокирован от редактирования на время буста; кредит сгорает при поздней отмене

F16 Пользователь сообщает о нарушении или ограничении
    S38 -> report form/support
    цель: пожаловаться на контент/сообщение или понять временное ограничение
    края: действие ограничено автоматически; контент может быть исключен из поиска; апелляция идет через поддержку
```

## 7. Компонентная система

| Компонент | Варианты | Состояния | Где нужен |
| --- | --- | --- | --- |
| Global navigation | guest, creative, hirer | active section, badge, menu open, responsive | все поверхности |
| Search box | query, autocomplete, submit | empty, typing, results, error | S01, S05–S08, S23, S25 |
| Search result tabs | projects, creatives, moodboards, assets | active, disabled/empty | S05–S08 |
| Filter/sort bar | field, tool, color, location, time, sort | closed/open, selected, clear, no matches | S05–S08, S23, S25 |
| Project card | cover, creator, stats, featured/promoted badge | loading, hover, saved, unavailable | feeds, search, profile, moodboards |
| Creator card | avatar, name, fields, location, Follow/Hire | default, following, available, unavailable | S06, S23, S28 |
| Profile header | owner/visitor, Follow, Edit, Hire Me | complete, partial, private/restricted | S10–S12 |
| Project viewer | media blocks, captions, credits, actions | loading, loaded, password wall, removed | S09, S31 |
| Project editor canvas | image, text, grid, video/audio, embed, import | empty, uploading, reorder, validation error | S13–S14 |
| Project settings form | title, cover, fields, tags, tools, license, visibility | incomplete, valid, draft, scheduled, published | S14 |
| Upload/progress control | image/video/archive/asset | idle, progress, success, retry/error | S13, S32 |
| Follow/Appreciate controls | active/inactive | selected, rate limited, disabled | feeds, project, profile |
| Comment thread | inline composer and replies | empty, composing, posted, moderation/limit | S09 |
| Moodboard manager | create, add, reorder, privacy, co-owner | empty, populated, private, full | S18 |
| Inbox/thread list | message, job inquiry, application | unread, read, sent, blocked, report | S20, S27 |
| Notification row | follow, reaction, comment, invite, application | unread/read, navigable | S19 |
| Job listing | type, location, creative field, company | active, saved, expired, reported | S25–S27 |
| Application/inquiry form | job, freelance brief, Hire Me | empty, validation, sent, rejected/limited | S21, S24, S26 |
| Service/asset offer card | samples, price, license, CTA | available, inquiry, sold/unavailable | S22–S23, S31–S32 |
| Analytics chart/card | traffic, location, search, engagement | loading, populated, no data, gated | S34 |
| Promotion flow | audience, estimate, review, results | draft, pending moderation, active, ended, rejected | S35 |
| Toast/empty/error state | success, validation, rate limit, offline | transient/persistent | all interactive screens |

## 8. Предполагаемая модель данных

Поля ниже выведены из публичного интерфейса и справки. Это продуктовая модель для планирования, а не восстановленная внутренняя схема Behance.

```text
User(id, username, display_name, avatar, biography, occupation, company,
     location, website, social_links, work_experience, account_mode,
     availability, pro_status, age/region eligibility flags)
     evidence: S10–S12, S21, S28; confidence high

ProfileSection(id, user_id, type, title, content, visibility, order)
     evidence: S11–S12; confidence medium

Project(id, owner_id, title, description, cover, creative_fields, tags,
        tools, license, visibility, adult_flag, status, scheduled_at,
        published_at, order, stats)
     evidence: S09, S13–S16; confidence high

ProjectBlock(id, project_id, kind, payload/media_id, caption, order)
     evidence: S13, project-editor docs; confidence medium

ProjectCollaborator(project_id, user_id, role, invitation_status, credits)
     evidence: S16; confidence high

Follow(follower_id, creator_id, created_at)
     evidence: S02, S10; confidence high

Appreciation(user_id, project_id, created_at)
Comment(id, project_id, author_id, body, created_at, moderation_state)
     evidence: S09, S19; confidence high/medium

Moodboard(id, owner_id, title, visibility, created_at)
MoodboardItem(id, moodboard_id, project_id?, image_reference?, order)
     evidence: S18; confidence high

Notification(id, user_id, type, actor_id, target_id, read_at, created_at)
     evidence: S19; confidence high

Conversation(id, participant_ids, context_type, context_id, updated_at)
Message(id, conversation_id, sender_id, body, attachment_refs, sent_at, read_at)
     evidence: S20; confidence medium

HireAvailability(user_id, work_types, active, preferences)
Service(id, creator_id, title, description, examples, price_from, category,
        delivery_time, revisions, status)
     evidence: S21–S23; confidence medium/high

FreelanceBrief(id, hirer_id, title, description, budget, timeline, status)
CandidateShortlist(brief_id, creator_id, status)
Proposal(id, brief_id?, service_id?, creator_id, price, terms, status)
     evidence: S24 and freelance help docs; confidence medium

JobPosting(id, poster_id, company, title, type, location, field, description,
           apply_method, external_url?, status, expires_at)
JobApplication(id, job_id, applicant_id, message, status, created_at)
CandidateStage(job_id, creator_id, stage, order)
     evidence: S25–S28; confidence high/medium

Livestream(id, creator_id, title, status, starts_at, ended_at, replay_asset,
           visibility, subscriber_only)
     evidence: S29–S30; confidence low/medium

DigitalAsset(id, project_id, seller_id, file_ref, category, license, price,
             status, payment_provider_ref)
SubscriptionTier(id, creator_id, title, price, benefits, status)
Entitlement(user_id, tier_id, starts_at, ends_at, status)
     evidence: S31–S33; confidence medium, subscription availability uncertain

AnalyticsEvent(id, actor_id?, target_type, target_id, event_type, referrer,
               region, search_term?, created_at)
BoostCampaign(id, project_id, owner_id, audience, status, starts_at, ends_at,
              impressions, interactions, credit_ref)
     evidence: S34–S35; confidence medium

Report(id, reporter_id, target_type, target_id, reason, details, status)
ActionLimit(user_id, action_type, reason, starts_at, expires_at)
     evidence: S38; confidence medium
```

Связи: User 1-n Project/ProfileSection/Service/Job; Project 1-n ProjectBlock/DigitalAsset/Comment; User n-n User через Follow; User n-n Project через Appreciation; Moodboard 1-n MoodboardItem; Conversation n-n User и 1-n Message; JobPosting 1-n JobApplication; FreelanceBrief n-n User через CandidateShortlist; Project 1-n BoostCampaign. Подписки и выплаты требуют платежного провайдера и entitlement-модели.

## 9. Матрица возможностей и приоритеты

Полный список из 52 строк находится в `features.csv`: must — 23, should — 14, could — 11, skip — 4. Приоритеты отражают полноту Behance как продукта, а не обязательный объем первой версии клона:

- **Must:** идентичность, портфолио, публикация, открытие работ, поиск, социальные взаимодействия и безопасные базовые сообщения.
- **Should:** сохранение, уведомления, jobs, простая функция найма, совместное авторство, управление приватностью и аналитика.
- **Could:** платные продукты, эфиры, промо, Recruiter Pro, сложные коммерческие предложения и дополнительные интеграции.
- **Skip:** контент/социальный граф Behance, Adobe-owned активы и закрытая внутренняя система рекомендаций. Эти ресурсы принадлежат платформе и не должны копироваться.

## 10. Что не следует копировать

- Реальные проекты, изображения, профили, имена авторов, пользовательские комментарии и базу Behance.
- Логотипы, фирменную графику, тексты и дизайн-элементы Adobe/Behance; визуальная система клона должна быть оригинальной.
- Закрытые алгоритмы рекомендаций, ранжирования, модерации и подбора кандидатов; строить собственные механизмы.
- Доступ к аккаунтам пользователей, обход ограничений/платежей и приватных страниц.
- Внутренние инструменты модераторов и Adobe, недоступные публично.

## 11. Неизвестное и требующее ручного просмотра

1. Точные текущие экраны и навигация сайта (включая мобильную адаптацию): справка содержит старые и новые версии UI.
2. Реальный editor UX на гостевой/авторской сессии, состояния загрузки, ошибки, autosave, сортировка и восстановление черновика.
3. Полный список поддерживаемых типов и лимитов файлов.
4. Текущая доступность Livestream, Subscriptions, Assets и отдельных вкладок по странам и типам аккаунтов.
5. Полные маршруты в авторизованном Hirer Dashboard, создание команды и детализация управления кандидатами.
6. Текущие правила Adobe login, удаление/экспорт аккаунта, двухфакторная аутентификация, настройки приватности и уведомлений.
7. Точные мобильные состояния, доступность клавиатуры и screen reader, локализации.
8. Реальные лимиты частоты действий и сроки блокировок: намеренно не тестировались.

Эти пункты — список для следующего ручного прохода по пользовательскому аккаунту владельца, если он захочет углубить карту. Пароли или доступ к чужим аккаунтам не нужны.

## 12. Оценка объема

Базовая карта Behance: 38 логических поверхностей и 16 потоков. Для самостоятельного продукта добавлены 8 проектных workspace-поверхностей и 9 проектных потоков; полная модель содержит 72 сущности и 82 группы API-контрактов.  
**Размер: XL** для независимой платформы с сопоставимым широким набором продуктовых доменов. Основные сложные части: media editor и хранение больших файлов; discovery/feed и ранжирование; сеть и уведомления; рабочие inbox/hiring pipelines; безопасность и модерация; платежи, подписки и лицензии; livestream delivery; региональные ограничения и интеграции.

Практический порядок реализации: 1) публичные профили и проекты, 2) создание/публикация, 3) поиск и curated discovery, 4) follow/appreciate/comment/Moodboards, 5) уведомления и inbox, 6) базовый Hire Me/jobs, 7) коммерция и Pro, 8) livestream и интеграции.


## Дополнительно проверенные официальные источники

Материалы ниже проверены 27 октября 2026 года и уточняют меняющиеся части продукта.

| Тема | Официальный источник | Подтверждённое содержание |
|---|---|---|
| Поиск и фильтры | https://help.behance.net/hc/en-us/articles/204483864-Guide-Search-Filter-Creative-Work | Поиск по названию, тегам, имени автора и полю; фильтры по полю, инструментам, цвету и локации. Тело описания не индексируется. |
| Поиск и индексация | https://help.behance.net/hc/en-us/articles/204483624-FAQ-I-published-my-project-but-I-can-t-find-my-project-in-Search-Why-not | Публичность, статус контента и выбранные фильтры влияют на появление проекта в результатах. |
| Публикация проекта | https://help.behance.net/hc/en-us/articles/204483684-Guide-Create-Publish-A-Project | Автор добавляет блоки, выбирает обложку, заголовок и поле, затем сохраняет черновик или публикует; справка сообщает, что проект не автосохраняется. |
| Открытие контента | https://help.behance.net/hc/en-us/articles/204484044-Guide-Discover-Creative-Work-on-Behance | For You объединяет подписки и рекомендации; Search/Explore, Best of Behance и curated galleries — отдельные поверхности. |
| Hire и переключение ролей | https://help.behance.net/hc/en-us/articles/57325844657179-Guide-How-Clients-Find-You-on-Behance | Клиентский режим включает Hiring Dashboard, каталог фрилансеров и услуг и публикацию вакансии; eligibility исполнителя зависит от условий аккаунта и региона. |
| Hire Me | https://help.behance.net/hc/en-us/articles/1260804035970-Guide-Hire-Me-Availability | Автор указывает доступность к полной занятости или фрилансу; рабочие обращения приходят во входящие. |
| Подписки на авторов | https://help.behance.net/hc/en-us/articles/204484424-Guide-Following-Creatives-On-Behance | Новые проекты и действия подписанных авторов могут появляться в For You; действуют лимиты активности. |
| Уведомления | https://help.behance.net/hc/en-us/articles/204483834-Guide-Notifications | Справка перечисляет события подписки, реакции, комментария, приглашения и сообщения. |
| Вакансии | https://help.behance.net/hc/en-us/articles/360033898514-Guide-Creative-Jobs-on-Behance | Отклик может идти внутри сайта или на внешний сайт; справка описывает архивирование объявлений через 30 дней. |
| Behance Pro | https://help.behance.net/hc/en-us/articles/23707936129947-Behance-Pro-FAQ | Расширенная приватность, статистика, продвижение и другие возможности привязаны к плану; условия и цена меняются. |
| Boost | https://help.behance.net/hc/en-us/articles/30644451222427-Guide-Boosting-Your-Projects | Продвижение требует модерации; кампания длится неделю, проект и настройки блокируются во время проверки и кампании. |
| Цифровые Assets | https://help.behance.net/hc/en-us/articles/10768784072731-FAQ-How-do-I-sell-an-asset-on-Behance | Продажа файла связана с проектом и требует категории, лицензии, цены и подключенного платёжного провайдера. |
| Inbox и контакты | https://help.behance.net/hc/en-us/articles/4406583097883-Guide-Inbox-Permissions | Пользователь может ограничить новые прямые сообщения, сохраняя существующие разговоры. |

## Дополнение о выводах для проектирования

- Первая версия должна поддержать цикл «автор публикует кейс → зритель его находит → потенциальный клиент открывает профиль и связывается». Это вывод из сочетания портфолио, поиска и найма.
- Клиентский поиск решает отдельную рабочую задачу, поэтому его стоит моделировать отдельным режимом и навигацией, а не фильтром ленты.
- Редактор и загрузка медиа — ключевой производственный риск. Публичные материалы подтверждают смешанные блоки и явное сохранение; лимиты загрузки требуют дальнейшей проверки.
- Платные функции и цены нестабильны; не включать их в MVP как обязательные возможности.
- Система должна быть оригинальной: собственное ранжирование, карточки и тексты, открытая гарнитура, свои бренд и контент.

---

# Архитектура независимого продукта для творческих портфолио

Документ переводит карту Behance из `recon.md` и приоритеты `features.csv` в план самостоятельного продукта. Архитектура намеренно описывает поведение и типы данных, а не внутреннее устройство Adobe. Стек можно заменить, если команда уже использует другой.

**Сводка:** 38 базовых публично документированных поверхностей и 8 предлагаемых workspace-поверхностей; 16 базовых и 9 проектных потоков; 70 пунктов feature matrix (25 must, 21 should, 20 could, 4 skip); 72 сущности и 82 группы API-контрактов независимого продукта. Самые рискованные части — загрузка и обработка медиа, поиск/рекомендации и платежи с правами доступа.

## Продуктовая граница

Целевая первая версия — веб-площадка, где автор публикует портфолио, а посетитель открывает, ищет и сохраняет проекты. Следующий слой — подписки, сообщения, доступность к найму и вакансии. Платежи, витрина цифровых файлов, расширенный рекрутерский кабинет, продвижение и эфиры остаются отдельными этапами: они добавляют финансовые, модерационные и инфраструктурные обязательства.

Не переносить базу Behance, чужие проекты и профили, бренд, закрытые алгоритмы или Adobe-интеграции. Рекомендации, подбор авторов, контент и редакционная подборка создаются независимо.

## Рекомендуемый стек

| Слой | Выбор | Причина |
|---|---|---|
| Веб-приложение | Next.js App Router и TypeScript | Один проект для публичных страниц и серверных действий; удобная маршрутизация и индексируемые профили |
| Интерфейс | CSS Modules либо Tailwind с собственными токенами | Легко держать оригинальную визуальную систему и адаптивные состояния |
| Данные | PostgreSQL в Supabase | Реляционные связи между авторами, проектами, блоками и реакциями; управляемая БД |
| Доступ | Supabase Auth и RLS | Гостевой просмотр публичных материалов и изоляция черновиков на уровне данных |
| Файлы | Supabase Storage или S3-совместимое хранилище | Отдельное хранение оригиналов и производных изображений, контроль доступа и CDN |
| Поиск | PostgreSQL FTS + trigram на старте; отдельный поисковый сервис при росте | Метаданные можно быстро искать без ранней отдельной инфраструктуры |
| Фоновые задачи | Inngest или управляемые очереди | Обработка медиа, уведомления и очистка временных объектов не должны тормозить публикацию |
| Письма | Resend либо Postmark | Подтверждение адреса, приглашения и уведомления о найме |
| Размещение | Vercel для веба | Подходит для первого web-only релиза; файлы и фоновые операции вынесены в сервисы |
| Платежи | Stripe Connect после проверки доступных стран и обязательств | Только официальный платежный поток с собственным аккаунтом продукта; запускать после юридической и налоговой проверки |

Один Postgres, один веб-проект и несколько фоновых задач. Микросервисы не нужны. Мобильные приложения в этом плане не предусмотрены.

## Контекст и границы доверия

1. Гость читает только опубликованные публичные профили и проекты.
2. Владелец меняет только свои данные и черновики; участники совместного проекта получают права по роли.
3. Приватные ссылки и проекты с паролем проверяются сервером, а не скрытием элемента интерфейса.
4. Админ-модерация — отдельная ограниченная роль с журналом действий.
5. Платежный провайдер хранит платежные реквизиты; приложение хранит только идентификаторы, статусы и суммы.
6. Медиа загружаются по короткоживущим подписанным URL; публичная выдача использует производные изображения.

## Доменная модель

Полная стартовая схема приведена в `schema.sql`. Основные группы:

- Идентичность: `users`, `profiles`, `profile_links`, `profile_sections`.
- Портфолио: `projects`, `project_blocks`, `media_assets`, `project_collaborators`, `project_credits`, `creative_fields`, `creative_tools`, `tags`, `project_colors`, связи проекта с ними.
- Социальный граф: `follows`, `appreciations`, `comments`, `moodboards`, `moodboard_items`, `moodboard_follows`.
- Общение: `conversations`, `conversation_members`, `messages`, `notifications`.
- Найм: `availability`, `services`, `jobs`, `job_applications`, `freelance_briefs`, `brief_invites`, `proposals`, `profile_experience`.
- Доверие и контроль: `reports`, `blocks`, `moderation_actions`, `rate_limit_events`, `audit_events`.
- Поздняя коммерция и измерение: `digital_assets`, `orders`, `creator_subscriptions`, `entitlements`, `boost_campaigns`, `analytics_events`.

Владение совместной работой моделируется отдельными участниками проекта, а не общим текстовым списком. Денежные значения — целые минимальные единицы валюты и ISO-код валюты. Время хранится в UTC как `timestamptz`; показ локального времени выполняется на клиенте.

## Правила доступа к данным

- `users`, профили, опубликованные публичные проекты и публичные подборки читаются без входа.
- Черновики, закрытые подборки, личные сообщения, неопубликованные вакансии и данные платежей доступны только владельцу и разрешенным участникам.
- `project_blocks` наследуют доступ проекта. Нельзя отдавать приватные файлы через открытый CDN URL.
- Для совместной работы сервер проверяет приглашение и активный статус участника при каждой записи.
- Пользователь не может менять роль, статус модерации, оплату, лимиты или счетчики напрямую.
- На Supabase включить RLS для всех пользовательских таблиц. Сервисный ключ не передавать клиенту.
- Критические изменения — публикация, смена владельца, модерация, платежный webhook — пишутся в журнал.

## Маршруты и действия по потокам

| Метод и маршрут | Действие | Доступ | Связанные потоки |
|---|---|---|---|
| `GET /api/search/projects?q=&field=&tool=&color=&location=&sort=` | Поиск публичных проектов | Гость/пользователь | F01 |
| `GET /api/search/creatives?q=` | Поиск публичных профилей | Гость/пользователь | F08 |
| `GET /api/projects/:slug` | Получить публичный проект и блоки | Гость; приватный доступ отдельно | F01 |
| `POST /api/projects` | Создать черновик | Автор | F03 |
| `PATCH /api/projects/:id` | Изменить метаданные/блоки | Владелец/соавтор с правом редактирования | F03–F04 |
| `POST /api/projects/:id/publish` | Проверить и опубликовать | Владелец/разрешенный редактор | F03 |
| `POST /api/media/upload-url` | Выдать временное разрешение на загрузку | Входящий пользователь | F03, F13 |
| `GET /api/creatives/:handle` | Профиль и опубликованное портфолио | Гость/пользователь | F01, F08 |
| `PUT /api/follows/:creatorId` | Подписаться; `DELETE` отменяет | Входящий пользователь | F05 |
| `PUT /api/projects/:id/appreciation` | Поставить реакцию; `DELETE` убрать | Входящий пользователь | F01 |
| `POST /api/projects/:id/comments` | Добавить комментарий | Входящий пользователь; лимит и модерация | F01 |
| `POST /api/moodboards` и `/api/moodboards/:id/items` | Создать подборку и добавить элемент | Владелец | F06 |
| `GET /api/notifications` и `PATCH /api/notifications/:id` | Получить и отметить уведомление | Владелец | F05, F07, F12 |
| `GET /api/inbox` и `POST /api/conversations/:id/messages` | Список разговоров и отправка сообщения | Участник разговора | F08–F12 |
| `POST /api/jobs` / `POST /api/jobs/:id/applications` | Разместить вакансию / откликнуться | Работодатель / кандидат | F11–F12 |
| `POST /api/freelance-briefs` / `POST /api/freelance-briefs/:id/invites` | Создать бриф / пригласить исполнителей | Клиент | F09 |
| `POST /api/reports` / `POST /api/blocks/:userId` | Жалоба / блокировка | Входящий пользователь | F38 |
| `POST /api/webhooks/stripe` | Идемпотентно обновить заказ/подписку | Подпись провайдера | F10, F13–F14 |

Эти маршруты — проектный контракт, а не фактические endpoint Behance. Перед реализацией закрепить схемы входа и выхода OpenAPI или типизированными серверными контрактами.

## Вертикальный срез и этапы

### Этап 0 — фундамент и защита

Собрать регистрацию, сессию, профили и загрузку медиа. Подготовить миграции, RLS, резервное копирование, жалобы и удаление пользовательских данных.

### Этап 1 — портфолио от автора до гостя

Автор создает черновик с медиа-блоками, предварительно просматривает и публикует проект. Гость открывает публичную страницу проекта и профиль автора. Сюда входят S09, S10, S13–S15; таблицы пользователей, профилей, проектов, блоков и файлов.

### Этап 2 — обнаружение и связи

Поиск проектов/авторов, поля и теги; подписки, реакции, комментарии и подборки. S02–S08, S18–S19. Сначала поиск по тексту и явным фильтрам, затем собственная сортировка и рекомендации.

### Этап 3 — коммуникация и найм

Inbox, Hire Me, услуги, публикация вакансий, отклик и управление кандидатами. S20–S28. Внедрить антиспам, жалобы, блокировки, email-доставку и сроки хранения.

### Этап 4 — расширенная экономика

Платежи, предложения, цифровые файлы, подписки и entitlement. Провести проверку прав, налогов, возвратов, стран и возрастных ограничений до включения продажи.

### Этап 5 — Pro и медиа реального времени

Аналитика, продвижение, кастомизация, трансляции и Recruiter workspace — только когда есть владельцы модерации, поддержка и бюджет на медиадоставку.

## Критические технические риски

1. **Загрузка больших медиа.** Прямая загрузка в объектное хранилище, ограничения размера и типа, антивирусная/безопасностная проверка, конвертация в очередь, повторяемые задачи и удаление сиротских файлов.
2. **Поиск и рекомендации.** Не копировать внутреннее ранжирование. Начать с объяснимой релевантности по заголовку, тегам и полю, затем измерять качество своего ранжирования.
3. **Совместное редактирование.** Явные роли, оптимистическая блокировка/версия документа и приглашения с истечением срока.
4. **Безопасность социальной активности.** Ограничивать частоту, ловить повторяющееся поведение, блокировать контакт, обрабатывать жалобы и сохранять аудит.
5. **Платежи и права.** Обрабатывать повторные webhook события идемпотентно; не отмечать заказ оплаченным только из браузерного ответа; учитывать возврат и отзыв доступа.
6. **Удаление аккаунта и персональных данных.** Спроектировать удаление/обезличивание и сроки хранения до запуска сообщений и платежей.
7. **Производительность медиа-страниц.** Адаптивные изображения, lazy loading, размеры до скачивания, alt-текст и CDN-кэширование.

## План API и заданий

- **Поиск:** индексировать только публичные записи; обновлять индекс после публикации, смены приватности и удаления. Фильтры должны комбинироваться предсказуемо.
- **Файлы:** временная задача преобразует исходник в thumbnail и веб-версии; повтор обработки не создает дубли.
- **Уведомления:** события Follow, Appreciate, Comment, Invitation, Application и Message складываются в outbox; email-предпочтения учитываются отдельно от in-app.
- **Платежи:** webhook сначала сохраняется в `webhook_events` с уникальным id провайдера, затем транзакционно меняет заказ/entitlement.
- **Очистка:** отмененные загрузки, просроченные приглашения, черновики с истекшим сроком хранения и временные URL.

## Что принять до разработки

- Кто является первой целевой стороной: дизайнер-фрилансер, студия или арт-директор?
- Поддерживается ли только web, и какой язык нужен в MVP?
- Какой рынок/страны поддерживаются и нужны ли реальные платежи?
- Нужна ли выдача вакансий в первой версии или достаточно портфолио и контакта?
- Какова политика лицензий, жалоб, модерации и удаления?

Рекомендуемое следующее действие: утвердить этап 1, рынки и стек; после этого превратить этапы в короткие задачи и реализовать первую сквозную историю.


## Дизайн-токены

Стартовые значения темы для независимого продукта. Цвета Behance не измерялись и не воспроизводятся.

| Роль | Значение |
|---|---|
| bg | #F8F8F7 |
| surface | #FFFFFF |
| surfaceSubtle | #F0F1F2 |
| border | #D8DADD |
| borderInput | #747B83 |
| text | #20252B |
| textMuted | #59636E |
| accent | #315CCB |
| onAccent | #FFFFFF |
| danger | #B42318 |
| success | #087443 |
| warning | #8A4B08 |
| focus | #315CCB |

Типографика: Inter/Arial, шкала 12, 14, 16, 20, 24, 32 и 40 px; базовые отступы 4–64 px; радиусы 6, 10 и 16 px; сетка контента до 1280 px, чтение до 760 px; контрольные ширины 640, 900 и 1200 px.

# Спецификация компонентов

Визуальные значения — самостоятельный стартовый язык продукта из `tokens.json`, а не попытка воспроизвести фирменные материалы Behance. Все элементы должны сохранять управление с клавиатуры и понятные имена для скринридеров.

## Базовые компоненты

| Компонент | Варианты и размеры | Состояния | Использование |
|---|---|---|---|
| Button | primary, secondary, quiet, danger; 32/40/48 px | hover, pressed, focus-visible, disabled, loading | Формы, редактор, найм |
| IconButton | 32/40 px; всегда с доступным именем | hover, focus, disabled, tooltip | Карточки, навигация, действия |
| TextField / TextArea | sm/md; label + helper/error | empty, filled, focus, invalid, disabled | Поиск, профиль, комментарии, сообщения |
| Select / FilterChip | single/multi-select; clearable | open, selected, disabled, focus | Поиск, поля, инструменты, цвет |
| ProjectCard | image, compact, featured editorial | loading, image error, hover, saved, unavailable | Discover, поиск, профиль, подборки |
| CreatorCard | compact/full; follow/hire action | following, loading, unavailable for hire | Поиск авторов и каталог найма |
| Avatar | xs/sm/md/lg; fallback initials | loading, missing image | Профиль, авторство, переписка |
| ProfileHeader | owner/visitor; with/without availability | loading, empty, follow state, contact state | Публичная страница автора |
| ProjectViewer | image/text/grid/video/embed blocks | loading, blocked, removed, restricted, broken media | S09/S15 |
| ProjectEditor | блоки текста, изображения, сетки, видео, embed | saved, dirty, uploading, upload error, invalid, preview | S13/S14 |
| UploadDropzone | single/multiple; media type hints | idle, drag-over, uploading, processing, failed, rejected | Редактор и файлы |
| CommentThread | flat list; own/other/moderated | loading, empty, sending, rate-limited, hidden | Проекты |
| MoodboardGrid | public/private; reorder mode for owner | empty, loading, private, item removed | S18 |
| NotificationRow | actor + event + target | unread, read, removed target | S19 |
| ConversationList / MessageBubble | inbound/outbound; context badge | unread, sending, failed, blocked, empty | S20 |
| JobCard / ApplicationStage | compact/detail; stage pill | active, expired, applied, external apply | S25–S28 |
| Dialog / Drawer / Toast | confirm, form, error, success | open, close, pending, validation error | Общие действия |
| ReportDialog | target-aware reason list | selecting, submitted, already reported | Доверие и безопасность |

## Состояния и доступность

- Видимый focus ring толщиной 2 px, контрастный к фону и компоненту.
- Ошибки у полей сообщаются текстом и связаны с полем через `aria-describedby`; цвет сам по себе не кодирует проблему.
- Loading сохраняет имя и контекст действия; кнопка не становится молча пустой.
- Пустое состояние объясняет следующий полезный шаг и не имитирует ошибку.
- Публичные изображения получают осмысленный alt, декоративные — пустой alt; редактирование alt доступно автору.
- Диалоги удерживают фокус, закрываются Escape там, где это безопасно, и возвращают фокус вызвавшему элементу.
- Сортируемые редакторские блоки доступны клавиатуре и имеют альтернативные кнопки перемещения вверх/вниз.
- Видео/аудио имеют субтитры или текстовое описание, когда автор их предоставляет; медиа не запускаются со звуком автоматически.
- Минимальные интерактивные цели 40×40 px на touch; адаптивная навигация не скрывает ключевые действия.

## Поведение страниц

- Проектные сетки имеют устойчивое соотношение карточек; высота карточек не скачет при загрузке изображений.
- Поиск сохраняет выбранные фильтры в URL, чтобы ссылку можно было передать.
- Профиль и проект показывают автора, поля и контекст без перегруженной служебной информации.
- Hire action имеет доступное текстовое состояние и приводит к короткой форме контекста обращения.
- Черновик проекта помечает несохраненные изменения и требует подтверждения при уходе со страницы.
- Приватная подборка/проект показывает ясный экран доступа, не раскрывая содержимое в превью или метаданных.

## Дизайн-решения до реализации

1. Подтвердить оригинальное имя, акцентный цвет и голос после этапа исследования аудитории.
2. Создать референсный набор оригинальных карточек и медиа; не переносить проекты или графику Behance.
3. Проверить каждый текстовый/фоновый вариант контраста по WCAG AA перед выпуском.
4. Снять мобильные размеры на целевых страницах и протестировать длинные заголовки, RTL/локализацию при необходимости.
5. Сначала отрисовать компоненты без брендовых иллюстраций и проверить фокус/ошибки/загрузку.


## Приложение SQL

```sql
-- Независимый эскиз схемы для продукта портфолио.
-- Это стартовый проектный вариант, а не схема Behance/Adobe.
create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  handle text not null unique,
  account_status text not null default 'active' check (account_status in ('active','suspended','deletion_pending','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table profiles (
  user_id uuid primary key references users(id) on delete cascade,
  display_name text not null,
  headline text,
  biography text,
  location text,
  avatar_media_id uuid,
  cover_media_id uuid,
  availability text not null default 'unavailable' check (availability in ('unavailable','full_time','freelance','both')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_location_idx on profiles(location);

create table profile_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  label text not null,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index profile_links_user_idx on profile_links(user_id, position);

create table profile_experience (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  organization text not null,
  role_title text not null,
  description text,
  started_on date,
  ended_on date,
  position integer not null default 0,
  check (ended_on is null or started_on is null or ended_on >= started_on)
);
create index profile_experience_user_idx on profile_experience(user_id, position);

create table profile_sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  section_type text not null,
  title text not null,
  visibility text not null default 'public' check (visibility in ('public','private')),
  position integer not null default 0,
  settings jsonb not null default '{}'
);
create index profile_sections_user_idx on profile_sections(user_id, position);

create table media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  storage_key text not null unique,
  mime_type text not null,
  bytes bigint not null check (bytes >= 0),
  width integer,
  height integer,
  duration_ms bigint,
  alt_text text,
  processing_state text not null default 'pending' check (processing_state in ('pending','processing','ready','failed','deleted')),
  created_at timestamptz not null default now()
);
create index media_assets_owner_idx on media_assets(owner_id, created_at desc);
alter table profiles add constraint profiles_avatar_media_fk foreign key (avatar_media_id) references media_assets(id) on delete set null;
alter table profiles add constraint profiles_cover_media_fk foreign key (cover_media_id) references media_assets(id) on delete set null;

create table projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  cover_media_id uuid references media_assets(id) on delete set null,
  visibility text not null default 'draft' check (visibility in ('draft','public','private','link_only','password','scheduled','removed')),
  adult_content boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','scheduled','archived','moderation_hold')),
  scheduled_at timestamptz,
  published_at timestamptz,
  view_count bigint not null default 0 check (view_count >= 0),
  appreciation_count bigint not null default 0 check (appreciation_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_owner_idx on projects(owner_id, updated_at desc);
create index projects_public_idx on projects(published_at desc) where status = 'published' and visibility = 'public';
create index projects_search_idx on projects using gin (to_tsvector('simple', coalesce(title,'')));

create table project_blocks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  kind text not null check (kind in ('text','image','gallery','video','audio','embed','prototype','file')),
  media_id uuid references media_assets(id) on delete set null,
  payload jsonb not null default '{}',
  caption text,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, position)
);
create index project_blocks_project_idx on project_blocks(project_id, position);

create table project_collaborators (
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('owner','editor','viewer')),
  invite_status text not null default 'pending' check (invite_status in ('pending','accepted','declined','revoked')),
  invited_by uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  primary key(project_id, user_id)
);
create index project_collaborators_user_idx on project_collaborators(user_id, invite_status);

create table project_credits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  credit_name text not null,
  credit_role text not null,
  position integer not null default 0
);
create index project_credits_project_idx on project_credits(project_id, position);

create table creative_fields (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null
);
create table project_fields (
  project_id uuid not null references projects(id) on delete cascade,
  field_id uuid not null references creative_fields(id) on delete restrict,
  primary key(project_id, field_id)
);
create table creative_tools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null
);
create table project_tools (
  project_id uuid not null references projects(id) on delete cascade,
  tool_id uuid not null references creative_tools(id) on delete restrict,
  primary key(project_id, tool_id)
);
create index project_tools_tool_idx on project_tools(tool_id, project_id);
create table project_colors (
  project_id uuid not null references projects(id) on delete cascade,
  color_hex char(7) not null check(color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  primary key(project_id, color_hex)
);
create index project_colors_color_idx on project_colors(color_hex, project_id);
create table tags (
  id uuid primary key default gen_random_uuid(),
  label text not null unique
);
create table project_tags (
  project_id uuid not null references projects(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete restrict,
  primary key(project_id, tag_id)
);
create index project_tags_tag_idx on project_tags(tag_id, project_id);

create table follows (
  follower_id uuid not null references users(id) on delete cascade,
  creator_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(follower_id, creator_id),
  check(follower_id <> creator_id)
);
create index follows_creator_idx on follows(creator_id, created_at desc);

create table appreciations (
  user_id uuid not null references users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, project_id)
);
create index appreciations_project_idx on appreciations(project_id, created_at desc);

create table comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  body text not null check (length(body) between 1 and 5000),
  moderation_state text not null default 'visible' check (moderation_state in ('visible','pending','hidden','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index comments_project_idx on comments(project_id, created_at);
create index comments_author_idx on comments(author_id, created_at desc);

create table moodboards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  visibility text not null default 'public' check (visibility in ('public','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index moodboards_owner_idx on moodboards(owner_id, updated_at desc);
create table moodboard_items (
  id uuid primary key default gen_random_uuid(),
  moodboard_id uuid not null references moodboards(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  media_id uuid references media_assets(id) on delete set null,
  added_by uuid not null references users(id) on delete cascade,
  position integer not null,
  created_at timestamptz not null default now(),
  check ((project_id is not null)::int + (media_id is not null)::int = 1),
  unique(moodboard_id, position)
);
create index moodboard_items_board_idx on moodboard_items(moodboard_id, position);
create table moodboard_follows (
  user_id uuid not null references users(id) on delete cascade,
  moodboard_id uuid not null references moodboards(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, moodboard_id)
);
create index moodboard_follows_board_idx on moodboard_follows(moodboard_id, created_at desc);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  context_type text check (context_type in ('direct','hire','job','brief','service')),
  context_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table conversation_members (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  last_read_at timestamptz,
  muted_at timestamptz,
  primary key(conversation_id, user_id)
);
create index conversation_members_user_idx on conversation_members(user_id, conversation_id);
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  body text not null check(length(body) between 1 and 10000),
  attachments jsonb not null default '[]',
  moderation_state text not null default 'visible' check (moderation_state in ('visible','hidden','removed')),
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on messages(conversation_id, created_at);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  actor_id uuid references users(id) on delete set null,
  event_type text not null,
  target_type text not null,
  target_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_unread_idx on notifications(user_id, created_at desc) where read_at is null;

create table availability (
  user_id uuid primary key references users(id) on delete cascade,
  active boolean not null default false,
  work_types text[] not null default '{}',
  preferences jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
create table services (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  price_from_minor bigint,
  currency char(3),
  delivery_days integer,
  status text not null default 'draft' check (status in ('draft','published','paused','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((price_from_minor is null) = (currency is null))
);
create index services_creator_idx on services(creator_id, status);
create index services_browse_idx on services(category, created_at desc) where status = 'published';

create table jobs (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references users(id) on delete restrict,
  company_name text,
  title text not null,
  employment_type text not null check (employment_type in ('full_time','part_time','contract','freelance')),
  location text,
  description text not null,
  application_method text not null check (application_method in ('internal','external')),
  external_url text,
  status text not null default 'draft' check (status in ('draft','published','expired','archived','removed')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((application_method = 'external') = (external_url is not null))
);
create index jobs_browse_idx on jobs(status, expires_at desc, location);
create table job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  applicant_id uuid not null references users(id) on delete cascade,
  message text,
  status text not null default 'submitted' check (status in ('submitted','reviewing','shortlisted','rejected','withdrawn')),
  created_at timestamptz not null default now(),
  unique(job_id, applicant_id)
);
create index job_applications_job_idx on job_applications(job_id, created_at desc);
create index job_applications_applicant_idx on job_applications(applicant_id, created_at desc);
create table job_fields (
  job_id uuid not null references jobs(id) on delete cascade,
  field_id uuid not null references creative_fields(id) on delete restrict,
  primary key(job_id, field_id)
);
create index job_fields_field_idx on job_fields(field_id, job_id);

create table freelance_briefs (
  id uuid primary key default gen_random_uuid(),
  hirer_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text not null,
  budget_min_minor bigint,
  budget_max_minor bigint,
  currency char(3),
  timeline text,
  status text not null default 'draft' check (status in ('draft','open','closed','cancelled')),
  created_at timestamptz not null default now(),
  check (budget_min_minor is null or budget_max_minor is null or budget_min_minor <= budget_max_minor)
);
create table brief_invites (
  brief_id uuid not null references freelance_briefs(id) on delete cascade,
  creator_id uuid not null references users(id) on delete cascade,
  status text not null default 'invited' check (status in ('invited','viewed','interested','declined','expired')),
  created_at timestamptz not null default now(),
  primary key(brief_id, creator_id)
);
create table proposals (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references users(id) on delete restrict,
  hirer_id uuid not null references users(id) on delete restrict,
  brief_id uuid references freelance_briefs(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  amount_minor bigint not null check(amount_minor >= 0),
  currency char(3) not null,
  terms text not null,
  status text not null default 'draft' check(status in ('draft','sent','accepted','declined','withdrawn','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(num_nonnulls(brief_id, service_id) = 1)
);
create index proposals_creator_idx on proposals(creator_id, status, created_at desc);
create index proposals_hirer_idx on proposals(hirer_id, status, created_at desc);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references users(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open','reviewing','actioned','dismissed')),
  created_at timestamptz not null default now()
);
create index reports_queue_idx on reports(status, created_at);
create table blocks (
  blocker_id uuid not null references users(id) on delete cascade,
  blocked_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker_id, blocked_id),
  check(blocker_id <> blocked_id)
);
create table moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid references users(id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  action text not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create table rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  action_type text not null,
  decision text not null check(decision in ('allowed','throttled','blocked')),
  reason text,
  created_at timestamptz not null default now()
);
create index rate_limit_events_user_idx on rate_limit_events(user_id, action_type, created_at desc);
create table audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_events_target_idx on audit_events(target_type, target_id, created_at desc);

-- Поздние модули. Включать только после правового и операционного review.
create table digital_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  seller_id uuid not null references users(id) on delete restrict,
  file_id uuid not null references media_assets(id) on delete restrict,
  title text not null,
  category text not null,
  license text not null,
  price_minor bigint not null check(price_minor >= 0),
  currency char(3) not null,
  status text not null default 'draft' check(status in ('draft','published','paused','removed')),
  created_at timestamptz not null default now()
);
create index digital_assets_project_idx on digital_assets(project_id, status);
create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references users(id) on delete restrict,
  asset_id uuid references digital_assets(id) on delete set null,
  provider text not null,
  provider_order_id text not null unique,
  amount_minor bigint not null check(amount_minor >= 0),
  currency char(3) not null,
  status text not null check(status in ('pending','paid','refunded','failed','disputed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table webhook_events (
  provider text not null,
  provider_event_id text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  payload jsonb not null,
  primary key(provider, provider_event_id)
);
create table creator_subscriptions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references users(id) on delete cascade,
  member_id uuid not null references users(id) on delete cascade,
  provider_subscription_id text not null unique,
  status text not null check(status in ('trialing','active','past_due','cancelled','ended')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
create index creator_subscriptions_member_idx on creator_subscriptions(member_id, status);
create table entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  resource_type text not null,
  resource_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  source_type text not null,
  source_id uuid,
  created_at timestamptz not null default now(),
  check(ends_at is null or ends_at > starts_at)
);
create index entitlements_user_resource_idx on entitlements(user_id, resource_type, resource_id, starts_at, ends_at);
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  event_type text not null,
  referrer text,
  region text,
  search_term text,
  occurred_at timestamptz not null default now()
);
create index analytics_events_target_idx on analytics_events(target_type, target_id, occurred_at desc);
create table boost_campaigns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references users(id) on delete cascade,
  audience jsonb not null default '{}',
  goal text not null check(goal in ('discovery','hiring')),
  status text not null check(status in ('draft','review','active','completed','rejected','cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index one_live_boost_per_project on boost_campaigns(project_id) where status in ('review','active');


```

# Расширение исследования: детализация публичного интерфейса

## Что именно было недостаточно в первой версии

Первая карта использовала слово «экран» для крупных функциональных поверхностей. В ней не были перечислены все варианты состояния одной страницы, не было журнала фактического осмотра интерфейса и у многих потоков не хватало шагов, условий входа, результата и точек отказа. Поэтому 38 пунктов следует читать как **38 логических поверхностей**, а не как полный список всех страниц и состояний. Это приложение исправляет терминологию и добавляет проверяемую детализацию. Полную инвентаризацию авторизованных страниц можно завершить после входа владельца аккаунта.

## Метод и границы наблюдения

| Метка | Значение | Как использовать |
|---|---|---|
| Наблюдалось публично | Элемент непосредственно отображался в открытом сайте 27.10.2026 без входа | Подтверждает наличие элемента на этой дате; не доказывает доступность после входа или во всех регионах |
| Подтверждено справкой | Описано в официальной справке Behance/Adobe | Может отражать другой вариант интерфейса или отставать от обновлений |
| Проектная гипотеза | Предложение для самостоятельного продукта | Не приписывать Behance как факт |
| Не проверено | Требует аккаунта, другого состояния или актуальной проверки | Не превращать в спецификацию без исследования |

Осмотр был неинвазивным: просмотр страниц и панелей, без отправки форм, сохранения элементов, откликов на вакансии, публикаций, покупок, сообщений и настройки cookies. Числа выдачи, счетчики и содержание вакансий — изменяемые данные на момент осмотра. Cookie-баннер отображался поверх страницы; выбор согласия не делался.

## Журнал наблюдений в открытом интерфейсе

### 1. Главная и вход в поиск

- Главный заголовок позиционирует Behance как место для показа работ, поиска вдохновения и найма творческих специалистов.
- В верхней навигации видны разделы Explore, Jobs, Resources, Hire, Share Work и вход в аккаунт.
- Главный экран предлагает поиск по Projects и People, дополнительную настройку поиска, сортировку Recommended и открытие фильтров.
- Список тематик охватывает дизайн, иллюстрацию, фотографию, 3D, motion, архитектуру, продуктовый дизайн, моду, рекламу, fine arts, crafts, game design, sound и инструменты Adobe. Список длиннее одной строки меню и работает как тематическая навигация.
- Гостевой доступ ограничен: на выдаче появляется приглашение войти или зарегистрироваться, чтобы просматривать больше проектов. Это наблюдение не раскрывает точные лимиты.
- Футер разделяет ссылки для творческих специалистов, клиентов и общие ссылки Behance: Pro, поиск вдохновения, услуги, публикация вакансий, каталоги профессий, About, Apps, Blog и Help.

### 2. Поиск проектов и карточки выдачи

- Панель фильтра содержит Creative Fields, Availability, Location, Tools и Color. Это прямое наблюдение интерфейса; поля фильтра не следует без проверки считать одинаковыми для каждой вкладки поиска.
- Карточка результата объединяет обложку, название, автора, просмотры/реакции и действие сохранения в Moodboard. Возможны отметки подборки редакции, Pro и нескольких авторов.
- В доступной гостю выдаче на момент осмотра показывалось «10,000+» проектов. Значение динамическое и не является характеристикой продукта.
- Официальная справка дополняет наблюдение: поиск работ использует название, теги, имя автора и creative field; среди фильтров перечислены поле, инструменты, цвет и локация. Описание проекта, согласно справке, не индексируется поиском.
- Сортировка Recommended наблюдалась в интерфейсе. Остальные варианты сортировки перечислены в справке и могут меняться; перед реализацией нужно сверить текущий видимый список.

### 3. Проект в просмотрщике

- Открытие карточки показало проект как модальный/переходный просмотр поверх каталога с действиями Next, Follow, Hire, Tools, Save, Share и Appreciate.
- Контент складывается в последовательность из нескольких визуальных и текстовых блоков; просмотрщик также содержит автора, creative fields, теги, дату, счетчики, комментарии и связанные проекты.
- В наблюдавшемся проекте были 12 блоков контента, список инструментов и creative fields; это характеристика конкретного проекта, а не ограничение редактора.
- Были видны комментарии и приглашение войти, чтобы участвовать в разговоре. В карточке отображалась кнопка Report.
- Счетчики реакций/просмотров изменились между загрузками. Не использовать точные значения из снимка как постоянные.
- Не исследованы: закрытие/возврат в точное место ленты на всех устройствах, клавиатурная навигация, варианты приватности, возрастные проверки, парольные проекты и поведение при удалении автора.

### 4. Каталог вакансий: открытое состояние

- Навигация Jobs открывает отдельный каталог. На снимке 27.10.2026 отображались вкладки All Jobs, Freelance PRO и Full-Time, кнопка New Job, поиск, фильтр и сортировка Best Match.
- В видимом списке смешаны вакансии полной занятости и freelance; карточки могут показывать компанию/контакт, локацию или Remote, тип занятости, сумму и период оплаты, значки PRO/Verified Organization, Save и меню действий.
- Слева каталог, справа — подробная выбранная вакансия. В URL присутствует jobId; у вакансии видны название и организация, локация и формат, кнопка отклика, сохранение, описание с разделами и списками требований, нанимающий контакт, дата размещения и creative fields.
- У наблюдавшейся вакансии Apply вел на внешний сайт компании. Следовательно, переход от Behance к процессу найма может менять домен; статус заявки может не быть известен Behance.
- Панель Filter открывалась сбоку и показывала Filter type с двумя вариантами: Freelance и Full-Time, счетчик выбранных вариантов и действия Apply/Reset Filters. На открытом снимке кнопка Apply была неактивна до изменения фильтра.
- В доступном гостевом состоянии панель списка и панель выбранной вакансии могут оставаться видимыми одновременно; отдельная cookie-плашка перекрывала нижнюю часть страницы.
- На момент снимка заголовок списка показывал 1,079 jobs. Это временное число, не функциональное требование.
- Не проверено: реальная отправка отклика, сохранение вакансии, создание новой вакансии, состояние оплаты/публикации, детальные фильтры сверх видимых двух типов и доступные гостю лимиты.

### 5. Hire a Freelancer — открытый мастер

- Публичная кнопка Hire a Freelancer открывает пошаговый мастер «What are you hiring for?».
- Виден индикатор прогресса (на первом шаге — 16.67%), поле выбора типа работы и действие продолжения/поиска. Есть отдельный переход к найму на полный рабочий день.
- Текст обещает рекомендации и AI-сопоставление с фрилансерами и ссылается на условия Adobe Generative AI.
- Без входа и заполнения брифа дальнейшие шаги не исследовались. Бриф не вводился и не отправлялся; нельзя утверждать точные поля, алгоритм подбора, цену или гарантию ответа.

### 6. Вход и ограничения гостя

- Для взаимодействия с комментариями сайт предлагает войти/зарегистрироваться; в открытом диалоге перечислялись Google, Facebook, Apple и email.
- Часть выдачи доступна гостю, но сайт сообщает о необходимости аккаунта, чтобы увидеть больше результатов.
- Нельзя делать вывод, что все профили, проекты, вакансии и функции имеют одинаковую гостевую политику. Материалы, видимость, страна и тип аккаунта могут менять результат.

## Публичная карта навигации и связей

```text
Главная / Discover
├─ Поиск
│  ├─ Projects → карточка → Project viewer → профиль автора
│  ├─ People → профиль автора
│  ├─ Moodboards → подборка → автор подборки
│  └─ Assets (наличие и UX требуют повторной проверки)
├─ Категории / Best of Behance → галерея поля → карточка проекта
├─ Jobs
│  ├─ All Jobs / Freelance PRO / Full-Time
│  ├─ поиск → список → выбранная вакансия
│  ├─ фильтр типа → Apply / Reset
│  └─ Apply → внутренний или внешний процесс (зависит от вакансии)
├─ Hire
│  ├─ Hire a Freelancer → мастер брифа → рекомендации (после входа, не исследовано)
│  └─ полный найм → отдельный путь
└─ Share Work
   ├─ Project editor → черновик / предпросмотр / публикация
   └─ WIP (временный контент)

Профиль автора
├─ Work → Project viewer
├─ Follow → For You / уведомления
├─ Hire Me / Services → обращение или заказ
├─ Moodboards / Assets / Subscriber Area / Stats (условная доступность)
└─ Report (модерация)
```

Схема объединяет наблюдавшиеся публичные переходы и поверхности из официальной справки. Это карта связей функций, а не гарантированный полный список маршрутов сайта.

## Спецификация ключевых потоков по шагам

| Поток | Предусловие | Последовательность | Успех и данные | Края и ограничения |
|---|---|---|---|---|
| Найти проект гостем | Открытая главная | Выбрать Projects → ввести запрос или категорию → применить доступные фильтры → открыть карточку | Открыт проект; запрос, вкладка, фильтры и источник перехода могут сохраняться в URL/сессии (проектное решение) | Нулевой результат, фильтры исключили проект, контент скрыт, гостевой лимит, проект удален |
| Найти автора | Главная/поиск | Выбрать People → запрос → изучить выдачу → открыть профиль | Профиль открыт; можно перейти к проектам автора | Нет совпадений, неоднозначное имя, профиль ограничен или отсутствует |
| Просмотреть кейс | Карточка проекта | Открыть → просмотреть блоки → открыть теги/профиль/связанные проекты | Просмотр контента и переходы; собственный продукт может считать просмотры с дедупликацией | Медиа не загрузилось, проект приватный/удален, блокировка или возрастной экран |
| Сохранить вдохновение | Вход и доступ к сохранению (официальная справка описывает Moodboards) | Выбрать Save → выбрать/создать доску → подтвердить | Связь project/image с Moodboard | Гость должен войти; доска закрытая; элемент удален; повторное сохранение |
| Подписаться на автора | Доступный профиль | Нажать Follow → войти при необходимости → подтвердить состояние | Создана связь follower→creative; лента может учитывать автора | Ограничение частоты, блокировка, деактивация, отмена подписки |
| Взаимодействовать с проектом | Открытый проект | Appreciate / комментарий / Share → при необходимости вход → выполнить действие | Реакция, комментарий либо системное меню Share | Антиспам, закрытые комментарии, удаленный проект, ошибка сети; Share может быть нативным/копированием ссылки |
| Опубликовать кейс | Авторская сессия | Share Work → собрать блоки → обложка/заголовок/creative field → теги и кредиты → Preview → Save Draft или Publish | Создан/обновлен проект и публичная версия; справка предупреждает, что автосохранения может не быть | Потеря несохраненных изменений, обязательное поле, неподдерживаемый файл, сетевой сбой, отказ модерации |
| Подать заявку на вакансию | Профиль кандидата и открытая вакансия | Jobs → поиск/фильтры → открыть вакансию → Apply → внутренний apply или внешний сайт работодателя | Внешняя передача или заявка, если она поддерживается; состояние не всегда доступно Behance | Срок истек, внешний сайт недоступен, вакансия подозрительна, повторная заявка запрещена |
| Найти фрилансера | Клиентская сессия, доступ к Hire | Hire → тип работы/бриф → предпочтения → просмотр подбора → открыть профили → связаться | Сформирован список кандидатов; создается обращение только по явному действию пользователя | Не отправлять неполный/чувствительный бриф; мало совпадений; автор недоступен; региональные ограничения |
| Ответить на запрос клиента | Автор получает обращение | Inbox → открыть разговор → проверить бриф → ответить/отклонить → согласовать объем | Сообщение/проектная договоренность | Inbox permissions, ограничение новых сообщений, спам-фильтр, отсутствие оплаты в регионе |
| Создать вакансию | Клиент/организация, имеющие право публикации | New Job → форма → предварительный просмотр → условия размещения/оплата, если требуется → отправить на публикацию | Job и статус публикации/модерации | Неавторизованная организация, невалидные условия, платеж/проверка, отклонение/истечение |
| Сохранить вакансию | Каталог и аккаунт | Save → вход при необходимости → проверить сохраненное состояние → открыть сохраненные вакансии | Связь аккаунта с Job | Гостевой лимит, вакансия истекла, повторное сохранение, синхронизация между устройствами |
| Boost проекта | Доступная Pro-функция | Выбрать проект → аудитория/условия → review → модерация → запуск → результаты | Кампания и агрегированная статистика | Не прошла модерацию; проект временно нельзя менять; бюджет/кредит; география |
| Продать Asset | Допущенный аккаунт и платёжный провайдер | Привязать файл → категория/лицензия/цена → проверка → публикация → покупка/доставка | Листинг и транзакция с правами на файл | Валюта, налог, платежный провайдер, спор/возврат, неподдерживаемый тип файла |
| Подать жалобу | Меню контента/профиля | Report → выбрать причину → предоставить контекст → отправить → получить статус/канал апелляции | Жалоба с target, reason, evidence и статусом | Ложное/злоупотребительное сообщение; конфликт интересов; контент уже удален |

Последовательности, отмеченные как проектные решения, нужно валидировать на самостоятельном продукте. Они не утверждают наличие каждого шага в текущем Behance.

## Матрица состояний для ключевых поверхностей

| Поверхность | Начальное | Загрузка | Успех | Пусто | Ошибка | Действие требует входа |
|---|---|---|---|---|---|---|
| Поиск проектов | Нет запроса; рекомендации/категории | Skeleton карточек и фильтров | Сетка карточек и счетчик | Нет совпадений, очистить фильтры | Повторить запрос, сохранить критерии | Follow, appreciate, comment, часть выдачи/сохранение |
| Поиск людей | Пустое поле и подсказка | Skeleton профилей | Список/сетка творческих специалистов | Нет авторов по запросу | Ошибка поиска | Follow, message, часть каталога |
| Project viewer | Skeleton/обложка | Медиа-загрузка по блокам | Все блоки, кредиты, автор, реакции | Пустой/снятый проект | Ошибка одного блока с повтором | Appreciate, comment, save, follow, message |
| Профиль | Аватар/имя и каркас | Секции загружаются | Work и заполненные секции | Нет опубликованных работ | Профиль скрыт/недоступен | Follow, message, просмотр закрытых секций |
| Редактор проекта | Новый пустой draft | Upload progress на блоках | Предпросмотр и сохранение | Пустой проект | Ошибка загрузки/валидации | Только автор и участники с правом редакции |
| Jobs list | All Jobs, Best Match | Skeleton строк | Список с выбранной карточкой | Нет вакансий | Retry; сохранить фильтры | Save, Apply, New Job зависят от действия/аккаунта |
| Job detail | Выбранная вакансия или пустое состояние | Описание/организация загружаются | Требования, location, type, contact, Apply | Вакансия закрыта | Недоступна / внешний домен не отвечает | Save, Apply, сообщение нанимающему |
| Hire brief | Первый шаг, прогресс | Подбор рекомендаций | Список кандидатов/следующий шаг | Нет подходящих кандидатов | Не удалось подобрать — изменить критерии | Создание и отправка брифа |
| Inbox | Список разговоров | Загрузка сообщений | Thread и composer | Нет разговоров | Не отправлено; повтор | Отправка/получение сообщений |
| Moodboards | Список досок | Обложки/элементы загружаются | Доски и элементы | Нет досок | Ошибка загрузки | Создание/изменение/добавление |
| Report | Причины жалобы | Отправка | Подтверждение и номер обращения | — | Сохранить введенный текст и повторить | Вход/антиспам могут требоваться |

## Рекомендуемая детализация поверхностям самостоятельного продукта

Ниже указаны поля/механики для воспроизведения **функционального класса**, а не копирования фирменного UI.

| Поверхность | Состав данных | Основные действия | Важная логика |
|---|---|---|---|
| Global navigation | текущий раздел, роль, уведомления | Explore, Jobs, Hire, Share, профиль | Навигация перестраивается по роли; адаптивное меню сохраняет доступ к главным действиям |
| Search | query, tab, filters, sort, cursor | ввод, очистка, фильтр, сортировка | URL отражает состояние; back/forward восстанавливают выдачу; debounce и отмена предыдущего запроса |
| Project card | cover, title, owner(s), fields, stats, badges | открыть, save, menu | Доступность обложки и текста; счетчики не должны сдвигать карточку при загрузке |
| Project viewer | блоки, подписи, кредиты, поля, теги, owner | next/previous, share, report, react | Медиа загружается лениво; фокус и прокрутка восстанавливаются; ошибка отдельного блока не ломает проект целиком |
| Profile | identity, bio, links, availability, sections | follow, message/hire, открыть project | Скрытые/пустые секции не занимают место; доступность контактов контролируется владельцем |
| Project editor | ordered blocks, draft metadata, uploads | add/reorder/remove, preview, save/publish | Явное сохранение, индикатор несохраненных изменений, загрузка с повтором, проверка размера и типа до upload |
| Jobs list | query, type, location, remote, pay range, cursor | sort/filter/save/open | Фильтры применяются атомарно; выбранные фильтры видимы; external Apply обозначен заранее |
| Job detail | description, org, location, type, pay, field, contact, apply target | apply, save, report | Проверка актуальности; внешняя ссылка с предупреждением; доверенная организация визуально отделена, но не гарантирует безопасность |
| Inbox | participants, messages, attachments, read status | send, mute, report, block | Разрешения для новых контактов, rate limit и защита от вредоносных вложений |
| Moodboard | owner, privacy, items, order | create, rename, reorder, remove, share | Проверка права доступа на сервере; удаление item не удаляет исходный project |
| Notifications | event, actor, target, seen state | открыть, отметить прочитанным, настройки | Дедупликация; группировка событий; доставка не означает доступность исходного контента |
| Hiring board | briefs, shortlist, candidates, stage, notes | shortlist, message, stage change | Явное разделение личных заметок и данных кандидата; аудит изменений команды |
| Billing/Pro | plan, entitlement, period, region | compare, subscribe, cancel | Серверная проверка прав и вебхуков; ясная дата списания/окончания; запрет доверять локальному клиентскому флагу |

## Детализированная продуктовая логика поиска

1. **Состояние запроса:** пустой поиск ведет в тематическое открытие; непустой запрос не запускается до приемлемой длины или явного submit (решение продукта). Нормализовать пробелы, сохранять исходное написание для UI.
2. **Тип поиска:** отдельные контексты Projects, People, Moodboards и Assets. Нельзя смешивать разные модели результата в одну карточку; вкладка должна сохранять query.
3. **Фильтры:** доступные фильтры зависят от типа результата. В текущем публичном интерфейсе были увидены Creative Fields, Availability, Location, Tools, Color. Официальная справка для Projects указывает field/tools/color/location; Availability может относиться к другой поисковой поверхности — проверить соответствие перед точным клонированием поведения.
4. **Сортировка:** начальное Recommended наблюдалось. В независимом продукте сортировку следует обозначить понятными критериями и сделать предсказуемой. Не заявлять, что повторена внутренняя формула ранжирования.
5. **Выдача и пагинация:** использовать курсор, стабильный порядок внутри страницы, сохранение позиции при возврате. Состояние 0 результатов должно показывать активные фильтры и действие «сбросить».
6. **Индексация:** публичный статус, модерация, поля поиска и выбранные фильтры определяют обнаружимость. Не обещать мгновенное появление нового проекта.
7. **Гостевой порог:** если ограничивается просмотр, показывать, что именно останется после регистрации и сохранять исходный query/фильтры после возвращения.

## Детализированная логика публикации проекта

1. Создать черновик до редактирования первого блока, с владельцем и временем изменения.
2. Редактор строится из упорядочиваемых блоков: image, video, text, embed/медиа — только после согласования поддерживаемых типов и ограничений. Для каждого блока задать alt text, подпись и состояние загрузки.
3. Автосохранение нельзя предполагать на основании внешнего продукта. Независимый продукт должен показывать saved/saving/failed и позволять восстановить черновик; конфликт редактирования требует версии и сравнения.
4. До публикации проверить обязательные поля, права на медиа/шрифты, кредиты соавторов, возрастное/контентное ограничение, обложку, доступность и лицензию.
5. Preview должен представлять публичный рендер, а не только редакторскую форму. Проверить desktop/mobile breakpoints.
6. Publish — подтверждаемое действие с понятной видимостью (public/unlisted/private) и последующим URL. Отдельно регистрировать публикацию и редактирование.
7. Ошибка сети не должна превращать пользователя в источник повторных дубликатов: idempotency key на publish/upload, явное состояние операции.

## Детализированная логика вакансий и найма

- **Каталог:** фильтр по типу вакансии наблюдался явно; поле, локация, remote и оплата встречаются как атрибуты вакансий, но полный набор фильтров в Behance в этом проходе не подтвержден.
- **Карточка и подробности:** краткая карточка оптимизирована для сравнения, подробный просмотр содержит описание, требования, контакт и тип перехода Apply. В выбранной вакансии может сохраняться контекст списка.
- **Внешний отклик:** указать домен до перехода и не обещать сохранение заявки на Behance. В независимом продукте хранить `apply_mode = external | internal` и проверенный HTTPS URL.
- **PRO и доверие:** значок PRO и Verified Organization наблюдались как разные маркеры. Не объединять их смысл. Значок не заменяет защиту от мошенничества.
- **Клиентский мастер:** сначала собрать минимальную категорию запроса и формат найма, затем дополнительные требования. Показывать, что будет отправлено и кому; подтверждать отправку перед контактом исполнителей.
- **Воронка клиента:** brief → candidates → shortlist → conversation → proposal → agreed/closed. Сохранять причину отказа и историю переходов статусов, если пользователь включает это.

## Что исследовать после входа владельца аккаунта

После того как владелец сам войдет в открытой вкладке, следующий осмотр следует провести в таком порядке:

1. Профиль: Work, Edit Profile, видимые вкладки и настройки приватности; зафиксировать каждую вкладку и состояния пустого/заполненного раздела.
2. Share Work: пустой редактор, добавление/перестановка блоков, форма метаданных, предпросмотр, черновик. Ничего не публиковать и не загружать без отдельного согласования.
3. Moodboards: список, создание только при разрешении на запись, приватность, добавление/удаление (изменения не делать без подтверждения).
4. Inbox: список и настройки доступности контакта. Не открывать и не цитировать частные разговоры; фиксировать только интерфейс и типы действий с согласия владельца.
5. Notifications и account settings: категории, состояние прочитанности, опции аккаунта. Не менять настройки.
6. Hire/Jobs: доступные роли, saved jobs, формы создания и состояния перед финальной отправкой; остановиться до отправки/оплаты.
7. Pro/Assets/Services: доступные владельцу предложения и блокировки региона/плана; остановиться до покупки или подключения оплаты.

Нужно заносить только структуру, названия контролов и типы состояний. Личные данные, сообщения, список клиентов и приватные проекты в отчёт не включать без отдельного прямого запроса владельца.

## Итоговая оценка покрытия после расширения

| Область | Покрытие | Остаток |
|---|---|---|
| Публичная главная, каталог проектов, поиск и карточка проекта | Среднее/высокое по структурным элементам | Дополнительные ширины, локализации, доступность и устойчивые URL-состояния |
| Jobs list, фильтр и подробность вакансии | Высокое для гостевого снимка на 27.10.2026 | Создание/сохранение/отклик, все фильтры, авторизованная воронка |
| Hire wizard | Низкое/среднее | Остальные шаги доступны после входа; бриф не отправлялся |
| Profile / editor / social / inbox | Среднее по официальной справке, низкое по текущему live UI | Нужен владелец аккаунта, безопасный проход без изменения данных |
| Pro / monetization / livestream | Низкое/среднее по официальным материалам | Актуальная доступность зависит от аккаунта, страны и плана |
| Мобильный Web и apps | Низкое | Отдельный проход на устройствах и сравнение адаптивных состояний |
| Архитектура и план самостоятельного продукта | Проектная рекомендация | Проверить продуктовые ограничения, бюджет, масштабы и команду |

Число 38 из первоначальной карты сохранено как количество логических поверхностей. Для реализации понадобится отдельная state matrix по каждой странице/роли/ширине, а также реальные макеты и поведенческие тесты после завершения исследования. Никакой оценки покрытия нельзя трактовать как измерение «процента сходства» с Behance.

# Пределы исследования и публичная карта backend-доменов

## Уточнение ограничений

В этой версии используются публичные страницы Behance и Adobe Help Center и не используются данные авторизованной сессии. Adobe General Terms of Use (опубликованы и действуют с 3 октября 2025 года) запрещают, кроме прямо оговорённых исключений, reverse engineering и попытки воспроизвести сервис, включая мониторинг входов и выходов для воссоздания продукта. Behance Product Specific Terms также запрещают копировать или имитировать дизайн, layout и внешний вид Behance. Это ограничение относится к условиям сервиса, а не является самостоятельным юридическим заключением о правах пользователя в конкретной юрисдикции.

Поэтому этот документ фиксирует только публично описанные пользовательские функции и делает высокоуровневые предположения о типовых backend-доменах. Он не описывает закрытые endpoints, внутренние таблицы Adobe, алгоритм ленты/поиска, облачную топологию, очереди, внутренние роли сотрудников или защиту инфраструктуры. Точная серверная архитектура Behance не доступна из аккаунта пользователя и не устанавливается по внешнему интерфейсу.

| Официальный источник | Пункт, важный для границ исследования |
|---|---|
| Adobe General Terms of Use: https://www.adobe.com/legal/terms.html | Разделы 6 и 17 регулируют сбор данных и reverse engineering/воспроизведение продуктов |
| Behance Product Specific Terms: https://wwwimages2.adobe.com/content/dam/cc/en/legal/servicetou/Behance-Product-Specific-Terms-en_US-20240618.pdf | Условия владения контентом, лицензии и запрет имитировать дизайн/layout/look-and-feel |
| Behance Community Guidelines: https://www.behance.net/misc/community | Правила поведения, оригинальности, автоматизации и отчётности о нарушениях |

## Матрица продуктовых прав пользователя

Это карта прав на уровне функций, сведённая из публичной справки. Она не заменяет правила Adobe ID или внутренние разрешения Behance; конкретное действие может быть ограничено статусом аккаунта, регионом, планом, доступностью автора или модерацией.

| Роль/субъект | Чтение | Запись/действия | Ограничения и подтверждения |
|---|---|---|---|
| Гость | Публичные проекты, профили, галереи и часть вакансий | Публичный просмотр и переходы; социальные/коммерческие действия могут требовать входа | Гостевой просмотр может быть ограничен; парольный, приватный и зрелый контент имеет дополнительные ограничения |
| Вошедший Creative | For You, Following, профиль, проекты и разделы по доступности | Follow, Appreciate, комментарии, Moodboards, сообщения, собственный профиль и проекты | Действуют лимиты антиспама; разрешения Inbox могут ограничивать новые сообщения; нельзя публиковать чужую работу как свою |
| Владелец проекта | Публичная версия и собственные настройки проекта | Создать/редактировать/снять с публикации; управлять блоками, метаданными, обложкой и видимостью | Точное управление соавторами и отдельные условия видимости требуют проверки справки для соответствующего режима; права не следует выводить из доступности кнопки |
| Соавтор/владелец проекта | Проект, к которому добавлен | Действия по принятому приглашению и назначенной роли | В проекте могут быть несколько владельцев; кто может удалить/изменить проект, зависит от правил ownership и не проверялось в аккаунте |
| Автор, доступный для найма | Свой профиль/портфолио и входящие запросы | Указать доступность, услуги и принять обращение | Видимость в Hire и платежная доступность зависят от eligibility и региона |
| Hirer / клиент | Каталог специалистов, собственные вакансии/кандидаты в рамках доступных сценариев | Создавать вакансии и brief, просматривать подходящих кандидатов, связываться и управлять наймом | Отдельный режим продукта; внешний Apply может вывести процесс за Behance; конкретные командные роли требуют проверки публичной справки |
| Организация/нанимающий контакт | Опубликованная вакансия и связанный поток откликов | Управлять собственными объявлениями и кандидатами в соответствии с выбранным способом отклика | При external apply Behance может не видеть заявку; вакансии могут проходить модерацию и архивироваться по сроку |
| Behance Pro | Обычные права аккаунта плюс функции плана | Дополнительные настройки, расширенная аналитика и Boost, когда доступны | Платные права связаны с конкретным Adobe ID и регионом; Pro не равен универсальному повышению ранжирования |
| Модерация/поддержка | Жалобы и контент в пределах внутренних процессов | Скрыть/ограничить контент или аккаунт, обработать жалобу/апелляцию | Внутренние интерфейсы и полномочия не исследованы и не входят в пользовательскую архитектуру |

## Backend-домены, которые можно вывести из публичных функций

Следующая схема — **концептуальная декомпозиция для понимания продукта**, а не описание внутренних систем Behance. Указанные домены типичны для платформы такого класса; названия реальных сервисов, протоколы и владельцы данных неизвестны.

| Домен продукта | Публичное основание | Что backend должен уметь в независимом продукте | Уверенность |
|---|---|---|---|
| Identity & session | Adobe ID, вход, роли Creative/Hirer и раздел настроек аккаунта описаны в интерфейсе и справке | Сессия, профиль аккаунта, восстановление доступа, выбор рабочего режима, права и аудит | Высокая по необходимости функции; реализации Behance неизвестны |
| Profile & availability | Публичный профиль, Bio/ссылки, статус Hire Me и вкладки | Профиль, настройки видимости, доступность, портфолио-секции, связь с account ID | Высокая по домену; внутренняя схема неизвестна |
| Project authoring & media | Проекты состоят из медиа/текста; справка описывает editor, черновики и публикацию | Draft/published versions, упорядоченные блоки, медиа-объекты, проверка прав, загрузки и CDN | Высокая по необходимости; конкретные storage/сервисы неизвестны |
| Search & discovery | Поиск Projects/People, фильтры, For You, curated galleries и индексируемость проектов | Индекс, курсорная выдача, query/filter, curated placement и независимый ranking | Высокая по видимой функции; движок и формулы закрыты/неизвестны |
| Social graph | Follow, Appreciate, comments, Moodboards, notifications | Связи подписки, реакции, комментарии, сохранения, блокировки и политика частоты действий | Высокая по публичным действиям; модель хранения неизвестна |
| Notifications & inbox | Уведомления, сообщения, inbox permissions и найм | Уведомления/доставка, треды, сообщения, настройки получателя, антиспам, блокировки и отчётность | Высокая по функциям; transport/realtime неизвестен |
| Hiring & jobs | Каталог вакансий, внутренние и внешние отклики, Hire Me, brief и кандидатские потоки | Job lifecycle, apply mode, brief, shortlist, candidate status, contact permissions и срок размещения | Высокая по предметной модели; точная воронка Behance меняется |
| Commerce & entitlements | Pro, Services, Assets, purchases, subscriptions и платежные providers в официальной справке | Продукт/тариф, право доступа, заказ, платежная попытка, возврат, лицензия/доставка, webhooks | Высокая по необходимости; реальные провайдеры/market routing не полностью подтверждены |
| Trust, safety & moderation | Community rules, Report Abuse, ограничения частых действий и review для Boost | Жалоба, модерационная очередь, enforcement, appeal, rate limits, fraud/spam signals | Высокая по функции; внутренние критерии и инструменты неизвестны |
| Analytics | Public counters и Pro Insights | События просмотра/реакции, агрегация и отчёты по аудитории с ограничениями доступа | Средняя/высокая по необходимости; сбор и хранение неизвестны |

### Концептуальный ход данных

```text
Browser client
  └─ authenticated session / public visitor context
       ├─ Profile & project reads → media delivery / CDN
       ├─ Search query + filters → search/discovery index → ranked result page
       ├─ Follow / Appreciate / comment / Moodboard → social domain → notifications
       ├─ Job / brief / application → hiring domain → inbox or external application site
       └─ Pro / asset / service action → entitlement & commerce → payment provider

Moderation, abuse prevention, privacy and audit controls apply across write paths.
```

Здесь не показаны реальные доменные имена, сети, endpoints, очереди, базы Behance или последовательности вызовов. Это проектная карта связей, необходимая для независимого продукта с сопоставимыми широкими категориями функций.

## Что известно и неизвестно о backend

| Вопрос | Вывод по публичной поверхности | Что нельзя подтвердить без официальной документации/доступа владельца системы |
|---|---|---|
| Реальная схема БД | Существуют связанные профили, проекты, media blocks, комментарии, реакции, подписки, Moodboards, вакансии, отклики, покупки и права | Названия таблиц/полей, ключи, ограничения, шардинг и консистентность |
| Search | Есть индексируемые атрибуты и фильтры из официальной справки | Движок, схема индекса, signals, персонализация и формула ranking |
| Feed | Follow и рекомендации влияют на For You; есть editor/promoted/new markers | Feature store, экспериментирование, правила рекламы/ранжирования и pipeline |
| Media | Поддержаны разные блоки проекта, загрузка и публичный просмотр | Blob provider, encoding pipeline, обработка оригиналов, CDN, retention и лимиты |
| Payments | Есть платные продукты и расчёты через поддерживаемые payment providers | Ledger, charge/refund orchestration, fraud controls, tax, settlement и точная география |
| Messaging | Есть Inbox и настройки допустимых контактов | Реализация realtime, хранение, шифрование, retention, очереди доставки и внутренний доступ |
| Permissions | Видимость проекта/профиля, роли и ограничения документированы частично | Полная матрица RBAC, админские права, внутренние роли и фактическая серверная политика |
| Infrastructure | Публичный продукт доступен через веб и связанные Adobe-сервисы | Облачный провайдер, сервисная топология, сетевые границы, observability и deployment process |

## Рекомендуемый исследовательский запрос и команда

В Replica Pack командой для первичной публичной карты остаётся `/replica-recon`; следующий шаг в пакете — `/replica-architect`. Но исходная цель должна быть сформулирована как исследование категории и проектирование собственного оригинального продукта, а не воспроизведение Behance. В текущей Codex-сессии REA MCP-инструменты отсутствуют, хотя `rea doctor --client codex --json` подтверждает корректную регистрацию в `~/.codex/config.toml` и установленную версию REA/skill. Для появления инструментов требуется перезапустить Codex. Даже после перезапуска REA не должен использоваться для анализа приватных запросов/выходов Behance с целью воссоздать продукт.

# Полная архитектурная декомпозиция независимой платформы портфолио

## Статус, метод и уровень полноты

Этот раздел продолжает текущую карту и схему; он не пересоздаёт проект. Объект описания — независимая веб-платформа творческих портфолио, спроектированная по публично описанным продуктовым категориям Behance. Это не внутренняя архитектура Adobe/Behance. Пользовательская веб-сессия, частные страницы, внутренние API, серверные таблицы, сетевые payloads, алгоритмы и инфраструктура здесь не используются.

Причина границы — условия Adobe: опубликованные General Terms содержат ограничения на reverse engineering и попытки воспроизвести продукт; Behance Product Specific Terms отдельно ограничивают копирование/имитацию дизайна и внешнего вида. В рамках этого проекта допустимо продолжать публичный продуктовый анализ и проектировать оригинальные сущности, интерфейс, ранжирование и бизнес-правила. Юридическое применение условий к конкретному случаю должен оценивать юрист.

**Метка доказательности:** `Наблюдение` — открытый интерфейс; `Документировано` — официальный Help Center или условия; `Проектное решение` — предлагаемое устройство нового продукта; `Неизвестно` — внутренняя реализация Behance недоступна.

**Текущая полнота независимой модели:** 47 исходных SQL-сущностей сгруппированы ниже и расширены до 72 предлагаемых сущностей. Добавлены недостающие бизнес-домены — организации и права команды, история редактора, доступ по ссылке, сохраненные вакансии, hiring notes, предпочтения уведомлений, billing Pro, premium content, контракты и deliverables, livestream, запросы на экспорт/удаление, outbox событий. Число 72 относится к предлагаемой схеме независимого продукта.

## 1. Иерархия субъектов и полномочий

### 1.1 Уровни модели доступа

Доступ рассчитывается на каждом серверном запросе и состоит из нескольких независимых измерений:

1. **Состояние аккаунта:** active, suspended, deletion_pending, deleted. Заблокированный или удаляемый аккаунт ограничивается политикой безопасности.
2. **Способ входа:** гость или аутентифицированный субъект с проверенной сессией. Внешний Adobe ID не входит в проектируемую схему.
3. **Режим продукта:** Creative или Hirer. Режим управляет навигацией и стартовым экраном; сам по себе он не предоставляет право владения чужими объектами.
4. **Глобальное право/entitlement:** план, оплаченная функция, региональная доступность, возрастные и модерационные ограничения.
5. **Связь с объектом:** owner, collaborator, conversation member, organization member, job applicant, buyer, subscriber.
6. **Состояние целевого объекта:** draft/published/private/removed, open/closed, active/expired, moderated/held.
7. **Контекст операции:** действие, время, ресурс, лимиты, блокировки между участниками, подтверждение внешнего платежного события.

Правило допуска: `authenticated AND account_active AND resource_policy AND relationship_policy AND entitlement_if_required AND not_blocked AND within_rate_limit`. Для чтения публичного объекта вместо `authenticated` достаточно публичного статуса и отсутствия возрастного/регионального ограничения. Все проверки выполняются сервером; интерфейсные скрытия не являются защитой.

### 1.2 Иерархия ролей

| Субъект | Уровень | Как возникает | Границы |
|---|---|---|---|
| Гость | Публичный | Без сессии | Читает только публичные ресурсы; запись и персональные сохранения требуют входа |
| Участник | Account | Регистрация/вход | Общие социальные действия в пределах rate limits и настроек адресата |
| Creative | Режим интерфейса | Переключатель пользователя | Публикует/развивает портфолио, подписывается, получает обращения; не является глобальной ролью на всех объектах |
| Hirer | Режим интерфейса | Переключатель пользователя | Открывает рабочую панель и клиентские сценарии; право управлять job требует владения/членства в организации |
| Владелец профиля | Ресурсная связь | user_id профиля совпадает с субъектом | Управляет собственными публичными полями, секциями, доступностью и профилем |
| Project owner | Ресурсная связь | Владелец проекта | Публикует, меняет видимость, назначает co-owner, удаляет или архивирует проект |
| Project editor/viewer | Участник проекта | Принятое приглашение | Editor меняет контент, viewer читает; приглашение pending не даёт прав |
| Moodboard owner/editor/viewer | Участник подборки | Создатель/принятое приглашение | Управление доской ограничено установленной ролью и видимостью доски |
| Hirer individual | Ресурсная роль | Создал brief/job от своего имени | Управляет своими публикациями и откликами, не получает доступ к другим вакансиям работодателя |
| Organization owner/admin/recruiter/viewer | Организационная связь | Приглашение и принятие | Скоуп ограничен одной организацией; только owner/admin меняют состав и роли |
| Applicant | Job relationship | Создал внутренний application | Читает и отзывает свою заявку; видит только статус, который разрешен политикой продукта |
| Conversation member | Участник треда | Добавлен при создании разговора | Читает и отправляет сообщения конкретного разговора, пока не ограничен политикой/блокировкой |
| Buyer | Transaction relationship | Оплаченный заказ/покупка | Получает приобретенный ресурс/лицензию в пределах условий покупки |
| Creator subscriber | Entitlement | Подтвержденная подписка | Читает premium content только в период активного entitlement |
| Pro subscriber | Plan entitlement | Активная биллинговая подписка | Использует платные функции в рамках тарифа; не получает модераторские или чужие права |
| Moderator | Staff role независимого продукта | Внутреннее назначение | Рассматривает жалобы и применяет ограниченные меры; каждое решение журналируется |
| Support agent | Staff role независимого продукта | Внутреннее назначение | Может просматривать только необходимые данные по тикету; не меняет биллинг/контент без выделенного права |
| System worker/webhook | Сервисная идентичность | Managed runtime/provider signature | Доступ только к задаче/событию; не использует пользовательскую сессию |

Creative/Hirer, Pro entitlement и связи с отдельными объектами разделены намеренно. Один пользователь может одновременно быть владельцем нескольких проектов, кандидатом в одной вакансии, администратором организации и подписчиком другого автора.

### 1.3 Матрица прав по объекту

Обозначения: `R` читать, `C` создать, `U` изменить, `D` удалить/архивировать, `M` управлять участниками/статусами. Звёздочка означает, что серверная политика дополнительно проверяет состояние, видимость, блокировку и entitlement.

| Объект | Гость | Участник | Владелец | Принятый editor/member | Hirer/организация | Модератор/worker |
|---|---|---|---|---|---|---|
| Профиль | R публичные поля | R публичные + свои приватные | R/C/U/D свои | — | R публичные поля кандидата | M по жалобе с аудитом |
| Проект | R при public | R public; C reaction/comment | R/C/U/D/M | Editor R/U; viewer R | R public для поиска кандидата | Hide/restore/removed с причиной |
| Медиа | R производные public | R по project access | C/U/D своих файлов до связей | R/U в связанном проекте по роли | — | Удаление/hold с аудитом |
| Кредиты/теги/поля | R если public project | R | C/U/D в своём проекте | U если editor | — | M при нарушении |
| Moodboard | R public | R public; C follow | R/C/U/D/M своя | Editor R/U; viewer R | R публичные подборки | M при жалобе |
| Follow/Appreciation | агрегаты публичны | C/D только от себя | Видит список в пределах privacy | — | Тот же участник | Антиабьюз, скрытие недействительных событий |
| Comment | R visible | C/D свой; edit свой в окно политики | R; скрытие только через report policy | — | R если проект public | Hide/remove/restore с журналом |
| Conversation/message | — | R/C если member | Member R/C/M mute/read | Member R/C | Только назначенные participants | Доступ по расследованию жалобы, минимизация и аудит |
| Job | R опубликованный | R/C save/apply | R/U/D/M свой job | Org recruiter согласно scope | R/C/U/D job по org role | Hold/remove/restore |
| Application | — | R/C/D собственную (withdraw) | Employer R/update stage | Org recruiter R/U notes/status | R для своей вакансии | Ограниченный доступ по case |
| Brief/invite/proposal | — | R своих обращений | Клиент владеет brief; автор видит адресованный invite | Org role по brief | R/C/U/M в собственном рабочем пространстве | M только при жалобе/риске |
| Service | R опубликованный | R/C inquiry | Creator R/C/U/D | — | R/C inquiry | Hide/remove по policy |
| Digital asset/order | R карточку public | Buyer R приобретённое | Seller R/U listing | — | Buyer R entitlement | Billing worker обновляет только подтвержденный webhook |
| Subscription/entitlement | — | R свои entitlements | Creator видит агрегированный состав участников по privacy | — | Billing worker C/U от provider event | Support только ограниченный case read |
| Analytics | Public counters | R свой доступный агрегат | R своих данных | — | R только собственных hiring metrics | — |
| Report/moderation action | — | C report | Report owner видит receipt | — | — | Moderator M; неизменяемый audit trail |
| Billing plan | R публичные условия | R своих прав/подписок | Account holder управляет своим billing | — | Org billing admin при отдельном org plan | Webhook/finance support по узкой роли |
| Livestream | R public/live | C join/comment если разрешено | Creator C/U/end | co-host role | — | Safety worker/moderator M |

Таблица — политика самостоятельного продукта. Некоторые реальные права Behance могут отличаться и меняются по продукту, региону и плану.

### 1.4 Ключевые deny rules

- Нельзя читать draft/private/password project по знанию UUID/slug; сервер сверяет ACL при каждом запросе.
- Нельзя вывести private project/media в search, feed, gallery, sitemap, open graph, CDN cache или analytics exports.
- Pending collaborator/invitation не является активным членством.
- Блокировка между пользователями применяется к поиску адресата, рекомендациям, сообщениям, уведомлениям и публичным взаимодействиям согласно политике нового продукта.
- Пользователь не может изменять собственными параметрами `owner_id`, `moderation_state`, `payment_status`, role, counters, system timestamps и entitlement.
- `external_url` вакансии проверяется по схеме/безопасности и открывается с явной маркировкой внешнего домена.
- Pro/paid entitlement проверяется server-side и имеет срок; UI badge не является источником разрешения.
- Moderator action и payment events требуют отдельной неизменяемой записи audit.

## 2. Полный каталог сущностей исходной схемы

Все 47 сущностей ниже принадлежат проектируемому независимому продукту. Состояния в этом каталоге — рекомендуемые состояния нового продукта, не утверждение о точных enum Behance.

### 2.1 Аккаунт и профиль

| Сущность | Назначение и ключевые связи | Жизненный цикл/правило доступа |
|---|---|---|
| `users` | Канонический субъект, email/handle, account status; корень FK для профиля, записей, членств | active → suspended/deletion_pending → deleted; секреты аутентификации ведёт Auth provider, не эта таблица |
| `profiles` | Публичная карточка личности; 1:1 с user, ссылки на avatar/cover media | public fields отдельно от private settings; owner edit, public read only опубликованных полей |
| `profile_links` | Упорядоченные внешние ссылки профиля | create/edit/delete владельцем; валидировать scheme и вредоносные URL |
| `profile_experience` | Позиции/опыт автора, date range и порядок | owner CRUD; удалять/скрывать поля из публичного профиля при privacy setting |
| `profile_sections` | Типы/порядок/настройки модульных секций профиля | owner управляет; visitor видит только public section и её public target |

### 2.2 Медиа и портфолио

| Сущность | Назначение и ключевые связи | Жизненный цикл/правило доступа |
|---|---|---|
| `media_assets` | Файл, владелец, object key, тип, размер, rendition metadata | pending → processing → ready/failed → deleted; signed upload, ownership check, orphan cleanup |
| `projects` | Творческий кейс, владелец, slug, метаданные, visibility/status | draft → scheduled/published → archived/removed/hold; publication transaction валидирует блоки, обложку, ACL и policy |
| `project_blocks` | Упорядоченные текстовые/медиа/embed/file блоки | project parent; draft edit owner/editor; published block read follows project ACL |
| `project_collaborators` | User-project relation, role, invite status, inviter | pending → accepted/declined/revoked; rights activate only after accepted_at and active status |
| `project_credits` | Авторские роли и attribution lines, optional linked user | project owner/editor CRUD; credit text ≠ ownership permission |
| `creative_fields` | Справочник профессиональных направлений | Taxonomy maintained by system; stable slug and localized label strategy |
| `project_fields` | Many-to-many project ↔ field | Set during editor; drives facets and search; only public eligible project indexed |
| `creative_tools` | Справочник software/tools | System-maintained taxonomy; label/slug versions may change |
| `project_tools` | Many-to-many project ↔ tool | Drives filters and profile/project metadata |
| `project_colors` | Normalized color tags for faceted discovery | Derived or author-selected, validated hex; don't infer sensitive attributes |
| `tags` | Canonical tag vocabulary | Normalize uniqueness, aliases and abusive/spam handling |
| `project_tags` | Many-to-many project ↔ tag | Index only for discoverable projects; no private text leakage |

### 2.3 Социальный граф и сохранение

| Сущность | Назначение и ключевые связи | Жизненный цикл/правило доступа |
|---|---|---|
| `follows` | Directed follower→creator edge | Create/delete by follower; unique pair, no self-follow, apply blocks and rate limits |
| `appreciations` | One appreciation per user/project in base design | Create/delete by actor; unique pair; count is derived/cache, not client-writable |
| `comments` | Discussion items attached to project and author | visible/pending/hidden/removed; author edit/remove policy, owner report only, moderation separate |
| `moodboards` | Named owner-curated collection and privacy | owner create/update/delete; public/private read ACL; co-edit via extension relation |
| `moodboard_items` | Ordered reference to project or media, exactly one target | Added by authorized owner/editor; parent access checked; removing item leaves source intact |
| `moodboard_follows` | Directed subscription to public board | create/delete by viewer; cannot follow private board without invitation |

### 2.4 Сообщения и уведомления

| Сущность | Назначение и ключевые связи | Жизненный цикл/правило доступа |
|---|---|---|
| `conversations` | Conversation and contextual parent (`direct`, `hire`, `job`, `brief`, `service`) | Created by allowed contact; membership fixed/managed by explicit operation; context_id must reference valid context type |
| `conversation_members` | Conversation-member ACL, last read and mute state | Membership check on every read/write; no member enumeration by outsiders |
| `messages` | Sender, text, attachments and moderation state | created → visible/hidden/removed; immutable sender/time; editing/deletion policy explicit, reportable attachments scanned |
| `notifications` | Actor event to target recipient and target resource | unread → read/archived/target_unavailable; payload contains minimal data and is reauthorized on open |

### 2.5 Найм и вакансии

| Сущность | Назначение и ключевые связи | Жизненный цикл/правило доступа |
|---|---|---|
| `availability` | Work types and contact preference per creator | enabled/disabled; owner controls; discovery eligibility is computed with region/account restrictions |
| `services` | Creator's service listing, price starting point, delivery promise | draft → published ↔ paused → removed; only owner changes; public index excludes unavailable seller |
| `jobs` | Employer listing, employment type, location, application mode and expiry | draft → published → expired/archived/removed; internal vs external apply invariant; poster/org access |
| `job_applications` | Candidate ↔ job submission, message and current stage | submitted → reviewing → shortlisted/rejected; candidate can withdraw; unique application per actor/job |
| `job_fields` | Job ↔ creative field facets | Set by employer/editor; index only published job |
| `freelance_briefs` | Client's private/open project brief, range, currency, timeline | draft → open → closed/cancelled; access by hirer and explicitly invited creatives only |
| `brief_invites` | Brief ↔ invited creator and response state | invited → viewed/interested/declined/expired; recipient only sees own invitation; no blanket broadcast |
| `proposals` | Creator offer to hirer, amount, currency, terms, one brief or service origin | draft → sent → accepted/declined/withdrawn → completed/cancelled; acceptance creates contract, not payment proof |

### 2.6 Trust, moderation and audit

| Сущность | Назначение и ключевые связи | Жизненный цикл/правило доступа |
|---|---|---|
| `reports` | User-submitted reason/details against typed target | open → reviewing → actioned/dismissed; reporter sees receipt, moderator sees case, accused doesn't see reporter identity by default |
| `blocks` | Directed block relation | create/delete by blocker; impacts contact, recommendations and interaction surfaces according to policy |
| `moderation_actions` | Staff decision/action and reason over typed target | append-only; moderator scope enforced; reversals are new actions, not destructive rewrite |
| `rate_limit_events` | Allow/throttle/block decision for actor/action | high-write operational record; retention limited, private to trust/safety pipeline |
| `audit_events` | Security/business-critical action trail | append-only, restricted read, redact personal payload; actor may be system/null |

### 2.7 Commerce, subscriptions and analytics

| Сущность | Назначение и ключевые связи | Жизненный цикл/правило доступа |
|---|---|---|
| `digital_assets` | Downloadable product attached to a project, seller/file/license/price | draft → published ↔ paused → removed; seller rights verification and file access after entitlement |
| `orders` | Buyer/provider order and amount/currency for an asset | pending → paid/failed → refunded/disputed; provider event, idempotency and immutable amount snapshot |
| `webhook_events` | Provider/event ID dedupe and processing record | received → processed/retryable/permanent failure; signed payload validation; secrets never logged |
| `creator_subscriptions` | Member→creator paid membership period and provider id | trialing/active/past_due/cancelled/ended; access follows entitlement period and cancellation semantics |
| `entitlements` | Materialized permission to resource over interval | created by verified purchase/subscription/admin correction, expires/revokes; read authorization checks current time and source state |
| `analytics_events` | Pseudonymous event actor/target/referrer/region/search term | Append-only with retention/consent controls; access aggregate by owner; prevent cross-user inference |
| `boost_campaigns` | Project promotion with audience, goal and time range | draft → review → active → completed/rejected/cancelled; one active/review campaign per project in base constraint |

## 3. Расширение схемы до полного доменного покрытия

47 core tables form the current SQL draft. The following 25 additions complete major independent-product workflows without claiming they exist in Behance’s hidden backend:

| New entity | Why it is required | Key relation |
|---|---|---|
| `organizations` | Employer identity and company-wide hiring workspace | created_by user; owns member roster and jobs |
| `organization_members` | Scoped owner/admin/recruiter/viewer permissions | unique organization-user pair |
| `organization_invitations` | Pending, expiring invitations to company workspace | organization, inviter, normalized invitee email |
| `project_revisions` | Recoverable snapshots and version conflict resolution | project, revision number, author |
| `project_access_grants` | Revocable expiring access links for link-only projects | project, token hash, issuer, expiry |
| `moodboard_collaborators` | Explicit role-based co-editing of private/public boards | board, user, role and invitation state |
| `curated_galleries` | Editorial collections separated from user boards | curator/editor; status and publication window |
| `curated_gallery_items` | Ordered project references in a gallery | gallery, eligible public project, order |
| `notification_preferences` | Per-channel/type user preferences | user, event key, in-app/email switches |
| `saved_jobs` | Job bookmarking independent of applications | user, job, unique pair |
| `job_application_events` | Candidate pipeline history and actor attribution | application, from/to stage, actor |
| `job_candidate_notes` | Internal employer-only notes about candidate | application + organization member author; private scope |
| `billing_plans` | Versioned Pro and product plan catalog | plan key, region/period/price metadata |
| `billing_subscriptions` | Pro entitlement lifecycle (separate from creator memberships) | user/org, plan, provider subscription ID |
| `premium_content` | Resource-to-tier access for subscriber-only material | creator, target project/block/media, entitlement key |
| `service_contracts` | Accepted offer becomes an enforceable project workflow | accepted proposal and parties |
| `deliverables` | Versioned files, submission and acceptance state | service contract, creator, media asset |
| `commerce_transactions` | Unified payment state for asset, service, Pro and membership | idempotency key, provider, payer/payee, typed purpose |
| `refund_requests` | Buyer/seller/support workflow for refund/dispute | transaction and requester |
| `payouts` | Seller/creator settlement state | payee, provider payout ref, amount/currency |
| `livestreams` | Broadcast metadata, scheduled/live/end state | creator, title, visibility, moderation state |
| `livestream_replays` | Recording and post-live playback association | stream, media asset, publication/expiry |
| `user_preferences` | Language, display, notification privacy and discoverability settings | one row per user, schema-versioned JSON with allowlisted keys |
| `data_subject_requests` | Account export/deletion workflow and audit status | user, request type, retention/legal hold facts |
| `domain_events` | Transactional outbox for reliable downstream work | aggregate type/id, event type, delivery attempts |

Payments, taxes, payouts, livestreaming, moderation staffing, privacy requests and region support carry operational/legal obligations. Their schema rows alone do not make those capabilities launch-ready.

## 4. Состояния объектов и переходы

| Aggregate | State path | Trigger and guard | Side effects |
|---|---|---|---|
| Account | active → suspended / deletion_pending → deleted | Staff action, user request, identity provider event; block login and new writes | revoke sessions, hide public/private data per policy, schedule data export/purge and preserve lawful accounting records |
| Profile | incomplete → published profile → hidden | Owner saves; visibility and required fields validate | refresh profile index, invalidate cache, optionally notify followers on material update |
| Media asset | pending → processing → ready / failed → deleted | Signed upload completion; MIME/size/hash scan; transform job | renditions, thumbnails, CDN key, indexing; failure surfaced to owner; cleanup orphan |
| Project | draft → valid → scheduled or published → edited / archived / removed / moderation_hold | Owner/editor + project policy + media ready + required metadata; schedule worker for publication | atomically publish version, update search index and counters, invalidate cache, emit project_published event |
| Project visibility | public/private/link_only/password/scheduled | Owner transition with permission; password stored only as strong hash, link grant token stored hashed | purge search/cache/feed for non-public; enforce authorization on asset URLs and share preview |
| Collaborator invitation | pending → accepted/declined/revoked/expired | Invitee authenticates and responds; expiry and inviter ownership checked | accepted role becomes effective; notify both sides; audit membership change |
| Follow | absent → active → absent | Follower toggles; no self-follow, not blocked, rate limit passes | update graph counts/read models, create event for feed and notification settings |
| Appreciation | absent → active → absent | Active member action and project public/visible | idempotent count update; moderation/rate limit; notification policy |
| Comment | composing → visible/pending → hidden/removed | Body valid, author authenticated, target accessible, moderation decision | notify project owner/participants, update thread count, preserve audit when removed |
| Moodboard | draft/public/private/removed | Owner creates or changes visibility | search index only for public; item permissions inherit board; invite transitions for collaborators |
| Job | draft → review → published → expired/archived/removed | Poster/org role, required fields, apply mode check, policy and expiry | index, job alerts/preferences, archive job on expiry, stop new applications |
| Application | submitted → reviewing → shortlisted/rejected/withdrawn | Candidate creates once; employer role can stage; candidate can withdraw | job applicant count, private note history, notification only to authorized parties |
| Brief / invite | draft → open → closed/cancelled; invite → viewed/interested/declined/expired | Client opens brief and explicitly chooses recipients | private ACL on description, invitation alerts, shortlist relationship, audit invitation source |
| Proposal/contract | draft → sent → accepted/declined/withdrawn → contract active → delivered → accepted/completed or disputed/cancelled | Both parties and immutable terms snapshot; payment setup where required | create service contract, transaction, delivery task, messages; acceptance cannot be inferred from a click on preview |
| Asset order | pending → paid/failed → refunded/disputed | Provider webhook signature and idempotency; payment captured | create entitlement/download grant, receipt, seller statement, revoke entitlement when policy requires |
| Subscription | trialing → active → past_due → cancelled/ended | Provider subscription webhook; period boundaries and retry policy | entitlement starts/extends/ends; receipt and notification; do not trust client plan badge |
| Boost | draft → review → active → completed/rejected/cancelled | Project public/eligible, policy review, payment/credit availability | targeting campaign, moderation event, budget accounting, aggregate analytics; freeze covered fields only if policy says so |
| Livestream | draft → scheduled → live → ended → replay_processing → replay_ready/removed | Creator/cohost permission, stream token, moderation gate, worker status | participant notices, live events, recording processing, replay publication/retention |
| Report | open → reviewing → actioned/dismissed → appealed/closed | Reporter submits supported target/reason; moderator assignment | temporary hold only by policy; action audit; private status notice and appeal channel |
| Webhook/outbox event | received/pending → processing → delivered / retryable / dead-letter | Signature/dedupe, transactional commit, attempt budget | idempotent downstream effect; alert on dead letter; no double payment or duplicate notification |

Every transition needs an actor, timestamp, expected prior state, idempotency key for retried external writes, and audit event for security-sensitive or financial changes. Transitions are performed by server transactions/commands, never a client-side status patch.

## 5. Логическая backend-архитектура

### 5.1 Runtime layers for the independent product

1. **Web presentation:** public routes, personalized feed, editor, profile, jobs/hiring workspace, settings. Server-render public pages; authenticated panels fetch scoped data.
2. **Identity/session:** OAuth/passwordless provider, verified email, session lifecycle, account lock/delete flow. Identity secrets stay in managed Auth.
3. **Application modules in one modular monolith:** profile, projects/media, discovery, social, communication, jobs/hiring, commerce/entitlements, moderation, analytics.
4. **Postgres transaction boundary:** canonical entities, ownership and role records, transactional status transitions, outbox.
5. **Object storage and CDN:** source files, private objects, derived media; access controlled by signed short-lived grants and publication ACL.
6. **Search read model:** public-index projection from committed events; privacy/removal immediately invalidates/purges indexed/cached material.
7. **Background workers:** media processing, indexing, notifications/email, expiry, analytics aggregation, webhook retries, export/deletion, replay processing.
8. **External provider adapters:** OAuth, mail, payment, livestream vendor, malware/media scanning. Each adapter has timeout, idempotency, reconciliation and provider-independent domain IDs.
9. **Operations and trust:** audit logs, rate limits, moderation queue, incident alerts, backups, restore tests and access review.

This layout is a design recommendation. Public pages establish that corresponding capabilities exist, not that Behance uses these modules or providers.

### 5.2 Transaction boundaries and event propagation

- A write transaction changes canonical rows and adds a `domain_events` outbox row in one DB transaction.
- A worker claims outbox events with a lease and idempotent consumer key; failure retries with backoff, then dead-letters.
- Search index, feed projection, notification delivery and analytics aggregate are derived read models. They can lag briefly but private/revoked resources must be filtered at read time and rapidly purged.
- Payment provider events are authenticated, stored once by `(provider, provider_event_id)`, reconciled with a canonical `commerce_transactions` row, then create/revoke entitlement.
- Media upload uses a two-phase handshake: authorize owned draft/context → upload to private staging → finalize with size/hash/type verification → background transform → attach ready media to project.
- Project publish uses optimistic revision validation; the DB commits status/version once, then outbox updates indexes and notifications.

### 5.3 Data isolation and privacy groups

| Data class | Examples | Access boundary | Retention / exposure principle |
|---|---|---|---|
| Public content | published public profile/project/job/gallery | Anonymous read if policy permits | Cacheable after moderation, removal invalidates all copies |
| Owner-private | drafts, private boards, settings, analytics | Owner + explicit object collaborators | No public index, no URL preview leakage |
| Conversation-private | messages, attachments, participant metadata | Current members only | Minimal staff access, report-based audit and retention rules |
| Employer-confidential | applicant notes, private brief, candidate stage | Org/job relationship | Never expose notes to candidate or public profile |
| Financial | provider IDs, ledger, payout, refunds, tax data | Account holder/finance role + narrow workers | Minimize card data; provider hosted checkout; immutable audit |
| Safety-sensitive | reports, moderation signals, rate events | Trust/safety role | Strict retention and least privilege |
| Analytics | events, referrer, region, query | Aggregates to authorized owner | Minimize identifiers, consent/privacy settings, aggregation thresholds |

## 6. API and command catalog for the independent product

Routes below are proposed product contracts. They are not Behance endpoints. All mutable APIs authenticate, authorize relationship and state, validate input, use anti-CSRF protections where cookie-based, and produce audit/outbox records as needed.

| Domain | Method/path (proposed) | Actor | Main entities / operation |
|---|---|---|---|
| Profile | `GET /api/profiles/:handle` | Public | Public profile and sections |
| Profile | `PATCH /api/me/profile` | Profile owner | Update allowlisted public/private fields |
| Profile | `POST/PATCH/DELETE /api/me/profile/links/:id?` | Profile owner | Ordered external links |
| Profile | `PUT /api/me/availability` | Profile owner | Work type, contact preference |
| Profile | `PUT /api/me/profile-sections/order` | Profile owner | Reorder visible modules |
| Projects | `POST /api/projects` | Active member | Create draft + initial revision |
| Projects | `GET /api/projects/:slug` | Public/authorized | Project detail after visibility ACL |
| Projects | `PATCH /api/projects/:id` | Owner/editor | Revision-checked metadata/block update |
| Projects | `POST /api/projects/:id/revisions` | Owner/editor | Save version snapshot |
| Projects | `POST /api/projects/:id/preview-token` | Owner/editor | Short-lived preview URL |
| Projects | `POST /api/projects/:id/publish` | Owner/editor policy | Validate and publish/schedule |
| Projects | `POST /api/projects/:id/archive` | Owner | Archive own project |
| Projects | `DELETE /api/projects/:id` | Owner | Soft remove; purge schedule and audit |
| Access | `POST /api/projects/:id/access-grants` | Owner | Create expiring/revocable link grant |
| Access | `DELETE /api/projects/:id/access-grants/:grantId` | Owner | Revoke access grant |
| Media | `POST /api/media/upload-intents` | Authenticated owner/context | Grant one upload to a specific object |
| Media | `POST /api/media/:id/finalize` | Upload owner | Verify object and enqueue processing |
| Media | `GET /api/media/:id/variants/:variant` | Public/authorized | Signed or CDN authorized rendition |
| Taxonomy | `GET /api/taxonomy/fields` | Public | Fields lookup |
| Taxonomy | `GET /api/taxonomy/tools` | Public | Tools lookup |
| Discovery | `GET /api/search/projects` | Public | Query, facets, sorting, cursor |
| Discovery | `GET /api/search/creatives` | Public | People query, availability filters |
| Discovery | `GET /api/feed` | Authenticated | Feed page with cursor and reason labels |
| Discovery | `PUT /api/feed/preferences` | Authenticated | Personalization toggles/preferences |
| Social | `PUT/DELETE /api/creatives/:id/follow` | Authenticated | Idempotent follow edge |
| Social | `PUT/DELETE /api/projects/:id/appreciation` | Authenticated | Idempotent appreciation edge |
| Social | `GET/POST /api/projects/:id/comments` | Public read/member write | Paginated visible comments / add comment |
| Social | `PATCH/DELETE /api/comments/:id` | Comment author | Edit/remove own comment |
| Moodboards | `POST /api/moodboards` | Authenticated | Create board |
| Moodboards | `GET /api/moodboards/:id` | Public/member/owner | Read after ACL |
| Moodboards | `PATCH/DELETE /api/moodboards/:id` | Board owner/editor | Edit settings or remove |
| Moodboards | `POST/DELETE /api/moodboards/:id/items` | Board owner/editor | Add/remove ordered target |
| Moodboards | `POST /api/moodboards/:id/invitations` | Board owner | Invite collaborator |
| Moodboards | `POST /api/moodboards/invitations/:id/response` | Invitee | Accept/decline |
| Jobs | `GET /api/jobs` | Public | Search published jobs |
| Jobs | `GET /api/jobs/:id` | Public | Read active job and apply mode |
| Jobs | `POST /api/jobs` | Member/org recruiter | Create draft job |
| Jobs | `PATCH/DELETE /api/jobs/:id` | Poster/org role | Edit/archive own job |
| Jobs | `POST /api/jobs/:id/publish` | Poster/org admin | Validate, moderate, publish |
| Jobs | `PUT/DELETE /api/jobs/:id/save` | Authenticated | Save/unsave vacancy |
| Jobs | `POST /api/jobs/:id/applications` | Authenticated candidate | Create unique internal application |
| Jobs | `POST /api/applications/:id/withdraw` | Applicant | Withdraw own application |
| Jobs | `PATCH /api/applications/:id/stage` | Authorized employer/org recruiter | Change permitted stage + history |
| Jobs | `POST /api/applications/:id/notes` | Employer/org recruiter | Private internal candidate note |
| Organization | `POST /api/organizations` | Member | Create employer workspace |
| Organization | `POST /api/organizations/:id/invitations` | Org owner/admin | Invite employee/recruiter |
| Organization | `PATCH /api/organizations/:id/members/:userId` | Org owner/admin | Change member role/revoke |
| Hiring | `POST /api/briefs` | Hirer | Create private brief |
| Hiring | `POST /api/briefs/:id/invitations` | Brief owner | Invite selected creatives only |
| Hiring | `POST /api/brief-invitations/:id/response` | Invited creative | Express interest/decline |
| Hiring | `POST /api/proposals` | Creator | Send offer terms to authorized hirer |
| Hiring | `POST /api/proposals/:id/accept` | Hirer | Accept immutable version; creates contract |
| Messaging | `GET /api/inbox` | Conversation member | List own threads |
| Messaging | `GET /api/conversations/:id/messages` | Conversation member | Read paginated messages |
| Messaging | `POST /api/conversations/:id/messages` | Conversation member | Send after block/rate/attachment checks |
| Messaging | `PATCH /api/conversations/:id/read-state` | Conversation member | Update last_read_at |
| Services | `POST /api/services` | Creator | Create draft listing |
| Services | `POST /api/services/:id/inquiries` | Hirer/member | Start contextual authorized inquiry |
| Commerce | `POST /api/checkouts` | Buyer/account owner | Start hosted provider checkout |
| Commerce | `POST /api/webhooks/:provider` | Provider signature | Deduplicate/process payment event |
| Commerce | `GET /api/me/entitlements` | Account holder | Own entitlement list |
| Commerce | `POST /api/refund-requests` | Buyer | Request policy-based refund |
| Commerce | `POST /api/proposals/:id/deliverables` | Contract creator | Submit file/version |
| Commerce | `POST /api/contracts/:id/accept-deliverable` | Hirer | Accept deliverable / proceed per policy |
| Pro | `GET /api/plans` | Public | Published plan/pricing by region |
| Pro | `POST /api/billing/subscribe` | Billing account holder | Provider-managed subscription checkout |
| Pro | `POST /api/billing/cancel` | Billing account holder | Set cancellation intent, keep period history |
| Notifications | `GET /api/notifications` | Recipient | Paginate own notices |
| Notifications | `PATCH /api/notifications/:id/read` | Recipient | Mark own notice read |
| Notifications | `PUT /api/me/notification-preferences` | Account holder | Per-type/per-channel preferences |
| Safety | `POST /api/reports` | Authenticated | Create typed report, dedupe policy |
| Safety | `PUT/DELETE /api/me/blocks/:userId` | Authenticated | Block/unblock, update graph visibility |
| Safety | `GET /api/moderation/cases` | Moderator | Restricted queue |
| Safety | `POST /api/moderation/cases/:id/actions` | Moderator | Append action with reason |
| Analytics | `POST /api/events` | Client/server event | Validate allowlisted analytics event, no arbitrary payload |
| Analytics | `GET /api/me/analytics` | Entitled owner | Aggregated project/profile analytics |
| Boost | `POST /api/projects/:id/boost-campaigns` | Owner with entitlement | Create campaign request |
| Boost | `POST /api/boost-campaigns/:id/submit-review` | Owner | Eligibility and review queue |
| Livestream | `POST /api/livestreams` | Eligible creator | Schedule/create stream |
| Livestream | `POST /api/livestreams/:id/start` | Owner/cohost | Issue short-lived broadcaster token |
| Livestream | `POST /api/livestreams/:id/end` | Owner/moderator | End and enqueue recording processing |
| Privacy | `POST /api/me/data-requests` | Account holder | Request export/deletion workflow |

External calls use provider adapters and idempotency keys. Webhook routes verify signatures, amount/currency/provider account and event replay. Public routes rate limit by actor/IP and hide private-resource existence to limit enumeration.

## 7. Сценарии данных по ролям

### 7.1 Автор выпускает проект

`users → profiles → projects(draft) → project_revisions → media_assets(pending) → project_blocks → taxonomy/tag links → validate ACL/rights → publish status → domain_events → search projection/CDN/notifications`.

Проверки: owner/editor active; media belongs to owner or accepted collaboration; media state ready; required fields valid; project not moderation-held; visibility consistent; active idempotency key. Публикация проекта и записи outbox происходят атомарно. Поиск индексирует только public + published + eligible content.

### 7.2 Зритель сохраняет и подписывается

`public project → authenticated user → follows/appreciations/moodboard_items → domain event → derived feed/count/notification`.

Проверки: account active; project readable now; not blocked; interaction not duplicate or within action rate; board owner/editor; source item still available. Удаление проекта не должно удалять независимую запись доски ошибочно, но скрывает thumbnail/link в соответствии с privacy policy.

### 7.3 Кандидат подаёт заявку

`public jobs query → job detail → application method check → if internal: job_applications + event/outbox → employer inbox/notification; if external: allowlisted HTTPS redirect and exit`.

Для external apply сохраняется только переход/метрика в пределах privacy policy. Нельзя утверждать, что кандидат подал заявку, если сайт работодателя этого не подтвердил.

### 7.4 Компания управляет вакансией

`organization membership → scoped permission check → job draft/review/publish → candidate application → stage event + internal note → applicant-safe status notification`.

Notes строго изолированы и не попадают в application response кандидату. Отмена membership отзывает доступ ко всем jobs организации немедленно; изменения аудируются.

### 7.5 Клиент покупает услугу

`service/brief → authorized conversation → proposal version → acceptance → service_contract → checkout/payment → commerce_transaction → webhook → entitlement/paid status → deliverable version → acceptance/refund/dispute`.

Деньги не меняют статус по клиентскому callback. При неоплаченной услуге доступ к отправке deliverables зависит от выбранных contract terms; спор замораживает автоматический payout по policy.

### 7.6 Подписчик получает premium content

`billing provider subscription event → creator_subscriptions → entitlements(period) → premium_content ACL → access check`.

Период доступа проверяется при каждом запросе к файлу/проекту. Отмена влияет на renewal; уже оплаченный период сохраняется до `ends_at`, если условия продукта это предусматривают.

### 7.7 Жалоба и модерация

`reporter → reports(open) → moderation queue → moderator action(reason/evidence) → content state and cache/index purge → limited notification → appeal/data request`.

Репорт не означает автоматическую виновность. Точные автоматические правила, рейтинги доверия и backend review process Behance неизвестны; в новом продукте применяются собственная политика и человеческий контроль для значимых решений.

## 8. Нефункциональные требования и эксплуатация

| Категория | Архитектурное требование |
|---|---|
| Доступность | Public pages degrade gracefully; editor autosave/version conflict visible; read APIs support cursor pagination |
| Производительность | Image derivatives, responsive sizes, lazy load, CDN cache only for public, avoid N+1 on project/profile grids |
| Надёжность | Idempotent commands, outbox, webhook dedupe, bounded retries, dead-letter queue and reconciliation dashboards |
| Безопасность | AuthZ server-side, RLS/guard at data layer, tenant isolation, signed private media URLs, CSP, upload scanning, SSRF protection for embeds |
| Privacy | Minimize profile fields, privacy controls, consent-aware analytics, short-lived public cache, data export/delete workflow |
| Search | Explicit allowlisted public fields; purge on private/removed/moderation; cursor stability and index versioning |
| Messaging | Participant ACL, abuse controls, safe attachment storage, visibility-aware notifications, limited staff access |
| Payments | Hosted checkout, integer minor units + ISO currency, immutable purchase snapshots, signed webhooks, refunds/disputes ledger |
| Moderation | Case queue, reason taxonomy, evidence access, appeal path, append-only actions, report abuse prevention |
| Observability | Metrics/traces/logs exclude message bodies, tokens, full email, payment credentials; per-domain error dashboards |
| Recovery | Database PITR, object versioning/retention, restore drills, deletion manifests and verified media cleanup |
| Localization | UTC timestamps, locale-aware dates/money, localized taxonomy, region entitlements and legal pages |

## 9. Архитектурные пробелы исходного эскиза, закрытые этим расширением

- `Creative/Hirer` уточнены как интерфейсный режим, отдельно от прав на объект.
- Добавлена организационная граница для компаний и команд; один `company_name` поля вакансии недостаточен для многопользовательского кабинета.
- Добавлена история переходов кандидата и внутренние заметки, изолированные от applicant.
- Добавлены версии проекта и явные access grants для preview/link-only.
- Добавлены co-editors подборок и preferences уведомлений.
- Разделены Pro billing и fan/creator subscriptions.
- Добавлены contract, deliverable, unified transaction, refund, payout и premium content.
- Добавлены livestream metadata/replay, privacy requests и transactional outbox.
- Определены deny rules, состояние ACL, индексные side effects, очереди и повторная обработка.

## 10. Критерии завершённости архитектурной карты

Для независимого продукта архитектурная карта считается достаточно полной для оценки MVP, когда:

1. каждая публичная функция привязана к actor, screen, command, entity, state transition и permission;
2. каждая частная операция имеет owner/relationship scope и deny path;
3. каждое внешнее действие имеет provider boundary, idempotency, failure/reconciliation path;
4. каждый объект имеет lifecycle, deletion/retention behavior и search/cache effects;
5. every table and API contract links to a flow and screen ID;
6. proprietary/unknown behavior остается отдельным, неподтверждённым списком и не заполняется догадками;
7. проект отделяет public behavior map от выбранной реализации собственного продукта.

**Оставшиеся неизвестные Behance:** реальная БД и внутренние API; сервисная топология и vendors; алгоритмы рекомендаций, search ranking и candidate match; точная RBAC/ABAC матрица и staff roles; внутренние платежные ledger/settlement; transport, realtime и retention сообщений; медиа pipelines и SLA; experiments/feature flags; административные экраны; все региональные исключения и закрытые авторизованные состояния. Эти пробелы нельзя устранить осмотром пользовательского аккаунта.

### 3.1 Состояния и права расширенных сущностей

| Сущность | Состояния/переход | Кто может менять | Контроль |
|---|---|---|---|
| `organizations` | active → suspended/closed | owner/admin или system policy | Закрытая организация блокирует jobs и приглашения; действующие обязательства сохраняются для аудита |
| `organization_members` | active → suspended/revoked | owner/admin | Роль применяется только внутри конкретной organization; последнего owner нельзя отозвать без передачи роли |
| `organization_invitations` | pending → accepted/declined/revoked/expired | inviter/admin и invitee | Одноразовый hash token, срок жизни, нормализованный email, роль из allowlist |
| `project_revisions` | append-only revision sequence | owner/editor | Revision immutable; новая версия создаётся при сохранении; conflict требует compare-and-swap |
| `project_access_grants` | active → expired/revoked | project owner | Хранить hash токена, применить TTL и журналировать отзыв; не индексировать проект |
| `moodboard_collaborators` | pending → accepted/declined/revoked | board owner/invitee | Pending не даёт доступа; editor меняет board/items, viewer только читает |
| `curated_galleries` | draft → published → archived | curator/editor | Только public-eligible project, аудит отбора и возможность немедленно снять удаленный объект |
| `curated_gallery_items` | placed → reordered → removed | authorized curator | Уникальная позиция и project; удаление из подборки не меняет проект |
| `notification_preferences` | default → custom → reset | account owner | Белый список event/channel; выключенный канал не выключает критическую security notice |
| `user_preferences` | versioned settings update | account owner | Allowlist ключей, privacy defaults, optimistic version, без UI-поля для прав доступа |
| `saved_jobs` | absent → saved → removed | actor | Уникальная пара user/job; ссылка не сохраняет право отклика после закрытия job |
| `job_application_events` | append-only transition log | authorized applicant/employer/system | from/to проверяются относительно актуального статуса; актор и событие аудируются |
| `job_candidate_notes` | created → edited/soft-deleted | employer/org recruiter | Доступ только текущим членам организации с job scope; не включать в applicant APIs/notifications |
| `billing_plans` | draft → active → retired | billing admin/system | Опубликованный тариф immutable; изменение цены создаёт новую версию |
| `billing_subscriptions` | trialing → active → past_due → cancel_at_period_end/cancelled/ended | provider webhook + account billing owner | Webhook idempotent; период/валюта сверяются с provider; сохранить историю права доступа |
| `premium_content` | active ↔ paused → removed | creator/authorized worker | Read проверяет entitlement по target и времени; удалённый target не выдаётся |
| `service_contracts` | active → delivered → accepted/completed or disputed/cancelled | creator/hirer by contract step | Terms snapshot immutable; переходы только сторонам, одна active contract per proposal |
| `deliverables` | submitted → accepted/revision_requested/withdrawn | creator submits; hirer reviews | Файл принадлежит контракту/автору; сохранять версии, timestamp и actor |
| `commerce_transactions` | created → pending/authorized → paid/failed/cancelled/refunded/disputed | provider adapter/webhook | Idempotency key, amount/currency snapshot, verify provider signature, reconciliation |
| `refund_requests` | requested → reviewing → approved/rejected → processed | buyer requests; support/finance reviews; provider confirms | Отдельно хранить решение и provider refund ref; никогда не считать возврат завершённым до подтверждения |
| `payouts` | pending → paid/failed/reversed | provider event/finance worker | Payee, amount and currency fixed; failed/reversed path reconciled; restricted reads |
| `livestreams` | draft → scheduled → live → ended/cancelled/hold/removed | creator/cohost/moderator | Short-lived stream credentials; live token revoke at end; enforce content and age controls |
| `livestream_replays` | processing → ready/failed/removed | media worker/creator by visibility | Access inherits stream/premium state; expiry cleanup; derivative readiness required |
| `data_subject_requests` | received → verifying → processing → completed/rejected/cancelled | account owner initiates; privacy worker handles | Identity verification, legal hold, export link expiry, deletion job and audit trail |
| `domain_events` | pending → leased/processing → delivered/retryable/dead-letter | system worker only | Unique event identity, lease timeout, bounded retry with backoff and poison-message alert |

## 11. Что ещё нельзя считать закрытым

Текущий независимый architecture package стал систематическим по субъектам, объектам, правам, состояниям, API-контрактам и основным междоменным потокам. Он всё ещё не может утверждать полный backend Behance, потому что для этого потребовались бы внутренние источники/документация Adobe, доступ к которым здесь отсутствует и которые не входят в публично разрешённый scope. Достоверное продолжение — сверять публичную документацию и отдельные публичные страницы, исправляя только подтвержденные функции; точную реализацию Behance не подменять предлагаемой схемой.


## Дополнительные поверхности и потоки для независимой платформы

Ниже идут расширения IA, необходимые для полного самостоятельного продукта, спроектированного на базе публично описанных категорий. Это проектные страницы и варианты состояния, а не утверждение, что каждый экран существует в Behance.

| ID | Поверхность независимого продукта | Кто использует | Назначение и ключевые права | Доказательность |
|---|---|---|---|---|
| S39 | Organization workspace & members | Владелец/admin/recruiter/viewer | Вакансии компании, приглашения, роль и отзыв доступа | Проектное расширение; публичный hirer workflow подтверждает корпоративный найм, точный team UX неизвестен |
| S40 | Saved jobs | Кандидат | Список сохраненных, активных/истекших вакансий и переход к детали | Сохраненные вакансии описаны в справке; layout проектируется |
| S41 | Candidate pipeline detail | Работодатель/recruiter | Статус заявки, история стадий, внутренние заметки, кандидатский профиль | Управление кандидатами документировано; история и notes — проектное расширение |
| S42 | Billing & entitlement center | Владелец плана/покупатель | Планы, период, отмена, заказы, права на материалы | Платные возможности документированы; центральный billing UI проектируется |
| S43 | Privacy export/deletion request | Владелец аккаунта | Запрос копии данных/удаления и статус выполнения | Права/экспорт требуют проверки условий и применимого закона; UI проектируется |
| S44 | Project history & access links | Владелец/editor | Просмотр revisions, восстановление версии, создание/отзыв expiring link | Архитектурное решение независимого продукта; Behance UI не подтверждён |
| S45 | Moodboard collaboration management | Владелец/editor | Приглашения, роли editor/viewer, удаление участника | Модель co-ownership следует проверить; конкретная permission surface проектируется |
| S46 | Livestream replay management | Автор/модератор | Обработка записи, публикация, приватность, срок хранения | Livestream поддерживается в справке; интерфейс и доступность меняются |

### Дополнительные потоки

```text
F17 Организация приглашает рекрутера
    S39 → invitation pending → invitee accepts → role active → membership revocation
    guards: organization owner/admin; invite token expiry; role allowlist
    edges: повторное приглашение, удалённый пользователь, последний owner, закрытая организация

F18 Кандидат сохраняет вакансию и возвращается к ней
    S25 → S26 → save → S40 → active/expired detail
    guards: signed-in user, unique saved relation
    edges: вакансия истекла, удалена, внешний apply не подтверждает заявку

F19 Рекрутер двигает кандидата по воронке
    S41 → stage update → append event → notify candidate only if policy allows
    guards: job/org membership, permitted transition, notes isolated from candidate
    edges: membership revoked during session, application withdrawn, job closed

F20 Автор восстанавливает проект и отзывает ссылку
    S44 → select revision → compare → restore new revision; access grant → revoke
    guards: owner/editor role, current revision token, expiring grant
    edges: concurrent edit, deleted media, stale link/cache

F21 Владелец Moodboard управляет соавтором
    S18 → S45 → invite → accept/decline → role change/revoke
    guards: board owner; invitation accepted; board privacy and block state
    edges: pending invite, duplicate invite, board deleted while invitation pending

F22 Пользователь запрашивает выгрузку/удаление
    S43 → verify account → request → processing → expiring export or completed deletion
    guards: requester owns account; legal hold; billing/accounting retention
    edges: identity mismatch, open transaction/dispute, request cancellation

F23 Подписка и платные права
    S42 → choose plan/asset → provider checkout → signed webhook → entitlement → renewal/cancel/refund
    guards: server-side amount/currency, idempotency, regional availability
    edges: delayed webhook, duplicate event, chargeback, cancellation at period end

F24 Клиент принимает deliverable
    S22/S24 → proposal → contract → S41/Inbox → deliverable version → accept/revision/dispute
    guards: contract parties, immutable accepted terms, payment status per own policy
    edges: file scan failure, out-of-order webhook, refund/dispute

F25 Автор запускает эфир и публикует replay
    S30 → scheduled → live → ended → S46 processing → ready/removed
    guards: eligible creator, moderator policy, short-lived stream credentials
    edges: connection failure, report while live, replay processing failure/expiry
```

Для независимого продукта экранный каталог становится 38 общими/публично документированными логическими поверхностями и 8 дополнительными workspace-поверхностями; 16 базовых сценариев дополняются 9 проектными сценариями. Граница подтверждения сохраняется: public features, proposed UX и internal Behance unknowns помечаются отдельно.
