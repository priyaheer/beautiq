const router = require('express').Router()
const c = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { body } = require('express-validator')
const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many requests, please try again later.', error: 'RATE_LIMITED' } })

router.post('/register', authLimiter, validate([body('name').trim().notEmpty().withMessage('Name is required'), body('email').isEmail().withMessage('Valid email required').normalizeEmail(), body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')]), c.register)
router.post('/login', authLimiter, validate([body('email').isEmail().normalizeEmail(), body('password').notEmpty()]), c.login)
router.post('/google', authLimiter, c.googleLogin)
router.post('/logout', c.logout)
router.get('/me', protect, c.getMe)
router.post('/send-otp', authLimiter, validate([body('email').isEmail().normalizeEmail(), body('purpose').isIn(['verify','reset'])]), c.sendOtp)
router.post('/verify-email', authLimiter, validate([body('email').isEmail().normalizeEmail(), body('code').isLength({ min: 6, max: 6 })]), c.verifyEmail)
router.post('/forgot-password', authLimiter, validate([body('email').isEmail().normalizeEmail()]), c.forgotPassword)
router.post('/verify-reset-otp', authLimiter, validate([body('email').isEmail().normalizeEmail(), body('code').isLength({ min: 6, max: 6 })]), c.verifyResetOtp)
router.post('/reset-password', authLimiter, validate([body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 })]), c.resetPassword)
router.post('/change-password', protect, validate([body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 })]), c.changePassword)

module.exports = router
