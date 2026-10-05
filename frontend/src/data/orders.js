import { products } from './index'
import { users } from './users'
import { rng } from '../lib/format'

export const ORDER_STEPS = ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered']
export const ORDER_STATUSES = [...ORDER_STEPS, 'Cancelled']
export const PAYMENT_METHODS = ['Razorpay', 'UPI', 'Credit/Debit Card', 'Net Banking', 'Cash on Delivery']
export const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', days: [4, 6], price: 99, note: 'Free above ₹1,999' },
  { id: 'express', label: 'Express Delivery', days: [2, 3], price: 199, note: 'Priority courier' },
  { id: 'nextday', label: 'Next-day Delivery', days: [1, 1], price: 349, note: 'Delhi NCR, Mumbai, Bengaluru' }]

const R = rng(777), pick = a => a[Math.floor(R() * a.length)], day = 86400000, BASE = Date.UTC(2026, 8, 29)
const statusPlan = ['Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Cancelled', 'Delivered', 'Delivered', 'Out for Delivery', 'Shipped', 'Shipped', 'Processing', 'Processing', 'Confirmed', 'Confirmed', 'Cancelled', 'Out for Delivery', 'Delivered']
const customers = users.filter(u => u.role === 'customer' && u.addresses.length)
const stepGaps = [0, 0.4, 1, 3.2, 4.4] // days after order for each step

export const buildHistory = (status, placed) => {
  const t = new Date(placed).getTime()
  if (status === 'Cancelled') return [{ status: 'Confirmed', at: new Date(t).toISOString() }, { status: 'Cancelled', at: new Date(t + 0.8 * day).toISOString() }]
  return ORDER_STEPS.slice(0, ORDER_STEPS.indexOf(status) + 1).map((s, i) => ({ status: s, at: new Date(t + stepGaps[i] * day).toISOString() }))
}

export const orders = statusPlan.map((status, i) => {
  const u = customers[i % customers.length], a = u.addresses.find(x => x.isDefault) || u.addresses[0]
  const age = status === 'Delivered' ? 8 + Math.floor(R() * 150) : status === 'Cancelled' ? 3 + Math.floor(R() * 90) : { 'Out for Delivery': 4.6, Shipped: 3, Processing: 1.2, Confirmed: 0.3 }[status] + R() * 0.4
  const placed = new Date(BASE - age * day).toISOString()
  const lines = []; const n = 1 + Math.floor(R() * 3)
  while (lines.length < n) { const p = pick(products.filter(x => x.stock)); if (lines.some(l => l.productId === p.id)) continue
    lines.push({ productId: p.id, name: p.name, brand: p.brand, shade: p.shades.length ? pick(p.shades).name : null, qty: 1 + (R() < 0.25 ? 1 : 0), price: p.price, hue: p.hue }) }
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0), couponCode = R() < 0.3 ? 'BEAUTIQ10' : null, discount = couponCode ? Math.round(subtotal * 0.1) : 0
  const opt = R() < 0.75 ? DELIVERY_OPTIONS[0] : DELIVERY_OPTIONS[1], shipping = opt.id === 'standard' && subtotal - discount > 1999 ? 0 : opt.price
  const paymentMethod = pick(PAYMENT_METHODS), codFee = paymentMethod === 'Cash on Delivery' ? 40 : 0
  const est = new Date(new Date(placed).getTime() + opt.days[1] * day).toISOString()
  return { id: `BQ-${100245 + i * 37}`, userId: u.id, customerName: u.name, email: u.email, date: placed, items: lines, subtotal, discount, couponCode, shipping, codFee, total: subtotal - discount + shipping + codFee,
    paymentMethod, paymentStatus: paymentMethod === 'Cash on Delivery' ? (status === 'Delivered' ? 'Paid' : 'Pending') : status === 'Cancelled' ? 'Refunded' : 'Paid', address: a, delivery: { id: opt.id, label: opt.label, price: opt.price, days: opt.days },
    estimatedDelivery: est, status, history: buildHistory(status, placed) }
}).sort((a, b) => new Date(b.date) - new Date(a.date))
orders.forEach(o => { const u = users.find(x => x.id === o.userId); u.orders.push(o.id) })
