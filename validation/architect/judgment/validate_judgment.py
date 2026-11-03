#!/usr/bin/env python3
"""Independent methodology + judgment validation for CCAR-F / CCAR-P.

This suite complements validate_course.py. It evaluates whether the corpus trains
constraint-based architectural decisions rather than merely covering the blueprint.

Automated heuristics are review signals, not psychometric validity estimates.
Lenses 4 and 5 consume a separately adjudicated stress sample when
validation/architect/judgment/stress_ratings.json is present.
"""
from __future__ import annotations

import argparse
import json
import re
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "utils"))

REPORT_DIR = ROOT / "validation" / "architect" / "judgment" / "reports"
RATINGS = ROOT / "validation" / "architect" / "judgment" / "stress_ratings.json"

STOP = set("""
the a an and or to of in for is are was were be been with that this which what how
when where why who your their its from by as at on into than then so if can could
would should
""".split())

FACTOR_RE = re.compile(
    r"\b("
    r"must|cannot|without|only|always|never|strict|tight|high|low|"
    r"cost|latency|throughput|volume|budget|accuracy|quality|risk|safety|security|"
    r"compliance|reversib\w*|irreversib\w*|approval|human|stakeholder|sla|"
    r"availability|reliability|context|token|cache|caching|batch|real-time|"
    r"synchronous|asynchronous|least privilege|permission|auth\w*|provenance|"
    r"source|evidence|uncertainty|ambiguous|conflict\w*|destructive|external|"
    r"internal|scale|scalability|fixed|dynamic|independent|dependent|"
    r"before|after|while|but|instead|requires?|needs?|wants?|"
    r"same|different|shared|isolated|routine|exception|"
    r"measurable|contractual|audit|regulat\w*"
    r")\b",
    re.I,
)

DECISION_RE = re.compile(
    r"\b(best|most appropriate|most effective|should|next step|approach|strategy|"
    r"design|choose|select|decision|trade-?off|root cause|priority|sequence|"
    r"combination|architecture|redesign|justify|recommend)\b",
    re.I,
)

RECALL_RE = re.compile(
    r"\b(what happens|what should .* expect|at what depth|which command|"
    r"which field|which parameter|which flag|which hook|which mechanism|"
    r"which feature|which pattern is being used|what is the correct relationship|"
    r"how does .* surface|which statement is true|which of the following are true)\b",
    re.I,
)

ABSOLUTE_RE = re.compile(
    r"\b(always|never|guarantee(?:d|s)?|impossible|every|entirely|completely|"
    r"regardless of|under any circumstances|fundamentally unable)\b",
    re.I,
)


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def foundation_training():
    import exam_data
    return exam_data.load("en")


def professional_full():
    return read("ccap/data/questions.json")


def professional_training():
    meta = read("ccap/data/readiness_ids.json")
    held = set(meta.get("ids", []))
    return [q for q in professional_full() if q["id"] not in held]


def tracks():
    return {
        "Foundation": foundation_training(),
        "Professional": professional_training(),
    }


def tokens(text):
    return [
        t for t in re.findall(r"[a-z0-9_-]+", (text or "").lower())
        if len(t) > 2 and t not in STOP
    ]


def stem_text(q):
    return " ".join([q.get("situation") or "", q.get("question") or ""]).strip()


def factor_count(q):
    return len(FACTOR_RE.findall(stem_text(q)))


def cognitive_score(q):
    """Heuristic review signal, not a psychometric score."""
    situation = (q.get("situation") or "").strip()
    question = q.get("question") or ""
    score = 0
    fc = factor_count(q)
    score += 2 if fc >= 2 else 1 if fc == 1 else 0
    if DECISION_RE.search(question):
        score += 1
    if re.search(r"\b(but|while|however|instead|only|must|cannot|requires?|needs?|wants?)\b", situation, re.I):
        score += 1
    if len(tokens(situation)) >= 25:
        score += 1
    if RECALL_RE.search(question):
        score -= 2
    if not situation:
        score -= 2
    return score


def classify_cognitive(q):
    score = cognitive_score(q)
    if score >= 3:
        return "judgment"
    if score >= 1:
        return "applied"
    return "recall"


def option_key(q):
    c = q.get("correct")
    return set(c if isinstance(c, list) else [c])


def result(name, status, summary, findings=None, metrics=None):
    return {
        "validator": name,
        "status": status,
        "summary": summary,
        "findings": findings or [],
        "metrics": metrics or {},
    }


