/* Licence: Payhip key is checked once online (through the small licence server), then the app works offline.
   The server returns a token signed with ECDSA P-256; the app checks the signature with the public key below. */
'use strict';
window.MI = window.MI || {};

(function () {
  // Filled in when the licence server is deployed (see server/README.md)
  const LICENSE_API = 'https://corelog-license.geologyfans.workers.dev';
  const PUBLIC_JWK = { kty: 'EC', crv: 'P-256', x: 'U30rOp6dBy40NovXfSu0JbC4OKHH1VdhvdOHSf3SlWs', y: 'UukT2dyJGsJWK-EM6Oigx-czC3mJbB7jUwJFPPBohss' };
  const APP = 'mineral';
  const DEMO = { ident: 5, samples: 5 }; // free version: 5 identifications, 5 collection samples, no export
  const BUY_URL = 'https://payhip.com/b/spVnY'; // Payhip product link, filled in when the product is created

  const b64u = { dec: s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0)) };

  async function deviceId() {
    let id = await MI.DB.meta('device');
    if (!id) { id = (crypto.randomUUID ? crypto.randomUUID() : MI.uid() + MI.uid()); await MI.DB.meta('device', id); }
    return id;
  }

  async function verifyToken(token, dev) {
    try {
      const [p, s] = token.split('.');
      const key = await crypto.subtle.importKey('jwk', PUBLIC_JWK, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64u.dec(s), new TextEncoder().encode(p));
      if (!ok) return null;
      const payload = JSON.parse(new TextDecoder().decode(b64u.dec(p)));
      if (payload.dev !== dev) return null;
      if (payload.app !== APP && payload.product !== APP) return null; // a Mineral ID key must not unlock this app
      return payload;
    } catch (e) { return null; }
  }

  let state = { licensed: false, demo: true, name: '', email: '', key: '' };

  async function load() {
    const lic = await MI.DB.meta('license');
    const dev = await deviceId();
    state = { licensed: false, demo: true, name: '', email: '', key: '' };
    if (lic && lic.token) {
      const p = await verifyToken(lic.token, dev);
      if (p) state = { licensed: true, demo: false, name: p.name || p.email, email: p.email, key: p.key, seats: p.seats, product: p.product };
    }
    return state;
  }

  async function activate(key, name) {
    key = key.trim().toUpperCase();
    if (!/^[A-Z0-9]{5}(-[A-Z0-9]{5}){3}$/.test(key)) throw new Error('The licence key should look like XXXXX-XXXXX-XXXXX-XXXXX (from your Payhip receipt email).');
    if (!LICENSE_API) throw new Error('Online activation is not switched on in this test version yet. You can use the demo mode for now.');
    if (!navigator.onLine) throw new Error('Activation needs the internet once. Connect to Wi-Fi or mobile data and try again.');
    const dev = await deviceId();
    const r = await fetch(LICENSE_API + '/activate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ app: APP, license_key: key, device_id: dev, name: name || '' }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.token) throw new Error(j.error || 'Activation failed. Please check the key.');
    const p = await verifyToken(j.token, dev);
    if (!p) throw new Error('Activation answer could not be verified.');
    await MI.DB.meta('license', { token: j.token });
    return load();
  }

  async function deactivate() {
    const lic = await MI.DB.meta('license');
    if (LICENSE_API && lic && state.key) {
      try { await fetch(LICENSE_API + '/deactivate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ app: APP, license_key: state.key, device_id: await deviceId() }) }); } catch (e) { }
    }
    await MI.DB.meta('license', null);
    state = { licensed: false, demo: true, name: '', email: '', key: '' };
  }

  MI.License = { load, activate, deactivate, get state() { return state; }, DEMO, BUY_URL, get online() { return !!LICENSE_API; } };
})();
