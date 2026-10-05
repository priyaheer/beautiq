const router = require('express').Router()
const c = require('../controllers/productController')
const rc = require('../controllers/reviewController')
const { protect, requireAdmin, optionalAuth } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

router.get('/', c.getProducts)
router.get('/search/suggestions', c.searchSuggestions)
router.get('/slug/:slug', c.getProductBySlug)
router.get('/:id', c.getProduct)
router.get('/:productId/reviews', rc.getProductReviews)
router.get('/:id/review-summary', c.getProductReviewSummary)
router.post('/:productId/reviews', protect, upload.review.array('photos', 5), rc.addReview)
router.post('/:reviewId/reviews/helpful', protect, rc.toggleHelpful)

// admin
router.post('/', protect, requireAdmin, upload.product.array('images', 8), c.createProduct)
router.put('/:id', protect, requireAdmin, upload.product.array('images', 8), c.updateProduct)
router.delete('/:id', protect, requireAdmin, c.deleteProduct)

module.exports = router
