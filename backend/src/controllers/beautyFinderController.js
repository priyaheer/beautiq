const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/response')
const { getRecommendations } = require('../services/beautyFinderService')

exports.recommend = asyncHandler(async (req, res) => {
  const results = await getRecommendations(req.body)
  ok(res, { results }, 'Recommendations generated')
})
