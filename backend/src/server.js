require('dotenv').config()
const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`✓ BEAUTIQ API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
    console.log(`  Health: http://localhost:${PORT}/health`)
  })
}

start().catch(err => { console.error('Fatal startup error:', err); process.exit(1) })
