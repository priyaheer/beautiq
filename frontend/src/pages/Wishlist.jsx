import { Link } from 'react-router-dom'
import { useStore } from '../context/Store'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../hooks/useProducts'
export default function Wishlist() {
  const { wish } = useStore(), { products: catalog } = useProducts(), products = catalog || [], list = products.filter(p => wish.some(id => String(id) === String(p.id)))
  return (<div className="wrap py-12"><h1 className="text-5xl">Wishlist</h1>
    {list.length ? <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">{list.map(p => <ProductCard key={p.id} p={p}/>)}</div>
      : <div className="py-24 text-center"><p className="text-ink/60">Nothing saved yet.</p><Link to="/makeup" className="btn-dark mt-6">Start exploring</Link></div>}</div>)
}
