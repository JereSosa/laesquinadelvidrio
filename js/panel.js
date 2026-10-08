/* Team panel (demo): edits live in memory only and are lost on reload. */
(function () {
  var ICONS = {
    trabajos: 'M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5',
    productos: 'M4 7l8-4 8 4-8 4-8-4zM4 7v10l8 4 8-4V7M12 11v10',
    horarios: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
    textos: 'M5 5h14M12 5v14M8 19h8',
    usuarios: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 21a6 6 0 0 0-4-5.6',
    pedidos: 'M5 8h14l-1.2 12H6.2L5 8zM9 8a3 3 0 0 1 6 0'
  };
  var SECTIONS = {
    trabajos: { label: 'Trabajos', kicker: 'GALERÍA', title: 'Trabajos realizados', desc: 'Subí fotos y videos nuevos, cambiá una foto, ordená la galería y elegí qué se ve en la web.' },
    productos: { label: 'Productos', kicker: 'CATÁLOGO', title: 'Productos', desc: 'Nombre, descripción y foto de cada producto. Marcá los que se hacen solo a pedido.' },
    horarios: { label: 'Horarios', kicker: 'LOCAL', title: 'Horarios', desc: 'El horario de atención que muestra la web, con feriados y fechas especiales.' },
    textos: { label: 'Textos del sitio', kicker: 'CONTENIDO', title: 'Textos del sitio', desc: 'Lo que dice la portada, la sección Nosotros y los datos de contacto.' },
    usuarios: { label: 'Usuarios', kicker: 'EQUIPO', title: 'Usuarios', desc: 'Quién puede entrar al panel y qué puede hacer.' },
    pedidos: { label: 'Pedidos', kicker: 'TIENDA', title: 'Pedidos', desc: 'Los pedidos de la tienda online, cuando esté activa.' }
  };
  var NAV_ORDER = ['trabajos', 'productos', 'horarios', 'textos', 'usuarios', 'pedidos'];
  var WORK_IDS = ['w1', 'w2', 'w3', 'w15', 'w16', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10', 'w11', 'w12', 'w13', 'w14'];
  var PROD_IDS = ['float', 'semiespejado', 'templado', 'espejos', 'mampara', 'aberturas', 'alveolar', 'compacto'];
  var CATS = [['banos', 'Baños'], ['espejos', 'Espejos y muebles'], ['cerramientos', 'Cerramientos'], ['frentes', 'Frentes y aberturas']];
  var DAYS = [
    { name: 'Lunes', open: true, m1: '08:00', m2: '13:00', hasT: true, t1: '15:00', t2: '19:00' },
    { name: 'Martes', open: true, m1: '08:00', m2: '13:00', hasT: true, t1: '15:00', t2: '19:00' },
    { name: 'Miércoles', open: true, m1: '08:00', m2: '13:00', hasT: true, t1: '15:00', t2: '19:00' },
    { name: 'Jueves', open: true, m1: '08:00', m2: '13:00', hasT: true, t1: '15:00', t2: '19:00' },
    { name: 'Viernes', open: true, m1: '08:00', m2: '13:00', hasT: true, t1: '15:00', t2: '19:00' },
    { name: 'Sábado', open: true, m1: '08:00', m2: '13:00', hasT: false, t1: '15:00', t2: '19:00' },
    { name: 'Domingo', open: false, m1: '08:00', m2: '13:00', hasT: false, t1: '15:00', t2: '19:00' }
  ];

  var S = {
    section: 'trabajos',
    works: GALLERY.map(function (g, i) {
      return { id: WORK_IDS[i], src: '../' + g.src, cat: g.cat, cap: g.cap, video: !!g.video, visible: true, isNew: false };
    }),
    workFilter: 'todos',
    prods: PROD_IDS.map(function (id) {
      var p = PRODUCTS.filter(function (x) { return x.id === id; })[0];
      return { id: p.id, img: p.img ? '../' + p.img : '', code: p.code, name: p.name, desc: p.desc, visible: true, onOrder: !!p.onOrder };
    }),
    days: DAYS.map(function (d) { return Object.assign({}, d); }),
    specials: [{ id: 's1', date: '2026-12-25', label: 'Navidad' }],
    newDate: '', newLabel: '',
    texts: {
      hero: 'Vidrio a medida y colocado.',
      sub: 'Provisión y colocación de vidrios, espejos, DVH, mamparas y aberturas de aluminio. Atención personalizada en 25 de Mayo 634.',
      quote: 'Calidad y seguridad en cada uno de los productos que ofrecemos.',
      about: 'Somos La Esquina del Vidrio. Trabajamos en el rubro desde el 25 de mayo de 1992, resolviendo cada pedido con responsabilidad y una atención personalizada.',
      since: '1992-05-25',
      wa: '(02657) 525026', tel: '(02657) 420458', mail: 'laesquinadelvidriosrl@gmail.com', addr: '25 de Mayo 634, Villa Mercedes, San Luis'
    },
    users: [
      { id: 'u1', name: 'Administrador', email: 'laesquinadelvidriosrl@gmail.com', role: 'admin', status: 'ok', you: true },
      { id: 'u2', name: '[Nombre del empleado]', email: '[email del empleado]', role: 'editor', status: 'pend' }
    ],
    invEmail: '', invRole: 'editor',
    dirty: false, seq: 100
  };
  var toastTimer;

  var $ = function (s) { return document.querySelector(s); };

  /* ---- helpers ---- */
  function hm(t) { return (t || '').replace(/^0/, ''); }
  function dayVal(d) {
    if (!d.open) return 'Cerrado';
    return hm(d.m1) + '–' + hm(d.m2) + (d.hasT ? ' · ' + hm(d.t1) + '–' + hm(d.t2) : '');
  }
  function groupDays(days) {
    var out = [];
    days.forEach(function (d) {
      var v = dayVal(d);
      var last = out[out.length - 1];
      if (last && last.val === v) last.to = d.name; else out.push({ from: d.name, to: null, val: v, count: 1 });
      if (last && last.val === v) last.count++;
    });
    return out.map(function (g) {
      var label = !g.to ? g.from : (g.count === 2 ? g.from + ' y ' + g.to.toLowerCase() : g.from + ' a ' + g.to.toLowerCase());
      return { label: label, val: g.val };
    });
  }
  function yearsSince(iso) {
    var p = (iso || '').split('-').map(function (x) { return parseInt(x, 10); });
    if (p.length < 3 || isNaN(p[0])) return 0;
    var now = new Date();
    var y = now.getFullYear() - p[0];
    var m = now.getMonth() + 1;
    if (m < p[1] || (m === p[1] && now.getDate() < p[2])) y--;
    return Math.max(0, y);
  }
  function fmtDate(iso) { var p = (iso || '').split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso; }
  function initials(name, email) {
    var src = (name && name.indexOf('[') !== 0) ? name : email;
    return (src || '?').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, ' ').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase() || '?';
  }
  function find(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function checked(v) { return v ? ' checked' : ''; }
  function selected(a, b) { return a === b ? ' selected' : ''; }

  var SVG_TRASH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"></path></svg>';
  var SVG_X = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>';

  /* ---- chrome: nav, heading, publish state ---- */
  function renderNav() {
    $('#nav').innerHTML = NAV_ORDER.map(function (id) {
      var count = id === 'trabajos' ? S.works.length : id === 'productos' ? S.prods.length : id === 'usuarios' ? S.users.length : null;
      return '<button class="nav ' + (id === S.section ? 'nav-on' : '') + '" type="button" data-act="nav" data-s="' + id + '">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + ICONS[id] + '"></path></svg>' +
        esc(SECTIONS[id].label) +
        (count !== null ? '<span class="nav-count fm">' + count + '</span>' : '') +
        (id === 'pedidos' ? '<span class="psoon fm">PRONTO</span>' : '') + '</button>';
    }).join('');
  }

  function renderHead() {
    var m = SECTIONS[S.section];
    $('#kicker').textContent = 'PANEL · ' + m.kicker;
    $('#title').textContent = m.title;
    $('#desc').textContent = m.desc;
    updateDirty();
  }

  function updateDirty() {
    $('#dirty').hidden = !S.dirty;
    $('#publish').disabled = !S.dirty;
  }

  function mark() { S.dirty = true; updateDirty(); }

  /* ---- sections ---- */
  function worksHtml() {
    var visible = S.works.filter(function (w) { return w.visible; }).length;
    var list = S.works.filter(function (w) { return S.workFilter === 'todos' || w.cat === S.workFilter; });
    var filters = [['todos', 'Todos']].concat(CATS);
    return '<label class="drop" for="up"><span class="drop-ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5"></path><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"></path></svg></span>' +
      '<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-weight: 800; font-size: 17px">Subí fotos o videos de trabajos nuevos</span><span style="color: #9FB2AD; font-size: 14px">Tocá para elegir desde el celular o la compu · JPG, PNG o MP4</span></span></label>' +
      '<input id="up" class="sr" type="file" accept="image/*,video/*" multiple data-k="upload">' +
      '<div class="row" style="justify-content: space-between; margin-bottom: 18px; gap: 14px">' +
      '<div class="pchips" role="group" aria-label="Filtrar trabajos">' + filters.map(function (f) {
        return '<button class="pchip ' + (f[0] === S.workFilter ? 'pchip-on' : '') + '" type="button" data-act="wfilter" data-f="' + f[0] + '">' + f[1] + '</button>';
      }).join('') + '</div>' +
      '<span class="fm" style="font-size: 12px; color: #9FB2AD">' + S.works.length + ' trabajos · ' + visible + ' visibles en la web</span></div>' +
      '<div class="wgrid">' + list.map(workHtml).join('') + '</div>';
  }

  function workHtml(w) {
    var id = esc(w.id);
    var media = w.video
      ? '<video src="' + esc(w.src) + '" muted loop autoplay playsinline preload="metadata"></video><span class="flag flag-video fm">VIDEO</span>'
      : '<img src="' + esc(w.src) + '" alt="' + esc(w.cap) + '" loading="lazy">';
    return '<article class="wcard ' + (w.visible ? '' : 'wcard-off') + '"><div class="thumb">' + media +
      (w.isNew ? '<span class="flag flag-new fm">NUEVO</span>' : '') +
      (w.visible ? '' : '<span class="flag flag-off fm">OCULTO EN LA WEB</span>') + '</div>' +
      '<div class="wbody">' +
      '<label class="sr" for="cap-' + id + '">Descripción del trabajo</label>' +
      '<input id="cap-' + id + '" class="pinp" type="text" value="' + esc(w.cap) + '" placeholder="Describí el trabajo" data-k="w-cap" data-id="' + id + '">' +
      '<label class="sr" for="cat-' + id + '">Categoría</label>' +
      '<select id="cat-' + id + '" class="sel" data-k="w-cat" data-id="' + id + '">' + CATS.map(function (c) {
        return '<option value="' + c[0] + '"' + selected(w.cat, c[0]) + '>' + c[1] + '</option>';
      }).join('') + '</select>' +
      '<div class="row" style="justify-content: space-between">' +
      '<label class="switch"><input type="checkbox"' + checked(w.visible) + ' data-k="w-vis" data-id="' + id + '"><span class="track"></span>Visible</label>' +
      '<div class="row" style="gap: 6px">' +
      '<button class="ibtn" type="button" data-act="w-up" data-id="' + id + '" aria-label="Mover antes"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg></button>' +
      '<button class="ibtn" type="button" data-act="w-down" data-id="' + id + '" aria-label="Mover después"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button>' +
      '<label class="ibtn" for="rep-' + id + '" title="Cambiar foto" style="cursor: pointer"><span class="sr">Cambiar foto</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h3l2-3h6l2 3h3v12H4z"></path><circle cx="12" cy="13" r="3.5"></circle></svg></label>' +
      '<input id="rep-' + id + '" class="sr" type="file" accept="image/*,video/*" data-k="w-rep" data-id="' + id + '">' +
      '<button class="ibtn ibtn-danger" type="button" data-act="w-remove" data-id="' + id + '" aria-label="Eliminar trabajo">' + SVG_TRASH + '</button>' +
      '</div></div></div></article>';
  }

  function prodsHtml() {
    return '<div style="display: flex; flex-direction: column; gap: 12px">' + S.prods.map(function (p) {
      var id = esc(p.id);
      return '<article class="prow"><div style="display: flex; flex-direction: column; gap: 8px">' +
        '<div class="pthumb">' + (p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '">' : '<span class="fm" style="font-size: 11px; letter-spacing: .1em">SIN FOTO</span>') + '</div>' +
        '<label class="repl" for="pimg-' + id + '" style="justify-content: center">' + (p.img ? 'Cambiar foto' : 'Subir foto') + '</label>' +
        '<input id="pimg-' + id + '" class="sr" type="file" accept="image/*" data-k="p-img" data-id="' + id + '"></div>' +
        '<div style="display: flex; flex-direction: column; gap: 10px; min-width: 0">' +
        '<div class="row" style="gap: 10px"><span class="fm" style="font-size: 11px; letter-spacing: .14em; color: #7F948F">' + esc(p.code) + '</span>' +
        (p.onOrder ? '<span class="status st-pend fm">A PEDIDO</span>' : '') + (p.visible ? '' : '<span class="status st-pend fm">OCULTO</span>') + '</div>' +
        '<label class="sr" for="pn-' + id + '">Nombre</label>' +
        '<input id="pn-' + id + '" class="pinp" type="text" value="' + esc(p.name) + '" style="font-weight: 700; font-size: 16px" data-k="p-name" data-id="' + id + '">' +
        '<label class="sr" for="pd-' + id + '">Descripción</label>' +
        '<textarea id="pd-' + id + '" class="area" data-k="p-desc" data-id="' + id + '">' + esc(p.desc) + '</textarea></div>' +
        '<div style="display: flex; flex-direction: column; gap: 4px">' +
        '<label class="switch"><input type="checkbox"' + checked(p.visible) + ' data-k="p-vis" data-id="' + id + '"><span class="track"></span>Visible en la web</label>' +
        '<label class="switch"><input type="checkbox"' + checked(p.onOrder) + ' data-k="p-ord" data-id="' + id + '"><span class="track"></span>Solo a pedido</label>' +
        '<label class="lbl" for="pp-' + id + '" style="margin-top: 6px">Precio</label>' +
        '<input id="pp-' + id + '" class="pinp" type="text" disabled placeholder="Se habilita con la tienda online"></div></article>';
    }).join('') + '</div>';
  }

  function previewHtml() {
    return '<span class="fm" style="font-size: 11px; letter-spacing: .16em; color: #7F948F">ASÍ SE VE EN LA WEB</span>' +
      groupDays(S.days).map(function (r) {
        return '<div class="prev-row"><span style="font-weight: 600">' + esc(r.label) + '</span><span class="fm" style="font-size: 13px; color: #C9D6D2; text-align: right">' + esc(r.val) + '</span></div>';
      }).join('') +
      '<p style="margin: 10px 0 0; font-size: 13px; color: #9FB2AD">El cartel “Abierto ahora / Cerrado” y la cuenta regresiva de la portada usan este horario.</p>';
  }

  function dayHtml(d, i) {
    var n = esc(d.name);
    var head = '<span style="font-weight: 700">' + n + '</span>' +
      '<label class="switch"><input type="checkbox"' + checked(d.open) + ' data-k="d-open" data-i="' + i + '"><span class="track"></span><span class="sr">Abierto el ' + n + '</span></label>';
    if (!d.open) return '<div class="drow">' + head + '<span style="font-size: 13px; color: #7F948F">Cerrado</span><span></span></div>';
    return '<div class="drow">' + head +
      '<div class="shift"><input class="time" type="time" value="' + d.m1 + '" data-k="d-m1" data-i="' + i + '" aria-label="' + n + ', mañana desde"><span style="color: #7F948F">–</span><input class="time" type="time" value="' + d.m2 + '" data-k="d-m2" data-i="' + i + '" aria-label="' + n + ', mañana hasta"></div>' +
      '<div class="shift"><label class="switch" style="min-height: 40px"><input type="checkbox"' + checked(d.hasT) + ' data-k="d-hasT" data-i="' + i + '"><span class="track"></span><span class="sr">Abre a la tarde el ' + n + '</span></label>' +
      (d.hasT
        ? '<input class="time" type="time" value="' + d.t1 + '" data-k="d-t1" data-i="' + i + '" aria-label="' + n + ', tarde desde"><span style="color: #7F948F">–</span><input class="time" type="time" value="' + d.t2 + '" data-k="d-t2" data-i="' + i + '" aria-label="' + n + ', tarde hasta">'
        : '<span style="font-size: 13px; color: #7F948F">Sin turno tarde</span>') + '</div></div>';
  }

  function horariosHtml() {
    return '<div class="hgrid"><div class="pcard">' +
      '<div class="row" style="justify-content: space-between; margin-bottom: 6px"><h2 style="margin: 0; font-size: 18px">Horario semanal</h2>' +
      '<button class="pbtn pbtn-ghost" type="button" data-act="copy-monday" style="min-height: 40px; font-size: 13px">Copiar lunes a días hábiles</button></div>' +
      '<div class="drow fm" style="font-size: 11px; letter-spacing: .14em; color: #7F948F; padding-bottom: 8px"><span>DÍA</span><span>ABIERTO</span><span>MAÑANA</span><span>TARDE</span></div>' +
      S.days.map(dayHtml).join('') +
      '<h2 style="margin: 28px 0 6px; font-size: 18px">Fechas especiales</h2>' +
      '<p style="margin: 0 0 14px; color: #9FB2AD; font-size: 14px">Feriados, vacaciones o días con otro horario. La web avisa en esas fechas.</p>' +
      '<div id="specials">' + specialsHtml() + '</div>' +
      '<div class="row" style="margin-top: 14px; gap: 10px">' +
      '<label class="sr" for="nd">Fecha</label><input id="nd" class="time" type="date" value="' + esc(S.newDate) + '" data-k="nd" style="width: auto; min-height: 44px">' +
      '<label class="sr" for="nl">Motivo</label><input id="nl" class="pinp" type="text" value="' + esc(S.newLabel) + '" placeholder="Motivo (ej. feriado)" data-k="nl" style="flex: 1; min-width: 160px">' +
      '<button class="pbtn pbtn-ghost" type="button" data-act="add-special">Agregar</button></div></div>' +
      '<div class="pcard" id="preview" style="display: flex; flex-direction: column; gap: 6px">' + previewHtml() + '</div></div>';
  }

  function specialsHtml() {
    return S.specials.map(function (sp) {
      return '<div class="row" style="justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(233,241,238,.06)">' +
        '<span class="row" style="gap: 12px"><span class="fm" style="font-size: 13px">' + esc(fmtDate(sp.date)) + '</span><span style="font-weight: 600">' + esc(sp.label) + '</span><span class="status st-pend fm">CERRADO</span></span>' +
        '<button class="ibtn ibtn-danger" type="button" data-act="rm-special" data-id="' + esc(sp.id) + '" aria-label="Quitar fecha">' + SVG_X + '</button></div>';
    }).join('');
  }

  function textosHtml() {
    var t = S.texts;
    var field = function (label, id, key, type) {
      return '<div style="display: flex; flex-direction: column; gap: 6px"><label class="lbl" for="' + id + '">' + label + '</label><input id="' + id + '" class="pinp" type="' + type + '" value="' + esc(t[key]) + '" data-k="t" data-t="' + key + '"></div>';
    };
    return '<div class="tgrid">' +
      '<div class="pcard" style="display: flex; flex-direction: column; gap: 14px"><h2 style="margin: 0; font-size: 18px">Portada</h2>' +
      '<label class="lbl" for="t-hero">Título principal</label><textarea id="t-hero" class="area" data-k="t" data-t="hero">' + esc(t.hero) + '</textarea>' +
      '<label class="lbl" for="t-sub">Bajada</label><textarea id="t-sub" class="area" data-k="t" data-t="sub">' + esc(t.sub) + '</textarea></div>' +
      '<div class="pcard" style="display: flex; flex-direction: column; gap: 14px"><h2 style="margin: 0; font-size: 18px">Nosotros</h2>' +
      '<label class="lbl" for="t-quote">Frase destacada</label><input id="t-quote" class="pinp" type="text" value="' + esc(t.quote) + '" data-k="t" data-t="quote">' +
      '<label class="lbl" for="t-about">Texto</label><textarea id="t-about" class="area" style="min-height: 110px" data-k="t" data-t="about">' + esc(t.about) + '</textarea>' +
      '<div class="row" style="justify-content: space-between; gap: 14px">' +
      '<div style="display: flex; flex-direction: column; gap: 6px"><label class="lbl" for="t-since">En el rubro desde</label><input id="t-since" class="time" type="date" value="' + esc(t.since) + '" style="min-height: 44px" data-k="t" data-t="since"></div>' +
      '<div style="text-align: right"><div class="fd" style="font-size: 44px; font-weight: 900; line-height: .9; color: var(--accent)"><span id="years">' + yearsSince(t.since) + '</span> años</div><div class="fm" style="font-size: 11px; color: #9FB2AD">SE ACTUALIZA SOLO CADA AÑO</div></div></div></div>' +
      '<div class="pcard" style="display: flex; flex-direction: column; gap: 14px; grid-column: 1 / -1"><h2 style="margin: 0; font-size: 18px">Datos de contacto</h2><div class="tgrid">' +
      field('WhatsApp', 't-wa', 'wa', 'tel') + field('Teléfono fijo', 't-tel', 'tel', 'tel') + field('Email', 't-mail', 'mail', 'email') + field('Dirección', 't-addr', 'addr', 'text') +
      '</div></div></div>';
  }

  function usersRowsHtml() {
    return S.users.map(function (u) {
      var id = esc(u.id);
      return '<tr><td><div class="row" style="gap: 10px; flex-wrap: nowrap"><span class="avatar" style="width: 34px; height: 34px; font-size: 12px">' + esc(initials(u.name, u.email)) + '</span>' +
        '<div style="min-width: 0"><div style="font-weight: 700">' + esc(u.name) + '</div><div style="font-size: 12px; color: #9FB2AD; overflow-wrap: anywhere">' + esc(u.email) + '</div></div></div></td>' +
        '<td><label class="sr" for="r-' + id + '">Rol</label><select id="r-' + id + '" class="sel" data-k="u-role" data-id="' + id + '"' + (u.you ? ' disabled' : '') + ' style="min-width: 150px">' +
        '<option value="admin"' + selected(u.role, 'admin') + '>Administrador</option><option value="editor"' + selected(u.role, 'editor') + '>Editor</option></select></td>' +
        '<td><span class="status fm ' + (u.status === 'ok' ? 'st-ok' : 'st-pend') + '">' + (u.status === 'ok' ? 'ACTIVO' : 'INVITACIÓN ENVIADA') + '</span></td>' +
        '<td style="text-align: right">' + (u.you ? '' : '<button class="ibtn ibtn-danger" type="button" data-act="rm-user" data-id="' + id + '" aria-label="Quitar acceso">' + SVG_TRASH + '</button>') + '</td></tr>';
    }).join('');
  }

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function usuariosHtml() {
    return '<div class="hgrid"><div class="pcard"><h2 style="margin: 0 0 16px; font-size: 18px">Equipo con acceso</h2>' +
      '<div class="utable-wrap"><table class="utable"><thead><tr><th>USUARIO</th><th>ROL</th><th>ESTADO</th><th><span class="sr">Acciones</span></th></tr></thead><tbody>' + usersRowsHtml() + '</tbody></table></div>' +
      '<h2 style="margin: 28px 0 12px; font-size: 18px">Invitar a alguien</h2>' +
      '<div class="row" style="gap: 10px">' +
      '<label class="sr" for="inv-mail">Email</label><input id="inv-mail" class="pinp" type="email" value="' + esc(S.invEmail) + '" placeholder="email@ejemplo.com" data-k="inv-mail" style="flex: 1; min-width: 200px">' +
      '<label class="sr" for="inv-role">Rol</label><select id="inv-role" class="sel" data-k="inv-role" style="width: auto"><option value="editor"' + selected(S.invRole, 'editor') + '>Editor</option><option value="admin"' + selected(S.invRole, 'admin') + '>Administrador</option></select>' +
      '<button class="pbtn pbtn-primary" id="invite" type="button" data-act="invite"' + (validEmail(S.invEmail) ? '' : ' disabled') + '>Enviar invitación</button></div></div>' +
      '<div class="pcard" style="display: flex; flex-direction: column; gap: 14px"><span class="fm" style="font-size: 11px; letter-spacing: .16em; color: #7F948F">QUÉ PUEDE HACER CADA ROL</span>' +
      '<div><div style="font-weight: 800">Administrador</div><p style="margin: 4px 0 0; color: #9FB2AD; font-size: 14px">Todo lo del editor, más invitar y quitar usuarios, cambiar roles y editar los datos de contacto.</p></div>' +
      '<div><div style="font-weight: 800">Editor</div><p style="margin: 4px 0 0; color: #9FB2AD; font-size: 14px">Subir y cambiar fotos de trabajos, editar productos, horarios y textos, y publicar los cambios.</p></div></div></div>';
  }

  function pedidosHtml() {
    return '<div class="pcard" style="text-align: center; padding: 64px 24px; display: flex; flex-direction: column; gap: 12px; align-items: center">' +
      '<span class="fm" style="font-size: 11px; letter-spacing: .16em; color: var(--accent)">PRÓXIMAMENTE</span>' +
      '<h2 class="fd" style="margin: 0; font-size: 48px; font-weight: 900; line-height: .9">Pedidos de la tienda</h2>' +
      '<p style="margin: 0; max-width: 520px; color: #9FB2AD">Cuando activemos la tienda online, acá vas a ver cada pedido con sus medidas, el estado del pago y si es con envío, retiro o colocación.</p></div>';
  }

  var BUILD = { trabajos: worksHtml, productos: prodsHtml, horarios: horariosHtml, textos: textosHtml, usuarios: usuariosHtml, pedidos: pedidosHtml };

  function renderSection() {
    $('#section').innerHTML = BUILD[S.section]();
    document.querySelectorAll('#section video').forEach(function (v) {
      v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
  }

  function rerender() { renderNav(); renderSection(); }

  /* ---- toast ---- */
  function publish() {
    S.dirty = false;
    updateDirty();
    $('#toast-root').innerHTML = '<div class="toast" role="status"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"></path></svg>Cambios publicados en la web</div>';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $('#toast-root').innerHTML = ''; }, 2600);
  }

  /* ---- actions ---- */
  function moveWork(id, dir) {
    var a = S.works;
    var i = a.indexOf(find(a, id));
    var j = i + dir;
    if (i < 0 || j < 0 || j >= a.length) return;
    var t = a[i]; a[i] = a[j]; a[j] = t;
    mark();
    rerender();
  }

  function copyMonday() {
    var m = S.days[0];
    S.days.forEach(function (d, i) {
      if (i > 0 && i < 5) Object.assign(d, { open: m.open, m1: m.m1, m2: m.m2, hasT: m.hasT, t1: m.t1, t2: m.t2 });
    });
    mark();
    rerender();
  }

  function addSpecial() {
    if (!S.newDate) return;
    S.seq++;
    S.specials.push({ id: 's' + S.seq, date: S.newDate, label: S.newLabel || 'Cerrado' });
    S.specials.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    S.newDate = ''; S.newLabel = '';
    mark();
    rerender();
  }

  function invite() {
    if (!validEmail(S.invEmail)) return;
    S.seq++;
    S.users.push({ id: 'u' + S.seq, name: S.invEmail.split('@')[0], email: S.invEmail, role: S.invRole, status: 'pend' });
    S.invEmail = '';
    rerender();
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act],#publish');
    if (!t) return;
    if (t.id === 'publish') return publish();
    var id = t.getAttribute('data-id');
    switch (t.getAttribute('data-act')) {
      case 'nav': S.section = t.getAttribute('data-s'); renderHead(); return rerender();
      case 'wfilter': S.workFilter = t.getAttribute('data-f'); return renderSection();
      case 'w-up': return moveWork(id, -1);
      case 'w-down': return moveWork(id, 1);
      case 'w-remove': S.works = S.works.filter(function (x) { return x.id !== id; }); mark(); return rerender();
      case 'copy-monday': return copyMonday();
      case 'add-special': return addSpecial();
      case 'rm-special': S.specials = S.specials.filter(function (x) { return x.id !== id; }); mark(); return rerender();
      case 'invite': return invite();
      case 'rm-user': S.users = S.users.filter(function (x) { return x.id !== id; }); return rerender();
    }
  });

  // Text-like fields update state as you type; the rest commit on change.
  var LIVE = { 'w-cap': 1, 'p-name': 1, 'p-desc': 1, 'd-m1': 1, 'd-m2': 1, 'd-t1': 1, 'd-t2': 1, nd: 1, nl: 1, t: 1, 'inv-mail': 1 };

  function onField(e) {
    var el = e.target;
    var k = el.getAttribute('data-k');
    if (!k) return;
    if ((e.type === 'input') !== !!LIVE[k]) return;
    var id = el.getAttribute('data-id');
    var i = parseInt(el.getAttribute('data-i'), 10);
    var file = el.files && el.files[0];
    var w = find(S.works, id), p = find(S.prods, id);
    switch (k) {
      case 'w-cap': w.cap = el.value; return mark();
      case 'w-cat': w.cat = el.value; mark(); return rerender();
      case 'w-vis': w.visible = el.checked; mark(); return rerender();
      case 'w-rep':
        if (!file) return;
        w.src = URL.createObjectURL(file); w.video = file.type.indexOf('video') === 0; w.isNew = true;
        el.value = '';
        mark(); return rerender();
      case 'upload':
        var files = Array.prototype.slice.call(el.files || []);
        if (!files.length) return;
        var add = files.map(function (f) {
          S.seq++;
          return { id: 'n' + S.seq, src: URL.createObjectURL(f), cap: f.name.replace(/\.[^.]+$/, ''), cat: 'cerramientos', video: f.type.indexOf('video') === 0, visible: true, isNew: true };
        });
        S.works = add.concat(S.works);
        S.workFilter = 'todos';
        el.value = '';
        mark(); return rerender();
      case 'p-name': p.name = el.value; return mark();
      case 'p-desc': p.desc = el.value; return mark();
      case 'p-vis': p.visible = el.checked; mark(); return rerender();
      case 'p-ord': p.onOrder = el.checked; mark(); return rerender();
      case 'p-img':
        if (!file) return;
        p.img = URL.createObjectURL(file);
        el.value = '';
        mark(); return rerender();
      case 'd-open': S.days[i].open = el.checked; mark(); return rerender();
      case 'd-hasT': S.days[i].hasT = el.checked; mark(); return rerender();
      case 'd-m1': case 'd-m2': case 'd-t1': case 'd-t2':
        S.days[i][k.slice(2)] = el.value;
        mark();
        $('#preview').innerHTML = previewHtml();
        return;
      case 'nd': S.newDate = el.value; return;
      case 'nl': S.newLabel = el.value; return;
      case 't':
        S.texts[el.getAttribute('data-t')] = el.value;
        if (el.getAttribute('data-t') === 'since') $('#years').textContent = yearsSince(el.value);
        return mark();
      case 'u-role': find(S.users, id).role = el.value; mark(); return rerender();
      case 'inv-mail': S.invEmail = el.value; $('#invite').disabled = !validEmail(el.value); return;
      case 'inv-role': S.invRole = el.value; return;
    }
  }

  document.addEventListener('input', onField);
  document.addEventListener('change', onField);

  renderHead();
  rerender();
})();
