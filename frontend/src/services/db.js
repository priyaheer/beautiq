// Tiny persistence helper. Every mock "table" lives in localStorage so admin/account/checkout changes survive reloads.
// When the Express + MongoDB API exists, services replace these calls with HTTP requests; pages stay unchanged.
export const wait = (v, ms = 150) => new Promise(r => setTimeout(() => r(structuredClone(v)), ms))
export const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v) } catch { return d } }
export const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* quota */ } return v }
export function table(key, seed) {
  let rows = read(key, null)
  if (!rows) { rows = structuredClone(seed); write(key, rows) }
  return { all: () => rows, save: next => { rows = next; write(key, rows); return rows }, reset: () => { rows = structuredClone(seed); write(key, rows) } }
}
export const PRODUCTS_KEY = 'bq-products-v1'
