import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '../../context/Auth'
import { useStore } from '../../context/Store'
import { getOrderById, cancelOrder } from '../../services/orderService'
import { useProducts } from '../../hooks/useProducts'
import OrderTimeline from '../../components/OrderTimeline'
import { AddressBlock } from '../../components/AddressForm'
import { StatusBadge, Modal, ProductImage } from '../../components/ui'
import { OrderSkeleton } from '../../components/Skeleton'
import { inr, fmtDate } from '../../lib/format'
export default function OrderDetails() {
  const { id } = useParams(), { user } = useAuth(), { addToCart, notify } = useStore(), [o, setO] = useState(undefined), [ask, setAsk] = useState(false), { products: catalog } = useProducts()
  const products = catalog || []
  useEffect(() => { setO(undefined); getOrderById(id).then(r => setO(r && (r.userId === user.id || r.email?.toLowerCase() === user.email.toLowerCase()) ? r : null)) }, [id, user.id])
  if (o === undefined) return <OrderSkeleton/>
  if (!o) return <div className="py-20 text-center"><h1 className="text-4xl">Order not found</h1><p className="mt-2 text-ink/60">We couldn't find an order with that number on your account.</p><Link to="/account/orders" className="btn-dark mt-6">Back to orders</Link></div>
  const cancel = async () => { try { setO(await cancelOrder(o.id)); notify('Order cancelled') } catch (e) { notify(e.message) } setAsk(false) }
  const again = () => { o.items.forEach(i => { const p = products.find(x => String(x.id) === String(i.productId)); if (p?.stock) addToCart(p, i.shade, i.qty) }) }
  return (<div><Link to="/account/orders" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-ink/60 hover:text-ink"><ChevronLeft size={14}/>All orders</Link>
    <div className="mt-3 flex flex-wrap items-center gap-4"><h1 className="text-4xl">Order {o.id}</h1><StatusBadge status={o.status}/></div><p className="mt-1 text-sm text-ink/60">Placed on {fmtDate(o.date)}{o.status !== 'Delivered' && o.status !== 'Cancelled' && <> · Estimated delivery by {fmtDate(o.estimatedDelivery)}</>}</p>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]"><div className="space-y-8">
      <section className="border border-sand p-6"><h2 className="text-2xl">Tracking</h2><div className="mt-6"><OrderTimeline order={o}/></div>{o.status === 'Cancelled' && <p className="mt-5 text-sm text-ink/60">This order was cancelled. {o.paymentStatus === 'Refunded' ? 'Your refund has been initiated and will reach you in 5–7 working days.' : ''}</p>}</section>
      <section className="border border-sand p-6"><h2 className="text-2xl">Items</h2><ul className="mt-4 divide-y divide-sand">{o.items.map(i => <li key={i.productId + i.shade} className="flex gap-4 py-4"><ProductImage p={i} className="h-20 w-16 shrink-0 object-cover"/><div className="min-w-0 flex-1 text-sm"><p className="text-[11px] uppercase tracking-widest text-ink/50">{i.brand}</p><Link to={`/product/${i.productId}`} className="font-serif text-lg leading-tight hover:text-rose">{i.name}</Link><p className="text-ink/60">{i.shade && `${i.shade} · `}Qty {i.qty}</p></div><b className="text-sm font-medium">{inr(i.price * i.qty)}</b></li>)}</ul></section></div>
      <aside className="space-y-6"><section className="bg-cream p-6 text-sm"><h2 className="text-2xl">Summary</h2><dl className="mt-4 space-y-2">{[['Subtotal', o.subtotal], ['Discount', -o.discount], ['Shipping', o.shipping], ...(o.codFee ? [['COD fee', o.codFee]] : [])].map(([k, v]) => <div key={k} className="flex justify-between"><dt>{k}{k === 'Discount' && o.couponCode ? ` (${o.couponCode})` : ''}</dt><dd>{v < 0 ? '−' : ''}{v === 0 && k === 'Shipping' ? 'Free' : inr(Math.abs(v))}</dd></div>)}
        <div className="flex justify-between border-t border-ink pt-3 text-base font-medium"><dt>Total</dt><dd>{inr(o.total)}</dd></div></dl></section>
        <section className="border border-sand p-6"><h3 className="text-xl">Shipping address</h3><div className="mt-3"><AddressBlock a={o.address}/></div></section>
        <section className="border border-sand p-6 text-sm"><h3 className="text-xl">Payment &amp; delivery</h3><p className="mt-3">{o.paymentMethod} · <span className="text-ink/60">{o.paymentStatus}</span></p><p className="text-ink/60">{o.delivery.label}</p></section>
        <div className="flex flex-col gap-3">{['Confirmed', 'Processing'].includes(o.status) && <button onClick={() => setAsk(true)} className="btn-line">Cancel order</button>}<button onClick={again} className="btn-dark">Buy again</button></div></aside></div>
    <Modal open={ask} onClose={() => setAsk(false)} title="Cancel this order?"><p className="text-sm text-ink/70">Order {o.id} will be cancelled{o.paymentStatus === 'Paid' ? ' and your payment refunded' : ''}. This can't be undone.</p><div className="mt-6 flex gap-3"><button onClick={cancel} className="btn-dark">Yes, cancel order</button><button onClick={() => setAsk(false)} className="btn-line">Keep order</button></div></Modal></div>)
}
