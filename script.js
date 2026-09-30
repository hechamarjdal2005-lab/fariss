/* ============================================================================
   FARISS MODE — SITE SCRIPT
   ----------------------------------------------------------------------------
   One file, sectioned:
     1. tiny DOM helpers
     2. product card renderer (shared by home + shop)
     3. navigation: mobile menu, sticky header, scroll progress, page curtain
     4. scroll reveal (IntersectionObserver + stagger)
     5. animated counters + drop countdown + marquee duplication
     6. shop: filters, search, quick view
     7. contact form validation
     8. boot
   No dependencies, no build step.
   ========================================================================= */

(function () {
  'use strict';

  /* ---------- 1. HELPERS ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var money = FM.money;
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  /* ---------- 2. PRODUCT CARD ---------- */
  /* Rendered from FM.products so home/shop/quickview never drift apart. */
  FM.cardHTML = function (p, opts) {
    opts = opts || {};
    var tag = FM.tagLabel(p.tag);
    var chips = (p.sizes || ['TU']).map(function (s, i) {
      return '<button class="size-chip' + (i === 0 ? ' is-on' : '') + '" type="button" ' +
        'data-size="' + esc(s) + '" aria-pressed="' + (i === 0) + '">' + esc(s) + '</button>';
    }).join('');

    return (
      '<article class="card reveal' + (opts.extra || '') + '" data-id="' + p.id + '" data-cat="' + p.cat + '" ' +
        'data-name="' + esc(p.name.toLowerCase()) + '" style="--d:' + ((opts.index || 0) * 55) + 'ms">' +
        '<div class="card__media">' +
          '<img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async">' +
          '<div class="card__tags">' +
            (tag ? '<span class="tag ' + (p.tag === 'promo' ? 'tag--bone' : '') + '">' + tag + '</span>' : '') +
            (p.tag === 'new' ? '<span class="tag tag--dark tag--pulse">Flash</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="card__body">' +
          '<div class="card__meta">' +
            '<span>' + esc(catName(p.cat)) + '</span>' +
            '<span>' + esc(p.id.toUpperCase()) + '</span>' +
          '</div>' +
          '<h3 class="card__name">' + esc(p.name) + '</h3>' +
          '<div class="card__sizes">' + chips + '</div>' +
          '<div class="card__foot">' +
            '<div class="price">' + money(p.price) +
              (p.oldPrice ? '<s>' + money(p.oldPrice) + '</s>' : '') +
            '</div>' +
            '<button class="add-btn" type="button" data-add="' + p.id + '" aria-label="Ajouter ' + esc(p.name) + ' au panier">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M4 7h16l-1.2 12.4H5.2L4 7zM8.5 7V5.2a3.5 3.5 0 017 0V7M9 12v3M15 12v3"/></svg>' +
              '<span class="lbl">Ajouter</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  };

  function catName(id) {
    var found = FM.categories.filter(function (c) { return c.id === id; })[0];
    if (found) return found.short;
    return id === 'hoodies' ? 'Hoodies' : id;
  }

  /* ---------- 3. NAVIGATION ---------- */
  function initNav() {
    var header = $('.site-header');
    var burger = $('#fmBurger');
    var menu = $('#fmMenu');

    /* burger / mobile menu */
    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = menu.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('is-locked', open);
      });
      $$('.mobile-menu__links a', menu).forEach(function (a, i) {
        a.style.setProperty('--i', i);
        a.addEventListener('click', function () {
          menu.classList.remove('is-open');
          burger.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('is-locked');
        });
      });
    }

    /* sticky header + scroll progress */
    var progress = $('#fmProgress');
    var lastY = -1;
    function onScroll() {
      var y = window.pageYOffset;
      if (header) header.classList.toggle('is-stuck', y > 8);
      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      }
      lastY = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* page transition curtain — every internal link wipes to green */
    if (!REDUCED) {
      document.addEventListener('click', function (e) {
        var a = e.target.closest('a');
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#' || a.target === '_blank' || href.indexOf('http') === 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        var curtain = $('#fmCurtain');
        if (!curtain) return;
        e.preventDefault();
        document.body.classList.add('is-leaving');
        var label = curtain.querySelector('.curtain__label');
        if (label) label.textContent = a.getAttribute('data-curtain') || 'FM';
        setTimeout(function () { window.location.href = href; }, 430);
      });
    }

    /* footer year */
    var yr = $('#fmYear');
    if (yr) yr.textContent = new Date().getFullYear();

    /* duplicate marquee tracks so the loop is seamless */
    $$('.ticker__track').forEach(function (t) {
      t.innerHTML = t.innerHTML + t.innerHTML;
    });
  }

  /* ---------- 4. REVEAL ON SCROLL ---------- */
  function initReveal() {
    var nodes = $$('.reveal:not(.in)');
    if (!nodes.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---------- 5. COUNTERS / COUNTDOWN ---------- */
  function initCounters() {
    var nums = $$('[data-count]');
    if (!nums.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1500;
      var start = performance.now();
      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = (target >= 1000 ? Math.floor(val).toLocaleString('fr-FR') : Math.round(val * 10) / 10) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = (target >= 1000 ? target.toLocaleString('fr-FR') : target) + suffix;
      }
      requestAnimationFrame(tick);
    }

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        run(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  function initCountdown() {
    var box = $('#fmCountdown');
    if (!box) return;
    var target = new Date(FM.dropDate).getTime();
    /* if the date slipped past, roll forward a week so the site never shows zeros */
    var guard = 0;
    while (target < Date.now() && guard < 52) { target += 7 * 864e5; guard++; }

    var cells = {
      d: box.querySelector('[data-cd="d"]'),
      h: box.querySelector('[data-cd="h"]'),
      m: box.querySelector('[data-cd="m"]'),
      s: box.querySelector('[data-cd="s"]')
    };

    function paint() {
      var diff = Math.max(0, target - Date.now());
      var sec = Math.floor(diff / 1000);
      var d = Math.floor(sec / 86400);
      var h = Math.floor((sec % 86400) / 3600);
      var m = Math.floor((sec % 3600) / 60);
      var s = sec % 60;
      cells.d.textContent = String(d).padStart(2, '0');
      cells.h.textContent = String(h).padStart(2, '0');
      cells.m.textContent = String(m).padStart(2, '0');
      cells.s.textContent = String(s).padStart(2, '0');
      if (diff > 0 && diff < 86400000) box.classList.add('is-live');
    }
    paint();
    setInterval(paint, 1000);
  }

  /* ---------- 6. PRODUCT GRIDS / SHOP TOOLS ---------- */
  function initGrids() {
    /* home: featured drop */
    var drop = $('#fmFeatured');
    if (drop) {
      drop.innerHTML = FM.featuredIds
        .map(function (id, i) { return FM.byId(id) ? FM.cardHTML(FM.byId(id), { index: i, extra: ' reveal--scale' }) : ''; })
        .join('');
    }

    /* home: category cards get live product counts */
    $$('[data-cat-card]').forEach(function (el) {
      var id = el.getAttribute('data-cat-card');
      var n = FM.products.filter(function (p) { return FM.catMatches(p.cat, id); }).length;
      var out = el.querySelector('[data-cat-count]');
      if (out) out.textContent = n + ' pièces';
    });

    /* add-to-cart delegation (works on every grid, forever) */
    document.addEventListener('click', function (e) {
      var sizeBtn = e.target.closest('.size-chip');
      if (sizeBtn) {
        var wrap = sizeBtn.closest('.card__sizes');
        $$('.size-chip', wrap).forEach(function (c) {
          c.classList.toggle('is-on', c === sizeBtn);
          c.setAttribute('aria-pressed', String(c === sizeBtn));
        });
        return;
      }

      var addBtn = e.target.closest('[data-add]');
      if (!addBtn) return;
      var card = addBtn.closest('.card');
      var id = addBtn.getAttribute('data-add');
      var p = FM.byId(id);
      if (!p) return;
      var on = card && card.querySelector('.size-chip.is-on');
      FM.cart.add(id, on ? on.getAttribute('data-size') : null);

      card && card.classList.remove('is-added');
      void (card && card.offsetWidth);
      card && card.classList.add('is-added');
      setTimeout(function () { card && card.classList.remove('is-added'); }, 520);

      bumpCart();
      toast(p.name, p.price);
    });
  }

  function bumpCart() {
    var btn = $('.cart-btn');
    if (!btn) return;
    btn.classList.remove('is-bumping');
    void btn.offsetWidth;
    btn.classList.add('is-bumping');
    setTimeout(function () { btn.classList.remove('is-bumping'); }, 560);
  }

  /* ---------- 7. TOAST ---------- */
  var toastEl, toastTimer;
  function toast(name, price) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<strong>Ajouté</strong> ' + esc(name) + ' · ' + money(price);
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  /* ---------- 8. SHOP: FILTERS / SEARCH / QUICK VIEW ---------- */
  function initShop() {
    var grid = $('#fmShopGrid');
    if (!grid) return;

    var searchInput = $('#fmSearch');
    var clearBtn = $('#fmSearchClear');
    var filterBtns = $$('.filter');
    var counter = $('#fmResultCount');
    var empty = $('#fmEmpty');
    var state = { cat: 'all', q: '' };

    /* pre-filter from ?category= */
    var params = new URLSearchParams(window.location.search);
    var fromUrl = params.get('category');
    if (fromUrl) {
      var match = filterBtns.filter(function (b) { return b.getAttribute('data-filter') === fromUrl; })[0];
      if (match) state.cat = fromUrl;
    }

    function paintFilters() {
      filterBtns.forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-filter') === state.cat);
      });
    }

    function render() {
      var list = FM.products.filter(function (p) {
        var okCat = FM.catMatches(p.cat, state.cat);
        var hay = (p.name + ' ' + p.cat + ' ' + catName(p.cat)).toLowerCase();
        var okQ = !state.q || hay.indexOf(state.q) > -1;
        return okCat && okQ;
      });
      grid.innerHTML = list.map(function (p, i) {
        return FM.cardHTML(p, { index: i });
      }).join('');
      if (counter) counter.textContent = list.length + (list.length > 1 ? ' pièces' : ' pièce');
      if (empty) empty.hidden = list.length > 0;
      initReveal();
    }

    filterBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        state.cat = b.getAttribute('data-filter');
        paintFilters();
        render();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.q = searchInput.value.trim().toLowerCase();
        clearBtn && clearBtn.classList.toggle('on', !!searchInput.value);
        render();
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        state.q = '';
        clearBtn.classList.remove('on');
        render();
        searchInput.focus();
      });
    }

    paintFilters();
    render();

    /* quick view from a card image */
    grid.addEventListener('click', function (e) {
      var media = e.target.closest('.card__media');
      if (!media || e.target.closest('button')) return;
      var card = media.closest('.card');
      openQuickView(card.getAttribute('data-id'));
    });
  }

  function openQuickView(id) {
    var p = FM.byId(id);
    if (!p) return;
    var qv = $('#fmQV');
    if (!qv) return;
    qv.querySelector('.qv__media img').src = p.img;
    qv.querySelector('.qv__media img').alt = p.name;
    qv.querySelector('[data-qv-cat]').textContent = catName(p.cat);
    qv.querySelector('[data-qv-name]').textContent = p.name;
    qv.querySelector('[data-qv-desc]').textContent = p.desc;
    qv.querySelector('[data-qv-price]').innerHTML = money(p.price) +
      (p.oldPrice ? ' <s style="color:var(--bone-3)">' + money(p.oldPrice) + '</s>' : '');
    var specs = Object.keys(p.specs).map(function (k) {
      return '<li><span>' + esc(k) + '</span><b>' + esc(p.specs[k]) + '</b></li>';
    }).join('');
    qv.querySelector('[data-qv-specs]').innerHTML = specs;
    var sizes = qv.querySelector('[data-qv-sizes]');
    sizes.innerHTML = (p.sizes || ['TU']).map(function (s, i) {
      return '<button class="size-chip' + (i === 0 ? ' is-on' : '') + '" type="button" data-size="' + esc(s) +
        '" aria-pressed="' + (i === 0) + '">' + esc(s) + '</button>';
    }).join('');
    qv.querySelector('[data-qv-add]').setAttribute('data-add', p.id);
    qv.classList.add('is-open');
    document.body.classList.add('is-locked');
    qv.querySelector('.qv__close').focus();
  }

  function initQuickView() {
    var qv = $('#fmQV');
    if (!qv) return;
    qv.addEventListener('click', function (e) {
      if (e.target.classList.contains('qv__scrim') || e.target.closest('.qv__close')) {
        qv.classList.remove('is-open');
        document.body.classList.remove('is-locked');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && qv.classList.contains('is-open')) {
        qv.classList.remove('is-open');
        document.body.classList.remove('is-locked');
      }
    });
  }

  /* ---------- 9. CONTACT FORM ---------- */
  function initForm() {
    var form = $('#fmForm');
    if (!form) return;
    var ok = $('#fmFormOk');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      $$('.field', form).forEach(function (f) {
        var input = $('input, select, textarea', f);
        var err = $('.field__err', f);
        var msg = '';
        var v = input.value.trim();
        if (input.hasAttribute('required') && !v) msg = 'Champ obligatoire';
        if (!msg && input.type === 'email' && v && !/^\S+@\S+\.\S{2,}$/.test(v)) msg = 'Email invalide';
        if (!msg && input.type === 'tel' && v && !/^[0-9 +().-]{8,20}$/.test(v)) msg = 'Numéro invalide';
        f.classList.toggle('has-error', !!msg);
        if (err) err.textContent = msg;
        if (msg) valid = false;
      });
      if (!valid) {
        var first = $('.has-error input, .has-error textarea', form);
        first && first.focus();
        return;
      }
      ok.hidden = false;
      form.reset();
      ok.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' });
    });

    $$('input, textarea', form).forEach(function (i) {
      i.addEventListener('input', function () {
        var f = i.closest('.field');
        if (f.classList.contains('has-error')) {
          f.classList.remove('has-error');
          var e2 = $('.field__err', f);
          if (e2) e2.textContent = '';
        }
      });
    });
  }

  /* ---------- 10. BOOT ---------- */
  function boot() {
    document.body.classList.add('is-entering');
    initNav();
    initGrids();
    initShop();
    initQuickView();
    initReveal();
    initCounters();
    initCountdown();
    initForm();
    initYear();
  }

  function initYear() {
    var y = $('#fmYear');
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
