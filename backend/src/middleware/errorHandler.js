const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500, message = err.message || 'Internal server error', error = err.code || 'SERVER_ERROR'
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid authentication token'; error = 'INVALID_TOKEN' }
  else if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Authentication token expired. Please sign in again.'; error = 'TOKEN_EXPIRED' }
  else if (err.name === 'ValidationError') { statusCode = 422; message = Object.values(err.errors).map(e => e.message).join(', '); error = 'VALIDATION_ERROR' }
  else if (err.code === 11000) { statusCode = 409; const field = Object.keys(err.keyValue || {})[0]; message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Value'} already exists`; error = 'DUPLICATE' }
  else if (err.name === 'CastError') { statusCode = 404; message = 'Resource not found'; error = 'NOT_FOUND' }
  if (process.env.NODE_ENV !== 'production') console.error('[ERROR]', err.stack || err.message)
  res.status(statusCode).json({ success: false, message, error })
}
module.exports = errorHandler
