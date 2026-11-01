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
