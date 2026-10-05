import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ShoppingBag, Package, Users, Star, Percent } from 'lucide-react'
import { listAllOrders, ORDER_STATUSES } from '../../services/orderService'
import { listUsers } from '../../services/userService'
import { listAllReviews } from '../../services/reviewService'
import { inr, fmtDate } from '../../lib/format'
import { StatusBadge } from '../../components/ui'
import { useProducts } from '../../hooks/useProducts'
export default function AdminDashboard() {
  const [orders, setOrders] = useState([]), [users, setUsers] = useState([]), [reviews, setReviews] = useState([])
  const { products: catalog } = useProducts()
  const products = catalog || []
  useEffect(() => { listAllOrders().then(setOrders); listUsers().then(setUsers); listAllReviews().then(setReviews) }, [])
  const revenue = useMemo(() => orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0), [orders])
  const pending = useMemo(() => reviews.filter(r => r.status === 'pending').length, [reviews])
  const stats = [[inr(revenue), 'Total revenue', TrendingUp, '/admin/orders'], [orders.length, 'Orders', ShoppingBag, '/admin/orders'], [products.length, 'Products', Package, '/admin/products'], [users.length, 'Customers', Users, '/admin/users'], [reviews.length, 'Reviews', Star, '/admin/reviews'], [pending, 'Pending reviews', Percent, '/admin/reviews']]
  const statusCount = useMemo(() => { const c = {}; ORDER_STATUSES.forEach(s => { c[s] = orders.filter(o => o.status === s).length }); return c }, [orders])
  return (<div><p className="text-xs uppercase tracking-[.3em] text-rose">Admin</p><h1 className="mt-1 text-4xl">Dashboard</h1>
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3"><div className="col-span-2 md:col-span-3 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">{stats.map(([v, l, I, to]) => <Link key={l} to={to} className="border border-sand bg-cream/50 p-4 transition hover:border-ink"><I size={18} className="text-rose"/><p className="mt-2 text-xl font-medium">{v}</p><p className="text-xs text-ink/60">{l}</p></Link>)}</div></div>
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_280px]">
      <div><div className="flex items-center justify-between"><h2 className="text-2xl">Recent orders</h2><Link to="/admin/orders" className="text-xs uppercase tracking-widest underline">View all</Link></div>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[540px] text-sm"><thead className="text-xs uppercase tracking-widest text-ink/50"><tr>{['Order', 'Customer', 'Date', 'Total', 'Status', ''].map(h => <th key={h} className="border-b border-sand pb-2 text-left">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-sand">{orders.slice(0, 8).map(o => <tr key={o.id} className="hover:bg-cream/50"><td className="py-3 font-mono text-xs">{o.id}</td><td className="py-3">{o.customerName}</td><td className="py-3 text-ink/60">{fmtDate(o.date)}</td><td className="py-3 font-medium">{inr(o.total)}</td><td className="py-3"><StatusBadge status={o.status}/></td><td className="py-3"><Link to={`/admin/orders/${o.id}`} className="text-xs underline">View</Link></td></tr>)}</tbody></table></div></div>
      <div><h2 className="text-2xl">Orders by status</h2><ul className="mt-4 space-y-2">{ORDER_STATUSES.map(s => <li key={s} className="flex items-center justify-between border-b border-sand py-2 text-sm"><span>{s}</span><span className="flex items-center gap-2">{statusCount[s] || 0}<StatusBadge status={s}/></span></li>)}</ul></div></div>
    <div className="mt-8"><div className="flex items-center justify-between"><h2 className="text-2xl">Recent reviews to moderate</h2><Link to="/admin/reviews" className="text-xs uppercase tracking-widest underline">Manage</Link></div>
      <ul className="mt-4 space-y-3">{reviews.filter(r => r.status === 'pending').slice(0, 4).map(r => <li key={r.id} className="flex flex-wrap items-center gap-3 border border-sand p-4 text-sm"><p className="flex-1 font-medium">"{r.title}"</p><p className="text-ink/60">{r.productName}</p><StatusBadge status={r.status}/><Link to="/admin/reviews" className="text-xs underline">Review</Link></li>)}{!pending && <li className="py-4 text-sm text-ink/60">No reviews awaiting moderation.</li>}</ul></div></div>)
}
