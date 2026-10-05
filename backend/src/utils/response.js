const ok = (res, data, message = 'Success', statusCode = 200) => res.status(statusCode).json({ success: true, message, data })
const fail = (res, message, statusCode = 400, error = null) => res.status(statusCode).json({ success: false, message, ...(error ? { error } : {}) })
module.exports = { ok, fail }
