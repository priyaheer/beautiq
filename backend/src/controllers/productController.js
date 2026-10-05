const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/response')
const Product = require('../models/Product')
const { getProducts, getReviewSummary } = require('../services/productService')
const { cloudinary } = require('../config/cloudinary')
const makeSlug = require('../utils/slugify')

exports.getProducts = asyncHandler(async (req, res) => {
  const result = await getProducts(req.query)
  ok(res, result, 'Products fetched')
})

exports.getProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id).lean()
  if (!p || !p.isActive) return res.status(404).json({ success: false, message: 'Product not found', error: 'NOT_FOUND' })
  ok(res, { product: p })
})

exports.getProductBySlug = asyncHandler(async (req, res) => {
  const p = await Product.findOne({ slug: req.params.slug, isActive: true }).lean()
  if (!p) return res.status(404).json({ success: false, message: 'Product not found', error: 'NOT_FOUND' })
  ok(res, { product: p })
})

exports.getProductReviewSummary = asyncHandler(async (req, res) => {
  const summary = await getReviewSummary(req.params.id)
  if (!summary) return res.status(404).json({ success: false, message: 'Product not found' })
  ok(res, { summary })
})

exports.createProduct = asyncHandler(async (req, res) => {
  const data = req.body
  if (!data.slug) data.slug = makeSlug(data.name)
  if (req.files?.length) data.images = req.files.map(f => f.path); if (!data.thumbnail && data.images?.length) data.thumbnail = data.images[0]
  if (data.price && data.discount) data.originalPrice = Math.round(+data.price / (1 - +data.discount / 100))
  const product = await Product.create(data)
  res.status(201).json({ success: true, message: 'Product created', data: { product } })
})

exports.updateProduct = asyncHandler(async (req, res) => {
  const data = req.body
  if (req.files?.length) data.images = req.files.map(f => f.path); if (!data.thumbnail && data.images?.length) data.thumbnail = data.images[0]
  if (data.price && data.discount) data.originalPrice = Math.round(+data.price / (1 - +data.discount / 100))
  const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
  ok(res, { product }, 'Product updated')
})

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
  ok(res, null, 'Product deleted')
})

exports.searchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query; if (!q?.trim()) return ok(res, { products: [], brands: [], categories: [] })
  const products = await Product.find({ $text: { $search: q }, isActive: true }).sort({ score: { $meta: 'textScore' } }).limit(5).select('name brand category price hue images thumbnail')
  const brands = await Product.distinct('brand', { brand: { $regex: q, $options: 'i' }, isActive: true })
  ok(res, { products, brands: brands.slice(0, 4).map(b => ({ name: b, slug: makeSlug(b) })), total: products.length })
})
