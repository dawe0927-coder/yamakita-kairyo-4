(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const formatDateJP = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatTermJP = (term) => {
    if (!term || !term.start || !term.end) return '';
    return `${formatDateJP(term.start)} ─ ${formatDateJP(term.end)}`;
  };

  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  async function loadJSON(path) {
    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`${res.status} ${path}`);
      return await res.json();
    } catch (err) {
      console.warn(`[yamakita-site] load failed: ${path}`, err);
      return null;
    }
  }

  /* ---- Render: Project ---- */
  function renderProject(data) {
    if (!data) return;

    const heroPeriod = $('#hero-period');
    if (heroPeriod) heroPeriod.textContent = `工期 ${formatTermJP(data.term)}`;

    const aboutList = $('#about-list');
    if (aboutList) {
      const rows = [
        ['工事名',   data.name],
        ['発注者',   data.client],
        ['施工',     data.contractor],
        ['工事場所', data.location],
        ['工期',     formatTermJP(data.term)],
        ['主な工種', Array.isArray(data.main_works) ? data.main_works.join(' ／ ') : ''],
      ].filter(([, v]) => v);

      aboutList.innerHTML = rows
        .map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`)
        .join('');
    }

    const contactCard = $('#contact-card');
    if (contactCard && data.contact) {
      const c = data.contact;
      const telDigits = (c.phone || '').replace(/[^\d+]/g, '');
      contactCard.innerHTML = `
        <p class="contact-card__company">${escapeHtml(data.contractor || '')}（本社代表）</p>
        <p class="contact-card__manager">本工事 現場代理人：${escapeHtml(c.manager || '')}</p>
        ${c.phone ? `<a class="contact-card__tel" href="tel:${escapeHtml(telDigits)}">${escapeHtml(c.phone)}</a>` : ''}
        <p class="contact-card__link">
          <a href="https://koujigumi.jp/" target="_blank" rel="noopener">鴻治組 公式サイト（別ウィンドウで開きます）</a>
        </p>
      `;
    }
  }

  /* ---- Render: Progress ---- */
  function renderProgress(data) {
    const card = $('#progress-card');
    if (!card) return;
    if (!data) {
      card.innerHTML = '<p>進捗情報を準備中です。</p>';
      return;
    }
    const pct = Math.max(0, Math.min(100, Number(data.overall) || 0));
    card.innerHTML = `
      <div class="progress-card__head">
        <p class="progress-card__label">OVERALL PROGRESS</p>
        <div class="progress-card__value" data-count="${pct}" data-suffix="%">
          0<span class="progress-card__value-unit">%</span>
        </div>
      </div>
      <div class="progress-bar" role="progressbar"
           aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
           aria-label="工事全体進捗">
        <div class="progress-bar__fill" data-target-width="${pct}" style="width:0"></div>
      </div>
      <p class="progress-asof">${data.asOf ? 'AS OF ' + formatDateJP(data.asOf) : ''}</p>
    `;
  }

  /* ---- Render: Hero slideshow ---- */
  let heroTimer = null;
  function renderHero(data) {
    const stage = $('#hero-stage');
    const dotsEl = $('#hero-dots');
    const labelEl = $('#hero-label');
    if (!stage) return;

    const slides = data?.slides || [];
    if (slides.length === 0) {
      stage.innerHTML = '';
      return;
    }

    stage.innerHTML = slides.map((s, i) => `
      <picture class="hero__slide ${i === 0 ? 'is-active' : ''}" data-index="${i}">
        <img src="${escapeHtml(s.src)}"
             alt="${escapeHtml(s.alt || '現場写真')}"
             loading="${i === 0 ? 'eager' : 'lazy'}"
             width="1600" height="900" />
      </picture>
    `).join('');

    if (dotsEl) {
      dotsEl.innerHTML = slides.map((_, i) =>
        `<button type="button" class="hero__dot ${i === 0 ? 'is-active' : ''}" data-index="${i}" aria-label="スライド ${i + 1}"></button>`
      ).join('');
    }

    const picEls = $$('.hero__slide', stage);
    const dotEls = dotsEl ? $$('.hero__dot', dotsEl) : [];
    let current = 0;

    function go(idx) {
      current = (idx + slides.length) % slides.length;
      picEls.forEach((el, i) => el.classList.toggle('is-active', i === current));
      dotEls.forEach((d, i) => d.classList.toggle('is-active', i === current));
      if (labelEl) labelEl.textContent = slides[current].label || 'CONSTRUCTION SITE';
    }

    dotEls.forEach((d) => d.addEventListener('click', () => {
      go(Number(d.dataset.index));
      restart();
    }));

    function tick() { go(current + 1); }
    function restart() {
      if (heroTimer) clearInterval(heroTimer);
      heroTimer = setInterval(tick, data.intervalMs || 6500);
    }
    restart();

    go(0);
  }

  /* ---- Render: Gallery with month tabs ---- */
  let galleryAlbums = [];
  let galleryActiveMonth = '';

  function renderGalleryAlbum(album) {
    const gallery = $('#gallery');
    if (!gallery) return;
    if (!album || !Array.isArray(album.items) || album.items.length === 0) {
      gallery.innerHTML = '<p>写真を準備中です。</p>';
      return;
    }
    gallery.innerHTML = album.items.map((p) => `
      <button type="button" class="gallery__item"
              data-src="${escapeHtml(p.src)}"
              data-caption="${escapeHtml(p.caption || '')}"
              aria-label="拡大表示: ${escapeHtml(p.caption || '写真')}">
        <img src="${escapeHtml(p.thumb || p.src)}"
             alt="${escapeHtml(p.caption || '現場写真')}" loading="lazy" />
        ${p.caption ? `<span class="gallery__caption">${escapeHtml(p.caption)}</span>` : ''}
      </button>
    `).join('');

    $$('.gallery__item', gallery).forEach(btn => {
      btn.addEventListener('click', () => openLightbox(btn.dataset.src, btn.dataset.caption));
    });
  }

  function renderGallery(data) {
    const tabsEl = $('#gallery-tabs');
    const gallery = $('#gallery');
    if (!gallery || !tabsEl) return;

    if (!data || !Array.isArray(data.albums) || data.albums.length === 0) {
      tabsEl.innerHTML = '';
      gallery.innerHTML = '<p>写真を準備中です。</p>';
      return;
    }

    galleryAlbums = data.albums.slice().sort((a, b) => (b.month || '').localeCompare(a.month || ''));
    galleryActiveMonth = galleryAlbums[0]?.month || '';

    tabsEl.innerHTML = galleryAlbums.map((alb) => `
      <button type="button" class="gallery-tab ${alb.month === galleryActiveMonth ? 'is-active' : ''}"
              data-month="${escapeHtml(alb.month)}" role="tab"
              aria-selected="${alb.month === galleryActiveMonth ? 'true' : 'false'}">
        <span class="gallery-tab__label">${escapeHtml(alb.label || alb.month)}</span>
        <span class="gallery-tab__count">${alb.items?.length || 0}枚</span>
      </button>
    `).join('');

    $$('.gallery-tab', tabsEl).forEach((btn) => {
      btn.addEventListener('click', () => {
        const month = btn.dataset.month;
        galleryActiveMonth = month;
        $$('.gallery-tab', tabsEl).forEach((b) => {
          const on = b.dataset.month === month;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        const album = galleryAlbums.find((a) => a.month === month);
        renderGalleryAlbum(album);
      });
    });

    renderGalleryAlbum(galleryAlbums[0]);
  }

  /* ---- Render: News + Signage ---- */
  function renderNews(data) {
    const list = $('#news-list');
    const strip = $('#signage-strip');

    const items = Array.isArray(data) ? data : (data?.items || []);
    const signage = data?.signage || [];

    if (list) {
      if (items.length === 0) {
        list.innerHTML = '<p>現在、お知らせはありません。</p>';
      } else {
        list.innerHTML = items
          .slice()
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
          .map(n => `
            <article class="news-item">
              <span class="news-item__date">${escapeHtml(formatDateJP(n.date))}</span>
              <div>
                <h3 class="news-item__title">${escapeHtml(n.title || '')}</h3>
                ${n.body ? `<p class="news-item__body">${escapeHtml(n.body)}</p>` : ''}
                ${n.pdf ? `<a class="news-item__pdf" href="${escapeHtml(n.pdf)}" target="_blank" rel="noopener">関連PDFを開く →</a>` : ''}
              </div>
            </article>
          `).join('');
      }
    }

    if (strip) {
      if (signage.length === 0) {
        strip.innerHTML = '';
      } else {
        strip.innerHTML = signage.map(s => `
          <button type="button" class="signage-card"
                  data-src="${escapeHtml(s.src)}"
                  data-caption="${escapeHtml(s.caption || '')}">
            <span class="signage-card__label">${escapeHtml(s.label || 'NOTICE')}</span>
            <img src="${escapeHtml(s.src)}" alt="${escapeHtml(s.caption || '掲示物')}" loading="lazy" />
          </button>
        `).join('');
        $$('.signage-card', strip).forEach(btn => {
          btn.addEventListener('click', () => openLightbox(btn.dataset.src, btn.dataset.caption));
        });
      }
    }
  }

  /* ---- Render: Team / Office ---- */
  function renderTeam(data) {
    if (!data) return;

    const msg = $('#team-message');
    if (msg && data.message) msg.textContent = data.message;

    const grid = $('#team-grid');
    if (grid && Array.isArray(data.members)) {
      grid.innerHTML = data.members.map((m, i) => {
        const initial = (m.name || '').trim().charAt(0) || '?';
        return `
          <article class="team-card">
            <span class="team-card__no">M${String(i + 1).padStart(2, '0')}</span>
            <div class="team-card__avatar" aria-hidden="true">${escapeHtml(initial)}</div>
            <div class="team-card__body">
              <p class="team-card__tag">${escapeHtml(m.tagEn || '')}</p>
              <p class="team-card__role">${escapeHtml(m.role || '')}</p>
              <p class="team-card__name">${escapeHtml(m.name || '')}</p>
            </div>
          </article>
        `;
      }).join('');
    }

    const office = $('#team-office');
    if (office && data.office) {
      const o = data.office;
      office.innerHTML = `
        <div class="office-card">
          <div class="office-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32"><path d="M12 2 L21 9 V21 H3 V9 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 21 V14 H15 V21" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          </div>
          <div class="office-card__body">
            <p class="office-card__tag">SITE OFFICE</p>
            <h3 class="office-card__name">${escapeHtml(o.name || '')}</h3>
            <p class="office-card__address">${escapeHtml(o.address || '')}</p>
            ${o.hours ? `<p class="office-card__hours">${escapeHtml(o.hours)}</p>` : ''}
          </div>
        </div>
      `;
    }

    const com = $('#team-commitments');
    if (com && Array.isArray(data.commitments)) {
      com.innerHTML = data.commitments.map((c) => `
        <div class="commitment">
          <h4 class="commitment__title">${escapeHtml(c.title)}</h4>
          <p class="commitment__body">${escapeHtml(c.body)}</p>
        </div>
      `).join('');
    }
  }

  /* ---- Render: Dump traffic management ---- */
  const DUMP_ICONS = {
    speed: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12 L17 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    water: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 C8 9 6 13 6 16 a6 6 0 0 0 12 0 C18 13 16 9 12 3 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    'no-idle': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/><path d="M9 10 v4 M15 10 v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    'no-over': '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="11" width="13" height="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="19" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="14" cy="19" r="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2"/></svg>',
    tailgate: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="14" height="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 9 L21 9 L21 15 L17 15" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    route: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4 v8 a3 3 0 0 0 3 3 h6 a3 3 0 0 1 3 3 v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="6" cy="4" r="2" fill="currentColor"/><circle cx="18" cy="20" r="2" fill="currentColor"/></svg>',
  };

  function renderDump(data) {
    const alertEl = $('#dump-alert');
    const rulesEl = $('#dump-rules');
    const mapEl = $('#dump-map');
    const considerationsEl = $('#dump-considerations');
    if (!data) return;

    if (alertEl && data.headline) {
      alertEl.innerHTML = `
        <div class="dump-alert__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="36" height="36"><path d="M12 2 L22 20 L2 20 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.2" fill="currentColor"/></svg>
        </div>
        <div class="dump-alert__body">
          <p class="dump-alert__headline">${escapeHtml(data.headline)}</p>
          ${data.vehicle ? `
            <ul class="dump-alert__meta">
              <li><span>VEHICLE</span>${escapeHtml(data.vehicle.type || '')}</li>
              <li><span>FLEET</span>${escapeHtml(data.vehicle.count || '')}</li>
              <li><span>FREQ</span>${escapeHtml(data.vehicle.freq || '')}</li>
            </ul>` : ''}
        </div>
      `;
    }

    if (rulesEl && Array.isArray(data.rules)) {
      rulesEl.innerHTML = data.rules.map((r, i) => `
        <article class="rule-card">
          <span class="rule-card__no">${String(i + 1).padStart(2, '0')}</span>
          <span class="rule-card__icon" aria-hidden="true">${DUMP_ICONS[r.icon] || ''}</span>
          <h4 class="rule-card__title">${escapeHtml(r.title)}</h4>
          <p class="rule-card__body">${escapeHtml(r.body)}</p>
        </article>
      `).join('');
    }

    if (mapEl && data.map) {
      mapEl.innerHTML = `
        <button type="button" class="dump-map__btn"
                data-src="${escapeHtml(data.map.src)}"
                data-caption="${escapeHtml(data.map.caption || 'ダンプ運行ルート')}"
                aria-label="運行ルート図を拡大表示">
          <img src="${escapeHtml(data.map.src)}" alt="${escapeHtml(data.map.caption || '運行ルート図')}" loading="lazy" />
          <span class="dump-map__zoom">CLICK TO ZOOM</span>
        </button>
        ${data.map.caption ? `<figcaption class="dump-map__caption">${escapeHtml(data.map.caption)}</figcaption>` : ''}
      `;
      const btn = $('.dump-map__btn', mapEl);
      if (btn) btn.addEventListener('click', () => openLightbox(btn.dataset.src, btn.dataset.caption));
    }

    if (considerationsEl && Array.isArray(data.considerations)) {
      considerationsEl.innerHTML = data.considerations.map((c) => `
        <div class="consideration">
          <h4 class="consideration__title">${escapeHtml(c.title)}</h4>
          <p class="consideration__body">${escapeHtml(c.body)}</p>
        </div>
      `).join('');
    }
  }

  /* ---- Render: Vision slider ---- */
  let visionTimer = null;

  function renderVision(data) {
    const track = $('#vision-track');
    const controls = $('#vision-controls');
    if (!track || !controls) return;

    const items = data?.items || [];
    if (items.length === 0) {
      track.innerHTML = '<div style="aspect-ratio:16/8;display:flex;align-items:center;justify-content:center;color:#7A82A1;">完成イメージを準備中です。</div>';
      return;
    }

    track.innerHTML = items.map((it, i) => `
      <div class="slider__slide ${i === 0 ? 'is-active' : ''}" data-index="${i}">
        <img src="${escapeHtml(it.src)}" alt="${escapeHtml(it.caption || '完成イメージ')}" loading="${i === 0 ? 'eager' : 'lazy'}" />
        ${it.caption ? `<div class="slider__overlay">${escapeHtml(it.caption)}</div>` : ''}
      </div>
    `).join('');

    controls.innerHTML = items.map((_, i) =>
      `<button type="button" class="slider__dot ${i === 0 ? 'is-active' : ''}" data-index="${i}" aria-label="スライド ${i + 1}"></button>`
    ).join('');

    const slides = $$('.slider__slide', track);
    const dots = $$('.slider__dot', controls);
    let current = 0;

    function go(idx) {
      current = (idx + items.length) % items.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    dots.forEach((d) => d.addEventListener('click', () => {
      go(Number(d.dataset.index));
      restartTimer();
    }));

    function tick() { go(current + 1); }
    function restartTimer() {
      if (visionTimer) clearInterval(visionTimer);
      visionTimer = setInterval(tick, 5500);
    }
    restartTimer();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (visionTimer) clearInterval(visionTimer);
        visionTimer = null;
      } else if (!visionTimer) {
        restartTimer();
      }
    });
  }

  /* ---- Count-up animation ---- */
  function animateCount(el, target, duration = 1600) {
    const startTime = performance.now();
    const unit = el.querySelector('.stat-card__unit, .progress-card__value-unit');
    const unitHTML = unit ? unit.outerHTML : '';
    const format = el.dataset.format === '0,0'
      ? (n) => n.toLocaleString('en-US')
      : (n) => String(n);

    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      el.firstChild ? (el.innerHTML = format(value) + unitHTML) : null;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function setupCounters(root = document) {
    $$('[data-count]', root).forEach((el) => {
      if (el.dataset._counted) return;
      el.dataset._counted = '1';
      const target = Number(el.dataset.count) || 0;
      animateCount(el, target);
    });
  }

  /* ---- Progress bar fill on reveal ---- */
  function fillProgressBar(root = document) {
    $$('.progress-bar__fill', root).forEach((bar) => {
      const target = Number(bar.dataset.targetWidth) || 0;
      requestAnimationFrame(() => {
        bar.style.width = `${target}%`;
      });
    });
  }

  /* ---- IntersectionObserver: reveal + count + progress ---- */
  function setupReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      setupCounters();
      fillProgressBar();
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-visible');
        setupCounters(el);
        fillProgressBar(el);
        io.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    els.forEach((el) => io.observe(el));
  }

  /* ---- Lightbox ---- */
  function openLightbox(src, caption) {
    const box = $('#lightbox');
    if (!box) return;
    $('.lightbox__img', box).src = src;
    $('.lightbox__img', box).alt = caption || '';
    $('.lightbox__caption', box).textContent = caption || '';
    box.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const box = $('#lightbox');
    if (!box) return;
    box.hidden = true;
    document.body.style.overflow = '';
  }

  function setupLightbox() {
    const box = $('#lightbox');
    if (!box) return;
    $('.lightbox__close', box).addEventListener('click', closeLightbox);
    box.addEventListener('click', (e) => {
      if (e.target === box) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !box.hidden) closeLightbox();
    });
  }

  /* ---- Init ---- */
  async function init() {
    const year = $('#copy-year');
    if (year) year.textContent = new Date().getFullYear();

    setupLightbox();

    const [project, progress, photos, news, vision, dump, hero, team] = await Promise.all([
      loadJSON('data/project.json'),
      loadJSON('data/progress.json'),
      loadJSON('data/photos.json'),
      loadJSON('data/news.json'),
      loadJSON('data/vision.json'),
      loadJSON('data/dump.json'),
      loadJSON('data/hero.json'),
      loadJSON('data/team.json'),
    ]);

    renderHero(hero);
    renderProject(project);
    renderProgress(progress);
    renderGallery(photos);
    renderNews(news);
    renderVision(vision);
    renderDump(dump);
    renderTeam(team);

    requestAnimationFrame(setupReveal);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
