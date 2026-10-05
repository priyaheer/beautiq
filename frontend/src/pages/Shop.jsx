import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { getCategory, getCategories, subMatches } from '../services/categoryService'
import ProductCard from '../components/ProductCard'
import NotFound from './NotFound'
import { useProducts } from '../hooks/useProducts'
const titles = { shop: 'Shop', 'new-arrivals': 'New Arrivals', 'best-sellers': 'Best Sellers', search: 'Search' }
const SKIN = ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'], CONCERNS = ['Dullness', 'Acne', 'Ageing', 'Hydration', 'Redness', 'Frizz', 'Damage']
const empty = { brands: [], cats: [], max: 5000, rating: 0, skin: [], concerns: [], stock: false, discount: 0 }
const toggle = (arr, v) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]
const countActive = f => f.brands.length + f.cats.length + (f.max < 5000 ? 1 : 0) + (f.rating ? 1 : 0) + f.skin.length + f.concerns.length + (f.stock ? 1 : 0) + (f.discount ? 1 : 0)

function applyFilters(base, f, cat, isCat) {
  let l = base
  if (f.brands.length) l = l.filter(p => f.brands.includes(p.brand))
  if (f.cats.length) l = isCat ? l.filter(p => f.cats.some(s => subMatches(cat, s).includes(p.subcategory))) : l.filter(p => f.cats.includes(p.category))
  l = l.filter(p => p.price <= f.max && p.rating >= f.rating && p.discount >= f.discount && (!f.stock || p.stock))
  if (f.skin.length) l = l.filter(p => p.skinTypes.some(t => f.skin.includes(t)))
  if (f.concerns.length) l = l.filter(p => p.concerns.some(c => f.concerns.includes(c)))
  return l
}

function Group({ title, children }) { return <fieldset className="border-b border-sand/70 pb-6"><legend className="mb-3 text-xs uppercase tracking-widest">{title}</legend>{children}</fieldset> }
const Check = ({ on, onChange, children }) => <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm"><input type="checkbox" checked={on} onChange={onChange} className="h-4 w-4 accent-rose"/>{children}</label>
const Radio = ({ on, onChange, children }) => <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm"><input type="radio" checked={on} onChange={onChange} className="h-4 w-4 accent-rose"/>{children}</label>

function FilterPanel({ f, set, catOptions, catLabel, brands }) {
  return <div className="space-y-6 text-sm">
    <Group title={catLabel}><div className="space-y-0.5">{catOptions.map(([v, l]) => <Check key={v} on={f.cats.includes(v)} onChange={() => set({ ...f, cats: toggle(f.cats, v) })}>{l}</Check>)}</div></Group>
    <Group title={`Price up to ₹${f.max.toLocaleString('en-IN')}`}><input type="range" aria-label="Maximum price" min="400" max="5000" step="100" value={f.max} onChange={e => set({ ...f, max: +e.target.value })} className="w-full accent-rose"/>
      <div className="mt-1 flex justify-between text-xs text-ink/50"><span>₹400</span><span>₹5,000</span></div></Group>
    <Group title="Rating">{[[0, 'Any rating'], [4.5, '4.5 & above'], [4, '4.0 & above'], [3.5, '3.5 & above']].map(([v, l]) => <Radio key={v} on={f.rating === v} onChange={() => set({ ...f, rating: v })}>{l}</Radio>)}</Group>
    <Group title="Availability"><Check on={f.stock} onChange={() => set({ ...f, stock: !f.stock })}>In stock only</Check></Group>
    <Group title="Discount">{[[0, 'Any'], [10, '10% or more'], [20, '20% or more']].map(([v, l]) => <Radio key={v} on={f.discount === v} onChange={() => set({ ...f, discount: v })}>{l}</Radio>)}</Group>
    <Group title="Skin type"><div className="flex flex-wrap gap-2">{SKIN.map(s => <button type="button" key={s} aria-pressed={f.skin.includes(s)} onClick={() => set({ ...f, skin: toggle(f.skin, s) })} className={`border px-3 py-1.5 text-xs transition ${f.skin.includes(s) ? 'border-ink bg-ink text-ivory' : 'border-sand hover:border-ink'}`}>{s}</button>)}</div></Group>
    <Group title="Concern"><div className="flex flex-wrap gap-2">{CONCERNS.map(s => <button type="button" key={s} aria-pressed={f.concerns.includes(s)} onClick={() => set({ ...f, concerns: toggle(f.concerns, s) })} className={`border px-3 py-1.5 text-xs transition ${f.concerns.includes(s) ? 'border-ink bg-ink text-ivory' : 'border-sand hover:border-ink'}`}>{s}</button>)}</div></Group>
    <Group title="Brand"><div className="max-h-56 space-y-0.5 overflow-auto pr-1">{[...brands].sort().map(b => <Check key={b} on={f.brands.includes(b)} onChange={() => set({ ...f, brands: toggle(f.brands, b) })}>{b}</Check>)}</div></Group>
  </div>
}

