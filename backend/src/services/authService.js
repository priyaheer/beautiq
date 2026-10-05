const User = require('../models/User')
const { createOtp, verifyOtp: checkOtp } = require('../utils/otp')
const { sendMail, otpEmail } = require('../config/mailer')
const { OAuth2Client } = require('google-auth-library')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const register = async ({ name, email, password }) => {
  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) { const e = new Error('An account with this email already exists.'); e.code = 'EXISTS'; e.statusCode = 409; throw e }
  const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password, role: 'customer' })
  await sendOtpEmail(user, 'verify')
  return user
}

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
  if (!user || !user.password) { const e = new Error('Email or password is incorrect.'); e.code = 'BAD_CREDENTIALS'; e.statusCode = 401; throw e }
  const ok = await user.comparePassword(password)
  if (!ok) { const e = new Error('Email or password is incorrect.'); e.code = 'BAD_CREDENTIALS'; e.statusCode = 401; throw e }
  if (user.status === 'blocked') { const e = new Error('This account has been suspended.'); e.code = 'BLOCKED'; e.statusCode = 403; throw e }
  if (!user.isVerified) { const e = new Error('Please verify your email to continue.'); e.code = 'UNVERIFIED'; e.statusCode = 403; throw e }
  return user
}

const googleLogin = async (idToken) => {
  const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
  const { sub: googleId, email, name, picture } = ticket.getPayload()
  let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] }).select('+googleId')
  if (!user) user = await User.create({ name, email: email.toLowerCase(), googleId, avatar: picture, isVerified: true, role: 'customer' })
  else if (!user.googleId) { user.googleId = googleId; if (!user.avatar && picture) user.avatar = picture; user.isVerified = true; await user.save() }
  if (user.status === 'blocked') { const e = new Error('This account has been suspended.'); e.code = 'BLOCKED'; e.statusCode = 403; throw e }
  return user
}

const sendOtpEmail = async (user, purpose) => {
  const code = await createOtp(user.email, purpose)
  const { subject, html, text } = otpEmail(user.name, code, purpose)
  await sendMail({ to: user.email, subject, html, text })
  return { ttl: 60 }
}

const verifyEmailOtp = async (email, code) => {
  const result = await checkOtp(email, 'verify', code)
  if (!result.ok) { const e = new Error(result.reason); e.code = result.code; e.statusCode = 400; throw e }
  const user = await User.findOneAndUpdate({ email: email.toLowerCase() }, { isVerified: true }, { new: true })
  if (!user) { const e = new Error('Account not found'); e.statusCode = 404; throw e }
  return user
}

const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) { const e = new Error("We couldn't find an account with that email."); e.code = 'NOT_FOUND'; e.statusCode = 404; throw e }
  return sendOtpEmail(user, 'reset')
}

const verifyResetOtp = async (email, code) => {
  const result = await checkOtp(email, 'reset', code)
  if (!result.ok) { const e = new Error(result.reason); e.code = result.code; e.statusCode = 400; throw e }
  return true
}

const resetPassword = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) { const e = new Error('Account not found'); e.statusCode = 404; throw e }
  user.password = password; user.passwordChangedAt = new Date(); await user.save(); return true
}

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password')
  if (!user || !user.password) { const e = new Error('Your current password is incorrect'); e.statusCode = 400; throw e }
  const ok = await user.comparePassword(currentPassword)
  if (!ok) { const e = new Error('Your current password is incorrect'); e.statusCode = 400; throw e }
  user.password = newPassword; user.passwordChangedAt = new Date(); await user.save(); return true
}

module.exports = { register, login, googleLogin, sendOtpEmail, verifyEmailOtp, requestPasswordReset, verifyResetOtp, resetPassword, changePassword }
