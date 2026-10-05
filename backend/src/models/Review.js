const mongoose = require('mongoose')
const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 2000 },
  helpful: { type: Number, default: 0 },
  helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  photos: [String], photoPublicIds: [{ type: String, select: false }],
  verifiedPurchase: { type: Boolean, default: false },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' }
}, { timestamps: true })
reviewSchema.index({ product: 1, status: 1 })
reviewSchema.index({ user: 1 })
reviewSchema.index({ product: 1, user: 1 }, { unique: true })
module.exports = mongoose.model('Review', reviewSchema)
