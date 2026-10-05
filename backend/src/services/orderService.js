const Order = require('../models/Order')
const Product = require('../models/Product')
const { evaluateCoupon, markCouponUsed } = require('./couponService')

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', days: [4, 6], price: 99 },
  { id: 'express', label: 'Express Delivery', days: [2, 3], price: 199 },
  { id: 'nextday', label: 'Next-day Delivery', days: [1, 1], price: 349 }
]

const computeTotals = async ({ items, couponCode, deliveryId, paymentMethod, userId }) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const couponResult = await evaluateCoupon(couponCode, subtotal, userId)
  const discount = couponResult.ok ? couponResult.amount : 0
  const opt = DELIVERY_OPTIONS.find(d => d.id === deliveryId) || DELIVERY_OPTIONS[0]
  const shipping = !items.length ? 0 : opt.id === 'standard' && subtotal - discount > 1999 ? 0 : opt.price
  const codFee = paymentMethod === 'Cash on Delivery' ? 40 : 0
  return { subtotal, discount, shipping, codFee, couponOk: couponResult.ok, couponReason: couponResult.reason, total: subtotal - discount + shipping + codFee, option: opt }
}

const validateCartItems = async (cartItems) => {
  const items = []
  for (const ci of cartItems) {
    const product = await Product.findById(ci.productId || ci.product)
    if (!product || !product.isActive) throw Object.assign(new Error(`${ci.name || 'A product'} is no longer available`), { statusCode: 400 })
    if (product.stock < ci.qty) throw Object.assign(new Error(`Only ${product.stock} unit(s) of ${product.name} left in stock`), { statusCode: 400 })
    items.push({ product: product._id, productId: product._id, name: product.name, brand: product.brand, shade: ci.shade || null, qty: ci.qty, price: product.price, hue: product.hue || 20 })
  }
  return items
}

const createOrder = async ({ user, email, rawItems, address, deliveryId, paymentMethod, paymentStatus, couponCode, razorpayOrderId }) => {
  const items = await validateCartItems(rawItems)
  const totals = await computeTotals({ items, couponCode, deliveryId, paymentMethod, userId: user?._id })
  const now = new Date(), deliveryDate = new Date(now); deliveryDate.setDate(deliveryDate.getDate() + totals.option.days[1])
  const order = await Order.create({
    user: user?._id, customerName: address.name, email: (user?.email || email).toLowerCase(),
    items, subtotal: totals.subtotal, discount: totals.discount, shipping: totals.shipping, codFee: totals.codFee, total: totals.total,
    couponCode: totals.couponOk ? couponCode?.toUpperCase() : null, paymentMethod, paymentStatus: paymentStatus || (paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Pending'),
    razorpayOrderId, address, delivery: { id: totals.option.id, label: totals.option.label, price: totals.option.price, days: totals.option.days },
    estimatedDelivery: deliveryDate, status: 'Confirmed', history: [{ status: 'Confirmed', at: now }]
  })
  for (const item of items) await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } })
  if (totals.couponOk && couponCode) await markCouponUsed(couponCode, user?._id)
  return order
}

module.exports = { DELIVERY_OPTIONS, computeTotals, createOrder }
