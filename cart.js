/* ============================================================================
   FARISS MODE — CART (localStorage + WhatsApp checkout)
   ----------------------------------------------------------------------------
   Owns: the floating cart UI (bottom sheet on phones / right drawer on desktop),
   add / increment / decrement / remove, totals, and the WhatsApp handoff.
   Exposes FM.cart so any page (or future button) can add a product:
       FM.cart.add('p1', 'M');
       FM.cart.open();
       FM.cart.count();
   ========================================================================= */

(function () {
  'use strict';

  var KEY = 'fm_cart_v1';
  var config = FM.config;

  /* ---------- state ---------- */
  var items = load();
  var lastFocus = null;

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(valid) : [];
    } catch (e) {
      return [];
    }
  }
  function valid(i) {
    return i && typeof i.id === 'string' && typeof i.qty === 'number' && i.qty > 0;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* private mode */ }
  }
  function lineKey(id, size) { return id + '::' + (size || 'TU'); }

  /* ---------- cart UI (injected once per page) ---------- */
  var scrim, panel, list, badge, count, subtotalEl, shipEl, totalEl, waBtn, clearBtn, openBtns;

  function build() {
    if (panel) return;

    scrim = el('div', 'cart-scrim');
    scrim.addEventListener('click', close);

    panel = el('aside', 'cart');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Panier Fariss Mode');
    panel.innerHTML =
      '<div class="cart__grab" aria-hidden="true"><i></i></div>' +
      '<header class="cart__head">' +
        '<h3>Panier <span class="mono muted" id="fmCartCount">0</span></h3>' +
        '<button class="cart__close" type="button" aria-label="Fermer le panier">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M5 5l14 14M19 5L5 19"/></svg>' +
        '</button>' +
      '</header>' +
      '<div class="cart__list" id="fmCartList"></div>' +
      '<footer class="cart__foot">' +
        '<div class="cart__lines">' +
          '<div class="cart__line"><span>Sous-total</span><b id="fmSubtotal">0 DH</b></div>' +
          '<div class="cart__line"><span>Livraison Maroc</span><b id="fmShip">—</b></div>' +
          '<div class="cart__line cart__line--total"><span>Total</span><b id="fmTotal">0 DH</b></div>' +
        '</div>' +
        '<button class="wa-btn" type="button" id="fmWaBtn">' +
          '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5.05-1.32A10 10 0 1012 2zm5.1 14.1c-.22.62-1.28 1.18-1.76 1.22-.48.05-.98.22-3.3-.7-2.78-1.1-4.5-3.94-4.64-4.13-.13-.19-1.1-1.47-1.1-2.8 0-1.33.7-1.98.94-2.25.25-.27.54-.34.72-.34l.52.01c.17 0 .4-.07.62.47.24.57.8 1.97.87 2.11.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.17-.3.37-.43.5-.14.14-.29.29-.13.57.17.28.74 1.21 1.58 1.96 1.09.97 2 1.27 2.28 1.42.28.14.45.12.61-.07.17-.19.7-.82.89-1.1.19-.28.37-.23.62-.14.25.09 1.6.76 1.88.9.28.14.46.21.53.33.07.12.07.7-.16 1.32z"/></svg>' +
          'Commander via WhatsApp' +
        '</button>' +
        '<p class="cart__note">Paiement à la livraison · <a href="contact.html">ou passe en boutique</a></p>' +
        '<button class="cart__clear" type="button" id="fmClear">Vider le panier</button>' +
      '</footer>';

    document.body.appendChild(scrim);
    document.body.appendChild(panel);

    list = panel.querySelector('#fmCartList');
    subtotalEl = panel.querySelector('#fmSubtotal');
    shipEl = panel.querySelector('#fmShip');
    totalEl = panel.querySelector('#fmTotal');
    count = panel.querySelector('#fmCartCount');
    waBtn = panel.querySelector('#fmWaBtn');
    clearBtn = panel.querySelector('#fmClear');

    panel.querySelector('.cart__close').addEventListener('click', close);
    waBtn.addEventListener('click', checkout);
    clearBtn.addEventListener('click', clearAll);

    /* one delegated listener for every qty / remove button */
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var row = btn.closest('.cart-item');
      var key = row.getAttribute('data-key');
      var act = btn.getAttribute('data-act');
      if (act === 'plus') setQty(key, lineQty(key) + 1);
      if (act === 'minus') setQty(key, lineQty(key) - 1);
      if (act === 'rm') remove(key, row);
    });

    openBtns = document.querySelectorAll('[data-cart-open]');
    for (var i = 0; i < openBtns.length; i++) {
      openBtns[i].addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) close();
    });

    render();
  }

  function el(tag, cls) {
    var n = document.createElement(tag);
    n.className = cls;
    return n;
  }

  /* ---------- rendering ---------- */
  function render() {
    if (!panel) return;

    /* empty state vs lines */
    if (!items.length) {
      list.innerHTML =
        '<div class="cart__empty">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 7h12l-1 13H7L6 7zM9 7V5a3 3 0 016 0v2"/></svg>' +
          '<p>Panier vide<br>Le drop n'+String.fromCharCode(39)+'attend pas.</p>' +
          '<a class="btn btn--volt btn--sm" href="shop.html">Voir la collection</a>' +
        '</div>';
    } else {
      list.innerHTML = items.map(rowHTML).join('');
    }

    var c = count_();
    count.textContent = c + (c > 1 ? ' articles' : ' article');

    var sub = subtotal();
    var ship = shipping(sub);
    subtotalEl.textContent = FM.money(sub);
    shipEl.textContent = ship === 0 ? 'Offerte' : FM.money(ship);
    totalEl.textContent = FM.money(sub + ship);
    waBtn.classList.toggle('is-busy', !items.length);

    /* navbar badge */
    if (badge) {
      badge.textContent = c;
      if (openBtns && openBtns[0]) {
        openBtns[0].classList.toggle('has-items', c > 0);
      }
    }
  }

  function rowHTML(i) {
    var p = FM.byId(i.id) || {};
    var key = lineKey(i.id, i.size);
    return (
      '<article class="cart-item" data-key="' + key + '">' +
        '<div class="cart-item__media">' +
          '<img src="' + (p.img || '') + '" alt="' + esc(p.name || i.id) + '" loading="lazy">' +
        '</div>' +
        '<div>' +
          '<h4 class="cart-item__name">' + esc(p.name || i.id) + '</h4>' +
          '<p class="cart-item__size">Taille : ' + esc(i.size || 'TU') + '</p>' +
          '<p class="cart-item__unit">' + FM.money(i.price) + ' / pièce</p>' +
          '<div class="cart-item__ctl">' +
            '<div class="qty">' +
              '<button type="button" data-act="minus" aria-label="Retirer une unité">&minus;</button>' +
              '<span>' + i.qty + '</span>' +
              '<button type="button" data-act="plus" aria-label="Ajouter une unité">+</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="cart-item__right">' +
          '<button class="cart-item__rm" type="button" data-act="rm" aria-label="Supprimer la ligne">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>' +
          '</button>' +
          '<span class="cart-item__price">' + FM.money(i.price * i.qty) + '</span>' +
        '</div>' +
      '</article>'
    );
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- mutations ---------- */
  function add(id, size, qty) {
    var p = FM.byId(id);
    if (!p) return;
    var chosen = size || (p.sizes && p.sizes[0]) || 'TU';
    var key = lineKey(id, chosen);
    var line = find(key);
    if (line) line.qty += (qty || 1);
    else items.push({ id: id, size: chosen, qty: qty || 1, price: p.price });
    save();
    render();
  }

  function find(key) {
    for (var i = 0; i < items.length; i++) if (lineKey(items[i].id, items[i].size) === key) return items[i];
    return null;
  }
  function lineQty(key) {
    var l = find(key);
    return l ? l.qty : 0;
  }
  function setQty(key, qty) {
    if (qty <= 0) {
      items = items.filter(function (i) { return lineKey(i.id, i.size) !== key; });
    } else {
      var l = find(key);
      if (l) l.qty = Math.min(qty, 99);
    }
    save();
    render();
  }
  function remove(key, row) {
    if (row) row.classList.add('is-removing');
    setTimeout(function () {
      items = items.filter(function (i) { return lineKey(i.id, i.size) !== key; });
      save();
      render();
    }, row ? 200 : 0);
  }
  function clearAll() {
    items = [];
    save();
    render();
  }

  /* ---------- money ---------- */
  function subtotal() {
    return items.reduce(function (sum, i) { return sum + i.price * i.qty; }, 0);
  }
  function shipping(sub) {
    if (!items.length) return 0;
    return sub >= config.freeShippingOver ? 0 : config.shippingFlat;
  }
  function count_() {
    return items.reduce(function (n, i) { return n + i.qty; }, 0);
  }

  /* ---------- WhatsApp handoff ---------- */
  function checkout() {
    if (!items.length) return;
    var sub = subtotal();
    var ship = shipping(sub);
    var lines = items.map(function (i, n) {
      var p = FM.byId(i.id) || {};
      return (n + 1) + '. ' + (p.name || i.id) + ' — Taille ' + (i.size || 'TU') +
        ' (x' + i.qty + ') — ' + FM.money(i.price * i.qty);
    }).join('\n');

    var msg =
      'Bonjour Fariss Mode 👋, je souhaite commander :\n\n' + lines +
      '\n\nSous-total : ' + FM.money(sub) +
      '\nLivraison : ' + (ship === 0 ? 'Offerte' : FM.money(ship)) +
      '\nTotal : ' + FM.money(sub + ship) +
      '\n\nNom :\nTéléphone :\nVille / adresse :\n\nMerci de confirmer la livraison 🙏';

    waBtn.classList.add('is-busy');
    window.open(config.whatsappBase + '?text=' + encodeURIComponent(msg), '_blank');
    setTimeout(function () { waBtn.classList.remove('is-busy'); }, 1200);
  }

  /* ---------- open / close ---------- */
  function open() {
    if (!panel) build();
    lastFocus = document.activeElement;
    panel.classList.add('is-open');
    scrim.classList.add('is-open');
    document.body.classList.add('is-locked');
    var closeBtn = panel.querySelector('.cart__close');
    if (closeBtn) closeBtn.focus();
  }
  function close() {
    panel.classList.remove('is-open');
    scrim.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function toggle() {
    if (panel && panel.classList.contains('is-open')) close(); else open();
  }

  /* ---------- public API ---------- */
  FM.cart = {
    add: add,
    open: open,
    close: close,
    toggle: toggle,
    clear: clearAll,
    count: count_,
    items: function () { return items.slice(); }
  };

  /* ---------- boot ---------- */
  function init() {
    badge = document.querySelector('.cart-badge');
    build();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* keep multiple open in sync if a cart button is added later */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cart-open]');
    if (!t || !openBtns || openBtns.indexOf(t) === -1) return;
    e.preventDefault();
    open();
  });
})();
