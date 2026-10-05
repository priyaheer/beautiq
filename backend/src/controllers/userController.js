const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/response')
const User = require('../models/User')
const { cloudinary } = require('../config/cloudinary')

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body
  const update = { name: name?.trim(), phone: phone || '' }
  if (req.file) { if (req.user.avatarPublicId) await cloudinary.uploader.destroy(req.user.avatarPublicId).catch(() => {}); update.avatar = req.file.path; update.avatarPublicId = req.file.filename }
  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true })
  ok(res, { user: user.toSafeObject() }, 'Profile updated')
})

exports.removeAvatar = asyncHandler(async (req, res) => {
  if (req.user.avatarPublicId) await cloudinary.uploader.destroy(req.user.avatarPublicId).catch(() => {})
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: null, avatarPublicId: null }, { new: true })
  ok(res, { user: user.toSafeObject() }, 'Avatar removed')
})

exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist')
  ok(res, { wishlist: user.wishlist })
})

exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: productId } })
  ok(res, null, 'Added to wishlist')
})

exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params
  await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: productId } })
  ok(res, null, 'Removed from wishlist')
})

exports.getAddresses = asyncHandler(async (req, res) => {
  ok(res, { addresses: req.user.addresses })
})

exports.addAddress = asyncHandler(async (req, res) => {
  const a = req.body
  const user = await User.findById(req.user._id)
  if (!user.addresses.length) a.isDefault = true
  if (a.isDefault) user.addresses.forEach(x => { x.isDefault = false })
  user.addresses.push(a); await user.save()
  ok(res, { addresses: user.addresses }, 'Address added')
})

exports.updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const idx = user.addresses.findIndex(x => x._id.toString() === req.params.id)
  if (idx < 0) return res.status(404).json({ success: false, message: 'Address not found' })
  if (req.body.isDefault) user.addresses.forEach(x => { x.isDefault = false })
  Object.assign(user.addresses[idx], req.body); await user.save()
  ok(res, { addresses: user.addresses }, 'Address updated')
})

exports.deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const wasDefault = user.addresses.find(x => x._id.toString() === req.params.id)?.isDefault
  user.addresses = user.addresses.filter(x => x._id.toString() !== req.params.id)
  if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true
  await user.save(); ok(res, { addresses: user.addresses }, 'Address deleted')
})

exports.setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  user.addresses.forEach(x => { x.isDefault = x._id.toString() === req.params.id }); await user.save()
  ok(res, { addresses: user.addresses }, 'Default address updated')
})

// ---- Admin ----
exports.listUsers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 50 } = req.query
  const filter = {}; if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }]
  const [users, total] = await Promise.all([User.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(+limit), User.countDocuments(filter)])
  ok(res, { users: users.map(u => u.toSafeObject()), total })
})

exports.setUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  ok(res, { user: user.toSafeObject() }, 'Status updated')
})
