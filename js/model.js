/* Photo recognition: a small neural network (EfficientNet-B0 + mineral classifier) that runs on the phone, offline.
   Trained on freely licensed photos from Wikimedia Commons (see model/credits.json). TensorFlow.js is loaded only when needed. */
'use strict';
window.MI = window.MI || {};
(function () {
  let ready = null, net = null, info = null, head = null;
  // half-precision weights (base64) → Float32Array
  function f16(b64) {
    const bin = atob(b64), n = bin.length >> 1, out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const h = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8);
      const s = h & 0x8000 ? -1 : 1, e = (h >> 10) & 31, f = h & 1023;
      out[i] = e === 0 ? s * f * 5.960464477539063e-8 : e === 31 ? (f ? NaN : s * Infinity) : s * Math.pow(2, e - 15) * (1 + f / 1024);
    }
    return out;
  }
  const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('load ' + src)); document.head.appendChild(s); });

  function load() {
    if (!ready) ready = (async () => {
      if (!window.tf) await loadScript('lib/tf.min.js');
      try { await tf.setBackend('webgl'); } catch (e) { await tf.setBackend('cpu'); }
      await tf.ready();
      info = await (await fetch('model/head.json')).json();
      head = info.layers.map(L => ({ W: tf.tensor2d(f16(L.W), L.shape), b: tf.tensor1d(L.b), act: L.act }));
      net = await tf.loadGraphModel('model/base/model.json');
      tf.tidy(() => net.predict(tf.zeros([1, 224, 224, 3]))); // warm-up
      return true;
    })().catch(e => { ready = null; throw e; });
    return ready;
  }

  // square crop of the centre (and a slightly wider crop), 224 px, average of normal + mirrored
  function crops(src) {
    const w = src.width, h = src.height, out = [];
    [1, 0.8].forEach(f => {
      const s = Math.min(w, h) * f, c = document.createElement('canvas'); c.width = c.height = 224;
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
      g.drawImage(src, (w - s) / 2, (h - s) / 2, s, s, 0, 0, 224, 224); out.push(c);
    });
    return out;
  }

  // returns { mineralId: probability } for the minerals the network knows
  async function predict(src) {
    await load();
    const cs = crops(src);
    const p = tf.tidy(() => {
      const x = tf.stack(cs.map(c => tf.browser.fromPixels(c).toFloat()));
      const both = tf.concat([x, tf.reverse(x, 2)]);
      let h = net.predict(both); // image features (1280 numbers per crop)
      head.forEach(L => { h = h.matMul(L.W).add(L.b); h = L.act === 'relu' ? h.relu() : h.softmax(); });
      return h.mean(0);
    });
    const v = await p.data(); p.dispose();
    const r = {}; info.labels.forEach((id, i) => { r[id] = v[i]; });
    return r;
  }

  MI.Model = { load, predict, get labels() { return info ? info.labels : null; }, get info() { return info; } };
})();
