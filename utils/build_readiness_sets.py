#!/usr/bin/env python3
"""Build deterministic held-out readiness sets for CCAR-F and CCAR-P.

Readiness items are physically removed from the ordinary training bank. Selection
is deterministic so a rebuild cannot quietly expose a new test set to a learner
who has already trained on the old one.
"""
from __future__ import annotations

import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load(path: str):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def score(track: str, qid: str) -> str:
    return hashlib.sha256(f"{track}:{qid}".encode()).hexdigest()


def choose(
    seed: str,
    questions: list[dict],
    targets: dict[str, int],
    reserve_min_per_objective: int = 0,
) -> dict:
    selected: list[dict] = []
    selected_ids: set[str] = set()
    remaining_per_objective = Counter(
        (str(q["domain"]), str(q["task_id"])) for q in questions
    )

    def take(q: dict) -> None:
        key = (str(q["domain"]), str(q["task_id"]))
        if remaining_per_objective[key] <= reserve_min_per_objective:
            raise SystemExit(
                f"{seed}: selecting {q['id']} would leave fewer than "
                f"{reserve_min_per_objective} reserved training/future-form items "
                f"for objective {key[1]}"
            )
        selected.append(q)
        selected_ids.add(q["id"])
        remaining_per_objective[key] -= 1

    for domain, target in targets.items():
        pool = [q for q in questions if str(q["domain"]) == domain]
        by_objective: dict[str, list[dict]] = defaultdict(list)
        for q in pool:
            by_objective[str(q["task_id"])].append(q)

        if len(by_objective) > target:
            raise SystemExit(
                f"{seed} D{domain}: {len(by_objective)} objectives cannot fit in {target} held-out items"
            )

        # One unseen item per objective first.
        for objective in sorted(by_objective, key=lambda x: [int(p) for p in x.split(".")]):
            candidates = sorted(by_objective[objective], key=lambda q: score(seed, q["id"]))
            q = candidates[0]
            take(q)

        # Fill the rest by stable hash. Response format is deliberately not a
        # primary sort key: otherwise a small MR corpus can be consumed entirely
        # by the held-out set and disappear from ordinary training.
        remaining = [q for q in pool if q["id"] not in selected_ids]
        remaining.sort(key=lambda q: score(seed, q["id"]))
        need = target - sum(1 for q in selected if str(q["domain"]) == domain)
        for q in remaining:
            if need <= 0:
                break
            key = (str(q["domain"]), str(q["task_id"]))
            if remaining_per_objective[key] <= reserve_min_per_objective:
                continue
            take(q)
            need -= 1
        if need:
            raise SystemExit(
                f"{seed} D{domain}: cannot fill {target} held-out items while "
                f"reserving {reserve_min_per_objective} per objective"
            )

    if len(selected) != sum(targets.values()):
        raise SystemExit(f"{seed}: selected {len(selected)} != requested {sum(targets.values())}")

    # Every held-out form should exercise both official response formats when
    # the source corpus contains MR items. Swap one in without losing objective
    # coverage or changing domain counts.
    if not any(isinstance(q.get("correct"), list) for q in selected):
        selected_per_objective = Counter((str(q["domain"]), str(q["task_id"])) for q in selected)
        candidates = sorted(
            [q for q in questions if q["id"] not in selected_ids and isinstance(q.get("correct"), list)],
            key=lambda q: score(seed + ":mr", q["id"]),
        )
        swapped = False
        for candidate in candidates:
            domain = str(candidate["domain"])
            removable = [
                q for q in selected
                if str(q["domain"]) == domain
                and not isinstance(q.get("correct"), list)
                and selected_per_objective[(domain, str(q["task_id"]))] > 1
            ]
            if not removable:
                continue
            candidate_key = (str(candidate["domain"]), str(candidate["task_id"]))
            if remaining_per_objective[candidate_key] <= reserve_min_per_objective:
                continue
            victim = sorted(removable, key=lambda q: score(seed + ":victim", q["id"]))[0]
            victim_key = (str(victim["domain"]), str(victim["task_id"]))
            selected.remove(victim)
            selected_ids.remove(victim["id"])
            remaining_per_objective[victim_key] += 1
            take(candidate)
            swapped = True
            break
        if candidates and not swapped:
            raise SystemExit(f"{seed}: could not add MR without losing objective/domain coverage")

    per_domain = Counter(str(q["domain"]) for q in selected)
    per_objective = Counter(str(q["task_id"]) for q in selected)
    return {
        "version": 1,
        "seed": seed,
        "policy": "held-out; excluded from ordinary study, drills, and bank browsing",
        "selection": "deterministic SHA-256 by item id; one item per official objective before fill",
        "items": len(selected),
        "multiple_response": sum(isinstance(q.get("correct"), list) for q in selected),
        "per_domain": dict(sorted(per_domain.items())),
        "per_objective": dict(sorted(per_objective.items())),
        "ids": [q["id"] for q in selected],
    }


def main():
    foundation = load("ccaf/data/imported_en.json") + load("ccaf/data/multi_en.json")
    professional = load("ccap/data/questions.json")

    specs = [
        (
            "CCAR-F",
            foundation,
            {"1": 16, "2": 11, "3": 12, "4": 12, "5": 9},
            ROOT / "ccaf/data/readiness_ids.json",
        ),
        (
            "CCAR-P",
            professional,
            {"1": 11, "2": 8, "3": 12, "4": 10, "5": 9, "6": 9, "7": 4},
            ROOT / "ccap/data/readiness_ids.json",
        ),
    ]

    for track, questions, targets, out in specs:
        available = list(questions)
        forms = {}
        union = []
        form_names = ("a", "b", "c") if track == "CCAR-F" else ("a", "b")
        for form in form_names:
            reserve = 0
            if track == "CCAR-P":
                reserve = 6 if form == "a" else 5
            data = choose(
                f"{track}:{form}",
                available,
                targets,
                reserve_min_per_objective=reserve,
            )
            forms[form] = data
            used = set(data["ids"])
            union.extend(data["ids"])
            available = [q for q in available if q["id"] not in used]

        training = [q for q in questions if q["id"] not in set(union)]
        training_by_objective = Counter(str(q["task_id"]) for q in training)
        min_training = min(training_by_objective.values())
        training_mr = sum(isinstance(q.get("correct"), list) for q in training)
        if min_training < 5:
            raise SystemExit(f"{track}: held-out split leaves an objective with only {min_training} training items")
        if training_mr == 0:
            raise SystemExit(f"{track}: held-out split consumes every multiple-response training item")

        payload = {
            "version": 2,
            "track": track,
            "policy": (
                "three non-overlapping held-out forms; excluded from ordinary study, drills, and bank browsing"
                if track == "CCAR-F"
                else "two non-overlapping held-out forms; excluded from ordinary study, drills, and bank browsing"
            ),
            "selection": "deterministic SHA-256 by item id; one item per official objective before fill",
            "forms": forms,
            "ids": union,
            "training_items_remaining": len(training),
            "training_multiple_response": training_mr,
            "training_min_per_objective": min_training,
        }
        out.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(
            f"{track}: forms=" + "/".join(f"{k.upper()}:{v['items']}" for k, v in forms.items()) +
            ", MR=" + "/".join(f"{k.upper()}:{v['multiple_response']}" for k, v in forms.items()) +
            f"; training={len(training)}, training MR={training_mr}, min/objective={min_training}"
        )



if __name__ == "__main__":
    main()
