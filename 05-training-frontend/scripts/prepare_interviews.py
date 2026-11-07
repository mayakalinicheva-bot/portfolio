#!/usr/bin/env python3
"""Build and validate anonymized interview data from a trusted Google Docs read."""

import argparse
import json
import re
from pathlib import Path

BLOCK_TITLES = {
    1: "Знакомство и образовательный контекст",
    2: "Проекты и учебные работы",
    3: "Портфолио и профессиональная самопрезентация",
    4: "Публикация и жизненный цикл работ",
    5: "Командная работа",
    6: "Соавторство и распределение прав",
    7: "Взаимодействие с другими студентами",
    8: "Социальные механики и обратная связь",
    9: "Преподаватели и оценка работ",
    10: "Университетские цифровые платформы",
    11: "Карьера и профессиональные возможности",
    12: "Проверка концепции Projects Scope",
}

QUESTION = re.compile(r"^(\d{1,3})\.\s+(.+)$", re.S)
BLOCK = re.compile(r"^Блок\s+(\d{1,2})\.\s+(.+)$", re.S)
RESPONDENT = re.compile(r"^(R0[1-8])\b")
EMAIL = re.compile(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b")
PHONE = re.compile(r"(?<!\d)(?:\+7|8)[\s()\-]*\d{3}[\s()\-]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}(?!\d)")
HANDLE = re.compile(r"(?<!\w)@[A-Za-z0-9_]{3,}\b")
URL = re.compile(r"https?://\S+", re.I)
SELF_NAME = re.compile(r"\b(?:меня\s+зовут|м[оё]е?\s+имя|фамилия)\b", re.I)


def paragraph_text(item):
    paragraph = item.get("paragraph")
    if not paragraph:
        return ""
    value = "".join(
        element.get("textRun", {}).get("content", "")
        for element in paragraph.get("elements", [])
    )
    return value.rstrip("\n")


def tab_lines(tab):
    return [
        text.strip()
        for text in (paragraph_text(item) for item in tab.get("body", {}).get("content", []))
        if text.strip()
    ]


def parse_guide(tab):
    blocks = []
    questions = []
    current_block = None
    for line in tab_lines(tab):
        block_match = BLOCK.match(line)
        if block_match:
            number = int(block_match.group(1))
            title = block_match.group(2).strip()
            if BLOCK_TITLES.get(number) != title:
                raise ValueError(f"Unexpected title for block {number}: {title}")
            current_block = {"id": f"B{number:02d}", "number": number, "title": title, "questionIds": []}
            blocks.append(current_block)
            continue
        question_match = QUESTION.match(line)
        if question_match:
            number = int(question_match.group(1))
            if current_block is None:
                raise ValueError(f"Question {number} has no block")
            question_id = f"Q{number:03d}"
            questions.append({
                "id": question_id,
                "number": number,
                "blockId": current_block["id"],
                "text": question_match.group(2).strip(),
            })
            current_block["questionIds"].append(question_id)
    return {"blocks": blocks, "questions": questions}


def parse_interview(tab, canonical):
    respondent_match = RESPONDENT.match(tab.get("title", ""))
    if not respondent_match:
        raise ValueError(f"Respondent ID missing in tab title: {tab.get('title')}")
    respondent_id = respondent_match.group(1)
    canonical_by_number = {item["number"]: item for item in canonical["questions"]}
    lines = tab_lines(tab)
    answers = []
    seen_questions = []
    current_number = None
    answer_parts = []

    def finish_answer():
        nonlocal current_number, answer_parts
        if current_number is None:
            return
        answer = "\n".join(answer_parts).strip()
        if answer.startswith("Ответ:"):
            answer = answer[len("Ответ:"):].lstrip()
        if not answer:
            raise ValueError(f"{respondent_id}: empty answer for question {current_number}")
        question_id = f"Q{current_number:03d}"
        answers.append({
            "id": f"{respondent_id}-{question_id}",
            "questionId": question_id,
            "questionNumber": current_number,
            "answer": answer,
        })
        current_number = None
        answer_parts = []

    for line in lines:
        block_match = BLOCK.match(line)
        if block_match:
            finish_answer()
            continue
        question_match = QUESTION.match(line)
        if question_match:
            finish_answer()
            number = int(question_match.group(1))
            expected = canonical_by_number.get(number)
            if not expected:
                raise ValueError(f"{respondent_id}: unknown question {number}")
            if " ".join(question_match.group(2).split()) != " ".join(expected["text"].split()):
                raise ValueError(f"{respondent_id}: question {number} differs from canonical guide")
            current_number = number
            seen_questions.append(number)
            continue
        if current_number is not None:
            answer_parts.append(line)
    finish_answer()
    return {"respondentId": respondent_id, "answers": answers, "seenQuestions": seen_questions}


def validate(data):
    guide = data["guide"]
    block_numbers = [item["number"] for item in guide["blocks"]]
    question_numbers = [item["number"] for item in guide["questions"]]
    if block_numbers != list(range(1, 13)):
        raise ValueError(f"Guide blocks are invalid: {block_numbers}")
    if question_numbers != list(range(1, 121)):
        raise ValueError("Guide must contain questions 1–120 exactly once")
    for block in guide["blocks"]:
        expected = [f"Q{number:03d}" for number in range((block["number"] - 1) * 10 + 1, block["number"] * 10 + 1)]
        if block["questionIds"] != expected:
            raise ValueError(f"Block {block['number']} has incorrect questions")

    expected_respondents = [f"R{number:02d}" for number in range(1, 9)]
    actual_respondents = [item["respondentId"] for item in data["interviews"]]
    if actual_respondents != expected_respondents:
        raise ValueError(f"Unexpected respondents: {actual_respondents}")

    report = []
    for interview in data["interviews"]:
        numbers = [item["questionNumber"] for item in interview["answers"]]
        missing = sorted(set(range(1, 121)) - set(numbers))
        duplicates = sorted(number for number in set(numbers) if numbers.count(number) > 1)
        wrong_block = [
            number for number in numbers
            if guide["questions"][number - 1]["blockId"] != f"B{((number - 1) // 10) + 1:02d}"
        ]
        if len(numbers) != 120 or missing or duplicates or wrong_block:
            raise ValueError(
                f"{interview['respondentId']}: answers={len(numbers)}, missing={missing}, "
                f"duplicates={duplicates}, wrongBlock={wrong_block}"
            )
        report.append({
            "respondent": interview["respondentId"],
            "blocks": 12,
            "questions": 120,
            "answers": len(numbers),
            "missing": len(missing),
            "duplicates": len(duplicates),
        })

    serialized = json.dumps(data, ensure_ascii=False)
    privacy_hits = {
        "emails": EMAIL.findall(serialized),
        "phones": PHONE.findall(serialized),
        "handles": HANDLE.findall(serialized),
        "urls": URL.findall(serialized),
        "selfNameMarkers": SELF_NAME.findall(serialized),
    }
    if any(privacy_hits.values()):
        raise ValueError(f"Potential direct identifier found: {privacy_hits}")
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path, help="document-result.json from the trusted Docs reader")
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    result = json.loads(args.input.read_text(encoding="utf-8"))
    document = result["structuredContent"]
    tabs = document.get("tabs", [])
    if len(tabs) != 9:
        raise ValueError(f"Expected 9 tabs, found {len(tabs)}")
    guide = parse_guide(tabs[0])
    interviews = [parse_interview(tab, guide) for tab in tabs[1:]]
    for interview in interviews:
        interview.pop("seenQuestions", None)
    data = {
        "schemaVersion": 1,
        "source": {
            "documentId": document["documentId"],
            "revisionId": document["revisionId"],
            "title": document["title"],
        },
        "guide": guide,
        "interviews": interviews,
    }
    report = validate(data)
    args.output.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({
        "schemaVersion": data["schemaVersion"],
        "blocks": len(guide["blocks"]),
        "questions": len(guide["questions"]),
        "interviews": len(interviews),
        "records": sum(len(item["answers"]) for item in interviews),
        "validation": report,
        "privacy": "no direct-identifier patterns detected",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
