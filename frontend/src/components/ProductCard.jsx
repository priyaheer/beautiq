import { Link } from 'react-router-dom'
import { Heart, Star, Eye, GitCompare } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '../context/Store'
import { ProductImage } from './ui'
export const Rating = ({ value, count }) => <span className="inline-flex items-center gap-1 text-xs"><Star size={12} className="fill-nude text-nude"/>{value}{count!=null&&<span className="text-ink/50">({count})</span>}</span>
export const Price = ({ p }) => <span className="text-sm"><b className="font-medium">₹{p.price.toLocaleString('en-IN')}</b>{p.discount>0&&<><s className="ml-2 text-ink/40">₹{p.originalPrice.toLocaleString('en-IN')}</s><span className="ml-2 text-rose">{p.discount}% off</span></>}</span>
export default function ProductCard({ p }) {
  const { wish, toggleWish, addToCart, setQuick, compare, toggleCompare } = useStore(), on = wish.includes(p.id)
  const badge = p.bestseller ? 'Bestseller' : p.newArrival ? 'New' : p.trending ? 'Trending' : null
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group">
<div className="relative aspect-[4/5] overflow-hidden bg-sand">
  <ProductImage p={p} className="h-full w-full object-cover"/>        <Link to={`/product/${p.id}`} className="absolute inset-0 grid place-items-center">
          <span className="px-4 text-center font-serif text-3xl text-ink/30 transition duration-500 group-hover:scale-110">{p.brand}</span></Link>
        {badge && <span className="absolute left-3 top-3 bg-ivory px-2 py-1 text-[10px] uppercase tracking-widest">{badge}</span>}
        <button aria-label="Wishlist" onClick={() => toggleWish(p)} className="absolute right-3 top-3 rounded-full bg-ivory/90 p-2"><Heart size={16} className={on ? 'fill-rose text-rose' : ''}/></button>
        <div className="absolute right-3 top-14 flex flex-col gap-2 opacity-0 transition group-hover:opacity-100 max-md:opacity-100">
          <button aria-label="Quick view" onClick={() => setQuick(p)} className="rounded-full bg-ivory/90 p-2"><Eye size={16}/></button>
          <button aria-label="Compare" onClick={() => toggleCompare(p)} className={`rounded-full p-2 ${compare.includes(p.id) ? 'bg-ink text-ivory' : 'bg-ivory/90'}`}><GitCompare size={16}/></button></div>
        <button disabled={!p.stock} onClick={() => addToCart(p, p.shades[0]?.name ?? null)} className="absolute inset-x-0 bottom-0 translate-y-full bg-ink py-3 text-xs uppercase tracking-widest text-ivory transition group-hover:translate-y-0 disabled:bg-ink/50">{p.stock ? 'Add to Bag' : 'Sold out'}</button>
      </div>
      <div className="mt-3 space-y-1"><p className="text-[11px] uppercase tracking-widest text-ink/50">{p.brand}</p>
        <Link to={`/product/${p.id}`} className="block font-serif text-lg leading-tight">{p.name}</Link><Rating value={p.rating} count={p.reviews}/><div><Price p={p}/></div></div>
    </motion.div>)
}
