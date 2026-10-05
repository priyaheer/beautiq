import { orders as seed, ORDER_STEPS, ORDER_STATUSES, DELIVERY_OPTIONS, buildHistory } from '../data/orders'
import { getProducts } from './productService'
import { table, wait } from './db'
import { evaluateCoupon } from './couponService'
import { usersTable } from './userService'
import { addDays } from '../lib/format'
export { ORDER_STEPS, ORDER_STATUSES, DELIVERY_OPTIONS }
const t = table('bq-orders-v1', seed)
const sortNew = l => [...l].sort((a, b) => new Date(b.date) - new Date(a.date))

export const estimateDelivery = (opt, from = new Date()) => ({ from: addDays(from, opt.days[0]), to: addDays(from, opt.days[1]) })
export function computeTotals({ items, couponCode, delivery, paymentMethod }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0), c = evaluateCoupon(couponCode, subtotal), discount = c.ok ? c.amount : 0
  const opt = DELIVERY_OPTIONS.find(d => d.id === delivery) || DELIVERY_OPTIONS[0]
  const shipping = !items.length ? 0 : opt.id === 'standard' && subtotal - discount > 1999 ? 0 : opt.price, codFee = paymentMethod === 'Cash on Delivery' ? 40 : 0
  return { subtotal, discount, shipping, codFee, couponOk: c.ok, couponReason: c.reason, total: subtotal - discount + shipping + codFee, option: opt } }
export const cartToItems = async cart => {
  const products = await getProducts()
  return cart.map(item => {
    const product = products.find(candidate => String(candidate.id) === String(item.id))
    return product && {
      productId: product.id,
      name: product.name,
      brand: product.brand,
      shade: item.shade,
      qty: item.qty,
      price: product.price,
      hue: product.hue,
      images: product.images,
      thumbnail: product.thumbnail
    }
  }).filter(Boolean)
}

// guest orders placed with the account's email are included so they show up after the customer signs up
export const getOrdersByUser = (uid, email) => wait(sortNew(t.all().filter(o => o.userId === uid || (email && o.email?.toLowerCase() === email.toLowerCase()))), 200)
export const getOrderById = id => wait(t.all().find(o => o.id === id) || null, 150)
export const createOrder = ({ user, email, items, address, deliveryId, paymentMethod, paymentStatus, couponCode }) => {
  const totals = computeTotals({ items, couponCode, delivery: deliveryId, paymentMethod }), now = new Date()
  const ids = t.all().map(o => +o.id.replace(/\D/g, '')), id = `BQ-${Math.max(100000, ...ids) + 13 + Math.floor(Math.random() * 40)}`
  const order = { id, userId: user?.id || 'guest', customerName: address.name, email, date: now.toISOString(), items, subtotal: totals.subtotal, discount: totals.discount, couponCode: totals.couponOk ? couponCode.toUpperCase() : null,
    shipping: totals.shipping, codFee: totals.codFee, total: totals.total, paymentMethod, paymentStatus, address, delivery: { id: totals.option.id, label: totals.option.label, price: totals.option.price, days: totals.option.days },
    estimatedDelivery: addDays(now, totals.option.days[1]).toISOString(), status: 'Confirmed', history: buildHistory('Confirmed', now.toISOString()) }
  t.save([order, ...t.all()])
  if (user) usersTable.save(usersTable.all().map(u => u.id === user.id ? { ...u, orders: [id, ...u.orders] } : u))
  return wait(order, 500) }
export const cancelOrder = id => { const o = t.all().find(x => x.id === id); if (!o || !['Confirmed', 'Processing'].includes(o.status)) return Promise.reject(new Error('This order can no longer be cancelled.'))
  return updateOrderStatus(id, 'Cancelled') }
export const updateOrderStatus = (id, status) => { let out = null
  t.save(t.all().map(o => o.id === id ? (out = { ...o, status, paymentStatus: status === 'Cancelled' && o.paymentStatus === 'Paid' ? 'Refunded' : status === 'Delivered' && o.paymentMethod === 'Cash on Delivery' ? 'Paid' : o.paymentStatus, history: [...o.history, { status, at: new Date().toISOString() }] }) : o)); return wait(out, 150) }
export const listAllOrders = () => wait(sortNew(t.all()), 150)
// steps for the tracking timeline: [{label, at, done, current}]
export const trackingSteps = o => { const idx = ORDER_STEPS.indexOf(o.status)
  if (o.status === 'Cancelled') return o.history.map((h, i, a) => ({ label: h.status, at: h.at, done: true, current: i === a.length - 1, cancelled: h.status === 'Cancelled' }))
  return ORDER_STEPS.map((label, i) => ({ label, at: [...o.history].reverse().find(h => h.status === label)?.at, done: i <= idx, current: i === idx })) }
