(() => {
  const topbar = document.querySelector('.topbar');
  if (topbar && 'ResizeObserver' in window) {
    const setH = () => document.documentElement.style.setProperty('--topbar-h', `${topbar.offsetHeight}px`);
    setH();
    new ResizeObserver(setH).observe(topbar);
  }

  const themeToggle = document.getElementById('theme-toggle');
  const searchToggle = document.getElementById('search-toggle');
  const dialog = document.getElementById('search-dialog');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const status = document.getElementById('search-status');
  const filterButtons = document.querySelectorAll('.search-lang');

  // Theme toggle
  themeToggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  // Search
  let mini = null;
  let indexPromise = null;
  let searchLang = 'all';

  async function loadIndex() {
    if (mini) return mini;
    if (!indexPromise) {
      indexPromise = (async () => {
        const res = await fetch('search-index.json');
        if (!res.ok) throw new Error(`Search index request failed: ${res.status}`);
        // loadJSON takes the raw text: res.json() would parse the 531 KB index
        // only for it to be re-serialized and parsed a second time here.
        const raw = await res.text();
        if (!window.MiniSearch) throw new Error('Search library did not load');
        mini = window.MiniSearch.loadJSON(raw, {
          fields: ['heading', 'body'],
          storeFields: ['heading', 'lang', 'url'],
        });
        return mini;
      })().catch(error => {
        indexPromise = null;
        throw error;
      });
    }
    return indexPromise;
  }

  function runSearch() {
    if (!mini || !input) return;
    const q = input.value.trim();
    if (!q) {
      results.innerHTML = '';
      status.textContent = '';
      return;
    }
    let hits = mini.search(q, { prefix: true, fuzzy: 0.2 });
    if (searchLang !== 'all') hits = hits.filter(h => h.lang === searchLang);
    hits = hits.slice(0, 20);
    results.innerHTML = hits.map(h =>
      `<li><a href="${h.url}"><span class="lang-tag">${h.lang}</span>${h.heading}</a></li>`
    ).join('') || '<li style="padding:8px 16px;color:var(--muted)">No results</li>';
    status.textContent = hits.length === 1 ? '1 result' : `${hits.length} results`;
  }

  searchToggle?.addEventListener('click', async () => {
    dialog.showModal();
    input.focus();
    status.textContent = 'Loading search…';
    try {
      await loadIndex();
      status.textContent = '';
      runSearch();
    } catch (error) {
      results.innerHTML = '';
      status.textContent = 'Search could not be loaded. Try again.';
      console.error('Search failed to load', error);
    }
  });
  dialog?.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      searchLang = btn.dataset.lang;
      filterButtons.forEach(b => {
        const selected = b === btn;
        b.classList.toggle('active', selected);
        b.setAttribute('aria-pressed', String(selected));
      });
      runSearch();
    });
  });

  let timer;
  input?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(runSearch, 80);
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchToggle?.click(); }
    if (e.key === 'Escape' && dialog?.open) dialog.close();
  });

  // Guide TOC: open by default when it floats beside the prose (wide
  // viewports), collapsed inline otherwise; highlight the section in view.
  const toc = document.querySelector('.guide-toc');
  if (toc) {
    const wide = matchMedia('(min-width: 1160px)');
    const syncOpen = () => { toc.open = wide.matches; };
    syncOpen();
    wide.addEventListener('change', syncOpen);

    const links = new Map();
    toc.querySelectorAll('a[href*="#"]').forEach(a => {
      const id = decodeURIComponent(a.hash.slice(1));
      if (id) links.set(id, a);
    });
    const headings = [...links.keys()].map(id => document.getElementById(id)).filter(Boolean);
    let active = null;
    const setActive = id => {
      if (id === active) return;
      links.get(active)?.classList.remove('active');
      active = id;
      const link = links.get(id);
      link?.classList.add('active');
      if (link && toc.open) {
        // Keep the active row visible inside the outline without moving the
        // document. scrollIntoView() also scrolls ancestor containers, which
        // pulled phone layouts back to the inline outline immediately after a
        // fragment link had jumped to its heading.
        const nav = link.closest('nav');
        if (nav) {
          const row = link.getBoundingClientRect();
          const pane = nav.getBoundingClientRect();
          if (row.top < pane.top) nav.scrollTop -= pane.top - row.top;
          else if (row.bottom > pane.bottom) nav.scrollTop += row.bottom - pane.bottom;
        }
      }
    };
    // Measuring 267 headings on every scroll tick forced a full synchronous
    // layout each time. The heading offsets only move when the page reflows, so
    // they are cached and the hot path does a binary search over them — one
    // cheap scrollY read per frame and no layout at all.
    //
    // An IntersectionObserver was the other candidate and is wrong here: a
    // heading that crosses the line between two frames (an anchor jump, a
    // restored scroll position, a fast fling) is non-intersecting before and
    // after, so no entry is ever delivered for it and the TOC sticks.
    if (headings.length) {
      let offsets = [];
      let line = 80;
      const measure = () => {
        line = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 80) + 8;
        const top = scrollY;
        offsets = headings.map(h => h.getBoundingClientRect().top + top);
      };
      const update = () => {
        // The last heading at or above the line; index 0 before any has passed.
        const y = scrollY + line;
        let lo = 0;
        let hi = offsets.length - 1;
        let found = 0;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (offsets[mid] <= y) { found = mid; lo = mid + 1; } else hi = mid - 1;
        }
        setActive(headings[found].id);
      };
      let queued = false;
      const onScroll = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; update(); });
      };
      measure();
      update();
      addEventListener('scroll', onScroll, { passive: true });
      // Opening the inline outline on a phone moves the entire guide body even
      // though the body's own dimensions do not change, so ResizeObserver does
      // not report it. Refresh the cached document offsets after that shift.
      toc.addEventListener('toggle', () => {
        requestAnimationFrame(() => { measure(); update(); });
      });
      // Anything that reflows the prose moves the offsets: a resize, the web
      // fonts swapping in, a <details> in the guide opening. The observer fires
      // after layout, so re-measuring there costs nothing extra.
      if ('ResizeObserver' in window) {
        const body = document.querySelector('.guide-body') || document.body;
        let first = true;
        new ResizeObserver(() => {
          if (first) { first = false; return; }
          measure();
          update();
        }).observe(body);
      } else {
        addEventListener('resize', () => { measure(); update(); });
      }
    }
  }

  // Warm an exam's question bank before the click. The landing page and the
  // score report each link into three different exams, so a static prefetch
  // would pull megabytes for two banks the visitor will not open; hovering or
  // tab-focusing one link names which bank to fetch. The guide pages, which
  // have exactly one matching exam, carry a plain <link rel=prefetch> instead.
  const bankMap = (() => {
    try { return JSON.parse(document.getElementById('bank-map')?.textContent || '{}'); }
    catch { return {}; }
  })();
  const warmed = new Set();
  const warmBank = e => {
    const a = e.target.closest?.('a[href]');
    if (!a) return;
    // Match on the shell's own key space (base-relative "practical/en.html"),
    // which is how the map is written.
    const href = a.getAttribute('href')?.split(/[?#]/)[0];
    const bank = href && bankMap[href];
    if (!bank || warmed.has(bank)) return;
    warmed.add(bank);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'fetch';
    // No crossorigin: the engine's fetch() is same-origin with credentials, and
    // an anonymous prefetch would sit under a different cache key and be redone.
    link.href = bank;
    document.head.appendChild(link);
  };
  if (Object.keys(bankMap).length) {
    document.addEventListener('pointerenter', warmBank, { capture: true, passive: true });
    document.addEventListener('focusin', warmBank, { passive: true });
  }


  // Foundations dashboard: summarize the practice engine's durable browser state
  // without duplicating scoring logic. The exam page remains the source of truth;
  // this view only answers "where was I?" and "what should I open?".
  const trainingDashboard = document.querySelector('[data-training-dashboard]');
  if (trainingDashboard) {
    const ru = trainingDashboard.dataset.trainingLang === 'ru';
    const practiceHref = ru ? 'practical/ru.html' : 'practical/en.html';
    const guideHref = ru ? 'guides/ru.html' : 'guides/en.html';
    const labsHref = ru ? 'labs/foundation-ru.html' : 'labs/foundation-en.html';
    const readinessAHref = ru ? 'practical/readiness-a-ru.html' : 'practical/readiness-a-en.html';
    const readinessBHref = ru ? 'practical/readiness-b-ru.html' : 'practical/readiness-b-en.html';
    const readinessCHref = ru ? 'practical/readiness-c-ru.html' : 'practical/readiness-c-en.html';
    const professionalHref = ru ? 'guides/professional-ru.html' : 'guides/professional-en.html';
    const readJson = key => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };

    // EN and RU are interface variants over the same English exam content,
    // so progress and weak spots intentionally share one persistence namespace.
    const attempt = readJson('ccaf-exam-en');
    const missRecord = readJson('ccaf-exam-en:misses');
    const missItems = missRecord && (missRecord.v === 1 || missRecord.v === 2) &&
      missRecord.items && typeof missRecord.items === 'object' ? missRecord.items : {};
    const now = Date.now();
    const missCount = Object.values(missItems).filter(item => {
      if (!item || Number(item.n) <= 0) return false;
      if (missRecord && missRecord.v === 1) return true;
      return !item.mastered && (Number(item.due) || 0) <= now;
    }).length;

    const misses = document.getElementById('training-misses');
    if (misses) misses.textContent = String(missCount);
    const missesLink = document.getElementById('training-misses-link');
    const missesCopy = document.getElementById('training-misses-copy');
    if (missesLink) {
      missesLink.setAttribute('aria-disabled', String(missCount === 0));
      missesLink.classList.toggle('disabled', missCount === 0);
      if (missCount === 0) missesLink.addEventListener('click', e => e.preventDefault());
    }
    if (missesCopy) {
      missesCopy.textContent = missCount
        ? (ru
          ? `Сейчас к интервальному повторению: ${missCount}.`
          : `${missCount} spaced review${missCount === 1 ? '' : 's'} due now.`)
        : (ru ? 'Сейчас повторений нет.' : 'No spaced reviews due now.');
    }

    const masteryState = readJson('ccaf-exam-en:mastery');
    const masteryItems = masteryState && masteryState.v === 1 &&
      masteryState.items && typeof masteryState.items === 'object' ? masteryState.items : {};
    const masteredItems = Object.values(masteryItems).filter(item => item && item.mastered);
    const masteredCount = masteredItems.length;
    const masteredEl = document.getElementById('training-mastered');
    if (masteredEl) masteredEl.textContent = `${masteredCount} / 30`;

    const domainTotals = [7, 5, 6, 6, 6];
    const domainMastered = [0, 0, 0, 0, 0];
    const domainAttempts = [0, 0, 0, 0, 0];
    Object.values(masteryItems).forEach(item => {
      if (!item) return;
      const index = Number(item.domain) - 1;
      if (index < 0 || index >= domainTotals.length) return;
      if (item.mastered) domainMastered[index] += 1;
      domainAttempts[index] += Number(item.attempts || 0);
    });

    for (let domain = 1; domain <= 5; domain += 1) {
      const el = document.getElementById(`training-domain-mastered-${domain}`);
      if (el) {
        const count = domainMastered[domain - 1];
        const total = domainTotals[domain - 1];
        el.textContent = ru ? `${count} / ${total} освоено` : `${count} / ${total} mastered`;
      }
    }

    document.querySelectorAll('[data-objective-key]').forEach(row => {
      const item = masteryItems[row.dataset.objectiveKey];
      const status = row.querySelector('.objective-status');
      row.classList.remove('is-new', 'is-learning', 'is-mastered');
      if (item && item.mastered) {
        row.classList.add('is-mastered');
        if (status) status.textContent = ru ? 'освоено' : 'mastered';
        return;
      }
      if (item && Number(item.attempts || 0) > 0) {
        row.classList.add('is-learning');
        const attempts = Number(item.attempts || 0);
        const correct = Number(item.correct || 0);
        if (status) status.textContent = ru
          ? `в работе · ${correct}/${attempts}`
          : `learning · ${correct}/${attempts}`;
        return;
      }
      row.classList.add('is-new');
      if (status) status.textContent = ru ? 'не начато' : 'not started';
    });

    const masteryPct = Math.round(masteredCount / 30 * 100);
    const masteryFill = document.getElementById('training-progress-fill');
    if (masteryFill) masteryFill.style.width = `${masteryPct}%`;

    const caseState = readJson('ccaf-cases:state');
    const caseDone = caseState && caseState.done && typeof caseState.done === 'object'
      ? Object.values(caseState.done).filter(Boolean).length : 0;
    const casesCopy = document.getElementById('training-cases-copy');
    if (casesCopy) casesCopy.textContent = `${caseDone} / 6`;
    const casesStat = document.getElementById('training-cases-stat');
    if (casesStat) casesStat.textContent = `${caseDone} / 6`;

    const labState = readJson('ccaf-labs:state');
    const labDone = labState && labState.done && typeof labState.done === 'object'
      ? Object.values(labState.done).filter(Boolean).length : 0;
    const labsCopy = document.getElementById('training-labs-copy');
    if (labsCopy) labsCopy.textContent = `${labDone} / 4`;
    const labsStat = document.getElementById('training-labs-stat');
    if (labsStat) labsStat.textContent = `${labDone} / 4`;

    const preflight = readJson('ccaf-preflight:state');
    const checked = Array.isArray(preflight && preflight.checked) ? new Set(preflight.checked).size : 0;
    const evidenceCopy = document.getElementById('training-evidence-copy');
    if (evidenceCopy) evidenceCopy.textContent = `${checked} / 10`;

    const readinessAResult = readJson('ccaf-readiness-a-en:result');
    const readinessBResult = readJson('ccaf-readiness-b-en:result');
    const readinessCResult = readJson('ccaf-readiness-c-en:result');
    const readinessResults = [
      ['A', readinessAResult, readinessAHref],
      ['B', readinessBResult, readinessBHref],
      ['C', readinessCResult, readinessCHref],
    ];
    const passedReadiness = readinessResults.find(([, value]) => value && value.passed);
    const readinessPassed = Boolean(passedReadiness);
    const latestReadinessEntry = [...readinessResults].reverse().find(([, value]) => value);
    const latestReadiness = latestReadinessEntry ? latestReadinessEntry[1] : null;
    const nextUnusedReadiness = readinessResults.find(([, value]) => !value);
    const readinessCopy = document.getElementById('training-readiness-copy');
    if (readinessCopy) {
      if (!latestReadinessEntry) readinessCopy.textContent = ru ? 'не пройдено' : 'not taken';
      else {
        const [form, value] = latestReadinessEntry;
        readinessCopy.textContent = `Form ${form} · ${value.score} / 1000`;
      }
    }
    const readinessLink = document.getElementById('training-readiness-link');
    if (readinessLink) {
      readinessLink.href = readinessPassed
        ? (passedReadiness ? passedReadiness[2] : readinessAHref)
        : (nextUnusedReadiness ? nextUnusedReadiness[2] : readinessCHref);
    }

    const nextTitle = document.getElementById('training-next-title');
    const nextCopy = document.getElementById('training-next-copy');
    const primary = document.getElementById('training-primary');
    const setNext = (title, copy, href, action) => {
      if (nextTitle) nextTitle.textContent = title;
      if (nextCopy) nextCopy.textContent = copy;
      if (primary) {
        primary.href = href;
        primary.textContent = action;
      }
    };

    const weakestDomainIndex = domainTotals
      .map((total, index) => ({
        index,
        mastered: domainMastered[index],
        total,
        attempts: domainAttempts[index],
        ratio: domainMastered[index] / total,
      }))
      .filter(item => item.mastered < item.total)
      .sort((a, b) => a.ratio - b.ratio || b.attempts - a.attempts || a.index - b.index)[0];

    const latestFailedReadiness = [...readinessResults].reverse()
      .find(([, value]) => value && !value.passed);
    const failedAt = latestFailedReadiness && latestFailedReadiness[1].completedAt
      ? Date.parse(latestFailedReadiness[1].completedAt) : 0;
    const remediationAfterFailure = failedAt > 0 && Object.values(masteryItems)
      .some(item => item && Number(item.t || 0) > failedAt);
    const failedDomains = latestFailedReadiness && latestFailedReadiness[1].domains
      ? Object.entries(latestFailedReadiness[1].domains)
          .sort((a, b) => Number(a[1].pct || 0) - Number(b[1].pct || 0))
      : [];
    const readinessWeakDomain = failedDomains.length ? failedDomains[0][0] : null;

    if (missCount > 0) {
      setNext(
        ru ? 'Интервальное повторение' : 'Spaced review',
        ru
          ? `Сейчас к повторению ${missCount} вопрос(ов). Сначала восстановите ответ из памяти, затем сравните rationale.`
          : `${missCount} review item${missCount === 1 ? '' : 's'} are due. Retrieve first, then compare the rationale.`,
        `${practiceHref}?mode=study&focus=misses`,
        ru ? 'Повторить' : 'Review',
      );
    } else if (!Object.keys(masteryItems).length) {
      setNext(
        ru ? 'Диагностика' : 'Diagnostic',
        ru
          ? '20 смешанных вопросов без подсказок. Результат нужен только для выбора материала, не как оценка готовности.'
          : '20 mixed questions with no answer reveal. Use the result only to choose material, not as a readiness score.',
        `${practiceHref}?mode=exam&length=quick`,
        ru ? 'Начать' : 'Start',
      );
    } else if (weakestDomainIndex) {
      const domain = weakestDomainIndex.index + 1;
      setNext(
        ru ? `Домен ${domain}: материал → практика` : `Domain ${domain}: material → practice`,
        ru
          ? `Освоено ${weakestDomainIndex.mastered} из ${weakestDomainIndex.total} task statements. Сначала закройте decision rules в материале, затем делайте retrieval drill.`
          : `${weakestDomainIndex.mastered} of ${weakestDomainIndex.total} task statements mastered. Close the decision-rule gaps in the material, then run a retrieval drill.`,
        `${guideHref}#domain-${domain}-material`,
        ru ? 'Материал' : 'Material',
      );
    } else if (caseDone < 6) {
      setNext(
        'Scenario transfer',
        ru
          ? `Завершено ${caseDone} из 6 официальных scenario families. Сначала сформулируйте решение, затем откройте rubric.`
          : `${caseDone} of 6 official scenario families complete. Write the decision first, then open the rubric.`,
        ru ? 'cases/foundation-ru.html' : 'cases/foundation-en.html',
        ru ? 'Кейсы' : 'Cases',
      );
    } else if (labDone < 4) {
      setNext(
        'Hands-on labs',
        ru
          ? `Выполнено ${labDone} из 4. Лабораторная засчитывается только после проверки deliverable по acceptance criteria.`
          : `${labDone} of 4 complete. A lab counts only after the deliverable is checked against its acceptance criteria.`,
        labsHref,
        ru ? 'Продолжить' : 'Continue',
      );
    } else if (!readinessAResult) {
      setNext(
        'Held-out readiness · A',
        ru
          ? '60 ранее не показанных вопросов. Exam-only: ответы откроются только после завершения.'
          : '60 unseen questions. Exam-only: answers reveal only after completion.',
        readinessAHref,
        ru ? 'Начать' : 'Start',
      );
    } else if (!readinessPassed && latestFailedReadiness && !remediationAfterFailure) {
      const form = latestFailedReadiness[0];
      const domain = readinessWeakDomain || '1';
      const pct = latestFailedReadiness[1].domains?.[domain]?.pct;
      setNext(
        ru ? `Remediation после Form ${form}` : `Remediate after Form ${form}`,
        ru
          ? `Худший домен: D${domain}${Number.isFinite(pct) ? ` · ${pct}%` : ''}. Сначала решите новые training-задачи и обновите mastery; следующая скрытая форма пока не расходуется.`
          : `Weakest domain: D${domain}${Number.isFinite(pct) ? ` · ${pct}%` : ''}. Solve new training items and update mastery before consuming the next unseen form.`,
        `${guideHref}#domain-${domain}-material`,
        ru ? 'Материал' : 'Material',
      );
    } else if (!readinessPassed && nextUnusedReadiness) {
      const [form, , href] = nextUnusedReadiness;
      setNext(
        `Held-out readiness · ${form}`,
        ru
          ? 'После remediation используйте следующую ранее не показанную форму.'
          : 'After remediation, use the next previously unseen form.',
        href,
        ru ? 'Проверить' : 'Check',
      );
    } else if (!readinessPassed) {
      setNext(
        ru ? 'Продолжить remediation' : 'Continue remediation',
        ru
          ? 'Все подготовленные held-out формы использованы без проходного результата. Продолжайте training/labs; для новой независимой проверки нужен новый form.'
          : 'All prepared held-out forms were used without a passing result. Continue training/labs; a new independent check requires a new form.',
        `${practiceHref}?mode=study&length=quick`,
        ru ? 'Практика' : 'Practice',
      );
    } else if (checked < 10) {
      setNext(
        ru ? 'Подтвердить readiness evidence' : 'Complete readiness evidence',
        ru
          ? `Held-out пройден. Осталось подтвердить практические критерии: ${checked} / 10.`
          : `Held-out check passed. Complete the practical evidence: ${checked} / 10.`,
        'preflight/architect-foundations.html',
        ru ? 'Завершить' : 'Complete',
      );
    } else {
      setNext(
        'CCAR-P · Professional',
        ru
          ? 'Foundation mastery, labs, held-out readiness и evidence подтверждены.'
          : 'Foundation mastery, labs, held-out readiness, and evidence are complete.',
        professionalHref,
        ru ? 'Открыть' : 'Open',
      );
    }

    const professionalReady = checked === 10 && caseDone === 6 && labDone === 4 && masteredCount === 30 && readinessPassed;
    const professionalStatus = document.getElementById('professional-stage-status');
    if (professionalStatus) {
      professionalStatus.textContent = professionalReady
        ? (ru ? 'Foundation gate завершён.' : 'Foundation gate complete.')
        : (ru
          ? `Нужно mastery 30 / 30, cases 6 / 6, labs 4 / 4, held-out ≥720 и evidence 10 / 10. Сейчас: ${masteredCount} / 30, ${caseDone} / 6, ${labDone} / 4, ${readinessPassed ? 'held-out PASS' : 'held-out —'}, ${checked} / 10.`
          : `Requires mastery 30 / 30, cases 6 / 6, labs 4 / 4, held-out ≥720, and evidence 10 / 10. Current: ${masteredCount} / 30, ${caseDone} / 6, ${labDone} / 4, ${readinessPassed ? 'held-out PASS' : 'held-out —'}, ${checked} / 10.`);
    }
    for (const id of ['professional-workspace-link']) {
      const link = document.getElementById(id);
      if (!link) continue;
      link.classList.toggle('disabled', !professionalReady);
      link.setAttribute('aria-disabled', String(!professionalReady));
      if (!professionalReady) link.addEventListener('click', e => e.preventDefault());
    }

    const order = Array.isArray(attempt && attempt.order) ? attempt.order : [];
    if (order.length) {
      const answers = attempt.answers && typeof attempt.answers === 'object' ? attempt.answers : {};
      const answered = order.filter(id => {
        const answer = answers[id];
        return Array.isArray(answer) ? answer.length > 0 : (typeof answer === 'string' && answer.length > 0);
      }).length;
      const detail = document.getElementById('training-progress-detail');
      if (answered < order.length) {
        const scope = attempt.focus && attempt.focus !== 'all'
          ? (attempt.focus === 'misses'
            ? (ru ? 'Интервальное повторение' : 'Spaced review')
            : attempt.focus === 'report'
              ? (ru ? 'Целевая практика' : 'Targeted practice')
              : (ru ? `Домен ${attempt.focus}` : `Domain ${attempt.focus}`))
          : (attempt.length === 'quick'
            ? (ru ? 'Короткая попытка' : 'Quick set')
            : (ru ? 'Полная попытка' : 'Full set'));
        if (detail) detail.textContent = ru
          ? `Активно: ${scope} · ${answered} / ${order.length} отвечено.`
          : `Active: ${scope} · ${answered} / ${order.length} answered.`;
        setNext(
          ru ? 'Продолжить попытку' : 'Resume attempt',
          ru
            ? `Вы уже ответили на ${answered} из ${order.length}. Не начинайте новый сет поверх незавершённого.`
            : `You already answered ${answered} of ${order.length}. Finish the current retrieval set before starting another.`,
          practiceHref,
          ru ? 'Продолжить' : 'Resume',
        );
      } else if (detail) {
        detail.textContent = ru
          ? `Последняя попытка завершена · mastery ${masteredCount} / 30.`
          : `Last attempt complete · mastery ${masteredCount} / 30.`;
      }
    }
  }



  // Professional workspace: the same task-first mechanics as Foundation, but
  // against the seven-domain / 38-objective Professional blueprint.
  const professionalDashboard = document.querySelector('[data-prof-training-dashboard]');
  if (professionalDashboard) {
    const ru = professionalDashboard.dataset.trainingLang === 'ru';
    const practiceHref = ru ? 'practical/professional-ru.html' : 'practical/professional-en.html';
    const guideHref = ru ? 'guides/professional-ru.html' : 'guides/professional-en.html';
    const capstoneHref = ru ? 'professional/capstone-ru.html' : 'professional/capstone-en.html';
    const readinessAHref = ru ? 'practical/readiness-a-professional-ru.html' : 'practical/readiness-a-professional-en.html';
    const readinessBHref = ru ? 'practical/readiness-b-professional-ru.html' : 'practical/readiness-b-professional-en.html';
    const readJson = key => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };

    const attempt = readJson('ccarp-exam-en');
    const missRecord = readJson('ccarp-exam-en:misses');
    const missItems = missRecord && (missRecord.v === 1 || missRecord.v === 2) &&
      missRecord.items && typeof missRecord.items === 'object' ? missRecord.items : {};
    const now = Date.now();
    const missCount = Object.values(missItems).filter(item => {
      if (!item || Number(item.n) <= 0) return false;
      if (missRecord && missRecord.v === 1) return true;
      return !item.mastered && (Number(item.due) || 0) <= now;
    }).length;
    const misses = document.getElementById('professional-misses');
    if (misses) misses.textContent = String(missCount);
    const missesCopy = document.getElementById('professional-misses-copy');
    if (missesCopy) missesCopy.textContent = missCount
      ? (ru ? `Сейчас к повторению: ${missCount}.` : `${missCount} spaced review${missCount === 1 ? '' : 's'} due now.`)
      : (ru ? 'Сейчас повторений нет.' : 'No spaced reviews due now.');

    const masteryState = readJson('ccarp-exam-en:mastery');
    const masteryItems = masteryState && masteryState.v === 1 &&
      masteryState.items && typeof masteryState.items === 'object' ? masteryState.items : {};
    const masteredItems = Object.values(masteryItems).filter(item => item && item.mastered);
    const masteredCount = masteredItems.length;
    const masteredEl = document.getElementById('professional-mastered');
    if (masteredEl) masteredEl.textContent = `${masteredCount} / 38`;

    const domainTotals = [6, 5, 8, 6, 5, 5, 3];
    const domainMastered = [0, 0, 0, 0, 0, 0, 0];
    const domainAttempts = [0, 0, 0, 0, 0, 0, 0];
    Object.values(masteryItems).forEach(item => {
      if (!item) return;
      const index = Number(item.domain) - 1;
      if (index < 0 || index >= domainTotals.length) return;
      if (item.mastered) domainMastered[index] += 1;
      domainAttempts[index] += Number(item.attempts || 0);
    });

    for (let domain = 1; domain <= 7; domain += 1) {
      const el = document.getElementById(`professional-domain-mastered-${domain}`);
      if (!el) continue;
      el.textContent = ru
        ? `${domainMastered[domain - 1]} / ${domainTotals[domain - 1]} освоено`
        : `${domainMastered[domain - 1]} / ${domainTotals[domain - 1]} mastered`;
    }

    document.querySelectorAll('[data-prof-objective-key]').forEach(row => {
      const item = masteryItems[row.dataset.profObjectiveKey];
      const status = row.querySelector('.objective-status');
      row.classList.remove('is-new', 'is-learning', 'is-mastered');
      if (item && item.mastered) {
        row.classList.add('is-mastered');
        if (status) status.textContent = ru ? 'освоено' : 'mastered';
      } else if (item && Number(item.attempts || 0) > 0) {
        row.classList.add('is-learning');
        const attempts = Number(item.attempts || 0);
        const correct = Number(item.correct || 0);
        if (status) status.textContent = ru
          ? `в работе · ${correct}/${attempts}`
          : `learning · ${correct}/${attempts}`;
      } else {
        row.classList.add('is-new');
        if (status) status.textContent = ru ? 'не начато' : 'not started';
      }
    });
    const fill = document.getElementById('professional-progress-fill');
    if (fill) fill.style.width = `${Math.round(masteredCount / 38 * 100)}%`;

    const capstoneState = readJson('ccarp-capstone:state');
    const capstoneEvidenced = capstoneState && capstoneState.evidenced &&
      typeof capstoneState.evidenced === 'object'
      ? Object.values(capstoneState.evidenced).filter(Boolean).length : 0;
    const capstoneStat = document.getElementById('professional-capstone-stat');
    if (capstoneStat) capstoneStat.textContent = `${capstoneEvidenced} / 14`;
    const capstoneCopy = document.getElementById('professional-capstone-copy');
    if (capstoneCopy) capstoneCopy.textContent = `${capstoneEvidenced} / 14`;

    const readinessAResult = readJson('ccarp-readiness-a-en:result');
    const readinessBResult = readJson('ccarp-readiness-b-en:result');
    const readinessPassed = Boolean(
      (readinessAResult && readinessAResult.passed) ||
      (readinessBResult && readinessBResult.passed)
    );
    const readinessCopy = document.getElementById('professional-readiness-copy');
    if (readinessCopy) {
      const fmt = result => result ? `${result.score} / 1000` : '—';
      readinessCopy.textContent = `A ${fmt(readinessAResult)} · B ${fmt(readinessBResult)}`;
    }

    const evidence = readJson('ccarp-preflight:state');
    const evidenceCount = Array.isArray(evidence && evidence.checked)
      ? new Set(evidence.checked).size : 0;
    const evidenceCopy = document.getElementById('professional-evidence-copy');
    if (evidenceCopy) evidenceCopy.textContent = `${evidenceCount} / 10`;

    const weakestDomain = domainTotals
      .map((total, index) => ({
        index,
        mastered: domainMastered[index],
        total,
        attempts: domainAttempts[index],
        ratio: domainMastered[index] / total,
      }))
      .filter(item => item.mastered < item.total)
      .sort((a, b) => a.ratio - b.ratio || b.attempts - a.attempts || a.index - b.index)[0];

    const nextTitle = document.getElementById('professional-next-title');
    const nextCopy = document.getElementById('professional-next-copy');
    const primary = document.getElementById('professional-primary');
    const setNext = (title, copy, href, action) => {
      if (nextTitle) nextTitle.textContent = title;
      if (nextCopy) nextCopy.textContent = copy;
      if (primary) {
        primary.href = href;
        primary.textContent = action;
      }
    };

    if (missCount > 0) {
      setNext(
        ru ? 'Интервальное повторение' : 'Spaced review',
        ru
          ? `Сейчас к повторению ${missCount} вопрос(ов). Сначала восстановите решение, затем сравните rationale.`
          : `${missCount} review item${missCount === 1 ? '' : 's'} are due. Retrieve the decision first, then compare the rationale.`,
        `${practiceHref}?mode=study&focus=misses`,
        ru ? 'Повторить' : 'Review',
      );
    } else if (!Object.keys(masteryItems).length) {
      setNext(
        'Diagnostic',
        ru
          ? 'Короткая смешанная попытка без подсказок. Результат нужен для маршрутизации, а не как readiness score.'
          : 'Short mixed no-reveal attempt. Use it to route study, not as a readiness score.',
        `${practiceHref}?mode=exam&length=quick`,
        ru ? 'Начать' : 'Start',
      );
    } else if (weakestDomain) {
      const domain = weakestDomain.index + 1;
      setNext(
        ru ? `D${domain}: материал → retrieval` : `D${domain}: material → retrieval`,
        ru
          ? `Освоено ${weakestDomain.mastered} из ${weakestDomain.total} objectives. Закройте decision rules и решите новые сценарные задачи.`
          : `${weakestDomain.mastered} of ${weakestDomain.total} objectives mastered. Close the decision-rule gaps, then solve new scenario tasks.`,
        `${guideHref}#domain-${domain}-material`,
        ru ? 'Материал' : 'Material',
      );
    } else if (capstoneEvidenced < 14) {
      setNext(
        'Professional capstone',
        ru
          ? `Подтверждено ${capstoneEvidenced} из 14 artifacts/stress tests. Продолжайте одну end-to-end архитектуру.`
          : `${capstoneEvidenced} of 14 artifacts/stress tests evidenced. Continue the same end-to-end architecture.`,
        capstoneHref,
        ru ? 'Продолжить' : 'Continue',
      );
    } else if (!readinessAResult) {
      setNext(
        'Held-out readiness A',
        ru
          ? 'Первая независимая форма: 63 ранее не показанных вопроса. Ответы откроются только после завершения.'
          : 'First independent form: 63 previously unseen questions. Answers reveal only after completion.',
        readinessAHref,
        ru ? 'Проверить' : 'Check',
      );
    } else if (!readinessAResult.passed && !readinessBResult) {
      setNext(
        'Held-out readiness B',
        ru
          ? 'После remediation используйте вторую непересекающуюся форму. Вопросы из A больше не используются как readiness evidence.'
          : 'After remediation, use the second non-overlapping form. Form A is now exposed and no longer counts as unseen evidence.',
        readinessBHref,
        ru ? 'Проверить' : 'Check',
      );
    } else if (!readinessPassed) {
      const latest = readinessBResult || readinessAResult;
      const domains = (latest && latest.domains) || {};
      const weakest = Object.entries(domains)
        .sort((a, b) => Number(a[1].pct || 0) - Number(b[1].pct || 0))[0];
      const domain = weakest ? weakest[0] : '1';
      const pct = weakest ? weakest[1].pct : null;
      setNext(
        ru ? 'Дополнительная remediation' : 'Further remediation',
        ru
          ? `Обе независимые формы использованы. Слабейший домен: D${domain}${Number.isFinite(pct) ? ` · ${pct}%` : ''}. Возвращайтесь к новым training-задачам; held-out формы не переиспользуются.`
          : `Both independent forms are now exposed. Weakest domain: D${domain}${Number.isFinite(pct) ? ` · ${pct}%` : ''}. Return to new training items; held-out forms are not recycled.`,
        `${guideHref}#domain-${domain}-material`,
        ru ? 'Материал' : 'Material',
      );
    } else if (evidenceCount < 10) {
      setNext(
        ru ? 'Подтвердить readiness evidence' : 'Complete readiness evidence',
        ru
          ? `Held-out пройден. Осталось подтвердить практические критерии: ${evidenceCount} / 10.`
          : `Held-out passed. Complete the practical evidence: ${evidenceCount} / 10.`,
        'preflight/architect-professional.html',
        ru ? 'Завершить' : 'Complete',
      );
    } else {
      setNext(
        ru ? 'Готовность подтверждена' : 'Readiness demonstrated',
        ru
          ? '38/38 mastery, capstone 14/14, held-out pass и evidence 10/10.'
          : '38/38 mastery, capstone 14/14, held-out pass, and evidence 10/10.',
        (readinessBResult && readinessBResult.passed) ? readinessBHref : readinessAHref,
        ru ? 'Результат' : 'Result',
      );
    }

    const ready = masteredCount === 38 && capstoneEvidenced === 14 &&
      readinessPassed && evidenceCount === 10;
    const readyStatus = document.getElementById('professional-ready-status');
    const readyDetail = document.getElementById('professional-ready-detail');
    if (readyStatus) readyStatus.textContent = ready
      ? (ru ? 'Подтверждена' : 'Demonstrated')
      : (ru ? 'Не подтверждена' : 'Not demonstrated');
    if (readyDetail) readyDetail.textContent = ready
      ? (ru ? 'Все четыре независимых сигнала закрыты.' : 'All four independent evidence signals are complete.')
      : (ru
        ? `Mastery ${masteredCount}/38 · capstone ${capstoneEvidenced}/14 · held-out ${readinessPassed ? 'PASS' : '—'} · evidence ${evidenceCount}/10`
        : `Mastery ${masteredCount}/38 · capstone ${capstoneEvidenced}/14 · held-out ${readinessPassed ? 'PASS' : '—'} · evidence ${evidenceCount}/10`);

    const order = Array.isArray(attempt && attempt.order) ? attempt.order : [];
    if (order.length) {
      const answers = attempt.answers && typeof attempt.answers === 'object' ? attempt.answers : {};
      const answered = order.filter(id => {
        const answer = answers[id];
        return Array.isArray(answer) ? answer.length > 0 : (typeof answer === 'string' && answer.length > 0);
      }).length;
      const detail = document.getElementById('professional-progress-detail');
      if (answered < order.length) {
        if (detail) detail.textContent = ru
          ? `Активная попытка · ${answered} / ${order.length} отвечено.`
          : `Active attempt · ${answered} / ${order.length} answered.`;
        setNext(
          ru ? 'Продолжить попытку' : 'Resume attempt',
          ru
            ? `Не начинайте новый сет поверх незавершённого: ${answered} / ${order.length}.`
            : `Finish the current set before starting another: ${answered} / ${order.length}.`,
          practiceHref,
          ru ? 'Продолжить' : 'Resume',
        );
      } else if (detail) {
        detail.textContent = ru
          ? `Последняя попытка завершена · mastery ${masteredCount} / 38.`
          : `Last attempt complete · mastery ${masteredCount} / 38.`;
      }
    }
  }


  // Foundation hands-on labs: completion means the learner checked the
  // deliverable against every acceptance criterion, not merely opened the page.
  const labsPage = document.querySelector('[data-labs]');
  const LABS_KEY = 'ccaf-labs:state';
  const readLabState = () => {
    try {
      const raw = localStorage.getItem(LABS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && parsed.v === 1 && parsed.done && typeof parsed.done === 'object'
        ? parsed.done : {};
    } catch {
      return {};
    }
  };
  const writeLabState = done => {
    try {
      localStorage.setItem(LABS_KEY, JSON.stringify({ v: 1, done, updatedAt: Date.now() }));
    } catch {
      // Progress persistence is optional; the page remains usable without it.
    }
  };
  if (labsPage) {
    const done = readLabState();
    const boxes = [...labsPage.querySelectorAll('[data-lab-id]')];
    const progress = document.getElementById('labs-progress');
    const render = () => {
      const count = boxes.filter(box => box.checked).length;
      if (progress) progress.textContent = `${count} / ${boxes.length}`;
    };
    boxes.forEach(box => {
      box.checked = Boolean(done[box.dataset.labId]);
      box.addEventListener('change', () => {
        done[box.dataset.labId] = box.checked;
        writeLabState(done);
        render();
      });
    });
    render();
  }


  // Foundation scenario transfer: a case counts only after the learner wrote a
  // substantive response for every prompt and opened each rubric afterward.
  const casesPage = document.querySelector('[data-cases]');
  const CASES_KEY = 'ccaf-cases:state';
  const readCaseState = () => {
    try {
      const raw = localStorage.getItem(CASES_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && parsed.v === 1
        ? {
            answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
            reviewed: parsed.reviewed && typeof parsed.reviewed === 'object' ? parsed.reviewed : {},
            done: parsed.done && typeof parsed.done === 'object' ? parsed.done : {},
          }
        : { answers: {}, reviewed: {}, done: {} };
    } catch {
      return { answers: {}, reviewed: {}, done: {} };
    }
  };
  const writeCaseState = state => {
    try {
      localStorage.setItem(CASES_KEY, JSON.stringify({ v: 1, ...state, updatedAt: Date.now() }));
    } catch {
      // The exercises remain usable without persistence.
    }
  };
  if (casesPage) {
    const state = readCaseState();
    const cards = [...casesPage.querySelectorAll('[data-scenario-id]')];
    const progress = document.getElementById('cases-progress');

    const renderCase = card => {
      const scenario = card.dataset.scenarioId;
      const prompts = [...card.querySelectorAll('[data-case-prompt]')];
      const complete = card.querySelector('[data-case-id]');
      const ready = prompts.every(prompt => {
        const id = prompt.dataset.casePrompt;
        const answer = String(state.answers[id] || '').trim();
        return answer.length >= 40 && Boolean(state.reviewed[id]);
      });
      complete.disabled = !ready;
      complete.checked = Boolean(state.done[scenario]) && ready;
      if (!ready && state.done[scenario]) {
        delete state.done[scenario];
        writeCaseState(state);
      }
    };

    const renderProgress = () => {
      const count = cards.filter(card => {
        const box = card.querySelector('[data-case-id]');
        return box && box.checked;
      }).length;
      if (progress) progress.textContent = `${count} / ${cards.length}`;
    };

    cards.forEach(card => {
      card.querySelectorAll('[data-case-answer]').forEach(field => {
        const id = field.dataset.caseAnswer;
        field.value = state.answers[id] || '';
        field.addEventListener('input', () => {
          state.answers[id] = field.value;
          writeCaseState(state);
          renderCase(card);
          renderProgress();
        });
      });
      card.querySelectorAll('[data-case-rubric]').forEach(details => {
        const id = details.dataset.caseRubric;
        details.addEventListener('toggle', () => {
          if (details.open) state.reviewed[id] = true;
          writeCaseState(state);
          renderCase(card);
          renderProgress();
        });
      });
      const box = card.querySelector('[data-case-id]');
      if (box) {
        box.addEventListener('change', () => {
          state.done[box.dataset.caseId] = box.checked;
          writeCaseState(state);
          renderProgress();
        });
      }
      renderCase(card);
    });
    renderProgress();
  }


  // Professional capstone: progress is evidence-based. Artifacts require a
  // substantive written note plus rubric review; injected failures require a
  // substantive diagnostic response. No AI judge assigns correctness.
  const capstonePage = document.querySelector('[data-capstone]');
  const CAPSTONE_KEY = 'ccarp-capstone:state';
  const readCapstoneState = () => {
    try {
      const raw = localStorage.getItem(CAPSTONE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && parsed.v === 1
        ? {
            answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
            reviewed: parsed.reviewed && typeof parsed.reviewed === 'object' ? parsed.reviewed : {},
            evidenced: parsed.evidenced && typeof parsed.evidenced === 'object' ? parsed.evidenced : {},
          }
        : { answers: {}, reviewed: {}, evidenced: {} };
    } catch {
      return { answers: {}, reviewed: {}, evidenced: {} };
    }
  };
  const writeCapstoneState = state => {
    try {
      localStorage.setItem(CAPSTONE_KEY, JSON.stringify({ v: 1, ...state, updatedAt: Date.now() }));
    } catch {
      // The capstone remains usable without persistence.
    }
  };
  if (capstonePage) {
    const state = readCapstoneState();
    const items = [...capstonePage.querySelectorAll('[data-capstone-item]')];
    const progress = document.getElementById('capstone-progress');

    const renderItem = item => {
      const id = item.dataset.capstoneItem;
      const kind = item.dataset.capstoneKind;
      const answer = String(state.answers[id] || '').trim();
      const ready = answer.length >= 80 && (kind === 'stress' || Boolean(state.reviewed[id]));
      state.evidenced[id] = ready;
      item.classList.toggle('is-evidenced', ready);
      const label = item.querySelector(`[data-capstone-state="${id}"]`);
      if (label) label.textContent = ready
        ? (capstonePage.dataset.trainingLang === 'ru' ? 'подтверждено' : 'evidenced')
        : (capstonePage.dataset.trainingLang === 'ru' ? 'не подтверждено' : 'not evidenced');
    };

    const renderProgress = () => {
      items.forEach(renderItem);
      const count = items.filter(item => state.evidenced[item.dataset.capstoneItem]).length;
      if (progress) progress.textContent = `${count} / ${items.length}`;
      writeCapstoneState(state);
    };

    items.forEach(item => {
      const field = item.querySelector('[data-capstone-answer]');
      if (field) {
        const id = field.dataset.capstoneAnswer;
        field.value = state.answers[id] || '';
        field.addEventListener('input', () => {
          state.answers[id] = field.value;
          renderProgress();
        });
      }
      const details = item.querySelector('[data-capstone-rubric]');
      if (details) {
        const id = details.dataset.capstoneRubric;
        details.addEventListener('toggle', () => {
          if (details.open) state.reviewed[id] = true;
          renderProgress();
        });
      }
    });
    renderProgress();
  }

  // Heading anchors: copy the section URL on click. Hash navigation still
  // happens, so the address bar matches what was copied.
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest?.('.heading-anchor');
    if (!anchor || !navigator.clipboard) return;
    // anchor.href is resolved against the page's <base href>
    navigator.clipboard.writeText(anchor.href).then(() => {
      anchor.classList.add('copied');
      setTimeout(() => anchor.classList.remove('copied'), 1200);
    }).catch(() => {});
  });
})();
