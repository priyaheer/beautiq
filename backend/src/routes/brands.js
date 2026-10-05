const router = require('express').Router()
const c = require('../controllers/brandController')
const { protect, requireAdmin } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

router.get('/', c.getBrands)
router.get('/:slug', c.getBrandBySlug)
router.post('/', protect, requireAdmin, upload.brand.single('image'), c.createBrand)
router.put('/:id', protect, requireAdmin, upload.brand.single('image'), c.updateBrand)
router.delete('/:id', protect, requireAdmin, c.deleteBrand)

module.exports = router
