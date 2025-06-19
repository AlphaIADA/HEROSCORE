class SimpleCache {
  constructor(ttl = 600000) {
    this.ttl = ttl; // time to live in ms
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    const [value, expiry] = entry;
    if (Date.now() > expiry) {
      this.store.delete(key);
      return null;
    }
    return value;
  }

  set(key, value) {
    const expiry = Date.now() + this.ttl;
    this.store.set(key, [value, expiry]);
  }
}

module.exports = SimpleCache;
