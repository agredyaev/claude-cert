#!/usr/bin/env node
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import MiniSearch from 'minisearch';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DOCS = path.join(ROOT, 'docs');

const LANGS = [
  { code: 'en', label: 'English', contentCode: 'en', guide: 'ccaf/guide_en.md', test: 'ccaf/dist/exam_en.html', bank: 'ccaf/dist/bank_en.html', readinessA: 'ccaf/dist/readiness_a_en.html', readinessB: 'ccaf/dist/readiness_b_en.html', readinessC: 'ccaf/dist/readiness_c_en.html' },
  { code: 'ru', label: 'Русский', contentCode: 'en', guide: 'ccaf/guide_en.md', test: 'ccaf/dist/exam_ru.html', bank: 'ccaf/dist/bank_ru.html', readinessA: 'ccaf/dist/readiness_a_ru.html', readinessB: 'ccaf/dist/readiness_b_ru.html', readinessC: 'ccaf/dist/readiness_c_ru.html' },
];

const PROFESSIONAL_GUIDES = [
  {
    code: 'en',
    label: 'English',
    contentCode: 'en',
    title: 'Professional - English',
    guide: 'ccap/guide_en.md',
    output: 'professional-en',
    test: 'ccap/dist/exam_en.html',
    bank: 'ccap/dist/bank_en.html',
    readinessA: 'ccap/dist/readiness_a_en.html',
    readinessB: 'ccap/dist/readiness_b_en.html',
  },
  {
    code: 'ru',
    label: 'Русский',
    contentCode: 'en',
    title: 'Professional - Russian UI',
    guide: 'ccap/guide_en.md',
    output: 'professional-ru',
    test: 'ccap/dist/exam_ru.html',
    bank: 'ccap/dist/bank_ru.html',
    readinessA: 'ccap/dist/readiness_a_ru.html',
    readinessB: 'ccap/dist/readiness_b_ru.html',
  },
];

// Every track whose exam pages ship a fetched question bank.
const EXAM_TRACKS = ['ccaf', 'ccap'];

// Published exam page -> the bank JSON it fetches. Every page shell carries it,
// so a link into an exam can warm that fetch before the click (app.js).
let bankHrefs = {};

const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'claude-cert';
const SITE_BASE_HREF = process.env.SITE_BASE_HREF || `/${REPO_NAME}/`;
const MINISEARCH_BROWSER = path.resolve(
  path.dirname(fileURLToPath(import.meta.resolve('minisearch'))),
  '../umd/index.js',
);
const PDFJS_VERSION = '4.10.38';
const PDFJS_BUILD = path.join(ROOT, 'node_modules', 'pdfjs-dist', 'build');


// Localized labels for the per-guide navigation chrome (TOC + heading anchors).
const GUIDE_UI = {
  en: { contents: 'Contents', anchor: 'Copy link to this section' },
  ru: { contents: 'Содержание', anchor: 'Скопировать ссылку на раздел' },
};

let headingSlug = createSlugger();
let anchorLabel = GUIDE_UI.en.anchor;
let appHref = 'app.js';
// The pages carry a <base href>, so a bare "#id" would resolve against the
// site root (the home page). Fragment links must be page-qualified.
let pageHref = '';

marked.use({
  useNewRenderer: true,
  renderer: {
    heading({ tokens, depth }) {
      const raw = tokens.map(t => t.raw ?? t.text ?? '').join('');
      const id = headingSlug(raw);
      const inner = this.parser.parseInline(tokens);
      // aria-hidden + tabindex="-1": the glyph only appears on hover, so it was
      // never a keyboard affordance, but its text was landing inside every
      // heading's accessible name ("Introduction #") on ~294 headings per page.
      const anchor = `<a class="heading-anchor" href="${pageHref}#${id}" aria-hidden="true" tabindex="-1" title="${anchorLabel}">#</a>`;
      return `<h${depth} id="${id}">${inner} ${anchor}</h${depth}>\n`;
    },
  },
});

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }

