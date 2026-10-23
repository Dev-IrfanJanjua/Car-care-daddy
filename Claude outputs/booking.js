/* Car Aurum — booking flow, car-type finder, price widgets (prototype).
   Load AFTER store.js and BEFORE site.js. */
(function () {
  var CC = window.CC, E = CC.esc;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function I(n) { return window.CCUI ? window.CCUI.I(n) : ''; }
  function WA() { return window.CCUI ? window.CCUI.WA : ''; }
  function toast(m) { if (window.CCUI) window.CCUI.toast(m); }

  /* ---------- little side-on car silhouettes, one per type ---------- */
  var WHEELS = '<circle cx="30" cy="40" r="6.5"/><circle cx="92" cy="40" r="6.5"/>';
  var CAR = {
    hatchback: '<svg viewBox="0 0 120 52" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 40v-8c0-2 1-3 3-4l15-3c5-7 11-10 19-10h24c8 0 13 3 17 10l14 3c3 .8 5 2 5 5v7"/><path d="M37 15v12M25 25h56"/>' + WHEELS + '</svg>',
    sedan: '<svg viewBox="0 0 120 52" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 40v-7c0-2 1-3 3-4l18-4c5-6 11-9 19-9h18c8 0 14 3 19 9l19 4c3 .6 5 2 5 5v6"/><path d="M45 16v12M70 16v12M26 28h70"/>' + WHEELS + '</svg>',
    crossover: '<svg viewBox="0 0 120 52" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 40v-9c0-2 1-4 3-4l15-4 9-9h48c5 0 9 2 12 6l12 7c3 1 5 3 5 6v7"/><path d="M39 14v13M64 14v13M24 27h74"/>' + WHEELS + '</svg>',
    suv: '<svg viewBox="0 0 120 52" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 40V25c0-2 1-4 4-4h13l8-10h68c3 0 5 1 6 4l7 10v15"/><path d="M33 12v10M60 12v10M88 12v10M22 22h88"/><circle cx="30" cy="40" r="7"/><circle cx="92" cy="40" r="7"/></svg>'
  };
  function vtypes() { return CC.data.vehicleTypes; }
  function svcs() { return CC.data.services.filter(function (s) { return s.active; }); }
  function svcById(id) { return CC.data.services.filter(function (s) { return s.id === id; })[0]; }

  /* =====================================================================
     Car-type finder (used in the booking flow AND on the Services page)
     ===================================================================== */
  function finderHTML() {
    return '<div class="finder"><label class="fl">Type your car’s name</label>' +
      '<div class="fi"><input class="input" data-fin placeholder="e.g. Honda Civic, Vitz, Fortuner, HR-V…" autocomplete="off"></div>' +
      '<div class="fres" data-fres></div></div>';
  }
  function wireFinder(root, onPick) {
    var inp = $('[data-fin]', root), res = $('[data-fres]', root);
    function typeBtns(q) {
      return '<div class="fmanual"><p>We don’t have <b>“' + E(q) + '”</b> listed yet. No problem — pick the closest match:</p><div class="fmt">' +
        vtypes().map(function (v) { return '<button type="button" data-mt="' + v.id + '">' + CAR[v.id] + '<b>' + E(v.name) + '</b><small>' + E(v.examples.split(',').slice(0, 2).join(',')) + '</small></button>'; }).join('') + '</div></div>';
    }
    function show() {
      var q = inp.value.trim();
      if (q.length < 2) { res.innerHTML = '<p class="fhint">Start typing — we’ll show which type your car is, so you know which price applies.</p>'; return; }
      var m = CC.findCars(q);
      if (!m.length) { res.innerHTML = typeBtns(q); $$('[data-mt]', res).forEach(function (b) { b.onclick = function () { pick({ label: q, type: b.getAttribute('data-mt'), custom: true }); }; }); return; }
      res.innerHTML = '<div class="flist">' + m.map(function (c) { return '<button type="button" data-c="' + c.id + '"><span>' + E(c.make + ' ' + c.model) + '</span><em class="t-' + c.type + '">' + E(CC.vtName(c.type)) + '</em></button>'; }).join('') + '</div>';
      $$('[data-c]', res).forEach(function (b) { b.onclick = function () { var c = CC.data.cars.filter(function (x) { return x.id === b.getAttribute('data-c'); })[0]; pick({ label: c.make + ' ' + c.model, type: c.type }); }; });
    }
    function pick(p) {
      var vt = vtypes().filter(function (v) { return v.id === p.type; })[0];
      res.innerHTML = '<div class="fok"><span class="tick">' + I('check') + '</span><div><b>' + E(p.label) + '</b> is a <em class="t-' + p.type + '">' + E(vt.name) + '</em><small>' + (p.custom ? 'Chosen by you — we’ll double-check when we confirm.' : E(vt.desc)) + '</small></div></div>';
      onPick && onPick(p);
    }
    inp.addEventListener('input', show); show();
    return { pick: pick, input: inp };
  }

  /* =====================================================================
     Booking wizard
     ===================================================================== */
  var DK = 'ccd_draft';
  function getDraft() { try { if (CC.host) return CC.host.draft || null; return JSON.parse(localStorage.getItem(DK) || 'null'); } catch (e) { return null; } }
  function setDraft(d) { try { if (CC.host) { CC.host.draft = d; return; } if (d) localStorage.setItem(DK, JSON.stringify(d)); else localStorage.removeItem(DK); } catch (e) {} }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function fresh() { return { id: CC.uid('d'), step: 1, name: '', phone: '', email: '', services: [], vtype: '', car: '', carCustom: false, date: today(), time: '9:00 AM', area: '', notes: '', remind: true }; }
  function hasData(d) { return d && (d.name || d.phone || d.email || (d.services && d.services.length)); }
  function slots() { var o = []; for (var h = 9; h < 20; h++) o.push((h % 12 || 12) + ':00 ' + (h < 12 ? 'AM' : 'PM')); return o; }
  function okPhone(p) { return CC.digits(p).length >= 10; }
  function okEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e).trim()); }
  function totals(d) {
    var lines = d.services.map(function (id) { var s = svcById(id); return s ? { name: s.name, price: CC.price(s, d.vtype) } : null; }).filter(Boolean);
    return { lines: lines, total: lines.reduce(function (a, l) { return a + l.price; }, 0) };
  }

  var D, W = { open: false, done: false };

  /* ---- abandoned-checkout capture ---- */
  function track() {
    if (W.done || !D) return;
    if (!(okPhone(D.phone) || okEmail(D.email))) return;
    var t = totals(D), names = D.services.map(function (id) { var s = svcById(id); return s ? s.name : ''; }).filter(Boolean);
    var A = CC.data.abandoned, e = A.filter(function (x) { return x.id === D.id; })[0], now = new Date().toISOString();
    var rec = { id: D.id, name: D.name || '(name not entered)', phone: D.phone, email: D.email, step: D.step, services: names, vtype: D.vtype, car: D.car, total: D.vtype ? t.total : 0, started: e ? e.started : now, updated: now, status: e ? e.status : 'open', remind: D.remind, left: e ? e.left : null };
    if (e) A[A.indexOf(e)] = rec; else A.unshift(rec);
    CC.save();
  }
  var trackT;
  function trackSoon() { clearTimeout(trackT); trackT = setTimeout(track, 500); setDraft(D); }

  function open(pre) {
    var m = $('#book-modal'); if (!m) return;
    pre = pre || {};
    if (typeof pre === 'string') { var sv = CC.svcByName(pre); pre = sv ? { service: sv.id } : {}; }
    var existing = getDraft();
    W.done = false; W.resume = false;
    if (pre.service || pre.vtype) {
      D = existing && hasData(existing) ? existing : fresh();
      if (pre.service) D.services = [pre.service];
      if (pre.vtype) D.vtype = pre.vtype;
      D.step = 1;
    } else if (existing && hasData(existing)) { D = existing; W.resume = true; }
    else D = fresh();
    m.classList.add('on'); document.body.style.overflow = 'hidden'; W.open = true;
    m.onclick = function (e) { if (e.target === m) close(); };
    draw();
  }
  function close() {
    var m = $('#book-modal'); if (!m) return;
    if (!W.done) { clearTimeout(trackT); if (D && (okPhone(D.phone) || okEmail(D.email))) { track(); var e = CC.data.abandoned.filter(function (x) { return x.id === D.id; })[0]; if (e) { e.left = new Date().toISOString(); CC.save(); } } setDraft(D); }
    m.classList.remove('on'); m.innerHTML = ''; document.body.style.overflow = ''; W.open = false;
  }

  function stepper() {
    var L = ['Your details', 'Your car', 'Schedule'];
    return '<ol class="wz-steps">' + L.map(function (l, i) { var n = i + 1; return '<li class="' + (D.step === n ? 'on' : D.step > n ? 'done' : '') + '"><i>' + (D.step > n ? I('check') : n) + '</i><span>' + l + '</span></li>'; }).join('') + '</ol>';
  }
  function footer(back, next, nextLabel, disabled) {
    var t = D.vtype ? totals(D) : null;
    return '<div class="wz-foot"><div class="wz-total">' + (t && t.total ? '<small>Estimated total</small><b>' + CC.money(t.total) + '</b>' : '<small>Prices depend on your car type</small><b>—</b>') + '</div>' +
      '<div class="wz-btns">' + (back ? '<button type="button" class="btn btn-ghost" id="wz-back">Back</button>' : '') + '<button type="button" class="btn btn-gold" id="wz-next"' + (disabled ? ' disabled' : '') + '>' + nextLabel + ' ' + I('arrow') + '</button></div></div>';
  }
  function shellOpen(inner) {
    return '<div class="modal-box wz"><button class="x" aria-label="Close" id="wz-x">' + I('x') + '</button>' + inner + '</div>';
  }

  function draw() {
    var m = $('#book-modal');
    if (W.resume) {
      m.innerHTML = shellOpen('<div class="done" style="padding:10px 0 4px"><div class="tick" style="background:rgba(212,162,76,.15);color:var(--gold);border-color:rgba(212,162,76,.4)">' + I('clock') + '</div><h3>Welcome back' + (D.name ? ', ' + E(D.name.split(' ')[0]) : '') + '!</h3><p style="color:var(--muted);margin:10px 0 26px">We saved your booking where you left off. Want to continue?</p><button class="btn btn-gold" style="width:100%" id="wz-cont">Continue booking ' + I('arrow') + '</button><button class="btn btn-ghost" style="width:100%;margin-top:10px" id="wz-new">Start over</button></div>');
      $('#wz-x').onclick = close; $('#wz-cont').onclick = function () { W.resume = false; draw(); }; $('#wz-new').onclick = function () { D = fresh(); setDraft(D); W.resume = false; draw(); };
      return;
    }
    var h = stepper();
    if (D.step === 1) h += step1(); else if (D.step === 2) h += step2(); else h += step3();
    m.innerHTML = shellOpen(h);
    $('#wz-x').onclick = close;
    if (D.step === 1) wire1(); else if (D.step === 2) wire2(); else wire3();
    var box = $('.wz', m); if (box) box.scrollTop = 0;
  }

  /* ---- step 1: details + services ---- */
  function step1() {
    return '<span class="eyebrow">Free doorstep service</span><h3 class="wz-t">Let’s start with you</h3><p class="wz-s">We’ll use these to confirm your booking — and remind you when your car is due for its next service.</p>' +
      '<div class="field"><label>Full name</label><input class="input" id="f-name" autocomplete="name" placeholder="e.g. Ali Raza" value="' + E(D.name) + '"></div>' +
      '<div class="row2"><div class="field"><label>Phone / WhatsApp</label><input class="input" id="f-phone" inputmode="tel" autocomplete="tel" placeholder="03xx xxxxxxx" value="' + E(D.phone) + '"></div>' +
      '<div class="field"><label>Email</label><input class="input" id="f-email" type="email" autocomplete="email" placeholder="you@example.com" value="' + E(D.email) + '"></div></div>' +
      '<div class="field" style="margin-bottom:8px"><label>What do you need? <span class="opt">(pick one or more)</span></label></div>' +
      '<div class="sv-grid">' + svcs().map(function (s) {
        var on = D.services.indexOf(s.id) > -1, from = CC.minPrice(s);
        return '<label class="sv-tile' + (on ? ' on' : '') + '"><input type="checkbox" data-sv="' + s.id + '"' + (on ? ' checked' : '') + '><span class="ck">' + I('check') + '</span><b>' + E(s.name) + '</b><small>' + E(s.duration) + (from ? ' · from ' + CC.money(from) : '') + '</small></label>';
      }).join('') + '</div>' +
      '<label class="chk"><input type="checkbox" id="f-remind"' + (D.remind ? ' checked' : '') + '><span>Remind me when my car is due for its next service <em>(optional)</em></span></label>' +
      '<div class="wz-err" id="wz-err"></div>' + footer(false, true, 'Continue');
  }
  function wire1() {
    ['name', 'phone', 'email'].forEach(function (k) { $('#f-' + k).addEventListener('input', function (e) { D[k] = e.target.value; trackSoon(); }); });
    $('#f-remind').onchange = function (e) { D.remind = e.target.checked; setDraft(D); };
    $$('[data-sv]').forEach(function (c) { c.onchange = function () { var id = c.getAttribute('data-sv'), i = D.services.indexOf(id); if (c.checked && i < 0) D.services.push(id); if (!c.checked && i > -1) D.services.splice(i, 1); c.closest('.sv-tile').classList.toggle('on', c.checked); trackSoon(); updTotal(); }; });
    $('#wz-next').onclick = function () {
      var err = $('#wz-err'), msg = '';
      if (D.name.trim().length < 2) msg = 'Please enter your name.'; else if (!okPhone(D.phone)) msg = 'Please enter a valid phone number.'; else if (!okEmail(D.email)) msg = 'Please enter a valid email address.'; else if (!D.services.length) msg = 'Choose at least one service.';
      if (msg) { err.textContent = msg; return; }
      D.step = 2; track(); setDraft(D); draw();
    };
  }
  function updTotal() { var f = $('.wz-total'); if (!f) return; var t = D.vtype ? totals(D) : null; f.innerHTML = t && t.total ? '<small>Estimated total</small><b>' + CC.money(t.total) + '</b>' : '<small>Prices depend on your car type</small><b>—</b>'; }

  /* ---- step 2: car type ---- */
  function priceBox() {
    if (!D.vtype) return '<div class="pbox muted-box">Choose your car type to see your price.</div>';
    var t = totals(D);
    return '<div class="pbox"><div class="ph">Your price · <b>' + E(CC.vtName(D.vtype)) + '</b></div>' + t.lines.map(function (l) { return '<div class="pl"><span>' + E(l.name) + '</span><b>' + CC.money(l.price) + '</b></div>'; }).join('') + '<div class="pl tot"><span>Total</span><b>' + CC.money(t.total) + '</b></div></div>';
  }
  function step2() {
    return '<span class="eyebrow">Step 2 of 3</span><h3 class="wz-t">What kind of car do you drive?</h3><p class="wz-s">Our price depends on your car’s size. Pick your type below — or tap <b>“Not sure?”</b> and just type your car’s name.</p>' +
      '<div class="vt-grid">' + vtypes().map(function (v) {
        return '<button type="button" class="vt' + (D.vtype === v.id ? ' on' : '') + '" data-vt="' + v.id + '"><span class="ic">' + CAR[v.id] + '</span><b>' + E(v.name) + '</b><small>' + E(v.desc) + '</small><em>' + E(v.examples) + '</em></button>';
      }).join('') + '</div>' +
      '<button type="button" class="linkbtn" id="nf">' + I('spark') + ' Not sure which type your car is? Find it by name</button>' +
      '<div class="finder-wrap" id="fw" hidden>' + finderHTML() + '</div>' +
      '<div class="field" style="margin-top:18px"><label>Car make &amp; model <span class="opt">(optional)</span></label><input class="input" id="f-car" placeholder="e.g. Honda Civic 2019" value="' + E(D.car) + '"></div>' +
      '<div id="pb">' + priceBox() + '</div><div class="wz-err" id="wz-err"></div>' + footer(true, true, 'Continue', !D.vtype);
  }
  function wire2() {
    function setType(t) { D.vtype = t; $$('.vt').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-vt') === t); }); $('#pb').innerHTML = priceBox(); $('#wz-next').disabled = !t; updTotal(); trackSoon(); }
    $$('.vt').forEach(function (b) { b.onclick = function () { setType(b.getAttribute('data-vt')); }; });
    var fw = $('#fw'); $('#nf').onclick = function () { fw.hidden = !fw.hidden; if (!fw.hidden) { $('[data-fin]', fw).focus(); } };
    wireFinder(fw, function (p) { D.car = p.label; D.carCustom = !!p.custom; $('#f-car').value = p.label; setType(p.type); });
    $('#f-car').addEventListener('input', function (e) { D.car = e.target.value; trackSoon(); });
    $('#wz-back').onclick = function () { D.step = 1; setDraft(D); draw(); };
    $('#wz-next').onclick = function () { if (!D.vtype) return; D.step = 3; track(); setDraft(D); draw(); };
  }

  /* ---- step 3: schedule + confirm ---- */
  function summary() {
    var t = totals(D);
    return '<div class="pbox"><div class="ph">Booking summary</div>' +
      '<div class="pl"><span>Customer</span><b>' + E(D.name) + '</b></div><div class="pl"><span>Car</span><b>' + E(D.car || '—') + ' · ' + E(CC.vtName(D.vtype)) + '</b></div>' +
      t.lines.map(function (l) { return '<div class="pl"><span>' + E(l.name) + '</span><b>' + CC.money(l.price) + '</b></div>'; }).join('') +
      '<div class="pl tot"><span>Estimated total</span><b>' + CC.money(t.total) + '</b></div></div>';
  }
  function step3() {
    return '<span class="eyebrow">Last step</span><h3 class="wz-t">When and where?</h3><p class="wz-s">We come to you. Choose a slot and tell us your area.</p>' +
      '<div class="row2"><div class="field"><label>Preferred date</label><input class="input" type="date" id="f-date" min="' + today() + '" value="' + E(D.date) + '"></div>' +
      '<div class="field"><label>Time</label><select class="select" id="f-time">' + slots().map(function (s) { return '<option' + (s === D.time ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="field"><label>Your area in Lahore</label><input class="input" id="f-area" placeholder="e.g. DHA Phase 5, Gulberg, Johar Town" value="' + E(D.area) + '"></div>' +
      '<div class="field"><label>Address / landmark / notes <span class="opt">(optional)</span></label><textarea class="textarea" id="f-notes" style="min-height:76px" placeholder="House no., street, parking spot…">' + E(D.notes) + '</textarea></div>' +
      summary() + '<p class="wz-note">The final price is confirmed on WhatsApp before we start. No payment is taken online.</p><div class="wz-err" id="wz-err"></div>' + footer(true, true, 'Confirm booking');
  }
  function wire3() {
    [['date', 'f-date'], ['time', 'f-time'], ['area', 'f-area'], ['notes', 'f-notes']].forEach(function (p) { $('#' + p[1]).addEventListener('input', function (e) { D[p[0]] = e.target.value; trackSoon(); }); });
    $('#wz-back').onclick = function () { D.step = 2; setDraft(D); draw(); };
    $('#wz-next').onclick = function () {
      if (!D.area.trim()) { $('#wz-err').textContent = 'Please tell us your area so we can reach you.'; return; }
      if (!D.date) { $('#wz-err').textContent = 'Please choose a date.'; return; }
      submit();
    };
  }
  function submit() {
    var t = totals(D), names = t.lines.map(function (l) { return l.name; });
    var when = new Date(D.date + ' ' + D.time);
    var b = { id: CC.uid('b'), name: D.name.trim(), phone: D.phone.trim(), email: D.email.trim(), car: D.car, vtype: D.vtype, carCustom: D.carCustom, services: names, service: names.join(' + '), total: t.total, area: D.area.trim(), notes: D.notes, when: isNaN(when) ? new Date().toISOString() : when.toISOString(), status: 'pending', created: new Date().toISOString(), remind: D.remind, source: 'website' };
    CC.data.bookings.unshift(b);
    var e = CC.data.abandoned.filter(function (x) { return x.id === D.id; })[0];
    if (e) { if (e.left) { e.status = 'recovered'; e.step = 3; } else CC.data.abandoned.splice(CC.data.abandoned.indexOf(e), 1); }
    CC.save(); W.done = true; setDraft(null);
    var msg = 'Hi Car Aurum! New booking request:\n• ' + names.join(' + ') + '\n• Car: ' + (D.car || '—') + ' (' + CC.vtName(D.vtype) + ')\n• ' + D.date + ' at ' + D.time + '\n• Area: ' + D.area + '\n• Estimated total: ' + CC.money(t.total) + '\n• Name: ' + D.name;
    var m = $('#book-modal');
    m.innerHTML = shellOpen('<div class="done"><div class="tick">' + I('check') + '</div><h3>Request received!</h3><p style="color:var(--muted);margin:10px 0 22px">Thank you, ' + E(D.name.split(' ')[0]) + '. We’ve saved your details and will confirm your slot shortly.</p>' + summary() +
      '<a class="btn btn-gold" style="width:100%;margin-top:18px" target="_blank" href="' + CC.waLink(msg) + '">' + WA() + ' Send details on WhatsApp</a><button class="btn btn-ghost" style="width:100%;margin-top:10px" id="wz-close">Close</button></div>');
    $('#wz-x').onclick = close; $('#wz-close').onclick = close;
  }

  /* =====================================================================
     Widgets for the public pages
     ===================================================================== */
  /* hero: instant price card */
  function priceCard(el) {
    var S = svcs(), st = el._st || (el._st = { sid: S[0] && S[0].id, vt: 'sedan' });
    if (!svcById(st.sid)) st.sid = S[0] && S[0].id;
    function draw2() {
      var s = svcById(st.sid), p = CC.price(s, st.vt);
      el.innerHTML = '<h3>Check your price</h3><p class="s">Pick a service and your car type — instant price, no sign-up.</p>' +
        '<div class="field"><label>Service</label><select class="select" id="pc-s">' + S.map(function (x) { return '<option value="' + x.id + '"' + (x.id === st.sid ? ' selected' : '') + '>' + E(x.name) + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label>Car type</label><div class="pc-vt">' + vtypes().map(function (v) { return '<button type="button" data-v="' + v.id + '" class="' + (v.id === st.vt ? 'on' : '') + '">' + CAR[v.id] + '<span>' + E(v.name) + '</span></button>'; }).join('') + '</div></div>' +
        '<div class="pc-price"><small>Your price</small><b>' + CC.money(p) + '</b></div>' +
        '<button class="btn btn-gold" style="width:100%" id="pc-b">Book this ' + I('arrow') + '</button>' +
        '<a class="linkbtn" href="services.html#finder" style="margin:12px auto 0;display:flex;justify-content:center">Not sure of your car type? Find it by name</a>';
      $('#pc-s', el).onchange = function (e) { st.sid = e.target.value; draw2(); };
      $$('[data-v]', el).forEach(function (b) { b.onclick = function () { st.vt = b.getAttribute('data-v'); draw2(); }; });
      $('#pc-b', el).onclick = function () { open({ service: st.sid, vtype: st.vt }); };
    }
    draw2();
  }

  /* services page: pricing table */
  function priceTable(el) {
    var V = vtypes(), S = svcs();
    el.innerHTML = '<div class="ptbl"><table><thead><tr><th>Service</th>' + V.map(function (v) { return '<th><span class="ic">' + CAR[v.id] + '</span>' + E(v.name) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      S.map(function (s) { return '<tr><td><b>' + E(s.name) + '</b><small>' + E(s.duration) + '</small></td>' + V.map(function (v) { return '<td>' + CC.money(CC.price(s, v.id)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
      '<p class="ptbl-note">Prices are per vehicle and include doorstep service. Final price confirmed before we start.</p>';
  }

  /* services page: standalone finder */
  function finderPage(el) {
    el.innerHTML = '<div class="fp">' + finderHTML() + '<div class="fp-out" id="fp-out"></div></div>';
    wireFinder(el, function (p) {
      var out = $('#fp-out', el), t = p.type;
      out.innerHTML = '<div class="pbox"><div class="ph">Prices for a <b>' + E(CC.vtName(t)) + '</b></div>' + svcs().map(function (s) { return '<div class="pl"><span>' + E(s.name) + '</span><b>' + CC.money(CC.price(s, t)) + '</b></div>'; }).join('') + '</div><button class="btn btn-gold" id="fp-b" style="width:100%;margin-top:14px">Book for my ' + E(p.label) + ' ' + I('arrow') + '</button>';
      $('#fp-b', el).onclick = function () { D = getDraft() || fresh(); D.car = p.label; D.vtype = t; setDraft(D); open({ vtype: t }); };
    });
  }

  window.CCBook = { open: open, close: close, priceCard: priceCard, priceTable: priceTable, finderPage: finderPage };
})();
