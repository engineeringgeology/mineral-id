/* Drawings: crystal pictures for the atlas (until real photos are added) and pictures for the guided tests */
'use strict';
window.MI = window.MI || {};
(function () {
  const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const rgb2hex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const shade = (h, f) => { const c = hex2rgb(h); return rgb2hex(f > 0 ? c.map(v => v + (255 - v) * f) : c.map(v => v * (1 + f))); };
  const P = (pts, fill, extra = '') => `<polygon points="${pts}" fill="${fill}" stroke="rgba(0,0,0,.35)" stroke-width="1" stroke-linejoin="round" ${extra}/>`;

  const SHAPES = {
    cubic: [['50,14 86,31 50,48 14,31', 't'], ['14,31 50,48 50,88 14,71', 'l'], ['50,48 86,31 86,71 50,88', 'r']],
    tetra: [['50,6 22,32 50,42', 't'], ['50,6 78,32 50,42', 'r'], ['22,32 50,42 50,90 22,80', 'l'], ['50,42 78,32 78,80 50,90', 'r']],
    hex: [['50,5 24,30 50,38', 't'], ['50,5 76,30 50,38', 'r'], ['50,5 17,25 24,30', 't'], ['50,5 83,25 76,30', 'r'], ['17,25 24,30 24,84 17,78', 'l'], ['24,30 50,38 50,93 24,84', 'l'], ['50,38 76,30 76,84 50,93', 'r'], ['76,30 83,25 83,78 76,84', 'r']],
    ortho: [['50,26 90,40 50,54 10,40', 't'], ['10,40 50,54 50,74 10,60', 'l'], ['50,54 90,40 90,60 50,74', 'r']],
    mono: [['34,14 84,26 66,46 16,34', 't'], ['16,34 66,46 66,88 16,76', 'l'], ['66,46 84,26 84,68 66,88', 'r']],
    tric: [['40,12 88,30 62,46 12,30', 't'], ['12,30 62,46 56,90 8,72', 'l'], ['62,46 88,30 84,72 56,90', 'r']]
  };
  SHAPES.trig = SHAPES.hex;
  const id = () => 'g' + Math.random().toString(36).slice(2, 8);

  function crystal(m, size = 64) {
    const SW = MI.SWATCH; const ck = m.c[0];
    let base = SW[ck] || '#999';
    if (ck === 'colorless') base = '#cfe3ee'; if (ck === 'white') base = '#eceff1';
    const metal = m.lu.includes('metallic');
    const g = id();
    let body;
    if (m.sys === 'amorph') {
      body = `<defs><radialGradient id="${g}" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="${shade(base, .55)}"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${shade(base, -.45)}"/></radialGradient></defs>
      <path d="M22 58C12 40 26 18 48 16c20-2 38 10 36 30-1 16-8 32-30 36-16 3-26-8-32-24z" fill="url(#${g})" stroke="rgba(0,0,0,.35)"/>`;
    } else {
      const f = { t: shade(base, .35), l: base, r: shade(base, -.3) };
      body = SHAPES[m.sys].map(([pts, k]) => P(pts, f[k], ck === 'colorless' ? 'fill-opacity=".8"' : '')).join('');
      if (metal) body = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".65"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>` + body +
        SHAPES[m.sys].map(([pts]) => `<polygon points="${pts}" fill="url(#${g})"/>`).join('');
    }
    const extra = m.c.slice(1, 4).map((c, i) => `<circle cx="${10 + i * 9}" cy="92" r="4" fill="${SW[c] || '#999'}" stroke="rgba(0,0,0,.3)"/>`).join('');
    return `<svg class="crys" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${body}${m.c.length > 1 ? extra : ''}</svg>`;
  }

  // ---------- test pictures (viewBox 0 0 80 60) ----------
  const W = s => `<svg viewBox="0 0 80 60" class="tp" aria-hidden="true">${s}</svg>`;
  const rock = (c = '#9aa3ab') => `<path d="M14 46l6-18 16-8 20 4 10 14-6 12-30 4z" fill="${c}" stroke="#555"/>`;
  const PIC = {
    // luster
    'luster.metallic': W(`<defs><linearGradient id="lm" x1="0" x2="1"><stop offset="0" stop-color="#666"/><stop offset=".35" stop-color="#eee"/><stop offset=".6" stop-color="#888"/><stop offset="1" stop-color="#ccc"/></linearGradient></defs><path d="M14 46l6-18 16-8 20 4 10 14-6 12-30 4z" fill="url(#lm)" stroke="#444"/><path d="M30 26l6-3" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`),
    'luster.glassy': W(`<path d="M28 50L18 24l22-14 22 14-10 26z" fill="#bfe3f2" stroke="#4a7d95"/><path d="M40 10v40M18 24h44" stroke="#4a7d95" stroke-width=".8"/><path d="M27 22l6-4" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`),
    'luster.brilliant': W(`<path d="M24 26h32l-16 26z" fill="#e8f4fb" stroke="#3a6b85"/><path d="M24 26l8-10h16l8 10" fill="#fff" stroke="#3a6b85"/><g stroke="#f1b31c" stroke-width="2" stroke-linecap="round"><path d="M64 14l6-4M66 24h8M12 14l-5-4M10 26H3"/></g>`),
    'luster.greasy': W(`${rock('#b9a77a')}<ellipse cx="38" cy="32" rx="12" ry="5" fill="#fff" opacity=".45"/><ellipse cx="46" cy="40" rx="6" ry="2.5" fill="#fff" opacity=".35"/>`),
    'luster.pearly': W(`<g stroke="#9c8f7a" fill="#f6efe3"><path d="M14 44h52l-6 8H20z"/><path d="M16 36h48l-4 8H20z"/><path d="M18 28h44l-4 8H22z"/></g><path d="M24 31h20" stroke="#fff" stroke-width="2.5" opacity=".9"/><path d="M40 39h14" stroke="#e7d7ff" stroke-width="2"/>`),
    'luster.silky': W(`<g stroke="#b3a27d" stroke-width="2.2">${Array.from({ length: 9 }, (_, i) => `<path d="M${16 + i * 6} 50L${22 + i * 6} 12"/>`).join('')}</g><path d="M30 14l12 34" stroke="#fff" stroke-width="3" opacity=".7"/>`),
    'luster.dull': W(`${rock('#a07c5a')}${Array.from({ length: 14 }, (_, i) => `<circle cx="${20 + (i * 37) % 40}" cy="${26 + (i * 13) % 22}" r="1.3" fill="#6b4f36"/>`).join('')}`),
    // hardness
    'hardness.nail': W(`<path d="M10 58V26c0-10 22-10 22 0v32" fill="#f3c9a8" stroke="#a5765a"/><path d="M13 30c0-7 16-7 16 0v8H13z" fill="#fde7e1" stroke="#a5765a"/>${rock()}`.replace('M14 46', 'M34 48')),
    'hardness.coin': W(`<circle cx="26" cy="28" r="15" fill="#d99a4e" stroke="#8a5a26" stroke-width="2"/><circle cx="26" cy="28" r="10" fill="none" stroke="#8a5a26"/><path d="M40 52l8-16 14-6 12 6 2 12-8 6z" fill="#9aa3ab" stroke="#555"/>`),
    'hardness.knife': W(`<path d="M6 40l40-26 8 4-40 26z" fill="#d7dde2" stroke="#555"/><path d="M14 44l-8 12 6 2 8-10z" fill="#5d4037"/><path d="M42 54l8-14 14-6 10 6 2 10-8 6z" fill="#9aa3ab" stroke="#555"/>`),
    'hardness.glass': W(`<path d="M6 40l30-26h38L44 40z" fill="#cde9f5" fill-opacity=".8" stroke="#4a7d95"/><path d="M22 30l18-12" stroke="#fff" stroke-width="2"/><path d="M48 24l10-2" stroke="#c62828" stroke-width="2"/><path d="M50 58l6-12 12-4 8 6-4 10z" fill="#9aa3ab" stroke="#555"/>`),
    // magnet
    'magnet.strong': W(`<path d="M10 10h12v24a8 8 0 0016 0V10h12v24a20 20 0 01-40 0z" fill="#d32f2f" stroke="#7f1d1d"/><path d="M10 10h12v8H10zM38 10h12v8H38z" fill="#cfd8dc"/><path d="M52 44l8-6 12 2 2 10-10 6z" fill="#333" stroke="#000"/><g stroke="#888" stroke-dasharray="2 2"><path d="M46 40l6 2M44 46l8 0"/></g>`),
    'magnet.weak': W(`<path d="M10 10h12v24a8 8 0 0016 0V10h12v24a20 20 0 01-40 0z" fill="#d32f2f" stroke="#7f1d1d"/><path d="M10 10h12v8H10zM38 10h12v8H38z" fill="#cfd8dc"/><path d="M58 46l8-6 10 2 2 10-10 6z" fill="#8d6e63" stroke="#000"/><path d="M50 44h4" stroke="#888" stroke-dasharray="2 2"/>`),
    'magnet.none': W(`<path d="M10 10h12v24a8 8 0 0016 0V10h12v24a20 20 0 01-40 0z" fill="#d32f2f" stroke="#7f1d1d"/><path d="M10 10h12v8H10zM38 10h12v8H38z" fill="#cfd8dc"/><path d="M60 46l6-6 10 2v10l-10 4z" fill="#e0e0e0" stroke="#555"/><path d="M56 22l12 12M68 22L56 34" stroke="#c62828" stroke-width="3"/>`),
    // HCl
    'hcl.strong': W(`<path d="M34 4h12v14l-3 8h-6l-3-8z" fill="#e3f2fd" stroke="#1565c0"/><path d="M16 50l8-12 18-4 18 4 6 12z" fill="#eceff1" stroke="#555"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${26 + (i * 17) % 32}" cy="${30 + (i * 7) % 10}" r="${1.5 + (i % 3)}" fill="none" stroke="#1565c0"/>`).join('')}`),
    'hcl.powder': W(`<path d="M34 4h12v14l-3 8h-6l-3-8z" fill="#e3f2fd" stroke="#1565c0"/><path d="M12 52l8-12 14-3 10 3 4 12z" fill="#eceff1" stroke="#555"/><ellipse cx="62" cy="50" rx="12" ry="4" fill="#fafafa" stroke="#888"/>${[0, 1, 2, 3].map(i => `<circle cx="${56 + i * 4}" cy="${44 - (i % 2) * 3}" r="1.6" fill="none" stroke="#1565c0"/>`).join('')}`),
    'hcl.none': W(`<path d="M34 4h12v14l-3 8h-6l-3-8z" fill="#e3f2fd" stroke="#1565c0"/><path d="M16 50l8-12 18-4 18 4 6 12z" fill="#eceff1" stroke="#555"/><path d="M38 32c0 3 4 3 4 0" fill="#90caf9"/>`),
    // cleavage
    'cleavage.none': W(`<path d="M14 46c4-20 20-32 38-28 14 4 18 18 10 28-10 10-38 12-48 0z" fill="#b0bec5" stroke="#555"/><path d="M26 40c6-10 16-14 26-10M30 44c6-6 12-8 20-6" fill="none" stroke="#78909c"/>`),
    'cleavage.1': W(`<g fill="#d7ccc8" stroke="#6d4c41"><path d="M12 48l10-8h46l-10 8z"/><path d="M16 40l10-8h42l-10 8z" transform="translate(-2 -2)"/><path d="M20 32l10-8h38l-10 8z" transform="translate(-4 -4)"/></g><path d="M58 14l10-6" stroke="#6d4c41"/>`),
    'cleavage.2': W(`<path d="M18 20h30v34H18z" fill="#f8bbd0" stroke="#880e4f"/><path d="M18 20l12-10h30L48 20z" fill="#fce4ec" stroke="#880e4f"/><path d="M48 20l12-10v34L48 54z" fill="#f48fb1" stroke="#880e4f"/>`),
    'cleavage.3cube': W(`<path d="M24 22h28v28H24z" fill="#eceff1" stroke="#455a64"/><path d="M24 22l10-10h28L52 22z" fill="#fff" stroke="#455a64"/><path d="M52 22l10-10v28L52 50z" fill="#cfd8dc" stroke="#455a64"/>`),
    'cleavage.3rhomb': W(`<path d="M16 46l14-30h34L50 46z" fill="#fff8e1" stroke="#8d6e63"/><path d="M30 16l8-8h32l-6 8z" fill="#fffde7" stroke="#8d6e63"/><path d="M64 16l6-8-12 30-8 8z" fill="#ffecb3" stroke="#8d6e63"/>`),
    'cleavage.4': W(`<path d="M40 4L18 30l22 26 22-26z" fill="#d1c4e9" stroke="#4527a0"/><path d="M40 4L30 30l10 26M18 30h44" fill="none" stroke="#4527a0"/>`),
    'cleavage.many': W(`<path d="M40 6l20 10v24L40 54 20 40V16z" fill="#d7ccc8" stroke="#4e342e"/><path d="M40 6v20l20-10M40 26L20 16M40 26v28M20 40l20-14 20 14" fill="none" stroke="#4e342e"/>`),
    // heft
    'heft.light': W(`<path d="M18 50c20-6 36-24 46-42-14 4-34 14-46 42z" fill="#e0f2f1" stroke="#00796b"/><path d="M18 50L52 18" stroke="#00796b"/>`),
    'heft.normal': W(`${rock()}`),
    'heft.heavy': W(`<path d="M26 22h28l8 32H18z" fill="#78909c" stroke="#37474f"/><path d="M32 22a8 8 0 0116 0" fill="none" stroke="#37474f" stroke-width="3"/><text x="40" y="46" text-anchor="middle" font-size="12" fill="#fff" font-weight="700">kg</text>`),
    'heft.very': W(`<path d="M20 18h40l10 38H10z" fill="#455a64" stroke="#263238"/><path d="M30 18a10 10 0 0120 0" fill="none" stroke="#263238" stroke-width="4"/><text x="40" y="46" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">kg</text>`)
  };
  function streakPic(k) {
    if (k === 'none') return W(`<rect x="8" y="14" width="64" height="34" rx="3" fill="#fbfaf6" stroke="#bbb"/><path d="M18 34h20" stroke="#ddd" stroke-width="5" stroke-linecap="round"/><path d="M50 24l12 12M62 24L50 36" stroke="#999" stroke-width="2"/>`);
    const c = MI.SWATCH[k] || '#999';
    return W(`<rect x="8" y="14" width="64" height="34" rx="3" fill="#fbfaf6" stroke="#bbb"/><path d="M18 32c10-4 24 4 44-2" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none" opacity=".9"/>`);
  }
  function colorPic(k) {
    const c = MI.SWATCH[k] || '#999';
    const metal = ['gold', 'silver', 'copper', 'brass'].includes(k);
    return W(`<defs><linearGradient id="cp${k}" x1="0" x2="1"><stop offset="0" stop-color="${c}"/><stop offset=".5" stop-color="${metal ? '#fff' : c}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><path d="M14 46l6-18 16-8 20 4 10 14-6 12-30 4z" fill="url(#cp${k})" stroke="#555" ${k === 'colorless' ? 'fill-opacity=".5"' : ''}/>`);
  }
  function pic(test, opt) {
    if (test === 'streak') return streakPic(opt);
    if (test === 'color') return colorPic(opt);
    return PIC[test + '.' + opt] || '';
  }
  const ICON = {
    camera: '<svg viewBox="0 0 24 24" class="i"><path d="M4 7h3l2-3h6l2 3h3a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="13" r="4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    tests: '<svg viewBox="0 0 24 24" class="i"><path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    book: '<svg viewBox="0 0 24 24" class="i"><path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4zM20 4h-5a3 3 0 00-3 3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    box: '<svg viewBox="0 0 24 24" class="i"><path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    quiz: '<svg viewBox="0 0 24 24" class="i"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9a2.5 2.5 0 015 0c0 2-2.5 2-2.5 4M12 17h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    map: '<svg viewBox="0 0 24 24" class="i"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    gear: '<svg viewBox="0 0 24 24" class="i"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2"/></svg>',
    back: '<svg viewBox="0 0 24 24" class="i"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    warn: '<svg viewBox="0 0 24 24" class="i"><path d="M12 3l10 18H2z" fill="#c62828"/><path d="M12 10v5M12 18h.01" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
    pin: '<svg viewBox="0 0 24 24" class="i"><path d="M12 22s7-7 7-12a7 7 0 00-14 0c0 5 7 12 7 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24" class="i"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    ruler: '<svg viewBox="0 0 24 24" class="i"><path d="M3 15L15 3l6 6L9 21z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 11l2 2M10 8l2 2M13 5l2 2" stroke="currentColor" stroke-width="2"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" class="i"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 15l6 6M10 7v6M7 10h6" stroke="currentColor" stroke-width="2"/></svg>'
  };
  MI.ART = { crystal, pic, ICON };
})();
