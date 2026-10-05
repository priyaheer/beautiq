import { reviews as seed, customerPhotos } from '../data/reviews'
import { products } from '../data'
import { table, wait, read, write } from './db'
import { uid } from '../lib/format'
const t = table('bq-reviews-v1', seed)
const HK = 'bq-helpful'

// Fit a J-shaped star distribution to the product's catalogue average so the breakdown, average and total all agree.
export function distribution(avg, total) {
  let lo = -6, hi = 12, w
  for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; w = [1, 2, 3, 4, 5].map(k => Math.exp(m * k)); const s = w.reduce((a, b) => a + b, 0); const mean = w.reduce((a, x, i) => a + x * (i + 1), 0) / s; mean < avg ? lo = m : hi = m }
  const s = w.reduce((a, b) => a + b, 0), raw = w.map(x => x / s * total), counts = raw.map(Math.floor)
  let rem = total - counts.reduce((a, b) => a + b, 0); raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rem-- > 0) counts[i]++ })
  return [5, 4, 3, 2, 1].map(star => ({ star, count: counts[star - 1], pct: total ? counts[star - 1] / total * 100 : 0 }))
}
export const getReviewSummary = productId => { const p = products.find(x => x.id === +productId); if (!p) return wait(null, 0)
  return wait({ average: p.rating, total: p.reviews, breakdown: distribution(p.rating, p.reviews) }, 120) }
export const getReviews = (productId, { sort = 'helpful', rating = 0, photosOnly = false } = {}) => {
  let l = t.all().filter(r => r.productId === +productId && r.status === 'approved')
  if (rating) l = l.filter(r => r.rating === rating); if (photosOnly) l = l.filter(r => r.photos.length)
  const by = { helpful: (a, b) => b.helpful - a.helpful, newest: (a, b) => b.date.localeCompare(a.date), highest: (a, b) => b.rating - a.rating, lowest: (a, b) => a.rating - b.rating }[sort]
  return wait([...l].sort(by), 150) }
export const getCustomerPhotos = productId => wait(customerPhotos.filter(p => p.productId === +productId), 120)
export const getVotedHelpful = () => read(HK, [])
export const toggleHelpful = id => { const v = read(HK, []), on = v.includes(id); write(HK, on ? v.filter(x => x !== id) : [...v, id])
  t.save(t.all().map(r => r.id === id ? { ...r, helpful: Math.max(0, r.helpful + (on ? -1 : 1)) } : r)); return !on }
export const addReview = (productId, user, { rating, title, comment }) => { const r = { id: uid('rv'), productId: +productId, userId: user?.id || 'guest', userName: user?.name || 'Guest', rating, title: title.trim(), comment: comment.trim(),
  date: new Date().toISOString().slice(0, 10), verifiedPurchase: false, helpful: 0, photos: [], status: 'pending' }; t.save([r, ...t.all()]); return wait(r, 400) }
// ---- admin ----
export const listAllReviews = () => wait(t.all().map(r => ({ ...r, productName: products.find(p => p.id === r.productId)?.name || 'Removed product' })))
export const setReviewStatus = (id, status) => { t.save(t.all().map(r => r.id === id ? { ...r, status } : r)); return wait(true, 80) }
export const deleteReview = id => { t.save(t.all().filter(r => r.id !== id)); return wait(true, 80) }
