const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  purpose: { type: String, enum: ['verify','reset'], required: true },
  hashedCode: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false }
}, { timestamps: true })
otpSchema.index({ email: 1, purpose: 1 })
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
otpSchema.methods.verifyCode = function (plain) { return bcrypt.compare(plain, this.hashedCode) }
module.exports = mongoose.model('OTP', otpSchema)