// The exam pages fetch their question bank from a sibling JSON file instead of
// inlining it; <track>/dist/banks.json records which file each page uses.
async function bankManifest(track) {
  const file = path.join(ROOT, track, 'dist', 'banks.json');
  if (!(await exists(file))) throw new Error(`${track}: exam data was not generated before the site build`);
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function readExamBank(track, page) {
  const manifest = await bankManifest(track);
  const rel = manifest[page];
  if (!rel) throw new Error(`${track}: ${page} is missing from banks.json`);
  return JSON.parse(await fs.readFile(path.join(ROOT, track, 'dist', rel), 'utf8'));
}

function pageShell({ title, lang, body, baseHref, extraScripts = '', extraHead = '' }) {
  return `<!doctype html>
<html lang="${lang}" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<base href="${baseHref}">
<link rel="preload" as="font" type="font/woff2" crossorigin href="assets/Inter-variable.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="assets/JetBrainsMono-variable.woff2">
<link rel="stylesheet" href="assets/fonts.css">
<link rel="stylesheet" href="styles.css">
<link rel="icon" type="image/png" href="assets/favicon.png">
${extraHead}<script type="application/json" id="bank-map">${JSON.stringify(bankHrefs)}</script>
<script>
  // Theme bootstrap avoids a flash of the wrong theme; dark is the default training view.
  (() => {
    const t = localStorage.getItem('theme');
    document.documentElement.dataset.theme = t || 'dark';
  })();
</script>
</head>
<body>
${body}
${siteFooter(lang)}
<script src="vendor/minisearch.js" defer></script>
<script src="${appHref}" defer></script>
${extraScripts}
</body>
</html>`.replace(/[ \t]+$/gm, '');
}

function siteFooter() {
  return '';
}

function header(currentLang = 'en', alternateHref = null) {
  const ru = currentLang === 'ru';
  const enHref = currentLang === 'en' ? null : (alternateHref || 'index.html');
  const ruHref = currentLang === 'ru' ? null : (alternateHref || 'ru.html');
  return `<header class="topbar">
  <a class="brand trainer-brand" href="${ru ? 'ru.html' : 'index.html'}" aria-label="CCAR">
    <span>CCAR</span>
  </a>
  <nav class="topbar-actions" aria-label="${ru ? 'Управление страницей' : 'Page controls'}">
    <div class="site-language-toggle" role="group" aria-label="${ru ? 'Язык интерфейса' : 'Interface language'}">
      ${enHref ? `<a href="${enHref}">EN</a>` : '<span aria-current="page">EN</span>'}
      ${ruHref ? `<a href="${ruHref}">RU</a>` : '<span aria-current="page">RU</span>'}
    </div>
    <button type="button" id="search-toggle" class="icon-btn" aria-label="${ru ? 'Поиск' : 'Search'}">⌕</button>
    <button type="button" id="theme-toggle" class="icon-btn" aria-label="${ru ? 'Переключить тему' : 'Toggle theme'}">◐</button>
  </nav>
</header>
<dialog id="search-dialog" aria-labelledby="search-title">
  <h2 id="search-title" class="visually-hidden">${ru ? 'Поиск по учебным материалам' : 'Search the study guides'}</h2>
  <div class="search-filter" role="group" aria-label="${ru ? 'Фильтр по языку интерфейса' : 'Filter by interface language'}">
    <button type="button" class="search-lang active" data-lang="all" aria-pressed="true">${ru ? 'Все' : 'All'}</button>
    <button type="button" class="search-lang" data-lang="en" aria-pressed="false">EN</button>
    <button type="button" class="search-lang" data-lang="ru" aria-pressed="false">RU</button>
  </div>
  <label class="visually-hidden" for="search-input">${ru ? 'Поисковый запрос' : 'Search terms'}</label>
  <input id="search-input" type="search" placeholder="${ru ? 'Поиск по гайду…' : 'Search the guide…'}" autocomplete="off">
  <p id="search-status" class="search-status" role="status" aria-live="polite"></p>
  <ul id="search-results" aria-label="${ru ? 'Результаты поиска' : 'Search results'}"></ul>
</dialog>`;
}


function foundationLabsPage(lang = 'en') {
  const ru = lang === 'ru';
  const guide = ru ? 'guides/ru.html' : 'guides/en.html';
  const labs = [
    {
      id: 'agent',
      title: 'Multi-Tool Agent',
      domains: 'D1 · D2 · D5',
      task: ru
        ? 'Соберите agent loop с 3–4 инструментами, минимум двумя похожими по назначению, structured errors и обязательной эскалацией.'
        : 'Build an agent loop with 3–4 tools, at least two with overlapping intent, structured errors, and an explicit escalation path.',
      deliverable: ru
        ? 'Код agent loop + tool schemas + два failure cases + журнал решения об эскалации.'
        : 'Agent-loop code + tool schemas + two failure cases + an escalation decision log.',
      checks: ru
        ? ['tool_use/end_turn обрабатываются явно', 'обязательный business invariant enforced программно', 'ошибка несёт category/retryability/context', 'неоднозначный запрос приводит к корректной clarification/escalation']
        : ['tool_use/end_turn handled explicitly', 'mandatory business invariant enforced programmatically', 'error carries category/retryability/context', 'ambiguous request triggers the correct clarification/escalation path'],
    },
    {
      id: 'claude-code',
      title: 'Claude Code Team Workflow',
      domains: 'D3 · D2',
      task: ru
        ? 'Настройте реальный репозиторий: CLAUDE.md, conditional rules, reusable skill/command и MCP integration.'
        : 'Configure a real repository with CLAUDE.md, conditional rules, a reusable skill/command, and MCP integration.',
      deliverable: ru
        ? 'Минимальный repo diff с конфигурацией + два примера задач, где разные правила загружаются по scope.'
        : 'Minimal repository diff + two task examples demonstrating scope-specific instruction loading.',
      checks: ru
        ? ['общие правила не дублируются по подпапкам', 'path-specific conventions грузятся только где нужны', 'shared workflow version-controlled', 'сложная задача сначала исследуется/планируется']
        : ['global rules are not duplicated across subdirectories', 'path-specific conventions load only where needed', 'shared workflow is version-controlled', 'complex change is explored/planned before edits'],
    },
    {
      id: 'extraction',
      title: 'Structured Data Extraction',
      domains: 'D4 · D5',
      task: ru
        ? 'Постройте extraction pipeline со schema-constrained output, semantic validation, retry-with-feedback и обработкой partial failures.'
        : 'Build an extraction pipeline with schema-constrained output, semantic validation, retry-with-feedback, and partial-failure handling.',
      deliverable: ru
        ? 'Schema + 10 тестовых документов + validator + failure report по каждому неуспешному документу.'
        : 'Schema + 10 test documents + validator + per-document failure report.',
      checks: ru
        ? ['required/optional/null semantics различаются', 'semantic validation отделена от JSON syntax', 'retry получает конкретную validation error', 'успешные документы не перерабатываются из-за одного failure']
        : ['required/optional/null semantics are distinct', 'semantic validation is separate from JSON syntax', 'retry receives the specific validation error', 'successful documents are not reprocessed because one item failed'],
    },
    {
      id: 'research',
      title: 'Multi-Agent Research',
      domains: 'D1 · D5',
      task: ru
        ? 'Спроектируйте coordinator + 2–3 subagents для исследования, где coverage, error propagation и provenance проверяются явно.'
        : 'Design a coordinator + 2–3 subagents for research with explicit coverage, error propagation, and provenance checks.',
      deliverable: ru
        ? 'Task decomposition + subagent contracts + synthesis output с source attribution и отмеченными gaps.'
        : 'Task decomposition + subagent contracts + synthesis output with source attribution and explicit gaps.',
      checks: ru
        ? ['decomposition покрывает все requested dimensions', 'subagent получает достаточный context', 'partial failure возвращает usable results + gap', 'synthesis не скрывает missing coverage']
        : ['decomposition covers every requested dimension', 'subagent receives sufficient context', 'partial failure returns usable results + gap', 'synthesis does not hide missing coverage'],
    },
  ];

  const cards = labs.map((lab, i) => `
    <article class="lab-card">
      <div class="lab-card-head">
        <span class="training-path-number">0${i + 1}</span>
        <span class="training-domain-id">${lab.domains}</span>
      </div>
      <h2>${lab.title}</h2>
      <p>${lab.task}</p>
      <h3>${ru ? 'Результат' : 'Deliverable'}</h3>
      <p>${lab.deliverable}</p>
      <h3>${ru ? 'Критерии' : 'Acceptance criteria'}</h3>
      <ul>${lab.checks.map(x => `<li>${x}</li>`).join('')}</ul>
      <label class="lab-complete">
        <input type="checkbox" data-lab-id="${lab.id}">
        <span>${ru ? 'Выполнено и проверено по критериям' : 'Completed and checked against criteria'}</span>
      </label>
    </article>`).join('');

  return `<main class="training-dashboard labs-page" data-labs data-training-lang="${lang}">
    <section class="labs-head">
      <div>
        <p class="training-panel-label">CCAR-F · Hands-on</p>
        <h1>${ru ? 'Практические лабораторные' : 'Practical labs'}</h1>
      </div>
      <div class="labs-progress">
        <span>${ru ? 'Выполнено' : 'Completed'}</span>
        <strong id="labs-progress">0 / 4</strong>
      </div>
    </section>
    <p class="labs-note">${ru
      ? 'Отмечайте лабораторную только после проверки deliverable по всем критериям. Чтение примера не считается выполнением.'
      : 'Mark a lab complete only after checking the deliverable against every criterion. Reading an example does not count.'}</p>
    <div class="labs-grid">${cards}</div>
    <p class="labs-reference"><a href="${guide}#practical-exercises">${ru ? 'Материал и примеры в Foundation guide' : 'Reference material and examples in the Foundation guide'}</a></p>
  </main>`;
}

async function buildFoundationLabs() {
  const out = path.join(DOCS, 'labs');
  await ensureDir(out);
  await fs.writeFile(path.join(out, 'foundation-en.html'), pageShell({
    title: 'CCAR-F Practical Labs',
    lang: 'en',
    baseHref: SITE_BASE_HREF,
    body: `${header('en', 'labs/foundation-ru.html')}${foundationLabsPage('en')}`,
  }));
  await fs.writeFile(path.join(out, 'foundation-ru.html'), pageShell({
    title: 'CCAR-F Practical Labs · RU',
    lang: 'ru',
    baseHref: SITE_BASE_HREF,
    body: `${header('ru', 'labs/foundation-en.html')}${foundationLabsPage('ru')}`,
  }));
}


function foundationCasesPage(data, lang = 'en') {
  const ru = lang === 'ru';
  const cards = data.scenarios.map((scenario, scenarioIndex) => {
    const prompts = scenario.prompts.map((prompt, promptIndex) => {
      const id = `${scenario.id}-p${promptIndex + 1}`;
      return `
        <section class="case-prompt" data-case-prompt="${id}">
          <h3>${promptIndex + 1}. ${prompt.title}</h3>
          <p>${prompt.task}</p>
          <label for="answer-${id}">${ru ? 'Ваше решение' : 'Your reasoning'}</label>
          <textarea id="answer-${id}" data-case-answer="${id}" rows="5"
            placeholder="${ru ? 'Constraint → decision → rejected alternatives → consequence' : 'Constraint → decision → rejected alternatives → consequence'}"></textarea>
          <details data-case-rubric="${id}">
            <summary>${ru ? 'Открыть rubric после ответа' : 'Reveal rubric after answering'}</summary>
            <ul>${prompt.rubric.map(x => `<li>${x}</li>`).join('')}</ul>
          </details>
        </section>`;
    }).join('');
    return `
      <article class="scenario-card" data-scenario-id="${scenario.id}">
        <header class="scenario-card-head">
          <div>
            <span class="training-path-number">S${scenarioIndex + 1}</span>
            <h2>${scenario.name}</h2>
          </div>
          <span class="training-domain-id">D${scenario.primary_domains.join(' · D')}</span>
        </header>
        <p class="scenario-brief">${scenario.brief}</p>
        <div class="scenario-prompts">${prompts}</div>
        <label class="lab-complete scenario-complete">
          <input type="checkbox" data-case-id="${scenario.id}" disabled>
          <span>${ru
            ? 'Все решения сформулированы и сверены с rubric'
            : 'All responses written and checked against the rubric'}</span>
        </label>
      </article>`;
  }).join('');

  return `<main class="training-dashboard cases-page" data-cases data-training-lang="${lang}">
    <section class="labs-head">
      <div>
        <p class="training-panel-label">CCAR-F · Scenario transfer</p>
        <h1>${ru ? '6 официальных scenario families' : '6 official scenario families'}</h1>
      </div>
      <div class="labs-progress">
        <span>${ru ? 'Завершено' : 'Completed'}</span>
        <strong id="cases-progress">0 / 6</strong>
      </div>
    </section>
    <p class="labs-note">${ru
      ? 'Сначала письменно решите задачу. Rubric открывайте только после собственного решения. Совпадение формулировок не требуется; проверяйте constraint, boundary, trade-off и rejected alternatives.'
      : 'Write your decision before opening the rubric. Exact wording is irrelevant; check the constraint, owning boundary, trade-off, and rejected alternatives.'}</p>
    <div class="scenario-list">${cards}</div>
  </main>`;
}

async function buildFoundationCases() {
  const data = JSON.parse(await fs.readFile(path.join(ROOT, 'ccaf', 'data', 'scenario_cases.json'), 'utf8'));
  const out = path.join(DOCS, 'cases');
  await ensureDir(out);
  for (const lang of ['en', 'ru']) {
    await fs.writeFile(path.join(out, `foundation-${lang}.html`), pageShell({
      title: lang === 'ru' ? 'CCAR-F · Scenario cases · RU' : 'CCAR-F · Scenario cases',
      lang,
      baseHref: SITE_BASE_HREF,
      body: `${header(lang, lang === 'ru' ? 'cases/foundation-en.html' : 'cases/foundation-ru.html')}${foundationCasesPage(data, lang)}`,
    }));
  }
}


function professionalCapstonePage(data, lang = 'en') {
  const ru = lang === 'ru';
  const artifacts = data.artifacts.map((artifact, index) => `
    <article class="scenario-card capstone-item" data-capstone-item="${artifact.id}" data-capstone-kind="artifact">
      <header class="scenario-card-head">
        <div><span class="training-path-number">${String(index + 1).padStart(2, '0')}</span><h2>${artifact.title}</h2></div>
      </header>
      <p class="scenario-brief">${artifact.task}</p>
      <label for="capstone-${artifact.id}">${ru ? 'Evidence / решение' : 'Evidence / decision'}</label>
      <textarea id="capstone-${artifact.id}" data-capstone-answer="${artifact.id}" rows="6"
        placeholder="${ru ? 'Decision → evidence → rejected alternatives → operational consequence' : 'Decision → evidence → rejected alternatives → operational consequence'}"></textarea>
      <details data-capstone-rubric="${artifact.id}">
        <summary>${ru ? 'Проверить acceptance criteria' : 'Check acceptance criteria'}</summary>
        <ul>${artifact.rubric.map(x => `<li>${x}</li>`).join('')}</ul>
      </details>
      <span class="capstone-state" data-capstone-state="${artifact.id}">${ru ? 'не подтверждено' : 'not evidenced'}</span>
    </article>`).join('');

  const tests = data.stress_tests.map((test, index) => `
    <article class="case-prompt capstone-stress" data-capstone-item="${test.id}" data-capstone-kind="stress">
      <h3>${index + 1}. ${test.title}</h3>
      <p>${test.task}</p>
      <label for="capstone-${test.id}">${ru ? 'Диагностический ответ' : 'Diagnostic response'}</label>
      <textarea id="capstone-${test.id}" data-capstone-answer="${test.id}" rows="5"
        placeholder="Evidence → failing boundary → structural fix → prevention"></textarea>
      <span class="capstone-state" data-capstone-state="${test.id}">${ru ? 'не подтверждено' : 'not evidenced'}</span>
    </article>`).join('');

  return `<main class="training-dashboard cases-page capstone-page" data-capstone data-training-lang="${lang}">
    <section class="labs-head">
      <div>
        <p class="training-panel-label">CCAR-P · Capstone</p>
        <h1>${ru ? 'End-to-end архитектурная работа' : 'End-to-end architecture evidence'}</h1>
      </div>
      <div class="labs-progress">
        <span>${ru ? 'Подтверждено' : 'Evidenced'}</span>
        <strong id="capstone-progress">0 / 14</strong>
      </div>
    </section>
    <p class="labs-note">${ru
      ? 'Не пишите учебный проект ради формы. Используйте одну реалистичную систему и последовательно докажите design, integration, evaluation, governance, operations и handoff.'
      : 'Use one realistic system. The point is not a toy implementation; it is evidence that one architecture survives design, integration, evaluation, governance, operations, and handoff.'}</p>
    <section class="training-section">
      <div class="training-section-head"><div><span class="training-panel-label">Artifacts</span><h2>9 architecture artifacts</h2></div></div>
      <div class="scenario-list">${artifacts}</div>
    </section>
    <section class="training-section">
      <div class="training-section-head"><div><span class="training-panel-label">Failure injection</span><h2>5 stress tests</h2></div></div>
      <div class="scenario-list">${tests}</div>
    </section>
  </main>`;
}

async function buildProfessionalCapstone() {
  const data = JSON.parse(await fs.readFile(path.join(ROOT, 'ccap', 'data', 'capstone.json'), 'utf8'));
  const out = path.join(DOCS, 'professional');
  await ensureDir(out);
  for (const lang of ['en', 'ru']) {
    await fs.writeFile(path.join(out, `capstone-${lang}.html`), pageShell({
      title: lang === 'ru' ? 'CCAR-P · Capstone · RU' : 'CCAR-P · Capstone',
      lang,
      baseHref: SITE_BASE_HREF,
      body: `${header(lang, lang === 'ru' ? 'professional/capstone-en.html' : 'professional/capstone-ru.html')}${professionalCapstonePage(data, lang)}`,
    }));
  }
}

function professionalDashboard(blueprint, lang = 'en') {
  const ru = lang === 'ru';
  const practice = ru ? 'practical/professional-ru.html' : 'practical/professional-en.html';
  const bank = ru ? 'practical/bank-professional-ru.html' : 'practical/bank-professional-en.html';
  const guide = ru ? 'guides/professional-ru.html' : 'guides/professional-en.html';
  const capstone = ru ? 'professional/capstone-ru.html' : 'professional/capstone-en.html';
  const readinessA = ru ? 'practical/readiness-a-professional-ru.html' : 'practical/readiness-a-professional-en.html';
  const readinessB = ru ? 'practical/readiness-b-professional-ru.html' : 'practical/readiness-b-professional-en.html';
  const preflight = 'preflight/architect-professional.html';
  const domains = Object.entries(blueprint.domains);

  const objectiveMap = domains.map(([id, domain]) => {
    const rows = domain.objectives.map((objective, index) => {
      const key = `${id}|${objective}`;
      return `
        <li class="objective-row" data-prof-objective-key="${key}">
          <span class="objective-id">${id}.${index + 1}</span>
          <span class="objective-text">${objective}</span>
          <span class="objective-status" aria-live="polite">${ru ? 'не начато' : 'not started'}</span>
        </li>`;
    }).join('');
    return `
      <section class="objective-domain" data-prof-objective-domain="${id}">
        <header class="objective-domain-head">
          <div>
            <span class="training-domain-id">D${id} · ${domain.weight}%</span>
            <h3>${domain.name}</h3>
            <span id="professional-domain-mastered-${id}" class="objective-domain-progress">0 / ${domain.objectives.length} ${ru ? 'освоено' : 'mastered'}</span>
          </div>
          <div class="objective-domain-actions">
            <a href="${guide}#domain-${id}-material">${ru ? 'Материал' : 'Material'}</a>
            <a href="${practice}?mode=study&focus=${id}">${ru ? 'Практика' : 'Drill'}</a>
          </div>
        </header>
        <ol class="objective-list">${rows}</ol>
      </section>`;
  }).join('');

  const methodRows = [
    ['01', 'Diagnostic', ru ? 'Короткая смешанная попытка без подсказок.' : 'Short mixed attempt with no answer reveal.', `${practice}?mode=exam&length=quick`, ru ? 'Начать' : 'Start'],
    ['02', ru ? 'Материал' : 'Study', ru ? 'Закрывать только обнаруженные пробелы по objective.' : 'Close only the diagnosed objective gaps.', guide, ru ? 'Открыть' : 'Open'],
    ['03', 'Retrieval', ru ? 'Сценарные задачи с self-explanation перед rationale.' : 'Scenario tasks with self-explanation before rationale.', `${practice}?mode=study&length=quick`, ru ? 'Практика' : 'Practice'],
    ['04', 'Capstone', ru ? '9 архитектурных artifacts + 5 failure injections.' : '9 architecture artifacts + 5 failure injections.', capstone, ru ? 'Работа' : 'Work', 'professional-capstone-link'],
    ['05', ru ? 'Интервальное повторение' : 'Spaced review', ru ? 'Возвращаться к ошибкам по расписанию.' : 'Return to misses on schedule.', `${practice}?mode=study&focus=misses`, ru ? 'Повторить' : 'Review', 'professional-misses-link'],
    ['06', 'Full mock', '63 / 120', `${practice}?mode=exam&length=full`, ru ? 'Запустить' : 'Run'],
    ['07', 'Held-out readiness', ru ? 'Forms A/B: две непересекающиеся проверки по 63 ранее не показанных вопроса.' : 'Forms A/B: two non-overlapping 63-question unseen checks.', readinessA, ru ? 'Проверить' : 'Check', 'professional-readiness-link'],
    ['08', ru ? 'Подтверждение' : 'Evidence', ru ? 'Mastery 38/38 + capstone 14/14 + held-out pass + readiness evidence.' : 'Mastery 38/38 + capstone 14/14 + held-out pass + readiness evidence.', preflight, ru ? 'Завершить' : 'Complete', 'professional-evidence-link'],
  ].map(([n,title,copy,href,action,id]) => `
    <li class="study-method-row">
      <span class="training-path-number">${n}</span>
      <strong>${title}</strong>
      <span>${copy}</span>
      <a${id ? ` id="${id}"` : ''} href="${href}">${action}</a>
      ${id === 'professional-capstone-link' ? '<small id="professional-capstone-copy">0 / 14</small>' : ''}
      ${id === 'professional-misses-link' ? '<small id="professional-misses-copy">none due</small>' : ''}
      ${id === 'professional-readiness-link' ? '<small id="professional-readiness-copy">not taken</small>' : ''}
      ${id === 'professional-evidence-link' ? '<small id="professional-evidence-copy">0 / 10</small>' : ''}
    </li>`).join('');

  return `<main class="training-dashboard" data-prof-training-dashboard data-training-lang="${lang}">
    <section class="study-status">
      <div class="study-status-head">
        <div>
          <strong>CCAR-P · Professional</strong>
          <span>63 ${ru ? 'вопроса' : 'questions'} · 120 min · 720 / 1000 · 38 objectives</span>
        </div>
        <div class="study-status-metrics">
          <span><b id="professional-mastered">0 / 38</b> ${ru ? 'освоено' : 'mastered'}</span>
          <span><b id="professional-misses">0</b> ${ru ? 'повторить' : 'due'}</span>
          <span><b id="professional-capstone-stat">0 / 14</b> capstone</span>
        </div>
      </div>

      <div class="study-next">
        <span class="training-panel-label">${ru ? 'Следующее действие' : 'Next action'}</span>
        <strong id="professional-next-title">Diagnostic</strong>
        <p id="professional-next-copy">${ru ? 'Начните с короткой попытки без подсказок, чтобы определить реальные пробелы.' : 'Start with a short no-reveal attempt to identify actual gaps.'}</p>
        <a class="training-btn training-btn-primary" id="professional-primary" href="${practice}?mode=exam&length=quick">${ru ? 'Начать' : 'Start'}</a>
      </div>

      <div class="training-progress-track" aria-hidden="true"><span id="professional-progress-fill"></span></div>
      <p class="study-attempt" id="professional-progress-detail">${ru ? 'Активной попытки нет.' : 'No active attempt.'}</p>
    </section>

    <section class="training-section objective-map" aria-labelledby="professional-objective-map-title">
      <div class="training-section-head">
        <div>
          <span class="training-panel-label">${ru ? 'Прогресс' : 'Progress'}</span>
          <h2 id="professional-objective-map-title">38 objectives</h2>
        </div>
      </div>
      <div class="objective-domains">${objectiveMap}</div>
    </section>

    <section class="training-section" aria-labelledby="professional-materials-title">
      <div class="training-section-head">
        <div>
          <span class="training-panel-label">${ru ? 'Материалы' : 'Materials'}</span>
          <h2 id="professional-materials-title">${ru ? 'Учить и доказывать' : 'Study and prove'}</h2>
        </div>
      </div>
      <div class="material-list">
        <a href="${guide}"><strong>Professional guide</strong><span>${ru ? '7 доменов, 38 objectives, decision rules и architecture patterns.' : '7 domains, 38 objectives, decision rules, and architecture patterns.'}</span></a>
        <a href="${capstone}"><strong>Professional capstone</strong><span>${ru ? '9 artifacts + 5 stress tests на одной end-to-end системе.' : '9 artifacts + 5 stress tests on one end-to-end system.'}</span></a>
        <a href="${bank}"><strong>${ru ? 'Банк вопросов' : 'Question bank'}</strong><span>${ru ? 'Сценарные задачи, варианты и rationale.' : 'Scenario tasks, choices, and rationale.'}</span></a>
        <a href="${readinessA}"><strong>Held-out readiness A</strong><span>${ru ? 'Первая независимая форма: 63 unseen questions.' : 'First independent 63-question unseen form.'}</span></a>
        <a href="${readinessB}"><strong>Held-out readiness B</strong><span>${ru ? 'Вторая непересекающаяся форма после remediation.' : 'Second non-overlapping form after remediation.'}</span></a>
        <a href="score-report.html"><strong>Score report</strong><span>${ru ? 'Привязать официальный результат к слабым objectives.' : 'Map an official result to weak objectives.'}</span></a>
      </div>
    </section>

    <details class="training-section study-method">
      <summary>${ru ? 'Метод обучения' : 'Training method'}</summary>
      <ol class="study-method-list">${methodRows}</ol>
    </details>

    <section class="professional-row">
      <div>
        <span class="training-panel-label">${ru ? 'Готовность' : 'Readiness'}</span>
        <strong id="professional-ready-status">${ru ? 'Не подтверждена' : 'Not demonstrated'}</strong>
        <span id="professional-ready-detail">${ru ? 'Нужно mastery, capstone, held-out и evidence.' : 'Requires mastery, capstone, held-out, and evidence.'}</span>
      </div>
    </section>
  </main>`;
}

function trainingDashboard(blueprint, lang = 'en') {
  const ru = lang === 'ru';
  const practice = ru ? 'practical/ru.html' : 'practical/en.html';
  const bank = ru ? 'practical/bank-ru.html' : 'practical/bank-en.html';
  const guide = ru ? 'guides/ru.html' : 'guides/en.html';
  const casesHref = ru ? 'cases/foundation-ru.html' : 'cases/foundation-en.html';
  const labsHref = ru ? 'labs/foundation-ru.html' : 'labs/foundation-en.html';
  const readinessA = ru ? 'practical/readiness-a-ru.html' : 'practical/readiness-a-en.html';
  const readinessB = ru ? 'practical/readiness-b-ru.html' : 'practical/readiness-b-en.html';
  const readinessC = ru ? 'practical/readiness-c-ru.html' : 'practical/readiness-c-en.html';
  const professionalGuide = ru ? 'guides/professional-ru.html' : 'guides/professional-en.html';
  const professionalPractice = ru ? 'practical/professional-ru.html' : 'practical/professional-en.html';
  const domains = Object.entries(blueprint.domains);

  const objectiveMap = domains.map(([id, domain]) => {
    const rows = domain.objectives.map((objective, index) => {
      const key = `${id}|${objective}`;
      return `
        <li class="objective-row" data-objective-key="${key}">
          <span class="objective-id">${id}.${index + 1}</span>
          <span class="objective-text">${objective}</span>
          <span class="objective-status" aria-live="polite">${ru ? 'не начато' : 'not started'}</span>
        </li>`;
    }).join('');
    return `
      <section class="objective-domain" data-objective-domain="${id}">
        <header class="objective-domain-head">
          <div>
            <span class="training-domain-id">D${id} · ${domain.weight}%</span>
            <h3>${domain.name}</h3>
            <span id="training-domain-mastered-${id}" class="objective-domain-progress">0 / ${domain.objectives.length} ${ru ? 'освоено' : 'mastered'}</span>
          </div>
          <div class="objective-domain-actions">
            <a href="${guide}#domain-${id}-material">${ru ? 'Материал' : 'Material'}</a>
            <a href="${practice}?mode=study&focus=${id}">${ru ? 'Практика' : 'Drill'}</a>
          </div>
        </header>
        <ol class="objective-list">${rows}</ol>
      </section>`;
  }).join('');

  const pathSteps = [
    ['01', 'Diagnostic', ru ? '20 смешанных вопросов без подсказок.' : '20 mixed questions with no answer reveal.', `${practice}?mode=exam&length=quick`, ru ? 'Начать' : 'Start'],
    ['02', ru ? 'Материал' : 'Study', ru ? 'Читать только то, что закрывает выявленный пробел.' : 'Read only what closes a diagnosed gap.', guide, ru ? 'Открыть' : 'Open'],
    ['03', ru ? 'Извлечение из памяти' : 'Retrieval', ru ? 'Короткие weighted drills с rationale каждого варианта.' : 'Short weighted drills with rationale for every option.', `${practice}?mode=study&length=quick`, ru ? 'Практика' : 'Practice'],
    ['04', 'Scenario transfer', ru ? '6 официальных scenario families · 18 открытых архитектурных задач.' : '6 official scenario families · 18 open architecture decisions.', casesHref, ru ? 'Кейсы' : 'Cases', 'training-cases-link'],
    ['05', 'Hands-on', ru ? '4 задания с deliverable и acceptance criteria.' : 'Four builds with deliverables and acceptance criteria.', labsHref, ru ? 'Лабораторные' : 'Labs', 'training-labs-link'],
    ['06', ru ? 'Интервальное повторение' : 'Spaced review', ru ? 'Возвращаться к ошибкам по расписанию, а не сразу подряд.' : 'Return to misses on schedule instead of massed repetition.', `${practice}?mode=study&focus=misses`, ru ? 'Повторить' : 'Review', 'training-misses-link'],
    ['07', 'Full mock', '60 / 120', `${practice}?mode=exam&length=full`, ru ? 'Запустить' : 'Run'],
    ['08', 'Held-out readiness', ru ? '60 ранее не показанных вопросов. Forms A/B/C расходуются только после remediation.' : '60 unseen questions. Forms A/B/C are consumed only after remediation.', readinessA, ru ? 'Проверить' : 'Check', 'training-readiness-link'],
    ['09', ru ? 'Подтверждение' : 'Evidence', ru ? 'Mastery 30/30 + cases 6/6 + labs 4/4 + held-out pass + объяснённые ошибки.' : 'Mastery 30/30 + cases 6/6 + labs 4/4 + held-out pass + explained misses.', 'preflight/architect-foundations.html', ru ? 'Завершить' : 'Complete', 'training-evidence-link'],
  ];

  const methodRows = pathSteps.map(([n, title, copy, href, action, id]) => `
    <li class="study-method-row">
      <span class="training-path-number">${n}</span>
      <strong>${title}</strong>
      <span>${copy}</span>
      <a${id ? ` id="${id}"` : ''} href="${href}">${action}</a>
      ${id === 'training-cases-link' ? '<small id="training-cases-copy">0 / 6</small>' : ''}
      ${id === 'training-labs-link' ? '<small id="training-labs-copy">0 / 4</small>' : ''}
      ${id === 'training-misses-link' ? `<small id="training-misses-copy">${ru ? 'нет повторений' : 'none due'}</small>` : ''}
      ${id === 'training-readiness-link' ? '<small id="training-readiness-copy">not taken</small>' : ''}
      ${id === 'training-evidence-link' ? '<small id="training-evidence-copy">0 / 10</small>' : ''}
    </li>`).join('');

  return `<main class="training-dashboard" data-training-dashboard data-training-lang="${lang}">
    <section class="study-status">
      <div class="study-status-head">
        <div>
          <strong>CCAR-F · Foundation</strong>
          <span>60 ${ru ? 'вопросов' : 'questions'} · 120 min · 720 / 1000</span>
        </div>
        <div class="study-status-metrics">
          <span><b id="training-mastered">0 / 30</b> ${ru ? 'освоено' : 'mastered'}</span>
          <span><b id="training-misses">0</b> ${ru ? 'повторить' : 'due'}</span>
          <span><b id="training-cases-stat">0 / 6</b> cases</span>
          <span><b id="training-labs-stat">0 / 4</b> labs</span>
        </div>
      </div>

      <div class="study-next">
        <span class="training-panel-label">${ru ? 'Следующее действие' : 'Next action'}</span>
        <strong id="training-next-title">${ru ? 'Диагностика' : 'Diagnostic'}</strong>
        <p id="training-next-copy">${ru ? 'Начните с короткой попытки без подсказок, чтобы определить реальные пробелы.' : 'Start with a short no-reveal attempt to identify real gaps.'}</p>
        <a class="training-btn training-btn-primary" id="training-primary" href="${practice}?mode=exam&length=quick">${ru ? 'Начать' : 'Start'}</a>
      </div>

      <div class="training-progress-track" aria-hidden="true"><span id="training-progress-fill"></span></div>
      <p class="study-attempt" id="training-progress-detail">${ru ? 'Активной попытки нет.' : 'No active attempt.'}</p>
    </section>

    <section class="training-section objective-map" aria-labelledby="objective-map-title">
      <div class="training-section-head">
        <div>
          <span class="training-panel-label">${ru ? 'Прогресс' : 'Progress'}</span>
          <h2 id="objective-map-title">30 task statements</h2>
        </div>
      </div>
      <div class="objective-domains">${objectiveMap}</div>
    </section>

    <section class="training-section" aria-labelledby="study-materials-title">
      <div class="training-section-head">
        <div>
          <span class="training-panel-label">${ru ? 'Материалы' : 'Materials'}</span>
          <h2 id="study-materials-title">${ru ? 'Учить и проверять' : 'Study and verify'}</h2>
        </div>
      </div>
      <div class="material-list">
        <a href="${guide}"><strong>${ru ? 'Foundation guide' : 'Foundation guide'}</strong><span>${ru ? 'Теория, decision rules, worked examples, domain notes.' : 'Theory, decision rules, worked examples, domain notes.'}</span></a>
        <a href="${casesHref}"><strong>Scenario cases</strong><span>${ru ? '6 official scenario families · письменное reasoning + rubric.' : '6 official scenario families · written reasoning + rubric.'}</span></a>
        <a href="${labsHref}"><strong>Hands-on labs</strong><span>${ru ? '4 практических задания с acceptance criteria.' : 'Four practical builds with acceptance criteria.'}</span></a>
        <a href="${bank}"><strong>${ru ? 'Банк вопросов' : 'Question bank'}</strong><span>${ru ? 'Поиск по task statement, варианты и rationale.' : 'Browse task statements, options, and rationale.'}</span></a>
        <a href="cheatsheet/${lang}.html"><strong>Cheatsheet</strong><span>${ru ? 'Краткое повторение decision rules.' : 'Compact review of decision rules.'}</span></a>
        <a href="score-report.html"><strong>Score report</strong><span>${ru ? 'Привязать официальный результат к слабым objectives.' : 'Map an official score report to weak objectives.'}</span></a>
      </div>
    </section>

    <details class="training-section study-method">
      <summary>${ru ? 'Метод обучения' : 'Training method'}</summary>
      <ol class="study-method-list">${methodRows}</ol>
    </details>

    <section class="professional-row" id="professional-stage">
      <div>
        <span class="training-panel-label">CCAR-P</span>
        <strong>Professional</strong>
        <span id="professional-stage-status">${ru ? 'Откроется после Foundation mastery.' : 'Unlocks after Foundation mastery.'}</span>
      </div>
      <div class="training-stage-actions">
        <a class="training-btn disabled" id="professional-workspace-link" aria-disabled="true" href="${ru ? 'professional-ru.html' : 'professional.html'}">${ru ? 'Открыть workspace' : 'Open workspace'}</a>
      </div>
    </section>
  </main>`;
}

const REPORT_THEME_READINGS = {
  A: [
    { label: 'Chapter 3 · Agentic systems', href: 'guides/en.html#chapter-3-claude-agent-sdk-building-agentic-systems' },
    { label: 'Chapter 8 · Task decomposition', href: 'guides/en.html#chapter-8-task-decomposition-strategies' },
  ],
  B: [{ label: 'Chapter 3 · Agentic systems', href: 'guides/en.html#chapter-3-claude-agent-sdk-building-agentic-systems' }],
  C: [{ label: 'Chapter 9 · Human oversight', href: 'guides/en.html#chapter-9-escalation-and-human-in-the-loop' }],
  D: [{ label: 'Chapter 5 · Claude Code', href: 'guides/en.html#chapter-5-claude-code-configuration-and-workflows' }],
  E: [{ label: 'Chapter 3 · Agentic systems', href: 'guides/en.html#chapter-3-claude-agent-sdk-building-agentic-systems' }],
  F: [{ label: 'Chapter 13 · Built-in tools', href: 'guides/en.html#chapter-13-claude-code-built-in-tools' }],
  G: [{ label: 'Chapter 11 · Context management', href: 'guides/en.html#chapter-11-context-management-in-production-systems' }],
  H: [
    { label: 'Chapter 2 · Tools and structured output', href: 'guides/en.html#chapter-2-tools-and-tool-use' },
    { label: 'Chapter 7 · Message Batches API', href: 'guides/en.html#chapter-7-message-batches-api' },
  ],
  I: [{ label: 'Chapter 6 · Prompt engineering', href: 'guides/en.html#chapter-6-prompt-engineering-advanced-techniques' }],
  J: [{ label: 'Chapter 4 · MCP', href: 'guides/en.html#chapter-4-model-context-protocol-mcp' }],
};

const REPORT_ALIASES = {
  C3: [
    'Select the appropriate agentic review architecture—plan mode, direct execution, or multi-phase workflow—based on task scope, risk level, and human approval requirements.',
    'Determine when to use plan mode versus direct execution based on task scope, reversibility, stakeholder uncertainty, and the need for stakeholder review before implementation.',
  ],
  J4: [
    "Write MCP tool descriptions that clearly distinguish each tool's purpose, input formats, use-case boundaries, and relationships to semantically similar tools, reducing misrouting and incorrect tool selection.",
    'Improve tool selection reliability by expanding tool descriptions with use-case examples, input format specifications, and explicit disambiguation guidance for semantically similar tools.',
  ],
};

function guideHeadingSlug(value) {
  return slug(String(value).replace(/`/g, ''));
}

// The report reader serves every exam. Foundations keeps its own shape
// (report objectives keyed A1–J5 mapped to official subdomains); the two
// blueprint exams share buildBlueprintExamData below, where the report
// objective ids are the blueprint task ids themselves.
async function buildFoundationsReportData() {
  const meta = JSON.parse(await fs.readFile(path.join(ROOT, 'ccaf', 'data', 'objectives.json'), 'utf8'));
  // Domain weights decide how much of the exam a weak objective actually costs,
  // which is what orders the study plan. Foundations keeps them in its blueprint;
  // utils/exam_data.py carries the same numbers for the exam generators.
  const blueprint = JSON.parse(await fs.readFile(path.join(ROOT, 'ccaf', 'data', 'blueprint.json'), 'utf8'));
  const guidance = JSON.parse(await fs.readFile(path.join(ROOT, 'ccaf', 'data', 'objective_guidance.json'), 'utf8'));
  for (const id of Object.keys(meta.objectives)) {
    if (!['explanation', 'example', 'guidance'].every(field => typeof guidance[id]?.[field] === 'string' && guidance[id][field].trim())) {
      throw new Error(`Missing study guidance for ${id}`);
    }
  }
  const guide = await fs.readFile(path.join(ROOT, 'ccaf', 'guide_en.md'), 'utf8');
  const headings = new Map();
  guide.split(/\r?\n/).forEach(line => {
    const match = line.match(/^## (\d+\.\d+) (.+)$/);
    if (match) headings.set(match[1], { title: match[2], href: `guides/en.html#${guideHeadingSlug(`${match[1]} ${match[2]}`)}` });
  });

  const questions = await readExamBank('ccaf', 'exam_en.html');
  const questionCounts = {};
  Object.entries(meta.objective_subdomains).forEach(([id, subdomain]) => {
    questionCounts[id] = questions.filter(question => String(question.task_id || '') === String(subdomain)).length;
  });

  const readings = {};
  Object.entries(meta.objective_subdomains).forEach(([id, subdomain]) => {
    const heading = headings.get(subdomain);
    if (heading) readings[id] = { label: `${subdomain} · ${heading.title.replace(/`/g, '')}`, href: heading.href };
  });

  // A report objective sits under the official task statement it was folded
  // into ("1.4"), so its domain is that id's first segment.
  const domains = Object.fromEntries(Object.entries(blueprint.domains)
    .map(([key, value]) => [key, { name: value.name, weight: value.weight }]));
  const objectiveDomains = {};
  Object.entries(meta.objective_subdomains).forEach(([id, subdomain]) => {
    const domain = String(subdomain).split('.')[0];
    if (domains[domain]) objectiveDomains[id] = domain;
  });

  return {
    code: 'CCAR-F',
    name: 'Claude Certified Architect Foundations',
    practice: { href: 'practical/en.html', questions: 60, bank: { href: 'practical/bank-en.html' } },
    themes: meta.themes,
    domains,
    objectiveDomains,
    objectives: meta.objectives,
    objectiveThemes: Object.fromEntries(Object.keys(meta.objectives).map(id => [id, id.slice(0, 1)])),
    objectiveSubdomains: meta.objective_subdomains,
    aliases: REPORT_ALIASES,
    readings,
    themeReadings: REPORT_THEME_READINGS,
    guidance,
    questionCounts,
  };
}

// Domain-guidance headings carry the weight ("### 3. Integration - 19%"),
// which separates them from every other numbered heading in the guide.
function guideDomainHeadings(markdown) {
  const headings = new Map();
  markdown.split(/\r?\n/).forEach(line => {
    const match = line.match(/^### (\d+)\. (.+ [—–-] \d+(?:\.\d+)?%)$/);
    if (match && !headings.has(match[1])) headings.set(match[1], `${match[1]}. ${match[2]}`);
    const named = line.match(/^# Domain (\d+) [—–-] .+ \(\d+(?:\.\d+)?%\)$/);
    if (named && !headings.has(named[1])) headings.set(named[1], line.replace(/^# /, ''));
  });
  return headings;
}

async function buildBlueprintExamData({ code, name, objectivesFile, guidanceFile, bankFile, guideFile, guideHref, practiceHref, bankHref }) {
  const [metaRaw, guidanceRaw, bankRaw, guide] = await Promise.all([
    fs.readFile(path.join(ROOT, objectivesFile), 'utf8'),
    fs.readFile(path.join(ROOT, guidanceFile), 'utf8'),
    fs.readFile(path.join(ROOT, bankFile), 'utf8'),
    fs.readFile(path.join(ROOT, guideFile), 'utf8'),
  ]);
  const meta = JSON.parse(metaRaw);
  const guidance = JSON.parse(guidanceRaw);
  const bank = JSON.parse(bankRaw);

  const themes = {};
  const domains = {};
  const objectives = {};
  const objectiveThemes = {};
  const objectiveDomains = {};
  Object.keys(meta.domains).sort((a, b) => Number(a) - Number(b)).forEach(d => {
    themes[d] = meta.domains[d].name;
    domains[d] = { name: meta.domains[d].name, weight: meta.domains[d].weight };
    meta.domains[d].objectives.forEach((text, i) => {
      objectives[`${d}.${i + 1}`] = text;
      objectiveThemes[`${d}.${i + 1}`] = d;
      objectiveDomains[`${d}.${i + 1}`] = d;
    });
  });

  // The report matcher needs the official blueprint wording, and the bank
  // deep links need every objective to carry questions — enforce both here.
  const bankObjective = new Map();
  bank.forEach(question => {
    const id = String(question.task_id);
    if (!Object.prototype.hasOwnProperty.call(objectives, id)) throw new Error(`${code}: bank task_id ${id} is not a blueprint objective`);
    if (bankObjective.has(id) && bankObjective.get(id) !== question.objective) throw new Error(`${code}: bank disagrees with itself on ${id}`);
    bankObjective.set(id, question.objective);
  });
  Object.keys(objectives).forEach(id => {
    if (!bankObjective.has(id)) throw new Error(`${code}: objective ${id} has no bank questions`);
    if (bankObjective.get(id) !== objectives[id]) throw new Error(`${code}: bank wording differs from the blueprint for ${id}`);
  });

  const questionCounts = {};
  bank.forEach(question => {
    const id = String(question.task_id);
    questionCounts[id] = (questionCounts[id] || 0) + 1;
  });

  Object.keys(objectives).forEach(id => {
    const entry = guidance[id];
    if (!entry || !['explanation', 'example', 'guidance'].every(field => typeof entry[field] === 'string' && entry[field].trim())) {
      throw new Error(`Missing study guidance for ${code} ${id}`);
    }
  });

  const headings = guideDomainHeadings(guide);
  const themeReadings = {};
  Object.keys(themes).forEach(d => {
    const heading = headings.get(d);
    if (!heading) throw new Error(`${code}: guide has no domain heading for ${d}`);
    themeReadings[d] = [{ label: themes[d], href: `${guideHref}#${slug(heading)}` }];
  });

  const objectiveSubdomains = {};
  Object.keys(objectives).forEach(id => { objectiveSubdomains[id] = id; });

  return {
    code,
    name,
    practice: { href: practiceHref, questions: meta._exam.items, bank: { href: bankHref } },
    themes,
    objectives,
    objectiveThemes,
    domains,
    objectiveDomains,
    objectiveSubdomains,
    aliases: {},
    readings: {},
    themeReadings,
    guidance,
    questionCounts,
  };
}

