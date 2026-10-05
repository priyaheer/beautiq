import { categories as seed } from '../data/categories'
import { table, wait } from './db'
import { slug, uid } from '../lib/format'
import { getProducts } from './productService'
const t = table('bq-categories-v1', seed)
const BASE = ['makeup', 'skincare', 'haircare', 'fragrance']
export const getCategories = () => t.all()
export const getCategory = s => t.all().find(c => c.slug === s)
export const categoryPath = s => BASE.includes(s) ? `/${s}` : `/category/${s}`
export const subPath = (cat, sub) => `${categoryPath(cat)}?sub=${encodeURIComponent(sub)}`
export const subMatches = (cat, sub) => getCategory(cat)?.subcategories.find(s => s.name === sub)?.match || [sub]
export const listCategories = async () => {
  const products = await getProducts()
  return t.all().map(category => ({ ...category, products: products.filter(product => product.category === category.slug).length }))
}
export const saveCategory = c => { const rows = t.all(), s = slug(c.name)
  if (rows.some(x => x.slug === s && x.id !== c.id)) return Promise.reject(new Error('A category with this name already exists'))
  const subs = (typeof c.subs === 'string' ? c.subs.split(',') : c.subcategories?.map(x => x.name) || []).map(x => x.trim()).filter(Boolean)
  const subcategories = subs.map(name => ({ name, match: t.all().find(x => x.id === c.id)?.subcategories.find(x => x.name === name)?.match || [name] }))
  if (c.id) t.save(rows.map(x => x.id === c.id ? { ...x, name: c.name.trim(), slug: x.slug, tagline: c.tagline, subcategories } : x))
  else t.save([...rows, { id: uid('cat'), slug: s, name: c.name.trim(), hue: 20, tagline: c.tagline || '', subcategories }])
  return wait(true) }
export const deleteCategory = async id => {
  const category = t.all().find(item => item.id === id)
  const products = await getProducts()
  const count = products.filter(product => product.category === category?.slug).length
  if (count) throw new Error(`${category.name} still has ${count} products. Move or delete them first.`)
  t.save(t.all().filter(item => item.id !== id))
  return wait(true)
}
