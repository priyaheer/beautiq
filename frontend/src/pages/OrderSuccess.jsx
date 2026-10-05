import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import { getOrderById } from '../services/orderService'
import { useAuth } from '../context/Auth'
import { AddressBlock } from '../components/AddressForm'
import { ProductImage } from '../components/ui'
import { inr, fmtDate } from '../lib/format'
export default function OrderSuccess() {
  const { id } = useParams(), { user } = useAuth(), [o, setO] = useState(undefined)
  useEffect(() => { getOrderById(id).then(setO) }, [id])
  if (o === undefined) return <div className="wrap max-w-3xl py-20"><div className="h-64 animate-pulse bg-cream"/></div>
  if (!o) return <div className="py-32 text-center"><h1 className="text-5xl">Order not found</h1><p className="mt-3 text-ink/60">We couldn't find that order.</p><Link to="/" className="btn-dark mt-8">Back to home</Link></div>
  return (<div className="wrap max-w-3xl py-16"><div className="text-center"><motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-ink text-ivory"><Check size={36}/></motion.span>
    <p className="mt-6 text-xs uppercase tracking-[.3em] text-rose">Order confirmed</p><h1 className="mt-2 text-5xl">Thank you{o.address?.name ? `, ${o.address.name.split(' ')[0]}` : ''}</h1><p className="mt-3 text-ink/60">A confirmation has been sent to {o.email}.</p></div>
    <div className="mt-10 grid grid-cols-2 gap-px border border-sand bg-sand text-sm md:grid-cols-4">{[['Order number', o.id], ['Date', fmtDate(o.date)], ['Total', inr(o.total)], ['Payment', o.paymentMethod]].map(([k, v]) => <div key={k} className="bg-ivory p-4"><p className="text-xs uppercase tracking-widest text-ink/50">{k}</p><p className="mt-1 font-medium">{v}</p></div>)}</div>
    <section className="mt-8 border border-sand p-6"><h2 className="text-2xl">Your items</h2><ul className="mt-3 divide-y divide-sand">{o.items.map(i => <li key={i.productId + i.shade} className="flex gap-4 py-3 text-sm"><ProductImage p={i} className="h-16 w-14 shrink-0 object-cover"/><div className="flex-1"><p className="text-[11px] uppercase tracking-widest text-ink/50">{i.brand}</p><p className="font-serif text-lg leading-tight">{i.name}</p><p className="text-ink/60">{i.shade && `${i.shade} · `}Qty {i.qty}</p></div><b className="font-medium">{inr(i.price * i.qty)}</b></li>)}</ul>
      <dl className="mt-3 space-y-1 border-t border-sand pt-3 text-sm">{[['Subtotal', o.subtotal], ['Discount', -o.discount], ['Shipping', o.shipping], ...(o.codFee ? [['COD fee', o.codFee]] : [])].map(([k, v]) => <div key={k} className="flex justify-between"><dt>{k}</dt><dd>{v < 0 ? '−' : ''}{k === 'Shipping' && !v ? 'Free' : inr(Math.abs(v))}</dd></div>)}<div className="flex justify-between pt-2 text-base font-medium"><dt>Total</dt><dd>{inr(o.total)}</dd></div></dl></section>
    <div className="mt-6 grid gap-6 md:grid-cols-2"><section className="border border-sand p-6"><h2 className="flex items-center gap-2 text-2xl"><Truck size={20}/>Delivery</h2><p className="mt-3 text-sm font-medium">{o.delivery.label}</p><p className="text-sm text-ink/60">Estimated by {fmtDate(o.estimatedDelivery, { weekday: 'long', day: 'numeric', month: 'long' })}</p></section>
      <section className="border border-sand p-6"><h2 className="text-2xl">Shipping to</h2><div className="mt-3"><AddressBlock a={o.address}/></div></section></div>
    <div className="mt-10 flex flex-wrap justify-center gap-3"><Link to={user ? `/account/orders/${o.id}` : `/login?next=${encodeURIComponent(`/account/orders/${o.id}`)}`} className="btn-dark">View order</Link><Link to="/new-arrivals" className="btn-line">Continue shopping</Link></div>
    {!user && <p className="mt-4 text-center text-xs text-ink/50">Create an account with {o.email} to track this order.</p>}</div>)
}
