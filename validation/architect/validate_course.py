#!/usr/bin/env python3
"""Ten independent validation lenses for the Architect training corpus.

Each validator loads its own inputs and does not consume another validator's
result. The aggregate command is only a runner/report writer.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "utils"))

REPORT_DIR = ROOT / "validation" / "architect" / "reports"
BASELINE = ROOT / "validation" / "architect" / "official_baseline.json"


def load_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def foundation_bank():
    import exam_data
    return exam_data.load("en")


def professional_bank():
    questions = load_json(ROOT / "ccap" / "data" / "questions.json")
    readiness = load_json(ROOT / "ccap" / "data" / "readiness_ids.json")
    heldout = set(readiness.get("ids", []))
    return [q for q in questions if q["id"] not in heldout]


def result(name, status, summary, findings=None, metrics=None):
    return {
        "validator": name,
        "status": status,
        "summary": summary,
        "findings": findings or [],
        "metrics": metrics or {},
    }


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def norm(s):
    return re.sub(r"\s+", " ", (s or "").strip()).lower()


def validator_01_official_blueprint():
    base = load_json(BASELINE)
    findings, metrics = [], {}
    status = "PASS"

    for track, meta in (("Foundation", base["foundation"]), ("Professional", base["professional"])):
        p = ROOT / meta["source"]
        if not p.exists():
            findings.append(f"{track}: official snapshot missing: {p.relative_to(ROOT)}")
            status = "FAIL"
            continue
        actual = sha256(p)
        metrics[f"{track.lower()}_pdf_sha256"] = actual
        if actual != meta["source_sha256"]:
            findings.append(f"{track}: source PDF SHA-256 drifted from the reviewed snapshot.")
            status = "FAIL"

    f = load_json(ROOT / "ccaf" / "data" / "blueprint.json")
    p = load_json(ROOT / "ccap" / "data" / "objectives.json")
    for track, actual, expected in (
        ("Foundation", f["domains"], base["foundation"]["domains"]),
        ("Professional", p["domains"], base["professional"]["domains"]),
    ):
        if list(actual) != list(expected):
            findings.append(f"{track}: domain ids/order differ from official baseline.")
            status = "FAIL"
        for did, exp in expected.items():
            got = actual.get(did)
            if not got:
                continue
            if got["name"] != exp["name"]:
                findings.append(f"{track} D{did}: domain label drift: {got['name']!r} != {exp['name']!r}")
                status = "FAIL"
            if got["weight"] != exp["weight"]:
                findings.append(f"{track} D{did}: weight {got['weight']} != official {exp['weight']}.")
                status = "FAIL"
            if got["objectives"] != exp["objectives"]:
                findings.append(f"{track} D{did}: task statements/objectives drifted.")
                status = "FAIL"

    metrics["foundation_objectives"] = sum(len(v["objectives"]) for v in base["foundation"]["domains"].values())
    metrics["professional_objectives"] = sum(len(v["objectives"]) for v in base["professional"]["domains"].values())
    return result("01-official-blueprint", status,
                  "Exact exam facts, domain labels, weights, and objectives against reviewed official snapshots.",
                  findings, metrics)


def validator_02_provenance_and_scope():
    findings = []
    status = "PASS"
    paths = [
        ROOT / "ccaf" / "guide_en.md",
        ROOT / "ccap" / "guide_en.md",
        ROOT / "scripts" / "build-pages.mjs",
    ]
    text = "\n".join(p.read_text(encoding="utf-8") for p in paths)

    patterns = {
        "unsubstantiated exam equivalence": [
            r"format and difficulty match the real exam",
            r"uses the same scenarios and format",
        ],
        "community/candidate-reported content in core guides": [
            r"community-reported",
            r"candidate-reported",
            r"candidates also report",
        ],
    }
    for label, pats in patterns.items():
        count = sum(len(re.findall(pat, text, flags=re.I)) for pat in pats)
        if count:
            findings.append(f"{label}: {count} occurrence(s).")
            status = "FAIL"

    ui = (ROOT / "scripts" / "build-pages.mjs").read_text(encoding="utf-8")
    admin_terms = ["Partner Academy", "OnVUE system test", "Registered and slot booked",
                   "Workspace ready", "tier discount", "book the slot"]
    ui_hits = [term for term in admin_terms if term.lower() in ui.lower()]
    if ui_hits:
        findings.append("Training UX still contains administrative/sales material: " + ", ".join(ui_hits))
        status = "FAIL"

    return result("02-provenance-scope", status,
                  "Official exam scope is separated from training policy, community reports, and non-training material.",
                  findings, {"scanned_files": len(paths), "admin_ui_hits": len(ui_hits)})


def validator_03_exam_format_fidelity():
    base = load_json(BASELINE)
    f, p = foundation_bank(), professional_bank()
    findings = []
    status = "PASS"

    def multi(qs):
        return [q for q in qs if isinstance(q.get("correct"), list)]

    fm, pm = multi(f), multi(p)
    if not fm:
        findings.append("Foundation bank has zero multiple-response items although CCAR-F officially includes multiple-response.")
        status = "FAIL"
    if not pm:
        findings.append("Professional bank has zero multiple-response items although CCAR-P officially includes multiple-response.")
        status = "FAIL"

    for track, ms in (("Foundation", fm), ("Professional", pm)):
        for q in ms:
            key = q.get("correct") or []
            if q.get("select") != len(key):
                findings.append(f"{track} {q.get('id')}: select count does not match key.")
                status = "FAIL"
            if not re.search(r"\bselect\s+(?:\d+|one|two|three|four|five)\b", q.get("question", ""), re.I):
                findings.append(f"{track} {q.get('id')}: multiple-response stem does not state selection count.")
                status = "FAIL"

    return result("03-exam-format", status,
                  "Question-format coverage and select-N mechanics against the official MC/MR formats.",
                  findings, {
                      "foundation_items": len(f),
                      "foundation_multi": len(fm),
                      "foundation_multi_pct": round(len(fm) / len(f) * 100, 1) if f else 0,
                      "professional_items": len(p),
                      "professional_multi": len(pm),
                      "professional_multi_pct": round(len(pm) / len(p) * 100, 1) if p else 0,
                      "foundation_official_items": base["foundation"]["items"],
                      "professional_official_items": base["professional"]["items"],
                  })


def validator_04_objective_coverage():
    base = load_json(BASELINE)
    f, p = foundation_bank(), professional_bank()
    findings = []
    status = "PASS"

    for track, qs, domains, guide_path in (
        ("Foundation", f, base["foundation"]["domains"], ROOT / "ccaf" / "guide_en.md"),
        ("Professional", p, base["professional"]["domains"], ROOT / "ccap" / "guide_en.md"),
    ):
        guide = guide_path.read_text(encoding="utf-8")
        counts = Counter((str(q.get("domain")), q.get("objective")) for q in qs)
        vals = []
        for did, d in domains.items():
            for obj in d["objectives"]:
                n = counts[(did, obj)]
                vals.append(n)
                if n == 0:
                    findings.append(f"{track} D{did}: no question covers {obj!r}.")
                    status = "FAIL"
                if obj not in guide:
                    findings.append(f"{track} D{did}: objective absent verbatim from study guide: {obj!r}.")
                    status = "FAIL"
        if vals and min(vals) < 5:
            findings.append(f"{track}: some objectives have fewer than 5 practice items (min={min(vals)}).")
            status = "FAIL"

    ontology_path = ROOT / "validation" / "architect" / "knowledge_ontology.json"
    ontology_metrics = {}
    if not ontology_path.exists():
        findings.append("Generated Architect knowledge ontology is missing.")
        status = "FAIL"
    else:
        ontology = load_json(ontology_path).get("tracks", {})
        for code, expected_count in (("CCAR-F", 30), ("CCAR-P", 38)):
            track = ontology.get(code, {})
            tasks = [task for domain in track.get("domains", {}).values() for task in domain.get("tasks", [])]
            if len(tasks) != expected_count:
                findings.append(f"{code}: ontology has {len(tasks)} official tasks; expected {expected_count}.")
                status = "FAIL"
            no_sources = [task.get("id") for task in tasks if not task.get("sources")]
            no_training = [task.get("id") for task in tasks if task.get("questions", {}).get("training", 0) < 5]
            no_held = [task.get("id") for task in tasks if task.get("questions", {}).get("held_out", 0) < 1]
            if no_sources:
                findings.append(f"{code}: ontology tasks without official/current sources: {no_sources}.")
                status = "FAIL"
            if no_training:
                findings.append(f"{code}: ontology tasks with fewer than five training items: {no_training}.")
                status = "FAIL"
            if no_held:
                findings.append(f"{code}: ontology tasks missing held-out evidence: {no_held}.")
                status = "FAIL"
            ontology_metrics[code] = {
                "tasks": len(tasks),
                "min_training_per_task": min((task["questions"]["training"] for task in tasks), default=0),
                "min_held_out_per_task": min((task["questions"]["held_out"] for task in tasks), default=0),
                "tasks_without_sources": len(no_sources),
            }

    return result("04-objective-coverage", status,
                  "Every official task statement/objective has material, repeated practice, held-out evidence, and source coverage.",
                  findings, {
                      "foundation_mapped": sum(bool(q.get("objective")) for q in f),
                      "professional_mapped": sum(bool(q.get("objective")) for q in p),
                      "ontology": ontology_metrics,
                  })


def _key_errors(qs):
    errors = []
    for q in qs:
        opts = q.get("options") or []
        letters = [o.get("letter") for o in opts]
        expected_letters = [chr(ord("A") + i) for i in range(len(opts))]
        if letters != expected_letters:
            errors.append(f"{q.get('id')}: non-sequential option letters {letters}")
        flagged = sorted(o["letter"] for o in opts if o.get("correct"))
        key = sorted(q["correct"]) if isinstance(q.get("correct"), list) else [q.get("correct")]
        if flagged != key:
            errors.append(f"{q.get('id')}: key {key} != correct flags {flagged}")
        if q.get("select", len(key)) != len(key):
            errors.append(f"{q.get('id')}: select count != key size")
        if any(k not in letters for k in key):
            errors.append(f"{q.get('id')}: key points outside options")
    return errors


def validator_05_key_integrity_and_defensibility():
    f, p = foundation_bank(), professional_bank()
    findings = []
    errors = _key_errors(f) + _key_errors(p)
    status = "FAIL" if errors else "PASS"
    findings.extend(errors[:50])

    sensitive_terms = [
        "updatedToolOutput", "updatedMCPToolOutput", ".claude/commands/",
        "allowedTools", "bypassPermissions", "Message Batches API", "--resume",
        "--bare", "fork_session", "tool_choice", "Agent tool",
    ]
    corpus = "\n".join([
        (ROOT / "ccaf" / "guide_en.md").read_text(encoding="utf-8"),
        (ROOT / "ccaf" / "data" / "imported_en.json").read_text(encoding="utf-8"),
        (ROOT / "ccap" / "guide_en.md").read_text(encoding="utf-8"),
        (ROOT / "ccap" / "data" / "questions.json").read_text(encoding="utf-8"),
    ])
    sensitive = {t: corpus.count(t) for t in sensitive_terms if corpus.count(t)}

    review_path = ROOT / "validation" / "architect" / "current_docs_review.md"
    required_review_markers = [
        "Reviewed: 2026-11-03",
        "Message Batches API",
        "Tool choice",
        "Agent SDK subagents",
        "Agent SDK hooks",
        "Agent SDK permissions",
        "Claude Code skills and custom commands",
        "Claude Code sessions",
        "Claude Code bare mode",
        "Model specifications",
    ]
    review_ok = review_path.exists()
    review_text = review_path.read_text(encoding="utf-8") if review_ok else ""
    missing_markers = [m for m in required_review_markers if m not in review_text]
    if not review_ok or missing_markers:
        findings.append("Current-product documentation review is missing or incomplete.")
        status = "FAIL"

    source_matrix_path = ROOT / "validation" / "architect" / "source_matrix.json"
    source_matrix_ok = source_matrix_path.exists()
    source_matrix_missing = []
    non_official_sources = []
    if source_matrix_ok:
        matrix = load_json(source_matrix_path)
        allowed_hosts = (
            "https://anthropic-partners.skilljar.com/",
            "https://platform.claude.com/",
            "https://code.claude.com/",
            "https://www.anthropic.com/",
            "https://modelcontextprotocol.io/",
        )
        for track, blueprint_path in (
            ("foundation", ROOT / "ccaf" / "data" / "blueprint.json"),
            ("professional", ROOT / "ccap" / "data" / "objectives.json"),
        ):
            blueprint_domains = load_json(blueprint_path)["domains"]
            mapped = matrix.get(track, {}).get("domains", {})
            for did in blueprint_domains:
                entry = mapped.get(str(did))
                if not entry or not entry.get("sources"):
                    source_matrix_missing.append(f"{track}:D{did}")
                    continue
                for url in entry["sources"]:
                    if not url.startswith(allowed_hosts):
                        non_official_sources.append(url)
    else:
        source_matrix_missing.append("source_matrix.json")

    if source_matrix_missing or non_official_sources:
        findings.append("Official-source coverage matrix is missing, incomplete, or contains non-official sources.")
        status = "FAIL"

    stale_patterns = {
        "legacy Task tool": r"subagent invocation tool, Task|Task tool spawns subagents|allowedTools[^\n]{0,80}\"Task\"",
        "false bare-mode claim": r"No --bare flag exists",
        "stale batch absolute": r"does not support multi-turn tool calling",
        "stale subagent forcing": r"tool_choice parameter to that subagent|@code-reviewer",
    }
    stale_hits = {}
    for label, pattern in stale_patterns.items():
        n = len(re.findall(pattern, corpus, flags=re.I))
        if n:
            stale_hits[label] = n
            findings.append(f"{label}: {n} stale occurrence(s).")
            status = "FAIL"

    return result("05-key-defensibility", status,
                  "Answer-key integrity plus current-document freshness for evolving Claude product behavior.",
                  findings, {
                      "structural_errors": len(errors),
                      "sensitive_term_occurrences": sensitive,
                      "current_docs_review": review_ok and not missing_markers,
                      "missing_review_markers": missing_markers,
                      "source_matrix": source_matrix_ok and not source_matrix_missing and not non_official_sources,
                      "source_matrix_missing": source_matrix_missing,
                      "non_official_sources": non_official_sources,
                      "stale_hits": stale_hits,
                  })


def validator_06_distractor_quality():
    findings = []
    status = "PASS"
    metrics = {}
    for name, qs in (("Foundation", foundation_bank()), ("Professional", professional_bank())):
        singles = [q for q in qs if isinstance(q.get("correct"), str)]
        letters = Counter(q["correct"] for q in singles)
        n = len(singles)
        expected = n / 4 if n else 0
        max_dev = max((abs(letters[x] - expected) / expected for x in "ABCD"), default=0)

        ratios = []
        duplicate_options = 0
        for q in qs:
            texts = [norm(o.get("text")) for o in q.get("options", [])]
            duplicate_options += len(texts) - len(set(texts))
            correct_lengths = [len(o.get("text", "").split()) for o in q["options"] if o.get("correct")]
            wrong_lengths = [len(o.get("text", "").split()) for o in q["options"] if not o.get("correct")]
            if correct_lengths and wrong_lengths:
                ratios.append(statistics.mean(correct_lengths) / max(1, statistics.mean(wrong_lengths)))

        if max_dev > 0.25:
            findings.append(f"{name}: correct-answer position imbalance is high ({dict(letters)}).")
            status = "FAIL"
        med = statistics.median(ratios) if ratios else 1
        if med > 1.35 or med < 0.74:
            findings.append(f"{name}: answer-length cue detected; median correct/wrong ratio={med:.2f}.")
            status = "FAIL"
        if duplicate_options:
            findings.append(f"{name}: {duplicate_options} duplicate option text(s) within items.")
            status = "FAIL"

        metrics[name.lower()] = {
            "single_answer_positions": dict(letters),
            "max_position_deviation": round(max_dev, 3),
            "median_correct_wrong_length_ratio": round(med, 3),
            "duplicate_options": duplicate_options,
        }

    return result("06-distractor-quality", status,
                  "Checks whether superficial cues can reveal the key without domain reasoning.",
                  findings, metrics)


def validator_07_explanation_quality():
    findings = []
    status = "PASS"
    metrics = {}
    for name, qs in (("Foundation", foundation_bank()), ("Professional", professional_bank())):
        empty, short = [], []
        for q in qs:
            for o in q.get("options", []):
                exp = (o.get("explanation") or "").strip()
                ref = f"{q.get('id')}:{o.get('letter')}"
                if not exp:
                    empty.append(ref)
                elif len(exp.split()) < 8:
                    short.append(ref)
        if empty:
            findings.append(f"{name}: {len(empty)} options have no rationale ({len(set(x.split(':')[0] for x in empty))} questions affected).")
            status = "FAIL"
        if short:
            findings.append(f"{name}: {len(short)} option rationales are shorter than 8 words.")
            status = "FAIL"
        metrics[name.lower()] = {
            "empty_explanations": len(empty),
            "short_explanations": len(short),
            "sample_empty": empty[:12],
            "sample_short": short[:12],
        }
    return result("07-explanation-quality", status,
                  "Per-option rationale completeness; wrong choices must be explained, not merely marked.",
                  findings, metrics)


def validator_08_scenario_and_skill_transfer():
    findings = []
    status = "PASS"
    metrics = {}
    decision_re = re.compile(
        r"\b(which|what|how|choose|select|design|most effective|best|should|primary|root cause|trade-?off)\b",
        re.I,
    )
    for name, qs in (("Foundation", foundation_bank()), ("Professional", professional_bank())):
        scenario = sum(bool((q.get("situation") or "").strip()) for q in qs)
        decision = sum(bool(decision_re.search(q.get("question", ""))) for q in qs)
        scenario_pct = scenario / len(qs) * 100 if qs else 0
        decision_pct = decision / len(qs) * 100 if qs else 0
        if scenario_pct < 85:
            findings.append(f"{name}: scenario-rich item share is only {scenario_pct:.1f}%.")
            status = "FAIL"
        if decision_pct < 75:
            findings.append(f"{name}: decision/judgment stem share is only {decision_pct:.1f}%.")
            status = "FAIL"
        metrics[name.lower()] = {
            "scenario_pct": round(scenario_pct, 1),
            "decision_stem_pct": round(decision_pct, 1),
        }

    source = (ROOT / "scripts" / "build-pages.mjs").read_text(encoding="utf-8")
    lab_markers = ["Multi-Tool Agent", "Claude Code", "Structured Data Extraction", "Multi-Agent Research"]
    missing = [m for m in lab_markers if m not in source]
    if missing:
        findings.append("Foundation path does not expose all four official hands-on exercise families: " + ", ".join(missing))
        status = "FAIL"
    metrics["hands_on_lab_markers_present"] = len(lab_markers) - len(missing)

    scenario_path = ROOT / "ccaf" / "data" / "scenario_cases.json"
    official_scenarios = [
        "Customer Support Resolution Agent",
        "Code Generation with Claude Code",
        "Multi-Agent Research System",
        "Developer Productivity with Claude",
        "Claude Code for Continuous Integration",
        "Structured Data Extraction",
    ]
    scenario_count = prompt_count = 0
    if not scenario_path.exists():
        findings.append("Foundation scenario-transfer corpus is missing.")
        status = "FAIL"
    else:
        scenario_data = load_json(scenario_path)
        scenarios = scenario_data.get("scenarios", [])
        scenario_count = len(scenarios)
        prompt_count = sum(len(s.get("prompts", [])) for s in scenarios)
        names = [s.get("name") for s in scenarios]
        if names != official_scenarios:
            findings.append("Foundation scenario-transfer corpus does not match the six published scenario families.")
            status = "FAIL"
        if prompt_count < 18:
            findings.append(f"Foundation scenario-transfer corpus has only {prompt_count} open tasks; expected at least 18.")
            status = "FAIL"

    capstone_path = ROOT / "ccap" / "data" / "capstone.json"
    artifact_count = stress_count = 0
    if not capstone_path.exists():
        findings.append("Professional end-to-end capstone is missing.")
        status = "FAIL"
    else:
        capstone = load_json(capstone_path)
        artifact_count = len(capstone.get("artifacts", []))
        stress_count = len(capstone.get("stress_tests", []))
        if artifact_count < 9 or stress_count < 5:
            findings.append(
                f"Professional capstone is too shallow: {artifact_count} artifacts / {stress_count} stress tests."
            )
            status = "FAIL"

    metrics["foundation_scenario_families"] = scenario_count
    metrics["foundation_open_case_tasks"] = prompt_count
    metrics["professional_capstone_artifacts"] = artifact_count
    metrics["professional_capstone_stress_tests"] = stress_count
    return result("08-skill-transfer", status,
                  "Scenario judgment, official Foundation case transfer, hands-on labs, and Professional end-to-end architecture transfer.",
                  findings, metrics)


def _token_set(q):
    txt = " ".join([q.get("situation") or "", q.get("question") or ""])
    toks = re.findall(r"[a-z0-9_]+", txt.lower())
    stop = {"the","a","an","and","or","to","of","in","for","is","are","with","that","this","which","what","how","your"}
    return {t for t in toks if len(t) > 2 and t not in stop}


def validator_09_duplication_and_balance():
    findings = []
    status = "PASS"
    metrics = {}
    for name, qs in (("Foundation", foundation_bank()), ("Professional", professional_bank())):
        exact = Counter(norm((q.get("situation") or "") + " " + q.get("question", "")) for q in qs)
        exact_dupes = [k for k, v in exact.items() if k and v > 1]
        if exact_dupes:
            findings.append(f"{name}: {len(exact_dupes)} exact duplicate stems.")
            status = "FAIL"

        by_obj = defaultdict(list)
        for q in qs:
            by_obj[(q.get("domain"), q.get("objective"))].append(q)
        near = []
        for group in by_obj.values():
            sets = [(_token_set(q), q.get("id")) for q in group]
            for i in range(len(sets)):
                a, aid = sets[i]
                for j in range(i + 1, len(sets)):
                    b, bid = sets[j]
                    if not a or not b:
                        continue
                    jac = len(a & b) / len(a | b)
                    if jac >= 0.78:
                        near.append((aid, bid, round(jac, 2)))
                        if len(near) >= 40:
                            break
                if len(near) >= 40:
                    break
            if len(near) >= 40:
                break

        counts = Counter((q.get("domain"), q.get("objective")) for q in qs)
        vals = [v for k, v in counts.items() if k[1]]
        ratio = max(vals) / min(vals) if vals else math.inf
        if ratio > 3.0:
            findings.append(f"{name}: objective coverage imbalance max/min={ratio:.2f}.")
            status = "FAIL"
        if len(near) > max(10, len(qs) * 0.03):
            findings.append(f"{name}: high near-duplicate pressure ({len(near)} sampled pairs).")
            status = "FAIL"
        metrics[name.lower()] = {
            "exact_duplicate_stems": len(exact_dupes),
            "near_duplicate_pairs_sampled": len(near),
            "near_duplicate_examples": near[:10],
            "objective_count_min": min(vals) if vals else 0,
            "objective_count_median": statistics.median(vals) if vals else 0,
            "objective_count_max": max(vals) if vals else 0,
            "objective_max_min_ratio": round(ratio, 2) if vals else None,
        }
    return result("09-duplication-balance", status,
                  "Checks repeated stems/templates and whether a few objectives dominate the corpus.",
                  findings, metrics)


def validator_10_learning_methodology():
    src = (ROOT / "scripts" / "build-pages.mjs").read_text(encoding="utf-8")
    app = (ROOT / "docs" / "app.js").read_text(encoding="utf-8")
    engine = (ROOT / "utils" / "build_exam_html.py").read_text(encoding="utf-8")
    findings = []
    status = "PASS"

    # Foundation method must remain practice-first and ordered.
    dashboard_start = src.index("function trainingDashboard")
    dashboard_end = src.index("const REPORT_THEME_READINGS", dashboard_start)
    dashboard = src[dashboard_start:dashboard_end]
    ordered_markers = [
        "Diagnostic", "Study", "Retrieval", "Scenario transfer", "Hands-on",
        "Spaced review", "Full mock", "Held-out readiness", "Evidence",
    ]
    positions = [dashboard.find(x) for x in ordered_markers]
    if any(x < 0 for x in positions) or positions != sorted(positions):
        findings.append(
            "Foundation sequence is missing or out of order: diagnostic -> study -> retrieval -> "
            "scenario transfer -> hands-on -> spaced review -> full mock -> held-out readiness -> evidence."
        )
        status = "FAIL"

    # Professional must have its own workspace instead of a loose guide/exam link.
    prof_start = src.index("function professionalDashboard")
    prof_end = src.index("function trainingDashboard", prof_start)
    prof_dashboard = src[prof_start:prof_end]
    prof_markers = ["Diagnostic", "Retrieval", "Capstone", "Spaced review", "Full mock", "Held-out readiness", "Evidence"]
    prof_positions = [prof_dashboard.find(x) for x in prof_markers]
    if any(x < 0 for x in prof_positions) or prof_positions != sorted(prof_positions):
        findings.append("Professional task-first sequence is missing or out of order.")
        status = "FAIL"
    if "38 objectives" not in prof_dashboard or "data-prof-objective-key" not in prof_dashboard:
        findings.append("Professional workspace does not surface mastery across all 38 objectives.")
        status = "FAIL"

    # Study-mode generation effect and full rationale review.
    for marker, message in [
        ("reason_label", "Study mode has no self-explanation step before feedback."),
        ("function commitStudy", "Study mode does not explicitly commit reasoning before grading."),
        ("const showExpl = reveal && Boolean(opt.explanation)", "Study feedback does not expose rationale for every option after commitment."),
        ("noteMastery(q, correct)", "Graded task solutions do not update task-statement mastery."),
        ("FIXED_EXAM", "Held-out readiness cannot enforce exam-only behavior."),
    ]:
        if marker not in engine:
            findings.append(message)
            status = "FAIL"

    if "ccaf-exam-en:mastery" not in app or "ccarp-exam-en:mastery" not in app:
        findings.append("Foundation and Professional mastery are not both persisted/surfaced.")
        status = "FAIL"
    if "ccaf-cases:state" not in app or "ccarp-capstone:state" not in app:
        findings.append("Scenario/capstone transfer evidence is not persisted.")
        status = "FAIL"
    if "professionalReady = checked === 10 && caseDone === 6 && labDone === 4 && masteredCount === 30 && readinessPassed" not in app:
        findings.append("Foundation -> Professional training gate is missing one or more evidence signals.")
        status = "FAIL"

    # Held-out sets: no overlap with training, official-sized forms, objective coverage.
    fmeta_path = ROOT / "ccaf" / "data" / "readiness_ids.json"
    pmeta_path = ROOT / "ccap" / "data" / "readiness_ids.json"
    readiness_metrics = {}
    if not fmeta_path.exists() or not pmeta_path.exists():
        findings.append("Held-out readiness metadata is missing.")
        status = "FAIL"
    else:
        fmeta = load_json(fmeta_path)
        pmeta = load_json(pmeta_path)
        fforms = fmeta.get("forms", {})
        pforms = pmeta.get("forms", {})
        if list(fforms) != ["a", "b", "c"]:
            findings.append("Foundation must keep three independent held-out forms A/B/C.")
            status = "FAIL"
        if list(pforms) != ["a", "b"]:
            findings.append("Professional must keep two independent held-out forms A/B.")
            status = "FAIL"

        fsets = [set(fforms[k].get("ids", [])) for k in fforms]
        if any(len(s) != 60 for s in fsets):
            findings.append("Every Foundation held-out form must contain exactly 60 items.")
            status = "FAIL"
        for i in range(len(fsets)):
            for j in range(i + 1, len(fsets)):
                if fsets[i] & fsets[j]:
                    findings.append("Foundation held-out forms overlap.")
                    status = "FAIL"
        if any(len(fforms[k].get("per_objective", {})) != 30 for k in fforms):
            findings.append("Each Foundation held-out form must cover all 30 task statements.")
            status = "FAIL"
        if any(int(fforms[k].get("multiple_response", 0)) < 1 for k in fforms):
            findings.append("Each Foundation held-out form must include multiple-response.")
            status = "FAIL"

        psets = [set(pforms[k].get("ids", [])) for k in pforms]
        if any(len(s) != 63 for s in psets):
            findings.append("Every Professional held-out form must contain exactly 63 items.")
            status = "FAIL"
        if len(psets) == 2 and psets[0] & psets[1]:
            findings.append("Professional held-out forms overlap.")
            status = "FAIL"
        if any(len(pforms[k].get("per_objective", {})) != 38 for k in pforms):
            findings.append("Each Professional held-out form must cover all 38 objectives.")
            status = "FAIL"
        if any(int(pforms[k].get("multiple_response", 0)) < 1 for k in pforms):
            findings.append("Each Professional held-out form must include multiple-response.")
            status = "FAIL"
        if int(pmeta.get("training_min_per_objective", 0)) < 5:
            findings.append("Professional held-out split leaves fewer than five training items for an objective.")
            status = "FAIL"
        f_training_ids = {q["id"] for q in foundation_bank()}
        p_training_ids = {q["id"] for q in professional_bank()}
        if f_training_ids & set(fmeta.get("ids", [])):
            findings.append("Foundation held-out items leak into the ordinary training bank.")
            status = "FAIL"
        if p_training_ids & set(pmeta.get("ids", [])):
            findings.append("Professional held-out items leak into the ordinary training bank.")
            status = "FAIL"

        readiness_metrics = {
            "foundation_forms": {k: {
                "items": v.get("items"),
                "multiple_response": v.get("multiple_response"),
                "objectives": len(v.get("per_objective", {})),
            } for k, v in fforms.items()},
            "foundation_training_remaining": len(f_training_ids),
            "professional_forms": {
                k: {
                    "items": v.get("items"),
                    "multiple_response": v.get("multiple_response"),
                    "objectives": len(v.get("per_objective", {})),
                } for k, v in pforms.items()
            },
            "professional_training_remaining": len(p_training_ids),
            "professional_training_min_per_objective": pmeta.get("training_min_per_objective"),
        }

    # Core public UI stays training-focused.
    marketing_terms = [
        "book the slot", "Partner Academy", "tier discount", "OnVUE system test",
        "Workspace ready", "Independent study interface", "not affiliated",
    ]
    hits = [t for t in marketing_terms if t.lower() in src.lower()]
    if hits:
        findings.append("Training UX still contains non-training copy: " + ", ".join(hits))
        status = "FAIL"

    return result(
        "10-learning-methodology",
        status,
        "Checks task-first sequencing, mastery, transfer evidence, independent held-out readiness, and removal of non-training UI content.",
        findings,
        {
            "foundation_sequence": ordered_markers,
            "professional_sequence": prof_markers,
            "readiness": readiness_metrics,
            "non_training_hits": hits,
        },
    )


VALIDATORS = [
    validator_01_official_blueprint,
    validator_02_provenance_and_scope,
    validator_03_exam_format_fidelity,
    validator_04_objective_coverage,
    validator_05_key_integrity_and_defensibility,
    validator_06_distractor_quality,
    validator_07_explanation_quality,
    validator_08_scenario_and_skill_transfer,
    validator_09_duplication_and_balance,
    validator_10_learning_methodology,
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
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", type=int, choices=range(1, 11))
    ap.add_argument("--no-write", action="store_true")
    args = ap.parse_args()
    funcs = [VALIDATORS[args.only - 1]] if args.only else VALIDATORS
    results = []
    for fn in funcs:
        r = fn()
        results.append(r)
        if not args.no_write:
            write_report(r)
        print(f"{r['status']:4}  {r['validator']}: {r['summary']}")
        for f in r["findings"][:8]:
            print(f"      - {f}")
        if len(r["findings"]) > 8:
            print(f"      - ... {len(r['findings']) - 8} more")
    if len(results) > 1 and not args.no_write:
        aggregate = {
            "validators": len(results),
            "pass": sum(r["status"] == "PASS" for r in results),
            "warn": sum(r["status"] == "WARN" for r in results),
            "fail": sum(r["status"] == "FAIL" for r in results),
            "results": [{"validator": r["validator"], "status": r["status"]} for r in results],
        }
        (REPORT_DIR / "summary.json").write_text(json.dumps(aggregate, indent=2) + "\n", encoding="utf-8")
    return 1 if any(r["status"] == "FAIL" for r in results) else 0


if __name__ == "__main__":
    raise SystemExit(main())
