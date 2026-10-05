const router = require('express').Router()
const c = require('../controllers/userController')
const { protect } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

router.use(protect)
router.put('/profile', upload.avatar.single('avatar'), c.updateProfile)
router.delete('/avatar', c.removeAvatar)
router.get('/wishlist', c.getWishlist)
router.post('/wishlist/:productId', c.addToWishlist)
router.delete('/wishlist/:productId', c.removeFromWishlist)
router.get('/addresses', c.getAddresses)
router.post('/addresses', c.addAddress)
router.put('/addresses/:id', c.updateAddress)
router.delete('/addresses/:id', c.deleteAddress)
router.patch('/addresses/:id/default', c.setDefaultAddress)

module.exports = router
