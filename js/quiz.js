/* Quiz "Which mineral is this?" — questions are generated from the mineral data, so they work in every language */
'use strict';
window.MI = window.MI || {};
(function () {
  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const T = (s, o) => MI.I18N.T(s, o), N = id => MI.I18N.name(id), TM = (c, k) => MI.I18N.term(c, k);
  const hs = m => m.h[0] === m.h[1] ? String(m.h[0]) : m.h[0] + '–' + m.h[1];
  const pool = lvl => MI.MINERALS.filter(m => lvl === 'kid' ? m.kid : lvl === 'student' ? (m.p >= 2 || m.kid) : true);

  function opts(correct, others, n, label) {
    const list = shuffle([correct, ...shuffle(others).slice(0, n - 1)]);
    return { opts: list.map(label), ans: list.indexOf(correct) };
  }
  function distinct(arr, key, need) { const seen = new Set(); const out = []; shuffle(arr).forEach(x => { const k = key(x); if (!seen.has(k)) { seen.add(k); out.push(x); } }); return out.length >= need ? out : null; }

  const GEN = {
    // kids
    softest(P) { const c = distinct(P.filter(m => !m.v), m => Math.round(m.h[1]), 3); if (!c) return null; const s = c.slice(0, 3); const soft = s.reduce((a, b) => b.h[1] < a.h[1] ? b : a);
      return { q: T('Which of these minerals is the softest?'), ...opts(soft, s.filter(x => x !== soft), 3, m => ({ id: m.id, t: N(m.id) })), ex: s.map(m => N(m.id) + ' ' + hs(m)).join(' · '), show: s }; },
    harder(P) { const c = distinct(P.filter(m => !m.v), m => Math.round(m.h[1]), 2); if (!c) return null; const [a, b] = c; const h = a.h[1] > b.h[1] ? a : b;
      return { q: T('Which mineral is harder?'), ...opts(h, [h === a ? b : a], 2, m => ({ id: m.id, t: N(m.id) })), ex: [a, b].map(m => N(m.id) + ' ' + hs(m)).join(' · '), show: [a, b] }; },
    magnet(P) { const all = MI.MINERALS; const yes = all.filter(m => Math.max(...m.mag) === 2); const no = P.filter(m => Math.max(...m.mag) === 0);
      const c = pick(yes); return { q: T('Which mineral sticks to a magnet?'), ...opts(c, no, 3, m => ({ id: m.id, t: N(m.id) })), ex: T('Magnetite is strongly magnetic.') }; },
    fizz(P) { const yes = MI.MINERALS.filter(m => m.hcl === 2); const no = P.filter(m => m.hcl === 0);
      const c = pick(yes); return { q: T('Which mineral fizzes with acid (or bubbles in vinegar)?'), ...opts(c, no, 3, m => ({ id: m.id, t: N(m.id) })), ex: T('Carbonates such as calcite fizz because they release carbon dioxide.') }; },
    colour(P) { const m = pick(P.filter(x => x.c.length <= 2 && !['colorless', 'white', 'grey'].includes(x.c[0]))); if (!m) return null;
      const others = MI.VOC.colors.filter(c => !m.c.includes(c) && !['colorless', 'brass', 'copper', 'silver', 'gold'].includes(c));
      return { q: T('What colour is {m} usually?', { m: N(m.id) }), ...opts(m.c[0], others, 3, c => ({ c, t: TM('color', c) })), ex: N(m.id) + ': ' + m.c.map(c => TM('color', c)).join(', '), show: [m] }; },
    use(P) { const m = pick(P.filter(x => x.use.length)); const others = [...new Set(MI.MINERALS.flatMap(x => x.use))].filter(u => !m.use.includes(u));
      return { q: T('What is {m} used for?', { m: N(m.id) }), ...opts(m.use[0], others, 3, u => ({ t: TM('use', u) })), ex: N(m.id) + ': ' + m.use.map(u => TM('use', u)).join(', '), show: [m] }; },
    // students
    props(P) { const m = pick(P); const others = P.filter(x => x !== m && x.v !== m.id && m.v !== x.id && !(x.v && x.v === m.v) && MI.ID.differences(x, m).length);
      const q = T('Mohs {h}, streak {s}, luster {l}. Which mineral is it?', { h: hs(m), s: m.st.map(s => TM('streak', s)).join('/'), l: m.lu.map(l => TM('luster', l)).join(', ') });
      return { q, ...opts(m, distinct(others, x => x.id, 3) || others, 4, x => ({ id: x.id, t: N(x.id) })), ex: N(m.id) }; },
    streak(P) { const m = pick(P.filter(x => x.st.length === 1)); const others = MI.VOC.streak.filter(s => s !== m.st[0]);
      return { q: T('What is the streak colour of {m}?', { m: N(m.id) }), ...opts(m.st[0], others, 4, s => ({ c: s, t: TM('streak', s) })), ex: N(m.id) + ': ' + TM('streak', m.st[0]), show: [m] }; },
    formula(P) { const m = pick(P.filter(x => !x.v)); const others = P.filter(x => x.f !== m.f && !x.v);
      return { q: T('Which mineral has the formula {f}?', { f: MI.fmt(m.f) }), html: true, ...opts(m, others, 4, x => ({ id: x.id, t: N(x.id) })), ex: N(m.id) + ' = ' + MI.fmt(m.f) }; },
    hardness(P) { const m = pick(P.filter(x => x.h[0] === x.h[1] || x.h[1] - x.h[0] <= 1)); const val = Math.round((m.h[0] + m.h[1]) / 2);
      const others = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(v => Math.abs(v - val) >= 2);
      return { q: T('What is the Mohs hardness of {m}?', { m: N(m.id) }), ...opts(val, others, 4, v => ({ t: String(v) })), ex: N(m.id) + ': ' + hs(m), show: [m] }; },
    cleavage(P) { const m = pick(P.filter(x => x.cl.length === 1)); const others = MI.VOC.cleavage.filter(c => c !== m.cl[0]);
      return { q: T('What cleavage does {m} have?', { m: N(m.id) }), ...opts(m.cl[0], others, 4, c => ({ t: TM('cleavage', c) })), ex: N(m.id) + ': ' + TM('cleavage', m.cl[0]), show: [m] }; },
    // experts
    separate(P) { const m = pick(P.filter(x => x.lk.length)); const o = MI.BY[pick(m.lk)]; const d = MI.ID.differences(m, o); if (!d.length) return null;
      const best = d[0].k; const others = ['hardness', 'streak', 'magnet', 'hcl', 'cleavage', 'density', 'luster'].filter(k => !d.slice(0, 2).some(x => x.k === k));
      return { q: T('Which test best tells {a} from {b}?', { a: N(m.id), b: N(o.id) }), ...opts(best, others, 4, k => ({ t: TM('test', k) })), ex: MI.lookTip(m, o), show: [m, o] }; },
    system(P) { const m = pick(P.filter(x => x.sys !== 'amorph')); const others = MI.VOC.sys.filter(s => s !== m.sys && !(m.sys === 'hex' && s === 'trig') && !(m.sys === 'trig' && s === 'hex'));
      return { q: T('Which crystal system does {m} belong to?', { m: N(m.id) }), ...opts(m.sys, others, 4, s => ({ t: TM('sys', s) })), ex: N(m.id) + ': ' + TM('sys', m.sys), show: [m] }; },
    density(P) { const m = pick(P.filter(x => x.d[1] - x.d[0] < 0.5)); const v = (m.d[0] + m.d[1]) / 2; const fmt = n => n.toFixed(1).replace('.', MI.I18N.dec());
      const others = [1.1, 2.2, 2.7, 3.3, 4, 4.7, 5.2, 6.5, 7.5, 8.9, 10.5, 15].filter(x => Math.abs(x - v) > 0.6 * Math.max(1, v / 4));
      return { q: T('What is the density of {m} (g/cm³)?', { m: N(m.id) }), ...opts(v, others, 4, x => ({ t: fmt(x) })), ex: N(m.id) + ': ' + fmt(m.d[0]) + (m.d[1] !== m.d[0] ? '–' + fmt(m.d[1]) : '') + ' g/cm³' }; },
    cls(P) { const m = pick(P); const others = MI.VOC.cls.filter(c => c !== m.cls);
      return { q: T('Which mineral class does {m} belong to?', { m: N(m.id) }), ...opts(m.cls, others, 4, c => ({ t: TM('cls', c) })), ex: N(m.id) + ': ' + TM('cls', m.cls), show: [m] }; },
    where(P) { const m = pick(P.filter(x => x.oc.length <= 3)); const others = MI.VOC.occ.filter(o => !m.oc.includes(o));
      return { q: T('Where would you most likely find {m}?', { m: N(m.id) }), ...opts(m.oc[0], others, 4, o => ({ t: TM('occ', o) })), ex: N(m.id) + ': ' + m.oc.map(o => TM('occ', o)).join(', ') }; }
  };
  const LEVELS = {
    kid: ['softest', 'harder', 'magnet', 'fizz', 'colour', 'colour', 'use', 'harder'],
    student: ['props', 'props', 'streak', 'formula', 'hardness', 'cleavage', 'use', 'fizz'],
    expert: ['props', 'separate', 'separate', 'system', 'density', 'formula', 'cls', 'where', 'streak']
  };
  function round(lvl, n = 10) {
    const P = pool(lvl); const out = []; let guard = 0;
    while (out.length < n && guard++ < 200) {
      try { const g = GEN[pick(LEVELS[lvl])](P); if (g && g.opts.length >= 2 && !out.some(x => x.q === g.q)) out.push(g); } catch (e) { /* try another */ }
    }
    return out;
  }
  MI.Quiz = { round, LEVELS: Object.keys(LEVELS) };
})();
