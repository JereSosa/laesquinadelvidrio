/* Landing page: opening hours, product list, order cart, gallery and lightbox. */
(function () {
  var FOUNDED = { y: 1992, m: 5, d: 25 };
  // Minutes from midnight per weekday (0 = Sunday), local time in San Luis.
  var SCHED = { 0: [], 1: [[480, 780], [900, 1140]], 2: [[480, 780], [900, 1140]], 3: [[480, 780], [900, 1140]], 4: [[480, 780], [900, 1140]], 5: [[480, 780], [900, 1140]], 6: [[480, 780]] };
  var DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  var state = { cart: {}, filter: 'todos', galFilter: 'todos', lb: -1 };

  var $ = function (s) { return document.querySelector(s); };

  function fmtTime(m) { return Math.floor(m / 60) + ':' + pad(m % 60); }

  function yearsSince(f) {
    var now = new Date();
    var y = now.getFullYear() - f.y;
    var m = now.getMonth() + 1;
    if (m < f.m || (m === f.m && now.getDate() < f.d)) y--;
    return y;
  }

  /* ---- opening hours ---- */
  function nowParts() {
    var d = new Date();
    try {
      var f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/San_Luis', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
      var p = {};
      f.formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
      var wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday];
      return { day: wd, min: (parseInt(p.hour, 10) % 24) * 60 + parseInt(p.minute, 10) };
    } catch (e) {
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function shape(open, left, lead, day) {
    return {
      open: open,
      day: day,
      title: open ? 'ABIERTO AHORA' : 'CERRADO AHORA',
      short: open ? 'Abierto ahora' : 'Cerrado',
      lead: (open ? 'cierra en' : 'abre en') + ' · ' + lead.toUpperCase(),
      d: pad(Math.floor(left / 1440)),
      h: pad(Math.floor((left % 1440) / 60)),
      m: pad(left % 60)
    };
  }

  function status() {
    var now = nowParts();
    var today = SCHED[now.day];
    for (var i = 0; i < today.length; i++) {
      if (now.min >= today[i][0] && now.min < today[i][1]) {
        return shape(true, today[i][1] - now.min, 'Cierra hoy a las ' + fmtTime(today[i][1]), now.day);
      }
    }
    for (var k = 0; k < 8; k++) {
      var dd = (now.day + k) % 7;
      var slots = SCHED[dd];
      for (var j = 0; j < slots.length; j++) {
        if (k === 0 && slots[j][0] <= now.min) continue;
        var when = k === 0 ? 'hoy' : k === 1 ? 'mañana' : 'el ' + DAY_NAMES[dd];
        return shape(false, k * 1440 + slots[j][0] - now.min, 'Abre ' + when + ' a las ' + fmtTime(slots[j][0]), now.day);
      }
    }
    return shape(false, 0, '', now.day);
  }

  function renderStatus() {
    var st = status();
    $('#st-short').textContent = st.short;
    $('#st-line').textContent = st.title + ' · ' + st.lead;
    $('#st-d').textContent = st.d;
    $('#st-h').textContent = st.h;
    $('#st-m').textContent = st.m;
    document.querySelectorAll('[data-dot]').forEach(function (el) {
      el.className = 'dot ' + (st.open ? 'dot-open' : 'dot-closed');
    });
    document.querySelectorAll('.hrow').forEach(function (row) {
      var days = row.getAttribute('data-days').split(',').map(Number);
      row.classList.toggle('hrow-on', days.indexOf(st.day) !== -1);
    });
  }

  /* ---- products ---- */
  var ICON_PLUS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>';
  var ICON_MINUS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"></path></svg>';

  function chipsHtml(list, items, current, attr) {
    return list.map(function (f) {
      var count = f.id === 'todos' ? items.length : items.filter(function (x) { return x.cat === f.id; }).length;
      return '<button class="chip ' + (f.id === current ? 'chip-on' : '') + '" type="button" ' + attr + '="' + f.id + '">' + esc(f.label) + '<span class="chip-n fm">' + count + '</span></button>';
    }).join('');
  }

  function actionHtml(p) {
    var q = state.cart[p.id] || 0;
    if (!q) return '<button class="add" type="button" data-add="' + p.id + '">' + ICON_PLUS + 'Agregar al pedido</button>';
    return '<div class="stepper">' +
      '<button class="step-btn" type="button" data-dec="' + p.id + '" aria-label="Quitar uno">' + ICON_MINUS + '</button>' +
      '<span style="font-size: 14px; font-weight: 700">' + q + ' en tu pedido</span>' +
      '<button class="step-btn" type="button" data-inc="' + p.id + '" aria-label="Agregar uno">' + ICON_PLUS + '</button></div>';
  }

  function cardHtml(p) {
    var visual = p.img
      ? '<div class="ph"><img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy"></div>'
      : '<div class="sw ' + p.sw + '"><div class="sw-in"></div></div>';
    return '<article class="card" data-card="' + p.id + '">' +
      '<div class="media">' + (p.onOrder ? '<span class="on-order fm">A PEDIDO</span>' : '') + visual + '</div>' +
      '<div style="display: flex; flex-direction: column; gap: 8px; flex: 1; padding: 0 4px">' +
      '<span class="fm" style="font-size: 11px; letter-spacing: .14em; color: #7F948F">' + esc(p.code) + ' · ' + CAT_LABEL[p.cat] + '</span>' +
      '<h3 style="margin: 0; font-size: 19px; font-weight: 800; line-height: 1.2">' + esc(p.name) + '</h3>' +
      '<p style="margin: 0; font-size: 14px; color: #9FB2AD; line-height: 1.5">' + esc(p.desc) + '</p>' +
      '<div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: auto; padding-top: 6px">' +
      p.tags.map(function (t) { return '<span class="tag fm">' + esc(t) + '</span>'; }).join('') + '</div></div>' +
      '<div class="card-act">' + actionHtml(p) + '</div></article>';
  }

  function renderFilters() {
    $('#filters').innerHTML = chipsHtml(FILTERS, PRODUCTS, state.filter, 'data-filter');
  }

  function renderProducts() {
    $('#pgrid').innerHTML = PRODUCTS.filter(function (p) {
      return state.filter === 'todos' || p.cat === state.filter;
    }).map(cardHtml).join('');
  }

  function byId(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }

  function change(id, delta) {
    var n = Math.max(0, (state.cart[id] || 0) + delta);
    if (n === 0) delete state.cart[id]; else state.cart[id] = n;
    var card = document.querySelector('[data-card="' + id + '"] .card-act');
    if (card) card.innerHTML = actionHtml(byId(id));
    renderCart();
  }

  /* ---- cart ---- */
  function cartLines() {
    return PRODUCTS.filter(function (p) { return state.cart[p.id]; });
  }

  function cartCount() {
    return cartLines().reduce(function (a, p) { return a + state.cart[p.id]; }, 0);
  }

  function waCart() {
    var msg = 'Hola! Quiero pedir presupuesto por:\n' + cartLines().map(function (p) { return '• ' + p.name + ' x' + state.cart[p.id]; }).join('\n');
    return WA + '?text=' + encodeURIComponent(msg);
  }

  function lineHtml(p) {
    var visual = p.img
      ? '<div class="mini"><img src="' + esc(p.img) + '" alt=""></div>'
      : '<div class="mini sw ' + p.sw + '" style="height: 56px"><div class="sw-in"></div></div>';
    return '<div class="line">' + visual +
      '<div style="flex: 1; min-width: 0"><div style="font-weight: 700; font-size: 15px">' + esc(p.name) + '</div>' +
      '<div class="fm" style="font-size: 12px; color: #7F948F">' + (p.onOrder ? 'A pedido · precio a cotizar' : 'Precio a cotizar') + '</div></div>' +
      '<div class="stepper" style="min-height: 40px">' +
      '<button class="step-btn" type="button" data-dec="' + p.id + '" aria-label="Quitar uno"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"></path></svg></button>' +
      '<span style="min-width: 20px; text-align: center; font-weight: 700">' + state.cart[p.id] + '</span>' +
      '<button class="step-btn" type="button" data-inc="' + p.id + '" aria-label="Agregar uno"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg></button>' +
      '</div></div>';
  }

  // Refreshes the header badge and, when open, the drawer contents.
  function renderCart() {
    var count = cartCount();
    var badge = $('#cart-badge');
    badge.hidden = count === 0;
    badge.textContent = count;
    if (!$('#cart-lines')) return;
    $('#cart-count').textContent = count + ' PRODUCTOS';
    $('#cart-wa').href = waCart();
    $('#cart-lines').innerHTML = count === 0
      ? '<div style="padding: 64px 0; text-align: center; color: #9FB2AD; display: flex; flex-direction: column; gap: 16px; align-items: center">' +
        '<p style="margin: 0">Todavía no agregaste productos.</p>' +
        '<button class="btn btn-ghost" type="button" data-close-cart>Ver productos</button></div>'
      : cartLines().map(lineHtml).join('');
  }

  var ICON_CLOSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>';

  function openCart() {
    $('#cart-root').innerHTML =
      '<button class="scrim" type="button" data-close-cart aria-label="Cerrar mi pedido"></button>' +
      '<aside class="drawer" aria-label="Mi pedido">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(233,241,238,.08)">' +
      '<div><span class="fm" id="cart-count" style="font-size: 11px; letter-spacing: .16em; color: #9FB2AD"></span><h2 class="fd" style="margin: 2px 0 0; font-size: 40px; font-weight: 900; line-height: 1">Mi pedido</h2></div>' +
      '<button class="icon-btn" type="button" data-close-cart aria-label="Cerrar">' + ICON_CLOSE + '</button></div>' +
      '<div id="cart-lines" style="flex: 1; overflow-y: auto; padding: 4px 24px"></div>' +
      '<div style="padding: 20px 24px 24px; border-top: 1px solid rgba(233,241,238,.08); display: flex; flex-direction: column; gap: 12px">' +
      '<p style="margin: 0; font-size: 13px; color: #9FB2AD">Por ahora te cotizamos por WhatsApp. Muy pronto vas a poder pagar online desde acá.</p>' +
      '<a class="btn btn-primary" id="cart-wa" href="#" target="_blank" rel="noopener" style="width: 100%">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 12a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.1-4.3A8.5 8.5 0 1 1 20.5 12z"></path></svg>' +
      'Enviar pedido por WhatsApp</a>' +
      '<a class="btn btn-ghost" href="tienda.html" style="width: 100%">Ir a la tienda</a></div></aside>';
    renderCart();
  }

  function closeCart() { $('#cart-root').innerHTML = ''; }

  /* ---- gallery + lightbox ---- */
  function galItems() {
    return GALLERY.filter(function (g) { return state.galFilter === 'todos' || g.cat === state.galFilter; });
  }

  function renderGalFilters() {
    $('#gfilters').innerHTML = chipsHtml(GAL_FILTERS, GALLERY, state.galFilter, 'data-gfilter');
  }

  function renderGallery() {
    $('#gal').innerHTML = galItems().map(function (g, i) {
      var media = g.video
        ? '<video src="' + esc(g.src) + '" autoplay muted loop playsinline preload="metadata"></video><span class="gi-video fm">VIDEO</span>'
        : '<img src="' + esc(g.src) + '" alt="' + esc(g.cap) + '" loading="lazy">';
      return '<button class="gi" type="button" data-open="' + i + '" aria-label="Ampliar: ' + esc(g.cap) + '">' + media +
        '<span class="gi-cap"><span>' + esc(g.cap) + '</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg></span></button>';
    }).join('');
    keepPlaying($('#gal'));
  }

  // Muted autoplay can be skipped for injected video; nudge it.
  function keepPlaying(root) {
    root.querySelectorAll('video').forEach(function (v) {
      v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
  }

  function renderLightbox() {
    var root = $('#lb-root');
    var items = galItems();
    if (state.lb < 0 || !items.length) { root.innerHTML = ''; return; }
    var n = items.length;
    var idx = Math.min(state.lb, n - 1);
    var g = items[idx];
    var media = g.video
      ? '<video src="' + esc(g.src) + '" controls autoplay muted loop playsinline></video>'
      : '<img src="' + esc(g.src) + '" alt="' + esc(g.cap) + '">';
    root.innerHTML = '<div class="lb" role="dialog" aria-label="' + esc(g.cap) + '">' + media +
      '<div style="display: flex; align-items: center; gap: 14px; color: #E9F1EE"><span class="fm" style="font-size: 12px; color: #9FB2AD">' + pad(idx + 1) + ' / ' + pad(n) + '</span><span style="font-weight: 700">' + esc(g.cap) + '</span></div>' +
      '<button class="icon-btn lb-nav" style="left: 20px" type="button" data-lb="prev" aria-label="Anterior"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg></button>' +
      '<button class="icon-btn lb-nav" style="right: 20px" type="button" data-lb="next" aria-label="Siguiente"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button>' +
      '<button class="icon-btn" style="position: absolute; top: 20px; right: 20px" type="button" data-lb="close" aria-label="Cerrar">' + ICON_CLOSE + '</button></div>';
    keepPlaying(root);
  }

  /* ---- events ---- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-filter],[data-gfilter],[data-add],[data-inc],[data-dec],[data-open],[data-lb],[data-close-cart],#open-cart');
    if (!t) return;
    if (t.id === 'open-cart') return openCart();
    if (t.hasAttribute('data-close-cart')) return closeCart();
    if (t.hasAttribute('data-filter')) {
      state.filter = t.getAttribute('data-filter');
      renderFilters();
      return renderProducts();
    }
    if (t.hasAttribute('data-gfilter')) {
      state.galFilter = t.getAttribute('data-gfilter');
      state.lb = -1;
      renderGalFilters();
      renderGallery();
      return renderLightbox();
    }
    if (t.hasAttribute('data-add') || t.hasAttribute('data-inc')) return change(t.getAttribute('data-add') || t.getAttribute('data-inc'), 1);
    if (t.hasAttribute('data-dec')) return change(t.getAttribute('data-dec'), -1);
    if (t.hasAttribute('data-open')) {
      state.lb = parseInt(t.getAttribute('data-open'), 10);
      return renderLightbox();
    }
    var n = galItems().length || 1;
    var dir = t.getAttribute('data-lb');
    if (dir === 'prev') state.lb = (state.lb - 1 + n) % n;
    else if (dir === 'next') state.lb = (state.lb + 1) % n;
    else state.lb = -1;
    renderLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (state.lb >= 0) { state.lb = -1; renderLightbox(); } else closeCart();
  });

  /* ---- init ---- */
  var years = yearsSince(FOUNDED);
  document.querySelectorAll('.js-years').forEach(function (el) { el.textContent = years; });
  renderFilters();
  renderProducts();
  renderGalFilters();
  renderGallery();
  renderCart();
  renderStatus();
  setInterval(renderStatus, 30000);
})();
