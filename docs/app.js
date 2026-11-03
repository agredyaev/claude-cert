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

    const labState = readJson('ccaf-labs:state');
    const labDone = labState && labState.done && typeof labState.done === 'object'
      ? Object.values(labState.done).filter(Boolean).length : 0;
    const labsCopy = document.getElementById('training-labs-copy');
    if (labsCopy) labsCopy.textContent = `${labDone} / 4`;
    const labsStat = document.getElementById('training-labs-stat');
    if (labsStat) labsStat.textContent = `${labDone} / 4`;

    const preflight = readJson('ccaf-preflight:state');
    const checked = Array.isArray(preflight && preflight.checked) ? new Set(preflight.checked).size : 0;
    const readinessCopy = document.getElementById('training-readiness-copy');
    if (readinessCopy) readinessCopy.textContent = `${checked} / 10`;

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
    } else if (labDone < 4) {
      setNext(
        'Hands-on labs',
        ru
          ? `Выполнено ${labDone} из 4. Лабораторная засчитывается только после проверки deliverable по acceptance criteria.`
          : `${labDone} of 4 complete. A lab counts only after the deliverable is checked against its acceptance criteria.`,
        labsHref,
        ru ? 'Продолжить' : 'Continue',
      );
    } else if (checked < 10) {
      setNext(
        'Readiness',
        ru
          ? `Освоены все task statements и labs. Осталось подтвердить readiness: ${checked} / 10.`
          : `All task statements and labs are complete. Finish the readiness evidence: ${checked} / 10.`,
        'preflight/architect-foundations.html',
        ru ? 'Проверить' : 'Check',
      );
    } else {
      setNext(
        'CCAR-P · Professional',
        ru
          ? 'Foundation mastery подтверждён. Можно переходить к следующему архитектурному уровню.'
          : 'Foundation mastery is complete. Move to the next architecture level.',
        professionalHref,
        ru ? 'Открыть' : 'Open',
      );
    }

    const professionalReady = checked === 10 && labDone === 4 && masteredCount === 30;
    const professionalStatus = document.getElementById('professional-stage-status');
    if (professionalStatus) {
      professionalStatus.textContent = professionalReady
        ? (ru ? 'Foundation mastery gate завершён.' : 'Foundation mastery gate complete.')
        : (ru
          ? `Нужно mastery 30 / 30, labs 4 / 4 и readiness 10 / 10. Сейчас: ${masteredCount} / 30, ${labDone} / 4, ${checked} / 10.`
          : `Requires mastery 30 / 30, labs 4 / 4, and readiness 10 / 10. Current: ${masteredCount} / 30, ${labDone} / 4, ${checked} / 10.`);
    }
    for (const id of ['professional-guide-link', 'professional-practice-link']) {
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
