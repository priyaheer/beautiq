import { useState } from 'react'
import { Link } from 'react-router-dom'
import { slug as slugify } from '../lib/format'
import { useProducts } from '../hooks/useProducts'
export default function Brands() {
  const [q, setQ] = useState(''), { products: catalog, error } = useProducts()
  const list = catalog ? [...new Set(catalog.map(product => product.brand))].map(name => ({ name, slug: slugify(name), count: catalog.filter(product => product.brand === name).length })) : null
  const shown = (list || []).filter(b => b.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name))
  const letters = [...new Set(shown.map(b => b.name[0].toUpperCase()))]
  return (<div className="wrap py-12"><h1 className="text-5xl">Brands</h1>
    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search brands" className="mt-6 w-full max-w-md border-b border-ink bg-transparent py-2 outline-none"/>
    {!list ? error ? <p role="alert" className="mt-10 text-rose">Products could not be loaded. Please try again later.</p> : <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse bg-cream"/>)}</div>
      : !shown.length ? <p className="mt-16 text-center text-ink/60">No brands match “{q}”.</p>
      : letters.map(l => <section key={l} className="mt-10"><h2 className="border-b border-sand pb-2 text-3xl">{l}</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">{shown.filter(b => b.name[0].toUpperCase() === l).map(b => <Link key={b.slug} to={`/brands/${b.slug}`} className="border border-sand p-6 transition hover:border-ink"><p className="font-serif text-xl">{b.name}</p><p className="text-xs text-ink/50">{b.count} products</p></Link>)}</div></section>)}
  </div>)
}
