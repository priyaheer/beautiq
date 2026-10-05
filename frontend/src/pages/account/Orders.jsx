import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/Auth'
import { getOrdersByUser, ORDER_STATUSES } from '../../services/orderService'
import { StatusBadge, Thumb } from '../../components/ui'
import { OrderSkeleton } from '../../components/Skeleton'
import { inr, fmtDate } from '../../lib/format'
export default function Orders() {
  const { user } = useAuth(), [orders, setOrders] = useState(null), [f, setF] = useState('All')
  useEffect(() => { getOrdersByUser(user.id, user.email).then(setOrders) }, [user.id])
  const shown = (orders || []).filter(o => f === 'All' || o.status === f)
  return (<div><h1 className="text-4xl">My orders</h1>
    <div className="mt-6 flex gap-2 overflow-x-auto pb-1">{['All', ...ORDER_STATUSES].map(s => <button key={s} onClick={() => setF(s)} className={`shrink-0 border px-4 py-2 text-xs uppercase tracking-widest ${f === s ? 'border-ink bg-ink text-ivory' : 'border-sand'}`}>{s}</button>)}</div>
    <div className="mt-6">{!orders ? <OrderSkeleton/> : !shown.length ? <div className="border border-dashed border-sand p-12 text-center"><p className="font-serif text-2xl">{orders.length ? `No ${f.toLowerCase()} orders` : 'No orders yet'}</p><p className="mt-1 text-sm text-ink/60">{orders.length ? 'Try another status.' : 'Your orders will appear here once you place one.'}</p>{!orders.length && <Link to="/new-arrivals" className="btn-dark mt-5">Start shopping</Link>}</div>
      : <ul className="space-y-4">{shown.map(o => <li key={o.id} className="border border-sand"><div className="flex flex-wrap items-center justify-between gap-3 bg-cream/60 px-5 py-3 text-sm"><div><p className="font-medium">{o.id}</p><p className="text-xs text-ink/50">Placed {fmtDate(o.date)}</p></div><StatusBadge status={o.status}/><b className="font-medium">{inr(o.total)}</b></div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5"><div className="flex gap-2">{o.items.slice(0, 4).map(i => <Thumb key={i.productId} p={{ name: i.name, images: i.images, thumbnail: i.thumbnail }} className="h-16 w-14"/>)}{o.items.length > 4 && <span className="grid h-16 w-14 place-items-center bg-cream text-xs">+{o.items.length - 4}</span>}</div>
          <p className="min-w-0 flex-1 text-sm text-ink/70">{o.items.map(i => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ''}`).join(', ')}</p><Link to={`/account/orders/${o.id}`} className="btn-line !py-2.5">View details</Link></div></li>)}</ul>}</div></div>)
}
