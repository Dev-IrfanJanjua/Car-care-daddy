/* =========================================================================
   Car Care Daddy — prototype data store
   -------------------------------------------------------------------------
   Everything the public site shows lives in ONE object (CC.data).
   - Public pages read it.            (assets/js/site.js)
   - The admin panel edits it.        (admin/admin.js)
   In the prototype it is saved in the browser's localStorage so you can
   change something in /admin and instantly see it on the website.
   In the real build this becomes Supabase tables + Storage (same shape).
   ========================================================================= */
(function () {
  var KEY = 'ccd_proto_v1';

  var A = 'assets/img/';
  function img(n) { return n; }

  var DEFAULTS = {
    settings: {
      brand: { name: 'Car Care Daddy', tagline: 'Your car, our care', accent: '#D4A24C' },
      contact: {
        phone: '0328 7203630',
        whatsapp: '923287203630',
        email: 'carcaredaddy.pk@gmail.com',
        facebook: 'https://facebook.com/carcaredaddy',
        instagram: 'https://instagram.com/carcaredaddy',
        city: 'Lahore',
        area: 'Doorstep service across Lahore',
        address: 'We come to your home or office — anywhere in Lahore'
      },
      hours: [
        { d: 'Monday – Friday', t: '9:00 AM – 8:00 PM' },
        { d: 'Saturday', t: '9:00 AM – 8:00 PM' },
        { d: 'Sunday', t: 'By appointment' }
      ],
      seo: {
        title: 'Car Care Daddy — Windshield & Headlight Restoration in Lahore',
        description: 'Doorstep CeO₂ windshield restoration, glass polishing, headlight restoration and car detailing across Lahore. 3-year results warranty.'
      }
    },

    home: {
      badge: 'Free doorstep service · Lahore',
      title1: 'Crystal-clear glass,',
      title2: 'right at your doorstep.',
      sub: 'Professional CeO₂ windshield restoration, full glass polishing and headlight restoration. We remove water spots, wiper marks and night glare — at your home or office.',
      ctaPrimary: 'Book now',
      ctaSecondary: 'WhatsApp us',
      warranty: '3-year results warranty on every job',
      heroVideo: 'assets/video/video2.mp4',
      heroPoster: 'assets/img/hero-poster.jpg',
      stats: [
        { n: '3', s: ' yr', l: 'Results warranty' },
        { n: '60–90', s: ' min', l: 'Typical job time' },
        { n: '4.9', s: '/5', l: 'Customer rating' },
        { n: '100', s: '%', l: 'Doorstep service' }
      ],
      sections: { services: true, beforeAfter: true, process: true, why: true, reviews: true, cta: true },
      beforeAfter: { eyebrow: 'Real results', title: 'See the difference', sub: 'Drag, swipe or tap through our latest before & after work.' },
      ctaBand: { title: 'Ready for clear glass again?', sub: 'Tell us your car and we’ll send your exact price in minutes.' }
    },

    about: {
      eyebrow: 'Our story',
      title: 'Lahore’s doorstep glass specialists',
      lead: 'Car Care Daddy was built on one idea: your car should come back looking and seeing like new — without you ever leaving home.',
      story: [
        'We specialise in windshield restoration, full glass polishing and headlight restoration. Using professional CeO₂ (cerium oxide) compounds and precision machine polishing, we remove water spots, wiper marks, haze and yellowing that make night driving stressful and unsafe.',
        'Every job is done at your doorstep, in about 60–90 minutes, by trained technicians. You see your exact price before you book, and every restoration is backed by a 3-year results warranty.'
      ],
      image: 'assets/img/gallery-d.jpg',
      values: [
        { t: 'Expert restoration', d: 'Trained technicians, professional compounds and machine polishing on every single job.' },
        { t: 'Doorstep convenience', d: 'We come to your home or office anywhere in Lahore — no workshop visits, no waiting rooms.' },
        { t: 'Transparent pricing', d: 'See your price before you book. No hidden fees, no surprises after.' },
        { t: '3-year warranty', d: 'Every windshield and glass restoration is backed by a results warranty.' }
      ],
      stats: [
        { n: '3', s: ' yr', l: 'Results warranty' },
        { n: '60–90', s: ' min', l: 'Per job' },
        { n: '4.9', s: '/5', l: 'Rating' }
      ]
    },

    services: [
      { id: 's1', name: 'Windshield Restoration', slug: 'windshield-restoration', category: 'windshield', active: true, home: true,
        badge: 'Most popular', duration: '60–90 min',
        desc: 'Deep CeO₂ polishing removes water spots, wiper scratches and haze — restoring crystal clarity and cutting night-time glare.',
        features: ['Removes water spots & wiper marks', 'Reduces night glare', 'Professional CeO₂ compound', '3-year results warranty'],
        img: 'assets/img/service-windshield.jpg' },
      { id: 's2', name: 'Full Glass Polishing', slug: 'glass-polishing', category: 'glass', active: true, home: true,
        badge: '', duration: '90 min',
        desc: 'Every window — side, rear and quarter glass — machine polished to a clean, streak-free finish that looks factory fresh.',
        features: ['All windows, inside-out clarity', 'Removes mineral deposits', 'Hydrophobic-ready surface', 'Backed by warranty'],
        img: 'assets/img/service-glass.jpg' },
      { id: 's3', name: 'Headlight Restoration', slug: 'headlight-restoration', category: 'headlights', active: true, home: true,
        badge: '', duration: '45–60 min',
        desc: 'Bring yellowed, foggy lenses back to crystal clear — brighter beams, safer night driving and a sharper-looking front end.',
        features: ['Removes yellowing & oxidation', 'Brighter, wider beam', 'UV-protective finish', 'Both lights, same visit'],
        img: 'assets/img/service-headlight.jpg' },
      { id: 's4', name: 'Car Detailing', slug: 'car-detailing', category: 'detailing', active: true, home: true,
        badge: 'Interior & exterior', duration: 'Half day',
        desc: 'Full interior deep clean and exterior detailing — pair it with glass work for a complete, showroom-level reset.',
        features: ['Interior deep clean', 'Exterior wash, buff & polish', 'Trim & tyre dressing', 'Add on to any service'],
        img: 'assets/img/service-detailing.jpg' }
    ],

    gallery: [
      { id: 'g1', type: 'compare', title: 'Windshield restoration', category: 'windshield', before: 'assets/img/before-windshield.jpg', after: 'assets/img/after-windshield.jpg', home: true },
      { id: 'g2', type: 'video', title: 'The Car Care Daddy touch', category: 'detailing', src: 'assets/video/video1.mp4', poster: 'assets/img/video1-poster.jpg', home: true },
      { id: 'g3', type: 'video', title: 'Night-ready headlights & glass', category: 'headlights', src: 'assets/video/video2.mp4', poster: 'assets/img/hero-poster.jpg', home: true },
      { id: 'g4', type: 'image', title: 'Headlight clarity', category: 'headlights', src: 'assets/img/gallery-e.jpg', home: false },
      { id: 'g5', type: 'image', title: 'Quarter-glass polish', category: 'glass', src: 'assets/img/gallery-c.jpg', home: false },
      { id: 'g6', type: 'image', title: 'Full detail finish', category: 'detailing', src: 'assets/img/gallery-d.jpg', home: false },
      { id: 'g7', type: 'image', title: 'Interior clarity through glass', category: 'glass', src: 'assets/img/gallery-b.jpg', home: false },
      { id: 'g8', type: 'image', title: 'Restored side glass', category: 'glass', src: 'assets/img/gallery-a.jpg', home: false },
      { id: 'g9', type: 'image', title: 'Clear windshield, clean cabin', category: 'windshield', src: 'assets/img/gallery-g.jpg', home: false }
    ],

    reviews: [
      { id: 'r1', name: 'Ayesha K.', rating: 5, text: 'Water spots on my Corolla’s windshield were awful. Completely gone — night driving is so much easier now.', show: true },
      { id: 'r2', name: 'Bilal A.', rating: 5, text: 'Wiper marks I thought were permanent came right off. Worth every rupee.', show: true },
      { id: 'r3', name: 'Hamza S.', rating: 5, text: 'Booked in the morning, done at my office in DHA the same afternoon. Very convenient.', show: true },
      { id: 'r4', name: 'Fatima R.', rating: 5, text: 'Showed up on time and the price was exactly what the website quoted. No surprises.', show: true },
      { id: 'r5', name: 'Usman T.', rating: 4, text: 'Got the full glass polish on my Fortuner. The whole car looks newer.', show: true }
    ],

    bookings: [],
    leads: []
  };

  /* ---- demo records so the admin dashboard has something to show ------- */
  function day(offset, h, m) {
    var d = new Date(); d.setDate(d.getDate() + offset); d.setHours(h, m || 0, 0, 0); return d.toISOString();
  }
  DEFAULTS.bookings = [
    { id: 'b1', name: 'Ali Raza', phone: '0300 1234567', car: 'Toyota Corolla', service: 'Windshield Restoration', area: 'DHA Phase 5', when: day(1, 11), status: 'confirmed', created: day(-1, 15) },
    { id: 'b2', name: 'Sara Khan', phone: '0321 7654321', car: 'Honda Civic', service: 'Headlight Restoration', area: 'Gulberg III', when: day(0, 16), status: 'pending', created: day(0, 9) },
    { id: 'b3', name: 'Imran Sheikh', phone: '0333 5551122', car: 'Toyota Fortuner', service: 'Full Glass Polishing', area: 'Johar Town', when: day(2, 10), status: 'pending', created: day(0, 11) },
    { id: 'b4', name: 'Maryam Aslam', phone: '0345 9988776', car: 'Suzuki Cultus', service: 'Windshield Restoration', area: 'Model Town', when: day(-2, 14), status: 'completed', created: day(-5, 10) },
    { id: 'b5', name: 'Hassan Butt', phone: '0302 4443322', car: 'KIA Sportage', service: 'Car Detailing', area: 'Bahria Town', when: day(-3, 12), status: 'completed', created: day(-6, 13) },
    { id: 'b6', name: 'Zainab Malik', phone: '0311 2223344', car: 'Honda City', service: 'Headlight Restoration', area: 'Cantt', when: day(-1, 17), status: 'completed', created: day(-4, 9) },
    { id: 'b7', name: 'Danish Iqbal', phone: '0322 8889900', car: 'Toyota Yaris', service: 'Windshield Restoration', area: 'Wapda Town', when: day(3, 15), status: 'pending', created: day(0, 12) }
  ];
  DEFAULTS.leads = [
    { id: 'l1', name: 'Kamran Ali', phone: '0301 1112233', email: '', message: 'Do you also polish the sunroof glass? I have a Honda HR-V.', source: 'Contact form', created: day(0, 8), status: 'new' },
    { id: 'l2', name: 'Noor Fatima', phone: '0345 6677889', email: 'noor@example.com', message: 'Price for headlight restoration on a Civic 2018?', source: 'Quick quote', created: day(-1, 19), status: 'new' },
    { id: 'l3', name: 'Tariq Mehmood', phone: '0300 9090909', email: '', message: 'Can you come to Bahria Town Phase 8?', source: 'Contact form', created: day(-2, 13), status: 'contacted' },
    { id: 'l4', name: 'Rabia Siddiqui', phone: '0333 4545454', email: '', message: 'Interested in the detailing package.', source: 'WhatsApp', created: day(-3, 11), status: 'contacted' }
  ];

  /* ---- helpers --------------------------------------------------------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function merge(base, over) {
    if (Array.isArray(base) || typeof base !== 'object' || base === null) return over === undefined ? base : over;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = merge(base[k], over ? over[k] : undefined); });
    if (over) Object.keys(over).forEach(function (k) { if (!(k in out)) out[k] = over[k]; });
    return out;
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return merge(clone(DEFAULTS), JSON.parse(raw));
    } catch (e) {}
    return clone(DEFAULTS);
  }

  var CC = {
    KEY: KEY,
    defaults: DEFAULTS,
    data: load(),
    save: function () {
      try { localStorage.setItem(KEY, JSON.stringify(CC.data)); return true; }
      catch (e) { alert('Browser storage is full (prototype limit). Try smaller images, or Reset demo data.'); return false; }
    },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} CC.data = clone(DEFAULTS); },
    uid: function (p) { return (p || 'x') + Math.random().toString(36).slice(2, 8); },
    get: function (path) {
      return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, CC.data);
    },
    set: function (path, val) {
      var ks = path.split('.'), o = CC.data;
      for (var i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null) o[ks[i]] = {}; o = o[ks[i]]; }
      o[ks[ks.length - 1]] = val;
    },
    esc: function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); },
    /* Downscale an uploaded image so it fits in localStorage (prototype only). */
    compress: function (file, max, q) {
      max = max || 1400; q = q || 0.78;
      return new Promise(function (res, rej) {
        var fr = new FileReader();
        fr.onerror = rej;
        fr.onload = function () {
          var im = new Image();
          im.onerror = rej;
          im.onload = function () {
            var r = Math.min(1, max / Math.max(im.width, im.height));
            var c = document.createElement('canvas');
            c.width = Math.round(im.width * r); c.height = Math.round(im.height * r);
            c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            res(c.toDataURL('image/jpeg', q));
          };
          im.src = fr.result;
        };
        fr.readAsDataURL(file);
      });
    },
    catLabel: { windshield: 'Windshield', glass: 'Glass polish', headlights: 'Headlights', detailing: 'Detailing', other: 'Other' },
    waLink: function (text) {
      var n = CC.get('settings.contact.whatsapp');
      return 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '');
    },
    tel: function () { return 'tel:+' + CC.get('settings.contact.whatsapp'); }
  };

  /* If this page is opened inside the admin's live-preview, or another tab
     edits the data, stay in sync. */
  window.addEventListener('storage', function (e) { if (e.key === KEY) { CC.data = load(); if (window.CCRender) window.CCRender(); } });

  window.CC = CC;
})();
