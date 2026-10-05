const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET })
const makeStorage = (folder) => new CloudinaryStorage({ cloudinary, params: { folder: `beautiq/${folder}`, allowed_formats: ['jpg','jpeg','png','webp'], transformation: [{ quality: 'auto', fetch_format: 'auto' }] } })
exports.upload = { product: multer({ storage: makeStorage('products'), limits: { fileSize: 5e6 } }), avatar: multer({ storage: makeStorage('avatars'), limits: { fileSize: 2e6 } }), article: multer({ storage: makeStorage('articles'), limits: { fileSize: 5e6 } }), review: multer({ storage: makeStorage('reviews'), limits: { fileSize: 3e6 } }), brand: multer({ storage: makeStorage('brands'), limits: { fileSize: 2e6 } }) }
exports.cloudinary = cloudinary
