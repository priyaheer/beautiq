import { brands as brandNames, products } from '../data'
import { slug, uid } from '../lib/format'
import { table, wait, write, PRODUCTS_KEY } from './db'

const seed = brandNames.map((name, i) => ({ id: `br${i + 1}`, name, slug: slug(name), active: true,
  description: `${name} brings considered formulas and a distinctive point of view to BEAUTIQ.` }))
const t = table('bq-brands-v1', seed)
const sync = () => { brandNames.length = 0; t.all().filter(b => b.active).forEach(b => brandNames.push(b.name)) }
sync()
const count = name => products.filter(p => p.brand === name).length
export const slugify = s => slug(s)
export const getBrands = () => wait(t.all().filter(b => b.active).map(b => ({ name: b.name, slug: b.slug, count: count(b.name), description: b.description })))
export const getBrandBySlug = s => { const b = t.all().find(x => x.slug === s && x.active); return wait(b ? { name: b.name, slug: b.slug, description: b.description, products: products.filter(p => p.brand === b.name) } : null) }
export const getFeaturedBrands = (category, n = 6) => { const c = {}; products.filter(p => !category || p.category === category).forEach(p => { c[p.brand] = (c[p.brand] || 0) + 1 })
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name]) => ({ name, slug: slug(name) })) }
export const listBrands = () => wait(t.all().map(b => ({ ...b, products: count(b.name) })))
export const saveBrand = b => { const rows = t.all(), name = b.name.trim()
  if (rows.some(x => x.name.toLowerCase() === name.toLowerCase() && x.id !== b.id)) return Promise.reject(new Error('A brand with this name already exists'))
  if (b.id) { const old = rows.find(x => x.id === b.id); if (old && old.name !== name) { products.forEach(p => { if (p.brand === old.name) p.brand = name }); write(PRODUCTS_KEY, products) }
    t.save(rows.map(x => x.id === b.id ? { ...x, ...b, name, slug: slug(name) } : x)) }
  else t.save([{ id: uid('br'), name, slug: slug(name), description: b.description || '', active: b.active !== false }, ...rows])
  sync(); return wait(true) }
export const deleteBrand = id => { const b = t.all().find(x => x.id === id); if (b && count(b.name)) return Promise.reject(new Error(`${b.name} still has ${count(b.name)} products. Move or delete them first.`))
  t.save(t.all().filter(x => x.id !== id)); sync(); return wait(true) }
