# Claude Architect Trainer

A Foundation-first training workspace for Claude Certified Architect preparation. The primary learning path is deliberately sequential: **CCAR-F (Architect – Foundations) first, then CCAR-P (Architect – Professional)**. Foundations uses study, weighted drills, weak-spot review, full mock exams, and a readiness gate before Professional becomes the next training stage.

The training interface and workflow in this fork build on the open study corpus from [Ravn's Claude Certified Architect repository](https://github.com/ravnhq/claude-certified-architect). Source attribution and upstream history are intentionally preserved. This project is not affiliated with Anthropic.

GitHub Pages deployment is included in `.github/workflows/pages.yml`; the published base path is derived from the repository name automatically. The public trainer exposes **EN / RU interface chrome only**. Exam questions, certification terminology, and guide prose remain English in RU mode so practice stays aligned with the wording used on the real exams.

Before you book a Foundations slot, work through the
[preflight checklist](https://agredyaev.github.io/claude-cert/preflight/architect-foundations.html):
ten readiness checks, the exam blueprint, and a list of practice material. Your ticks stay in
the browser.

## Training scope

| Track | Exam code | Best fit | What this repo gives you |
|---|---|---|---|
| **Architect – Foundations** | CCAR-F | Practitioners building with Claude Code, the Claude Agent SDK, the Claude API, and MCP | EN/RU training interface over the English exam wording, plus the Foundation readiness checklist |
| **Architect – Professional** | CCAR-P | Architects responsible for production AI architecture, evaluation, governance, and lifecycle decisions | Stage 2 after CCAR-F: EN/RU interface over the English guide and 63-question practice exam |
| **Developer – Foundations** | CCDV-F | Engineers building and shipping production applications, agents, and workflows on the Claude platform | English study guide and a 53-question practice exam |
| **Associate – Foundations** | CCAO-F | Professionals using Claude for research, analysis, drafting, planning, and workflow improvement | English study guide, 60-question practice exam, and 758-question bank |

The four exams use different blueprints. Architect Foundations has five domains, Developer eight,
Professional seven, and Associate seven. Foundations material does not represent Professional coverage, and the
reverse is equally true; the same holds between every pair of tracks.

> **The public trainer uses EN / RU interface chrome only.** The exam questions, official terminology,
> and guide prose stay English in both modes. RU is intentionally an interface layer rather than a
> translated exam track, so practice stays aligned with the wording used during proctored testing.
> Legacy upstream translation source files are retained for provenance only and are not part of the published training UX.

## Exam facts

Exam-structure figures below come from the official exam guides, which are the authoritative
source and which Anthropic marks subject to change. Delivery and language rules (Pearson VUE,
English only) come from the official [certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications),
not the guides.

| | Architect – Foundations | Architect – Professional | Developer – Foundations | Associate – Foundations |
|---|---|---|---|---|
| Exam code | CCAR-F | CCAR-P | CCDV-F | CCAO-F |
| Items | 60 | 63 | 53 | 60 |
| Time | 120 minutes | 120 minutes | 120 minutes | 120 minutes |
| Passing score | 720 on a 100–1,000 scale | 720 on a 100–1,000 scale | 720 on a 100–1,000 scale | 720 on a 100–1,000 scale |
| List fee | $125 USD | $175 USD | $125 USD | $99 USD |
| Validity | 12 months | 12 months | 12 months | 12 months |
| Prerequisites | None | None | None | None |
| Delivery | Proctored by Pearson VUE, English only | Proctored by Pearson VUE, English only | Proctored by Pearson VUE, English only | Proctored online or at a test center |

**No course is required to sit any of the exams.** The credential is awarded on exam performance
alone. Anthropic publishes free prep courses, and they help, but they are not a gate.

**On the fee.** $125 and $175 are the list prices in the exam guides. The amount at checkout
reflects any discount for your partner tier, so what you pay may be lower — per the FAQ,
Registered-tier partners pay full price, Select/Preferred/Global Premier partners get 50% off,
and through August 31, 2026 Global Premier partners pay nothing. Foundations cost $99 until the
price rose to $125 on June 30, 2026; registrations before that date paid the lower price.

### Policies worth knowing before you register

- Up to **4 attempts** per exam in a rolling 12-month period. The fee applies to each attempt.
- Retake waits after a failure: **14 days**, then **30**, then **90**.
- Reschedule or cancel **more than 24 hours ahead**. Inside 24 hours, or a no-show, forfeits the fee.
- Bring a valid, unexpired **government photo ID** whose name matches your registration exactly.
- Renewal is **free and non-proctored** if you renew on time. Let the credential lapse and you
  retake the full exam at full fee.

## Official access

- Certification is restricted to members of the Anthropic Partner Network and requires
  registration with a verified partner-company email. See [Claude Partner Network](https://claude.com/partners).
- **Claude Certified Associate – Foundations** costs $99 and is aimed at productivity-tool users;
  unlike the architect and developer tracks, it does not expect API development knowledge.
  It is the one certification that does **not** count toward Claude Partner Network eligibility;
  the other three do.
- Register through the [Anthropic Partner Academy](https://anthropic-partners.skilljar.com/page/partner-certifications),
  then schedule with Pearson VUE using the credentials they email you.
- Official guides, all marked subject to change:
  [Foundations](https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification) ·
  [Professional](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf) ·
  [Developer](https://anthropic-partners.skilljar.com/claude-certified-developer-foundations-certification) ·
  [Associate](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
- See also the [certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications).

### Prep courses

Anthropic publishes **seven free prep courses** for Foundations and a **five-course path** for
Professional. None are required. Ranked by how much of the Foundations blueprint they actually
cover: **Claude Code in Action** (Domain 3, 20%), **Introduction to Model Context Protocol**
(Domain 2, 18%), and **Building with the Claude API** (Domains 2 and 4). Claude with Amazon
Bedrock and Claude on Google Cloud are long and only partly on-blueprint; Claude 101 and AI
Fluency are orientation rather than exam preparation.

- [Foundations prep courses](https://anthropic-partners.skilljar.com/page/claude-certified-architect-foundations-prep-courses)
- [Professional prep path](https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional) — 5 courses, about 12 hours

## Foundations study guides

| Public view | Source content | PDF |
|---|---|---|
| English | [`ccaf/guide_en.md`](./ccaf/guide_en.md) | English PDF generated on deploy |
| Русский интерфейс | Same English guide content with Russian navigation chrome | Uses the same English source |

Only the English PDF is published; RU is an interface layer, not a translated certification guide.

## Foundations practice exam

A self-paced HTML quiz that runs entirely in your browser. Each attempt draws **12 random
questions per domain — 60 in total**. The English bank holds 607 items: the 76 scenario
questions from the guide, 60 domain-style questions from the mock bank, and 471 imported
practice items tagged to the official task statements. EN and RU use the same English bank and
share the same saved attempt / weak-spot state. The score is scaled to 1,000 with a passing cut
of **720**, mirroring the real scale.

Features: a fresh 60-question draw each attempt, questions randomized within each domain, a
**study** mode that reveals answers as you go with a rationale for every option, an **exam** mode
that reveals at the end, per-domain breakdown against the pass threshold, and progress saved in
`localStorage` so a refresh keeps your place. **Restart** draws a new set. A domain selector
drills a single domain's whole bank instead, scored raw with no pass/fail verdict.

- [`ccaf/dist/exam_en.html`](./ccaf/dist/exam_en.html) · [`ccaf/dist/exam_ru.html`](./ccaf/dist/exam_ru.html)

## Foundations cheatsheet

A one-page reference distilling the exam into **12 recurring principles** — each with the correct
approach and the trap to avoid — **5 questions to ask when two answers look equally good**, and a
breakdown of the 136 hand-authored questions by domain, with weights and answer-letter distribution.

- [`ccaf/dist/cheatsheet_en.html`](./ccaf/dist/cheatsheet_en.html) — the RU dashboard reuses the same English terminology.

## Associate study guide and practice exam

[`ccaof/guide_en.md`](./ccaof/guide_en.md) · [read online](https://agredyaev.github.io/claude-cert/guides/associate-en.html)

The guide covers all **30 official objectives** across prompting, output validation, product and
model selection, workflow integration, configuration and knowledge management, governance, and
troubleshooting. It includes the official exam facts and policies, sample-question lessons, a
four-week plan, and current official Anthropic product references.

Each practice attempt draws **60 questions** in the official proportions: **8 / 13 / 7 / 10 /
7 / 9 / 6** by domain. The local bank contains **758 unique public practice records**, covering
all 30 objectives. CertSafari advertises 757 questions; the export also contains one distinct
public sample variant. Multiple-response items are scored
all-or-nothing.

- [`ccaof/dist/exam_en.html`](./ccaof/dist/exam_en.html)
- [`ccaof/dist/bank_en.html`](./ccaof/dist/bank_en.html)

> **Third-party practice content, not live exam content.** The questions and answer keys were
> collected from CertSafari's public browser experience and have not been independently verified
> by Anthropic or Ravn. Use the official guide and primary sources when they conflict.

## Developer study guide

[`ccdf/guide_en.md`](./ccdf/guide_en.md) · [read online](https://agredyaev.github.io/claude-cert/guides/developer-en.html)

Covers the **eight-domain Developer – Foundations blueprint (CCDV-F)**: agents and workflows, applications and integration, Claude Code, eval and debugging, model selection and optimization, prompt and context engineering, security and safety, and tools and MCPs. It turns the official objectives into a practical preparation plan with the exam and policy details and the decision rules the blueprint rewards — without reproducing or predicting live exam content.

## Developer practice exam

Draws **53 questions per attempt**, weighted to the official domain percentages:

| Domain | Weight | Drawn |
|---|---:|---:|
| 1. Agents and Workflows | 14.7% | 8 |
| 2. Applications and Integration | 33.1% | 17 |
| 3. Claude Code | 3.1% | 2 |
| 4. Eval, Testing, and Debugging | 2.6% | 1 |
| 5. Model Selection and Optimization | 16.8% | 9 |
| 6. Prompt and Context Engineering | 11.0% | 6 |
| 7. Security and Safety | 8.1% | 4 |
| 8. Tools and MCPs | 10.6% | 6 |
| **Total** | **100%** | **53** |

The bank behind that draw is several times the size of one
attempt, so repeat attempts overlap little. Every item is tagged to one of the 25 official
objectives and records which one. About 20% are **multiple-response** items, scored
all-or-nothing and stating how many responses to select. Scoring uses the real **720** cut with
a per-domain breakdown, on the same engine as the other two tracks. A domain selector drills a
single domain's whole bank instead, scored raw with no pass/fail verdict.

- [`ccdf/dist/exam_en.html`](./ccdf/dist/exam_en.html)

> **Not real exam content.** These items rehearse the reasoning the blueprint rewards; they do
> not predict or reproduce the live item bank.

## Professional study guide

[`ccap/guide_en.md`](./ccap/guide_en.md) · [read online](https://agredyaev.github.io/claude-cert/guides/professional-en.html)

Reproduces all **38 official objectives** across the seven domains, with the exam and policy
details, the official prep path, a breakdown of the three official sample questions, and the
official source list. Each domain section covers the decision rules and failure modes the
blueprint rewards, not just the objective titles.

## Professional practice exam

Draws **63 questions per attempt**, weighted to the official domain percentages:

| Domain | Weight | Drawn |
|---|---:|---:|
| 1. Solution Design & Architecture | 17% | 11 |
| 2. Claude Models, Prompting & Context Engineering | 13% | 8 |
| 3. Integration | 19% | 12 |
| 4. Evaluation, Testing & Optimization | 16% | 10 |
| 5. Governance, Safety & Risk Management | 14% | 9 |
| 6. Stakeholder Communication & Lifecycle Management | 14% | 9 |
| 7. Developer Productivity & Operational Enablement | 7% | 4 |
| **Total** | **100%** | **63** |

The bank behind that draw is several times the size of one
attempt, so repeat attempts overlap little. Every item is tagged to one of the 38 official
objectives and records which one. About a quarter are **multiple-response** items, scored
all-or-nothing and stating how many responses to select. Scoring uses the real **720** cut with
a per-domain breakdown. A domain selector drills a single domain's whole bank instead, scored
raw with no pass/fail verdict.

- [`ccap/dist/exam_en.html`](./ccap/dist/exam_en.html)

> **Not real exam content.** These items rehearse the reasoning the blueprint rewards; they do
> not predict or reproduce the live item bank.

## How to use

1. **Stage 1 — Architect Foundations (CCAR-F).** Read the Foundation guide first.
2. Run short weighted study drills, then domain drills, and use weak-spot review until repeated
   mistakes stop recurring.
3. Move to full 60-question / 120-minute exam rehearsals only after the concepts are stable.
4. Complete the Foundation preflight readiness checklist before booking CCAR-F.
5. **Stage 2 — Architect Professional (CCAR-P).** Only after Foundation, map experience against
   the 38 Professional objectives, build one end-to-end reference architecture, and rehearse
   architecture trade-offs under time pressure. Professional stays separate from Foundation
   drills because it has its own seven-domain blueprint.
6. Developer and Associate material remains available in the repository as secondary reference,
   but it is not part of the default Architect learning path.

### Review a score report

Upload a score-report PDF to get a personalized study guide and practice exam automatically.
The report stays on your device. If the exam cannot be identified, choose it; if any scores
need correction, the page asks only for those corrections. Report details remain available
below the guide. Each topic card expands into an objective-specific explanation, example,
and practical guidance. All four exams are supported: Architect Foundations (CCAR-F),
Architect Professional (CCAR-P), Developer Foundations (CCDV-F), and Associate Foundations
(CCAO-F).

Objective scores and personalized exam progress are saved in this browser on this device,
so the guide and attempt can be resumed after closing the tab. The PDF and candidate details
are not saved. Use **Report details → Delete saved study data** to clear the personalized
guide and attempt. Clearing browser data also removes them; they do not sync across devices.

The practice exam draws from the existing bank, favors weaker topics, and retains coverage
across every domain in the selected blueprint. Results show practice accuracy and explanations, not an official
score prediction.

## Design

[DESIGN.md](./DESIGN.md) documents the upstream visual system that this trainer adapts. The shared fonts live in `docs/assets/` and every page
links `docs/assets/fonts.css`; edit generator styles and regenerate every exam, bank, and
cheatsheet after design changes.

## Build and test

```bash
npm install --no-save marked@13.0.3 minisearch@7.2.0 pdfjs-dist@4.10.38 md-to-pdf html-minifier-terser@7.2.0   # pinned build dependencies

python3 utils/build_exam_html.py               # → ccaf/dist/exam_{en,ru}.html + shared English bank
python3 utils/build_exam_html.py en ru         # specific public interface variants
python3 utils/import_practice_bank.py          # corpus + tags → ccap,ccdf,ccaof data/questions.json
python3 utils/build_professional_exam.py       # → ccap/dist/exam_{en,ru}.html
python3 utils/build_developer_exam.py          # → ccdf/dist/exam_en.html
python3 utils/build_associate_exam.py          # → ccaof/dist/exam_en.html
python3 utils/build_cheatsheet.py              # → ccaf/dist/cheatsheet_en.html (RU view reuses English terminology)
node scripts/build-pages.mjs                   # → docs/ site
node scripts/minify-docs.mjs                   # minify docs/ in place — always last
node scripts/serve-docs.mjs                    # serve docs/ gzipped, under its <base href>

python3 utils/validate_professional_bank.py    # CCAR-P bank vs. official blueprint
python3 utils/validate_developer_bank.py       # CCDV-F bank vs. official blueprint
python3 utils/validate_associate_bank.py       # CCAO-F bank vs. official blueprint
node utils/test_exam_engine.mjs                # engine checks (Foundations + Professional pages)
node utils/test_exam_render.mjs                # render checks
```

Each validator fails on a bad answer key, an objective absent from the official guide, a stem
that states a different number of answers than its key, or a domain whose bank is smaller than
its draw. An objective no item covers is reported as a warning, since the CCAR-P, CCDV-F, and CCAO-F
banks are imported rather than commissioned.

An exam page does not carry its questions: `render_page` writes them to
`<track>/dist/data/<store-key>-<hash>.json` and the page fetches that at boot, so a practice
page and its `bank-` twin — which share a hash — download one copy between them instead of
475 KB each. `<track>/dist/banks.json` records which file each page uses; `build-pages.mjs`
and `build_cheatsheet.py` read the questions from there rather than from the generated markup.

The Foundations, Professional, and Associate exams and the site regenerate on every deploy. The Developer
exam and the cheatsheet ship their committed HTML — re-run their generators only when editing
their content, and keep the cheatsheet stats in sync with `ccaf/data/domains.json` and
`utils/exam_data.py` (`DOMAIN_NAMES`).

## Repository layout

Each exam owns a top-level directory with the same internal shape:

| | CCAF (CCAR-F) | CCAP (CCAR-P) | CCDF (CCDV-F) | CCAOF (CCAO-F) |
|---|---|---|---|---|
| Study guide | `ccaf/guide_en.md` (published EN/RU chrome) | `ccap/guide_en.md` (published EN/RU chrome) | `ccdf/guide_en.md` | `ccaof/guide_en.md` |
| Question data | `ccaf/data/` | `ccap/data/` | `ccdf/data/` | `ccaof/data/` |
| Source material | `ccaf/sources/` | `.corpus/practice-bank/` | `ccdf/sources/`, `.corpus/practice-bank/` | `ccaof/sources/`, `.corpus/practice-bank/` |
| Exercises | `ccaf/exercises/` | — | — | — |
| Generated HTML | `ccaf/dist/` | `ccap/dist/` | `ccdf/dist/` | `ccaof/dist/` |

`data/` holds the question banks and blueprint transcriptions; `sources/` holds third-party
inputs like the official exam-guide PDFs; `dist/` holds generated exam and cheatsheet HTML —
edit sources, not `dist/`. Shared tooling stays in `utils/` (importer, builders, validators,
engine tests) and `scripts/` (site build and the practice-bank collector).

The Foundations bank in `ccaf/data/questions.json` is Ravn-authored and edited by hand. The
CCAR-P, CCDV-F, and CCAO-F banks are not: their `data/questions.json` files are
generated by `utils/import_practice_bank.py` from the practice-bank corpus under `.corpus/practice-bank/`,
so an edit made directly to either file is lost on the next import. The same script writes
`ccaf/data/imported_en.json`, the imported half of the English Foundations bank, placed by
`ccaf/data/blueprint.json` and grouped in the bank browser through `ccaf/data/objectives.json`. Each item's domain and
objective come from the `Subdomain X.Y` label the practice bank itself puts on the question, read out of
the captured page snapshot and checked against `objectives.json` before it is trusted.

A few files are not what they look like: `ccaf/sources/mock-exam.txt` is the source for the
60-question mock bank, and the preflight checklist has no markdown source — its content
lives in `scripts/build-pages.mjs` (`PREFLIGHT_TRACKS`, one entry per exam) and
`docs/preflight/` is overwritten on every build.

## Contributing

- The published Architect trainer is EN/RU only. Keep certification questions and guide terminology in English; Russian changes interface chrome and training guidance, not exam wording.
- Run the validators and both test scripts before opening a PR.
- **Do not commit material from the Partner Academy courses.** That content is partner-gated.
  Guide prose and the Foundations practice items are Ravn-authored; keep it that way. The
  practice-bank archive under `.corpus/practice-bank/` is the tracked third-party exception — see
  `scripts/practice-bank-collection.md` — and it is the source of the CCAR-P, CCDV-F, and CCAO-F banks,
  which are regenerated from it by `utils/import_practice_bank.py` rather than edited by hand.
- PDFs regenerate automatically on merge to `main` as part of the Pages deploy.

## License

© Ravn. Originating study materials by Paul Larionov, used and adapted under the terms of the
upstream license.
