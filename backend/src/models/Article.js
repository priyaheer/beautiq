const mongoose = require('mongoose')
const contentBlockSchema = new mongoose.Schema({ type: { type: String }, text: String, hue: Number, caption: String, title: String, items: [String] }, { _id: false })
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subtitle: String,
  excerpt: String,
  content: [contentBlockSchema],
  authorName: String,
  authorRole: String,
  authorHue: Number,
  category: { type: String, required: true },
  tags: [String],
  readTime: Number,
  hue: Number,
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  coverImage: String,
  status: { type: String, enum: ['draft','published'], default: 'published' },
  publishedAt: Date
}, { timestamps: true })
articleSchema.index({ category: 1 })
articleSchema.index({ status: 1, publishedAt: -1 })
articleSchema.index({ title: 'text', subtitle: 'text', tags: 'text' })
module.exports = mongoose.model('Article', articleSchema)
