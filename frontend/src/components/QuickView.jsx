import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../context/Store'
import { Price, Rating } from './ProductCard'
import { ProductImage } from './ui'
export default function QuickView() {
  const { quick: p, setQuick, addToCart, toggleWish, wish } = useStore(), [shade, setShade] = useState(null), [qty, setQty] = useState(1)
  useEffect(() => { setShade(p?.shades[0]?.name ?? null); setQty(1) }, [p])
  return (<AnimatePresence>{p && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" onClick={() => setQuick(null)}>
    <motion.div initial={{ y: 24 }} animate={{ y: 0 }} onClick={e => e.stopPropagation()} className="relative grid max-h-[90vh] w-full max-w-3xl overflow-auto bg-ivory md:grid-cols-2">
      <button onClick={() => setQuick(null)} className="absolute right-3 top-3 z-10" aria-label="Close"><X/></button>
      <div className="relative grid aspect-square place-items-center overflow-hidden bg-sand font-serif text-3xl text-ink/30"><ProductImage p={p} className="absolute inset-0 h-full w-full object-cover"/><span className="relative">{p.brand}</span></div>
      <div className="p-6"><p className="text-xs uppercase tracking-widest text-ink/50">{p.brand}</p><h2 className="mt-1 text-3xl">{p.name}</h2>
        <div className="mt-2 flex gap-3"><Rating value={p.rating} count={p.reviews}/><Price p={p}/></div>
        {p.shades.length > 0 && <div className="mt-4 flex gap-2">{p.shades.map(s => <button key={s.name} title={s.name} onClick={() => setShade(s.name)} className={`h-7 w-7 rounded-full border-2 ${shade === s.name ? 'border-ink' : 'border-ivory ring-1 ring-sand'}`} style={{ background: s.hex }}/>)}</div>}
        <div className="mt-6 flex items-center gap-3"><div className="flex items-center border border-sand"><button className="px-3 py-2" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button><span className="w-6 text-center">{qty}</span><button className="px-3 py-2" onClick={() => setQty(q => q + 1)}>+</button></div>
          <button disabled={!p.stock} onClick={() => { addToCart(p, shade, qty); setQuick(null) }} className="btn-dark flex-1 disabled:opacity-50">Add to Bag</button></div>
        <div className="mt-4 flex justify-between text-xs uppercase tracking-widest"><button onClick={() => toggleWish(p)}>{wish.includes(p.id) ? 'Saved ✓' : 'Save to wishlist'}</button><Link to={`/product/${p.id}`} onClick={() => setQuick(null)} className="underline">View full details</Link></div></div>
    </motion.div></motion.div>}</AnimatePresence>)
}
