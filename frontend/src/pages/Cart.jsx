import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { evaluateCoupon } from '../services/couponService'
import { useStore } from '../context/Store'
import { ProductImage } from '../components/ui'
import { useProducts } from '../hooks/useProducts'
export default function Cart() {
  const { cart, setQty, removeItem, coupon, setCoupon } = useStore(), [code, setCode] = useState(''), [err, setErr] = useState(''), go = useNavigate()
  const { products, error } = useProducts()
  if (!products) return <div className="wrap py-20 text-center">{error ? <p role="alert" className="text-rose">Products could not be loaded. Please try again later.</p> : <p className="text-ink/60">Loading your bag…</p>}</div>
  const items = cart.map(c => ({ ...c, p: products.find(x => String(x.id) === String(c.id)) })).filter(i => i.p)
  const sub = items.reduce((a, i) => a + i.p.price * i.qty, 0), cp = evaluateCoupon(coupon, sub), applied = cp.ok ? coupon : null, disc = cp.amount, ship = sub - disc > 1999 || !sub ? 0 : 99
  const apply = () => { const r = evaluateCoupon(code, sub); if (r.ok) { setCoupon(code.trim().toUpperCase()); setErr(''); setCode('') } else setErr(r.reason) }
  if (!items.length) return <div className="py-32 text-center"><h1 className="text-5xl">Your bag is empty</h1><p className="mt-3 text-ink/60">Discover something you'll love.</p><Link to="/new-arrivals" className="btn-dark mt-8">Shop New Arrivals</Link></div>
  return (<div className="wrap grid gap-12 py-12 lg:grid-cols-[1fr_360px]"><div><h1 className="text-5xl">Your Bag</h1>
    {items.map(({ p, shade, qty }) => <div key={p.id + shade} className="flex gap-4 border-b border-sand py-6"><ProductImage p={p} className="h-28 w-24 shrink-0 object-cover"/>
      <div className="flex-1"><p className="text-[11px] uppercase tracking-widest text-ink/50">{p.brand}</p><Link to={`/product/${p.id}`} className="font-serif text-xl">{p.name}</Link>{shade && <p className="text-sm text-ink/60">Shade: {shade}</p>}
        <div className="mt-3 flex items-center gap-3 text-sm"><button className="border border-sand px-3" onClick={() => setQty(p.id, shade, qty - 1)}>−</button>{qty}<button className="border border-sand px-3" onClick={() => setQty(p.id, shade, qty + 1)}>+</button></div></div>
      <div className="flex flex-col items-end justify-between"><b className="font-medium">₹{(p.price * qty).toLocaleString('en-IN')}</b><button onClick={() => removeItem(p.id, shade)} aria-label="Remove"><Trash2 size={16}/></button></div></div>)}</div>
    <aside className="h-fit bg-cream p-6"><h2 className="text-2xl">Summary</h2>
      <div className="mt-4 flex gap-2"><input value={code} onChange={e => setCode(e.target.value)} placeholder="Coupon code" className="w-full border border-sand bg-ivory px-3 py-2 text-sm"/><button onClick={apply} className="btn-line !px-4">Apply</button></div>
      {err && <p className="mt-1 text-xs text-rose">{err}</p>}{applied && <p className="mt-1 flex items-center justify-between text-xs text-rose"><span>{applied} applied</span><button onClick={() => setCoupon('')} className="underline">Remove</button></p>}
      <dl className="mt-6 space-y-2 text-sm">{[['Subtotal', sub], ['Discount', -disc], ['Shipping', ship]].map(([k, v]) => <div key={k} className="flex justify-between"><dt>{k}</dt><dd>{v < 0 ? '−' : ''}₹{Math.abs(v).toLocaleString('en-IN')}</dd></div>)}
        <div className="flex justify-between border-t border-ink pt-3 text-base font-medium"><dt>Total</dt><dd>₹{(sub - disc + ship).toLocaleString('en-IN')}</dd></div></dl>
      <p className="mt-3 text-xs text-ink/60">Estimated delivery in 3–5 days</p><button onClick={() => go('/checkout')} className="btn-dark mt-6 w-full">Checkout</button></aside></div>)
}
