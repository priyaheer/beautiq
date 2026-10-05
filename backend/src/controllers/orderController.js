const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/response')
const Order = require('../models/Order')
const { getRazorpay } = require('../config/razorpay')
const crypto = require('crypto')
const { createOrder, computeTotals, DELIVERY_OPTIONS } = require('../services/orderService')

exports.getDeliveryOptions = asyncHandler(async (req, res) => ok(res, { options: DELIVERY_OPTIONS }))

exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body
  const { evaluateCoupon } = require('../services/couponService')
  const result = await evaluateCoupon(code, +subtotal, req.user?._id)
  ok(res, result, result.ok ? `${code.toUpperCase()} applied` : result.reason)
})

exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body
  if (!amount || amount < 100) return res.status(400).json({ success: false, message: 'Invalid amount' })
  const rzp = getRazorpay()
  const order = await rzp.orders.create({ amount: Math.round(amount * 100), currency: 'INR', receipt: `bq_${Date.now()}` })
  ok(res, { razorpayOrderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID })
})

exports.placeOrder = asyncHandler(async (req, res) => {
  const { items, address, deliveryId, paymentMethod, couponCode, email, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body
  if (paymentMethod === 'Razorpay' && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex')
    if (expectedSig !== razorpaySignature) return res.status(400).json({ success: false, message: 'Payment verification failed', error: 'PAYMENT_FAILED' })
  }
  const paymentStatus = paymentMethod === 'Cash on Delivery' ? 'Pending' : (razorpayPaymentId ? 'Paid' : 'Pending')
  const order = await createOrder({ user: req.user || null, email: req.user?.email || email, rawItems: items, address, deliveryId, paymentMethod, paymentStatus, couponCode, razorpayOrderId })
  res.status(201).json({ success: true, message: 'Order placed successfully', data: { order } })
})

exports.getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query
  const filter = { $or: [{ user: req.user._id }, { email: req.user.email }] }
  if (status && status !== 'all') filter.status = status
  const [orders, total] = await Promise.all([Order.find(filter).sort({ createdAt: -1 }).skip((page-1)*+limit).limit(+limit), Order.countDocuments(filter)])
  ok(res, { orders, total })
})

exports.getMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, $or: [{ user: req.user._id }, { email: req.user.email }] })
  if (!order) return res.status(404).json({ success: false, message: 'Order not found', error: 'NOT_FOUND' })
  ok(res, { order })
})

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, $or: [{ user: req.user._id }, { email: req.user.email }] })
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
  if (!['Confirmed', 'Processing'].includes(order.status)) return res.status(400).json({ success: false, message: 'This order can no longer be cancelled.' })
  order.status = 'Cancelled'; if (order.paymentStatus === 'Paid') order.paymentStatus = 'Refunded'
  order.history.push({ status: 'Cancelled', at: new Date() }); await order.save()
  ok(res, { order }, 'Order cancelled')
})

exports.listAdminOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query
  const filter = {}; if (status && status !== 'all') filter.status = status
  const [orders, total] = await Promise.all([Order.find(filter).sort({ createdAt: -1 }).skip((page-1)*+limit).limit(+limit), Order.countDocuments(filter)])
  ok(res, { orders, total })
})

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
  order.status = req.body.status; if (req.body.status === 'Cancelled' && order.paymentStatus === 'Paid') order.paymentStatus = 'Refunded'
  if (req.body.status === 'Delivered' && order.paymentMethod === 'Cash on Delivery') order.paymentStatus = 'Paid'
  order.history.push({ status: req.body.status, at: new Date() }); await order.save()
  ok(res, { order }, 'Order status updated')
})