async function buildScoreReportData() {
  const exams = {};
  exams['CCAR-F'] = await buildFoundationsReportData();
  exams['CCAR-P'] = await buildBlueprintExamData({
    code: 'CCAR-P',
    name: 'Claude Certified Architect Professional',
    objectivesFile: path.join('ccap', 'data', 'objectives.json'),
    guidanceFile: path.join('ccap', 'data', 'objective_guidance.json'),
    bankFile: path.join('ccap', 'data', 'questions.json'),
    guideFile: path.join('ccap', 'guide_en.md'),
    guideHref: 'guides/professional-en.html',
    practiceHref: 'practical/professional-en.html',
    bankHref: 'practical/bank-professional-en.html',
  });
  return { version: 2, exams };
}

function scoreReportPage() {
  return `<main class="report-page">
  <div id="report-intro">
    <section class="report-hero">
      <h1>Score report</h1>
      <p class="report-lede">Upload a CCAR-F or CCAR-P PDF to map weak objectives to the relevant material and practice.</p>
    </section>
    <section class="report-upload" aria-label="Upload your report">
      <label class="file-picker" for="report-file"><span>Upload score report</span><input id="report-file" type="file" accept="application/pdf,.pdf"></label>
      <p class="report-file-note">PDF · Your report stays private on this device.</p>
      <p id="report-status" class="report-status" role="status" aria-live="polite"></p>
    </section>
  </div>

  <section id="exam-choice" class="report-panel" aria-labelledby="exam-choice-title" hidden>
    <h2 id="exam-choice-title">Which exam is this report for?</h2>
    <p id="exam-choice-message">Choose the exam shown on your report.</p>
    <label class="report-objective-field" for="exam-select">Exam
      <select id="exam-select">
        <option value="">Choose an exam</option>
        <option value="CCAR-F">Architect Foundations (CCAR-F)</option>
        <option value="CCAR-P">Architect Professional (CCAR-P)</option>
      </select>
    </label>
    <div class="report-actions"><button id="confirm-exam" class="report-primary" type="button" disabled>Continue</button></div>
  </section>

  <section id="plan" class="report-plan" aria-labelledby="plan-title" hidden>
    <div class="report-plan-heading">
      <div><p id="result-exam" class="track-label"></p><h1 id="plan-title">Your personalized study guide.</h1><p id="plan-count" class="plan-count"></p></div>
      <button id="replace-report" class="report-text-button" type="button">Upload another report</button>
    </div>
    <div class="report-result-actions"><a id="practice-link" class="report-primary disabled" href="practical/en.html?targeted=1" aria-disabled="true">Start practice exam</a><span id="practice-note"></span></div>
    <details class="report-share">
      <summary class="report-share-summary">Share or export</summary>
      <div class="report-result-actions report-share-actions">
        <button id="download-guide" class="report-secondary" type="button" disabled>Download study guide (.md)</button>
        <button id="copy-guide-link" class="report-secondary" type="button" disabled>Copy link to study guide</button>
        <button id="copy-exam-link" class="report-secondary" type="button" disabled>Copy link to custom exam</button>
        <button id="save-exam-file" class="report-secondary" type="button" disabled>Save custom exam (.json)</button>
        <label class="report-secondary report-file-label" for="load-exam-file">Load custom exam<input id="load-exam-file" type="file" accept="application/json,.json" hidden></label>
      </div>
    </details>
    <p id="share-status" class="report-status" role="status" aria-live="polite"></p>
    <p id="plan-status" class="report-status" role="status" aria-live="polite"></p>
    <p id="persistence-note" class="report-file-note"></p>
    <div id="plan-list" class="study-list"></div>
  </section>

  <details id="review" class="report-review" hidden>
    <summary id="review-title">Report details</summary>
    <button id="delete-saved-study" class="report-text-button" type="button">Delete saved study data</button>
    <p id="review-summary" class="review-summary"></p>
    <div id="review-list" class="review-list"></div>
    <button id="build-plan" type="button" hidden disabled>Update study guide</button>
  </details>
  <dialog id="objective-picker" aria-labelledby="objective-picker-title">
    <h2 id="objective-picker-title">Choose an objective</h2>
    <input id="objective-picker-search" type="search" placeholder="Search objectives…" autocomplete="off">
    <p id="objective-picker-status" class="search-status" role="status" aria-live="polite"></p>
    <ul id="objective-picker-results" aria-label="Objectives"></ul>
    <div class="report-actions"><button id="objective-picker-close" class="report-secondary" type="button">Close</button></div>
  </dialog>
</main>`;
}

