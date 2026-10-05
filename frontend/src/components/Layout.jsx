import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingBag, Menu, GitCompare, User } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../context/Store'
import { useAuth } from '../context/Auth'
import QuickView from './QuickView'
import CartDrawer from './CartDrawer'
import Newsletter from './Newsletter'
import MegaMenu from './MegaMenu'
import MobileNav from './MobileNav'
import SearchOverlay from './SearchOverlay'
import { Avatar } from './ui'
const nav = [['New & Trending', '/new-arrivals'], ['Makeup', '/makeup', 'makeup'], ['Skincare', '/skincare', 'skincare'], ['Haircare', '/haircare', 'haircare'], ['Fragrance', '/fragrance', 'fragrance'], ['Best Sellers', '/best-sellers'], ['Brands', '/brands'], ['Beauty Edit', '/beauty-edit'], ['Beauty Finder', '/beauty-finder']]
const noNewsletter = /^\/(login|register|verify-email|forgot-password|reset-password|checkout|order-success|admin|account)/

export default function Layout() {
  const { cart, wish, toast, setDrawer, compare } = useStore(), { user } = useAuth(), { pathname } = useLocation()
  const [open, setOpen] = useState(false), [find, setFind] = useState(false), [mega, setMega] = useState(null), timer = useRef()
  const count = cart.reduce((a, c) => a + c.qty, 0)
  useEffect(() => { setMega(null); setOpen(false); if (!/^\/product\//.test(pathname)) window.scrollTo(0, 0) }, [pathname])
  useEffect(() => { const k = e => { if (e.key === 'Escape') setMega(null); if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setFind(true) } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [])
  const show = s => { clearTimeout(timer.current); timer.current = setTimeout(() => setMega(s), mega ? 0 : 90) }
  const hide = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setMega(null), 140) }
  return (<>
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[70] focus:bg-ink focus:p-3 focus:text-ivory">Skip to content</a>
    <div className="bg-ink px-3 py-2 text-center text-[11px] uppercase tracking-[.2em] text-ivory">Complimentary shipping over ₹1,999 · Use BEAUTIQ10</div>
    <header className="sticky top-0 z-40 border-b border-sand bg-ivory/95 backdrop-blur" onMouseLeave={hide}>
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <button className="xl:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu/></button>
        <Link to="/" className="font-serif text-3xl tracking-[.22em]">BEAUTIQ</Link>
        <nav className="hidden gap-5 text-[11px] uppercase tracking-[.14em] xl:flex 2xl:gap-7 2xl:text-xs" aria-label="Main">{nav.map(([l, t, m]) => <NavLink key={t} to={t} onMouseEnter={() => m ? show(m) : hide()} onFocus={() => m ? show(m) : setMega(null)}
          className={({ isActive }) => `relative py-5 transition ${isActive || mega === m ? 'text-rose' : 'hover:text-rose'}`}>{l}{mega === m && m && <motion.i layoutId="mega-underline" className="absolute inset-x-0 bottom-3 h-px bg-rose"/>}</NavLink>)}</nav>
        <div className="flex items-center gap-4"><button onClick={() => setFind(true)} aria-label="Search"><Search size={19}/></button>
          <Link to="/wishlist" aria-label="Wishlist" className="relative hidden sm:block"><Heart size={19}/>{wish.length > 0 && <i className="absolute -right-2 -top-2 text-[10px] not-italic text-rose">{wish.length}</i>}</Link>
          <Link to={user ? '/account' : '/login'} aria-label={user ? 'My account' : 'Sign in'} className="hidden sm:block">{user ? <Avatar user={user} size={24}/> : <User size={19}/>}</Link>
          <Link to="/compare" aria-label="Compare" className="relative hidden sm:block"><GitCompare size={19}/>{compare.length > 0 && <i className="absolute -right-2 -top-2 text-[10px] not-italic text-rose">{compare.length}</i>}</Link>
          <button onClick={() => setDrawer(true)} aria-label="Bag" className="relative"><ShoppingBag size={19}/>{count > 0 && <i className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-rose text-[10px] not-italic text-white">{count}</i>}</button></div>
      </div>
      <div className="hidden xl:block" onMouseEnter={() => clearTimeout(timer.current)}><AnimatePresence mode="wait">{mega && <MegaMenu key={mega} slug={mega} onNavigate={() => setMega(null)}/>}</AnimatePresence></div>
    </header>
    <AnimatePresence>{mega && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-30 hidden bg-ink/20 xl:block"/>}</AnimatePresence>
    <SearchOverlay open={find} onClose={() => setFind(false)}/>
    <MobileNav open={open} onClose={() => setOpen(false)} onSearch={() => setFind(true)}/>
    <main id="main"><Outlet/></main><QuickView/><CartDrawer/>
    {!noNewsletter.test(pathname) && <Newsletter/>}
    <footer className="bg-ink py-16 text-ivory/80"><div className="wrap grid gap-10 md:grid-cols-4">
      <div><h3 className="font-serif text-3xl tracking-[.25em] text-ivory">BEAUTIQ</h3><p className="mt-3 text-sm">Beauty, curated for you.</p></div>
      {[['Shop', [['Makeup', '/makeup'], ['Skincare', '/skincare'], ['Haircare', '/haircare'], ['Fragrance', '/fragrance'], ['Best Sellers', '/best-sellers']]], ['Discover', [['Beauty Edit', '/beauty-edit'], ['Beauty Finder', '/beauty-finder'], ['Brands', '/brands'], ['Compare', '/compare']]],
        ['Account', [['My account', '/account'], ['Orders', '/account/orders'], ['Addresses', '/account/addresses'], ['Wishlist', '/wishlist']]]].map(([h, l]) => <div key={h}><p className="mb-3 text-xs uppercase tracking-widest text-ivory">{h}</p>{l.map(([x, t]) => <Link key={x} to={t} className="block py-1 text-sm transition hover:text-ivory">{x}</Link>)}</div>)}
    </div><p className="wrap mt-12 text-xs">© 2026 BEAUTIQ · Secure payments via Razorpay, UPI, Cards</p></footer>
    <AnimatePresence>{toast && <motion.div role="status" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="fixed bottom-6 left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 bg-ink px-6 py-3 text-sm text-ivory">{toast}</motion.div>}</AnimatePresence>
  </>)
}
