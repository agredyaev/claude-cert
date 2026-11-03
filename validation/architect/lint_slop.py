#!/usr/bin/env python3
from __future__ import annotations
import json,re,statistics,sys
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]

def load(p): return json.loads((ROOT/p).read_text(encoding="utf-8"))
def words(s): return re.findall(r"[a-z0-9]+", (s or "").lower())
def norm(s): return " ".join(words(s))
STOP={"the","a","an","and","or","to","of","in","for","is","are","with","that","this","which","what","how","should","would","could"}

def similarity(a,b):
    A={x for x in words(a) if len(x)>2 and x not in STOP}; B={x for x in words(b) if len(x)>2 and x not in STOP}
    return len(A&B)/len(A|B) if A and B else 0

def audit(name,qs):
    findings=[]; metrics={}
    starts=Counter(); exp_starts=Counter(); absolute_wrong=0; absolute_correct=0; giveaway=0
    abs_re=re.compile(r"\b(always|never|obviously|simply|just|guarantee[sd]?|impossible|only)\b",re.I)
    correct_lens=[]; wrong_lens=[]
    for q in qs:
        stem=(q.get("situation") or "")+" "+(q.get("question") or "")
        sims=[]
        for o in q.get("options",[]):
            txt=o.get("text",""); exp=o.get("explanation","")
            starts[" ".join(words(txt)[:5])] += 1
            exp_starts[" ".join(words(exp)[:5])] += 1
            (correct_lens if o.get("correct") else wrong_lens).append(len(words(txt)))
            if abs_re.search(txt):
                if o.get("correct"): absolute_correct+=1
                else: absolute_wrong+=1
            sims.append((similarity(stem,txt), bool(o.get("correct"))))
        if sims:
            c=max((s for s,c in sims if c),default=0); w=max((s for s,c in sims if not c),default=0)
            if c>=0.42 and c-w>=0.18: giveaway+=1
    repeated=[(k,v) for k,v in starts.items() if k and v>=6]
    repeated_exp=[(k,v) for k,v in exp_starts.items() if k and v>=10]
    if repeated: findings.append(f"{name}: repeated option openings >=6: {repeated[:10]}")
    if repeated_exp: findings.append(f"{name}: repeated rationale openings >=10: {repeated_exp[:10]}")
    if giveaway > max(3, round(len(qs)*0.02)): findings.append(f"{name}: {giveaway} stems strongly lexical-cue the correct option.")
    total_abs=absolute_correct+absolute_wrong
    if total_abs>=10 and absolute_wrong/max(1,total_abs)>.9:
        findings.append(f"{name}: absolute-word cue is highly asymmetric ({absolute_wrong} wrong vs {absolute_correct} correct).")
    ratio=statistics.mean(correct_lens)/max(1,statistics.mean(wrong_lens))
    if ratio>1.25 or ratio<0.80: findings.append(f"{name}: mean correct/wrong option length ratio {ratio:.2f}.")
    metrics.update({
        "questions":len(qs),"repeated_option_openings":repeated[:20],"repeated_rationale_openings":repeated_exp[:20],
        "lexical_giveaway_items":giveaway,"absolute_word_wrong":absolute_wrong,"absolute_word_correct":absolute_correct,
        "correct_wrong_mean_length_ratio":round(ratio,3)
    })
    return findings,metrics

def main():
    tracks={
      "Foundation":load("ccaf/data/imported_en.json")+load("ccaf/data/multi_en.json"),
      "Professional":load("ccap/data/questions.json"),
    }
    all_find=[]; out={}
    for name,qs in tracks.items():
        f,m=audit(name,qs); all_find+=f; out[name]={"findings":f,"metrics":m}
    path=ROOT/"validation/architect/reports/anti-slop.json"; path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps({"status":"FAIL" if all_find else "PASS","tracks":out},indent=2)+"\n")
    print(("FAIL" if all_find else "PASS"),"anti-slop")
    for f in all_find: print("-",f)
    return 1 if all_find else 0
if __name__=="__main__": raise SystemExit(main())
