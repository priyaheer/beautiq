const router = require('express').Router()
const c = require('../controllers/categoryController')
const { protect, requireAdmin } = require('../middleware/auth')

router.get('/', c.getCategories)
router.get('/:slug', c.getCategoryBySlug)
router.post('/', protect, requireAdmin, c.createCategory)
router.put('/:id', protect, requireAdmin, c.updateCategory)
router.delete('/:id', protect, requireAdmin, c.deleteCategory)

module.exports = router
