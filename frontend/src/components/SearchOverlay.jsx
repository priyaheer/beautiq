import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Search, Clock, TrendingUp } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { getSuggestions } from '../services/productService'
import { useLS } from '../context/Store'
import { Thumb } from './ui'
import { inr } from '../lib/format'
const TRENDING = ['Serum', 'Lipstick', 'Hair oil', 'Oud', 'SPF', 'Niacinamide', 'Curl cream']

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState(''), [recent, setRecent] = useLS('bq-recent-search', []), [active, setActive] = useState(-1), go = useNavigate(), ref = useRef()
  const [s, setS] = useState({ products: [], brands: [], categories: [] }), [searchError, setSearchError] = useState(null)
  const has = q.trim().length > 0
  useEffect(() => {
    let active = true
    setSearchError(null)
    if (!q.trim()) {
      setS({ products: [], brands: [], categories: [] })
      return () => { active = false }
    }
    getSuggestions(q).then(result => {
      if (active) setS(result)
    }).catch(error => {
      if (active) setSearchError(error)
    })
    return () => { active = false }
  }, [q])
  const flat = [...s.products.map(p => ({ to: `/product/${p.id}`, term: p.name })), ...s.brands.map(b => ({ to: `/brands/${b.slug}`, term: b.name })), ...s.categories.map(c => ({ to: c.to, term: c.label }))]
  useEffect(() => { if (open) { setQ(''); setActive(-1); setTimeout(() => ref.current?.focus(), 50); document.body.style.overflow = 'hidden' } return () => { document.body.style.overflow = '' } }, [open])
  useEffect(() => setActive(-1), [q])
  const remember = t => setRecent(r => [t, ...r.filter(x => x.toLowerCase() !== t.toLowerCase())].slice(0, 6))
  const visit = (to, term) => { remember(term || q.trim()); onClose(); go(to) }
  const search = t => { if (!t.trim()) return; remember(t.trim()); onClose(); go(`/search?q=${encodeURIComponent(t.trim())}`) }
  const key = e => { if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown' && flat.length) { e.preventDefault(); setActive(a => (a + 1) % flat.length) }
    else if (e.key === 'ArrowUp' && flat.length) { e.preventDefault(); setActive(a => (a <= 0 ? flat.length : a) - 1) } }
  const submit = e => { e.preventDefault(); active >= 0 ? visit(flat[active].to, flat[active].term) : search(q) }
  const Chip = ({ t, icon }) => <button type="button" onClick={() => search(t)} className="flex items-center gap-2 border border-sand px-4 py-2 text-sm transition hover:border-ink">{icon}{t}</button>
  const hl = i => active === i ? 'bg-cream' : ''
  return (<AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-ivory" role="dialog" aria-modal="true" aria-label="Search" onKeyDown={key}>
    <form onSubmit={submit} className="wrap max-w-3xl pb-16 pt-6 sm:pt-16">
      <div className="flex justify-end"><button type="button" onClick={onClose} aria-label="Close search"><X/></button></div>
      <div className="mt-4 flex items-center gap-3 border-b border-ink"><Search size={22} className="shrink-0 text-ink/50"/><input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder="Search products, brands, concerns" aria-label="Search" className="w-full bg-transparent pb-3 pt-1 font-serif text-2xl outline-none sm:text-3xl"/>
        {has && <button type="button" onClick={() => { setQ(''); ref.current?.focus() }} className="pb-2 text-xs uppercase tracking-widest text-ink/50">Clear</button>}</div>
      {!has ? <div className="mt-10 space-y-10">
        {recent.length > 0 && <div><div className="flex items-center justify-between"><p className="text-xs uppercase tracking-widest text-ink/50">Recent searches</p><button type="button" onClick={() => setRecent([])} className="text-xs underline">Clear all</button></div>
          <div className="mt-3 flex flex-wrap gap-2">{recent.map(t => <Chip key={t} t={t} icon={<Clock size={13} className="text-ink/40"/>}/>)}</div></div>}
        <div><p className="text-xs uppercase tracking-widest text-ink/50">Trending searches</p><div className="mt-3 flex flex-wrap gap-2">{TRENDING.map(t => <Chip key={t} t={t} icon={<TrendingUp size={13} className="text-rose"/>}/>)}</div></div></div>
      : searchError ? <p role="alert" className="py-16 text-center text-rose">Search could not be completed. Please try again later.</p>
      : !flat.length ? <div className="py-16 text-center"><p className="font-serif text-3xl">No matches for “{q}”</p><p className="mt-2 text-sm text-ink/60">Check the spelling, or try a brand, ingredient or concern like “hydration”.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">{TRENDING.slice(0, 4).map(t => <Chip key={t} t={t}/>)}</div></div>
      : <div className="mt-6 grid gap-8 md:grid-cols-[1fr_220px]">
        <div><p className="mb-2 text-xs uppercase tracking-widest text-ink/50">Products</p>
          {s.products.map((p, i) => <button type="button" key={p.id} onClick={() => visit(`/product/${p.id}`, p.name)} onMouseEnter={() => setActive(i)} className={`flex w-full items-center gap-4 p-2 text-left transition ${hl(i)}`}>
            <Thumb p={p} className="h-16 w-14"/><span className="min-w-0 flex-1"><span className="block text-[11px] uppercase tracking-widest text-ink/50">{p.brand}</span><span className="block truncate font-serif text-lg leading-tight">{p.name}</span></span><span className="text-sm">{inr(p.price)}</span></button>)}
          {s.total > s.products.length && <button type="button" onClick={() => search(q)} className="mt-3 text-xs uppercase tracking-widest underline">See all {s.total} results</button>}
          {!s.products.length && <p className="p-2 text-sm text-ink/50">No products match — try the brands or categories.</p>}</div>
        <div className="space-y-8">
          {s.brands.length > 0 && <div><p className="mb-2 text-xs uppercase tracking-widest text-ink/50">Brands</p>{s.brands.map((b, i) => { const n = s.products.length + i
            return <button type="button" key={b.slug} onClick={() => visit(`/brands/${b.slug}`, b.name)} onMouseEnter={() => setActive(n)} className={`block w-full px-2 py-2 text-left font-serif text-lg ${hl(n)}`}>{b.name}</button> })}</div>}
          {s.categories.length > 0 && <div><p className="mb-2 text-xs uppercase tracking-widest text-ink/50">Categories</p>{s.categories.map((c, i) => { const n = s.products.length + s.brands.length + i
            return <button type="button" key={c.to} onClick={() => visit(c.to, c.label)} onMouseEnter={() => setActive(n)} className={`block w-full px-2 py-2 text-left text-sm ${hl(n)}`}>{c.label} <span className="text-xs text-ink/50">in {c.hint}</span></button> })}</div>}
        </div></div>}
      <button type="submit" className="sr-only">Search</button>
    </form></motion.div>}</AnimatePresence>)
}
