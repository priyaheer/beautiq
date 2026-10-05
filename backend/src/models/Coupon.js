const mongoose = require('mongoose')
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent','flat'], required: true },
  value: { type: Number, required: true, min: 0 },
  minOrder: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  expiry: Date,
  usageLimit: Number,
  perUserLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  description: String,
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })
module.exports = mongoose.model('Coupon', couponSchema)
