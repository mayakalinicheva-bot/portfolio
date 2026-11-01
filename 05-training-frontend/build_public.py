#!/usr/bin/env python3
"""Copy only approved static assets into the Vercel output directory."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent
public = root / "public"
assets = (
    "index.html", "styles.css", "model.js", "workspace.js",
    "data/matrix.json", "data/discovery.json",
)
public.mkdir(exist_ok=True)
for relative in assets:
    destination = public / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(root / relative, destination)
print("Static site prepared in", public)
