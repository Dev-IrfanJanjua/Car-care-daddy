/* Car Care Daddy — admin panel (prototype). Needs ../assets/js/store.js first. */
(function () {
  var CC = window.CC, E = CC.esc;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* auth gate (prototype only — real build uses Supabase Auth + role check) */
  try { if (sessionStorage.getItem('ccd_admin') !== '1') { location.replace('login.html'); return; } } catch (e) {}

  /* ---------- icons ---------- */
  var P = {
    dash: '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    leads: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    ext: '<path d="M15 3h6v6M10 14 21 3M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    up: '<path d="m18 15-6-6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>', left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>', phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2-5.4A8.4 8.4 0 1 1 21 11.5z"/>',
    check: '<path d="m5 12 5 5L20 7"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>', upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    car: '<path d="M5 17H3v-5l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v5h-2"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M3 12h18"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', compare: '<path d="M12 3v18M4 7l-2 5 2 5M20 7l2 5-2 5"/>', video: '<rect x="2" y="5" width="14" height="14" rx="3"/><path d="m22 8-6 4 6 4z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>', logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    home: '<path d="m3 11 9-8 9 8M5 10v10h14V10"/>', info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>', phone2: '<rect x="7" y="2" width="10" height="20" rx="3"/><path d="M11 18h2"/>', monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'
  };
  function ic(n) { return '<svg class="i" viewBox="0 0 24 24">' + (P[n] || '') + '</svg>'; }

  /* ---------- small helpers ---------- */
  function toast(msg) { var t = $('#toast'); t.innerHTML = ic('check') + E(msg); t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 2200); }
  function url(p) { if (!p) return ''; return /^(data:|https?:|\.\.\/|blob:)/.test(p) ? p : '../' + p; }
  function fmt(iso) { try { return new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); } catch (e) { return iso; } }
  function ago(iso) { var m = Math.round((Date.now() - new Date(iso)) / 60000); if (m < 60) return Math.max(m, 1) + 'm ago'; if (m < 1440) return Math.round(m / 60) + 'h ago'; return Math.round(m / 1440) + 'd ago'; }
  function save(quiet) { var ok = CC.save(); if (ok && !quiet) toast('Saved'); updateCounts(); return ok; }
  function modal(html, wide) {
    var m = $('#mod'); m.innerHTML = '<div class="mod-b' + (wide ? ' wide' : '') + '">' + html + '</div>'; m.classList.add('on');
    m.onclick = function (e) { if (e.target === m) closeMod(); };
    $$('[data-close]', m).forEach(function (b) { b.onclick = closeMod; });
    return $('.mod-b', m);
  }
  function closeMod() { var m = $('#mod'); m.classList.remove('on'); m.innerHTML = ''; }
  function initials(n) { return E(String(n || '?').trim().charAt(0).toUpperCase()); }
  function waTo(phone, text) { var d = String(phone).replace(/\D/g, ''); if (d.charAt(0) === '0') d = '92' + d.slice(1); return 'https://wa.me/' + d + (text ? '?text=' + encodeURIComponent(text) : ''); }
  function confirmBox(msg, ok) {
    var b = modal('<div class="mod-h"><h3>Are you sure?</h3></div><p style="color:var(--muted);margin-bottom:22px">' + E(msg) + '</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" data-close>Cancel</button><button class="btn danger" id="yes" style="border-color:var(--bad);color:var(--bad)">Delete</button></div>');
    $('#yes', b).onclick = function () { closeMod(); ok(); };
  }
  function files2data(files, max) { return Promise.all(Array.prototype.map.call(files, function (f) { return CC.compress(f, max || 1400, .78); })); }

  /* ---------- nav ---------- */
  var NAV = [
    ['Overview', [['dashboard', 'Dashboard', 'dash']]],
    ['Operations', [['bookings', 'Bookings', 'cal'], ['leads', 'Leads & messages', 'leads']]],
    ['Website', [['home', 'Home page', 'home'], ['about', 'About page', 'info'], ['media', 'Before/After & Gallery', 'image'], ['services', 'Services', 'tag'], ['reviews', 'Reviews', 'star']]],
    ['Settings', [['contact', 'Contact & hours', 'phone'], ['brand', 'Brand & SEO', 'gear'], ['data', 'Data & backup', 'download']]]
  ];
  var TITLES = {}; NAV.forEach(function (g) { g[1].forEach(function (n) { TITLES[n[0]] = n[1]; }); });

  function shell() {
    $('#app').innerHTML =
      '<aside class="side"><a class="brand" href="#dashboard"><img src="../assets/img/logo-mark.png" alt=""><span><b>Car Care Daddy</b><small>Admin</small></span></a>' +
      NAV.map(function (g) { return '<div class="grp">' + g[0] + '</div>' + g[1].map(function (n) { return '<a class="nav-a" data-r="' + n[0] + '" href="#' + n[0] + '">' + ic(n[2]) + '<span>' + n[1] + '</span><span class="cnt" data-cnt="' + n[0] + '" hidden></span></a>'; }).join(''); }).join('') +
      '<div class="side-foot"><span class="av">A</span><div style="flex:1;min-width:0"><b style="font-size:.88rem">Admin</b><small>Owner</small></div><button class="btn icon sm" id="logout" title="Sign out">' + ic('logout') + '</button></div></aside>' +
      '<div class="main"><header class="top"><button class="menu-btn" id="menu">' + ic('menu') + '</button><h1 id="ttl"></h1><span class="sp"></span>' +
      '<a class="btn hide-sm" href="../index.html" target="_blank">' + ic('ext') + 'View website</a><button class="btn gold" id="quick-add">' + ic('plus') + 'Add before/after</button></header><main class="view" id="view"></main></div>';
    $('#menu').onclick = function () { document.body.classList.toggle('nav-open'); };
    $('#logout').onclick = function () { sessionStorage.removeItem('ccd_admin'); location.href = 'login.html'; };
    $('#quick-add').onclick = function () { location.hash = '#media'; setTimeout(function () { openAdd('compare'); }, 60); };
    $$('.side a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('nav-open'); }); });
  }
  function updateCounts() {
    var p = CC.data.bookings.filter(function (b) { return b.status === 'pending'; }).length, n = CC.data.leads.filter(function (l) { return l.status === 'new'; }).length;
    [['bookings', p], ['leads', n]].forEach(function (x) { var el = $('[data-cnt=' + x[0] + ']'); if (el) { el.hidden = !x[1]; el.textContent = x[1]; } });
  }

  /* ========================================================================
     DASHBOARD
     ======================================================================== */
  function viewDashboard(v) {
    var B = CC.data.bookings, L = CC.data.leads, today = new Date().toDateString();
    var pend = B.filter(function (b) { return b.status === 'pending'; }).length;
    var todayJobs = B.filter(function (b) { return new Date(b.when).toDateString() === today && b.status !== 'cancelled'; }).length;
    var newL = L.filter(function (l) { return l.status === 'new'; }).length;
    var wk = Date.now() - 7 * 864e5, done = B.filter(function (b) { return b.status === 'completed' && new Date(b.when) > wk; }).length;
    var days = [], max = 1;
    for (var i = -3; i <= 3; i++) {
      var d = new Date(); d.setDate(d.getDate() + i);
      var c = B.filter(function (b) { return new Date(b.when).toDateString() === d.toDateString() && b.status !== 'cancelled'; }).length;
      max = Math.max(max, c); days.push({ d: d, c: c, today: i === 0 });
    }
    var up = B.filter(function (b) { return new Date(b.when) >= new Date(new Date().setHours(0, 0, 0, 0)) && b.status !== 'cancelled' && b.status !== 'completed'; }).sort(function (a, b) { return new Date(a.when) - new Date(b.when); }).slice(0, 5);
    var hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    v.innerHTML =
      '<div class="page-head"><div><h2>' + greet + ' 👋</h2><p class="sub">Here’s what’s happening at Car Care Daddy today.</p></div></div>' +
      '<div class="grid g4">' +
      kpi('cal', pend, 'Pending bookings', 'bookings') + kpi('car', todayJobs, 'Jobs today', 'bookings') + kpi('leads', newL, 'New leads', 'leads') + kpi('check', done, 'Completed this week', 'bookings') + '</div>' +
      '<div class="grid g-main" style="margin-top:18px">' +
      '<div class="card"><div class="card-h"><div><h3>Jobs this week</h3><p class="sub" style="margin:0">Bookings per day · 3 days back, 3 ahead</p></div></div>' +
      '<div class="chart">' + days.map(function (x) { return '<div class="col' + (x.today ? ' today' : '') + '"><div class="bar" style="height:' + Math.max(4, x.c / max * 100) + '%"><em>' + x.c + '</em></div><span>' + x.d.toLocaleDateString('en-GB', { weekday: 'short' }) + '</span></div>'; }).join('') + '</div></div>' +
      '<div class="card"><div class="card-h"><h3>Quick actions</h3></div><div class="grid" style="gap:10px">' +
      qa('#media', 'compare', 'Add before / after', 'Show off your latest job') + qa('#home', 'edit', 'Edit home page', 'Headline, hero video, sections') + qa('#services', 'tag', 'Manage services', 'Add or update what you offer') + qa('../index.html', 'ext', 'View live website', 'Opens in a new tab', 1) + '</div></div></div>' +
      '<div class="grid g2" style="margin-top:18px">' +
      '<div class="card"><div class="card-h"><h3>Upcoming jobs</h3><a class="btn sm" href="#bookings">View all</a></div><div class="mini-list">' +
      (up.length ? up.map(function (b) { return '<div class="mini"><span class="av">' + initials(b.name) + '</span><div><b>' + E(b.name) + ' · ' + E(b.service) + '</b><small>' + fmt(b.when) + ' · ' + E(b.area) + '</small></div><span class="badge b-' + b.status + '">' + b.status + '</span></div>'; }).join('') : '<div class="empty">No upcoming jobs</div>') + '</div></div>' +
      '<div class="card"><div class="card-h"><h3>Latest leads</h3><a class="btn sm" href="#leads">View all</a></div><div class="mini-list">' +
      (L.slice(0, 5).map(function (l) { return '<div class="mini"><span class="av">' + initials(l.name) + '</span><div><b>' + E(l.name) + '</b><small>' + E(l.message) + '</small></div><span class="badge b-' + l.status + '">' + l.status + '</span></div>'; }).join('') || '<div class="empty">No leads yet</div>') + '</div></div></div>';
    function kpi(i, n, l, h) { return '<a class="card kpi" href="#' + h + '"><div class="ico">' + ic(i) + '</div><b>' + n + '</b><span>' + l + '</span></a>'; }
    function qa(h, i, t, s, ext) { return '<a class="mini" style="border:1px solid var(--line)" href="' + h + '"' + (ext ? ' target="_blank"' : '') + '><span class="av" style="border-radius:12px">' + ic(i) + '</span><div><b>' + t + '</b><small>' + s + '</small></div>' + ic('right') + '</a>'; }
  }

  /* ========================================================================
     BOOKINGS
     ======================================================================== */
  var bFilter = 'all', bQ = '';
  function viewBookings(v) {
    var B = CC.data.bookings;
    var list = B.filter(function (b) { return (bFilter === 'all' || b.status === bFilter) && (!bQ || (b.name + b.phone + b.car + b.service + b.area).toLowerCase().indexOf(bQ) > -1); }).sort(function (a, b) { return new Date(b.when) - new Date(a.when); });
    var cnt = function (s) { return s === 'all' ? B.length : B.filter(function (b) { return b.status === s; }).length; };
    v.innerHTML = '<div class="page-head"><div><h2>Bookings</h2><p class="sub">Requests from the website’s Book now form.</p></div></div>' +
      '<div class="tabs">' + ['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(function (s) { return '<button data-f="' + s + '" class="' + (bFilter === s ? 'on' : '') + '">' + s[0].toUpperCase() + s.slice(1) + ' (' + cnt(s) + ')</button>'; }).join('') + '</div>' +
      '<div class="toolbar"><label class="search">' + ic('search') + '<input id="q" placeholder="Search name, car, area…" value="' + E(bQ) + '"></label></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>Customer</th><th>Service</th><th>When</th><th>Area</th><th>Status</th><th></th></tr></thead><tbody>' +
      (list.length ? list.map(function (b) {
        return '<tr><td><b>' + E(b.name) + '</b><small>' + E(b.phone) + '</small></td><td>' + E(b.service) + '<small>' + E(b.car) + '</small></td><td>' + fmt(b.when) + '<small>requested ' + ago(b.created) + '</small></td><td>' + E(b.area) + '</td>' +
          '<td><select class="sel" style="padding:6px 30px 6px 10px;width:auto" data-id="' + b.id + '">' + ['pending', 'confirmed', 'completed', 'cancelled'].map(function (s) { return '<option' + (s === b.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></td>' +
          '<td><div class="row-act"><a class="btn icon" title="WhatsApp customer" target="_blank" href="' + waTo(b.phone, 'Hi ' + b.name.split(' ')[0] + ', this is Car Care Daddy regarding your ' + b.service + ' booking.') + '">' + ic('chat') + '</a><a class="btn icon" title="Call" href="tel:' + E(b.phone) + '">' + ic('phone') + '</a><button class="btn icon danger" title="Delete" data-del="' + b.id + '">' + ic('trash') + '</button></div></td></tr>';
      }).join('') : '<tr><td colspan="6" class="empty">No bookings match.</td></tr>') + '</tbody></table></div>';
    $$('.tabs button', v).forEach(function (b) { b.onclick = function () { bFilter = b.getAttribute('data-f'); viewBookings(v); }; });
    $('#q', v).oninput = function (e) { bQ = e.target.value.toLowerCase(); var p = e.target.selectionStart; viewBookings(v); var q = $('#q'); q.focus(); q.setSelectionRange(p, p); };
    $$('select[data-id]', v).forEach(function (s) { s.onchange = function () { CC.data.bookings.filter(function (b) { return b.id === s.getAttribute('data-id'); })[0].status = s.value; save(); viewBookings(v); }; });
    $$('[data-del]', v).forEach(function (b) { b.onclick = function () { confirmBox('Delete this booking permanently?', function () { CC.data.bookings = CC.data.bookings.filter(function (x) { return x.id !== b.getAttribute('data-del'); }); save(); viewBookings(v); }); }; });
  }

  /* ========================================================================
     LEADS
     ======================================================================== */
  var lFilter = 'all';
  function viewLeads(v) {
    var L = CC.data.leads, list = L.filter(function (l) { return lFilter === 'all' || l.status === lFilter; });
    v.innerHTML = '<div class="page-head"><div><h2>Leads & messages</h2><p class="sub">Contact-form messages and quick-quote requests.</p></div></div>' +
      '<div class="tabs">' + ['all', 'new', 'contacted', 'closed'].map(function (s) { return '<button data-f="' + s + '" class="' + (lFilter === s ? 'on' : '') + '">' + s[0].toUpperCase() + s.slice(1) + '</button>'; }).join('') + '</div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>From</th><th>Message</th><th>Source</th><th>Received</th><th>Status</th><th></th></tr></thead><tbody>' +
      (list.length ? list.map(function (l) {
        return '<tr><td><b>' + E(l.name) + '</b><small>' + E(l.phone) + (l.email ? ' · ' + E(l.email) : '') + '</small></td><td style="max-width:360px">' + E(l.message) + '</td><td>' + E(l.source) + '</td><td>' + ago(l.created) + '</td>' +
          '<td><select class="sel" style="padding:6px 30px 6px 10px;width:auto" data-id="' + l.id + '">' + ['new', 'contacted', 'closed'].map(function (s) { return '<option' + (s === l.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></td>' +
          '<td><div class="row-act"><a class="btn icon" title="Reply on WhatsApp" target="_blank" href="' + waTo(l.phone, 'Hi ' + l.name.split(' ')[0] + ', thanks for contacting Car Care Daddy!') + '">' + ic('chat') + '</a><button class="btn icon danger" data-del="' + l.id + '">' + ic('trash') + '</button></div></td></tr>';
      }).join('') : '<tr><td colspan="6" class="empty">Nothing here.</td></tr>') + '</tbody></table></div>';
    $$('.tabs button', v).forEach(function (b) { b.onclick = function () { lFilter = b.getAttribute('data-f'); viewLeads(v); }; });
    $$('select[data-id]', v).forEach(function (s) { s.onchange = function () { CC.data.leads.filter(function (x) { return x.id === s.getAttribute('data-id'); })[0].status = s.value; save(); viewLeads(v); }; });
    $$('[data-del]', v).forEach(function (b) { b.onclick = function () { confirmBox('Delete this lead?', function () { CC.data.leads = CC.data.leads.filter(function (x) { return x.id !== b.getAttribute('data-del'); }); save(); viewLeads(v); }); }; });
  }

  /* ========================================================================
     CONTENT EDITOR (home / about / contact / brand) with live preview
     ======================================================================== */
  var LIB_DEFAULTS = ['service-windshield', 'service-glass', 'service-headlight', 'service-detailing', 'before-windshield', 'after-windshield', 'hero-poster', 'video1-poster', 'gallery-a', 'gallery-b', 'gallery-c', 'gallery-d', 'gallery-e', 'gallery-f', 'gallery-g', 'gallery-h', 'business-card', 'logo-full'].map(function (n) { return 'assets/img/' + n + '.jpg'; });
  function library() {
    var s = {}; LIB_DEFAULTS.forEach(function (x) { s[x] = 1; });
    CC.data.gallery.forEach(function (g) { [g.src, g.before, g.after, g.poster].forEach(function (x) { if (x && !/^assets\/video/.test(x)) s[x] = 1; }); });
    CC.data.services.forEach(function (x) { if (x.img) s[x.img] = 1; });
    return Object.keys(s);
  }
  function pickImage(cb) {
    var b = modal('<div class="mod-h"><h3>Choose an image</h3><button class="btn icon" data-close>' + ic('x') + '</button></div><div class="lib">' + library().map(function (p) { return '<button data-p="' + E(p) + '"><img src="' + E(url(p)) + '" alt=""></button>'; }).join('') + '</div>', true);
    $$('.lib button', b).forEach(function (x) { x.onclick = function () { closeMod(); cb(x.getAttribute('data-p')); }; });
  }
  function imgField(label, path, hint) {
    var cur = CC.get(path);
    return '<div class="f"><label>' + label + '</label><div class="imgf" data-img="' + path + '">' + (cur ? '<img src="' + E(url(cur)) + '" alt="">' : '<div class="ph">' + ic('image') + '</div>') +
      '<div class="acts"><label class="btn sm" style="cursor:pointer">' + ic('upload') + 'Upload<input type="file" accept="image/*" hidden></label><button class="btn sm" data-lib type="button">Library</button></div></div>' + (hint ? '<span class="hint">' + hint + '</span>' : '') + '</div>';
  }
  function T(label, path, opts) { opts = opts || {}; var val = CC.get(path); return '<div class="f"><label>' + label + '</label>' + (opts.ta ? '<textarea class="ta" data-p="' + path + '" rows="' + (opts.rows || 3) + '">' + E(val) + '</textarea>' : '<input class="in" data-p="' + path + '" value="' + E(val) + '"' + (opts.ph ? ' placeholder="' + E(opts.ph) + '"' : '') + '>') + (opts.hint ? '<span class="hint">' + opts.hint + '</span>' : '') + '</div>'; }
  function TG(label, desc, path) { return '<div class="tog"><div><b>' + label + '</b>' + (desc ? '<small>' + desc + '</small>' : '') + '</div><label class="switch"><input type="checkbox" data-p="' + path + '"' + (CC.get(path) !== false ? ' checked' : '') + '><i></i></label></div>'; }
  function LIST(label, path, fields, itemName) {
    var arr = CC.get(path) || [];
    return '<div class="sec-t">' + label + '<button class="btn sm" data-add="' + path + '" type="button">' + ic('plus') + 'Add</button></div><div class="rep">' + arr.map(function (it, i) {
      return '<div class="rep-i' + (fields.length === 3 ? ' cols' : '') + '"><div class="flds">' + fields.map(function (f) { return '<input class="in" placeholder="' + f[1] + '" data-p="' + path + '.' + i + '.' + f[0] + '" value="' + E(it[f[0]]) + '">'; }).join('') + '</div><button class="btn icon sm danger" data-rm="' + path + '|' + i + '" type="button" title="Remove">' + ic('x') + '</button></div>';
    }).join('') + '</div>';
  }
  function STRLIST(label, path) {
    var arr = CC.get(path) || [];
    return '<div class="sec-t">' + label + '<button class="btn sm" data-add="' + path + '" data-str="1" type="button">' + ic('plus') + 'Add paragraph</button></div><div class="rep">' + arr.map(function (t, i) { return '<div class="rep-i"><div class="flds"><textarea class="ta" rows="3" data-p="' + path + '.' + i + '">' + E(t) + '</textarea></div><button class="btn icon sm danger" data-rm="' + path + '|' + i + '" type="button">' + ic('x') + '</button></div>'; }).join('') + '</div>';
  }
  var SWATCHES = ['#D4A24C', '#E0B341', '#C9A27A', '#E4572E', '#2EC4B6', '#5E8BFF', '#B07CFF', '#46D37A', '#E8E8EC'];

  var EDITORS = {
    home: { title: 'Home page', page: '../index.html', body: function () {
      return '<div class="sec-t">Hero</div>' + T('Top badge', 'home.badge') + '<div class="r2">' + T('Headline — line 1', 'home.title1') + T('Headline — gold line', 'home.title2') + '</div>' + T('Sub-headline', 'home.sub', { ta: 1 }) +
        '<div class="r2">' + T('Secondary button label', 'home.ctaSecondary') + T('Warranty note', 'home.warranty') + '</div>' +
        '<div class="f"><label>Hero background video</label><select class="sel" id="herovid"><option value="assets/video/video2.mp4">Night street (video 2)</option><option value="assets/video/video1.mp4">Studio reveal (video 1)</option><option value="">Photo only (no video)</option></select><span class="hint">Videos in the library. Real build: upload any MP4 to storage.</span></div>' + imgField('Hero poster / fallback image', 'home.heroPoster', 'Shown while the video loads and on slow connections.') +
        LIST('Stats bar', 'home.stats', [['n', 'Number'], ['s', 'Unit'], ['l', 'Label']]) +
        '<div class="sec-t">Before / After section</div>' + T('Eyebrow', 'home.beforeAfter.eyebrow') + T('Title', 'home.beforeAfter.title') + T('Sub-text', 'home.beforeAfter.sub') +
        '<div class="note">' + ic('info') + '<span>Add or reorder the slides in <a href="#media" style="text-decoration:underline">Before/After & Gallery</a> — tick “Show on home swiper”.</span></div>' +
        '<div class="sec-t">Bottom call-to-action</div>' + T('Title', 'home.ctaBand.title') + T('Text', 'home.ctaBand.sub') +
        '<div class="sec-t">Show / hide sections</div>' + TG('Services', 'Four-card service grid', 'home.sections.services') + TG('Before / After swiper', '', 'home.sections.beforeAfter') + TG('How it works', '', 'home.sections.process') + TG('Why choose us', 'Includes the stats bar', 'home.sections.why') + TG('Reviews', '', 'home.sections.reviews') + TG('Call-to-action band', '', 'home.sections.cta');
    } },
    about: { title: 'About page', page: '../about.html', body: function () {
      return '<div class="sec-t">Intro</div>' + T('Eyebrow', 'about.eyebrow') + T('Title', 'about.title') + T('Lead paragraph', 'about.lead', { ta: 1 }) + imgField('Main image', 'about.image') +
        STRLIST('Story paragraphs', 'about.story') + LIST('Stats', 'about.stats', [['n', 'Number'], ['s', 'Unit'], ['l', 'Label']]) +
        '<div class="sec-t">Values</div><div class="rep">' + (CC.get('about.values') || []).map(function (x, i) { return '<div class="rep-i"><div class="flds"><input class="in" placeholder="Title" data-p="about.values.' + i + '.t" value="' + E(x.t) + '"><textarea class="ta" rows="2" placeholder="Description" data-p="about.values.' + i + '.d">' + E(x.d) + '</textarea></div><button class="btn icon sm danger" data-rm="about.values|' + i + '" type="button">' + ic('x') + '</button></div>'; }).join('') + '</div><button class="btn sm" data-add="about.values" type="button">' + ic('plus') + 'Add value</button>';
    } },
    contact: { title: 'Contact & hours', page: '../contact.html', body: function () {
      return '<div class="sec-t">Contact details</div><div class="r2">' + T('Phone (as displayed)', 'settings.contact.phone', { ph: '0328 7203630' }) + T('WhatsApp number (digits only)', 'settings.contact.whatsapp', { hint: 'International, no “+”. e.g. 923287203630' }) + '</div>' +
        T('Email', 'settings.contact.email') + '<div class="r2">' + T('Facebook link', 'settings.contact.facebook') + T('Instagram link', 'settings.contact.instagram') + '</div>' +
        '<div class="r2">' + T('City', 'settings.contact.city') + T('Coverage line', 'settings.contact.area') + '</div>' + T('Address / coverage text', 'settings.contact.address') +
        LIST('Working hours', 'settings.hours', [['d', 'Days'], ['t', 'Hours']]);
    } },
    brand: { title: 'Brand & SEO', page: '../index.html', body: function () {
      var a = CC.get('settings.brand.accent');
      return '<div class="sec-t">Brand</div><div class="r2">' + T('Business name', 'settings.brand.name') + T('Tagline', 'settings.brand.tagline') + '</div>' +
        '<div class="f"><label>Accent colour</label><div class="sw">' + SWATCHES.map(function (c) { return '<button type="button" data-sw="' + c + '" style="background:' + c + '" class="' + (c.toLowerCase() === String(a).toLowerCase() ? 'on' : '') + '" aria-label="' + c + '"></button>'; }).join('') + '<input type="color" id="swc" value="' + E(a) + '" title="Custom colour"></div><span class="hint">Changes buttons, highlights and gradients across the whole website.</span></div>' +
        '<div class="sec-t">Search engines (SEO)</div>' + T('Home page title', 'settings.seo.title', { hint: 'Ideally under 60 characters.' }) + T('Meta description', 'settings.seo.description', { ta: 1, hint: 'Ideally 120–155 characters.' });
    } }
  };
  var saveT;
  function viewEditor(v, key) {
    var ed = EDITORS[key], st = { dev: 'desktop' };
    v.innerHTML = '<div class="page-head"><div><h2>' + ed.title + '</h2><p class="sub">Edit the text and images below — the preview updates automatically.</p></div></div>' +
      '<div class="split"><div class="card" id="form"></div><div class="preview"><div class="bar"><i></i><i></i><i></i><span>' + ed.page.replace('../', 'carcaredaddy.pk/') + '</span><div class="dev"><button data-d="desktop" class="on">' + 'Desktop</button><button data-d="mobile">Mobile</button></div></div><div class="frame-wrap" id="fw"><iframe id="pf" src="' + ed.page + '" title="Live preview"></iframe></div></div></div>';
    var form = $('#form', v), fw = $('#fw', v), pf = $('#pf', v);
    function scale() { var w = fw.clientWidth, tw = st.dev === 'desktop' ? 1280 : 390, s = w / tw; pf.style.width = tw + 'px'; pf.style.transform = 'scale(' + s + ')'; pf.style.marginLeft = ((w - tw * s) / 2) + 'px'; pf.style.height = (fw.clientHeight / s) + 'px'; fw.style.overflow = 'hidden'; }
    function draw() {
      var y = window.scrollY; form.innerHTML = ed.body() + '<div class="savebar"><span id="stat">All changes saved · live on preview</span><div style="display:flex;gap:8px"><a class="btn" href="' + ed.page + '" target="_blank">' + ic('ext') + 'Open page</a></div></div>';
      wire(); window.scrollTo(0, y);
      var hv = $('#herovid', form); if (hv) hv.value = CC.get('home.heroVideo') || '';
    }
    function changed() {
      $('#stat', form).textContent = 'Saving…'; $('#stat', form).classList.add('dirty'); clearTimeout(saveT);
      saveT = setTimeout(function () { if (save(true)) { var s = $('#stat'); if (s) { s.textContent = 'All changes saved · live on preview'; s.classList.remove('dirty'); } pf.src = pf.src; } }, 500);
    }
    function wire() {
      $$('[data-p]', form).forEach(function (el) {
        el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', function () { CC.set(el.getAttribute('data-p'), el.type === 'checkbox' ? el.checked : el.value); changed(); });
      });
      var hv = $('#herovid', form); if (hv) hv.onchange = function () { CC.set('home.heroVideo', hv.value); changed(); };
      $$('[data-img]', form).forEach(function (box) {
        var path = box.getAttribute('data-img');
        $('input[type=file]', box).onchange = function (e) { if (e.target.files[0]) CC.compress(e.target.files[0], 1600).then(function (d) { CC.set(path, d); draw(); changed(); }); };
        $('[data-lib]', box).onclick = function () { pickImage(function (p) { CC.set(path, p); draw(); changed(); }); };
      });
      $$('[data-add]', form).forEach(function (b) {
        b.onclick = function () {
          var path = b.getAttribute('data-add'), arr = CC.get(path) || [];
          if (b.hasAttribute('data-str')) arr.push('New paragraph…');
          else if (arr.length) { var o = {}; Object.keys(arr[0]).forEach(function (k) { o[k] = ''; }); arr.push(o); }
          else arr.push({ t: '', d: '' });
          CC.set(path, arr); draw(); changed();
        };
      });
      $$('[data-rm]', form).forEach(function (b) { b.onclick = function () { var p = b.getAttribute('data-rm').split('|'); var arr = CC.get(p[0]); arr.splice(+p[1], 1); draw(); changed(); }; });
      $$('[data-sw]', form).forEach(function (b) { b.onclick = function () { CC.set('settings.brand.accent', b.getAttribute('data-sw')); draw(); changed(); applyAdminAccent(); }; });
      var sc = $('#swc', form); if (sc) sc.oninput = function () { CC.set('settings.brand.accent', sc.value); changed(); applyAdminAccent(); };
    }
    $$('.dev button', v).forEach(function (b) { b.onclick = function () { st.dev = b.getAttribute('data-d'); $$('.dev button', v).forEach(function (x) { x.classList.toggle('on', x === b); }); scale(); }; });
    draw(); scale(); window.addEventListener('resize', scale); v._cleanup = function () { window.removeEventListener('resize', scale); };
  }
  function applyAdminAccent() { var a = CC.get('settings.brand.accent'); if (!a) return; document.documentElement.style.setProperty('--gold', a); }

  /* ========================================================================
     MEDIA (before/after + gallery)
     ======================================================================== */
  var mFilter = 'all';
  function viewMedia(v) {
    var G = CC.data.gallery;
    var shown = G.filter(function (g) { return mFilter === 'all' || (mFilter === 'home' ? g.home : g.type === mFilter); });
    var cnt = function (f) { return f === 'all' ? G.length : f === 'home' ? G.filter(function (g) { return g.home; }).length : G.filter(function (g) { return g.type === f; }).length; };
    v.innerHTML = '<div class="page-head"><div><h2>Before/After & Gallery</h2><p class="sub">Everything here appears on your Gallery page. Items ticked <b>“Show on home swiper”</b> also appear in the Home page slider.</p></div><button class="btn gold" id="add">' + ic('plus') + 'Add new</button></div>' +
      '<div class="tabs">' + [['all', 'All'], ['home', 'On home swiper'], ['compare', 'Before / After'], ['image', 'Photos'], ['video', 'Videos']].map(function (t) { return '<button data-f="' + t[0] + '" class="' + (mFilter === t[0] ? 'on' : '') + '">' + t[1] + ' (' + cnt(t[0]) + ')</button>'; }).join('') + '</div>' +
      '<div class="mg">' + shown.map(function (g) {
        var th = g.type === 'compare' ? '<div class="pair"><img src="' + E(url(g.before)) + '" alt=""><img src="' + E(url(g.after)) + '" alt=""></div>' : '<img src="' + E(url(g.type === 'video' ? g.poster : g.src)) + '" alt="">';
        var tyIcon = g.type === 'compare' ? 'compare' : g.type === 'video' ? 'video' : 'image', tyLbl = g.type === 'compare' ? 'Before / After' : g.type === 'video' ? 'Video' : 'Photo';
        var idx = G.indexOf(g);
        return '<div class="mc"><div class="th">' + th + '<span class="ty">' + ic(tyIcon) + tyLbl + '</span>' + (g.home ? '<span class="home">ON HOME</span>' : '') + '</div><div class="bd"><input class="in" data-k="title" data-id="' + g.id + '" value="' + E(g.title) + '"><select class="sel" data-k="category" data-id="' + g.id + '">' + Object.keys(CC.catLabel).map(function (c) { return '<option value="' + c + '"' + (c === g.category ? ' selected' : '') + '>' + CC.catLabel[c] + '</option>'; }).join('') + '</select>' +
          '<div class="tog" style="margin:0;padding:8px 12px"><b style="font-size:.84rem">Show on home swiper</b><label class="switch"><input type="checkbox" data-k="home" data-id="' + g.id + '"' + (g.home ? ' checked' : '') + '><i></i></label></div></div>' +
          '<div class="ft"><div style="display:flex;gap:6px"><button class="btn icon sm" data-mv="-1" data-id="' + g.id + '" title="Move earlier"' + (idx === 0 ? ' disabled style="opacity:.35"' : '') + '>' + ic('left') + '</button><button class="btn icon sm" data-mv="1" data-id="' + g.id + '" title="Move later"' + (idx === G.length - 1 ? ' disabled style="opacity:.35"' : '') + '>' + ic('right') + '</button></div><button class="btn sm danger" data-del="' + g.id + '">' + ic('trash') + 'Delete</button></div></div>';
      }).join('') + '<button class="addcard" id="add2">' + '<div>' + ic('plus') + '<b style="color:var(--text)">Add before / after, photo or video</b><br><small>Upload from your phone or computer</small></div></button></div>';
    function G_(id) { return CC.data.gallery.filter(function (x) { return x.id === id; })[0]; }
    $$('.tabs button', v).forEach(function (b) { b.onclick = function () { mFilter = b.getAttribute('data-f'); viewMedia(v); }; });
    $('#add', v).onclick = $('#add2', v).onclick = function () { openAdd('compare'); };
    $$('[data-k]', v).forEach(function (el) {
      el.addEventListener(el.type === 'checkbox' ? 'change' : 'change', function () { G_(el.getAttribute('data-id'))[el.getAttribute('data-k')] = el.type === 'checkbox' ? el.checked : el.value; save(); if (el.type === 'checkbox') viewMedia(v); });
    });
    $$('[data-mv]', v).forEach(function (b) { b.onclick = function () { var a = CC.data.gallery, i = a.indexOf(G_(b.getAttribute('data-id'))), j = i + (+b.getAttribute('data-mv')); if (j < 0 || j >= a.length) return; var t = a[i]; a[i] = a[j]; a[j] = t; save(); viewMedia(v); }; });
    $$('[data-del]', v).forEach(function (b) { b.onclick = function () { confirmBox('Remove this item from the website?', function () { CC.data.gallery = CC.data.gallery.filter(function (x) { return x.id !== b.getAttribute('data-del'); }); save(); viewMedia(v); }); }; });
  }
  function drop(id, label) { return '<div class="drop" id="' + id + '"><input type="file" accept="image/*"><div class="lbl">' + ic('upload') + '<b>' + label + '</b><br><small>Click or drag a photo</small></div></div>'; }
  function wireDrop(el, store, key, multi) {
    var inp = $('input', el);
    function take(files) {
      if (!files || !files.length) return;
      files2data(files, 1600).then(function (arr) { store[key] = multi ? arr : arr[0]; if (!multi) { var im = $('img', el) || el.insertBefore(document.createElement('img'), el.firstChild.nextSibling); im.src = arr[0]; el.classList.add('has'); $('.lbl small', el).textContent = 'Click to replace'; } else { $('.lbl small', el).textContent = arr.length + ' photo(s) ready'; el.classList.add('has'); } });
    }
    inp.onchange = function () { take(inp.files); };
    ['dragover', 'dragenter'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.preventDefault(); el.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { el.addEventListener(ev, function () { el.classList.remove('over'); }); });
    el.addEventListener('drop', function (e) { e.preventDefault(); take(e.dataTransfer.files); });
  }
  function openAdd(type) {
    var st = { type: type, before: null, after: null, photos: null, poster: null, videoFile: null };
    var b = modal('<div class="mod-h"><h3>Add to website</h3><button class="btn icon" data-close>' + ic('x') + '</button></div>' +
      '<div class="tabs" id="ty"><button data-t="compare" class="' + (type === 'compare' ? 'on' : '') + '">Before / After</button><button data-t="image">Photos</button><button data-t="video">Video</button></div><div id="pane"></div>' +
      '<div class="f" style="margin-top:6px"><label>Title</label><input class="in" id="a-title" placeholder="e.g. Honda Civic windshield restoration"></div>' +
      '<div class="r2"><div class="f"><label>Category</label><select class="sel" id="a-cat">' + Object.keys(CC.catLabel).map(function (c) { return '<option value="' + c + '">' + CC.catLabel[c] + '</option>'; }).join('') + '</select></div><div class="f"><label>Home swiper</label><div class="tog" style="margin:0"><b>Show on home page</b><label class="switch"><input type="checkbox" id="a-home" checked><i></i></label></div></div></div>' +
      '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px"><button class="btn" data-close>Cancel</button><button class="btn gold" id="a-save">' + ic('check') + 'Add to website</button></div>');
    function pane() {
      var p = $('#pane', b);
      if (st.type === 'compare') { p.innerHTML = '<div class="note">' + ic('info') + '<span>Use the <b>same car, same angle and same lighting</b> for the most convincing before/after.</span></div><div class="r2">' + drop('d-b', 'Before') + drop('d-a', 'After') + '</div>'; wireDrop($('#d-b', b), st, 'before'); wireDrop($('#d-a', b), st, 'after'); }
      else if (st.type === 'image') { p.innerHTML = drop('d-p', 'Photos') .replace('type="file"', 'type="file" multiple'); wireDrop($('#d-p', b), st, 'photos', true); }
      else { p.innerHTML = '<div class="f"><label>Video file (MP4)</label><input class="in" type="file" id="v-file" accept="video/*"><span class="hint">Prototype: small videos (≤2.5 MB) are stored in the browser; larger ones last until you close the tab. In production videos go to storage.</span></div><div class="f"><label>…or video path / URL</label><input class="in" id="v-url" placeholder="assets/video/video1.mp4 or https://…"></div>' + drop('d-poster', 'Cover image'); wireDrop($('#d-poster', b), st, 'poster'); $('#v-file', b).onchange = function (e) { st.videoFile = e.target.files[0]; }; }
    }
    $$('#ty button', b).forEach(function (t) { t.onclick = function () { st.type = t.getAttribute('data-t'); $$('#ty button', b).forEach(function (x) { x.classList.toggle('on', x === t); }); pane(); }; });
    pane();
    $('#a-save', b).onclick = function () {
      var title = $('#a-title', b).value.trim(), cat = $('#a-cat', b).value, home = $('#a-home', b).checked, items = [];
      if (st.type === 'compare') { if (!st.before || !st.after) return toast('Please add both photos'); items.push({ type: 'compare', before: st.before, after: st.after }); }
      else if (st.type === 'image') { if (!st.photos) return toast('Please choose a photo'); st.photos.forEach(function (p) { items.push({ type: 'image', src: p }); }); }
      else {
        var u = $('#v-url', b).value.trim();
        if (!st.videoFile && !u) return toast('Add a video file or URL');
        if (!st.poster) return toast('Add a cover image');
        var done = function (src) { push([{ type: 'video', src: src, poster: st.poster }]); };
        if (u) return done(u);
        if (st.videoFile.size < 2.5e6) { var fr = new FileReader(); fr.onload = function () { done(fr.result); }; fr.readAsDataURL(st.videoFile); } else done(URL.createObjectURL(st.videoFile));
        return;
      }
      push(items);
      function push(its) {
        its.forEach(function (it, i) { it.id = CC.uid('g'); it.title = title || (its.length > 1 ? 'Photo ' + (i + 1) : 'New item'); it.category = cat; it.home = home; CC.data.gallery.unshift(it); });
        if (save()) { closeMod(); mFilter = 'all'; render(); }
      }
    };
  }

  /* ========================================================================
     SERVICES
     ======================================================================== */
  function viewServices(v) {
    var S = CC.data.services;
    v.innerHTML = '<div class="page-head"><div><h2>Services</h2><p class="sub">What you offer. Active services appear on the Services page; ticked ones also on the Home page.</p></div><button class="btn gold" id="add">' + ic('plus') + 'Add service</button></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th></th><th>Service</th><th>Category</th><th>Time</th><th>Active</th><th>On home</th><th></th></tr></thead><tbody>' + S.map(function (s, i) {
        return '<tr><td style="width:84px"><img src="' + E(url(s.img)) + '" alt="" style="width:64px;height:46px;object-fit:cover;border-radius:8px"></td><td><b>' + E(s.name) + '</b><small>' + E(s.desc).slice(0, 70) + '…</small></td><td>' + E(CC.catLabel[s.category] || s.category) + '</td><td>' + E(s.duration) + '</td>' +
          '<td><label class="switch"><input type="checkbox" data-t="active" data-id="' + s.id + '"' + (s.active ? ' checked' : '') + '><i></i></label></td><td><label class="switch"><input type="checkbox" data-t="home" data-id="' + s.id + '"' + (s.home ? ' checked' : '') + '><i></i></label></td>' +
          '<td><div class="row-act"><button class="btn icon sm" data-mv="-1" data-id="' + s.id + '">' + ic('up') + '</button><button class="btn icon sm" data-mv="1" data-id="' + s.id + '">' + ic('down') + '</button><button class="btn sm" data-edit="' + s.id + '">' + ic('edit') + 'Edit</button><button class="btn icon sm danger" data-del="' + s.id + '">' + ic('trash') + '</button></div></td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="note" style="margin-top:20px">' + ic('info') + '<span>Prices are intentionally not shown on the website — each service is priced by vehicle class, so customers get an exact quote after sharing their car. (In the real build, per-class pricing lives in <b>Services & pricing</b> as it does today.)</span></div>';
    function S_(id) { return CC.data.services.filter(function (x) { return x.id === id; })[0]; }
    $('#add', v).onclick = function () { editService(null, v); };
    $$('[data-t]', v).forEach(function (c) { c.onchange = function () { S_(c.getAttribute('data-id'))[c.getAttribute('data-t')] = c.checked; save(); }; });
    $$('[data-edit]', v).forEach(function (b) { b.onclick = function () { editService(S_(b.getAttribute('data-edit')), v); }; });
    $$('[data-mv]', v).forEach(function (b) { b.onclick = function () { var a = CC.data.services, i = a.indexOf(S_(b.getAttribute('data-id'))), j = i + (+b.getAttribute('data-mv')); if (j < 0 || j >= a.length) return; var t = a[i]; a[i] = a[j]; a[j] = t; save(); viewServices(v); }; });
    $$('[data-del]', v).forEach(function (b) { b.onclick = function () { confirmBox('Delete this service?', function () { CC.data.services = CC.data.services.filter(function (x) { return x.id !== b.getAttribute('data-del'); }); save(); viewServices(v); }); }; });
  }
  function editService(s, v, forceNew) {
    var isNew = forceNew || !s; s = s || { id: CC.uid('s'), name: '', slug: '', category: 'windshield', active: true, home: true, badge: '', duration: '60–90 min', desc: '', features: [], img: 'assets/img/service-windshield.jpg' };
    var tmp = JSON.parse(JSON.stringify(s));
    var b = modal('<div class="mod-h"><h3>' + (isNew ? 'Add service' : 'Edit service') + '</h3><button class="btn icon" data-close>' + ic('x') + '</button></div>' +
      '<div class="f"><label>Name</label><input class="in" id="s-name" value="' + E(tmp.name) + '"></div><div class="r3"><div class="f"><label>Category</label><select class="sel" id="s-cat">' + Object.keys(CC.catLabel).map(function (c) { return '<option value="' + c + '"' + (c === tmp.category ? ' selected' : '') + '>' + CC.catLabel[c] + '</option>'; }).join('') + '</select></div><div class="f"><label>Typical time</label><input class="in" id="s-dur" value="' + E(tmp.duration) + '"></div><div class="f"><label>Ribbon (optional)</label><input class="in" id="s-badge" placeholder="Most popular" value="' + E(tmp.badge) + '"></div></div>' +
      '<div class="f"><label>Description</label><textarea class="ta" id="s-desc">' + E(tmp.desc) + '</textarea></div><div class="f"><label>Highlights (one per line)</label><textarea class="ta" id="s-feat" rows="4">' + E((tmp.features || []).join('\n')) + '</textarea></div>' +
      '<div class="f"><label>Image</label><div class="imgf" id="s-img"><img src="' + E(url(tmp.img)) + '" alt=""><div class="acts"><label class="btn sm" style="cursor:pointer">' + ic('upload') + 'Upload<input type="file" accept="image/*" hidden></label><button class="btn sm" id="s-lib" type="button">Library</button></div></div></div>' +
      '<div style="display:flex;justify-content:flex-end;gap:10px"><button class="btn" data-close>Cancel</button><button class="btn gold" id="s-save">' + ic('check') + 'Save service</button></div>');
    $('input[type=file]', b).onchange = function (e) { if (e.target.files[0]) CC.compress(e.target.files[0], 1200).then(function (d) { tmp.img = d; $('#s-img img', b).src = d; }); };
    function grab() { tmp.name = $('#s-name', b).value; tmp.category = $('#s-cat', b).value; tmp.duration = $('#s-dur', b).value; tmp.badge = $('#s-badge', b).value; tmp.desc = $('#s-desc', b).value; tmp.features = $('#s-feat', b).value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean); }
    $('#s-lib', b).onclick = function () { grab(); pickImage(function (p) { tmp.img = p; editService(tmp, v, isNew); }); };
    $('#s-save', b).onclick = function () {
      var n = $('#s-name', b).value.trim(); if (!n) return toast('Give the service a name');
      tmp.name = n; tmp.slug = n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); tmp.category = $('#s-cat', b).value; tmp.duration = $('#s-dur', b).value; tmp.badge = $('#s-badge', b).value; tmp.desc = $('#s-desc', b).value;
      tmp.features = $('#s-feat', b).value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
      var ix = -1; CC.data.services.forEach(function (x, k) { if (x.id === tmp.id) ix = k; });
      if (ix < 0) CC.data.services.push(tmp); else CC.data.services[ix] = tmp;
      if (save()) { closeMod(); viewServices(v); }
    };
  }

  /* ========================================================================
     REVIEWS
     ======================================================================== */
  function viewReviews(v) {
    var R = CC.data.reviews;
    v.innerHTML = '<div class="page-head"><div><h2>Reviews</h2><p class="sub">Choose which customer reviews are shown on the website.</p></div><button class="btn gold" id="add">' + ic('plus') + 'Add review</button></div>' +
      '<div class="note warn">' + ic('info') + '<span>These five reviews are <b>sample placeholders</b> carried over from the current site. Replace them with real customer reviews (with permission) before launch.</span></div>' +
      '<div class="grid g3">' + R.map(function (r) {
        return '<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:12px"><div style="color:var(--gold);letter-spacing:2px">' + '★★★★★'.slice(0, r.rating) + '<span style="color:var(--line-2)">' + '★★★★★'.slice(r.rating) + '</span></div><label class="switch" title="Show on website"><input type="checkbox" data-id="' + r.id + '"' + (r.show ? ' checked' : '') + '><i></i></label></div><p style="margin-bottom:16px">“' + E(r.text) + '”</p><div style="display:flex;align-items:center;gap:10px"><span class="av">' + initials(r.name) + '</span><b style="flex:1">' + E(r.name) + '</b><button class="btn icon sm" data-edit="' + r.id + '">' + ic('edit') + '</button><button class="btn icon sm danger" data-del="' + r.id + '">' + ic('trash') + '</button></div></div>';
      }).join('') + '</div>';
    function R_(id) { return CC.data.reviews.filter(function (x) { return x.id === id; })[0]; }
    $('#add', v).onclick = function () { editReview(null, v); };
    $$('input[data-id]', v).forEach(function (c) { c.onchange = function () { R_(c.getAttribute('data-id')).show = c.checked; save(); }; });
    $$('[data-edit]', v).forEach(function (b) { b.onclick = function () { editReview(R_(b.getAttribute('data-edit')), v); }; });
    $$('[data-del]', v).forEach(function (b) { b.onclick = function () { confirmBox('Delete this review?', function () { CC.data.reviews = CC.data.reviews.filter(function (x) { return x.id !== b.getAttribute('data-del'); }); save(); viewReviews(v); }); }; });
  }
  function editReview(r, v) {
    var isNew = !r; r = r || { id: CC.uid('r'), name: '', rating: 5, text: '', show: true };
    var b = modal('<div class="mod-h"><h3>' + (isNew ? 'Add review' : 'Edit review') + '</h3><button class="btn icon" data-close>' + ic('x') + '</button></div><div class="r2"><div class="f"><label>Customer name</label><input class="in" id="r-n" value="' + E(r.name) + '"></div><div class="f"><label>Rating</label><select class="sel" id="r-r">' + [5, 4, 3].map(function (n) { return '<option' + (n === r.rating ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></div></div><div class="f"><label>Review</label><textarea class="ta" id="r-t">' + E(r.text) + '</textarea></div><div style="display:flex;justify-content:flex-end;gap:10px"><button class="btn" data-close>Cancel</button><button class="btn gold" id="r-s">Save</button></div>');
    $('#r-s', b).onclick = function () { var n = $('#r-n', b).value.trim(), t = $('#r-t', b).value.trim(); if (!n || !t) return toast('Name and review are required'); r.name = n; r.text = t; r.rating = +$('#r-r', b).value; if (isNew) CC.data.reviews.unshift(r); save(); closeMod(); viewReviews(v); };
  }

  /* ========================================================================
     DATA & BACKUP
     ======================================================================== */
  function viewData(v) {
    v.innerHTML = '<div class="page-head"><div><h2>Data & backup</h2><p class="sub">Prototype tools for this demo.</p></div></div><div class="grid g2">' +
      '<div class="card"><h3>Export content</h3><p class="sub" style="margin-bottom:16px">Download everything (text, services, gallery, bookings) as a JSON backup.</p><button class="btn gold" id="exp">' + ic('download') + 'Download backup</button></div>' +
      '<div class="card"><h3>Import content</h3><p class="sub" style="margin-bottom:16px">Restore from a backup file.</p><label class="btn" style="cursor:pointer">' + ic('upload') + 'Choose file<input type="file" id="imp" accept="application/json" hidden></label></div>' +
      '<div class="card"><h3>Reset demo data</h3><p class="sub" style="margin-bottom:16px">Remove every change you made in this prototype and restore the starting content.</p><button class="btn danger" id="rst">' + ic('trash') + 'Reset everything</button></div>' +
      '<div class="card"><h3>How this connects to the real site</h3><p class="sub">In the production build these same screens read and write your <b>Supabase</b> tables (services, gallery, reviews, bookings, settings) and upload media to <b>Supabase Storage</b>. The prototype keeps data in this browser only, so changes won’t appear on other devices.</p></div></div>';
    $('#exp', v).onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(CC.data, null, 2)], { type: 'application/json' })); a.download = 'car-care-backup.json'; a.click(); };
    $('#imp', v).onchange = function (e) { var f = e.target.files[0]; if (!f) return; var fr = new FileReader(); fr.onload = function () { try { CC.data = JSON.parse(fr.result); save(); toast('Imported'); render(); } catch (x) { toast('Invalid file'); } }; fr.readAsText(f); };
    $('#rst', v).onclick = function () { confirmBox('This removes all your changes and restores the demo content.', function () { CC.reset(); toast('Reset'); render(); }); };
  }

  /* ========================================================================
     router
     ======================================================================== */
  var VIEWS = { dashboard: viewDashboard, bookings: viewBookings, leads: viewLeads, media: viewMedia, services: viewServices, reviews: viewReviews, data: viewData,
    home: function (v) { viewEditor(v, 'home'); }, about: function (v) { viewEditor(v, 'about'); }, contact: function (v) { viewEditor(v, 'contact'); }, brand: function (v) { viewEditor(v, 'brand'); } };
  function render() {
    var r = (location.hash || '#dashboard').slice(1); if (!VIEWS[r]) r = 'dashboard';
    var v = $('#view'); if (v._cleanup) { v._cleanup(); v._cleanup = null; }
    $$('.nav-a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-r') === r); });
    $('#ttl').textContent = TITLES[r]; document.title = TITLES[r] + ' · Admin';
    VIEWS[r](v); updateCounts(); window.scrollTo(0, 0);
  }
  shell(); applyAdminAccent();
  window.addEventListener('hashchange', render);
  render();
})();
