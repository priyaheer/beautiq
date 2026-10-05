import { Link } from 'react-router-dom'
import { useStore } from '../context/Store'
import { ProductImage } from '../components/ui'
import { useProducts } from '../hooks/useProducts'
export default function Compare() {
  const { compare, toggleCompare, addToCart } = useStore(), { products: catalog } = useProducts(), products = catalog || [], list = compare.map(id => products.find(p => String(p.id) === String(id))).filter(Boolean)
  if (!list.length) return <div className="py-32 text-center"><h1 className="text-5xl">Nothing to compare</h1><p className="mt-3 text-ink/60">Tap the compare icon on any product.</p><Link to="/skincare" className="btn-dark mt-8">Browse skincare</Link></div>
  const rows = [['Brand', p => p.brand], ['Price', p => `₹${p.price.toLocaleString('en-IN')}`], ['Rating', p => `${p.rating} (${p.reviews})`], ['Benefits', p => p.benefits.join(', ')], ['Ingredients', p => p.ingredients.join(', ')], ['Skin type', p => p.skinTypes.join(', ')], ['Concerns', p => p.concerns.join(', ')], ['Sizes', p => p.size.join(', ')]]
  return (<div className="wrap py-12"><h1 className="text-5xl">Compare</h1><div className="mt-8 overflow-x-auto"><table className="w-full min-w-[640px] border-collapse text-sm">
    <thead><tr><th className="w-32"/>{list.map(p => <th key={p.id} className="p-3 text-left align-top"><div className="aspect-square max-w-[160px]"><ProductImage p={p} className="h-full w-full object-cover"/></div><Link to={`/product/${p.id}`} className="mt-2 block font-serif text-lg font-medium">{p.name}</Link>
      <button onClick={() => toggleCompare(p)} className="text-xs underline">Remove</button></th>)}</tr></thead>
    <tbody>{rows.map(([l, f]) => <tr key={l} className="border-t border-sand"><td className="p-3 text-xs uppercase tracking-widest text-ink/50">{l}</td>{list.map(p => <td key={p.id} className="p-3">{f(p)}</td>)}</tr>)}
      <tr className="border-t border-sand"><td/>{list.map(p => <td key={p.id} className="p-3"><button onClick={() => addToCart(p, p.shades[0]?.name ?? null)} className="btn-dark !px-4 !py-2">Add to Bag</button></td>)}</tr></tbody></table></div></div>)
}
