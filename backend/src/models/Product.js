const mongoose = require('mongoose')
const shadeSchema = new mongoose.Schema({ name: String, hex: String }, { _id: false })
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  brand: { type: String, required: true, trim: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  category: { type: String, required: true, enum: ['makeup','skincare','haircare','fragrance'], lowercase: true },
  subcategory: { type: String, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 90 },
  images: [String],
  thumbnail: String,
  shades: [shadeSchema],
  size: [String],
  ingredients: [String],
  benefits: [String],
  skinTypes: [String],
  concerns: [String],
  hairTypes: [String],
  howToUse: String,
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  bestseller: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  hue: { type: Number, default: 20 }
}, { timestamps: true })
productSchema.index({ category: 1, subcategory: 1 })
productSchema.index({ brand: 1 })
productSchema.index({ price: 1 })
productSchema.index({ rating: -1 })
productSchema.index({ name: 'text', brand: 'text', description: 'text', concerns: 'text', ingredients: 'text' })
productSchema.virtual('inStock').get(function () { return this.stock > 0 })
productSchema.set('toJSON', { virtuals: true })
module.exports = mongoose.model('Product', productSchema)
