const { validationResult } = require('express-validator')
const validate = (validations) => async (req, res, next) => {
  for (const v of validations) await v.run(req)
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()
  return res.status(422).json({ success: false, message: errors.array()[0].msg, errors: errors.array(), error: 'VALIDATION_ERROR' })
}
module.exports = validate
