const router = require('express').Router()
const { recommend } = require('../controllers/beautyFinderController')
const { subscribe } = require('../controllers/newsletterController')
const { getArticles, getTrendingArticles, getArticleBySlug } = require('../controllers/articleController')
const { optionalAuth } = require('../middleware/auth')

router.post('/beauty-finder/recommend', recommend)
router.post('/newsletter/subscribe', subscribe)
router.get('/articles', getArticles)
router.get('/articles/trending', getTrendingArticles)
router.get('/articles/:slug', getArticleBySlug)

module.exports = router
