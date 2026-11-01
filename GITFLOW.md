# Gitflow для portfolio

- `main` — версия для публикации на Vercel.
- `develop` — объединённая версия следующего выпуска.
- `feature/...` — отдельная задача, PR в `develop`.
- `release/...` — подготовка выпуска, PR в `main` и обратное объединение в `develop`.
- `hotfix/...` — срочное исправление от `main`, слияние в `main` и `develop`.

Сайт Vercel должен смотреть на ветку `main`, а корневая папка проекта в настройках Vercel — `05-training-frontend`. Публичная сборка лежит только в `05-training-frontend/public`. После изменения HTML/CSS/JS или исходных JSON выполните `python3 05-training-frontend/build_public.py` из корня репозитория и включите изменённые файлы `public` в коммит.

Рабочие правки локального сервера находятся в `05-training-frontend/workspace/discovery.json`; файл не публикуется и не коммитится. Экспорт JSON в интерфейсе нужен для переноса данных и резервной копии. Основной отчёт записывается локальным сервером в `05-training-frontend/reports/discovery-report.md`.
