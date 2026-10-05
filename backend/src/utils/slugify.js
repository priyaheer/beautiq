const s = require('slugify')
module.exports = (str) => s(str, { lower: true, strict: true, trim: true })
