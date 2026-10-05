export const inr = n => `₹${Math.round(n).toLocaleString('en-IN')}`
export const fmtDate = (d, o = { day: 'numeric', month: 'short', year: 'numeric' }) => new Date(d).toLocaleDateString('en-IN', o)
export const fmtDateTime = d => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
export const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
export const initials = n => (n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase()
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const slug = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const slugify = slug