export default function Shop({ cat }) {
  const { products = null, error } = useProducts()
  const [sp] = useSearchParams(), q = (sp.get('q') || '').toLowerCase().trim(), sub = sp.get('sub')
  const c = getCategory(cat), isCat = !!c, [f, setF] = useState({ ...empty, cats: sub ? [sub] : [] }), [sort, setSort] = useState('featured'), [open, setOpen] = useState(false), [draft, setDraft] = useState(f)
  useEffect(() => { setF({ ...empty, cats: sub ? [sub] : [] }) }, [cat, sub])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' ; return () => { document.body.style.overflow = '' } }, [open])
  const brands = [...new Set((products || []).map(product => product.brand))]
  const base = useMemo(() => { let l = (products || []).filter(p => cat === 'new-arrivals' ? p.newArrival : cat === 'best-sellers' ? p.bestseller : (cat === 'search' || cat === 'shop') ? true : p.category === cat)
    if (q) { const t = q.split(/\s+/); l = l.filter(p => t.every(w => [p.name, p.brand, p.subcategory, p.category, ...p.concerns, ...p.ingredients].join(' ').toLowerCase().includes(w))) }
    return l }, [products, cat, q])
  const sorter = { 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating, discount: (a, b) => b.discount - a.discount }[sort]
  const list = useMemo(() => { const l = applyFilters(base, f, cat, isCat); return sorter ? [...l].sort(sorter) : l }, [base, f, sort, cat])
  const catOptions = isCat ? c.subcategories.map(s => [s.name, s.name]) : getCategories().map(x => [x.slug, x.name]), catLabel = isCat ? 'Subcategory' : 'Category'
  const labelFor = v => catOptions.find(o => o[0] === v)?.[1] || v
  const clear = () => { setF({ ...empty }); setDraft({ ...empty }) }
  const n = countActive(f), draftCount = useMemo(() => applyFilters(base, draft, cat, isCat).length, [base, draft, cat])
  const chips = [...f.cats.map(v => [labelFor(v), () => setF({ ...f, cats: f.cats.filter(x => x !== v) })]), ...f.brands.map(v => [v, () => setF({ ...f, brands: f.brands.filter(x => x !== v) })]), ...f.skin.map(v => [`${v} skin`, () => setF({ ...f, skin: f.skin.filter(x => x !== v) })]),
    ...f.concerns.map(v => [v, () => setF({ ...f, concerns: f.concerns.filter(x => x !== v) })]), ...(f.max < 5000 ? [[`Under ₹${f.max}`, () => setF({ ...f, max: 5000 })]] : []), ...(f.rating ? [[`${f.rating}★ & up`, () => setF({ ...f, rating: 0 })]] : []),
    ...(f.stock ? [['In stock', () => setF({ ...f, stock: false })]] : []), ...(f.discount ? [[`${f.discount}%+ off`, () => setF({ ...f, discount: 0 })]] : [])]
  const title = c?.name || titles[cat] || 'Shop'
  return (<div className="wrap py-12">
    <h1 className="text-5xl">{title}{sub && <span className="text-2xl text-ink/50"> / {sub}</span>}{q && <span className="text-2xl text-ink/50"> “{q}”</span>}</h1>
    {c && <p className="mt-2 text-ink/60">{c.tagline}</p>}
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-y border-sand py-3 text-sm"><div className="flex items-center gap-4"><button onClick={() => { setDraft(f); setOpen(true) }} className="flex items-center gap-2 border border-ink px-4 py-2 text-xs uppercase tracking-widest lg:hidden"><SlidersHorizontal size={14}/>Filters{n > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-[10px] text-white">{n}</span>}</button><span>{list.length} products</span></div>
      <label className="flex items-center gap-2"><span className="sr-only sm:not-sr-only">Sort</span><select value={sort} onChange={e => setSort(e.target.value)} className="border border-sand bg-ivory p-2"><option value="featured">Featured</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="rating">Top Rated</option><option value="discount">Biggest Discount</option></select></label></div>
    {chips.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-2">{chips.map(([l, rm]) => <button key={l} onClick={rm} className="flex items-center gap-1.5 bg-cream px-3 py-1.5 text-xs" aria-label={`Remove filter ${l}`}>{l}<X size={12}/></button>)}<button onClick={clear} className="ml-1 text-xs underline">Clear all</button></div>}
    <div className="mt-8 grid gap-10 lg:grid-cols-[250px_1fr]">
      <aside className="hidden lg:block"><div className="mb-4 flex items-center justify-between"><p className="text-xs uppercase tracking-widest">Filters{n > 0 && ` (${n})`}</p>{n > 0 && <button onClick={clear} className="text-xs underline">Clear filters</button>}</div><FilterPanel f={f} set={setF} catOptions={catOptions} catLabel={catLabel} brands={brands}/></aside>
      {!products ? error ? <p role="alert" className="py-20 text-center text-rose">Products could not be loaded. Please try again later.</p> : <div className="grid grid-cols-2 gap-5 md:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="aspect-[4/5] animate-pulse bg-cream"/>)}</div>
        : list.length ? <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">{list.map(p => <ProductCard key={p.id} p={p}/>)}</div>
        : <div className="py-20 text-center"><h3 className="text-3xl">Nothing found</h3><p className="mt-2 text-ink/60">Try adjusting your filters{q ? ' or searching a different term' : ''}.</p><div className="mt-6 flex justify-center gap-3">{n > 0 && <button onClick={clear} className="btn-line">Clear filters</button>}<Link to="/new-arrivals" className="btn-dark">See new arrivals</Link></div></div>}
    </div>
    <AnimatePresence>{open && <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-ink/40 lg:hidden" onClick={() => setOpen(false)}/>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: .3 }} role="dialog" aria-modal="true" aria-label="Filters" className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col bg-ivory lg:hidden">
        <div className="flex items-center justify-between border-b border-sand p-5"><h2 className="text-2xl">Filters{countActive(draft) > 0 && <span className="ml-2 text-base text-rose">({countActive(draft)})</span>}</h2><button onClick={() => setOpen(false)} aria-label="Close filters"><X/></button></div>
        <div className="flex-1 overflow-y-auto p-5"><FilterPanel f={draft} set={setDraft} catOptions={catOptions} catLabel={catLabel} brands={brands}/></div>
        <div className="flex gap-3 border-t border-sand p-4"><button onClick={() => setDraft({ ...empty })} className="btn-line flex-1">Clear</button><button onClick={() => { setF(draft); setOpen(false) }} className="btn-dark flex-[2]">Show {draftCount} {draftCount === 1 ? 'product' : 'products'}</button></div>
      </motion.div></>}</AnimatePresence>
  </div>)
}
export function CategoryShop() { const { slug } = useParams(); return getCategory(slug) ? <Shop cat={slug}/> : <NotFound/> }
