#!/usr/bin/env python3
"""Local Discovery workspace. Python 3.9+, no external dependencies."""
import argparse
import json
import os
import tempfile
import threading
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "workspace"
STATE = DATA / "discovery.json"
REPORT = ROOT / "reports" / "discovery-report.md"
LOCK = threading.Lock()
COLLECTIONS = ("documents", "hypotheses", "research", "decisions", "entities", "tasks", "matrix")
TITLES = {"documents": "Документы", "hypotheses": "Гипотезы", "research": "Исследования", "decisions": "Решения", "entities": "Сущности", "tasks": "Задачи", "matrix": "Требования"}
FIELDS = {"description": "Описание", "body": "Содержание", "assumption": "Предположение", "audience": "Аудитория", "experiment": "Способ проверки", "criterion": "Критерий успеха", "evidence": "Свидетельства", "conclusion": "Вывод", "question": "Вопрос исследования", "method": "Метод", "findings": "Наблюдения", "next": "Следующий шаг", "rationale": "Основание решения", "alternatives": "Альтернативы", "consequences": "Последствия", "owner": "Ответственный", "due": "Срок", "source": "Источник", "category": "Раздел", "blocks": "Блоки матрицы", "links": "Связанные материалы", "status": "Статус", "A": "ID", "B": "Блок", "C": "Элемент / функция", "D": "Роль", "E": "Сценарий / триггер", "F": "Требование / поведение", "G": "UI / состояние", "H": "Данные / зависимости", "I": "Метрики", "J": "Edge cases", "K": "Corner cases", "L": "Восстановление / выход", "M": "Критерии приёмки", "N": "Статус решения", "O": "MVP", "P": "Открытые вопросы"}

def atomic_write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(dir=path.parent, prefix=".pending-")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            stream.write(text)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)

def validate(state):
    if not isinstance(state, dict) or state.get("version") != 2:
        raise ValueError("Неподдерживаемый формат рабочего пространства")
    for kind in COLLECTIONS:
        records = state.get(kind)
        if not isinstance(records, list) or len(records) > 10000:
            raise ValueError("Некорректный раздел: " + kind)
        ids = set()
        for row in records:
            if not isinstance(row, dict):
                raise ValueError("Некорректная запись")
            key = row.get("A" if kind == "matrix" else "id")
            if not isinstance(key, str) or not key.strip() or key in ids:
                raise ValueError("Пустой или повторяющийся ID: " + kind)
            ids.add(key)
            for field, value in row.items():
                if field in ("links", "blocks"):
                    if not isinstance(value, list) or not all(isinstance(x, str) for x in value):
                        raise ValueError("Некорректный список: " + field)
                elif field == "archived":
                    if not isinstance(value, bool):
                        raise ValueError("Некорректный статус архива")
                elif not isinstance(value, str):
                    raise ValueError("Поле должно содержать текст: " + field)
    if not isinstance(state.get("crud"), dict) or not all(isinstance(v, (str, bool)) for v in state["crud"].values()):
        raise ValueError("Некорректные данные CRUD")
    if not isinstance(state.get("reportItems"), list) or not all(isinstance(x, str) for x in state["reportItems"]):
        raise ValueError("Некорректный состав отчёта")

