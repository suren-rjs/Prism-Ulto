export const IS_CHROME = typeof chrome !== 'undefined' && !!chrome.runtime?.id;

export class StorageService {
  static getLocal(keys) {
    return new Promise(res => {
      if (IS_CHROME && chrome.storage) {
        chrome.storage.local.get(keys, res);
      } else {
        const out = {};
        (Array.isArray(keys) ? keys : [keys]).forEach(k => {
          try {
            const item = localStorage.getItem('tdL_' + k);
            out[k] = item ? JSON.parse(item) : null;
          } catch (e) {
            out[k] = null;
          }
        });
        res(out);
      }
    });
  }

  static setLocal(data) {
    return new Promise(res => {
      if (IS_CHROME && chrome.storage) {
        chrome.storage.local.set(data, res);
      } else {
        Object.entries(data).forEach(([k, v]) => {
          localStorage.setItem('tdL_' + k, JSON.stringify(v));
        });
        res();
      }
    });
  }
}
