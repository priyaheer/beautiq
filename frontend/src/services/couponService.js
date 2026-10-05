import { table, wait } from './db'
import { uid } from '../lib/format'
const seed = [
  { id: 'cp1', code: 'BEAUTIQ10', type: 'percent', value: 10, minOrder: 0, expiry: '2027-12-31', active: true, description: '10% off your order', used: 128 },
  { id: 'cp2', code: 'WELCOME15', type: 'percent', value: 15, minOrder: 999, expiry: '2027-06-30', active: true, description: '15% off for new customers', used: 64 },
  { id: 'cp3', code: 'FLAT200', type: 'flat', value: 200, minOrder: 1500, expiry: '2026-12-31', active: true, description: '₹200 off orders above ₹1,500', used: 41 },
  { id: 'cp4', code: 'FESTIVE25', type: 'percent', value: 25, minOrder: 3000, expiry: '2026-06-30', active: false, description: 'Festive season offer', used: 212 }]
const t = table('bq-coupons-v1', seed)
// Pure, synchronous preview used for live totals. The backend must re-validate on order creation.
export function evaluateCoupon(code, subtotal) {
  if (!code) return { ok: false, amount: 0 }
  const c = t.all().find(x => x.code === code.trim().toUpperCase())
  if (!c) return { ok: false, amount: 0, reason: 'Invalid coupon code' }
  if (!c.active) return { ok: false, amount: 0, reason: 'This coupon is no longer active' }
  if (c.expiry && new Date(c.expiry + 'T23:59:59') < new Date()) return { ok: false, amount: 0, reason: 'This coupon has expired' }
  if (subtotal < c.minOrder) return { ok: false, amount: 0, reason: `Add items worth ₹${c.minOrder.toLocaleString('en-IN')} or more to use ${c.code}` }
  return { ok: true, coupon: c, amount: Math.min(subtotal, c.type === 'percent' ? Math.round(subtotal * c.value / 100) : c.value) }
}
export const validateCoupon = (code, subtotal = Infinity) => wait(evaluateCoupon(code, subtotal))
export const listCoupons = () => wait(t.all())
export const saveCoupon = c => { const rows = t.all(); const row = { ...c, code: c.code.trim().toUpperCase(), value: +c.value, minOrder: +c.minOrder || 0 }
  if (rows.some(x => x.code === row.code && x.id !== row.id)) return Promise.reject(new Error('A coupon with this code already exists'))
  t.save(row.id ? rows.map(x => x.id === row.id ? { ...x, ...row } : x) : [{ ...row, id: uid('cp'), used: 0 }, ...rows]); return wait(row) }
export const deleteCoupon = id => { t.save(t.all().filter(x => x.id !== id)); return wait(true) }
