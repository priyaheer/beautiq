import { Link } from 'react-router-dom'
import { X, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../context/Store'
import { ProductImage } from './ui'
import { useProducts } from '../hooks/useProducts'
export default function CartDrawer() {
  const { drawer, setDrawer, cart, setQty, removeItem } = useStore()
  const { products: catalog, error } = useProducts()
  const products = catalog || []
  const items = cart.map(c => ({ ...c, p: products.find(x => String(x.id) === String(c.id)) })).filter(i => i.p), sub = items.reduce((a, i) => a + i.p.price * i.qty, 0)
  return (<AnimatePresence>{drawer && <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-ink/40" onClick={() => setDrawer(false)}/>
    <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: .3 }} className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-ivory">
      <div className="flex items-center justify-between border-b border-sand p-5"><h2 className="text-2xl">Your Bag ({items.length})</h2><button onClick={() => setDrawer(false)} aria-label="Close"><X/></button></div>
      <div className="flex-1 space-y-5 overflow-auto p-5">{!items.length ? <p className={`py-20 text-center ${error ? 'text-rose' : 'text-ink/60'}`}>{error && cart.length ? 'Your bag could not be loaded.' : cart.length ? 'Loading your bag…' : 'Your bag is empty.'}</p> : items.map(({ p, shade, qty }) => <div key={p.id + shade} className="flex gap-3">
        <ProductImage p={p} className="h-20 w-16 shrink-0 object-cover"/><div className="flex-1 text-sm"><p className="font-serif text-lg leading-tight">{p.name}</p><p className="text-xs text-ink/50">{p.brand}{shade && ` · ${shade}`}</p>
          <div className="mt-2 flex items-center gap-2"><button className="border border-sand px-2" onClick={() => setQty(p.id, shade, qty - 1)}>−</button>{qty}<button className="border border-sand px-2" onClick={() => setQty(p.id, shade, qty + 1)}>+</button></div></div>
        <div className="flex flex-col items-end justify-between text-sm"><b className="font-medium">₹{(p.price * qty).toLocaleString('en-IN')}</b><button onClick={() => removeItem(p.id, shade)} aria-label="Remove"><Trash2 size={15}/></button></div></div>)}</div>
      <div className="border-t border-sand p-5"><div className="mb-4 flex justify-between"><span>Subtotal</span><b className="font-medium">₹{sub.toLocaleString('en-IN')}</b></div>
        <Link to="/checkout" onClick={() => setDrawer(false)} className={`btn-dark w-full ${items.length ? '' : 'pointer-events-none opacity-40'}`}>Checkout</Link><Link to="/cart" onClick={() => setDrawer(false)} className="mt-2 block text-center text-xs uppercase tracking-widest underline">View bag</Link></div>
    </motion.aside></>}</AnimatePresence>)
}
