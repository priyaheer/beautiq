import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { listAllOrders, getOrderById, updateOrderStatus, ORDER_STATUSES } from '../../services/orderService'
import { useStore } from '../../context/Store'
import OrderTimeline from '../../components/OrderTimeline'
import { StatusBadge, ProductImage } from '../../components/ui'
import { AddressBlock } from '../../components/AddressForm'
import { inr, fmtDate } from '../../lib/format'
function OrderRow({ o }) { return <tr className="hover:bg-cream/40"><td className="py-3 font-mono text-xs">{o.id}</td><td className="py-3">{o.customerName}</td><td className="py-3 text-xs text-ink/60">{fmtDate(o.date)}</td><td className="py-3">{inr(o.total)}</td><td className="py-3">{o.paymentMethod}</td><td className="py-3"><StatusBadge status={o.status}/></td><td className="py-3"><Link to={`/admin/orders/${o.id}`} className="text-xs underline">View</Link></td></tr> }
function OrderDetailView() {
  const { id } = useParams(), [o, setO] = useState(undefined), { notify } = useStore(), [busy, setBusy] = useState(false)
  useEffect(() => { getOrderById(id).then(setO) }, [id])
  const change = async s => { setBusy(true); const updated = await updateOrderStatus(o.id, s); setO(updated); notify(`Status updated to ${s}`); setBusy(false) }
  if (!o) return <div className="py-20 text-center"><h1 className="text-4xl">Order not found</h1></div>
  const next = ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].find(s => { const idx = ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].indexOf(o.status); return ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].indexOf(s) > idx })
  return (<div><Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-ink/60 hover:text-ink"><ChevronLeft size={14}/>All orders</Link>
    <div className="mt-3 flex flex-wrap items-center gap-4"><h1 className="text-3xl">Order {o.id}</h1><StatusBadge status={o.status}/></div><p className="mt-1 text-sm text-ink/60">{o.customerName} · {fmtDate(o.date)} · {inr(o.total)}</p>
    <div className="mt-6 flex flex-wrap gap-3">{next && <button disabled={busy} onClick={() => change(next)} className="btn-dark">Mark as {next}</button>}{!['Cancelled', 'Delivered'].includes(o.status) && <button disabled={busy} onClick={() => change('Cancelled')} className="btn-line">Cancel order</button>}</div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]"><div className="space-y-6">
      <div className="border border-sand p-5"><h2 className="text-xl">Tracking</h2><div className="mt-4"><OrderTimeline order={o}/></div></div>
      <div className="border border-sand p-5"><h2 className="text-xl">Items</h2><ul className="mt-3 divide-y divide-sand">{o.items.map(i => <li key={i.productId + i.shade} className="flex gap-4 py-3 text-sm"><ProductImage p={i} className="h-16 w-14 shrink-0 object-cover"/><div className="flex-1"><p className="font-medium">{i.name}</p><p className="text-xs text-ink/60">{i.brand}{i.shade && ` · ${i.shade}`} · Qty {i.qty}</p></div><b>{inr(i.price * i.qty)}</b></li>)}</ul></div></div>
      <div className="space-y-4"><div className="bg-cream p-5 text-sm"><h2 className="text-xl mb-3">Summary</h2><dl className="space-y-1">{[['Subtotal', o.subtotal], ['Discount', -o.discount], ['Shipping', o.shipping], ...(o.codFee ? [['COD fee', o.codFee]] : [])].map(([k, v]) => <div key={k} className="flex justify-between"><dt>{k}</dt><dd>{v < 0 ? '−' : ''}{inr(Math.abs(v))}</dd></div>)}<div className="flex justify-between border-t border-ink pt-2 font-medium"><dt>Total</dt><dd>{inr(o.total)}</dd></div></dl></div>
        <div className="border border-sand p-5"><h2 className="text-xl mb-3">Shipping</h2><AddressBlock a={o.address}/></div>
        <div className="border border-sand p-5 text-sm"><h2 className="text-xl mb-3">Payment</h2><p>{o.paymentMethod} · <span className="text-ink/60">{o.paymentStatus}</span></p></div></div></div></div>)
}
function OrderList() {
  const [orders, setOrders] = useState([]), [f, setF] = useState('All')
  useEffect(() => { listAllOrders().then(setOrders) }, [])
  const shown = useMemo(() => orders.filter(o => f === 'All' || o.status === f), [orders, f])
  return (<div><h1 className="text-4xl">Orders</h1><div className="mt-5 flex gap-2 overflow-x-auto pb-1">{['All', ...ORDER_STATUSES].map(s => <button key={s} onClick={() => setF(s)} className={`shrink-0 border px-4 py-2 text-xs ${f === s ? 'border-ink bg-ink text-ivory' : 'border-sand'}`}>{s}</button>)}</div>
    <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="text-xs uppercase tracking-widest text-ink/50"><tr>{['Order', 'Customer', 'Date', 'Total', 'Payment', 'Status', ''].map(h => <th key={h} className="border-b border-sand pb-2 text-left">{h}</th>)}</tr></thead><tbody className="divide-y divide-sand">{shown.map(o => <OrderRow key={o.id} o={o}/>)}</tbody></table><p className="mt-3 text-xs text-ink/50">{shown.length} orders</p></div></div>)
}
export default function AdminOrders() { const { id } = useParams(); return id ? <OrderDetailView/> : <OrderList/> }
export { OrderDetailView }
