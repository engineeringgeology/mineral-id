/* Export: collection as PDF catalogue and Excel table; full backup (JSON with photos) */
'use strict';
window.MI = window.MI || {};
(function () {
  const T = (s, o) => MI.I18N.T(s, o), N = id => MI.I18N.name(id), TM = (c, k) => MI.I18N.term(c, k);
  const sub = s => String(s || '').replace(/(?<=[A-Za-z)\]])(\d+)/g, d => [...d].map(c => '₀₁₂₃₄₅₆₇₈₉'[c]).join(''));
  const stamp = () => new Date().toISOString().slice(0, 10);
  function save(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }
  const sName = s => s.mineral ? N(s.mineral) + (s.name ? ' — ' + s.name : '') : (s.name || T('Unknown mineral'));
  const coord = s => s.lat != null ? s.lat.toFixed(5) + ', ' + s.lon.toFixed(5) : '';
  const testsText = s => {
    const a = s.tests || {}; const out = [];
    for (const k of MI.ID.ORDER) if (a[k] != null) out.push(TM('test', k === 'heft' ? 'density' : k) + ': ' + TM('ans.' + k, a[k]));
    return out.join('; ');
  };

  async function pdf(samples) {
    const { jsPDF } = window.jspdf; const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.addFileToVFS('dv.ttf', MI.FONT.reg); doc.addFont('dv.ttf', 'DV', 'normal');
    doc.addFileToVFS('dvb.ttf', MI.FONT.bold); doc.addFont('dvb.ttf', 'DV', 'bold');
    const head = () => {
      doc.setFillColor(16, 36, 58); doc.rect(0, 0, 210, 18, 'F');
      doc.setTextColor(255); doc.setFont('DV', 'bold'); doc.setFontSize(13); doc.text(T('My mineral collection'), 12, 11.5);
      doc.setFont('DV', 'normal'); doc.setFontSize(8); doc.text('Mineral ID · Engineering Geology · ' + stamp(), 198, 11.5, { align: 'right' });
      doc.setTextColor(20);
    };
    head(); let y = 26; let page = 1;
    const foot = () => { doc.setFontSize(7.5); doc.setTextColor(120); doc.text(T('Page {n}', { n: page }), 198, 290, { align: 'right' }); doc.setTextColor(20); };
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i]; const m = s.mineral ? MI.BY[s.mineral] : null;
      const ph = await MI.DB.get('photos', s.id);
      const lines = [];
      if (m) lines.push(sub(m.f) + '   ·   ' + T('Mohs') + ' ' + (m.h[0] === m.h[1] ? m.h[0] : m.h[0] + '–' + m.h[1]));
      lines.push(T('Date') + ': ' + (s.date || ''));
      if (s.place) lines.push(T('Place') + ': ' + s.place);
      if (s.lat != null) lines.push('GPS: ' + coord(s) + (s.acc ? ' (±' + Math.round(s.acc) + ' m)' : ''));
      if (s.size) lines.push(T('Size') + ': ' + s.size + ' mm');
      const tt = testsText(s); if (tt) lines.push(T('Tests') + ': ' + tt);
      if (s.notes) lines.push(T('Notes') + ': ' + s.notes);
      doc.setFont('DV', 'normal'); doc.setFontSize(8.5);
      const wrapped = lines.flatMap(l => doc.splitTextToSize(l, ph ? 128 : 182));
      const h = Math.max(ph ? 46 : 0, 9 + wrapped.length * 4.2) + 6;
      if (y + h > 282) { foot(); doc.addPage(); page++; head(); y = 26; }
      doc.setDrawColor(216, 223, 231); doc.roundedRect(10, y - 4, 190, h - 2, 2, 2);
      let x0 = 14;
      if (ph) {
        try { const props = doc.getImageProperties(ph.thumb); const k = Math.min(52 / props.width, 42 / props.height); doc.addImage(ph.thumb, 'JPEG', 14, y, props.width * k, props.height * k); } catch (e) { }
        x0 = 70;
      }
      doc.setFont('DV', 'bold'); doc.setFontSize(11); doc.text((i + 1) + '. ' + sName(s), x0, y + 3);
      if (m && m.sf) { doc.setTextColor(198, 40, 40); doc.setFontSize(8); doc.text('! ' + TM('safety', m.sf.k), x0, y + 7.5); doc.setTextColor(20); }
      doc.setFont('DV', 'normal'); doc.setFontSize(8.5); doc.text(wrapped, x0, y + (m && m.sf ? 12 : 8.5));
      y += h;
    }
    foot();
    save(doc.output('blob'), 'mineral-collection-' + stamp() + '.pdf');
  }

  function xlsx(samples) {
    const rows = samples.map((s, i) => {
      const m = s.mineral ? MI.BY[s.mineral] : null;
      return { [T('No.')]: i + 1, [T('Mineral')]: sName(s), [T('Formula')]: m ? sub(m.f) : '', [T('Mohs')]: m ? (m.h[0] === m.h[1] ? m.h[0] : m.h[0] + '–' + m.h[1]) : '',
        [T('Date')]: s.date || '', [T('Place')]: s.place || '', [T('Latitude')]: s.lat ?? '', [T('Longitude')]: s.lon ?? '', [T('Size') + ' (mm)']: s.size || '',
        [T('Tests')]: testsText(s), [T('Notes')]: s.notes || '', [T('Safety')]: m && m.sf ? TM('safety', m.sf.k) : '' };
    });
    const ws = XLSX.utils.json_to_sheet(rows); ws['!cols'] = [6, 28, 18, 8, 12, 26, 11, 11, 10, 50, 40, 22].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, T('Collection').slice(0, 31));
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    save(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'mineral-collection-' + stamp() + '.xlsx');
  }

  async function backup() {
    const samples = await MI.DB.all('samples'); const photos = await MI.DB.all('photos');
    const data = { app: 'mineralid', v: 1, date: new Date().toISOString(), samples, photos };
    save(new Blob([JSON.stringify(data)], { type: 'application/json' }), 'mineral-id-backup-' + stamp() + '.json');
    await MI.DB.meta('lastBackup', Date.now());
  }
  async function restore(file) {
    const data = JSON.parse(await file.text());
    if (data.app !== 'mineralid') throw new Error('This is not a Mineral ID backup file.');
    let n = 0; for (const s of data.samples || []) { await MI.DB.put('samples', s); n++; }
    for (const p of data.photos || []) await MI.DB.put('photos', p);
    return n;
  }
  MI.Export = { pdf, xlsx, backup, restore, sub };
})();