// ---------- preflight checklist ----------

// One entry per certification track. Each drives a standalone checklist page:
// its own facts, blueprint, items, resources, and localStorage key, rendered
// through the shared preflight() below. `files` lists every filename the page
// is written to — Foundations also answers to the original `en.html`, which
// the README and the landing page have always linked.
const PREFLIGHT_TRACKS = [
  {
    slug: 'architect-foundations',
    files: ['architect-foundations.html', 'en.html'],
    storageKey: 'ccaf-preflight:state',
    title: 'Readiness — Claude Certified Architect – Foundations · CCAR Training',
    eyebrow: 'Architect &mdash; Foundations &middot; CCAR-F',
    heading: 'Foundation <span class="accent">readiness.</span>',
    lede: 'Mark a check only when you can demonstrate the skill without relying on answer memorization.',
    scope: '<strong>CCAR-F only.</strong> Complete this before moving to Architect &mdash; Professional.',
    note: 'Practice both multiple-choice and multiple-response. Train against the five-domain blueprint and the published scenario structure.',
    facts: [
      { k: 'Code', v: 'CCAR-F' },
      { k: 'Questions', v: '60' },
      { k: 'Time', v: '120 min' },
      { k: 'Pass', v: '720 / 1000' },
    ],
    domains: [
      { n: '01', name: 'Agentic Architecture &amp; Orchestration', weight: 27 },
      { n: '02', name: 'Tool Design &amp; MCP Integration', weight: 18 },
      { n: '03', name: 'Claude Code Configuration &amp; Workflows', weight: 20 },
      { n: '04', name: 'Prompt Engineering &amp; Structured Output', weight: 20 },
      { n: '05', name: 'Context Management &amp; Reliability', weight: 15 },
    ],
    items: [
      {
        n: '01',
        label: 'Official guide completed',
        detail: 'Read the current CCAR-F exam guide and map every task statement to the study guide.',
      },
      {
        n: '02',
        label: 'D1 — Agent architecture and orchestration',
        detail: 'Choose agent loops, decomposition, coordinator/subagent boundaries, hooks, handoffs, and session strategy from a scenario and defend the trade-off.',
      },
      {
        n: '03',
        label: 'D2 — Tool design and MCP',
        detail: 'Design narrow tool interfaces, classify errors, distribute tools by responsibility, and choose MCP or built-in tools for the stated constraint.',
      },
      {
        n: '04',
        label: 'D3 — Claude Code workflows',
        detail: 'Reason about CLAUDE.md scope, rules, skills and commands, plan vs direct execution, iterative review, and CI/CD integration.',
      },
      {
        n: '05',
        label: 'D4 — Prompting and structured output',
        detail: 'Choose explicit criteria, few-shot examples, schema/tool enforcement, validation and retry loops, batch strategy, and independent review patterns.',
      },
      {
        n: '06',
        label: 'D5 — Context and reliability',
        detail: 'Preserve critical context, propagate errors, resolve ambiguity, calibrate human review, and retain provenance across multi-source work.',
      },
      {
        n: '07',
        label: 'Multiple-response format practiced',
        detail: 'Answer select-N items by evaluating every option against the scenario constraint rather than selecting everything that sounds plausible.',
      },
      {
        n: '08',
        label: 'Scenario transfer and hands-on completed',
        detail: 'Complete all six official scenario-family case packs plus the four practical labs. A case counts only after written reasoning and rubric review; a lab counts only after checking the deliverable against every acceptance criterion.',
      },
      {
        n: '09',
        label: 'Timed mock and held-out readiness completed',
        detail: 'Complete a 60-question / 120-minute normal mock, then pass a separate held-out 60-question form at 720+ without prior exposure to those items.',
      },
      {
        n: '10',
        label: 'Misses explained from first principles',
        detail: 'For repeated misses, explain why the correct choice satisfies the constraint and why each distractor fails. Do not memorize option letters.',
      },
    ],
    resources: [
      {
        group: 'Training',
        items: [
          { name: 'Study guide', href: 'guides/en.html', note: 'Task statements, decision rules, and worked reasoning.', internal: true },
          { name: 'Practice', href: 'practical/en.html', note: 'Weighted study drills and full timed attempts.', internal: true },
          { name: 'Scenario cases', href: 'cases/foundation-en.html', note: 'Six official scenario families with written reasoning and rubrics.', internal: true },
          { name: 'Hands-on labs', href: 'labs/foundation-en.html', note: 'Four builds with explicit deliverables and acceptance criteria.', internal: true },
          { name: 'Held-out readiness', href: 'practical/readiness-a-en.html', note: 'Unseen exam-only readiness form; excluded from the ordinary training bank.', internal: true },
          { name: 'Question bank', href: 'practical/bank-en.html', note: 'Browse by domain and inspect explanations.', internal: true },
          { name: 'Cheatsheet', href: 'cheatsheet/en.html', note: 'Compact recall reference.', internal: true },
        ],
      },
      {
        group: 'Source of truth',
        items: [
          {
            name: 'Official CCAR-F exam guide',
            href: 'https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification',
            note: 'Use the current official guide when any study material conflicts with it.',
          },
        ],
      },
    ],
  },
  {
    slug: 'architect-professional',
    files: ['architect-professional.html'],
    storageKey: 'ccarp-preflight:state',
    title: 'Readiness — Claude Certified Architect – Professional · CCAR Training',
    eyebrow: 'Architect &mdash; Professional &middot; CCAR-P',
    heading: 'Professional <span class="accent">readiness.</span>',
    lede: 'Mark a check only when you can make and defend the architecture decision from an unfamiliar scenario.',
    scope: '<strong>CCAR-P only.</strong> Stage 2 after Architect &mdash; Foundations.',
    note: 'Train architecture trade-offs, integration, evaluation, governance, lifecycle, and operational enablement across all seven domains.',
    facts: [
      { k: 'Code', v: 'CCAR-P' },
      { k: 'Questions', v: '63' },
      { k: 'Time', v: '120 min' },
      { k: 'Pass', v: '720 / 1000' },
    ],
    domains: [
      { n: '01', name: 'Solution Design &amp; Architecture', weight: 17 },
      { n: '02', name: 'Claude Models, Prompting &amp; Context Engineering', weight: 13 },
      { n: '03', name: 'Integration', weight: 19 },
      { n: '04', name: 'Evaluation, Testing &amp; Optimization', weight: 16 },
      { n: '05', name: 'Governance, Safety &amp; Risk Management', weight: 14 },
      { n: '06', name: 'Stakeholder Communication &amp; Lifecycle Management', weight: 14 },
      { n: '07', name: 'Developer Productivity &amp; Operational Enablement', weight: 7 },
    ],
    items: [
      {
        n: '01',
        label: 'Current official guide completed',
        detail: 'Read the current CCAR-P exam guide and map every task statement to the study guide.',
      },
      {
        n: '02',
        label: 'D1 — Solution design and architecture',
        detail: 'Translate a business constraint into an end-to-end Claude architecture and defend workflow vs agentic vs augmented-LLM patterns.',
      },
      {
        n: '03',
        label: 'D2 — Models, prompting, and context',
        detail: 'Choose model tier, prompt strategy, context policy, caching, and modular prompt or Skill design from explicit cost, latency, and quality constraints.',
      },
      {
        n: '04',
        label: 'D3 — Integration',
        detail: 'Reason about auth, capability bloat, RAG shape, retrieval, observability, progressive discovery, and MCP/API/CLI/agent-to-agent boundaries.',
      },
      {
        n: '05',
        label: 'D4 — Evaluation and optimization',
        detail: 'Define metrics, datasets, mixed evaluation methods, A/B tests, diagnosis strategy, and cost/latency/quality optimization.',
      },
      {
        n: '06',
        label: 'D5 — Governance, safety, and risk',
        detail: 'Place guardrails at the correct control point, identify failure modes, choose HITL, and reason about compliance, bias, fairness, and transparency.',
      },
      {
        n: '07',
        label: 'D6 — Stakeholders and lifecycle',
        detail: 'Gather requirements, communicate trade-offs, define SLAs, document the design, and plan handoff, monitoring, and iteration.',
      },
      {
        n: '08',
        label: 'D7 — Developer productivity and operations',
        detail: 'Configure team tooling, improve engineering workflows, and diagnose operational issues without over-automating unsafe decisions.',
      },
      {
        n: '09',
        label: 'Timed mock and held-out readiness completed',
        detail: 'Complete a 63-question / 120-minute normal mock, then pass the separate held-out 63-question form at 720+ without prior exposure to those items.',
      },
      {
        n: '10',
        label: 'Capstone and architecture trade-offs can be defended',
        detail: 'Complete the end-to-end Professional capstone. For each major choice, state the governing constraint, rejected alternatives, operational consequence, evaluation gate, risk owner, and handoff evidence.',
      },
    ],
    resources: [
      {
        group: 'Training',
        items: [
          { name: 'Study guide', href: 'guides/professional-en.html', note: 'Seven-domain task statements and decision rules.', internal: true },
          { name: 'Practice', href: 'practical/professional-en.html', note: 'Weighted study drills and full timed attempts.', internal: true },
          { name: 'Professional capstone', href: 'professional/capstone-en.html', note: 'Nine architecture artifacts plus five injected failure cases on one end-to-end system.', internal: true },
          { name: 'Held-out readiness A', href: 'practical/readiness-a-professional-en.html', note: 'First unseen 63-question readiness form; excluded from normal study and browsing.', internal: true },
          { name: 'Held-out readiness B', href: 'practical/readiness-b-professional-en.html', note: 'Second non-overlapping form for use only after remediation if A does not pass.', internal: true },
          { name: 'Question bank', href: 'practical/bank-professional-en.html', note: 'Browse by domain and inspect explanations.', internal: true },
        ],
      },
      {
        group: 'Source of truth',
        items: [
          {
            name: 'Official CCAR-P exam guide',
            href: 'https://anthropic-partners.skilljar.com/claude-certified-architect-professional-certification',
            note: 'Use the current official guide when any study material conflicts with it.',
          },
        ],
      },
    ],
  },
];

