# CCAR Architect Training

Task-first preparation for Claude Certified Architect — Foundations (CCAR-F) and Architect — Professional (CCAR-P).

Live site: https://agredyaev.github.io/claude-cert/

## Scope

Only the Architect path is a product surface:

1. CCAR-F — Architect Foundations
2. CCAR-P — Architect Professional

Foundation → Professional is the training sequence used here. Anthropic does not require Foundation as a formal prerequisite for Professional.

Developer and Associate source directories are inherited from upstream history and are not part of the published product.

## Training model

diagnostic → targeted material → solve → explain → rationale → transfer → spaced review → timed mock → held-out readiness

In Study mode, selecting an option does not immediately reveal the answer. The learner first writes a short explanation of the governing constraint and records confidence (low / medium / high). Only then is the answer graded and the rationale for every option shown. Confidence never changes the score; it only changes review priority and spacing.

Progress is based on task-statement mastery rather than pages read.

### Foundation

- 5 official domains
- 30 official task statements
- 6 official scenario families
- weighted question drills
- MC + MR format practice
- four hands-on labs
- three non-overlapping held-out 60-question readiness forms

### Professional

- 7 official domains
- 38 official objectives
- weighted architecture scenarios
- one end-to-end capstone with stress tests
- two non-overlapping held-out 63-question readiness forms

## Material model

validation/architect/knowledge_ontology.json is generated from the source material and links:

domain → official objective → finer guidance → case family / capstone → questions → held-out evidence → sources

Build it with:

~~~bash
python3 utils/build_knowledge_ontology.py
~~~

The source hierarchy is:

1. official CCAR-F / CCAR-P exam guides;
2. current Anthropic / Claude documentation;
3. official prep paths;
4. candidate reports as calibration evidence only;
5. community repositories as comparison benchmarks only.

See validation/architect/source_matrix.json, validation/architect/external_evidence.md, and validation/architect/official_baseline.json.

## Quality gates

~~~bash
python3 validation/architect/validate_course.py
python3 validation/architect/judgment/validate_judgment.py
python3 validation/architect/lint_slop.py
node utils/test_exam_engine.mjs
node utils/test_exam_render.mjs
~~~

The ten validation lenses cover official blueprint exactness, provenance, format fidelity, objective coverage, answer-key defensibility, distractor quality, explanation quality, scenario transfer, duplication/balance, and learning methodology.

The anti-slop lint separately checks repeated option templates and superficial answer cues.

## Build

~~~bash
python3 utils/build_readiness_sets.py
python3 utils/build_exam_html.py
python3 utils/validate_professional_bank.py
python3 utils/build_professional_exam.py
python3 utils/build_cheatsheet.py
python3 utils/build_knowledge_ontology.py

node utils/test_exam_engine.mjs
node utils/test_exam_render.mjs
node scripts/build-pages.mjs
node scripts/minify-docs.mjs
~~~

The static site is written to docs/.

## Main source layout

| Area | Foundation | Professional |
|---|---|---|
| Guide | ccaf/guide_en.md | ccap/guide_en.md |
| Official blueprint | ccaf/data/blueprint.json | ccap/data/objectives.json |
| Practice questions | ccaf/data/imported_en.json, ccaf/data/multi_en.json | ccap/data/questions.json |
| Guidance | ccaf/data/objective_guidance.json | ccap/data/objective_guidance.json |
| Held-out sets | ccaf/data/readiness_ids.json | ccap/data/readiness_ids.json |
| Practical transfer | ccaf/data/scenario_cases.json + labs | ccap/data/capstone.json |
| Official snapshot | ccaf/sources/architect-foundations-exam-guide.pdf | ccap/sources/architect-professional-exam-guide.pdf |

## Provenance

This repository started from the Ravn-curated ravnhq/claude-certified-architect code and study corpus and retains that upstream history. The current Architect training flow, EN/RU interface, task-statement mastery, self-explanation loop, spaced weak-spot review, hands-on labs, held-out readiness sets, Professional capstone, external evidence audit, ontology, and validation gates are later adaptations.

Practice material is unofficial and is not live exam content. When training material conflicts with the current official exam guide or Anthropic documentation, the official source wins.