def v01_scope_scenario_alignment():
    findings = []
    status = "PASS"
    f = foundation_training()
    p = professional_training()

    f_obj = Counter(str(q.get("task_id")) for q in f)
    p_obj = Counter(str(q.get("task_id")) for q in p)
    if len(f_obj) != 30:
        findings.append(f"Foundation training covers {len(f_obj)} task statements, expected 30.")
        status = "FAIL"
    if len(p_obj) != 38:
        findings.append(f"Professional training covers {len(p_obj)} objectives, expected 38.")
        status = "FAIL"

    cases = read("ccaf/data/scenario_cases.json").get("scenarios", [])
    if len(cases) != 6:
        findings.append(f"Foundation exposes {len(cases)} scenario families, expected six.")
        status = "FAIL"
    if any(not s.get("prompts") for s in cases):
        findings.append("At least one Foundation scenario family has no case prompts.")
        status = "FAIL"

    cap = read("ccap/data/capstone.json")
    if len(cap.get("artifacts", [])) < 8 or len(cap.get("stress_tests", [])) < 4:
        findings.append("Professional capstone is too thin for end-to-end architecture judgment.")
        status = "FAIL"

    return result(
        "01-scope-scenario-alignment", status,
        "Official objective coverage plus Foundation scenario families and Professional end-to-end work.",
        findings,
        {
            "foundation_training_items": len(f),
            "foundation_objectives": len(f_obj),
            "foundation_scenario_families": len(cases),
            "professional_training_items": len(p),
            "professional_objectives": len(p_obj),
            "professional_capstone_artifacts": len(cap.get("artifacts", [])),
            "professional_stress_tests": len(cap.get("stress_tests", [])),
        },
    )


def v02_cognitive_demand():
    findings = []
    status = "PASS"
    metrics = {}
    targets = {"Foundation": 0.60, "Professional": 0.70}
    for name, qs in tracks().items():
        counts = Counter(classify_cognitive(q) for q in qs)
        judgment = counts["judgment"] / len(qs)
        nonrecall = (counts["judgment"] + counts["applied"]) / len(qs)
        if judgment < targets[name]:
            findings.append(
                f"{name}: {judgment:.1%} clear the strict judgment heuristic "
                f"(policy target {targets[name]:.0%})."
            )
            status = "FAIL"
        if nonrecall < 0.90:
            findings.append(f"{name}: {counts['recall']} items ({1-nonrecall:.1%}) remain recall-heavy.")
            status = "FAIL"
        metrics[name.lower()] = {
            "counts": dict(counts),
            "judgment_pct": round(judgment * 100, 1),
            "nonrecall_pct": round(nonrecall * 100, 1),
            "lowest_scoring_ids": [
                q["id"] for q in sorted(qs, key=lambda q: (cognitive_score(q), q["id"]))[:20]
            ],
        }
    return result(
        "02-cognitive-demand", status,
        "Estimates scenario judgment vs isolated product-fact recall.",
        findings, metrics,
    )


def v03_decision_hinge():
    findings = []
    status = "PASS"
    metrics = {}
    for name, qs in tracks().items():
        candidates = [q for q in qs if DECISION_RE.search(q.get("question", ""))]
        explicit = [q for q in candidates if factor_count(q) >= 1]
        pct = len(explicit) / max(1, len(candidates))
        low = [q["id"] for q in candidates if factor_count(q) == 0]
        if pct < 0.78:
            findings.append(
                f"{name}: only {pct:.1%} of judgment-style lead-ins contain an explicit factor marker."
            )
            status = "FAIL"
        metrics[name.lower()] = {
            "judgment_leadins": len(candidates),
            "with_explicit_factor": len(explicit),
            "pct": round(pct * 100, 1),
            "review_queue_total": len(low),
            "review_queue": low[:40],
        }
    return result(
        "03-decision-hinge", status,
        "Checks that judgment questions expose a decision-relevant hinge rather than decorative context.",
        findings, metrics,
    )


def load_ratings():
    if not RATINGS.exists():
        return None
    return json.loads(RATINGS.read_text(encoding="utf-8"))


