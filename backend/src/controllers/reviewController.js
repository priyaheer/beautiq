const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/response')
const Review = require('../models/Review')
const Order = require('../models/Order')
const { recalcProductStats } = require('../services/productService')

exports.getProductReviews = asyncHandler(async (req, res) => {
  const { sort = 'helpful', rating, photosOnly, page = 1, limit = 10 } = req.query
  const filter = { product: req.params.productId, status: 'approved' }
  if (rating) filter.rating = +rating; if (photosOnly === 'true') filter.photos = { $not: { $size: 0 } }
  const sorts = { helpful: { helpful: -1 }, newest: { createdAt: -1 }, highest: { rating: -1 }, lowest: { rating: 1 } }
  const [reviews, total] = await Promise.all([Review.find(filter).sort(sorts[sort] || sorts.helpful).skip((page-1)*+limit).limit(+limit), Review.countDocuments(filter)])
  ok(res, { reviews, total, page: +page })
})

exports.addReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body, productId = req.params.productId
  const existing = await Review.findOne({ product: productId, user: req.user._id })
  if (existing) return res.status(409).json({ success: false, message: 'You have already reviewed this product', error: 'DUPLICATE' })
  const delivered = await Order.findOne({ user: req.user._id, status: 'Delivered', 'items.product': productId })
  const photos = req.files?.map(f => f.path) || []
  const review = await Review.create({ product: productId, user: req.user._id, userName: req.user.name, rating, title, comment, photos, verifiedPurchase: !!delivered, status: 'pending' })
  res.status(201).json({ success: true, message: 'Review submitted and awaiting moderation', data: { review } })
})

exports.toggleHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' })
  const userId = req.user._id; const alreadyVoted = review.helpfulBy.some(id => id.toString() === userId.toString())
  if (alreadyVoted) { review.helpful = Math.max(0, review.helpful - 1); review.helpfulBy.pull(userId) }
  else { review.helpful++; review.helpfulBy.push(userId) }
  await review.save(); ok(res, { helpful: review.helpful, voted: !alreadyVoted })
})

exports.listAdminReviews = asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query
  const filter = status !== 'all' ? { status } : {}
  const [reviews, total] = await Promise.all([Review.find(filter).populate('product', 'name').sort({ createdAt: -1 }).skip((page-1)*+limit).limit(+limit), Review.countDocuments(filter)])
  ok(res, { reviews: reviews.map(r => ({ ...r.toObject(), productName: r.product?.name || 'Deleted product' })), total })
})

exports.setReviewStatus = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' })
  await recalcProductStats(review.product); ok(res, { review }, 'Review status updated')
})

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id)
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' })
  await recalcProductStats(review.product); ok(res, null, 'Review deleted')
})
