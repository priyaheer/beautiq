const asyncHandler = require('../utils/asyncHandler')
const { sendToken } = require('../utils/jwt')
const { ok, fail } = require('../utils/response')
const authService = require('../services/authService')

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  const user = await authService.register({ name, email, password })
  res.status(201).json({ success: true, message: 'Account created. Check your email for a verification code.', data: { email: user.email, name: user.name } })
})

exports.login = asyncHandler(async (req, res) => {
  const { email, password, remember } = req.body
  const user = await authService.login({ email, password })
  sendToken(res, user, 200, 'Logged in successfully')
})

exports.googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body
  if (!idToken) return fail(res, 'Google ID token is required', 400)
  const user = await authService.googleLogin(idToken)
  sendToken(res, user, 200, 'Google login successful')
})

exports.logout = asyncHandler(async (req, res) => {
  res.cookie('bq_token', '', { httpOnly: true, expires: new Date(0), secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' })
  ok(res, null, 'Logged out successfully')
})

exports.getMe = asyncHandler(async (req, res) => {
  ok(res, { user: req.user.toSafeObject() })
})

exports.sendOtp = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body
  const User = require('../models/User')
  let user = await User.findOne({ email: email.toLowerCase() })
  if (!user && purpose === 'verify') user = req.user
  if (!user) return fail(res, "We couldn't find an account with that email.", 404, 'NOT_FOUND')
  const result = await authService.sendOtpEmail(user, purpose)
  ok(res, { ttl: result.ttl }, 'Verification code sent to your email')
})

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body
  const user = await authService.verifyEmailOtp(email, code)
  sendToken(res, user, 200, 'Email verified successfully')
})

exports.forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(req.body.email)
  ok(res, { ttl: result.ttl }, 'Password reset code sent to your email')
})

exports.verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body
  await authService.verifyResetOtp(email, code)
  ok(res, null, 'Code verified. You may now reset your password.')
})

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  await authService.resetPassword(email, password)
  ok(res, null, 'Password updated. Please sign in with your new password.')
})

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  await authService.changePassword(req.user._id, currentPassword, newPassword)
  ok(res, null, 'Password changed successfully')
})
