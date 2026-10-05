require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/errorHandler')

const app = express()

// Security
app.use(helmet())
app.use(cors({
  origin: function (origin, callback) {
    const allowed = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim())
    if (!origin || allowed.includes(origin) || process.env.NODE_ENV === 'development') return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }))

// Parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Health
app.get('/health', (req, res) => res.json({ success: true, message: 'BEAUTIQ API is running', version: '1.0.0', timestamp: new Date().toISOString() }))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/products', require('./routes/products'))
app.use('/api/brands', require('./routes/brands'))
app.use('/api/categories', require('./routes/categories'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api', require('./routes/misc'))

// 404
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found`, error: 'NOT_FOUND' }))

// Error handler
app.use(errorHandler)

module.exports = app
