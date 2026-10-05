const bcrypt = require('bcryptjs')
const OTP = require('../models/OTP')
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000))
const createOtp = async (email, purpose) => {
  await OTP.deleteMany({ email: email.toLowerCase(), purpose })
  const code = generateOtp(), hashedCode = await bcrypt.hash(code, 10)
  await OTP.create({ email: email.toLowerCase(), purpose, hashedCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000) })
  return code
}
const verifyOtp = async (email, purpose, code) => {
  const record = await OTP.findOne({ email: email.toLowerCase(), purpose, used: false, expiresAt: { $gt: new Date() } }).select('+hashedCode')
  if (!record) return { ok: false, reason: 'No active code. Please request a new one.', code: 'NO_OTP' }
  if (record.attempts >= 5) return { ok: false, reason: 'Too many attempts. Please request a new code.', code: 'LOCKED' }
  const match = await record.verifyCode(code)
  if (!match) { record.attempts++; await record.save(); return { ok: false, reason: `Incorrect code. ${5 - record.attempts} attempt(s) left.`, code: 'BAD_OTP' } }
  record.used = true; await record.save(); return { ok: true }
}
module.exports = { createOtp, verifyOtp }
