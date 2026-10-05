const jwt = require('jsonwebtoken')
const sign = (payload, expiresIn) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d' })
const verify = (token) => jwt.verify(token, process.env.JWT_SECRET)
const sendToken = (res, user, statusCode = 200, message = 'Success') => {
  const token = sign({ id: user._id, role: user.role })
  const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000 }
  res.cookie('bq_token', token, cookieOpts).status(statusCode).json({ success: true, message, token, data: { user: user.toSafeObject ? user.toSafeObject() : user } })
}
module.exports = { sign, verify, sendToken }
