import { articles, articleCategories } from '../data/articles'
import { wait } from './db'
export { articleCategories }
const TRENDING = ['vitamin-c-demystified', 'the-quiet-skincare-routine', 'how-to-wear-fragrance', 'curl-wash-day-ritual', 'the-soft-focus-face']
export const getArticles = ({ category, q } = {}) => { let l = articles
  if (category && category !== 'All') l = l.filter(a => a.category === category)
  if (q?.trim()) { const t = q.toLowerCase().split(/\s+/); l = l.filter(a => t.every(w => [a.title, a.subtitle, a.category, a.author.name, ...a.tags].join(' ').toLowerCase().includes(w))) }
  return wait([...l].sort((a, b) => b.date.localeCompare(a.date)), 120) }
export const getArticleBySlug = s => wait(articles.find(a => a.slug === s) || null, 120)
export const getTrendingArticles = () => wait(TRENDING.map(s => articles.find(a => a.slug === s)).filter(Boolean), 80)
export const getRelatedArticles = (a, n = 3) => wait(articles.filter(x => x.slug !== a.slug).map(x => ({ x, s: (x.category === a.category ? 3 : 0) + x.tags.filter(t => a.tags.includes(t)).length * 2 + (x.author.name === a.author.name ? 1 : 0) }))
  .sort((p, q) => q.s - p.s || q.x.date.localeCompare(p.x.date)).slice(0, n).map(r => r.x), 80)
