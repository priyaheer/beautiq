const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/response')
const Coupon = require('../models/Coupon')

exports.listCoupons = asyncHandler(async (req, res) => ok(res, { coupons: await Coupon.find().sort({ createdAt: -1 }) }))

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, code: req.body.code.trim().toUpperCase() })
  res.status(201).json({ success: true, message: 'Coupon created', data: { coupon } })
})

exports.updateCoupon = asyncHandler(async (req, res) => {
  if (req.body.code) req.body.code = req.body.code.trim().toUpperCase()
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' })
  ok(res, { coupon }, 'Coupon updated')
})

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id)
  ok(res, null, 'Coupon deleted')
})
