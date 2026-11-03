#!/usr/bin/env python3
from __future__ import annotations
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))

def foundation():
    bp = load("ccaf/data/blueprint.json")
    meta = load("ccaf/data/objectives.json")
    guidance = load("ccaf/data/objective_guidance.json")
    source_matrix = load("validation/architect/source_matrix.json")
    cases = load("ccaf/data/scenario_cases.json")["scenarios"]
    questions = load("ccaf/data/imported_en.json") + load("ccaf/data/multi_en.json")
    readiness = load("ccaf/data/readiness_ids.json")
    held = set(readiness.get("ids", []))
    q_by_task = defaultdict(list)
    for q in questions:
        q_by_task[str(q["task_id"])].append(q)
    report_by_task = defaultdict(list)
    for rid, tid in meta["objective_subdomains"].items():
        report_by_task[str(tid)].append(rid)
    case_by_domain = defaultdict(list)
    for case in cases:
        for d in case["primary_domains"]:
            case_by_domain[str(d)].append(case["id"])
    out = {"code":"CCAR-F","domains":{}}
    for d, spec in bp["domains"].items():
        tasks=[]
        for i, statement in enumerate(spec["objectives"],1):
            tid=f"{d}.{i}"
            qs=q_by_task[tid]
            report_ids=sorted(report_by_task.get(tid, []))
            tasks.append({
                "id":tid,
                "statement":statement,
                "score_report_units":[
                    {
                        "id":rid,
                        "statement":meta["objectives"][rid],
                        "explanation":guidance[rid]["explanation"],
                        "example":guidance[rid]["example"],
                        "guidance":guidance[rid]["guidance"],
                    } for rid in report_ids
                ],
                "case_families":case_by_domain.get(d, []),
                "sources":source_matrix["foundation"]["domains"][d]["sources"],
                "questions":{
                    "total":len(qs),
                    "training":sum(q["id"] not in held for q in qs),
                    "held_out":sum(q["id"] in held for q in qs),
                    "multiple_response":sum(isinstance(q.get("correct"), list) for q in qs),
                }
            })
        out["domains"][d]={"name":spec["name"],"weight":spec["weight"],"tasks":tasks}
    out["scenario_families"]=[{"id":c["id"],"name":c["name"],"primary_domains":c["primary_domains"],"prompt_count":len(c["prompts"])} for c in cases]
    return out

def professional():
    bp=load("ccap/data/objectives.json")
    guidance=load("ccap/data/objective_guidance.json")
    source_matrix=load("validation/architect/source_matrix.json")
    questions=load("ccap/data/questions.json")
    readiness=load("ccap/data/readiness_ids.json")
    held=set(readiness.get("ids", []))
    q_by_task=defaultdict(list)
    for q in questions:q_by_task[str(q["task_id"])].append(q)
    capstone=load("ccap/data/capstone.json")
    out={"code":"CCAR-P","domains":{}}
    for d,spec in bp["domains"].items():
        tasks=[]
        for i,statement in enumerate(spec["objectives"],1):
            tid=f"{d}.{i}"; qs=q_by_task[tid]; g=guidance[tid]
            tasks.append({
                "id":tid,"statement":statement,
                "explanation":g["explanation"],"example":g["example"],"guidance":g["guidance"],
                "sources":source_matrix["professional"]["domains"][d]["sources"],
                "questions":{
                    "total":len(qs),
                    "training":sum(q["id"] not in held for q in qs),
                    "held_out":sum(q["id"] in held for q in qs),
                    "multiple_response":sum(isinstance(q.get("correct"), list) for q in qs),
                }
            })
        out["domains"][d]={"name":spec["name"],"weight":spec["weight"],"tasks":tasks}
    out["capstone"]={
        "artifact_count":len(capstone.get("artifacts",[])),
        "stress_test_count":len(capstone.get("stress_tests",[])),
        "artifacts":[{"id":a["id"],"title":a["title"]} for a in capstone.get("artifacts",[])],
        "stress_tests":[{"id":a["id"],"title":a["title"]} for a in capstone.get("stress_tests",[])],
    }
    return out

def main():
    data={"version":1,"purpose":"Canonical learning graph: official scope -> finer guidance -> cases -> questions -> evidence.","tracks":{"CCAR-F":foundation(),"CCAR-P":professional()}}
    path=ROOT/"validation/architect/knowledge_ontology.json"
    path.write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(path)

if __name__=="__main__": main()
