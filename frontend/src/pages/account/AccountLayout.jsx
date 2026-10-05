import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { User, Package, MapPin, ShieldCheck, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '../../context/Auth'
import { Avatar } from '../../components/ui'
const links = [['Overview', '/account', LayoutDashboard, true], ['Profile', '/account/profile', User], ['Orders', '/account/orders', Package], ['Addresses', '/account/addresses', MapPin], ['Security', '/account/security', ShieldCheck]]
export default function AccountLayout() {
  const { user, logout, isAdmin } = useAuth(), go = useNavigate()
  return (<div className="wrap grid gap-10 py-12 lg:grid-cols-[250px_1fr]">
    <aside><div className="flex items-center gap-3 border-b border-sand pb-5"><Avatar user={user} size={48}/><div className="min-w-0"><p className="truncate font-serif text-xl leading-tight">{user.name}</p><p className="truncate text-xs text-ink/50">{user.email}</p></div></div>
      <nav className="-mx-5 mt-3 flex gap-1 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:px-0" aria-label="Account">{links.map(([l, to, Icon, end]) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-3 px-3 py-3 text-sm transition ${isActive ? 'bg-cream text-rose' : 'hover:bg-cream/60'}`}><Icon size={16}/>{l}</NavLink>)}
        {isAdmin && <Link to="/admin" className="flex shrink-0 items-center gap-3 px-3 py-3 text-sm hover:bg-cream/60">Admin dashboard</Link>}
        <button onClick={() => { logout(); go('/') }} className="flex shrink-0 items-center gap-3 px-3 py-3 text-left text-sm text-ink/60 hover:bg-cream/60"><LogOut size={16}/>Sign out</button></nav></aside>
    <section className="min-w-0"><Outlet/></section></div>)
}
