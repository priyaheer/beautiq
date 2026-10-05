const Product = require('../models/Product')

const getRecommendations = async ({ categories, skin, concerns, ingredients, hair, budget }) => {
  const filter = { isActive: true, stock: { $gt: 0 }, price: { $lte: (budget || 5000) * 1.3 } }
  if (categories?.length) filter.category = { $in: categories }
  const products = await Product.find(filter).lean()
  const wantsHair = categories?.includes('haircare') && hair?.length
  const results = products.map(p => {
    let score = 0; const why = []
    if (categories?.includes(p.category)) { score += 30; why.push(`A ${p.category} pick from your categories`) }
    if (p.category === 'haircare' && wantsHair) { const hm = (p.hairTypes || []).filter(h => hair.includes(h)); if (hm.length) { score += 25 + (hm.length > 1 ? 5 : 0); why.push(`Made for ${hm.join(' & ').toLowerCase()} hair`) } else score -= 20 }
    else { if (p.skinTypes?.includes(skin)) { score += 25; why.push(`Suited to ${(skin||'').toLowerCase()} skin`) } }
    const cn = (p.concerns || []).filter(c => (concerns || []).includes(c)); if (cn.length) { score += 25; why.push(`Targets ${cn.join(' & ').toLowerCase()}`) }
    const ig = (p.ingredients || []).filter(i => (ingredients || []).includes(i)); if (ig.length) { score += 10; why.push(`Contains ${ig[0]}`) }
    if (budget && p.price <= budget) { score += 10; why.push('Within your budget') }
    return { product: p, match: Math.max(0, Math.min(99, score + 5)), why }
  }).filter(r => r.match > 40).sort((a, b) => b.match - a.match).slice(0, 8)
  return results
}

module.exports = { getRecommendations }
