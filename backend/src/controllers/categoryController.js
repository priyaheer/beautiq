const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/response')
const Category = require('../models/Category')
const Product = require('../models/Product')
const makeSlug = require('../utils/slugify')

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 })
  ok(res, { categories })
})

exports.getCategoryBySlug = asyncHandler(async (req, res) => {
  const cat = await Category.findOne({ slug: req.params.slug, isActive: true })
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' })
  ok(res, { category: cat })
})

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, tagline, hue, subcategories } = req.body
  const slug = makeSlug(name)
  const category = await Category.create({ name: name.trim(), slug, tagline, hue: hue || 20, subcategories: subcategories || [] })
  res.status(201).json({ success: true, message: 'Category created', data: { category } })
})

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' })
  ok(res, { category }, 'Category updated')
})

exports.deleteCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id)
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' })
  const n = await Product.countDocuments({ category: cat.slug })
  if (n) return res.status(400).json({ success: false, message: `${cat.name} has ${n} products. Move or delete them first.` })
  await Category.findByIdAndUpdate(req.params.id, { isActive: false })
  ok(res, null, 'Category deleted')
})

exports.listAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 })
  const withCount = await Promise.all(categories.map(async c => ({ ...c.toObject(), products: await Product.countDocuments({ category: c.slug }) })))
  ok(res, { categories: withCount })
})
