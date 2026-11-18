/* IndexedDB storage — everything stays on the phone */
'use strict';
window.MI = window.MI || {};
(function () {
  let dbp = null;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open('mineralid', 1);
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains('samples')) db.createObjectStore('samples', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'k' });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  function tx(store, mode, fn) {
    return open().then(db => new Promise((res, rej) => {
      const t = db.transaction(store, mode); const s = t.objectStore(store);
      let out; const r = fn(s);
      if (r) r.onsuccess = () => { out = r.result; };
      t.oncomplete = () => res(out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
    }));
  }
  const DB = {
    all: store => tx(store, 'readonly', s => s.getAll()),
    get: (store, key) => tx(store, 'readonly', s => s.get(key)),
    put: (store, val) => tx(store, 'readwrite', s => s.put(val)),
    del: (store, key) => tx(store, 'readwrite', s => s.delete(key)),
    async meta(k, v) {
      if (v === undefined) { const r = await DB.get('meta', k); return r ? r.v : undefined; }
      return DB.put('meta', { k, v });
    }
  };
  MI.DB = DB;
  MI.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
})();
