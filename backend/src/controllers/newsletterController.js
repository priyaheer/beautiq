const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/response')
const Newsletter = require('../models/Newsletter')

exports.subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body, e = email.trim().toLowerCase()
  const existing = await Newsletter.findOne({ email: e })
  if (existing) { const err = new Error('This email is already on the list.'); err.code = 'DUPLICATE'; err.statusCode = 409; throw err }
  await Newsletter.create({ email: e })
  ok(res, { email: e }, 'You\'re on the list! Welcome to BEAUTIQ.')
})
