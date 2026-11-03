#!/usr/bin/env python3
"""Build EN/RU chrome for the CCAR-P (Professional) practice exam.

The question bank and exam wording remain English. Russian is an interface-only
variant that shares the same browser persistence keys as English, so switching
language never resets progress, misses, or a running attempt.
"""
from __future__ import annotations

import json
import os
import sys

UTILS_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(UTILS_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "ccap", "data")
sys.path.insert(0, UTILS_DIR)

import build_exam_html as engine  # noqa: E402
from professional_blueprint import DRAW, EXAM_SIZE, check_draw  # noqa: E402

SPLIT = "/".join(str(DRAW[d]) for d in sorted(DRAW))


def professional_ui(lang: str, exam: dict) -> dict:
    ui = dict(engine.UI[lang])
    if lang == "ru":
        ui["threshold_note"] = (
            "Порог: {p}/1000 — реальный проходной балл CCAR-P. Каждая попытка "
            f"берёт {EXAM_SIZE} вопросов с весами официального blueprint ({SPLIT}). "
            "Вопросы с несколькими ответами засчитываются только при полностью "
            "правильном выборе. Результат масштабируется до 1000 как тренировочная "
            "аппроксимация реальной шкалы 100–1000."
        )
        ui["draw_note_full"] = (
            "Каждая попытка использует новую случайную выборку: {n} из {bank} "
            f"вопросов банка. Полный режим соответствует {exam['code']}: "
            f"{exam['items']} вопросов за {exam['minutes']} минут."
        )
    else:
        ui["threshold_note"] = (
            "Pass mark set at {p}/1000, the real CCAR-P cut score. Each attempt draws "
            + str(EXAM_SIZE) + " questions weighted to the official domain blueprint ("
            + SPLIT + "). Multiple-response items are scored all-or-nothing. "
            "The score is scaled to 1000 as a study approximation of the real "
            "100–1,000 scaled score."
        )
        ui["draw_note_full"] = (
            "Every attempt draws a fresh random set: {n} of the {bank} bank "
            f"questions this time. Full length mirrors the real {exam['code']} "
            f"exam — {exam['items']} questions in {exam['minutes']} minutes."
        )
    return ui


def main():
    blueprint = json.load(open(os.path.join(DATA_DIR, "objectives.json"), encoding="utf-8"))
    questions = json.load(open(os.path.join(DATA_DIR, "questions.json"), encoding="utf-8"))
    check_draw(blueprint)
    exam = blueprint["_exam"]

    domains_js = {
        d: {"name": v["name"], "weight": v["weight"]}
        for d, v in blueprint["domains"].items()
    }

    for d, want in sorted(DRAW.items()):
        have = sum(1 for q in questions if str(q["domain"]) == d)
        if have < want:
            raise SystemExit(f"domain {d}: bank holds {have} items, the draw needs {want}")

    pass_score = exam["pass_score"]
    scale_top = exam["scale"][1]
    report_map = {str(q["task_id"]): str(q["task_id"]) for q in questions}

    for lang in ("en", "ru"):
        ui = professional_ui(lang, exam)
        common = dict(
            domains_js=domains_js,
            ui=ui,
            per_domain=DRAW,
            pass_score=pass_score,
            pass_pct=round(pass_score / scale_top * 100),
            store_key="ccarp-exam-en",
            lang_attr=lang,
            exam_code="CCAR-P",
            report_map=report_map,
        )
        engine.render_page(
            questions=questions,
            title=("Claude Certified Architect — Professional Practice Exam"
                   if lang == "en" else
                   "Claude Certified Architect — Professional · Тренировочный экзамен"),
            page_title=("CCAR-P · Practice Exam"
                        if lang == "en" else
                        "CCAR-P · Тренировочный экзамен"),
            out_path=os.path.join(ROOT_DIR, "ccap", "dist", f"exam_{lang}.html"),
            bank_href=f"bank-professional-{lang}.html",
            language_links={
                "en": "professional-en.html",
                "ru": "professional-ru.html",
            },
            **common,
        )
        engine.render_page(
            questions=questions,
            title=ui["browse_title"],
            page_title=f"CCAR-P · {ui['browse_title']}",
            out_path=os.path.join(ROOT_DIR, "ccap", "dist", f"bank_{lang}.html"),
            view="bank",
            exam_href=f"professional-{lang}.html",
            language_links={
                "en": "bank-professional-en.html",
                "ru": "bank-professional-ru.html",
            },
            **common,
        )

    print(
        f"Draw per attempt: {sum(DRAW.values())} questions across "
        f"{len(domains_js)} domains (bank of {len(questions)})."
    )


if __name__ == "__main__":
    main()