def v04_one_best_answer():
    ratings = load_ratings()
    if not ratings:
        return result(
            "04-one-best-answer", "WARN",
            "Manual stress-sample adjudication is required for best-answer uniqueness.",
            ["stress_ratings.json has not been completed yet."],
            {"manual_sample_required": True},
        )
    rows = ratings.get("items", [])
    bad = [r for r in rows if int(r.get("unique_best", 0)) < 2]
    severe = [r for r in rows if int(r.get("unique_best", 0)) == 0]
    status = "PASS"
    findings = []
    if severe:
        status = "FAIL"
        findings.append(f"{len(severe)} stress-sample items have an ambiguous or indefensible key.")
    elif len(bad) / max(1, len(rows)) > 0.10:
        status = "FAIL"
        findings.append(f"{len(bad)}/{len(rows)} stress-sample items have a competing plausible key.")
    return result(
        "04-one-best-answer", status,
        "Stress-sample review of whether the key is uniquely best under the stated facts.",
        findings,
        {
            "reviewed": len(rows),
            "strong": sum(int(r.get("unique_best", 0)) == 2 for r in rows),
            "borderline": sum(int(r.get("unique_best", 0)) == 1 for r in rows),
            "ambiguous": len(severe),
            "flagged": [r["id"] for r in bad],
        },
    )


def v05_distractor_plausibility():
    ratings = load_ratings()
    if not ratings:
        return result(
            "05-distractor-plausibility", "WARN",
            "Manual stress-sample adjudication is required for distractor plausibility.",
            ["stress_ratings.json has not been completed yet."],
            {"manual_sample_required": True},
        )
    rows = ratings.get("items", [])
    bad = [r for r in rows if int(r.get("distractors", 0)) < 2]
    status = "PASS" if len(bad) / max(1, len(rows)) <= 0.15 else "FAIL"
    findings = []
    if status == "FAIL":
        findings.append(f"{len(bad)}/{len(rows)} reviewed items contain weak or heterogeneous distractors.")
    return result(
        "05-distractor-plausibility", status,
        "Stress-sample review of plausible alternatives on the same decision axis.",
        findings,
        {
            "reviewed": len(rows),
            "strong": sum(int(r.get("distractors", 0)) == 2 for r in rows),
            "mixed": sum(int(r.get("distractors", 0)) == 1 for r in rows),
            "poor": sum(int(r.get("distractors", 0)) == 0 for r in rows),
            "flagged": [r["id"] for r in bad],
        },
    )


def v06_cue_resistance():
    findings = []
    status = "PASS"
    metrics = {}
    for name, qs in tracks().items():
        singles = [q for q in qs if isinstance(q.get("correct"), str)]
        positions = Counter(q["correct"] for q in singles)
        expected = len(singles) / 4 if singles else 0
        pos_dev = max((abs(positions[x] - expected) / expected for x in "ABCD"), default=0)

        length_ratios = []
        overlap_adv = []
        abs_correct = 0
        abs_wrong = 0
        for q in qs:
            key = option_key(q)
            stem = set(tokens(stem_text(q)))
            correct_lengths, wrong_lengths = [], []
            correct_overlap, wrong_overlap = [], []
            for option in q["options"]:
                ot = tokens(option["text"])
                overlap = len(stem & set(ot)) / max(1, len(set(ot)))
                if option["letter"] in key:
                    correct_lengths.append(len(ot))
                    correct_overlap.append(overlap)
                    if ABSOLUTE_RE.search(option["text"]):
                        abs_correct += 1
                else:
                    wrong_lengths.append(len(ot))
                    wrong_overlap.append(overlap)
                    if ABSOLUTE_RE.search(option["text"]):
                        abs_wrong += 1
            if correct_lengths and wrong_lengths:
                length_ratios.append(
                    statistics.mean(correct_lengths) / max(1, statistics.mean(wrong_lengths))
                )
                overlap_adv.append(
                    statistics.mean(correct_overlap) - statistics.mean(wrong_overlap)
                )

        med_len = statistics.median(length_ratios) if length_ratios else 1
        med_overlap = statistics.median(overlap_adv) if overlap_adv else 0
        if pos_dev > 0.25:
            findings.append(f"{name}: keyed-option position imbalance is high ({dict(positions)}).")
            status = "FAIL"
        if med_len > 1.25 or med_len < 0.80:
            findings.append(f"{name}: median key/distractor length ratio={med_len:.2f}.")
            status = "FAIL"
        if med_overlap > 0.10:
            findings.append(f"{name}: keyed option copies substantially more stem language.")
            status = "FAIL"

        metrics[name.lower()] = {
            "single_key_positions": dict(positions),
            "position_max_relative_deviation": round(pos_dev, 3),
            "median_key_distractor_length_ratio": round(med_len, 3),
            "median_key_overlap_advantage": round(med_overlap, 3),
            "absolute_terms_key": abs_correct,
            "absolute_terms_distractors": abs_wrong,
        }
    return result(
        "06-cue-resistance", status,
        "Checks answer-position, option-length, lexical-echo, and absolute-word shortcuts.",
        findings, metrics,
    )


