const Coupon = require('../models/Coupon')

const evaluateCoupon = async (code, subtotal, userId) => {
  if (!code) return { ok: false, amount: 0 }
  const c = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true })
  if (!c) return { ok: false, amount: 0, reason: 'Invalid coupon code' }
  if (c.expiry && c.expiry < new Date()) return { ok: false, amount: 0, reason: 'This coupon has expired' }
  if (c.usageLimit && c.usedCount >= c.usageLimit) return { ok: false, amount: 0, reason: 'This coupon has reached its usage limit' }
  if (subtotal < c.minOrder) return { ok: false, amount: 0, reason: `Add items worth ₹${c.minOrder.toLocaleString('en-IN')} or more to use ${c.code}` }
  if (userId && c.perUserLimit) {
    const userUsed = c.usedBy.filter(id => id.toString() === userId.toString()).length
    if (userUsed >= c.perUserLimit) return { ok: false, amount: 0, reason: 'You have already used this coupon' }
  }
  let amount = c.type === 'percent' ? Math.round(subtotal * c.value / 100) : c.value
  if (c.maxDiscount) amount = Math.min(amount, c.maxDiscount)
  amount = Math.min(amount, subtotal)
  return { ok: true, coupon: c, amount }
}

const markCouponUsed = async (code, userId) => {
  if (!code) return
  await Coupon.findOneAndUpdate({ code: code.toUpperCase() }, { $inc: { usedCount: 1 }, ...(userId ? { $push: { usedBy: userId } } : {}) })
}

module.exports = { evaluateCoupon, markCouponUsed }