function extLink(href, text) {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text} →</a>`;
}

const CHECK_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

function preflightStyles() {
  return `<style>
.preflight { max-width: var(--max); margin: 0 auto; padding: 56px 32px 24px; }
.preflight .hero { margin-bottom: 0; }
.pf-headline { display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: end; }
.pf-count { text-align: right; line-height: 1; }
.pf-count .pf-count-n { font-size: clamp(3.4rem, 9vw, 5.6rem); font-weight: 600; color: var(--fg); font-variant-numeric: tabular-nums; }
.pf-count .pf-count-n.done { color: var(--accent); }
.pf-count .pf-count-label { display: block; margin-top: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.66rem; letter-spacing: 0.167em; text-transform: uppercase; color: var(--subtle); }
.pf-scope { max-width: 68ch; margin: 0; padding: 12px 14px; border-left: 2px solid var(--accent); background: var(--bg-elev); font-size: 0.84rem; line-height: 1.6; color: var(--muted); }
.pf-scope a { color: var(--accent); }
.pf-dots { display: flex; gap: 8px; margin: 28px 0 36px; }
.pf-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border-strong); transition: background .25s var(--ease); }
.pf-dot.on { background: var(--accent); }

.pf-panel { border: 1px solid var(--border); padding: 22px 24px; margin-bottom: 36px; }
.pf-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.167em; text-transform: uppercase; color: var(--subtle); margin: 0 0 16px; }
.pf-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(132px, 1fr)); border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 22px; }
.pf-fact { display: grid; gap: 7px; padding: 14px 16px; border-right: 1px solid var(--border); }
.pf-fact:last-child { border-right: 0; }
.pf-fact-k { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--subtle); }
.pf-fact-v { font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; color: var(--fg); font-weight: 600; }
.pf-note { font-size: 0.82rem; color: var(--muted); line-height: 1.55; margin: 0 0 18px; }
.pf-domains { display: grid; gap: 18px; }
.pf-domain-head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-bottom: 6px; }
.pf-domain-name { display: flex; gap: 14px; align-items: baseline; min-width: 0; }
.pf-domain-n { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--subtle); flex-shrink: 0; }
.pf-domain-w { font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; color: var(--accent); font-weight: 600; flex-shrink: 0; }
.pf-bar { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
.pf-bar span { display: block; height: 100%; background: var(--accent); border-radius: 2px; }

.pf-list { border-top: 1px solid var(--border); }
.pf-row { display: grid; grid-template-columns: 34px 22px 1fr; gap: 18px; align-items: start; padding: 20px 14px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background .2s var(--ease); position: relative; }
.pf-row:hover { background: var(--bg-elev); }
.pf-row:has(.pf-check:checked) { background: color-mix(in srgb, var(--accent) 7%, transparent); }
.pf-check { position: absolute; opacity: 0; width: 1px; height: 1px; margin: 0; }
.pf-n { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; padding-top: 2px; letter-spacing: 0.05em; color: var(--subtle); transition: color .25s var(--ease); }
.pf-row:has(.pf-check:checked) .pf-n { color: var(--accent); }
.pf-box { width: 22px; height: 22px; margin-top: 1px; border: 1.5px solid var(--border-strong); border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: transparent; transition: background .18s var(--ease), border-color .18s var(--ease); }
.pf-row:hover .pf-box { border-color: var(--fg); }
.pf-row:has(.pf-check:checked) .pf-box { background: var(--accent); border-color: var(--accent); color: var(--accent-fg); }
.pf-row:has(.pf-check:focus-visible) .pf-box { outline: 2px solid var(--accent); outline-offset: 3px; }
.pf-item-label { display: block; font-size: 0.98rem; font-weight: 600; color: var(--fg); margin-bottom: 5px; }
.pf-item-detail { display: block; max-width: 72ch; font-size: 0.85rem; color: var(--muted); line-height: 1.6; }
.pf-item-detail a { color: var(--accent); }

.pf-actions { margin-top: 24px; }
.pf-reset { background: transparent; color: var(--muted); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 11px 18px; font: inherit; font-size: 0.76rem; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: color .15s var(--ease), border-color .15s var(--ease); }
.pf-reset:hover { color: var(--fg); border-color: var(--border-strong); }

.pf-resources { margin-top: 40px; border: 1px solid var(--border); }
.pf-resources > summary { padding: 14px 18px; cursor: pointer; display: flex; align-items: center; gap: 14px; color: var(--muted); font-size: 0.88rem; list-style: none; }
.pf-resources > summary::-webkit-details-marker { display: none; }
.pf-resources > summary::after { content: "▾"; margin-left: auto; color: var(--subtle); transition: transform .2s var(--ease); }
.pf-resources[open] > summary::after { transform: rotate(180deg); }
.pf-resources > summary:hover { background: var(--bg-elev); color: var(--fg); }
.pf-resources > summary .pf-eyebrow { margin: 0; }
.pf-resource-body { padding: 4px 24px 24px; display: grid; gap: 24px; }
.pf-resource-group > .pf-eyebrow { color: var(--accent); margin-bottom: 14px; }
.pf-resource-items { display: grid; gap: 14px; }
.pf-resource-items a { color: var(--accent); }
.pf-resource-note { font-size: 0.85rem; color: var(--muted); margin-top: 4px; line-height: 1.5; }

@media (max-width: 640px) {
  .preflight { padding: 40px 20px 16px; }
  .pf-headline { grid-template-columns: 1fr; align-items: start; }
  .pf-count { text-align: left; }
  .pf-row { grid-template-columns: 28px 22px 1fr; gap: 12px; padding: 16px 4px; }
  .pf-facts { grid-template-columns: repeat(2, 1fr); }
  .pf-fact { border-bottom: 1px solid var(--border); }
  .pf-fact:nth-child(odd) { border-right: 1px solid var(--border); }
  .pf-fact:nth-last-child(-n+2) { border-bottom: 0; }
}
</style>`;
}


function preflightScript(track) {
  return `<script>
(() => {
  const KEY = '${track.storageKey}';
  const boxes = [...document.querySelectorAll('.pf-check')];
  const dotFor = n => document.querySelector('.pf-dot[data-n="' + n + '"]');
  const counter = document.getElementById('pf-remaining');
  const total = boxes.length;

  const read = () => {
    try {
      const raw = localStorage.getItem(KEY);
      const data = raw ? JSON.parse(raw) : null;
      return new Set(Array.isArray(data && data.checked) ? data.checked : []);
    } catch (err) {
      return new Set();
    }
  };
  const write = () => {
    try {
      const checked = boxes.filter(b => b.checked).map(b => b.dataset.n);
      localStorage.setItem(KEY, JSON.stringify({ checked }));
    } catch (err) { /* private mode — in-session state still works */ }
  };
  const render = () => {
    const done = boxes.filter(b => b.checked).length;
    counter.textContent = String(total - done).padStart(2, '0');
    counter.classList.toggle('done', done === total);
    boxes.forEach(b => {
      const dot = dotFor(b.dataset.n);
      if (dot) dot.classList.toggle('on', b.checked);
    });
  };

  const saved = read();
  boxes.forEach(b => { b.checked = saved.has(b.dataset.n); });
  render();

  boxes.forEach(b => b.addEventListener('change', () => { write(); render(); }));

  const reset = document.getElementById('pf-reset');
  if (reset) reset.addEventListener('click', () => {
    boxes.forEach(b => { b.checked = false; });
    try { localStorage.removeItem(KEY); } catch (err) {}
    render();
  });
})();
<\/script>`;
}

function preflight(track) {
  const facts = track.facts.map(f => `
        <div class="pf-fact"><span class="pf-fact-k">${f.k}</span><span class="pf-fact-v">${f.v}</span></div>`).join('');
  const domains = track.domains.map(d => `
        <div>
          <div class="pf-domain-head">
            <span class="pf-domain-name"><span class="pf-domain-n">${d.n}</span><span>${d.name}</span></span>
            <span class="pf-domain-w">${d.weight}%</span>
          </div>
          <div class="pf-bar"><span style="width:${d.weight}%"></span></div>
        </div>`).join('');
  const dots = track.items.map(i => `<span class="pf-dot" data-n="${i.n}"></span>`).join('');
  const rows = track.items.map(i => `
      <label class="pf-row">
        <input type="checkbox" class="pf-check" data-n="${i.n}" autocomplete="off">
        <span class="pf-n">${i.n}</span>
        <span class="pf-box">${CHECK_SVG}</span>
        <span>
          <span class="pf-item-label">${i.label}</span>
          <span class="pf-item-detail">${i.detail}</span>
        </span>
      </label>`).join('');
  const resources = track.resources.map(g => `
        <div class="pf-resource-group">
          <p class="pf-eyebrow">${g.group}</p>
          <div class="pf-resource-items">${g.items.map(item => `
            <div>
              ${item.internal ? `<a href="${item.href}">${item.name}</a>` : extLink(item.href, item.name)}
              <div class="pf-resource-note">${item.note}</div>
            </div>`).join('')}
          </div>
        </div>`).join('');

  return `${preflightStyles()}
<main class="preflight">
  <section class="hero">
    <div class="pf-headline">
      <div style="display:grid;gap:16px">
        <p class="eyebrow">${track.eyebrow}</p>
        <h1>${track.heading}</h1>
        <p class="lede">${track.lede}</p>
        <p class="pf-scope">${track.scope}</p>
      </div>
      <div class="pf-count">
        <div class="pf-count-n" id="pf-remaining">${String(track.items.length).padStart(2, '0')}</div>
        <span class="pf-count-label">Left</span>
      </div>
    </div>
    <div class="pf-dots">${dots}</div>
  </section>

  <section class="pf-panel" aria-labelledby="pf-blueprint">
    <p class="pf-eyebrow" id="pf-blueprint">Exam blueprint</p>
    <div class="pf-facts">${facts}
    </div>
    <p class="pf-note">${track.note}</p>
    <div class="pf-domains">${domains}
    </div>
  </section>

  <section class="pf-list" aria-label="Readiness checklist">${rows}
  </section>

  <div class="pf-actions">
    <button type="button" id="pf-reset" class="pf-reset">Reset checklist</button>
  </div>

  <details class="pf-resources">
    <summary><span class="pf-eyebrow">Resources</span><span>Practice mocks and study materials</span></summary>
    <div class="pf-resource-body">${resources}
    </div>
  </details>
</main>
${preflightScript(track)}`;
}

async function buildPreflight() {
  const out = path.join(DOCS, 'preflight');
  await ensureDir(out);
  for (const track of PREFLIGHT_TRACKS) {
    const html = pageShell({
      title: track.title,
      lang: 'en',
      baseHref: SITE_BASE_HREF,
      body: `${header('en')}${preflight(track)}`,
    });
    for (const file of track.files) {
      await fs.writeFile(path.join(out, file), html);
    }
  }
}

async function buildGuides() {
  const searchDocs = [];
  const guides = [
    ...LANGS.map(l => ({ ...l, output: l.code })),
    ...PROFESSIONAL_GUIDES,
  ];
  for (const l of guides) {
    const src = path.join(ROOT, l.guide);
    if (!(await exists(src))) {
      console.warn(`skip ${l.code}: ${l.guide} not found`);
      continue;
    }
    const md = await fs.readFile(src, 'utf8');
    const ui = GUIDE_UI[l.code] || GUIDE_UI.en;

    // walk the tokens once: search-index entries + TOC outline (h1/h2).
    // The slugger advances on every heading so ids stay in step with the
    // renderer's slugger, which also sees every heading.
    const tokens = marked.lexer(md);
    const tocEntries = [];
    let currentHeading = null;
    let currentHeadingId = null;
    let buffer = '';
    let id = 0;
    const searchSlug = createSlugger();
    const flush = () => {
      if (currentHeading) {
        searchDocs.push({
          id: `${l.output}#${++id}`,
          lang: l.code,
          heading: currentHeading,
          body: buffer.slice(0, 400),
          url: `guides/${l.output}.html#${currentHeadingId}`,
        });
      }
      buffer = '';
    };
    for (const t of tokens) {
      if (t.type === 'heading') {
        flush();
        currentHeading = t.text;
        const raw = t.tokens?.map(token => token.raw ?? token.text ?? '').join('') || t.text;
        currentHeadingId = searchSlug(raw);
        if (t.depth <= 2) {
          tocEntries.push({ depth: t.depth, text: headingText(raw), id: currentHeadingId });
        }
      }
      else if (t.type === 'paragraph' || t.type === 'code') { buffer += ' ' + (t.text || t.raw || ''); }
    }
    flush();

    headingSlug = createSlugger();
    anchorLabel = ui.anchor;
    pageHref = `guides/${l.output}.html`;
    const html = marked.parse(md);
    const out = path.join(DOCS, 'guides', `${l.output}.html`);
    await ensureDir(path.dirname(out));
    // A guide reader has exactly one matching practice exam, so its bank is
    // worth fetching at idle priority: by the time they click through, the
    // exam page has nothing left to download and never shows its skeleton.
    const ownBank = bankHrefs[`practical/${l.output}.html`];
    await fs.writeFile(out, pageShell({
      title: `${l.title || l.label} — Claude Certified Architect · CCAR Training`,
      lang: l.code,
      baseHref: SITE_BASE_HREF,
      extraHead: ownBank ? `<link rel="prefetch" as="fetch" href="${ownBank}">
` : '',
      body: `${header(
        l.code,
        l.output === 'en' ? 'guides/ru.html'
          : l.output === 'ru' ? 'guides/en.html'
          : l.output === 'professional-en' ? 'guides/professional-ru.html'
          : l.output === 'professional-ru' ? 'guides/professional-en.html'
          : null
      )}<main class="guide">${renderToc(tocEntries, ui.contents, pageHref)}<div class="guide-body">${html}</div></main>`,
    }));
  }

  const mini = new MiniSearch({ fields: ['heading', 'body'], storeFields: ['heading', 'lang', 'url'] });
  mini.addAll(searchDocs);
  await fs.writeFile(path.join(DOCS, 'search-index.json'), JSON.stringify(mini.toJSON()));
}