def v07_contrastive_rationales():
    findings = []
    status = "PASS"
    metrics = {}
    for name, qs in tracks().items():
        empty = []
        short = []
        tied = 0
        total = 0
        for q in qs:
            stem = set(tokens(stem_text(q)))
            for option in q["options"]:
                total += 1
                exp = (option.get("explanation") or "").strip()
                if not exp:
                    empty.append(f"{q['id']}:{option['letter']}")
                    continue
                if len(tokens(exp)) < 8:
                    short.append(f"{q['id']}:{option['letter']}")
                if len(stem & set(tokens(exp))) >= 2:
                    tied += 1
        tied_pct = tied / max(1, total)
        if empty:
            findings.append(f"{name}: {len(empty)} options lack rationale.")
            status = "FAIL"
        if len(short) / max(1, total) > 0.05:
            findings.append(f"{name}: {len(short)} rationales are too short to teach discrimination.")
            status = "FAIL"
        if tied_pct < 0.70:
            findings.append(
                f"{name}: only {tied_pct:.1%} of rationales reconnect to scenario/stem language."
            )
            status = "FAIL"
        metrics[name.lower()] = {
            "options": total,
            "empty": len(empty),
            "short": len(short),
            "stem_tied_pct": round(tied_pct * 100, 1),
            "empty_sample": empty[:12],
            "short_sample": short[:12],
        }
    return result(
        "07-contrastive-rationales", status,
        "Checks whether feedback teaches why alternatives fail the governing constraint.",
        findings, metrics,
    )


def jaccard(a, b):
    return len(a & b) / max(1, len(a | b))


def v08_transfer_diversity():
    findings = []
    status = "PASS"
    metrics = {}
    for name, qs in tracks().items():
        by_obj = defaultdict(list)
        for q in qs:
            by_obj[str(q.get("task_id"))].append(q)
        flags = []
        near_pairs = 0
        for obj, items in by_obj.items():
            sets = [set(tokens(stem_text(q))) for q in items]
            unique_situations = len(set((q.get("situation") or "").strip() for q in items))
            max_j = 0
            for i in range(len(sets)):
                for j in range(i + 1, len(sets)):
                    score = jaccard(sets[i], sets[j])
                    max_j = max(max_j, score)
                    if score >= 0.75:
                        near_pairs += 1
            if len(items) >= 5 and unique_situations < min(4, len(items)):
                flags.append((obj, "low-context-diversity", unique_situations, len(items)))
            if max_j >= 0.88:
                flags.append((obj, "near-duplicate", round(max_j, 2), len(items)))
        if flags:
            findings.append(f"{name}: {len(flags)} objective-level transfer/diversity flags.")
            status = "FAIL"
        metrics[name.lower()] = {
            "objectives": len(by_obj),
            "near_duplicate_pairs_ge_0_75": near_pairs,
            "flags": flags[:30],
        }
    return result(
        "08-transfer-diversity", status,
        "Checks whether the same rule is practiced across varied contexts instead of memorized templates.",
        findings, metrics,
    )


def v09_learning_loop():
    engine = (ROOT / "utils" / "build_exam_html.py").read_text(encoding="utf-8")
    app = (ROOT / "docs" / "app.js").read_text(encoding="utf-8")
    src = (ROOT / "scripts" / "build-pages.mjs").read_text(encoding="utf-8")
    findings = []
    status = "PASS"
    required = {
        "self_explanation_before_feedback": "function commitStudy" in engine and "reason_label" in engine,
        "all_option_feedback_after_commit": "const showExpl = reveal && Boolean(opt.explanation)" in engine,
        "spaced_review": "REVIEW_INTERVALS" in engine and "due" in engine,
        "mastery_from_distinct_solutions": "streakIds" in engine and "mastered" in engine,
        "mixed_diagnostic": "mode=exam&length=quick" in src,
        "hands_on_foundation": "buildFoundationLabs" in src,
        "professional_capstone": "buildProfessionalCapstone" in src,
        "progress_by_objective": "data-objective-key" in src and "masteryItems" in app,
    }
    for name, ok in required.items():
        if not ok:
            findings.append(f"Missing learning-loop component: {name}.")
            status = "FAIL"
    confidence = "confidence" in engine.lower()
    if not confidence:
        findings.append(
            "No confidence judgment before feedback; useful for metacognitive calibration and review scheduling."
        )
        if status == "PASS":
            status = "WARN"
    return result(
        "09-learning-loop", status,
        "Checks retrieval, self-explanation, feedback, spacing, varied practice, and skill-based progress.",
        findings,
        {**required, "confidence_capture": confidence},
    )


