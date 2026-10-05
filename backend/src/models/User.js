const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home', enum: ['Home','Office','Other'] },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true })

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 6, select: false },
  phone: { type: String, default: '' },
  avatar: { type: String, default: null },
  avatarPublicId: { type: String, select: false },
  role: { type: String, enum: ['customer','admin'], default: 'customer' },
  status: { type: String, enum: ['active','blocked'], default: 'active' },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String, select: false },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [addressSchema],
  passwordChangedAt: Date,
  hue: { type: Number, default: 20 }
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12); next()
})
userSchema.methods.comparePassword = function (plain) { return bcrypt.compare(plain, this.password) }
userSchema.methods.toSafeObject = function () {
  const o = this.toObject(); delete o.password; delete o.googleId; delete o.avatarPublicId; delete o.__v; return o
}

module.exports = mongoose.model('User', userSchema)
