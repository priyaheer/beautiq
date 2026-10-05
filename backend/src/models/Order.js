const mongoose = require('mongoose')
const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productId: Number,
  name: String, brand: String, shade: String,
  qty: { type: Number, min: 1 },
  price: { type: Number, min: 0 },
  hue: Number
}, { _id: false })
const historySchema = new mongoose.Schema({ status: String, at: Date }, { _id: false })
const addressSnap = new mongoose.Schema({ label: String, name: String, phone: String, line1: String, line2: String, city: String, state: String, pincode: String, isDefault: Boolean }, { _id: false })
const deliverySnap = new mongoose.Schema({ id: String, label: String, price: Number, days: [Number] }, { _id: false })
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  email: { type: String, lowercase: true },
  items: [itemSchema],
  subtotal: Number, discount: Number, shipping: Number, codFee: { type: Number, default: 0 }, total: Number,
  couponCode: String,
  paymentMethod: String,
  paymentStatus: { type: String, enum: ['Pending','Paid','Refunded','Failed'], default: 'Pending' },
  razorpayOrderId: String, razorpayPaymentId: String, razorpaySignature: String,
  address: addressSnap, delivery: deliverySnap,
  estimatedDelivery: Date,
  status: { type: String, enum: ['Confirmed','Processing','Shipped','Out for Delivery','Delivered','Cancelled'], default: 'Confirmed' },
  history: [historySchema]
}, { timestamps: true })
orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ email: 1 })
orderSchema.pre('save', function (next) { if (!this.orderNumber) this.orderNumber = `BQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`; next() })
module.exports = mongoose.model('Order', orderSchema)
