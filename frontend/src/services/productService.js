import { slug } from '../lib/format'
import { read, write, wait } from './db'
import { categories } from '../data/categories'
import { evaluateCoupon } from './couponService'

export const slugify = value => slug(value)
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')
const CATEGORY_PATHS = ['makeup', 'skincare', 'haircare', 'fragrance']
const categoryPath = value => CATEGORY_PATHS.includes(value) ? `/${value}` : `/category/${value}`
const subPath = (category, subcategory) => `${categoryPath(category)}?sub=${encodeURIComponent(subcategory)}`
let productsCache
let productsRequest
export const PRODUCT_CATALOG_CHANGED = 'beautiq:product-catalog-changed'

const invalidateProducts = () => {
  productsCache = null
  window.dispatchEvent(new Event(PRODUCT_CATALOG_CHANGED))
}

const normalizeProduct = product => ({
  ...product,
  id: product._id || product.id,
  images: Array.isArray(product.images) ? product.images : [],
  thumbnail: product.thumbnail || '',
  reviews: product.reviewCount ?? product.reviews ?? 0
})

async function apiRequest(path) {
  const response = await fetch(`${API_BASE}${path}`)
  const body = await response.json()
  if (!response.ok || body.success === false) {
    throw new Error(body.message || `Product API request failed (${response.status})`)
  }
  return body.data
}

export async function getProducts() {
  if (productsCache) return productsCache
  if (productsRequest) return productsRequest

  productsRequest = (async () => {
    const first = await apiRequest('/products?page=1&limit=100')
    const list = first.products || []
    const pages = first.pagination?.totalPages || 1
    for (let page = 2; page <= pages; page += 1) {
      const result = await apiRequest(`/products?page=${page}&limit=100`)
      list.push(...(result.products || []))
    }
    productsCache = list.map(normalizeProduct)
    return productsCache
  })()

  try {
    return await productsRequest
  } finally {
    productsRequest = null
  }
}

export async function getProductsByIds(ids = []) {
  const requested = new Set(ids.map(String))
  if (!requested.size) return []
  return (await getProducts()).filter(product => requested.has(String(product.id)))
}

export async function getProductById(id) {
  if (!id) {
    const error = new Error('Invalid product ID')
    error.code = 'INVALID_ID'
    throw error
  }
  try {
    const result = await apiRequest(`/products/${encodeURIComponent(id)}`)
    return result.product ? normalizeProduct(result.product) : null
  } catch (error) {
    if (error.message.includes('(404)') || error.message === 'Product not found') return null
    throw error
  }
}

const hay = product => [
  product.name,
  product.brand,
  product.category,
  product.subcategory,
  ...(product.concerns || []),
  ...(product.ingredients || [])
].join(' ').toLowerCase()

export async function searchProducts(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  return (await getProducts()).filter(product => terms.every(term => hay(product).includes(term)))
}

export const validateCoupon = (code, subtotal) => wait(evaluateCoupon(code, subtotal))

export async function getSuggestions(query) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return { products: [], brands: [], categories: [] }

  const catalog = await getProducts()
  const score = product => {
    const name = product.name.toLowerCase(), brand = product.brand.toLowerCase()
    return terms.reduce((sum, term) => sum + (name.startsWith(term) ? 4 : name.includes(term) ? 3 : brand.includes(term) ? 2 : 1), 0) + product.rating / 10
  }
  const matchedProducts = catalog.filter(product => terms.every(term => hay(product).includes(term))).sort((a, b) => score(b) - score(a))
  const brands = [...new Set(catalog.map(product => product.brand))]
    .filter(name => terms.every(term => name.toLowerCase().includes(term)))
    .slice(0, 4)
    .map(name => ({ name, slug: slug(name) }))
  const categoryOptions = categories
    .flatMap(category => [{ label: category.name, to: categoryPath(category.slug), hint: 'Category' }, ...category.subcategories.map(subcategory => ({ label: subcategory.name, to: subPath(category.slug, subcategory.name), hint: category.name }))])
    .filter(category => terms.every(term => `${category.label} ${category.hint}`.toLowerCase().includes(term)))
    .slice(0, 4)
  return { products: matchedProducts.slice(0, 5), total: matchedProducts.length, brands, categories: categoryOptions }
}

export const adminListProducts = getProducts
export const saveProduct = async product => {
  const token = read('bq-token', '')
  const { id, _id, ...body } = product
  const response = await fetch(`${API_BASE}/products${id ? `/${encodeURIComponent(id)}` : ''}`, {
    method: id ? 'PUT' : 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const result = await response.json()
  if (!response.ok || result.success === false) throw new Error(result.message || 'Could not save product')
  invalidateProducts()
  return normalizeProduct(result.data.product)
}

export async function deleteProduct(id) {
  const token = read('bq-token', '')
  const response = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  const result = await response.json()
  if (!response.ok || result.success === false) throw new Error(result.message || 'Could not delete product')
  invalidateProducts()
  return true
}

export async function getRecommendations(answers) {
  const hair = answers.hair || [], wantsHair = answers.categories.includes('haircare') && hair.length
  const list = (await getProducts()).map(product => {
    let score = 0
    const why = []
    if (answers.categories.includes(product.category)) { score += 30; why.push(`A ${product.category} pick from your categories`) }
    if (product.category === 'haircare' && wantsHair) {
      const matches = (product.hairTypes || []).filter(type => hair.includes(type))
      if (matches.length) { score += 25 + (matches.length > 1 ? 5 : 0); why.push(`Made for ${matches.join(' & ').toLowerCase()} hair`) } else score -= 20
    } else {
      const matches = (product.skinTypes || []).filter(type => type === answers.skin)
      if (matches.length) { score += 25; why.push(`Suited to ${answers.skin.toLowerCase()} skin`) }
    }
    const concerns = (product.concerns || []).filter(concern => answers.concerns.includes(concern))
    if (concerns.length) { score += 25; why.push(`Targets ${concerns.join(' & ').toLowerCase()}`) }
    const ingredients = (product.ingredients || []).filter(ingredient => answers.ingredients.includes(ingredient))
    if (ingredients.length) { score += 10; why.push(`Contains ${ingredients[0]}`) }
    if (product.price <= answers.budget) { score += 10; why.push('Within your budget') }
    return { p: product, match: Math.max(0, Math.min(99, score + 5)), why }
  }).filter(result => result.match > 40 && result.p.stock && result.p.price <= answers.budget * 1.3)
    .sort((a, b) => b.match - a.match)
    .slice(0, 8)
  return list
}

export const subscribeNewsletter = async email => {
  await wait(null, 700)
  const list = read('bq-newsletter', []), normalized = email.trim().toLowerCase()
  if (list.includes(normalized)) { const error = new Error('This email is already on the list.'); error.code = 'DUPLICATE'; throw error }
  if (/@(fail|error)\.test$/.test(normalized)) throw new Error('We could not reach the server. Please try again.')
  write('bq-newsletter', [...list, normalized])
  return { ok: true, email: normalized }
}

export async function getMenuProducts(category) {
  const inCategory = (await getProducts()).filter(product => product.category === category && product.stock)
  const counts = new Map()
  inCategory.forEach(product => counts.set(product.brand, (counts.get(product.brand) || 0) + 1))
  return {
    popular: [...inCategory].sort((a, b) => b.reviews - a.reviews).slice(0, 3),
    trending: inCategory.filter(product => product.trending || product.newArrival).slice(0, 3),
    brands: [...counts].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name]) => ({ name, slug: slug(name) }))
  }
}
