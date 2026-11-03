# External readiness evidence

Reviewed: 2026-11-03

Purpose: calibrate the Architect training system against public evidence outside this repository. These sources do **not** override the official exam guides or current Anthropic documentation. Candidate reports and community projects are used only to identify preparation risks, difficulty mismatches, and training techniques worth testing.

## Source hierarchy

1. **Official exam guide / certification page** — authoritative for exam scope, weights, formats, task statements, and published scenarios.
2. **Current Anthropic / Claude documentation** — authoritative for current product behavior.
3. **Official prep courses** — authoritative training guidance and useful evidence for expected depth.
4. **Candidate reports** — non-authoritative signals about difficulty, wording, time pressure, and useful preparation methods.
5. **Community repositories / mock banks** — benchmarks for coverage and training mechanics, never answer-key authority.

## External findings

### Architect — Foundations

Official:
- CCAR-F is 60 items, 120 minutes, scaled pass 720, with multiple-choice and multiple-response listed as supported formats.
- The public blueprint has five weighted domains.
- The official guide is the authoritative source for scope; the retired practice exam should not be treated as a current official calibration set.

Candidate signals:
- Multiple candidates describe the exam as a **judgment** exam: several options can sound reasonable and the deciding detail is usually a scenario constraint.
- Strong candidates recommend reading the stem carefully before the choices and being able to explain why distractors fail.
- Reports vary on observed multiple-response prevalence; the official format therefore remains the training baseline.
- Candidates repeatedly warn that some public practice banks are too easy because the correct option is obvious from wording.

Community benchmark signals:
- Stronger repositories explicitly frame questions inside the six published Foundation scenario families.
- Several projects provide per-distractor rationales and direct links to official documentation.
- Implementation-oriented repos add code/written drills rather than relying only on mock exams.

### Architect — Professional

Official:
- Professional is a separate certification with no formal Foundation prerequisite.
- The official prep path covers end-to-end solution design, enterprise integration, safety/risk, stakeholder/lifecycle work, and operational enablement.
- The official Professional prep course is substantially broader than a question bank and expects the architect to defend design decisions to non-technical stakeholders.

Candidate signals:
- Hands-on work with one end-to-end system is repeatedly described as high-value preparation.
- Reports emphasize architecture trade-offs, integration, RAG/retrieval diagnosis, auth/least privilege, evaluation, governance, stakeholder communication, and lifecycle ordering.
- Dense scenarios and plausible distractors are a better calibration target than recall-style questions.

## Consequences for this repository

Required:
- Keep candidate/community material out of answer-key authority.
- Preserve the official MC/MR format even when an individual candidate reports seeing only one type.
- Train Foundation across the six published scenario families, not only by domain/task statement.
- Require self-explanation before rationale reveal in Study mode.
- Keep per-option rationales.
- Maintain hands-on Foundation labs.
- Require one Professional end-to-end capstone with architecture, evaluation, integration, governance, stakeholder, operations, and handoff artifacts.
- Maintain current-doc review for product-sensitive claims.
- Introduce held-out readiness questions so final readiness is not measured on items already used for learning.

## Public evidence reviewed

Official:
- https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification
- https://anthropic-partners.skilljar.com/page/faq-certifications
- https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional
- https://anthropic-partners.skilljar.com/page/claude-certification-exam-prep-courses

Candidate reports:
- https://www.reddit.com/r/ClaudeAI/comments/1w4cd7w/
- https://www.reddit.com/r/ClaudeAI/comments/1w04zq6/
- https://www.reddit.com/r/ClaudeAI/comments/1v5zrru/
- https://www.reddit.com/r/claudeskills/comments/1w0sbla/
- https://www.reddit.com/r/ClaudeAI/comments/1vrl9ng/
- https://www.reddit.com/r/ClaudeAI/comments/1x0nhvy/

Community benchmarks:
- https://github.com/ianklassen/ccar-f-prep
- https://github.com/timothywarner-org/claude-architect
- https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS
- https://github.com/OlivierAlter/Claude-Certified-Architect-Foundations-Certification-Exam
- https://github.com/paoloamato2/claude-certified-architect-foundations-practice-exam
