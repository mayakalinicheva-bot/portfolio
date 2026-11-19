# Portfolio: синхронизация требований с каноническим анализом

Дата: 20.11.2026. Основание: [финальный анализ Q1–Q120](https://docs.google.com/document/d/1IpqYtWjJhqJd_NBNrsvbF6c5l4SfSJ1fWOoT4F2sc4M/edit). Рабочая спецификация: [Google Sheets Matrix](https://docs.google.com/spreadsheets/d/105_UEV9LI2VskOgyC7we51OLAUThod5Vkc7qJKZpbEU/edit).

## Выполненные изменения в Google Sheets

- Основная матрица: 72 записи; добавлен VIEW-01. Существующая вкладка Eng & Personalization: 15 записей.
- Canonical RF: 42 явно выделенных итоговых RF; остальные разделы сохраняют ссылку на канон.
- Sync map 20261120: 14 областей изменений/подтверждений/открытых вопросов.
- Ссылки на RF добавлены к существующим требованиям вместо создания повторных функций.

## VIEW-01 — базовый Views (NEW, RF-80)

Количество просмотров опубликованного кейса — базовая статистика, не объективная оценка качества и не автоматически ranking signal.

| Visibility Case | Доступ к Views / начисление |
| --- | --- |
| Public | Счётчик виден аудитории кейса, включая Guest |
| Friends-only | Только разрешённая аудитория кейса |
| Author-only | Внешние просмотры не начисляются |

Собственные открытия автора не повышают внешний счётчик. После расширения visibility начинают начисляться внешние просмотры. При сужении visibility доступ к статистике также сужается; история и техническая обработка требуют отдельной спецификации.

OPEN: unique/dedup, repeated views, Guest accounting, bots, real-time/delayed counter, dashboard, viewer identities и raw Views use in ranking. STAT-01 — отдельный отложенный аналитический модуль, не отменяет базовый Views.

## Конфликты и сохранённая история

- ENG-03: прежние 24 часа и порог 50%/1 сек. сохранены как исторические параметры; не считать финальным правилом базового Views при конфликте с RF-80.
- «По ссылке» и «Взаимные подписки» из прежних VIS-01/02 не удалены. Не приравнивать их автоматически к новой терминологии и не отменять без явного решения.
- Старые XLSX в этой папке не перезаписаны; актуальные изменения находятся в Google Sheets.

## Semantic map

| Область | Класс | Основание / результат |
| --- | --- | --- |
| Guest browsing | CONFIRMED | RF-02/94; публичный просмотр без обязательного входа |
| Publication autonomy | CONFIRMED | RF-95/114/115/117; автор решает, что публиковать; оценка и Award не являются допуском |
| Teacher | CONFIRMED | PROF-17/D-05: базовые author permissions; Award не даёт CRUD чужого кейса |
| Like / Save / feedback | CONFIRMED | RF-74–79/118; различная семантика; engagement не равно quality |
| Recommendations | CONFIRMED | Relevance / Engagement / Freshness / Expert; общие веса отдельно |
| Multimedia / process / tools | CONFIRMED | RF-05/104/110; без обязательного универсального шаблона |
| Coauthorship / contribution | NO PRODUCT CHANGE | RF-105/116; не вводить contribution score и не расширять права автоматически |
| LXP / import | CONFIRMED | RF-91/94/95; отдельная ниша, добровольный импорт, без autopublish |
| Admissions / navbar / domain | OPEN | R06 подтверждает пример поведения; архитектура и конверсия не доказаны |
| Professional discovery | NO PRODUCT CHANGE | RF-101–110; ожидаемая ценность, employer-side validation открыта |
| Cold start / feedback loop | OPEN | RF-113/114/118; launch backlog, без назначения MVP |

Hypothesis statuses и MVP scope этим обновлением не изменены. Obsidian не синхронизирован. Сайт, API, JSON, исходники и публичная сборка не изменялись.
