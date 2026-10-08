/* Shop preview: catalogue filters, search, product configurator and cart. */
(function () {
  var state = { filter: 'todos', query: '', sort: 'feat', sel: null, w: '100', h: '60', qty: '1', install: true, cart: [], seq: 0 };

  var $ = function (s) { return document.querySelector(s); };

  function toNum(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function fmtArea(a) { return a.toFixed(2).replace('.', ',') + ' m²'; }
  function byId(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }

  function priceLabel(p) { return p.onOrder ? 'A pedido' : p.unit === 'm2' ? '[PRECIO]' : 'Consultar'; }
  function unitLabel(p) { return p.unit === 'm2' ? 'por m²' : 'por unidad'; }

  var ICON_CLOSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>';

  /* ---- catalogue ---- */
  function renderCats() {
    $('#cats').innerHTML = FILTERS.map(function (f) {
      var count = f.id === 'todos' ? PRODUCTS.length : PRODUCTS.filter(function (p) { return p.cat === f.id; }).length;
      return '<button class="cat ' + (f.id === state.filter ? 'cat-on' : '') + '" type="button" data-cat="' + f.id + '"><span>' + esc(f.label) + '</span><span class="fm" style="font-size: 12px; opacity: .6">' + count + '</span></button>';
    }).join('');
  }

  function cardHtml(p) {
    var visual = p.img
      ? '<div class="ph"><img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy"></div>'
      : '<div class="sw ' + p.sw + '"><div class="sw-in"></div></div>';
    return '<article class="card"><div class="media">' + (p.onOrder ? '<span class="on-order fm">A PEDIDO</span>' : '') + visual + '</div>' +
      '<div style="display: flex; flex-direction: column; gap: 6px; flex: 1; padding: 0 4px">' +
      '<span class="fm" style="font-size: 11px; letter-spacing: .14em; color: #7F948F">' + esc(p.code) + ' · ' + CAT_LABEL[p.cat] + '</span>' +
      '<h2 style="margin: 0; font-size: 19px; font-weight: 800; line-height: 1.2">' + esc(p.name) + '</h2>' +
      '<p style="margin: 0; font-size: 14px; color: #9FB2AD; line-height: 1.5">' + esc(p.desc) + '</p></div>' +
      '<div class="price" style="padding-left: 4px; padding-right: 4px"><span class="fm" style="font-size: 15px; font-weight: 500">' + priceLabel(p) + '</span>' +
      '<span class="fm" style="font-size: 12px; color: #7F948F">' + unitLabel(p) + '</span></div>' +
      '<button class="cfg-btn" type="button" data-cfg="' + p.id + '">Configurar y agregar</button></article>';
  }

  function renderList() {
    var q = state.query.trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      return (state.filter === 'todos' || p.cat === state.filter) && (!q || (p.name + ' ' + p.desc).toLowerCase().indexOf(q) !== -1);
    });
    if (state.sort === 'az') list = list.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });
    $('#pgrid').innerHTML = list.map(cardHtml).join('');
    $('#no-results').hidden = list.length !== 0;
    $('#result').textContent = list.length + (list.length === 1 ? ' producto' : ' productos');
    $('#sort-feat').classList.toggle('seg-on', state.sort === 'feat');
    $('#sort-az').classList.toggle('seg-on', state.sort === 'az');
  }

  /* ---- configurator ---- */
  function cfgValues() {
    var p = byId(state.sel);
    var isArea = p.unit === 'm2';
    var w = toNum(state.w), h = toNum(state.h), qty = Math.max(0, Math.floor(toNum(state.qty)));
    var area = isArea ? (w * h / 10000) * qty : 0;
    var invalid = qty < 1 || (isArea && (w <= 0 || h <= 0));
    return { p: p, isArea: isArea, w: w, h: h, qty: qty, area: area, invalid: invalid };
  }

  function updateCfg() {
    var v = cfgValues();
    var area = $('#cfg-area');
    if (area) area.textContent = fmtArea(v.area);
    $('#cfg-add').disabled = v.invalid;
  }

  function openCfg(id) {
    state.sel = id;
    state.w = '100'; state.h = '60'; state.qty = '1'; state.install = true;
    var p = byId(id);
    var isArea = p.unit === 'm2';
    var visual = p.img
      ? '<div class="ph" style="height: 200px"><img src="' + esc(p.img) + '" alt="' + esc(p.name) + '"></div>'
      : '<div class="sw ' + p.sw + '" style="height: 180px"><div class="sw-in"></div></div>';
    $('#cfg-root').innerHTML =
      '<button class="scrim" type="button" data-close-cfg aria-label="Cerrar"></button>' +
      '<aside class="drawer" aria-label="Configurar producto">' +
      '<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 20px 24px; border-bottom: 1px solid rgba(233,241,238,.08)">' +
      '<div><span class="fm" style="font-size: 11px; letter-spacing: .16em; color: #9FB2AD">' + esc(p.code) + ' · ' + CAT_LABEL[p.cat] + '</span><h2 class="fd" style="margin: 2px 0 0; font-size: 40px; font-weight: 900; line-height: 1">' + esc(p.name) + '</h2></div>' +
      '<button class="icon-btn" type="button" data-close-cfg aria-label="Cerrar">' + ICON_CLOSE + '</button></div>' +
      '<div style="flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px">' + visual +
      (p.onOrder ? '<p class="fm" style="margin: 0; font-size: 13px; color: #F2C14E">Se fabrica solo a pedido: te confirmamos plazo al cotizar.</p>' : '') +
      '<p style="margin: 0; color: #9FB2AD; font-size: 15px">' + esc(p.desc) + '</p>' +
      (isArea
        ? '<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">' +
          '<div class="field"><label for="cfg-w">Ancho (cm)</label><input id="cfg-w" type="number" min="1" inputmode="numeric" value="' + state.w + '" data-cfg-field="w"></div>' +
          '<div class="field"><label for="cfg-h">Alto (cm)</label><input id="cfg-h" type="number" min="1" inputmode="numeric" value="' + state.h + '" data-cfg-field="h"></div></div>'
        : '') +
      '<div class="field"><label for="cfg-q">Cantidad</label><input id="cfg-q" type="number" min="1" inputmode="numeric" value="' + state.qty + '" data-cfg-field="qty"></div>' +
      '<label class="check"><input type="checkbox" checked data-cfg-install>Con colocación</label>' +
      '<div style="background: #121B1E; border: 1px solid rgba(233,241,238,.08); border-radius: 14px; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px">' +
      (isArea ? '<div class="sum"><span>Superficie total</span><span class="fm" id="cfg-area"></span></div>' : '') +
      '<div class="sum"><span>Precio</span><span class="fm">' + priceLabel(p) + ' ' + unitLabel(p) + '</span></div>' +
      '<div class="sum" style="color: #E9F1EE; font-weight: 700; padding-top: 10px; border-top: 1px solid rgba(233,241,238,.08)"><span>Total estimado</span><span class="fm">[TOTAL]</span></div>' +
      '</div></div>' +
      '<div style="padding: 20px 24px 24px; border-top: 1px solid rgba(233,241,238,.08)">' +
      '<button class="btn btn-primary" id="cfg-add" type="button" style="width: 100%">Agregar al carrito</button></div></aside>';
    updateCfg();
  }

  function closeCfg() { state.sel = null; $('#cfg-root').innerHTML = ''; }

  function addToCart() {
    if (!state.sel) return;
    var v = cfgValues();
    if (v.invalid) return;
    state.seq++;
    state.cart.push({ key: state.seq, id: v.p.id, name: v.p.name, sw: v.p.sw, img: v.p.img, isArea: v.isArea, w: v.w, h: v.h, qty: v.qty, area: v.area, install: state.install });
    closeCfg();
    openCart();
  }

  /* ---- cart ---- */
  function cartCount() { return state.cart.reduce(function (a, l) { return a + l.qty; }, 0); }

  function waCart() {
    var msg = 'Hola! Quiero pedir presupuesto por:\n' + state.cart.map(function (l) {
      return '• ' + l.name + ' — ' + (l.isArea ? (l.w + '×' + l.h + ' cm, ' + l.qty + ' u') : (l.qty + ' u')) + (l.install ? ', con colocación' : '');
    }).join('\n');
    return WA + '?text=' + encodeURIComponent(msg);
  }

  function lineHtml(l) {
    var visual = l.img
      ? '<div class="mini"><img src="' + esc(l.img) + '" alt=""></div>'
      : '<div class="mini sw ' + l.sw + '" style="height: 56px"><div class="sw-in"></div></div>';
    var detail = l.isArea ? (l.w + ' × ' + l.h + ' cm · ' + l.qty + ' u · ' + fmtArea(l.area)) : (l.qty + ' u');
    return '<div class="line">' + visual + '<div style="flex: 1; min-width: 0">' +
      '<div style="font-weight: 700; font-size: 15px">' + esc(l.name) + '</div>' +
      '<div class="fm" style="font-size: 12px; color: #9FB2AD">' + esc(detail) + '</div>' +
      '<div class="fm" style="font-size: 12px; color: #7F948F">' + (l.install ? 'Con colocación' : 'Sin colocación') + '</div></div>' +
      '<button class="rm" type="button" data-remove="' + l.key + '" aria-label="Quitar del carrito"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"></path></svg></button></div>';
  }

  function renderCart() {
    var count = cartCount();
    var badge = $('#cart-badge');
    badge.hidden = count === 0;
    badge.textContent = count;
    if (!$('#cart-lines')) return;
    $('#cart-count').textContent = count + ' PRODUCTOS';
    $('#cart-wa').href = waCart();
    $('#cart-lines').innerHTML = state.cart.length === 0
      ? '<p style="padding: 64px 0; margin: 0; text-align: center; color: #9FB2AD">Tu carrito está vacío.</p>'
      : state.cart.map(lineHtml).join('');
  }

  function openCart() {
    $('#cart-root').innerHTML =
      '<button class="scrim" type="button" data-close-cart aria-label="Cerrar carrito"></button>' +
      '<aside class="drawer" aria-label="Carrito">' +
      '<div style="padding: 20px 24px; border-bottom: 1px solid rgba(233,241,238,.08); display: flex; flex-direction: column; gap: 16px">' +
      '<div style="display: flex; justify-content: space-between; align-items: center">' +
      '<div><span class="fm" id="cart-count" style="font-size: 11px; letter-spacing: .16em; color: #9FB2AD"></span><h2 class="fd" style="margin: 2px 0 0; font-size: 40px; font-weight: 900; line-height: 1">Carrito</h2></div>' +
      '<button class="icon-btn" type="button" data-close-cart aria-label="Cerrar">' + ICON_CLOSE + '</button></div>' +
      '<div class="flow fm" aria-label="Pasos de compra">' +
      '<div class="flow-step flow-on"><span class="flow-bar"></span>1 CARRITO</div>' +
      '<div class="flow-step"><span class="flow-bar"></span>2 DATOS</div>' +
      '<div class="flow-step"><span class="flow-bar"></span>3 ENVÍO</div>' +
      '<div class="flow-step"><span class="flow-bar"></span>4 PAGO</div></div></div>' +
      '<div id="cart-lines" style="flex: 1; overflow-y: auto; padding: 4px 24px"></div>' +
      '<div style="padding: 20px 24px 24px; border-top: 1px solid rgba(233,241,238,.08); display: flex; flex-direction: column; gap: 12px">' +
      '<div class="sum"><span>Subtotal</span><span class="fm">[SUBTOTAL]</span></div>' +
      '<div class="sum"><span>Envío o retiro</span><span class="fm">Se calcula después</span></div>' +
      '<button class="btn btn-primary" type="button" disabled style="width: 100%">Continuar compra · próximamente</button>' +
      '<a class="btn btn-ghost" id="cart-wa" href="#" target="_blank" rel="noopener" style="width: 100%">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 12a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.1-4.3A8.5 8.5 0 1 1 20.5 12z"></path></svg>' +
      'Pedir presupuesto por WhatsApp</a></div></aside>';
    renderCart();
  }

  function closeCart() { $('#cart-root').innerHTML = ''; }

  /* ---- events ---- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-cat],[data-sort],[data-cfg],[data-close-cfg],[data-close-cart],[data-remove],#cfg-add,#open-cart');
    if (!t) return;
    if (t.id === 'open-cart') return openCart();
    if (t.id === 'cfg-add') return addToCart();
    if (t.hasAttribute('data-close-cart')) return closeCart();
    if (t.hasAttribute('data-close-cfg')) return closeCfg();
    if (t.hasAttribute('data-cfg')) return openCfg(t.getAttribute('data-cfg'));
    if (t.hasAttribute('data-sort')) {
      state.sort = t.getAttribute('data-sort');
      return renderList();
    }
    if (t.hasAttribute('data-cat')) {
      state.filter = t.getAttribute('data-cat');
      renderCats();
      return renderList();
    }
    var key = parseInt(t.getAttribute('data-remove'), 10);
    state.cart = state.cart.filter(function (x) { return x.key !== key; });
    renderCart();
  });

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'q') {
      state.query = t.value;
      return renderList();
    }
    if (t.hasAttribute('data-cfg-field')) {
      state[t.getAttribute('data-cfg-field')] = t.value;
      return updateCfg();
    }
    if (t.hasAttribute('data-cfg-install')) {
      state.install = t.checked;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeCfg();
    closeCart();
  });

  renderCats();
  renderList();
  renderCart();
})();
