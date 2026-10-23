/* Car Care Daddy — public site behaviour (prototype). Needs store.js first. */
(function () {
  var CC = window.CC, E = CC.esc;
  var page = document.body.getAttribute('data-page') || 'home';

  /* ---------- icons (lucide-style, stroke) ---------- */
  var P = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-10 6L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    shield: '<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
    wallet: '<path d="M20 12V8a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    spark: '<path d="m12 3 1.9 5.6L20 10l-6.1 1.4L12 17l-1.9-5.6L4 10l6.1-1.4zM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    play: '<path d="M6 4v16l14-8z" fill="currentColor" stroke="none"/>',
    compare: '<path d="M12 3v18M4 7l-2 5 2 5M20 7l2 5-2 5"/>',
    video: '<rect x="2" y="5" width="14" height="14" rx="3"/><path d="m22 8-6 4 6 4z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    car: '<path d="M5 17H3v-5l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v5h-2"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M3 12h18"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
    bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
    drop: '<path d="M12 2.7S5 10 5 14.5a7 7 0 0 0 14 0C19 10 12 2.7 12 2.7z"/>'
  };
  function I(n, cls) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"' + (cls ? ' class="' + cls + '"' : '') + '>' + (P[n] || '') + '</svg>'; }
  var WA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2-5.4A8.4 8.4 0 1 1 21 11.5z"/><path d="M9 8.8c.3 2.600 2.600 5 5.300 5.500l1-1.200-1.800-.9-.8.700a5 5 0 0 1-2-2l.7-.8-.9-1.800z" fill="currentColor" stroke="none"/></svg>';
  var IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';
  var FB = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8V6.5c0-.7.3-1 1-1h2V2h-3a4 4 0 0 0-4 4.2V8H7v3.5h3V22h4v-10.500h3l.5-3.500z"/></svg>';

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function toast(msg) {
    var t = $('.toast'); if (!t) return;
    t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 2800);
  }
  function applyAccent() {
    var a = CC.get('settings.brand.accent') || '#D4A24C';
    var r = document.documentElement.style;
    r.setProperty('--gold', a);
    function mix(hex, amt) {
      var n = parseInt(hex.slice(1), 16), R = n >> 16, G = (n >> 8) & 255, B = n & 255;
      function f(c) { return Math.max(0, Math.min(255, Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt)))); }
      return '#' + ((1 << 24) + (f(R) << 16) + (f(G) << 8) + f(B)).toString(16).slice(1);
    }
    r.setProperty('--gold-hi', mix(a, .45)); r.setProperty('--gold-lo', mix(a, -.32));
  }

  /* ---------- shell: header / drawer / footer / modal / lightbox ---------- */
  var NAV = [['index.html', 'Home', 'home'], ['services.html', 'Services', 'services'], ['gallery.html', 'Gallery', 'gallery'], ['about.html', 'About', 'about'], ['contact.html', 'Contact', 'contact']];
  function shell() {
    var navHtml = NAV.map(function (n) { return '<a href="' + n[0] + '"' + (n[2] === page ? ' class="active"' : '') + '>' + n[1] + '</a>'; }).join('');
    var h = document.createElement('div');
    h.innerHTML =
      '<header class="header' + (page === 'home' ? '' : ' solid') + '" id="hdr"><div class="wrap">' +
      '<a class="brand" href="index.html" aria-label="Car Care Daddy home"><img src="assets/img/logo-mark.png" alt=""><span><b data-t="settings.brand.name">Car Care Daddy</b><small data-t="settings.brand.tagline">Your car, our care</small></span></a>' +
      '<nav class="nav" aria-label="Main">' + navHtml + '</nav>' +
      '<div class="header-cta"><a class="btn btn-ghost btn-sm" data-tel>' + I('phone') + '<span data-t="settings.contact.phone"></span></a>' +
      '<button class="btn btn-gold btn-sm" data-book>Book now</button>' +
      '<button class="burger" id="burger" aria-label="Menu"><span></span></button></div></div></header>' +
      '<div class="drawer" id="drawer">' + navHtml + '<button class="btn btn-gold" data-book>Book now</button><a class="btn btn-ghost" data-wa>' + WA + ' WhatsApp us</a></div>';
    while (h.firstChild) document.body.insertBefore(h.firstChild, document.body.firstChild);

    var f = document.createElement('div');
    f.innerHTML =
      '<footer class="footer"><div class="wrap"><div class="f-grid">' +
      '<div><a class="brand" href="index.html"><img src="assets/img/logo-mark.png" alt=""><span><b data-t="settings.brand.name"></b><small data-t="settings.brand.tagline"></small></span></a>' +
      '<p style="margin-top:18px;max-width:34ch">Doorstep CeO₂ windshield restoration, glass polishing, headlight restoration and detailing — <span data-t="settings.contact.city"></span>.</p>' +
      '<div class="socials"><a data-fb aria-label="Facebook" target="_blank" rel="noopener">' + FB + '</a><a data-ig aria-label="Instagram" target="_blank" rel="noopener">' + IG + '</a><a data-wa aria-label="WhatsApp" target="_blank" rel="noopener">' + WA + '</a></div></div>' +
      '<div><h4>Explore</h4><ul>' + NAV.map(function (n) { return '<li><a href="' + n[0] + '">' + n[1] + '</a></li>'; }).join('') + '</ul></div>' +
      '<div><h4>Services</h4><ul data-foot-services></ul></div>' +
      '<div><h4>Contact</h4><ul><li><a data-tel><span data-t="settings.contact.phone"></span></a></li><li><a data-mail></a></li><li><p data-t="settings.contact.area"></p></li></ul></div>' +
      '</div><div class="f-bottom"><span>© <span id="yr"></span> <span data-t="settings.brand.name"></span>. All rights reserved.</span><span><a href="admin/login.html" style="color:inherit">Admin login</a></span></div></div></footer>' +
      '<a class="fab" data-wa target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' + WA + '</a>' +
      '<div class="toast" role="status"></div>' +
      '<div class="lightbox" id="lb"><button class="x" aria-label="Close">' + I('x') + '</button><div id="lb-body"></div><div class="cap" id="lb-cap"></div></div>' +
      '<div class="modal" id="book-modal" role="dialog" aria-modal="true" aria-label="Book a service"></div>';
    while (f.firstChild) document.body.appendChild(f.firstChild);
    $('#yr').textContent = new Date().getFullYear();

    window.addEventListener('scroll', function () { $('#hdr').classList.toggle('scrolled', window.scrollY > 30); }, { passive: true });
    $('#burger').onclick = function () { document.body.classList.toggle('menu-open'); };
    $$('#drawer a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu-open'); }); });
    $('#lb .x').onclick = closeLB;
    $('#lb').addEventListener('click', function (e) { if (e.target.id === 'lb') closeLB(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeLB(); closeBook(); } });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-book]');
      if (b) { e.preventDefault(); document.body.classList.remove('menu-open'); openBook(b.getAttribute('data-book')); }
    });
  }

  /* ---------- data binding ---------- */
  function bind() {
    applyAccent();
    document.title = (page === 'home' ? CC.get('settings.seo.title') : document.title.split('·')[0].trim() + ' · ' + CC.get('settings.brand.name'));
    $$('[data-t]').forEach(function (el) { var v = CC.get(el.getAttribute('data-t')); if (v != null) el.textContent = v; });
    $$('[data-src]').forEach(function (el) { var v = CC.get(el.getAttribute('data-src')); if (v) el.setAttribute('src', v); });
    $$('[data-section]').forEach(function (el) { el.hidden = CC.get('home.sections.' + el.getAttribute('data-section')) === false; });
    $$('[data-tel]').forEach(function (a) { a.href = CC.tel(); });
    $$('[data-wa]').forEach(function (a) { a.href = CC.waLink('Hi Car Care Daddy, I would like a quote.'); a.target = '_blank'; });
    $$('[data-mail]').forEach(function (a) { var m = CC.get('settings.contact.email'); a.href = 'mailto:' + m; if (!a.children.length) a.textContent = m; });
    $$('[data-mail-text]').forEach(function (el) { el.textContent = CC.get('settings.contact.email'); });
    $$('[data-fb]').forEach(function (a) { a.href = CC.get('settings.contact.facebook'); });
    $$('[data-ig]').forEach(function (a) { a.href = CC.get('settings.contact.instagram'); });
    $$('[data-stats]').forEach(function (el) {
      el.innerHTML = CC.get(el.getAttribute('data-stats')).map(function (s) { return '<div class="stat"><b class="gold-text">' + E(s.n) + '<small style="font-size:.5em">' + E(s.s) + '</small></b><span>' + E(s.l) + '</span></div>'; }).join('');
    });
    $$('[data-hours]').forEach(function (el) {
      el.innerHTML = CC.get('settings.hours').map(function (h) { return '<div class="hr"><b style="font-weight:500">' + E(h.d) + '</b><span>' + E(h.t) + '</span></div>'; }).join('');
    });
    var fs = $('[data-foot-services]');
    if (fs) fs.innerHTML = CC.get('services').filter(function (s) { return s.active; }).map(function (s) { return '<li><a href="services.html#' + E(s.slug) + '">' + E(s.name) + '</a></li>'; }).join('');
    var hv = $('#hero-video');
    if (hv) { var v = CC.get('home.heroVideo'); if (v && hv.getAttribute('src') !== v) hv.setAttribute('src', v); hv.poster = CC.get('home.heroPoster'); }
  }

  /* ---------- services ---------- */
  function renderServices() {
    var all = CC.get('services').filter(function (s) { return s.active; });
    var b = $('#svc-bento');
    if (b) {
      var list = all.filter(function (s) { return s.home; });
      b.innerHTML = list.map(function (s) {
        return '<article class="svc rv"><img src="' + E(s.img) + '" alt="' + E(s.name) + '" loading="lazy">' +
          (s.badge ? '<span class="tag">' + E(s.badge) + '</span>' : '') + '<span class="dur">' + I('clock', '') + ' ' + E(s.duration) + '</span>' +
          '<div class="svc-body"><h3>' + E(s.name) + '</h3><p>' + E(s.desc) + '</p>' +
          '<a class="link-arrow" href="services.html#' + E(s.slug) + '">Details ' + I('arrow') + '</a></div></article>';
      }).join('');
    }
    var l = $('#svc-list');
    if (l) {
      l.innerHTML = all.map(function (s, i) {
        return '<article class="svc-row rv" id="' + E(s.slug) + '"><div class="svc-media"><img src="' + E(s.img) + '" alt="' + E(s.name) + '" loading="lazy"></div>' +
          '<div class="svc-info"><span class="num">0' + (i + 1) + ' — ' + E((CC.catLabel[s.category] || s.category).toUpperCase()) + '</span>' +
          '<h2>' + E(s.name) + '</h2><p class="lead">' + E(s.desc) + '</p>' +
          '<ul class="checks">' + (s.features || []).map(function (f) { return '<li>' + E(f) + '</li>'; }).join('') + '</ul>' +
          '<div class="meta-row"><div><b>' + E(s.duration) + '</b>Typical time</div><div><b>Doorstep</b>We come to you</div><div><b>3 years</b>Results warranty</div></div>' +
          '<div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn btn-gold" data-book="' + E(s.name) + '">Book this service</button><a class="btn btn-ghost" target="_blank" href="' + CC.waLink('Hi, I would like a price for ' + s.name) + '">' + WA + ' Get price</a></div></div></article>';
      }).join('');
    }
    var sel = $$('select[data-service-select]');
    sel.forEach(function (s) { s.innerHTML = '<option value="">Select a service</option>' + all.map(function (x) { return '<option>' + E(x.name) + '</option>'; }).join(''); });
  }

  /* ---------- about page ---------- */
  function renderAbout() {
    var st = $('#about-story'); if (st) st.innerHTML = CC.get('about.story').map(function (p) { return '<p>' + E(p) + '</p>'; }).join('');
    var v = $('#vals'); if (v) v.innerHTML = CC.get('about.values').map(function (x, i) { return '<div class="val rv"><span class="ico">' + I(['eye', 'timer', 'wallet', 'shield'][i % 4]) + '</span><h3>' + E(x.t) + '</h3><p>' + E(x.d) + '</p></div>'; }).join('');
  }

  /* ---------- reviews ---------- */
  function renderReviews() {
    var t = $('#rev-track'); if (!t) return;
    t.innerHTML = CC.get('reviews').filter(function (r) { return r.show; }).map(function (r) {
      return '<figure class="rev"><div class="stars" aria-label="' + r.rating + ' out of 5">' + '★★★★★'.slice(0, r.rating) + '<span style="color:var(--line-2)">' + '★★★★★'.slice(r.rating) + '</span></div><p>“' + E(r.text) + '”</p>' +
        '<div class="who"><span class="avatar">' + E(r.name.charAt(0)) + '</span><div><b>' + E(r.name) + '</b><small>Verified customer · Lahore</small></div></div></figure>';
    }).join('');
  }

  /* ---------- compare slider ---------- */
  function cmpHTML(g, big) {
    return '<div class="cmp" style="--p:50%"><img src="' + E(g.before) + '" alt="Before ' + E(g.title) + '" draggable="false"><img class="after" src="' + E(g.after) + '" alt="After ' + E(g.title) + '" draggable="false">' +
      '<span class="lbl b">Before</span><span class="lbl a">After</span><div class="handle"></div></div>';
  }
  function initCompare(root) {
    $$('.cmp', root).forEach(function (c) {
      if (c._i) return; c._i = 1;
      var drag = false;
      function mv(x) { var r = c.getBoundingClientRect(); var p = Math.max(0, Math.min(100, (x - r.left) / r.width * 100)); c.style.setProperty('--p', p + '%'); }
      c.addEventListener('pointerdown', function (e) { drag = true; c.setPointerCapture(e.pointerId); mv(e.clientX); e.stopPropagation(); });
      c.addEventListener('pointermove', function (e) { if (drag) mv(e.clientX); });
      c.addEventListener('pointerup', function () { drag = false; });
      c.addEventListener('pointercancel', function () { drag = false; });
      /* gentle intro nudge when first scrolled into view */
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); var s = performance.now(); (function a(t) { var k = (t - s) / 1600; if (k > 1 || drag) return; c.style.setProperty('--p', (50 + Math.sin(k * Math.PI * 2) * 18 * (1 - k)) + '%'); requestAnimationFrame(a); })(s); } }, { threshold: .6 });
      io.observe(c);
    });
  }

  /* ---------- swiper (home) ---------- */
  var swTimer;
  function renderSwiper() {
    var m = $('#swiper'); if (!m) return;
    var items = CC.get('gallery').filter(function (g) { return g.home; });
    if (!items.length) { m.innerHTML = '<p class="muted" style="text-align:center">Add before/after items from the admin panel.</p>'; return; }
    var slides = items.map(function (g) {
      var inner, label;
      if (g.type === 'compare') { inner = cmpHTML(g); label = I('compare') + ' Before / After'; }
      else if (g.type === 'video') { inner = '<video src="' + E(g.src) + '" poster="' + E(g.poster || '') + '" playsinline preload="none" loop></video><div class="vid-play" role="button" aria-label="Play video"><span>' + I('play') + '</span></div>'; label = I('video') + ' Video'; }
      else { inner = '<img src="' + E(g.src) + '" alt="' + E(g.title) + '" loading="lazy">'; label = I('image') + ' Photo'; }
      return '<div class="sw-slide">' + inner + '<span class="badge-type">' + label + '</span>' +
        (g.type === 'compare' ? '' : '') +
        '<div class="sw-cap"><div><small>' + E(CC.catLabel[g.category] || g.category) + '</small><b>' + E(g.title) + '</b></div></div></div>';
    }).join('');
    m.innerHTML = '<div class="sw-viewport"><div class="sw-track">' + slides + '</div></div>' +
      '<div class="sw-nav"><div class="sw-dots">' + items.map(function (_, i) { return '<button aria-label="Slide ' + (i + 1) + '"></button>'; }).join('') + '</div>' +
      '<div class="sw-arrows"><button class="prev" aria-label="Previous">' + I('left') + '</button><button class="next" aria-label="Next">' + I('right') + '</button></div></div>';
    var track = $('.sw-track', m), vp = $('.sw-viewport', m), dots = $$('.sw-dots button', m), idx = 0, n = items.length;
    function go(i) {
      idx = (i + n) % n; track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('on', k === idx); });
      $$('video', m).forEach(function (v) { v.pause(); v.parentNode.classList.remove('playing'); });
    }
    function auto() { clearInterval(swTimer); swTimer = setInterval(function () { if (!document.hidden) go(idx + 1); }, 6500); }
    $('.prev', m).onclick = function () { go(idx - 1); auto(); };
    $('.next', m).onclick = function () { go(idx + 1); auto(); };
    dots.forEach(function (d, k) { d.onclick = function () { go(k); auto(); }; });
    $$('.vid-play', m).forEach(function (p) { p.onclick = function () { var v = p.parentNode.querySelector('video'); v.controls = true; v.play(); p.parentNode.classList.add('playing'); clearInterval(swTimer); }; });
    /* swipe (touch / mouse) — ignores drags that start on a compare handle */
    var sx = null;
    vp.addEventListener('pointerdown', function (e) { if (e.target.closest('.cmp')) return; sx = e.clientX; });
    vp.addEventListener('pointerup', function (e) { if (sx == null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) { go(idx + (dx < 0 ? 1 : -1)); auto(); } });
    vp.addEventListener('mouseenter', function () { clearInterval(swTimer); });
    vp.addEventListener('mouseleave', auto);
    initCompare(m); go(0); auto();
  }

  /* ---------- gallery page ---------- */
  var activeFilter = 'all';
  function renderGallery() {
    var m = $('#gallery'); if (!m) return;
    var items = CC.get('gallery');
    var cats = ['all'].concat(Array.from(new Set(items.map(function (g) { return g.category; }))));
    cats.push('__ba'); cats.push('__vid');
    var lbl = function (c) { return c === 'all' ? 'All' : c === '__ba' ? 'Before & After' : c === '__vid' ? 'Videos' : (CC.catLabel[c] || c); };
    $('#filters').innerHTML = cats.map(function (c) { return '<button class="chipbtn' + (c === activeFilter ? ' on' : '') + '" data-f="' + c + '">' + E(lbl(c)) + '</button>'; }).join('');
    $$('#filters button').forEach(function (b) { b.onclick = function () { activeFilter = b.getAttribute('data-f'); renderGallery(); }; });
    var shown = items.filter(function (g) { return activeFilter === 'all' || (activeFilter === '__ba' ? g.type === 'compare' : activeFilter === '__vid' ? g.type === 'video' : g.category === activeFilter); });
    m.innerHTML = shown.map(function (g) {
      var kind = g.type === 'compare' ? I('compare') + ' Before / After' : g.type === 'video' ? I('video') + ' Video' : I('image') + ' Photo';
      var ov = '<div class="ov"><small>' + E(CC.catLabel[g.category] || g.category) + '</small><b>' + E(g.title) + '</b></div>';
      if (g.type === 'compare') return '<div class="mi rv" data-id="' + g.id + '"><span class="kind">' + kind + '</span>' + cmpHTML(g) + ov + '</div>';
      if (g.type === 'video') return '<button class="mi vid rv" data-id="' + g.id + '"><span class="kind">' + kind + '</span><img src="' + E(g.poster || '') + '" alt="' + E(g.title) + '" loading="lazy"><div class="pl"><span>' + I('play') + '</span></div>' + ov + '</button>';
      return '<button class="mi rv" data-id="' + g.id + '"><span class="kind">' + kind + '</span><img src="' + E(g.src) + '" alt="' + E(g.title) + '" loading="lazy">' + ov + '</button>';
    }).join('');
    $('#g-empty').style.display = shown.length ? 'none' : 'block';
    $$('.mi', m).forEach(function (el) {
      if (el.tagName === 'BUTTON') el.onclick = function () { openLB(el.getAttribute('data-id')); };
    });
    initCompare(m); reveal();
  }
  function openLB(id) {
    var g = CC.get('gallery').filter(function (x) { return x.id === id; })[0]; if (!g) return;
    $('#lb-body').innerHTML = g.type === 'video' ? '<video src="' + E(g.src) + '" controls autoplay playsinline></video>' : '<img src="' + E(g.src) + '" alt="' + E(g.title) + '">';
    $('#lb-cap').textContent = g.title; $('#lb').classList.add('on'); document.body.style.overflow = 'hidden';
  }
  function closeLB() { var l = $('#lb'); if (!l) return; l.classList.remove('on'); $('#lb-body').innerHTML = ''; document.body.style.overflow = ''; }

  /* ---------- booking modal ---------- */
  function slots(dateStr) {
    var out = []; for (var h = 9; h < 20; h++) { out.push((h % 12 || 12) + ':00 ' + (h < 12 ? 'AM' : 'PM')); } return out;
  }
  function openBook(pre) {
    var m = $('#book-modal');
    var today = new Date().toISOString().slice(0, 10);
    m.innerHTML = '<div class="modal-box"><button class="x" aria-label="Close">' + I('x') + '</button>' +
      '<span class="eyebrow">Free doorstep service</span><h3 style="margin-top:10px">Book your service</h3><p class="muted" style="color:var(--muted);margin-bottom:22px;font-size:.92rem">Tell us a few details — we’ll confirm your slot and exact price on WhatsApp.</p>' +
      '<form id="book-form" novalidate><div class="row2"><div class="field"><label>Your name</label><input class="input" name="name" required placeholder="e.g. Ali Raza"></div>' +
      '<div class="field"><label>Phone / WhatsApp</label><input class="input" name="phone" required inputmode="tel" placeholder="03xx xxxxxxx"></div></div>' +
      '<div class="row2"><div class="field"><label>Car (make & model)</label><input class="input" name="car" required placeholder="e.g. Honda Civic 2019"></div>' +
      '<div class="field"><label>Service</label><select class="select" name="service" data-service-select required></select></div></div>' +
      '<div class="row2"><div class="field"><label>Preferred date</label><input class="input" type="date" name="date" min="' + today + '" required value="' + today + '"></div>' +
      '<div class="field"><label>Time</label><select class="select" name="time">' + slots().map(function (s) { return '<option>' + s + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="field"><label>Your area in Lahore</label><input class="input" name="area" required placeholder="e.g. DHA Phase 5, Gulberg, Johar Town"></div>' +
      '<button class="btn btn-gold" style="width:100%;margin-top:6px" type="submit">Confirm booking request ' + I('arrow') + '</button></form></div>';
    renderServices();
    if (pre) { var s = $('select[name=service]', m); Array.prototype.forEach.call(s.options, function (o) { if (o.text === pre) s.value = pre; }); }
    m.classList.add('on'); document.body.style.overflow = 'hidden';
    $('.x', m).onclick = closeBook;
    m.onclick = function (e) { if (e.target === m) closeBook(); };
    $('#book-form').onsubmit = function (e) {
      e.preventDefault();
      var f = new FormData(e.target), o = {};
      f.forEach(function (v, k) { o[k] = String(v).trim(); });
      if (!o.name || !o.phone || !o.car || !o.service || !o.area) { toast('Please fill in all fields'); return; }
      var when = new Date(o.date + ' ' + o.time);
      CC.data.bookings.unshift({ id: CC.uid('b'), name: o.name, phone: o.phone, car: o.car, service: o.service, area: o.area, when: isNaN(when) ? new Date().toISOString() : when.toISOString(), status: 'pending', created: new Date().toISOString() });
      CC.save();
      var msg = 'Hi Car Care Daddy! New booking request:\n• ' + o.service + '\n• ' + o.car + '\n• ' + o.date + ' at ' + o.time + '\n• Area: ' + o.area + '\n• Name: ' + o.name;
      $('.modal-box', m).innerHTML = '<div class="done"><div class="tick">' + I('check') + '</div><h3>Request received!</h3><p style="color:var(--muted);margin:10px 0 26px">Thank you, ' + E(o.name.split(' ')[0]) + '. We’ll confirm your slot shortly. Speed things up by sending the details on WhatsApp.</p>' +
        '<a class="btn btn-gold" style="width:100%" target="_blank" href="' + CC.waLink(msg) + '">' + WA + ' Send on WhatsApp</a><button class="btn btn-ghost" style="width:100%;margin-top:10px" id="close-done">Close</button></div>';
      $('#close-done').onclick = closeBook;
    };
  }
  function closeBook() { var m = $('#book-modal'); if (!m) return; m.classList.remove('on'); m.innerHTML = ''; document.body.style.overflow = ''; }

  /* ---------- quick quote (hero) + contact forms ---------- */
  function forms() {
    var q = $('#quick-quote');
    if (q) q.onsubmit = function (e) {
      e.preventDefault();
      var f = new FormData(q), o = {}; f.forEach(function (v, k) { o[k] = String(v).trim(); });
      if (!o.car || !o.service) { toast('Add your car and pick a service'); return; }
      CC.data.leads.unshift({ id: CC.uid('l'), name: 'Quick quote', phone: o.phone || '—', email: '', message: o.service + ' for ' + o.car, source: 'Quick quote', created: new Date().toISOString(), status: 'new' }); CC.save();
      window.open(CC.waLink('Hi! I need a price for ' + o.service + ' on my ' + o.car + '.'), '_blank'); toast('Opening WhatsApp…'); q.reset();
    };
    var c = $('#contact-form');
    if (c) c.onsubmit = function (e) {
      e.preventDefault();
      var f = new FormData(c), o = {}; f.forEach(function (v, k) { o[k] = String(v).trim(); });
      if (!o.name || !o.phone || !o.message) { toast('Name, phone and message please'); return; }
      CC.data.leads.unshift({ id: CC.uid('l'), name: o.name, phone: o.phone, email: o.email || '', message: (o.service ? '[' + o.service + '] ' : '') + o.message, source: 'Contact form', created: new Date().toISOString(), status: 'new' }); CC.save();
      c.innerHTML = '<div class="done"><div class="tick">' + I('check') + '</div><h3>Message sent</h3><p style="color:var(--muted);margin-top:10px">Thanks ' + E(o.name.split(' ')[0]) + ' — we’ll reply on <b>' + E(o.phone) + '</b> shortly.</p></div>';
    };
  }

  /* ---------- static icon slots ---------- */
  function icons() { $$('[data-i]').forEach(function (el) { el.innerHTML = I(el.getAttribute('data-i')); }); $$('[data-wa-icon]').forEach(function (el) { el.innerHTML = WA; }); }

  /* ---------- reveal on scroll ---------- */
  var io;
  function reveal() {
    if (!('IntersectionObserver' in window)) { $$('.rv').forEach(function (e) { e.classList.add('in'); }); return; }
    io = io || new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    $$('.rv:not(.in)').forEach(function (e, i) { e.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(e); });
  }

  /* ---------- go ---------- */
  function render() { bind(); renderServices(); renderReviews(); renderAbout(); renderSwiper(); renderGallery(); icons(); initCompare(document); reveal(); }
  window.CCRender = render;
  window.CCOpenBook = openBook;
  shell(); forms(); render();
  if (location.hash && $(location.hash)) setTimeout(function () { $(location.hash).scrollIntoView({ behavior: 'smooth' }); }, 300);
})();