def v10_readiness_integrity():
    findings = []
    status = "PASS"

    import exam_data
    fmeta = read("ccaf/data/readiness_ids.json")
    ftrain = {q["id"] for q in exam_data.load("en")}
    fforms = fmeta.get("forms", {})
    fsets = [set(v.get("ids", [])) for v in fforms.values()]
    if len(fforms) < 2:
        findings.append("Foundation has fewer than two held-out readiness forms.")
        status = "FAIL"
    if any(ftrain & ids for ids in fsets):
        findings.append("Foundation held-out ids leak into ordinary training.")
        status = "FAIL"
    if any(a & b for i, a in enumerate(fsets) for b in fsets[i + 1:]):
        findings.append("Foundation readiness forms overlap.")
        status = "FAIL"

    pmeta = read("ccap/data/readiness_ids.json")
    pheld = set(pmeta.get("ids", []))
    ptrain = {q["id"] for q in professional_training()}
    pforms = pmeta.get("forms", {})
    psets = [set(v.get("ids", [])) for v in pforms.values()]
    if len(pforms) < 2:
        findings.append(
            "Professional has only one held-out form; repeated readiness attempts become familiarity tests."
        )
        status = "FAIL"
    if ptrain & pheld:
        findings.append("Professional held-out ids leak into ordinary training.")
        status = "FAIL"
    if any(a & b for i, a in enumerate(psets) for b in psets[i + 1:]):
        findings.append("Professional readiness forms overlap.")
        status = "FAIL"

    return result(
        "10-readiness-integrity", status,
        "Checks held-out isolation, repeatability, and resistance to readiness-by-familiarity.",
        findings,
        {
            "foundation_forms": sorted(fforms),
            "foundation_training_items": len(ftrain),
            "foundation_heldout_union": len(set().union(*fsets)) if fsets else 0,
            "professional_forms": sorted(pforms),
            "professional_training_items": len(ptrain),
            "professional_heldout_union": len(pheld),
        },
    )


VALIDATORS = [
    v01_scope_scenario_alignment,
    v02_cognitive_demand,
    v03_decision_hinge,
    v04_one_best_answer,
    v05_distractor_plausibility,
    v06_cue_resistance,
    v07_contrastive_rationales,
    v08_transfer_diversity,
    v09_learning_loop,
    v10_readiness_integrity,
]


def write_report(r):
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    stem = r["validator"]
    (REPORT_DIR / f"{stem}.json").write_text(
        json.dumps(r, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    lines = [
        f"# {stem}", "", f"**Status:** {r['status']}", "", r["summary"], "",
        "## Findings", "",
    ]
    lines += [f"- {x}" for x in r["findings"]] if r["findings"] else ["- None."]
    lines += ["", "## Metrics", "", "~~~json",
              json.dumps(r["metrics"], indent=2, ensure_ascii=False), "~~~", ""]
    (REPORT_DIR / f"{stem}.md").write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", type=int, choices=range(1, 11))
    args = parser.parse_args()
    funcs = [VALIDATORS[args.only - 1]] if args.only else VALIDATORS
    results = []
    for fn in funcs:
        r = fn()
        results.append(r)
        write_report(r)
        print(f"{r['status']:4}  {r['validator']}: {r['summary']}")
        for finding in r["findings"][:8]:
            print(f"      - {finding}")
        if len(r["findings"]) > 8:
            print(f"      - ... {len(r['findings']) - 8} more")
    if len(results) > 1:
        summary = {
            "validators": len(results),
            "pass": sum(r["status"] == "PASS" for r in results),
            "warn": sum(r["status"] == "WARN" for r in results),
            "fail": sum(r["status"] == "FAIL" for r in results),
            "results": [{"validator": r["validator"], "status": r["status"]} for r in results],
        }
        (REPORT_DIR / "summary.json").write_text(
            json.dumps(summary, indent=2) + "\n", encoding="utf-8"
        )
    return 1 if any(r["status"] == "FAIL" for r in results) else 0


if __name__ == "__main__":
    raise SystemExit(main())
