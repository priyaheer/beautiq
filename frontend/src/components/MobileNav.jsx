import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, ChevronDown, Search, Heart, User, GitCompare, Package } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { getCategories, categoryPath, subPath } from '../services/categoryService'
import { useStore } from '../context/Store'
import { useAuth } from '../context/Auth'
import { Avatar } from './ui'

export default function MobileNav({ open, onClose, onSearch }) {
  const [exp, setExp] = useState(null), { wish, compare } = useStore(), { user, logout, isAdmin } = useAuth()
  const L = ({ to, children, cls = '' }) => <Link to={to} onClick={onClose} className={`block py-3 ${cls}`}>{children}</Link>
  return (<AnimatePresence>{open && <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-ink/40" onClick={onClose}/>
    <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: .28 }} className="fixed inset-y-0 left-0 z-50 flex w-[88%] max-w-sm flex-col bg-ivory shadow-2xl" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="flex items-center justify-between border-b border-sand p-5"><span className="font-serif text-2xl tracking-[.2em]">BEAUTIQ</span><button onClick={onClose} aria-label="Close menu"><X/></button></div>
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <button onClick={() => { onClose(); onSearch() }} className="mt-5 flex w-full items-center gap-3 border border-sand px-4 py-3 text-sm text-ink/60"><Search size={16}/>Search products, brands</button>
        <nav className="mt-3 divide-y divide-sand/70 font-serif text-2xl">
          <L to="/new-arrivals">New &amp; Trending</L>
          {getCategories().map(c => <div key={c.slug}><div className="flex items-center justify-between"><L to={categoryPath(c.slug)} cls="flex-1">{c.name}</L>
            <button aria-label={`Show ${c.name} categories`} aria-expanded={exp === c.slug} onClick={() => setExp(exp === c.slug ? null : c.slug)} className="p-3"><ChevronDown size={20} className={`transition ${exp === c.slug ? 'rotate-180' : ''}`}/></button></div>
            <AnimatePresence initial={false}>{exp === c.slug && <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-3 pl-3 font-sans text-sm">
              {c.subcategories.map(s => <li key={s.name}><Link to={subPath(c.slug, s.name)} onClick={onClose} className="block py-2 text-ink/70">{s.name}</Link></li>)}
              <li><Link to={categoryPath(c.slug)} onClick={onClose} className="block py-2 text-xs uppercase tracking-widest text-rose">Shop all {c.name}</Link></li></motion.ul>}</AnimatePresence></div>)}
          <L to="/best-sellers">Best Sellers</L><L to="/brands">Brands</L><L to="/beauty-edit">Beauty Edit</L><L to="/beauty-finder">Beauty Finder</L>
        </nav>
        <div className="mt-6 space-y-1 border-t border-sand pt-5 text-sm">
          {user ? <div className="mb-3 flex items-center gap-3"><Avatar user={user} size={40}/><div><p className="font-medium">{user.name}</p><p className="text-xs text-ink/50">{user.email}</p></div></div> : <div className="mb-3 flex gap-2"><Link to="/login" onClick={onClose} className="btn-dark flex-1 !px-4">Sign in</Link><Link to="/register" onClick={onClose} className="btn-line flex-1 !px-4">Register</Link></div>}
          <L to="/wishlist"><span className="flex items-center gap-3"><Heart size={16}/>Wishlist{wish.length > 0 && <i className="not-italic text-rose">({wish.length})</i>}</span></L>
          <L to="/compare"><span className="flex items-center gap-3"><GitCompare size={16}/>Compare{compare.length > 0 && <i className="not-italic text-rose">({compare.length})</i>}</span></L>
          {user && <><L to="/account"><span className="flex items-center gap-3"><User size={16}/>My account</span></L><L to="/account/orders"><span className="flex items-center gap-3"><Package size={16}/>My orders</span></L>
            {isAdmin && <L to="/admin">Admin dashboard</L>}<button onClick={() => { logout(); onClose() }} className="py-3 text-ink/60">Sign out</button></>}
        </div></div></motion.aside></>}</AnimatePresence>)
}
