const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/response')
const Article = require('../models/Article')
const makeSlug = require('../utils/slugify')

exports.getArticles = asyncHandler(async (req, res) => {
  const { category, q, page = 1, limit = 20 } = req.query
  const filter = { status: 'published' }
  if (category && category !== 'All') filter.category = category
  if (q?.trim()) filter.$text = { $search: q.trim() }
  const [articles, total] = await Promise.all([Article.find(filter).sort({ publishedAt: -1 }).skip((page-1)*+limit).limit(+limit).select('-content'), Article.countDocuments(filter)])
  ok(res, { articles, total })
})

exports.getTrendingArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(5).select('-content')
  ok(res, { articles })
})

exports.getArticleBySlug = asyncHandler(async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug, status: 'published' })
  if (!article) return res.status(404).json({ success: false, message: 'Article not found' })
  const related = await Article.find({ status: 'published', slug: { $ne: req.params.slug }, category: article.category }).sort({ publishedAt: -1 }).limit(3).select('-content')
  ok(res, { article, related })
})

exports.createArticle = asyncHandler(async (req, res) => {
  const data = { ...req.body }; if (!data.slug) data.slug = makeSlug(data.title); if (req.file) data.coverImage = req.file.path
  if (!data.publishedAt && data.status === 'published') data.publishedAt = new Date()
  const article = await Article.create(data)
  res.status(201).json({ success: true, message: 'Article created', data: { article } })
})

exports.updateArticle = asyncHandler(async (req, res) => {
  const data = { ...req.body }; if (req.file) data.coverImage = req.file.path
  const article = await Article.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
  if (!article) return res.status(404).json({ success: false, message: 'Article not found' })
  ok(res, { article }, 'Article updated')
})

exports.deleteArticle = asyncHandler(async (req, res) => {
  await Article.findByIdAndDelete(req.params.id); ok(res, null, 'Article deleted')
})
