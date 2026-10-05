import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/Auth'
import { useStore } from '../../context/Store'
import { getOrdersByUser } from '../../services/orderService'
import { useProducts } from '../../hooks/useProducts'
import { StatusBadge } from '../../components/ui'
import ProductCard from '../../components/ProductCard'
import { AccountSkeleton } from '../../components/Skeleton'
import { inr, fmtDate } from '../../lib/format'
export default function Dashboard() {
  const { user } = useAuth(), { wish, recent } = useStore(), [orders, setOrders] = useState(null), { products: catalog } = useProducts()
  const products = catalog || []
  useEffect(() => { getOrdersByUser(user.id, user.email).then(setOrders) }, [user.id])
  if (!orders) return <AccountSkeleton/>
  const seen = recent.map(i => products.find(p => String(p.id) === String(i))).filter(Boolean).slice(0, 4), def = user.addresses.find(a => a.isDefault) || user.addresses[0]
  const Stat = ({ n, l, to }) => <Link to={to} className="border border-sand p-5 transition hover:border-ink"><p className="font-serif text-4xl">{n}</p><p className="mt-1 text-xs uppercase tracking-widest text-ink/50">{l}</p></Link>
  return (<div><p className="text-xs uppercase tracking-[.3em] text-rose">My account</p><h1 className="mt-2 text-4xl md:text-5xl">Welcome back, {user.name.split(' ')[0]}</h1>
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4"><Stat n={orders.length} l="Orders" to="/account/orders"/><Stat n={wish.length} l="Wishlist" to="/wishlist"/><Stat n={user.addresses.length} l="Saved addresses" to="/account/addresses"/><Stat n={seen.length} l="Recently viewed" to="#recent"/></div>
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
      <div><div className="flex items-end justify-between"><h2 className="text-2xl">Recent orders</h2><Link to="/account/orders" className="text-xs uppercase tracking-widest underline">View all</Link></div>
        {!orders.length ? <div className="mt-4 border border-dashed border-sand p-10 text-center"><p className="font-serif text-2xl">No orders yet</p><p className="mt-1 text-sm text-ink/60">When you place an order, it will show up here.</p><Link to="/new-arrivals" className="btn-dark mt-5">Start shopping</Link></div>
        : <ul className="mt-4 divide-y divide-sand border-y border-sand">{orders.slice(0, 3).map(o => <li key={o.id}><Link to={`/account/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4 transition hover:bg-cream/50"><div><p className="font-medium">{o.id}</p><p className="text-xs text-ink/50">{fmtDate(o.date)} · {o.items.length} {o.items.length > 1 ? 'items' : 'item'}</p></div><StatusBadge status={o.status}/><b className="font-medium">{inr(o.total)}</b></Link></li>)}</ul>}</div>
      <div><h2 className="text-2xl">Profile</h2><div className="mt-4 space-y-1 bg-cream p-5 text-sm"><p className="font-medium">{user.name}</p><p>{user.email}</p><p>{user.phone || 'No phone added'}</p><Link to="/account/profile" className="mt-2 inline-block text-xs uppercase tracking-widest underline">Edit profile</Link></div>
        <h2 className="mt-8 text-2xl">Default address</h2><div className="mt-4 bg-cream p-5 text-sm">{def ? <><p className="font-medium">{def.name}</p><p className="text-ink/70">{def.line1}, {def.city} {def.pincode}</p></> : <p className="text-ink/60">No address saved yet.</p>}<Link to="/account/addresses" className="mt-2 inline-block text-xs uppercase tracking-widest underline">{def ? 'Manage addresses' : 'Add an address'}</Link></div></div></div>
    <div id="recent" className="mt-12"><h2 className="text-2xl">Recently viewed</h2>{seen.length ? <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-4">{seen.map(p => <ProductCard key={p.id} p={p}/>)}</div> : <p className="mt-3 text-sm text-ink/60">Products you view will appear here.</p>}</div></div>)
}
