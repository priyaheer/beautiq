const { verify } = require('../utils/jwt')
const User = require('../models/User')
const asyncHandler = require('../utils/asyncHandler')

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.bq_token
  if (!token && req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.split(' ')[1]
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required', error: 'UNAUTHENTICATED' })
  const decoded = verify(token)
  const user = await User.findById(decoded.id).select('+password')
  if (!user || user.status === 'blocked') return res.status(401).json({ success: false, message: 'Account not found or suspended', error: 'UNAUTHENTICATED' })
  req.user = user; next()
})

const optionalAuth = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.bq_token
  if (!token && req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.split(' ')[1]
  if (token) { try { const decoded = verify(token); req.user = await User.findById(decoded.id) } catch {} }
  next()
})

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required', error: 'FORBIDDEN' })
  next()
}

module.exports = { protect, optionalAuth, requireAdmin }
