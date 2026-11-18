/* Mineral ID — UI */
'use strict';
(function () {
  MI.VERSION = '0.10.1';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const T = (s, o) => MI.I18N.T(s, o), N = id => MI.I18N.name(id), TM = (c, k) => MI.I18N.term(c, k);
  const I = MI.ART.ICON;
  const app = () => $('#app');
  MI.fmt = f => esc(f).replace(/(?<=[A-Za-z)\]])(\d+)/g, '<sub>$1</sub>');
  const hs = m => m.h[0] === m.h[1] ? String(m.h[0]).replace('.', MI.I18N.dec()) : (m.h[0] + '–' + m.h[1]).replace(/\./g, MI.I18N.dec());
  const dn = v => String(+v.toFixed(2));
  const ds = m => (m.d[0] === m.d[1] ? dn(m.d[0]) : dn(m.d[0]) + '–' + dn(m.d[1])).replace(/\./g, MI.I18N.dec());
  const S = { stack: [], id: null, img: null, pst: null, viewer: null, settings: {}, quiz: null };

  function toast(msg, ms = 2600) { const t = $('#toast'); t.textContent = T(msg); t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms); }
  const licensed = () => MI.License.state.licensed;
  // own confirm dialog (browser confirm() is blocked in some app views)
  function ask(msg, okText) {
    return new Promise(res => {
      const d = document.createElement('div'); d.className = 'modal';
      d.innerHTML = `<div class="sheet"><p>${esc(T(msg))}</p><button class="danger wide" data-x="1">${esc(T(okText || 'Delete'))}</button><button class="wide" data-x="0">${esc(T('Cancel'))}</button></div>`;
      document.body.appendChild(d);
      d.onclick = e => { const b = e.target.closest('[data-x]'); if (e.target === d || b) { d.remove(); res(!!b && b.dataset.x === '1'); } };
    });
  }

  // ---------- navigation (Android back button works) ----------
  function go(view, p = {}, replace = false) {
    if (S.viewer && view !== 'photo') { S.viewer.destroy(); S.viewer = null; }
    const st = { view, p };
    if (replace || !S.stack.length) { S.stack[S.stack.length ? S.stack.length - 1 : 0] = st; history.replaceState({ d: S.stack.length }, ''); }
    else { S.stack.push(st); history.pushState({ d: S.stack.length }, ''); }
    render();
  }
  function back() { if (S.stack.length > 1) history.back(); else go('home', {}, true); }
  window.addEventListener('popstate', () => { if (S.stack.length > 1) S.stack.pop(); if (S.viewer) { S.viewer.destroy(); S.viewer = null; } render(); });
  function render() { const cur = S.stack[S.stack.length - 1] || { view: 'home', p: {} }; window.scrollTo(0, 0); (V[cur.view] || V.home)(cur.p); }

  const top = (title, sub, right = '') => `<header class="top"><div class="tl">${S.stack.length > 1 ? `<button class="ghost" data-a="back" aria-label="${esc(T('Back'))}">${I.back}</button>` : `<span class="logo">${logo(30)}</span>`}</div>
    <div class="tt"><div class="t1">${esc(title)}</div>${sub ? `<div class="t2">${esc(sub)}</div>` : ''}</div><div class="tr">${right}</div></header>`;
  const logo = s => `<svg viewBox="0 0 64 64" width="${s}" height="${s}"><rect width="64" height="64" rx="14" fill="#ffd166"/><path d="M32 8L14 22l6 30h24l6-30z" fill="#10243a"/><path d="M14 22h36M32 8l-8 14 8 30 8-30z" fill="none" stroke="#ffd166" stroke-width="2.2" stroke-linejoin="round"/></svg>`;
  const crys = (m, s) => MI.ART.crystal(m, s);
  function bind() { $$('[data-a="back"]').forEach(b => b.onclick = back); }

  // ---------- licence gate ----------
  function lockBox(msg, vars) {
    const d = document.createElement('div'); d.className = 'modal';
    d.innerHTML = `<div class="sheet"><h3>${esc(T('Full version'))}</h3><p>${esc(T(msg, vars))}</p>
      ${MI.License.BUY_URL ? `<a class="btn primary wide" href="${esc(MI.License.BUY_URL)}" target="_blank" rel="noopener">${esc(T('Buy the full version'))}</a>` : ''}
      <button class="wide" data-x="key">${esc(T('I have a licence key'))}</button><button class="wide ghost" data-x="close">${esc(T('Close'))}</button></div>`;
    document.body.appendChild(d);
    d.onclick = e => { const x = e.target.closest('[data-x]'); if (e.target === d || (x && x.dataset.x === 'close')) d.remove(); else if (x && x.dataset.x === 'key') { d.remove(); go('settings'); } };
  }
  async function canIdentify() {
    if (licensed()) return true;
    const n = (await MI.DB.meta('identCount')) || 0;
    if (n >= MI.License.DEMO.ident) { lockBox('The free version includes {n} identifications. Get the full version for unlimited identifications, collection and export.', { n: MI.License.DEMO.ident }); return false; }
    await MI.DB.meta('identCount', n + 1); return true;
  }

  // ======================= VIEWS =======================
  const V = {};

  V.home = async () => {
    const n = (await MI.DB.all('samples')).length; const lic = MI.License.state;
    const left = Math.max(0, MI.License.DEMO.ident - ((await MI.DB.meta('identCount')) || 0));
    app().innerHTML = `<div class="hero">${logo(54)}<div><h1>Mineral ID</h1><div class="by">by Engineering Geology</div></div></div>
    <main class="home">
      ${lic.licensed ? '' : `<div class="note">${esc(T('Free version: {n} identifications left.', { n: left }))} <a href="#" data-go="settings">${esc(T('Full version'))}</a></div>`}
      <label class="bigbtn"><input type="file" accept="image/*" capture="environment" id="cam" hidden>${I.camera}<span><b>${esc(T('Photograph a mineral'))}</b><small>${esc(T('Take a photo, then confirm with simple tests'))}</small></span></label>
      <div class="row2"><label class="btn"><input type="file" accept="image/*" id="gal" hidden>${esc(T('Photo from gallery'))}</label><button data-a="testsonly">${I.tests} ${esc(T('Tests only'))}</button></div>
      <div class="tiles">
        <a href="#" class="tile" data-go="collection">${I.box}<b>${esc(T('My collection'))}</b><small>${esc(T('{n} samples', { n }))}</small></a>
        <a href="#" class="tile" data-go="atlas">${I.book}<b>${esc(T('Atlas'))}</b><small>${esc(T('{n} minerals', { n: MI.MINERALS.length }))}</small></a>
        <a href="#" class="tile" data-go="quiz">${I.quiz}<b>${esc(T('Quiz'))}</b><small>${esc(T('Which mineral is this?'))}</small></a>
        <a href="#" class="tile" data-go="map">${I.map}<b>${esc(T('Map of finds'))}</b><small>${esc(T('Where you found them'))}</small></a>
      </div>
      <button class="wide" data-go="settings">${I.gear} ${esc(T('Settings'))} · ${esc(MI.I18N.langName())}</button>
      <p class="muted center">${esc(T('Works offline. Your photos and collection stay on this phone.'))}</p>
    </main>`;
    bindCommon();
    const onPick = async e => { const f = e.target.files[0]; if (!f) return; try { S.img = await MI.Photo.load(f); S.pst = { mode: 'pan', meas: [] }; go('photo'); } catch (err) { toast(err.message); } };
    $('#cam').onchange = onPick; $('#gal').onchange = onPick;
    $('[data-a="testsonly"]').onclick = async () => { if (!(await canIdentify())) return; S.id = MI.ID.newState(); S.img = null; go('identify'); };
  };
  function bindCommon() { bind(); $$('[data-go]').forEach(a => a.onclick = e => { e.preventDefault(); go(a.dataset.go, a.dataset.p ? JSON.parse(a.dataset.p) : {}); }); }

  // ---------- photo with magnifier, scale and measuring ----------
  V.photo = () => {
    if (!S.img) return go('home', {}, true);
    const st = S.pst;
    app().innerHTML = top(T('Photo'), T('Zoom, set the scale, measure')) + `<main class="photo">
      <div id="pv" class="pvbox"></div>
      <div class="tools">
        <div class="seg" id="mode"><button data-m="pan">✋ ${esc(T('Move'))}</button><button data-m="loupe">${I.zoom} ${esc(T('Magnifier'))}</button><button data-m="scale">${I.ruler} ${esc(T('Scale'))}</button><button data-m="measure">↔ ${esc(T('Measure'))}</button></div>
        <div class="row3"><button class="sm" data-z="in">＋</button><button class="sm" data-z="out">－</button><button class="sm" data-z="reset">⟲</button><button class="sm" data-z="clear">${esc(T('Clear lines'))}</button></div>
        <p class="muted" id="hint"></p>
      </div>
      <button class="primary wide big" id="analyse">${esc(T('Identify this mineral'))}</button>
      <p class="muted small">${esc(T('Tip: photograph the mineral on a plain background in daylight, close up and sharp. Put a coin next to it to measure crystal size.'))}</p>
    </main>`;
    bind();
    const hint = () => { $('#hint').textContent = T({ pan: 'Drag to move, pinch or use + to zoom.', loupe: 'Touch and hold to see a magnified view.', scale: 'Draw a line across a coin or ruler, then choose what it is.', measure: st.mmPerPx ? 'Draw a line across a crystal to measure it.' : 'Set the scale first, so lines show millimetres.' }[st.mode]); $$('#mode button').forEach(b => b.classList.toggle('on', b.dataset.m === st.mode)); };
    S.viewer = MI.Photo.viewer($('#pv'), S.img, st, (what, d, L) => { if (what === 'ref') askRef(d, L); });
    $$('#mode button').forEach(b => b.onclick = () => { st.mode = b.dataset.m; hint(); });
    $$('[data-z]').forEach(b => b.onclick = () => { const z = b.dataset.z; if (z === 'in') S.viewer.zoom(1.4); else if (z === 'out') S.viewer.zoom(1 / 1.4); else if (z === 'reset') S.viewer.reset(); else { st.meas = []; st.ref = null; st.mmPerPx = null; S.viewer.draw(); } });
    hint();
    if (MI.Model) MI.Model.load().catch(() => { }); // start loading the photo network while the user zooms/measures
    $('#analyse').onclick = async () => {
      if (!(await canIdentify())) return;
      S.id = MI.ID.newState(); S.id.photo = MI.Photo.colors(S.img);
      const btn = $('#analyse'); btn.disabled = true; btn.textContent = T('Analysing the photo…');
      try { if (MI.Model) S.id.model = await MI.Model.predict(S.img); } catch (e) { console.warn(e); toast('Photo recognition is not available on this device – using colours and tests.'); }
      go('identify');
    };
    function askRef(d, L) {
      const m = document.createElement('div'); m.className = 'modal';
      m.innerHTML = `<div class="sheet"><h3>${esc(T('What is under the line?'))}</h3>
        ${MI.Photo.REFS.map(([k, mm]) => `<button class="wide" data-mm="${mm}">${esc(TM('ref', k))} · ${String(mm).replace('.', MI.I18N.dec())} mm</button>`).join('')}
        <div class="row2" style="margin-top:10px"><input id="cmm" inputmode="decimal" placeholder="${esc(T('Other length (mm)'))}"><button data-mm="custom">OK</button></div>
        <button class="wide ghost" data-mm="cancel">${esc(T('Cancel'))}</button></div>`;
      document.body.appendChild(m);
      m.onclick = e => { const b = e.target.closest('[data-mm]'); if (!b) return; let mm = b.dataset.mm;
        if (mm === 'cancel') { m.remove(); return; }
        if (mm === 'custom') mm = parseFloat(($('#cmm').value || '').replace(',', '.'));
        else mm = parseFloat(mm);
        if (!(mm > 0)) { toast('Enter a length in millimetres.'); return; }
        MI.Photo.setRef(st, d, L, mm); m.remove(); st.mode = 'measure'; hint(); S.viewer.draw(); toast('Scale set. Now draw a line across a crystal.'); };
    }
  };

  // ---------- identification ----------
  V.identify = () => {
    const st = S.id; if (!st) return go('home', {}, true);
    const R = MI.ID.rank(st); const top3 = R.slice(0, 3);
    const nxt = MI.ID.nextTest(st);
    const answered = Object.keys(st.ans).filter(k => st.ans[k] !== undefined);
    const conf = top3[0].p;
    const sure = conf >= 0.6 ? 'high' : conf >= 0.3 ? 'mid' : 'low';
    const danger = top3.filter(x => x.m.sf).map(x => x.m);
    const thumb = S.img ? `<img class="idthumb" src="${MI.Photo.scaled(S.img, 300)}" alt="">` : '';
    let html = top(T('Identification'), answered.length ? T('{n} tests done', { n: answered.length }) : '') + `<main>
      <div class="idhead">${thumb}<div>${st.photo ? `<div class="muted">${esc(T(st.model ? 'Photo AI and colours' : 'Colours found in the photo'))}:</div><div class="chips">${st.photo.map(c => `<span class="chip"><i class="sw" style="background:${MI.SWATCH[c.k]}"></i>${esc(TM('color', c.k))} ${Math.round(c.w * 100)}%</span>`).join('')}</div>` : `<div class="muted">${esc(T('Identification with tests only'))}</div>`}</div></div>
      <h3 class="sec">${esc(T('Best matches'))}</h3>
      ${!st.photo && !answered.length ? '' : `<div class="conf ${sure}">${esc(T(sure === 'high' ? 'Good match.' : sure === 'mid' ? 'Possible. Do a few more tests to be sure.' : 'Not sure yet. Answer the tests below.'))}</div>`}
      ${!st.photo && !answered.length && !st.special.length ? `<p class="muted">${esc(T('Answer the first test – the best matches will appear here.'))}</p>` : top3.map((x, i) => `<a href="#" class="cand" data-go="mineral" data-p='${JSON.stringify({ id: x.m.id, fromId: 1 })}'>
          <span class="rk">${i + 1}</span>${crys(x.m, 46)}<span class="cn"><b>${esc(N(x.m.id))}</b>${x.m.sf ? ` <span class="sfdot ${x.m.sf.lvl}" title="${esc(TM('safety', x.m.sf.k))}">!</span>` : ''}<small>${MI.fmt(x.m.f)} · ${esc(T('Mohs'))} ${hs(x.m)}</small>
          <span class="bar"><i style="width:${Math.max(3, Math.round(x.p * 100))}%"></i></span></span><span class="pc">${Math.round(x.p * 100)}%</span></a>`).join('')}
      ${danger.length ? `<div class="note warnbox">${I.warn} ${esc(T('Careful: {m} can be hazardous. Handle with gloves, wash your hands, do not lick or grind it.', { m: danger.map(m => N(m.id)).join(', ') }))}</div>` : ''}
      ${st.photo && answered.length < 2 ? `<p class="muted small">${esc(T('A photo alone is not enough to identify a mineral for sure. The simple tests below make the result much more reliable.'))}</p>` : ''}`;
    if (nxt) {
      const t = MI.ID.TESTS[nxt];
      html += `<div class="test"><h3>${esc(TM('test', nxt === 'heft' ? 'density' : nxt))}</h3><p>${esc(TM('how', nxt))}</p>
        ${nxt === 'hcl' ? `<div class="note warnbox small">${esc(T('Acid: wear gloves and glasses. Children only with an adult. Vinegar works for calcite (slower).'))}</div>` : ''}
        <div class="opts ${nxt === 'streak' || nxt === 'color' ? 'many' : ''}">${t.opts.map(o => `<button class="opt" data-t="${nxt}" data-o="${o}">${MI.ART.pic(nxt, o)}<span>${esc(TM('ans.' + nxt, o))}</span></button>`).join('')}</div>
        <button class="wide ghost" data-skip="${nxt}">${esc(T('I can\'t do this test – skip'))}</button></div>`;
    } else {
      html += `<div class="note">${esc(T('All tests done.'))}</div>`;
    }
    if (answered.length >= 2 || !nxt) {
      const sp = MI.ID.specialsFor(st);
      if (sp.length) html += `<h4>${esc(T('Anything special? (tap all that apply)'))}</h4><div class="chips">${sp.map(k => `<button class="chip tog ${st.special.includes(k) ? 'on' : ''}" data-sp="${k}">${esc(TM('sp', k))}</button>`).join('')}</div>`;
    }
    if (answered.length) html += `<h4>${esc(T('Your answers'))}</h4><div class="chips">${answered.map(k => `<button class="chip ans" data-un="${k}">${esc(TM('test', k === 'heft' ? 'density' : k))}: <b>${esc(st.ans[k] === null ? T('skipped') : TM('ans.' + k, st.ans[k]))}</b> ✕</button>`).join('')}</div>`;
    html += `<div class="row2" style="margin-top:14px"><button data-a="save">${I.plus} ${esc(T('Save to collection'))}</button><button data-a="restart">${esc(T('Start again'))}</button></div></main>`;
    app().innerHTML = html; bindCommon();
    $$('.opt').forEach(b => b.onclick = () => { st.ans[b.dataset.t] = b.dataset.o; render(); });
    $$('[data-skip]').forEach(b => b.onclick = () => { st.ans[b.dataset.skip] = null; render(); });
    $$('[data-un]').forEach(b => b.onclick = () => { delete st.ans[b.dataset.un]; render(); });
    $$('[data-sp]').forEach(b => b.onclick = () => { const k = b.dataset.sp; const i = st.special.indexOf(k); if (i >= 0) st.special.splice(i, 1); else st.special.push(k); render(); });
    $('[data-a="restart"]').onclick = () => { st.ans = {}; st.special = []; render(); };
    $('[data-a="save"]').onclick = () => newSample(top3[0].m.id);
  };

  // create a sample from the current identification
  async function newSample(mineral) {
    const all = await MI.DB.all('samples');
    if (!licensed() && all.length >= MI.License.DEMO.samples) { lockBox('The free version keeps up to {n} samples. Get the full version for an unlimited collection and PDF/Excel export.', { n: MI.License.DEMO.samples }); return; }
    const s = { id: MI.uid(), mineral: mineral || '', name: '', date: new Date().toISOString().slice(0, 10), place: '', notes: '', created: Date.now(), tests: S.id ? { ...S.id.ans } : {} };
    Object.keys(s.tests).forEach(k => { if (s.tests[k] == null) delete s.tests[k]; });
    if (S.img) {
      const img = S.pst ? MI.Photo.compose(S.img, S.pst) : S.img;
      const size = S.pst ? MI.Photo.biggest(S.pst) : null; if (size) s.size = Math.round(size * 10) / 10;
      s.mini = MI.Photo.scaled(img, 160, 0.7);
      await MI.DB.put('photos', { id: s.id, full: MI.Photo.scaled(img, 1600, 0.85), thumb: MI.Photo.scaled(img, 480, 0.8) });
    }
    await MI.DB.put('samples', s);
    S.img = null; S.pst = null; S.id = null;
    go('sample', { id: s.id, fresh: 1 });
    getGPS(s, true);
  }
  function getGPS(s, quiet) {
    if (!navigator.geolocation) { if (!quiet) toast('GPS is not available on this device.'); return; }
    if (!quiet) toast('Getting GPS position…');
    navigator.geolocation.getCurrentPosition(async p => {
      s.lat = p.coords.latitude; s.lon = p.coords.longitude; s.acc = p.coords.accuracy; await MI.DB.put('samples', s);
      const cur = S.stack[S.stack.length - 1]; if (cur && cur.view === 'sample' && cur.p.id === s.id) { const g = $('#gpsv'); if (g) g.innerHTML = gpsHTML(s); }
      if (!quiet) toast('Position saved.');
    }, e => { if (!quiet) toast(e.code === 1 ? 'Location permission was refused. Allow it in the phone settings.' : 'Could not get a GPS position. Try outside.', 4500); }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 });
  }
  const gpsHTML = s => s.lat != null ? `<b>${s.lat.toFixed(5)}, ${s.lon.toFixed(5)}</b> <small>±${Math.round(s.acc || 0)} m</small> · <a href="https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lon}#map=15/${s.lat}/${s.lon}" target="_blank" rel="noopener">${esc(T('Open map'))}</a>` : `<span class="muted">${esc(T('No position yet'))}</span>`;

  // ---------- look-alike tips ----------
  MI.lookTip = (a, b) => {
    const d = MI.ID.differences(a, b).slice(0, 2); if (!d.length) return T('Very similar. Compare colour, crystal shape and where it was found.');
    const A = N(a.id), B = N(b.id);
    return d.map(x => {
      switch (x.k) {
        case 'hardness': return T(a.h[0] > b.h[1] ? '{a} is harder ({x} vs {y}).' : '{a} is softer ({x} vs {y}).', { a: A, x: hs(a), y: hs(b) });
        case 'density': return T(a.d[0] > b.d[1] ? '{a} feels heavier ({x} vs {y} g/cm³).' : '{a} feels lighter ({x} vs {y} g/cm³).', { a: A, x: ds(a), y: ds(b) });
        case 'streak': return T('Streak: {a} {x}, {b} {y}.', { a: A, b: B, x: a.st.map(s => TM('streak', s)).join('/'), y: b.st.map(s => TM('streak', s)).join('/') });
        case 'magnet': return T(Math.max(...a.mag) > Math.max(...b.mag) ? '{a} is attracted by a magnet, {b} is not (or only weakly).' : '{b} is attracted by a magnet, {a} is not (or only weakly).', { a: A, b: B });
        case 'hcl': return T(a.hcl > b.hcl ? '{a} fizzes in acid, {b} does not (or less).' : '{b} fizzes in acid, {a} does not (or less).', { a: A, b: B });
        case 'cleavage': return T('Cleavage: {a} {x}, {b} {y}.', { a: A, b: B, x: a.cl.map(c => TM('cleavage', c)).join(' / '), y: b.cl.map(c => TM('cleavage', c)).join(' / ') });
        case 'luster': return T('Luster: {a} {x}, {b} {y}.', { a: A, b: B, x: a.lu.map(l => TM('luster', l)).join(', '), y: b.lu.map(l => TM('luster', l)).join(', ') });
      } return '';
    }).join(' ');
  };

  // ---------- atlas ----------
  V.atlas = p => {
    const q = (p.q || '').toLowerCase(); const cls = p.cls || '';
    const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const list = MI.MINERALS.filter(m => (!cls || m.cls === cls) && (!q || norm(N(m.id)).includes(norm(q)) || norm(MI.I18N.name(m.id, 'en')).includes(norm(q)) || m.f.toLowerCase().includes(q)))
      .sort((a, b) => N(a.id).localeCompare(N(b.id), MI.I18N.lang));
    app().innerHTML = top(T('Atlas'), T('{n} minerals', { n: MI.MINERALS.length })) + `<main>
      <input id="q" type="search" placeholder="${esc(T('Search name or formula'))}" value="${esc(p.q || '')}">
      <div class="chips scroll"><button class="chip tog ${!cls ? 'on' : ''}" data-cls="">${esc(T('All'))}</button>${MI.VOC.cls.map(c => `<button class="chip tog ${cls === c ? 'on' : ''}" data-cls="${c}">${esc(TM('cls', c))}</button>`).join('')}</div>
      <div id="al">${list.map(m => `<a href="#" class="arow" data-go="mineral" data-p='{"id":"${m.id}"}'>${crys(m, 40)}<span><b>${esc(N(m.id))}</b>${m.sf ? ` <span class="sfdot ${m.sf.lvl}">!</span>` : ''}<small>${MI.fmt(m.f)}</small></span><span class="h">${esc(T('Mohs'))} ${hs(m)}</span></a>`).join('') || `<p class="muted">${esc(T('Nothing found.'))}</p>`}</div></main>`;
    bindCommon();
    const qi = $('#q'); let t; qi.oninput = () => { clearTimeout(t); t = setTimeout(() => { S.stack[S.stack.length - 1].p = { ...p, q: qi.value }; const pos = qi.selectionStart; render(); const n = $('#q'); n.focus(); n.setSelectionRange(pos, pos); }, 250); };
    $$('[data-cls]').forEach(b => b.onclick = () => { S.stack[S.stack.length - 1].p = { ...p, cls: b.dataset.cls }; render(); });
  };

  V.mineral = p => {
    const m = MI.BY[p.id]; if (!m) return back();
    const row = (k, v) => v ? `<tr><th>${esc(T(k))}</th><td>${v}</td></tr>` : '';
    const sw = (cat, arr) => arr.map(c => `<span class="chip"><i class="sw" style="background:${MI.SWATCH[c] || '#999'}"></i>${esc(TM(cat, c))}</span>`).join('');
    const sf = m.sf ? `<div class="note ${m.sf.lvl === 'red' ? 'warnbox' : 'amberbox'}"><b>${I.warn} ${esc(TM('safety', m.sf.k))}</b><br>${esc(TM('safetyhow', m.sf.k))}</div>` : '';
    app().innerHTML = top(N(m.id), m.v ? T('Variety of {m}', { m: N(m.v) }) : TM('cls', m.cls)) + `<main>
      <div class="mhead">${crys(m, 110)}<div><h2>${esc(N(m.id))}</h2><div class="f">${MI.fmt(m.f)}</div>
        ${m.v ? `<a href="#" data-go="mineral" data-p='{"id":"${m.v}"}'>${esc(T('Variety of {m}', { m: N(m.v) }))}</a>` : ''}
        <div class="muted small">${esc(MI.I18N.lang !== 'en' ? MI.I18N.name(m.id, 'en') : '')}</div></div></div>
      ${sf}
      <table class="props">
        ${row('Mineral class', esc(TM('cls', m.cls)))}
        ${row('Crystal system', esc(TM('sys', m.sys)))}
        ${row('Mohs hardness', hs(m) + (m.sp.includes('two_hardness') ? ' <small>(' + esc(TM('sp', 'two_hardness')) + ')</small>' : ''))}
        ${row('Density', ds(m) + ' g/cm³')}
        ${row('Streak', sw('streak', m.st))}
        ${row('Luster', esc(m.lu.map(l => TM('luster', l)).join(', ')))}
        ${row('Colour', sw('color', m.c))}
        ${row('Cleavage', esc(m.cl.map(c => TM('cleavage', c)).join(' / ')))}
        ${row('Magnetism', esc(TM('mag', Math.max(...m.mag))))}
        ${row('Reaction to acid (HCl)', esc(TM('hclv', m.hcl)))}
        ${row('Special', esc(m.sp.filter(s => s !== 'two_hardness').map(s => TM('sp', s)).join(', ')))}
        ${row('Where found', esc(m.oc.map(o => TM('occ', o)).join(', ')))}
        ${row('Uses', esc(m.use.map(u => TM('use', u)).join(', ')))}
      </table>
      ${m.lk.length ? `<h3 class="sec">${esc(T('Looks similar to'))}</h3>${m.lk.map(o => `<a href="#" class="lk" data-go="mineral" data-p='{"id":"${o}"}'>${crys(MI.BY[o], 36)}<span><b>${esc(N(o))}</b><small>${esc(MI.lookTip(m, MI.BY[o]))}</small></span></a>`).join('')}` : ''}
      <button class="primary wide" data-a="add">${I.plus} ${esc(T(p.fromId ? 'This is it – save to collection' : 'Add to my collection'))}</button>
      ${p.fromId ? `<button class="wide" data-a="back">${esc(T('Back to the tests'))}</button>` : ''}
      <p class="muted small">${esc(T('Picture: drawing of the typical crystal shape and colours (not a photo).'))}</p></main>`;
    bindCommon();
    $('[data-a="add"]').onclick = () => { if (!p.fromId) { S.img = null; S.pst = null; S.id = null; } newSample(m.id); };
  };

  // ---------- collection ----------
  V.collection = async () => {
    const all = (await MI.DB.all('samples')).sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.created - a.created);
    app().innerHTML = top(T('My collection'), T('{n} samples', { n: all.length })) + `<main>
      <div class="row2"><button class="primary" data-a="new">${I.plus} ${esc(T('New sample'))}</button><button data-go="map">${I.map} ${esc(T('Map'))}</button></div>
      ${all.length ? `<div class="row2" style="margin-top:8px"><button data-a="pdf">PDF</button><button data-a="xlsx">Excel</button></div>` : ''}
      <div class="list">${all.map(s => { const m = MI.BY[s.mineral];
        return `<a href="#" class="srow" data-go="sample" data-p='{"id":"${s.id}"}'>${s.mini ? `<img src="${s.mini}" alt="">` : m ? crys(m, 56) : '<span class="ph"></span>'}
        <span><b>${esc(m ? N(m.id) : (s.name || T('Unknown mineral')))}</b>${m && m.sf ? ` <span class="sfdot ${m.sf.lvl}">!</span>` : ''}<small>${esc([s.date, s.place].filter(Boolean).join(' · '))}${s.lat != null ? ' 📍' : ''}</small>${s.name && m ? `<small>${esc(s.name)}</small>` : ''}</span></a>`; }).join('')}</div>
      ${all.length ? '' : `<div class="empty">${I.box}<h2>${esc(T('No samples yet'))}</h2><p>${esc(T('Identify a mineral and save it, or add one by hand.'))}</p></div>`}</main>`;
    bindCommon();
    $('[data-a="new"]').onclick = () => { S.img = null; S.pst = null; S.id = null; newSample(''); };
    const ex = async kind => { if (!licensed()) return lockBox('Export to PDF and Excel is part of the full version.'); toast('Preparing…'); try { if (kind === 'pdf') await MI.Export.pdf(all); else MI.Export.xlsx(all); } catch (e) { console.error(e); toast(e.message, 5000); } };
    if ($('[data-a="pdf"]')) { $('[data-a="pdf"]').onclick = () => ex('pdf'); $('[data-a="xlsx"]').onclick = () => ex('xlsx'); }
  };

  V.sample = async p => {
    const s = await MI.DB.get('samples', p.id); if (!s) return back();
    const ph = await MI.DB.get('photos', s.id); const m = MI.BY[s.mineral];
    const opts = [...MI.MINERALS].sort((a, b) => N(a.id).localeCompare(N(b.id), MI.I18N.lang)).map(x => `<option value="${x.id}"${x.id === s.mineral ? ' selected' : ''}>${esc(N(x.id))}</option>`).join('');
    app().innerHTML = top(m ? N(m.id) : (s.name || T('New sample')), s.date) + `<main>
      ${p.fresh ? `<div class="note okbox">${esc(T('Saved to your collection. Add the place and notes if you like.'))}</div>` : ''}
      <div class="sphoto">${ph ? `<img src="${ph.full}" alt="">` : `<div class="noph">${m ? crys(m, 90) : ''}</div>`}
        <label class="btn sm"><input type="file" accept="image/*" capture="environment" id="sp" hidden>${I.camera} ${esc(T(ph ? 'New photo' : 'Add photo'))}</label></div>
      ${m && m.sf ? `<div class="note ${m.sf.lvl === 'red' ? 'warnbox' : 'amberbox'}"><b>${I.warn} ${esc(TM('safety', m.sf.k))}</b> ${esc(TM('safetyhow', m.sf.k))}</div>` : ''}
      <div class="form">
        <div class="fld full"><label>${esc(T('Mineral'))}</label><select id="f_mineral"><option value="">${esc(T('Unknown mineral'))}</option>${opts}</select></div>
        <div class="fld full"><label>${esc(T('Own name / label'))}<small>${esc(T('e.g. "Amethyst geode from Grandpa"'))}</small></label><input id="f_name" value="${esc(s.name)}"></div>
        <div class="fld"><label>${esc(T('Date'))}</label><input id="f_date" type="date" value="${esc(s.date)}"></div>
        <div class="fld"><label>${esc(T('Size'))} (mm)</label><input id="f_size" inputmode="decimal" value="${esc(s.size ?? '')}"></div>
        <div class="fld full"><label>${esc(T('Place'))}</label><input id="f_place" value="${esc(s.place)}" placeholder="${esc(T('Locality, mine, beach…'))}"></div>
        <div class="fld full"><label>GPS</label><div class="gps"><span id="gpsv">${gpsHTML(s)}</span><button class="sm" data-a="gps">${I.pin} ${esc(T('Get'))}</button></div></div>
        <div class="fld full"><label>${esc(T('Notes'))}</label><textarea id="f_notes" rows="3">${esc(s.notes)}</textarea></div>
      </div>
      ${Object.keys(s.tests || {}).length ? `<h4>${esc(T('Tests'))}</h4><div class="chips">${Object.keys(s.tests).map(k => `<span class="chip">${esc(TM('test', k === 'heft' ? 'density' : k))}: <b>${esc(TM('ans.' + k, s.tests[k]))}</b></span>`).join('')}</div>` : ''}
      ${m ? `<button class="wide" data-go="mineral" data-p='{"id":"${m.id}"}'>${I.book} ${esc(T('Open in atlas'))}</button>` : ''}
      <button class="danger wide" data-a="del">${esc(T('Delete sample'))}</button></main>`;
    bindCommon();
    const save = async () => { s.mineral = $('#f_mineral').value; s.name = $('#f_name').value.trim(); s.date = $('#f_date').value; s.place = $('#f_place').value.trim(); s.notes = $('#f_notes').value;
      const z = parseFloat(($('#f_size').value || '').replace(',', '.')); s.size = isNaN(z) ? null : z; await MI.DB.put('samples', s); };
    $$('main input, main textarea').forEach(e => { if (e.type !== 'file') e.onchange = save; });
    $('#f_mineral').onchange = async () => { await save(); render(); };
    $('[data-a="gps"]').onclick = () => getGPS(s, false);
    $('#sp').onchange = async e => { const f = e.target.files[0]; if (!f) return; const c = await MI.Photo.load(f); s.mini = MI.Photo.scaled(c, 160, 0.7);
      await MI.DB.put('photos', { id: s.id, full: MI.Photo.scaled(c, 1600, 0.85), thumb: MI.Photo.scaled(c, 480, 0.8) }); await save(); render(); };
    $('[data-a="del"]').onclick = async () => { if (!(await ask('Delete this sample and its photo?'))) return; await MI.DB.del('samples', s.id); await MI.DB.del('photos', s.id); back(); };
  };

  // ---------- map ----------
  V.map = async () => {
    const all = (await MI.DB.all('samples')).filter(s => s.lat != null);
    const online = navigator.onLine && window.L;
    app().innerHTML = top(T('Map of finds'), T('{n} samples', { n: all.length })) + `<main>
      ${online ? '<div id="map" class="map"></div>' : `<div class="note">${esc(T('The map needs internet. Offline you see the list with coordinates.'))}</div>`}
      ${all.length ? all.map(s => { const m = MI.BY[s.mineral]; return `<a href="#" class="srow" data-go="sample" data-p='{"id":"${s.id}"}'>${s.mini ? `<img src="${s.mini}" alt="">` : m ? crys(m, 48) : '<span class="ph"></span>'}<span><b>${esc(m ? N(m.id) : s.name || T('Unknown mineral'))}</b><small>${s.lat.toFixed(5)}, ${s.lon.toFixed(5)} · ${esc(s.date || '')}</small></span></a>`; }).join('')
        : `<div class="empty">${I.pin}<h2>${esc(T('No places yet'))}</h2><p>${esc(T('Samples with a GPS position appear here.'))}</p></div>`}</main>`;
    bindCommon();
    if (online) {
      try {
        const map = L.map('map'); L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap contributors' }).addTo(map);
        const pts = all.map(s => { const m = MI.BY[s.mineral]; const mk = L.circleMarker([s.lat, s.lon], { radius: 8, color: '#10243a', fillColor: '#ffd166', fillOpacity: 1, weight: 2 }).addTo(map);
          mk.bindPopup(`${s.mini ? `<img src="${s.mini}" style="width:120px;border-radius:6px;display:block">` : ''}<b>${esc(m ? N(m.id) : s.name || T('Unknown mineral'))}</b><br>${esc(s.date || '')}<br><a href="#" data-sid="${s.id}">${esc(T('Open'))}</a>`); return [s.lat, s.lon]; });
        if (pts.length) map.fitBounds(pts, { padding: [30, 30], maxZoom: 13 }); else map.setView([30, 10], 2);
        map.on('popupopen', e => { const a = e.popup.getElement().querySelector('[data-sid]'); if (a) a.onclick = ev => { ev.preventDefault(); go('sample', { id: a.dataset.sid }); }; });
      } catch (e) { console.error(e); }
    }
  };

  // ---------- quiz ----------
  V.quiz = async () => {
    const best = (await MI.DB.meta('quizBest')) || {};
    const lv = [['kid', '🧒', 'Kids', 'Colours, hardness, magnets'], ['student', '🎓', 'Students', 'Streak, formulas, cleavage'], ['expert', '⛏️', 'Experts', 'Look-alikes, crystal systems, density']];
    app().innerHTML = top(T('Quiz'), T('Which mineral is this?')) + `<main>
      ${lv.map(([k, e, n, d]) => `<button class="qlv" data-lv="${k}"><span class="em">${e}</span><span><b>${esc(T(n))}</b><small>${esc(T(d))}</small></span><span class="best">${best[k] != null ? '★ ' + best[k] + '/10' : ''}${!licensed() && k !== 'kid' ? ' 🔒' : ''}</span></button>`).join('')}
      <p class="muted small">${esc(T('10 questions per round. Questions are made from the atlas, so every round is different.'))}</p></main>`;
    bindCommon();
    $$('[data-lv]').forEach(b => b.onclick = () => { const k = b.dataset.lv; if (!licensed() && k !== 'kid') return lockBox('The student and expert quiz levels are part of the full version. The kids level is free.'); S.quiz = { lv: k, qs: MI.Quiz.round(k), i: 0, score: 0, picked: null }; go('quizq'); });
  };
  V.quizq = async () => {
    const Q = S.quiz; if (!Q) return go('quiz', {}, true);
    if (Q.i >= Q.qs.length) {
      const best = (await MI.DB.meta('quizBest')) || {}; const nb = Math.max(best[Q.lv] || 0, Q.score); best[Q.lv] = nb; await MI.DB.meta('quizBest', best);
      const stars = Q.score >= 9 ? 3 : Q.score >= 6 ? 2 : Q.score >= 3 ? 1 : 0;
      app().innerHTML = top(T('Quiz'), '') + `<main class="center"><div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><h2>${esc(T('Score: {s} of {n}', { s: Q.score, n: Q.qs.length }))}</h2>
        <p>${esc(T(stars === 3 ? 'Excellent! You are a real mineral expert.' : stars === 2 ? 'Well done!' : 'Keep practising – look the minerals up in the atlas.'))}</p>
        <button class="primary wide" data-a="again">${esc(T('Play again'))}</button><button class="wide" data-go="atlas">${I.book} ${esc(T('Atlas'))}</button></main>`;
      bindCommon(); $('[data-a="again"]').onclick = () => { S.quiz = { lv: Q.lv, qs: MI.Quiz.round(Q.lv), i: 0, score: 0, picked: null }; render(); }; return;
    }
    const q = Q.qs[Q.i]; const done = Q.picked != null;
    app().innerHTML = top(T('Quiz'), T('Question {i} of {n}', { i: Q.i + 1, n: Q.qs.length }), `<span class="qs">★ ${Q.score}</span>`) + `<main>
      <div class="qbar"><i style="width:${Q.i / Q.qs.length * 100}%"></i></div>
      ${q.show ? `<div class="qshow">${q.show.map(m => crys(m, 72)).join('')}</div>` : ''}
      <h2 class="qq">${q.html ? q.q : esc(q.q)}</h2>
      <div class="qopts">${q.opts.map((o, i) => `<button class="qo ${done ? (i === q.ans ? 'ok' : i === Q.picked ? 'bad' : '') : ''}" data-i="${i}" ${done ? 'disabled' : ''}>${o.id ? crys(MI.BY[o.id], 34) : o.c ? `<i class="sw big" style="background:${MI.SWATCH[o.c]}"></i>` : ''}<span>${esc(o.t)}</span></button>`).join('')}</div>
      ${done ? `<div class="note ${Q.picked === q.ans ? 'okbox' : 'warnbox'}"><b>${esc(T(Q.picked === q.ans ? 'Correct!' : 'Not quite.'))}</b> ${q.ex && q.ex.includes('<sub>') ? q.ex : esc(q.ex || '')}</div><button class="primary wide" data-a="next">${esc(T('Next'))}</button>` : ''}</main>`;
    bindCommon();
    $$('.qo').forEach(b => b.onclick = () => { Q.picked = +b.dataset.i; if (Q.picked === q.ans) Q.score++; render(); });
    if (done) $('[data-a="next"]').onclick = () => { Q.i++; Q.picked = null; render(); };
  };

  // ---------- settings ----------
  V.settings = async () => {
    const lic = MI.License.state; const st = S.settings;
    const last = await MI.DB.meta('lastBackup');
    app().innerHTML = top(T('Settings'), 'Mineral ID ' + MI.VERSION) + `<main>
      <div class="block"><h4>${esc(T('Language'))}</h4><select id="lang"><option value="">${esc(T('Automatic (phone language)'))}</option>${MI.I18N.LANGS.map(l => `<option value="${l}"${st.lang === l ? ' selected' : ''}>${MI.I18N.langName(l)}</option>`).join('')}</select></div>
      <div class="block"><h4>${esc(T('Licence'))}</h4>${lic.licensed ? `<p>✅ ${esc(T('Full version active'))}<br><small class="muted">${esc(lic.name || '')} · ${esc(lic.key || '')}</small></p><button class="danger wide" id="deact">${esc(T('Remove licence from this device'))}</button>`
        : `<p class="muted">${esc(T('Free version: {n} identifications and {s} collection samples. Export and the student/expert quiz need the full version.', { n: MI.License.DEMO.ident, s: MI.License.DEMO.samples }))}</p>
        <input id="lk" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocapitalize="characters" autocomplete="off"><button class="primary wide" id="act">${esc(T('Activate'))}</button>
        ${MI.License.BUY_URL ? `<a class="btn wide" href="${esc(MI.License.BUY_URL)}" target="_blank" rel="noopener">${esc(T('Buy the full version'))}</a>` : ''}`}</div>
      <div class="block"><h4>${esc(T('Backup'))}</h4><p class="muted small">${esc(T('Save your whole collection with photos to one file (keep it in Google Drive, iCloud or e-mail). Last backup: {d}', { d: last ? new Date(last).toLocaleDateString() : T('never') }))}</p>
        <div class="row2"><button id="bk">${esc(T('Save backup'))}</button><label class="btn"><input type="file" accept=".json,application/json" id="rs" hidden>${esc(T('Restore'))}</label></div></div>
      <div class="block"><h4>${I.warn} ${esc(T('Safety rules'))}</h4><ul class="small">${['Never lick, taste or swallow minerals.', 'Wash your hands after handling minerals.', 'Do not break, saw or grind minerals indoors without a mask – dust can be harmful.', 'Acid tests: gloves and safety glasses; children only with an adult.', 'Red warning: radioactive, asbestos, arsenic or mercury minerals. Keep them in a closed box, away from children and food.'].map(x => `<li>${esc(T(x))}</li>`).join('')}</ul></div>
      <div class="block"><h4>${esc(T('Photo credits and licences'))}</h4><div class="small"><p>${esc(T('Mineral pictures in the atlas are drawings made for this app.'))}</p>
        <p>${esc(T('Photo recognition was trained on {n} freely licensed photos from Wikimedia Commons (CC BY, CC BY-SA, CC0, public domain). Thank you to all photographers.', { n: S.nCred || '…' }))}</p>
        <button class="wide" id="cred">${esc(T('Show authors and licences'))}</button><div id="credlist" class="credlist"></div>
        <p class="muted">TensorFlow.js (Apache-2.0) · EfficientNet-B0 (Apache-2.0) · jsPDF (MIT) · SheetJS (Apache-2.0) · Leaflet (BSD-2-Clause) · DejaVu fonts (free licence) · ${esc(T('Map data'))} © OpenStreetMap contributors (ODbL)</p></div></div>
      <div class="block"><h4>${esc(T('About'))}</h4><p class="small">${esc(T('Mineral ID helps you recognise common minerals with a photo and simple tests. Identification from a photo can be wrong – always confirm with tests. Not for valuation of gems or for safety decisions.'))}</p><p class="small muted">© Engineering Geology · v${MI.VERSION}</p></div></main>`;
    bindCommon();
    $('#lang').onchange = async e => { st.lang = e.target.value; MI.I18N.set(st.lang || MI.I18N.detect()); await MI.DB.meta('settings', st); $('#installBtn').textContent = T('Install app'); render(); };
    if ($('#act')) $('#act').onclick = async () => { const b = $('#act'); b.disabled = true; b.textContent = T('Checking…'); try { await MI.License.activate($('#lk').value, ''); toast('Licence activated. Thank you!'); render(); } catch (e) { toast(e.message, 5000); b.disabled = false; b.textContent = T('Activate'); } };
    if ($('#deact')) $('#deact').onclick = async () => { if (await ask('Remove the licence from this device? You can activate it again later.', 'Remove')) { await MI.License.deactivate(); render(); } };
    if (!S.nCred) fetch('model/credits.json').then(r => r.json()).then(c => { S.nCred = c.length; const p = $('#cred'); if (p) p.previousElementSibling.textContent = T('Photo recognition was trained on {n} freely licensed photos from Wikimedia Commons (CC BY, CC BY-SA, CC0, public domain). Thank you to all photographers.', { n: c.length }); }).catch(() => { });
    $('#cred').onclick = async () => {
      const box = $('#credlist'); let c; try { c = await (await fetch('model/credits.json')).json(); } catch (e) { toast('Not available offline yet.'); return; }
      let i = 0; const more = () => { const part = c.slice(i, i + 400); i += part.length;
        box.insertAdjacentHTML('beforeend', part.map(x => `<div><b>${esc(N(x.l))}</b> · <a href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.t)}</a>${x.a ? ' · ' + esc(x.a) : ''} · ${esc(x.c)}</div>`).join(''));
        const old = $('#credmore'); if (old) old.remove(); if (i < c.length) { box.insertAdjacentHTML('beforeend', `<button class="wide ghost" id="credmore">${esc(T('Show more'))} (${c.length - i})</button>`); $('#credmore').onclick = more; } };
      $('#cred').remove(); more();
    };
    $('#bk').onclick = async () => { await MI.Export.backup(); toast('Backup saved.'); render(); };
    $('#rs').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const n = await MI.Export.restore(f); toast(T('{n} samples restored.', { n })); } catch (err) { toast(err.message, 5000); } };
  };

  // ---------- start ----------
  async function boot() {
    try {
      S.settings = (await MI.DB.meta('settings')) || {};
      MI.I18N.set(S.settings.lang || MI.I18N.detect());
      await MI.License.load();
      if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p => { if (!p) navigator.storage.persist(); });
    } catch (e) { console.error(e); MI.I18N.set(MI.I18N.detect()); }
    $('#installBtn').textContent = T('Install app');
    go('home', {}, true);
    if (navigator.serviceWorker && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      const had = !!navigator.serviceWorker.controller; let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !reloaded) { reloaded = true; location.reload(); } });
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => { });
    }
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); MI._ip = e; $('#installBtn').hidden = false; });
    $('#installBtn').onclick = () => { if (MI._ip) { MI._ip.prompt(); MI._ip = null; $('#installBtn').hidden = true; } };
  }
  boot();
})();
