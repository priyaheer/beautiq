import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCategory, categoryPath, subPath } from '../services/categoryService'
import { getMenuProducts } from '../services/productService'
import { Thumb, Art } from './ui'
import { inr } from '../lib/format'

const promo = {
  makeup: ['The Soft-Focus Face', 'A base routine that looks like skin, only quieter.', '/beauty-edit/the-soft-focus-face', 'Read the guide'],
  skincare: ['Up to 25% off serums', 'Brightening, calming and barrier-repair formulas, selected by our editors.', '/skincare?sub=Serum', 'Shop serums'],
  haircare: ['Find your hair type', 'Answer a few questions for a ritual built around your texture.', '/beauty-finder', 'Take the Beauty Finder'],
  fragrance: ['A scent for every season', 'Oud, jasmine, vetiver and amber — choose by the weather.', '/beauty-edit/scent-for-every-season', 'Read the edit'] }
const list = { hidden: {}, show: { transition: { staggerChildren: .035, delayChildren: .06 } } }
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

export default function MegaMenu({ slug, onNavigate }) {
  const c = getCategory(slug)
  const [menu, setMenu] = useState({ popular: [], trending: [], brands: [] }), [error, setError] = useState(null)
  useEffect(() => {
    if (!c) return undefined
    let active = true
    getMenuProducts(slug).then(result => { if (active) setMenu(result) }).catch(reason => { if (active) setError(reason) })
    return () => { active = false }
  }, [slug])
  if (!c) return null
  const { popular, trending, brands } = menu, [pt, pd, pto, pcta] = promo[slug] || promo.skincare
  const Row = ({ p }) => <motion.div variants={item}><Link to={`/product/${p.id}`} onClick={onNavigate} className="group flex items-center gap-3 py-1.5"><Thumb p={p} className="h-14 w-11"/>
    <span className="min-w-0 text-sm"><span className="block text-[10px] uppercase tracking-widest text-ink/50">{p.brand}</span><span className="block truncate font-serif text-base leading-tight group-hover:text-rose">{p.name}</span><span className="text-xs text-ink/70">{inr(p.price)}</span></span></Link></motion.div>
  return (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .22, ease: 'easeOut' }}
    className="absolute inset-x-0 top-full border-b border-sand bg-ivory shadow-[0_24px_40px_-24px_rgba(36,31,29,.35)]" role="region" aria-label={`${c.name} menu`}>
    <motion.div variants={list} initial="hidden" animate="show" className="wrap grid grid-cols-12 gap-8 py-9">
      <div className="col-span-3"><motion.p variants={item} className="font-serif text-2xl">{c.name}</motion.p><motion.p variants={item} className="mt-1 text-sm text-ink/60">{c.tagline}</motion.p>
        <ul className="mt-5 space-y-2.5">{c.subcategories.map(s => <motion.li variants={item} key={s.name}><Link to={subPath(slug, s.name)} onClick={onNavigate} className="text-sm transition hover:pl-1 hover:text-rose">{s.name}</Link></motion.li>)}</ul>
        <motion.div variants={item}><Link to={categoryPath(slug)} onClick={onNavigate} className="btn-dark mt-7 !py-2.5">Shop all {c.name}</Link></motion.div></div>
      <div className="col-span-3"><p className="mb-2 text-xs uppercase tracking-widest text-ink/50">Popular products</p>{error ? <p role="alert" className="text-xs text-rose">Products could not be loaded.</p> : popular.map(p => <Row key={p.id} p={p}/>)}</div>
      <div className="col-span-3"><p className="mb-2 text-xs uppercase tracking-widest text-ink/50">Trending now</p>{trending.map(p => <Row key={p.id} p={p}/>)}
        <p className="mb-2 mt-5 text-xs uppercase tracking-widest text-ink/50">Featured brands</p>
        <div className="flex flex-wrap gap-1.5">{brands.map(b => <motion.span variants={item} key={b.slug}><Link to={`/brands/${b.slug}`} onClick={onNavigate} className="inline-block border border-sand px-2.5 py-1 text-xs transition hover:border-ink">{b.name}</Link></motion.span>)}</div></div>
      <motion.div variants={item} className="col-span-3"><Link to={pto} onClick={onNavigate} className="group relative block h-full min-h-[260px] overflow-hidden">
        <Art hue={c.hue} variant={2} className="absolute inset-0 transition duration-700 group-hover:scale-105"/>
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-5 text-ivory"><span className="block font-serif text-2xl leading-tight">{pt}</span><span className="mt-1 block text-xs text-ivory/80">{pd}</span><span className="mt-3 inline-block border-b border-ivory pb-0.5 text-[11px] uppercase tracking-widest">{pcta}</span></span></Link></motion.div>
    </motion.div></motion.div>)
}