// Plain text for TOC entries: drop inline markdown, escape for HTML.
function headingText(s) {
  return String(s)
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .trim();
}

// Collapsible table of contents from h1/h2 headings. h2s nest under the
// preceding h1; a leading h2 with no h1 stays at the top level.
function renderToc(entries, label, pageHref) {
  if (entries.length < 2) return '';
  const tree = [];
  for (const e of entries) {
    const last = tree[tree.length - 1];
    if (e.depth === 1 || !last || last.depth !== 1) tree.push({ ...e, children: [] });
    else last.children.push(e);
  }
  const li = e =>
    `<li><a href="${pageHref}#${e.id}">${e.text}</a>${e.children?.length ? `<ol>${e.children.map(li).join('')}</ol>` : ''}</li>`;
  return `<details class="guide-toc">
<summary>${label}</summary>
<nav aria-label="${label}"><ol>${tree.map(li).join('')}</ol></nav>
</details>\n`;
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function createSlugger() {
  const counts = new Map();
  return value => {
    const base = slug(value) || 'section';
    const count = counts.get(base) || 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

async function copyBrowserDependencies() {
  const vendor = path.join(DOCS, 'vendor');
  await ensureDir(vendor);
  await fs.copyFile(MINISEARCH_BROWSER, path.join(vendor, 'minisearch.js'));
  await fs.copyFile(`${MINISEARCH_BROWSER}.map`, path.join(vendor, 'index.js.map'));
  const pdfjs = path.join(vendor, 'pdfjs');
  await ensureDir(pdfjs);
  await fs.copyFile(path.join(PDFJS_BUILD, 'pdf.min.mjs'), path.join(pdfjs, 'pdf.min.mjs'));
  await fs.copyFile(path.join(PDFJS_BUILD, 'pdf.worker.min.mjs'), path.join(pdfjs, 'pdf.worker.min.mjs'));
}

async function copyScoreReport() {
  const data = await buildScoreReportData();
  // The theme readings deep-link into the generated guide pages; a slug
  // drift would silently produce dead links, so verify them post-build.
  const guidePages = {
    'CCAR-P': 'guides/professional-en.html',
  };
  for (const [code, page] of Object.entries(guidePages)) {
    const html = await fs.readFile(path.join(DOCS, page), 'utf8');
    Object.values(data.exams[code].themeReadings).flat().forEach(reading => {
      if (!html.includes(`id="${reading.href.split('#')[1]}"`)) throw new Error(`${code}: guide is missing the anchor ${reading.href}`);
    });
  }
  await fs.copyFile(path.join(ROOT, 'scripts', 'score-report.js'), path.join(DOCS, 'score-report.js'));
  await fs.writeFile(path.join(DOCS, 'score-report-data.json'), JSON.stringify(data));
  await fs.writeFile(path.join(DOCS, 'score-report.html'), pageShell({
    title: 'Score Report · CCAR Training',
    lang: 'en',
    baseHref: SITE_BASE_HREF,
    body: `${header('en')}${scoreReportPage()}`,
    extraScripts: '<script type="module" src="score-report.js"></script>',
  }));
  console.log(`Score report reader built with PDF.js ${PDFJS_VERSION} (${Object.keys(data.exams).length} exams, ${Object.values(data.exams).reduce((n, exam) => n + Object.keys(exam.objectives).length, 0)} objectives)`);
}

// One JSON per bank, shared by a practice page and its bank twin and named by
// content hash, so a browser that has one page's bank already has the other's.
async function copyExamBanks() {
  const out = path.join(DOCS, 'practical', 'data');
  await ensureDir(out);
  const kept = new Set();
  for (const track of EXAM_TRACKS) {
    const manifest = await bankManifest(track);
    for (const rel of new Set(Object.values(manifest))) {
      const name = path.basename(rel);
      await fs.copyFile(path.join(ROOT, track, 'dist', rel), path.join(out, name));
      kept.add(name);
    }
  }
  // An edit to a bank changes its hash, so the previous file would otherwise
  // stay published forever.
  for (const f of await fs.readdir(out)) {
    if (f.endsWith('.json') && !kept.has(f)) await fs.rm(path.join(out, f));
  }
  console.log(`Question banks: ${kept.size} files in practical/data`);
}

async function collectBankHrefs() {
  const pages = [
    ...LANGS.map(l => ({ ...l, output: l.code })),
    ...PROFESSIONAL_GUIDES,
  ];
  const map = {};
  for (const l of pages) {
    const track = l.test.split('/')[0];
    const manifest = await bankManifest(track);
    const exam = manifest[path.basename(l.test)];
    const bank = l.bank && manifest[path.basename(l.bank)];
    if (exam) map[`practical/${l.output}.html`] = `practical/data/${path.basename(exam)}`;
    if (bank) map[`practical/bank-${l.output}.html`] = `practical/data/${path.basename(bank)}`;
  }
  bankHrefs = map;
}

async function copyPracticalTests() {
  const out = path.join(DOCS, 'practical');
  await ensureDir(out);
  for (const l of LANGS) {
    const src = path.join(ROOT, l.test);
    if (l.bank && await exists(path.join(ROOT, l.bank))) {
      await fs.copyFile(path.join(ROOT, l.bank), path.join(out, `bank-${l.code}.html`));
    }
    if (l.readinessA && await exists(path.join(ROOT, l.readinessA))) {
      await fs.copyFile(path.join(ROOT, l.readinessA), path.join(out, `readiness-a-${l.code}.html`));
    }
    if (l.readinessB && await exists(path.join(ROOT, l.readinessB))) {
      await fs.copyFile(path.join(ROOT, l.readinessB), path.join(out, `readiness-b-${l.code}.html`));
    }
    if (l.readinessC && await exists(path.join(ROOT, l.readinessC))) {
      await fs.copyFile(path.join(ROOT, l.readinessC), path.join(out, `readiness-c-${l.code}.html`));
    }
    const dest = path.join(out, `${l.code}.html`);
    if (await exists(src)) {
      await fs.copyFile(src, dest);
    } else {
      const body = `${header(l.code)}<main class="placeholder">
        <h1>Practical exam — ${l.label}</h1>
        <p>This practical test has not been generated yet.</p>
        <p><a href="index.html">← back to home</a></p>
      </main>`;
      await fs.writeFile(dest, pageShell({
        title: `${l.label} — Practical exam (pending) · CCAR Training`,
        lang: l.code,
        baseHref: SITE_BASE_HREF,
        body,
      }));
    }
  }
}

// Professional pages are keyed on `output` (professional-en.html /
// professional-ru.html), never on `code`, so they cannot overwrite the
// Foundation EN/RU practice pages.
async function copyProfessionalExams() {
  const out = path.join(DOCS, 'practical');
  await ensureDir(out);
  for (const l of PROFESSIONAL_GUIDES) {
    if (!l.test) continue;
    const src = path.join(ROOT, l.test);
    if (l.bank && await exists(path.join(ROOT, l.bank))) {
      await fs.copyFile(path.join(ROOT, l.bank), path.join(out, `bank-${l.output}.html`));
    }
    if (l.readinessA && await exists(path.join(ROOT, l.readinessA))) {
      await fs.copyFile(path.join(ROOT, l.readinessA), path.join(out, `readiness-a-${l.output}.html`));
    }
    if (l.readinessB && await exists(path.join(ROOT, l.readinessB))) {
      await fs.copyFile(path.join(ROOT, l.readinessB), path.join(out, `readiness-b-${l.output}.html`));
    }
    const dest = path.join(out, `${l.output}.html`);
    if (await exists(src)) {
      await fs.copyFile(src, dest);
    } else {
      const body = `${header(l.code)}<main class="placeholder">
        <h1>${l.title || l.label} practice exam</h1>
        <p>This practice exam has not been generated yet.</p>
        <p><a href="index.html">← back to home</a></p>
      </main>`;
      await fs.writeFile(dest, pageShell({
        title: `${l.label} — Professional practice exam (pending) · CCAR Training`,
        lang: l.code,
        baseHref: SITE_BASE_HREF,
        body,
      }));
    }
  }
}

async function copyCheatsheets() {
  const out = path.join(DOCS, 'cheatsheet');
  await ensureDir(out);
  for (const l of LANGS) {
    const src = path.join(ROOT, 'ccaf', 'dist', `cheatsheet_${l.contentCode || l.code}.html`);
    const dest = path.join(out, `${l.code}.html`);
    if (await exists(src)) {
      await fs.copyFile(src, dest);
    } else {
      const body = `${header(l.code)}<main class="placeholder">
        <h1>Cheatsheet — ${l.label}</h1>
        <p>This cheatsheet has not been generated yet.</p>
        <p><a href="index.html">← back to home</a></p>
      </main>`;
      await fs.writeFile(dest, pageShell({
        title: `${l.label} — Cheatsheet (pending) · CCAR Training`,
        lang: l.code,
        baseHref: SITE_BASE_HREF,
        body,
      }));
    }
  }
}

async function copyPdfs() {
  const src = path.join(ROOT, 'pdf');
  const dest = path.join(DOCS, 'pdf');
  if (!(await exists(src))) return;
  await ensureDir(dest);
  for (const f of await fs.readdir(src)) {
    if (f.endsWith('.pdf')) await fs.copyFile(path.join(src, f), path.join(dest, f));
  }
}

async function removeRetiredPublicLocales() {
  const retired = [
    'catalog.html',
    'guides/es.html', 'guides/pt.html',
    'guides/developer-en.html', 'guides/associate-en.html',
    'practical/es.html', 'practical/pt.html',
    'practical/bank-es.html', 'practical/bank-pt.html',
    'practical/developer-en.html', 'practical/bank-developer-en.html',
    'practical/associate-en.html', 'practical/bank-associate-en.html',
    'preflight/developer-foundations.html',
    'cheatsheet/es.html', 'cheatsheet/pt.html',
    'pdf/guide_es.pdf', 'pdf/guide_pt.pdf',
  ];
  await Promise.all(retired.map(rel => fs.rm(path.join(DOCS, rel), { force: true })));
}

async function writeIndex() {
  const blueprint = JSON.parse(await fs.readFile(path.join(ROOT, 'ccaf', 'data', 'blueprint.json'), 'utf8'));
  const professionalBlueprint = JSON.parse(await fs.readFile(path.join(ROOT, 'ccap', 'data', 'objectives.json'), 'utf8'));
  await fs.writeFile(path.join(DOCS, 'index.html'), pageShell({
    title: 'CCAR-F · Training',
    lang: 'en',
    baseHref: SITE_BASE_HREF,
    body: `${header('en', 'ru.html')}${trainingDashboard(blueprint, 'en')}`,
  }));
  await fs.writeFile(path.join(DOCS, 'ru.html'), pageShell({
    title: 'CCAR-F · Training · RU',
    lang: 'ru',
    baseHref: SITE_BASE_HREF,
    body: `${header('ru', 'index.html')}${trainingDashboard(blueprint, 'ru')}`,
  }));
  await fs.writeFile(path.join(DOCS, 'professional.html'), pageShell({
    title: 'CCAR-P · Training',
    lang: 'en',
    baseHref: SITE_BASE_HREF,
    body: `${header('en', 'professional-ru.html')}${professionalDashboard(professionalBlueprint, 'en')}`,
  }));
  await fs.writeFile(path.join(DOCS, 'professional-ru.html'), pageShell({
    title: 'CCAR-P · Training · RU',
    lang: 'ru',
    baseHref: SITE_BASE_HREF,
    body: `${header('ru', 'professional.html')}${professionalDashboard(professionalBlueprint, 'ru')}`,
  }));
  await fs.writeFile(path.join(DOCS, '.nojekyll'), '');
}

async function main() {
  await ensureDir(DOCS);
  const appSource = await fs.readFile(path.join(DOCS, 'app.js'));
  const appVersion = createHash('sha256').update(appSource).digest('hex').slice(0, 12);
  appHref = `app.js?v=${appVersion}`;
  await collectBankHrefs();
  await copyBrowserDependencies();
  await writeIndex();
  await buildGuides();
  await buildFoundationCases();
  await buildFoundationLabs();
  await buildProfessionalCapstone();
  await copyScoreReport();
  await copyPracticalTests();
  await copyProfessionalExams();
  await copyExamBanks();
  await copyCheatsheets();
  await buildPreflight();
  await copyPdfs();
  await removeRetiredPublicLocales();
  console.log('docs/ built');
}

main().catch(e => { console.error(e); process.exit(1); });
