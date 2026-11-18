/* Photo: loading/resizing, colour analysis (on the phone, offline), and the viewer with zoom, magnifier, scale and measuring */
'use strict';
window.MI = window.MI || {};
(function () {
  const MAX = 1600;
  function load(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file); const img = new Image();
      img.onload = () => {
        const k = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Could not open this picture.')); };
      img.src = url;
    });
  }
  function fromDataURL(d) { return new Promise((res, rej) => { const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0); res(c); }; img.onerror = rej; img.src = d; }); }
  function scaled(canvas, max, q = 0.82) {
    const k = Math.min(1, max / Math.max(canvas.width, canvas.height));
    const c = document.createElement('canvas'); c.width = Math.round(canvas.width * k); c.height = Math.round(canvas.height * k);
    c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', q);
  }

  // ---------- colour analysis ----------
  function hsv(r, g, b) {
    r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0; if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
    return [h, mx ? d / mx : 0, mx];
  }
  function classify(r, g, b) {
    const [h, s, v] = hsv(r, g, b);
    if (v < 0.17) return 'black';
    if (s < 0.15) return v > 0.8 ? 'white' : v < 0.32 ? 'black' : 'grey';
    if (s < 0.25 && v < 0.5) return 'grey';
    if (h < 12 || h >= 345) return v < 0.45 ? 'brown' : (s < 0.45 && v > 0.7 ? 'pink' : 'red');
    if (h < 40) return (v < 0.55 || (s < 0.5 && v < 0.75)) ? 'brown' : 'orange';
    if (h < 68) return v < 0.5 ? 'brown' : 'yellow';
    if (h < 165) return 'green';
    if (h < 255) return 'blue';
    if (h < 290) return 'purple';
    return (v > 0.6 && s < 0.6) ? 'pink' : 'purple';
  }
  function colors(canvas) {
    const W = 120, H = Math.max(1, Math.round(canvas.height / canvas.width * 120));
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(canvas, 0, 0, W, H); const px = x.getImageData(0, 0, W, H).data;
    // background = average of the outer border
    let br = 0, bg = 0, bb = 0, bn = 0; const bw = Math.max(2, Math.round(W * 0.06));
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
      if (xx < bw || yy < bw || xx >= W - bw || yy >= H - bw) { const i = (yy * W + xx) * 4; br += px[i]; bg += px[i + 1]; bb += px[i + 2]; bn++; }
    }
    br /= bn; bg /= bn; bb /= bn;
    const count = (inner, filter) => {
      const cnt = {}; let n = 0;
      const x0 = Math.round(W * (1 - inner) / 2), y0 = Math.round(H * (1 - inner) / 2);
      for (let yy = y0; yy < H - y0; yy++) for (let xx = x0; xx < W - x0; xx++) {
        const i = (yy * W + xx) * 4, r = px[i], g = px[i + 1], b = px[i + 2];
        if (filter && Math.hypot(r - br, g - bg, b - bb) < 42) continue;
        const k = classify(r, g, b); cnt[k] = (cnt[k] || 0) + 1; n++;
      }
      return { cnt, n, total: (W - 2 * x0) * (H - 2 * y0) };
    };
    let r = count(0.7, true);
    if (r.n < r.total * 0.12) r = count(0.4, false);
    return Object.entries(r.cnt).map(([k, n]) => ({ k, w: n / r.n })).sort((a, b) => b.w - a.w).filter(o => o.w >= 0.08).slice(0, 4);
  }

  // ---------- viewer ----------
  const REFS = [['coin_eur1', 23.25], ['coin_eur2', 25.75], ['coin_usq', 24.26], ['coin_usc', 19.05], ['coin_gbp1', 23.43], ['cm1', 10], ['inch1', 25.4]];
  function niceBar(mmPerPx, imgW) {
    const target = imgW * 0.22 * mmPerPx; const steps = [0.5, 1, 2, 5, 10, 20, 50, 100, 200];
    let best = steps[0]; steps.forEach(s => { if (s <= target) best = s; }); return best;
  }
  function drawOverlay(x, st, k, lw) {
    // k: image px → canvas px factor; lw: base line width (canvas px)
    const lab = (p, text) => { x.font = `600 ${Math.round(14 * lw / 2)}px system-ui,sans-serif`; const w = x.measureText(text).width; x.fillStyle = 'rgba(0,0,0,.65)'; x.fillRect(p[0] - w / 2 - 4 * lw / 2, p[1] - 22 * lw / 2, w + 8 * lw / 2, 18 * lw / 2); x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText(text, p[0], p[1] - 8 * lw / 2); };
    const line = (a, b, col) => {
      x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = lw + 2; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      [a, b].forEach(p => { x.beginPath(); x.arc(p[0], p[1], lw * 2.2, 0, 7); x.fillStyle = col; x.fill(); });
    };
    if (st.ref) { const a = k(st.ref.a), b = k(st.ref.b); line(a, b, '#ffd166'); lab([(a[0] + b[0]) / 2, Math.min(a[1], b[1])], st.ref.mm + ' mm'); }
    st.meas.forEach(m => { const a = k(m.a), b = k(m.b); line(a, b, '#4fc3f7'); const L = Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]); lab([(a[0] + b[0]) / 2, Math.min(a[1], b[1])], st.mmPerPx ? (L * st.mmPerPx).toFixed(L * st.mmPerPx < 10 ? 1 : 0) + ' mm' : Math.round(L) + ' px'); });
    if (st.draft) line(k(st.draft.a), k(st.draft.b), st.mode === 'scale' ? '#ffd166' : '#4fc3f7');
  }
  function drawScaleBar(x, st, imgW, imgH, k, lw) {
    if (!st.mmPerPx) return;
    const mm = niceBar(st.mmPerPx, imgW), len = mm / st.mmPerPx;
    const p0 = k([imgW * 0.05, imgH * 0.93]), p1 = k([imgW * 0.05 + len, imgH * 0.93]);
    const h = 8 * lw / 2;
    x.fillStyle = 'rgba(255,255,255,.85)'; x.fillRect(p0[0] - 6, p0[1] - h - 22 * lw / 2, p1[0] - p0[0] + 12, h + 28 * lw / 2);
    x.fillStyle = '#000'; x.fillRect(p0[0], p0[1] - h, (p1[0] - p0[0]) / 2, h);
    x.strokeStyle = '#000'; x.lineWidth = 1.5; x.strokeRect(p0[0], p0[1] - h, p1[0] - p0[0], h);
    x.font = `700 ${Math.round(13 * lw / 2)}px system-ui,sans-serif`; x.textAlign = 'left'; x.fillText(mm + ' mm', p0[0], p0[1] - h - 5);
  }

  function viewer(host, img, st, onChange) {
    // st: {mode:'pan'|'scale'|'measure', mmPerPx, ref, meas:[], loupe:true}
    st.meas = st.meas || []; st.mode = st.mode || 'pan';
    const cv = document.createElement('canvas'); cv.className = 'pv'; host.innerHTML = ''; host.appendChild(cv);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W, H, fit, s = 1, tx = 0, ty = 0;
    function size() {
      W = host.clientWidth || 320; H = Math.round(Math.min(W * img.height / img.width, window.innerHeight * 0.62));
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      fit = Math.min(W / img.width, H / img.height); reset(false);
    }
    function reset(d = true) { s = 1; tx = (W - img.width * fit) / 2; ty = (H - img.height * fit) / 2; if (d) draw(); }
    const toScr = p => [(p[0] * fit * s + tx) * dpr, (p[1] * fit * s + ty) * dpr];
    const toImg = (cx, cy) => [(cx - tx) / (fit * s), (cy - ty) / (fit * s)];
    let loupeAt = null;
    function draw() {
      const x = cv.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#111'; x.fillRect(0, 0, cv.width, cv.height);
      x.setTransform(fit * s * dpr, 0, 0, fit * s * dpr, tx * dpr, ty * dpr); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0);
      x.setTransform(1, 0, 0, 1, 0, 0);
      drawOverlay(x, st, toScr, 2 * dpr); drawScaleBar(x, st, img.width, img.height, toScr, 2 * dpr);
      if (loupeAt) { // magnifier
        const R = 58 * dpr, Z = 3, [px, py] = loupeAt; const cx = (px * fit * s + tx) * dpr, cy = (py * fit * s + ty) * dpr;
        const lx = cx < cv.width / 2 ? cv.width - R - 10 : R + 10, ly = R + 10;
        x.save(); x.beginPath(); x.arc(lx, ly, R, 0, 7); x.clip();
        x.fillStyle = '#000'; x.fillRect(lx - R, ly - R, 2 * R, 2 * R);
        const zz = fit * s * Z * dpr; x.setTransform(zz, 0, 0, zz, lx - px * zz, ly - py * zz); x.drawImage(img, 0, 0); x.setTransform(1, 0, 0, 1, 0, 0);
        x.strokeStyle = '#ff5252'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(lx - 12, ly); x.lineTo(lx + 12, ly); x.moveTo(lx, ly - 12); x.lineTo(lx, ly + 12); x.stroke();
        x.restore(); x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.arc(lx, ly, R, 0, 7); x.stroke();
      }
    }
    const ptrs = new Map(); let pinch = null, pan = null;
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('pointerdown', e => {
      cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, pos(e));
      if (ptrs.size === 2) { st.draft = null; loupeAt = null; const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s, c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], tx, ty }; pan = null; return; }
      const p = pos(e);
      if (st.mode === 'pan' || st.mode === 'loupe') { pan = { p, tx, ty }; if (st.mode === 'loupe') { loupeAt = toImg(...p); draw(); } }
      else { const ip = toImg(...p); st.draft = { a: ip, b: ip }; loupeAt = ip; draw(); }
      e.preventDefault();
    });
    cv.addEventListener('pointermove', e => {
      if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, pos(e));
      if (pinch && ptrs.size >= 2) {
        const [a, b] = [...ptrs.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        const ns = Math.max(1, Math.min(12, pinch.s * d / pinch.d)); const c = pinch.c;
        tx = c[0] - (c[0] - pinch.tx) * ns / pinch.s; ty = c[1] - (c[1] - pinch.ty) * ns / pinch.s; s = ns; draw(); return;
      }
      const p = pos(e);
      if (pan) { tx = pan.tx + p[0] - pan.p[0]; ty = pan.ty + p[1] - pan.p[1]; if (st.mode === 'loupe') loupeAt = toImg(...p); draw(); }
      else if (st.draft) { st.draft.b = toImg(...p); loupeAt = st.draft.b; draw(); }
      e.preventDefault();
    });
    const up = e => {
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinch = null;
      if (pan && !ptrs.size) { pan = null; loupeAt = null; draw(); }
      if (st.draft && !ptrs.size) {
        const d = st.draft; st.draft = null; loupeAt = null;
        const L = Math.hypot(d.b[0] - d.a[0], d.b[1] - d.a[1]);
        if (L > 8) { if (st.mode === 'scale') onChange && onChange('ref', d, L); else { st.meas.push(d); onChange && onChange('meas'); } }
        draw();
      }
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.2 : 1 / 1.2, pos(e)); }, { passive: false });
    function zoom(f, c) { c = c || [W / 2, H / 2]; const ns = Math.max(1, Math.min(12, s * f)); tx = c[0] - (c[0] - tx) * ns / s; ty = c[1] - (c[1] - ty) * ns / s; s = ns; if (s === 1) reset(false); draw(); }
    size(); draw();
    const ro = new ResizeObserver(() => { if (Math.abs((host.clientWidth || 0) - W) > 4) { size(); draw(); } }); ro.observe(host);
    return { draw, zoom, reset: () => reset(true), destroy: () => ro.disconnect() };
  }
  function setRef(st, d, L, mm) { st.ref = { a: d.a, b: d.b, mm }; st.mmPerPx = mm / L; }
  function compose(img, st) {
    if (!st.mmPerPx && !st.meas.length) return img;
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const lw = Math.max(2, img.width / 400) * 1.2; const k = p => p;
    drawOverlay(x, { ...st, draft: null }, k, lw); drawScaleBar(x, st, img.width, img.height, k, lw); return c;
  }
  function biggest(st) { if (!st.mmPerPx || !st.meas.length) return null; return Math.max(...st.meas.map(m => Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]) * st.mmPerPx)); }
  MI.Photo = { load, fromDataURL, scaled, colors, viewer, setRef, compose, biggest, REFS };
})();
