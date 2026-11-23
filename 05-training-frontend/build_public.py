#!/usr/bin/env python3
"""Copy only approved static assets into the Vercel output directory."""
from pathlib import Path
import shutil
import json

root = Path(__file__).resolve().parent
public = root / "public"
assets = (
    "index.html", "styles.css", "model.js", "workspace.js", "hypotheses-graph.js",
    "data/hypotheses-graph.json",
    "data/matrix.json", "data/discovery.json",
    "data/deploy1-matrix.json", "data/qualitative-analysis.json",
)
public.mkdir(exist_ok=True)
for relative in assets:
    destination = public / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    source = root / relative
    if relative == "data/qualitative-analysis.json":
        # Publish only the aggregate synthesis. Raw source IDs, revision tokens,
        # respondent mappings and synthetic hypothesis statuses stay out of the bundle.
        data = json.loads(source.read_text(encoding="utf-8"))
        data.pop("sources", None)
        data.pop("hypotheses", None)
        sample = data.get("sample", {})
        data["sample"] = {
            "sessionCount": 8,
            "independentCount": 7,
            "self": "SELF01",
            "questions": sample.get("questions", 120),
            "answers": sample.get("answers", 960),
            "note": "R01–R07 — независимые участники; SELF01 — отдельная самооценка. R01 — внешний сравнительный участник. Ответы — ячейки данных, а не независимые наблюдения.",
        }
        for pattern in data.get("patterns", []):
            pattern.pop("respondents", None)
            pattern.pop("self01", None)
        destination.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    else:
        shutil.copyfile(source, destination)
print("Static site prepared in", public)