def report_markdown(state):
    lines = ["# portfolio — основной отчёт Discovery", "", "Составляется из материалов, выбранных в рабочем пространстве. Статусы и основания сохраняются без автоматического согласования.", ""]
    selected = set(state["reportItems"])
    for kind in COLLECTIONS:
        rows = [r for r in state[kind] if kind + ":" + r.get("A" if kind == "matrix" else "id", "") in selected and not r.get("archived")]
        if not rows:
            continue
        lines.extend(["## " + TITLES[kind], ""])
        for row in rows:
            lines.extend(["### " + row.get("title", row.get("C", "Без названия")), ""])
            for field, label in FIELDS.items():
                value = row.get(field)
                if not value:
                    continue
                if isinstance(value, list):
                    value = ", ".join(value)
                if field == "body":
                    # Keep source document sections inside this report item.
                    source_lines = value.splitlines()
                    if source_lines and source_lines[0].lstrip("# ").strip() == row.get("title", "").strip():
                        source_lines = source_lines[1:]
                    nested = []
                    for source_line in source_lines:
                        level = len(source_line) - len(source_line.lstrip("#"))
                        if level and source_line[level:level + 1] == " ":
                            nested.append("#" * min(level + 3, 6) + source_line[level:])
                        else:
                            nested.append(source_line)
                    lines.extend(["\n".join(nested), ""])
                else:
                    lines.extend(["**" + label + ":** " + value, ""])
    if len(lines) == 4:
        lines.extend(["Материалы ещё не выбраны. Используйте кнопку «В основной отчёт» в карточке документа или записи.", ""])
    return "\n".join(lines)

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def json_response(self, status, data):
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def allowed_host(self):
        return self.headers.get("Host") in (f"127.0.0.1:{self.server.server_port}", f"localhost:{self.server.server_port}")

    def do_GET(self):
        if not self.allowed_host():
            return self.json_response(403, {"error": "Доступ только через localhost"})
        path = self.path.split("?", 1)[0]
        if path == "/api/workspace":
            with LOCK:
                if not STATE.exists():
                    return self.json_response(200, {"revision": 0, "state": None})
                try:
                    return self.json_response(200, json.loads(STATE.read_text(encoding="utf-8")))
                except (OSError, ValueError):
                    return self.json_response(500, {"error": "Не удалось прочитать рабочее пространство. Исходный файл сохранён."})
        if path == "/api/report":
            with LOCK:
                if not STATE.exists():
                    return self.json_response(404, {"error": "Рабочее пространство ещё не сохранено"})
                payload = report_markdown(json.loads(STATE.read_text(encoding="utf-8"))["state"]).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/markdown; charset=utf-8")
            self.send_header("Content-Disposition", 'attachment; filename="discovery-report.md"')
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            return self.wfile.write(payload)
        # Only frontend assets are public; runtime data/backups use the API.
        if path not in ("/", "/index.html", "/workspace.js", "/model.js", "/styles.css", "/data/matrix.json", "/data/discovery.json"):
            return self.send_error(404)
        super().do_GET()

    def do_POST(self):
        expected_origin = "http://" + self.headers.get("Host", "")
        if not self.allowed_host() or self.headers.get("Origin", expected_origin) != expected_origin:
            return self.json_response(403, {"error": "Запись разрешена только из локального приложения"})
        if self.path != "/api/workspace":
            return self.json_response(404, {"error": "Неизвестный API"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > 15_000_000:
                raise ValueError("Размер данных должен быть меньше 15 МБ")
            if self.headers.get("Content-Type", "").split(";")[0] != "application/json":
                raise ValueError("Ожидается JSON")
            request = json.loads(self.rfile.read(length))
            state = request.get("state")
            validate(state)
            with LOCK:
                previous = STATE.read_text(encoding="utf-8") if STATE.exists() else None
                current = json.loads(previous) if previous else {"revision": 0}
                if request.get("revision") != current["revision"]:
                    return self.json_response(409, {"error": "На диске есть более новая версия. Скачайте локальную копию и обновите страницу.", "revision": current["revision"]})
                result = {"revision": current["revision"] + 1, "savedAt": datetime.now(timezone.utc).isoformat(), "state": state}
                if previous:
                    atomic_write(DATA / "discovery.previous.json", previous)
                atomic_write(STATE, json.dumps(result, ensure_ascii=False, indent=2))
                try:
                    atomic_write(REPORT, report_markdown(state))
                    warning = None
                except OSError:
                    warning = "Данные сохранены, но запись отчёта не удалась. Повторите сохранение."
            return self.json_response(200, {"revision": result["revision"], "savedAt": result["savedAt"], "warning": warning})
        except (ValueError, TypeError, AttributeError) as error:
            self.json_response(400, {"error": str(error)})
        except OSError:
            self.json_response(500, {"error": "Не удалось записать данные на диск. Скачайте резервную копию JSON."})

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    DATA.mkdir(parents=True, exist_ok=True)
    print(f"Discovery workspace: http://127.0.0.1:{args.port}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()
