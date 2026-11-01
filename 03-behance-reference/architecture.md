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
