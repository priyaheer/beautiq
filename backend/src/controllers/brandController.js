const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/response')
const Brand = require('../models/Brand')
const Product = require('../models/Product')
const makeSlug = require('../utils/slugify')

exports.getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 })
  const withCount = await Promise.all(brands.map(async b => ({ ...b.toObject(), count: await Product.countDocuments({ brand: b.name, isActive: true }) })))
  ok(res, { brands: withCount })
})

exports.getBrandBySlug = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug, isActive: true })
  if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' })
  const products = await Product.find({ brand: brand.name, isActive: true }).lean()
  ok(res, { brand: { ...brand.toObject(), products } })
})

exports.createBrand = asyncHandler(async (req, res) => {
  const { name, description } = req.body
  const slug = makeSlug(name), image = req.file?.path, imagePublicId = req.file?.filename
  const brand = await Brand.create({ name: name.trim(), slug, description, ...(image && { image, imagePublicId }) })
  res.status(201).json({ success: true, message: 'Brand created', data: { brand } })
})

exports.updateBrand = asyncHandler(async (req, res) => {
  const update = { ...req.body }; if (req.file) { update.image = req.file.path; update.imagePublicId = req.file.filename }
  const brand = await Brand.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
  if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' })
  ok(res, { brand }, 'Brand updated')
})

exports.deleteBrand = asyncHandler(async (req, res) => {
  const n = await Product.countDocuments({ brand: (await Brand.findById(req.params.id))?.name })
  if (n) return res.status(400).json({ success: false, message: `This brand has ${n} products. Move or delete them first.` })
  await Brand.findByIdAndUpdate(req.params.id, { isActive: false })
  ok(res, null, 'Brand deleted')
})

exports.listAdminBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find().sort({ name: 1 })
  const withCount = await Promise.all(brands.map(async b => ({ ...b.toObject(), products: await Product.countDocuments({ brand: b.name, isActive: true }) })))
  ok(res, { brands: withCount })
})
