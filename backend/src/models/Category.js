const mongoose = require('mongoose')
const subSchema = new mongoose.Schema({ name: String, match: [String] }, { _id: false })
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  tagline: { type: String, default: '' },
  hue: { type: Number, default: 20 },
  subcategories: [subSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true })
module.exports = mongoose.model('Category', categorySchema)
