import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Layers, Star, Ticket, ChevronRight } from 'lucide-react'
const links = [['Dashboard', '/admin', LayoutDashboard, true], ['Products', '/admin/products', Package], ['Orders', '/admin/orders', ShoppingBag], ['Users', '/admin/users', Users],
  ['Brands', '/admin/brands', Tag], ['Categories', '/admin/categories', Layers], ['Reviews', '/admin/reviews', Star], ['Coupons', '/admin/coupons', Ticket]]
export default function AdminLayout() {
  return (<div className="flex min-h-[calc(100vh-7rem)]"><aside className="w-56 shrink-0 border-r border-sand bg-cream/40 py-8 pr-0 pl-4 hidden md:block"><p className="px-3 mb-4 text-[10px] uppercase tracking-[.3em] text-ink/40">Admin</p>
    <nav>{links.map(([l, to, I, end]) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 text-sm transition ${isActive ? 'bg-ink text-ivory' : 'hover:bg-sand/40'}`}><I size={15}/>{l}</NavLink>)}</nav></aside>
    <main className="flex-1 min-w-0 overflow-x-auto p-6 md:p-8"><Outlet/></main></div>)
}
