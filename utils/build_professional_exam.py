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
    all_questions = json.load(open(os.path.join(DATA_DIR, "questions.json"), encoding="utf-8"))
    readiness_meta = json.load(open(os.path.join(DATA_DIR, "readiness_ids.json"), encoding="utf-8"))
    readiness_ids = set(readiness_meta["ids"])
    readiness_forms = readiness_meta["forms"]
    questions = [q for q in all_questions if q["id"] not in readiness_ids]
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
    report_map = {str(q["task_id"]): str(q["task_id"]) for q in all_questions}

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

        for form_name, readiness_form in sorted(readiness_forms.items()):
            readiness_form_ids = set(readiness_form["ids"])
            readiness = [q for q in all_questions if q["id"] in readiness_form_ids]
            readiness_ui = dict(ui)
            readiness_ui["draw_note_full"] = (
                f"Held-out readiness {form_name.upper()}: {{n}} unseen questions. "
                "Answers reveal only after completion."
                if lang == "en" else
                f"Независимая проверка {form_name.upper()}: {{n}} ранее не показанных вопросов. "
                "Ответы откроются только после завершения."
            )
            readiness_ui["threshold_note"] = (
                "Held-out readiness signal. This set is excluded from normal study and bank browsing; "
                "use the official 720 cut score only as a training reference, not a score prediction."
                if lang == "en" else
                "Независимый сигнал готовности. Этот набор исключён из обычной тренировки и банка; "
                "порог 720 используется только как учебный ориентир, а не прогноз официального результата."
            )
            engine.render_page(
                questions=readiness,
                domains_js=domains_js,
                ui=readiness_ui,
                per_domain={k: int(v) for k, v in readiness_form["per_domain"].items()},
                pass_score=pass_score,
                pass_pct=round(pass_score / scale_top * 100),
                store_key=f"ccarp-readiness-{form_name}-en",
                lang_attr=lang,
                exam_code="CCAR-P",
                report_map=report_map,
                title=(
                    f"CCAR-P · Readiness {form_name.upper()}"
                    if lang == "en"
                    else f"CCAR-P · Проверка готовности {form_name.upper()}"
                ),
                page_title=(
                    f"CCAR-P · Held-out readiness {form_name.upper()}"
                    if lang == "en"
                    else f"CCAR-P · Независимая проверка {form_name.upper()}"
                ),
                out_path=os.path.join(ROOT_DIR, "ccap", "dist", f"readiness_{form_name}_{lang}.html"),
                language_links={
                    "en": f"readiness-{form_name}-professional-en.html",
                    "ru": f"readiness-{form_name}-professional-ru.html",
                },
                fixed_exam=True,
            )

    print(
        f"Draw per attempt: {sum(DRAW.values())} questions across "
        f"{len(domains_js)} domains (bank of {len(questions)})."
    )


if __name__ == "__main__":
    main()
