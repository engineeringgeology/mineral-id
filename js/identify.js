/* Identification engine: every answer gives each mineral a penalty (0 = fits). Scores → probabilities (softmax).
   The next test is chosen by expected information gain over the current top candidates. */
'use strict';
window.MI = window.MI || {};
(function () {
  const ALL = () => MI.MINERALS;

  // ---- test definitions: options + how well a mineral fits an option (0 = fits, negative = does not fit) ----
  const near = (a, b, groups) => groups.some(g => g.includes(a) && g.includes(b));
  const STREAK_NEAR = [['red', 'redbrown'], ['redbrown', 'brown'], ['brown', 'yellowbrown'], ['yellowbrown', 'yellow'], ['yellow', 'orange'], ['orange', 'red'],
    ['black', 'grey'], ['black', 'greenblack'], ['grey', 'greenblack'], ['white', 'grey'], ['green', 'blue'], ['green', 'greenblack']];
  const LUSTER_GROUPS = { metallic: ['metallic', 'submetallic'], glassy: ['vitreous'], brilliant: ['adamantine'], greasy: ['resinous', 'greasy', 'waxy'], pearly: ['pearly'], silky: ['silky'], dull: ['earthy'] };
  const LUSTER_NEAR = [['glassy', 'brilliant'], ['glassy', 'greasy'], ['greasy', 'brilliant'], ['pearly', 'glassy'], ['silky', 'pearly'], ['dull', 'greasy'], ['metallic', 'brilliant']];
  const HARD = { nail: [0, 2.5], coin: [2.5, 3.5], knife: [3.5, 5.5], glass: [5.5, 10] };
  const HEFT = { light: [0, 2.45], normal: [2.45, 3.3], heavy: [3.3, 5], very: [5, 25] };
  const rangeGap = (a, b) => Math.max(0, a[0] - b[1], b[0] - a[1]);
  const COLOR_MAP = { gold: ['gold', 'yellow', 'brass'], brass: ['brass', 'yellow', 'gold'], silver: ['silver', 'grey'], copper: ['copper', 'orange', 'brown', 'red'] };
  const colorKeys = m => { const s = new Set(); m.c.forEach(c => (COLOR_MAP[c] || [c]).forEach(x => s.add(x))); if (m.c.includes('colorless')) s.add('white'); if (m.c.includes('white')) s.add('colorless'); return s; };

  const TESTS = {
    luster: {
      opts: ['metallic', 'glassy', 'brilliant', 'greasy', 'pearly', 'silky', 'dull'],
      fit(m, a) {
        const mine = LUSTER_GROUPS[a]; if (m.lu.some(l => mine.includes(l))) return 0;
        const groups = Object.keys(LUSTER_GROUPS).filter(g => m.lu.some(l => LUSTER_GROUPS[g].includes(l)));
        if (a === 'metallic' || groups.includes('metallic')) return -4;
        return groups.some(g => near(a, g, LUSTER_NEAR)) ? -1 : -2.5;
      }
    },
    streak: {
      opts: ['white', 'grey', 'black', 'greenblack', 'red', 'redbrown', 'brown', 'yellowbrown', 'yellow', 'orange', 'green', 'blue', 'none'],
      fit(m, a) {
        if (a === 'none') return m.h[1] >= 6 ? 0 : -3; // harder than the streak plate: no streak / white powder
        if (m.st.includes(a)) return 0;
        return m.st.some(s => near(a, s, STREAK_NEAR)) ? -1.2 : -3.5;
      }
    },
    hardness: {
      opts: ['nail', 'coin', 'knife', 'glass'],
      fit(m, a) { const g = rangeGap(m.h, HARD[a]); return g === 0 ? 0 : -Math.min(5, 0.6 + 2 * g); }
    },
    magnet: {
      opts: ['strong', 'weak', 'none'],
      fit(m, a) {
        const v = { strong: 2, weak: 1, none: 0 }[a];
        if (m.mag.includes(v)) return 0;
        const mx = Math.max(...m.mag);
        if (v === 0) return mx === 2 ? -5 : -1;
        if (v === 1) return mx === 2 ? -1.2 : -2.5;
        return mx === 1 ? -1.5 : -5;
      }
    },
    hcl: {
      opts: ['strong', 'powder', 'none'],
      fit(m, a) {
        const v = { strong: 2, powder: 1, none: 0 }[a];
        if (m.hcl === v) return 0;
        if (m.hcl === 0) return -4;
        if (m.hcl === 2) return v === 1 ? -1 : -4;
        return v === 2 ? -1.5 : -0.8; // only powder reacts
      }
    },
    cleavage: {
      opts: ['none', '1', '2', '3cube', '3rhomb', '4', 'many'],
      fit(m, a) {
        if (m.cl.includes(a)) return 0;
        if (a === 'none') return -0.8; // cleavage is often not visible
        if (m.cl.includes('none')) return -2.5;
        if ((a === '3cube' && m.cl.includes('3rhomb')) || (a === '3rhomb' && m.cl.includes('3cube'))) return -1.2;
        return -2;
      }
    },
    heft: {
      opts: ['light', 'normal', 'heavy', 'very'],
      fit(m, a) { const g = rangeGap(m.d, HEFT[a]); return g === 0 ? 0 : -Math.min(4, 0.8 + 1.2 * g); }
    },
    color: {
      opts: ['colorless', 'white', 'grey', 'black', 'red', 'pink', 'orange', 'yellow', 'brown', 'green', 'blue', 'purple', 'gold', 'silver', 'copper'],
      fit(m, a) { const ks = colorKeys(m); if (ks.has(a) || (COLOR_MAP[a] || []).some(x => ks.has(x))) return 0; return -2.2; }
    }
  };
  const SPECIALS = ['elastic_sheets', 'flexible_sheets', 'greasy_feel', 'marks_paper', 'soluble', 'double_refraction', 'fluorescent', 'striations', 'striated_cubes', 'hex_prisms',
    'play_of_color', 'labradorescence', 'iridescent', 'fibrous', 'tv_effect', 'banded', 'botryoidal', 'conchoidal', 'cross_twins', 'smells_sulfur', 'garlic_smell', 'malleable', 'dendrites', 'floats_saltwater', 'red_flame', 'chatoyant'];

  // photo colours: [{k, w}] fractions; score = how much of the photo matches the mineral's colours
  function photoFit(m, pc) {
    if (!pc || !pc.length) return 0;
    // colours listed first are the main colours of the mineral
    const pos = k => { for (let i = 0; i < m.c.length; i++) { const c = m.c[i]; if (c === k || (COLOR_MAP[c] || []).includes(k) || (c === 'colorless' && k === 'white') || (c === 'white' && k === 'colorless')) return i; } return -1; };
    let s = 0;
    pc.forEach(({ k, w }) => { const i = pos(k); if (i >= 0) s += w * (i === 0 ? 1 : i === 1 ? 0.8 : 0.6); });
    return 3.6 * s - 1.8 + (m.c.length <= 2 && s > 0.5 ? 0.4 : 0);
  }

  function score(m, st) {
    let sc = Math.log(m.p) * 0.55 - (m.v ? 0.15 : 0);
    // photo: neural network (if available) + colour analysis. Minerals the network does not know get a neutral 1 %.
    if (st.model) sc += Math.log((st.model[m.id] != null ? st.model[m.id] : 0.01) + 0.02) * 1.1;
    if (st.photo) sc += photoFit(m, st.photo) * (st.model ? 0.45 : 1);
    for (const k in st.ans) { const a = st.ans[k]; if (a != null && TESTS[k]) sc += TESTS[k].fit(m, a); }
    (st.special || []).forEach(sp => { sc += m.sp.includes(sp) ? 2 : -0.6; });
    return sc;
  }

  function rank(st) {
    const L = ALL().map(m => ({ m, s: score(m, st) }));
    const mx = Math.max(...L.map(x => x.s));
    let tot = 0; L.forEach(x => { x.e = Math.exp(x.s - mx); tot += x.e; });
    L.forEach(x => { x.p = x.e / tot; });
    return L.sort((a, b) => b.p - a.p);
  }

  const ent = ps => { let h = 0; ps.forEach(p => { if (p > 1e-9) h -= p * Math.log(p); }); return h; };
  const ORDER = ['luster', 'streak', 'hardness', 'magnet', 'cleavage', 'heft', 'hcl', 'color'];
  // choose the most useful unanswered test (luster first: it is the easiest and splits metal / non-metal)
  function nextTest(st) {
    const left = ORDER.filter(t => st.ans[t] === undefined && !(t === 'color' && st.photo));
    if (!left.length) return null;
    if (left.includes('luster')) return 'luster';
    const top = rank(st).slice(0, 25); const tp = top.reduce((a, x) => a + x.p, 0);
    let best = null, bestGain = -1;
    left.forEach(t => {
      const T = TESTS[t];
      // likelihood of each answer for each mineral, normalised over the answers
      const lik = top.map(x => { const e = T.opts.map(o => Math.exp(T.fit(x.m, o))); const z = e.reduce((a, b) => a + b, 0); return e.map(v => v / z); });
      let exp = 0;
      T.opts.forEach((o, i) => {
        const w = top.map((x, j) => x.p / tp * lik[j][i]);
        const po = w.reduce((a, b) => a + b, 0); if (po <= 0) return;
        exp += po * ent(w.map(v => v / po));
      });
      const gain = ent(top.map(x => x.p / tp)) - exp;
      const ease = { hcl: 0.85, cleavage: 0.9, heft: 0.9 }[t] || 1;
      if (gain * ease > bestGain) { bestGain = gain * ease; best = t; }
    });
    return best;
  }

  // special properties worth asking about, from the current top candidates
  function specialsFor(st) {
    const top = rank(st).slice(0, 10); const c = {};
    top.forEach(x => x.m.sp.forEach(s => { if (SPECIALS.includes(s)) c[s] = (c[s] || 0) + x.p; }));
    return Object.keys(c).sort((a, b) => c[b] - c[a]).slice(0, 8);
  }

  // which property best separates two minerals (for look-alike tips and the quiz)
  function differences(a, b) {
    const out = [];
    const hg = rangeGap(a.h, b.h); if (hg > 0) out.push({ k: 'hardness', w: hg * 1.5 });
    const dg = rangeGap(a.d, b.d); if (dg > 0.3) out.push({ k: 'density', w: dg });
    if (!a.st.some(s => b.st.includes(s))) out.push({ k: 'streak', w: a.st.some(s => b.st.some(t => near(s, t, STREAK_NEAR))) ? 1.2 : 2.5 });
    if (Math.max(...a.mag) !== Math.max(...b.mag)) out.push({ k: 'magnet', w: Math.abs(Math.max(...a.mag) - Math.max(...b.mag)) * 1.6 });
    if (a.hcl !== b.hcl) out.push({ k: 'hcl', w: Math.abs(a.hcl - b.hcl) * 1.5 });
    if (!a.cl.some(c => b.cl.includes(c))) out.push({ k: 'cleavage', w: 1.3 });
    const metA = a.lu.includes('metallic'), metB = b.lu.includes('metallic'); if (metA !== metB) out.push({ k: 'luster', w: 2 });
    return out.sort((x, y) => y.w - x.w);
  }

  MI.ID = { TESTS, SPECIALS, rank, nextTest, specialsFor, differences, HARD, HEFT, ORDER, newState: () => ({ ans: {}, special: [], photo: null, model: null }) };
})();
