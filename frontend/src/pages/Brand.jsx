import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { slug } from '../lib/format'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../hooks/useProducts'
const Grid = ({ title, items }) => items.length ? <section className="mt-16"><h2 className="text-3xl">{title}</h2><div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">{items.map(p => <ProductCard key={p.id} p={p}/>)}</div></section> : null
export default function Brand() {
  const { slug: brandSlug } = useParams(), [cat, setCat] = useState('all'), { products, error } = useProducts()
  if (!products) return <div className="wrap py-20">{error ? <p role="alert" className="text-rose">Products could not be loaded. Please try again later.</p> : <div className="h-64 animate-pulse bg-cream"/>}</div>
  const brandProducts = products.filter(product => slug(product.brand) === brandSlug)
  if (!brandProducts.length) return <div className="py-32 text-center"><h1 className="text-5xl">Brand not found</h1><Link to="/brands" className="btn-dark mt-8">All brands</Link></div>
  const brandName = brandProducts[0].brand
  const cats = [...new Set(brandProducts.map(p => p.category))], all = cat === 'all' ? brandProducts : brandProducts.filter(p => p.category === cat)
  return (<div><section className="bg-cream py-20 text-center"><p className="text-xs uppercase tracking-[.3em] text-rose">Brand</p><h1 className="mt-3 text-6xl">{brandName}</h1>
    <p className="mx-auto mt-4 max-w-xl text-ink/70">{brandName} brings considered formulas and a distinctive point of view to BEAUTIQ — {brandProducts.length} products across {cats.join(', ')}.</p></section>
    <div className="wrap pb-10">
      <Grid title="Best sellers" items={brandProducts.filter(p => p.bestseller)}/><Grid title="New arrivals" items={brandProducts.filter(p => p.newArrival)}/>
      <section className="mt-16"><h2 className="text-3xl">All products</h2><div className="mt-4 flex flex-wrap gap-2">{['all', ...cats].map(c => <button key={c} onClick={() => setCat(c)} className={`border px-4 py-2 text-xs uppercase tracking-widest ${cat === c ? 'border-ink bg-ink text-ivory' : 'border-sand'}`}>{c}</button>)}</div>
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">{all.map(p => <ProductCard key={p.id} p={p}/>)}</div></section></div></div>)
}
