import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../context/Store'
import { ProductImage } from './ui'
import { useProducts } from '../hooks/useProducts'
export default function FrequentlyBought({ p }) {
  const { addToCart } = useStore()
  const { products: catalog } = useProducts()
  const products = catalog || []
  const set = useMemo(() => { const others = products.filter(x => String(x.id) !== String(p.id) && x.category !== p.category && x.stock)
    const score = x => (x.skinTypes || []).filter(t => (p.skinTypes || []).includes(t)).length * 2 + (x.brand === p.brand ? 2 : 0) + (x.concerns || []).filter(c => (p.concerns || []).includes(c)).length
    const picked = []; for (const x of [...others].sort((a, b) => score(b) - score(a))) if (!picked.some(y => y.category === x.category)) picked.push(x); return [p, ...picked.slice(0, 2)] }, [p, products])
  const [sel, setSel] = useState(() => set.map(x => x.id)); useEffect(() => setSel(set.map(x => x.id)), [set]); const chosen = set.filter(x => sel.includes(x.id)), total = chosen.reduce((a, x) => a + x.price, 0)
  return (<section className="mt-24"><h2 className="text-3xl">Frequently bought together</h2>
    <div className="mt-6 flex flex-col gap-6 border border-sand p-6 lg:flex-row lg:items-center"><div className="flex flex-1 flex-wrap items-center gap-4">{set.map((x, i) => <label key={x.id} className="flex items-center gap-3">{i > 0 && <span className="text-xl">+</span>}
      <input type="checkbox" checked={sel.includes(x.id)} onChange={() => setSel(s => s.includes(x.id) ? s.filter(i => i !== x.id) : [...s, x.id])} disabled={x.id === p.id}/>
      <ProductImage p={x} className="h-16 w-14 object-cover"/><div className="text-sm"><p className="font-serif text-base leading-tight">{x.name}</p><p>₹{x.price.toLocaleString('en-IN')}</p></div></label>)}</div>
      <div className="text-right"><p className="text-xs uppercase tracking-widest text-ink/50">Combined price</p><p className="font-serif text-3xl">₹{total.toLocaleString('en-IN')}</p>
        <button onClick={() => chosen.forEach(x => addToCart(x, x.shades[0]?.name ?? null))} className="btn-dark mt-2">Add {chosen.length} to Bag</button></div></div></section>)
}
