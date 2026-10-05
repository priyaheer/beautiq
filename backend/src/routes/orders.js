const router = require('express').Router()
const c = require('../controllers/orderController')
const { protect, optionalAuth, requireAdmin } = require('../middleware/auth')

router.get('/delivery-options', c.getDeliveryOptions)
router.post('/validate-coupon', optionalAuth, c.validateCoupon)
router.post('/razorpay/create', protect, c.createRazorpayOrder)
router.post('/', optionalAuth, c.placeOrder)
router.get('/my', protect, c.getMyOrders)
router.get('/my/:id', protect, c.getMyOrder)
router.post('/my/:id/cancel', protect, c.cancelOrder)

module.exports = router
