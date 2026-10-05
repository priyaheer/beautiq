const Product = require('../models/Product')
const Review = require('../models/Review')

const buildQuery = (q) => {
  const filter = { isActive: true }
  if (q.search) filter.$text = { $search: q.search }
  if (q.category) filter.category = q.category
  if (q.subcategory) filter.subcategory = { $in: Array.isArray(q.subcategory) ? q.subcategory : [q.subcategory] }
  if (q.brand) filter.brand = { $in: Array.isArray(q.brand) ? q.brand : [q.brand] }
  if (q.minPrice || q.maxPrice) filter.price = {}
  if (q.minPrice) filter.price.$gte = +q.minPrice
  if (q.maxPrice) filter.price.$lte = +q.maxPrice
  if (q.rating) filter.rating = { $gte: +q.rating }
  if (q.discount) filter.discount = { $gte: +q.discount }
  if (q.skinType) filter.skinTypes = { $in: Array.isArray(q.skinType) ? q.skinType : [q.skinType] }
  if (q.concern) filter.concerns = { $in: Array.isArray(q.concern) ? q.concern : [q.concern] }
  if (q.hairType) filter.hairTypes = { $in: Array.isArray(q.hairType) ? q.hairType : [q.hairType] }
  if (q.inStock === 'true') filter.stock = { $gt: 0 }
  if (q.bestseller === 'true') filter.bestseller = true
  if (q.newArrival === 'true') filter.newArrival = true
  if (q.trending === 'true') filter.trending = true
  return filter
}

const buildSort = (sort) => {
  const sorts = { price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { rating: -1 }, discount: { discount: -1 }, newest: { createdAt: -1 }, reviews: { reviewCount: -1 } }
  return sorts[sort] || { createdAt: -1 }
}

const getProducts = async (queryParams) => {
  const page = Math.max(1, +queryParams.page || 1), limit = Math.min(100, +queryParams.limit || 20)
  const filter = buildQuery(queryParams), sort = buildSort(queryParams.sort)
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter)
  ])
  return { products, pagination: { total, page, totalPages: Math.ceil(total / limit), limit } }
}

const recalcProductStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, status: 'approved' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ])
  const { avg = 0, count = 0 } = stats[0] || {}
  await Product.findByIdAndUpdate(productId, { rating: Math.round(avg * 10) / 10, reviewCount: count })
}

const getReviewSummary = async (productId) => {
  const product = await Product.findById(productId).lean()
  if (!product) return null
  const breakdown = await Review.aggregate([
    { $match: { product: product._id, status: 'approved' } },
    { $group: { _id: '$rating', count: { $sum: 1 } } }
  ])
  const total = product.reviewCount || 0
  const byStars = {}; breakdown.forEach(b => { byStars[b._id] = b.count })
  const dist = [5,4,3,2,1].map(star => ({ star, count: byStars[star] || 0, pct: total ? ((byStars[star] || 0) / total) * 100 : 0 }))
  return { average: product.rating, total, breakdown: dist }
}

module.exports = { getProducts, recalcProductStats, getReviewSummary }
