import { Link } from 'react-router-dom'
import { slug as slugify } from '../lib/format'
import ProductCard from '../components/ProductCard'
import { articles } from '../data/articles'
import { Art } from '../components/ui'
import { fmtDate } from '../lib/format'
import { useProducts } from '../hooks/useProducts'
const cats = [['Makeup', '/makeup', 20], ['Skincare', '/skincare', 28], ['Haircare', '/haircare', 40], ['Fragrance', '/fragrance', 12]]
export default function Home() {
  const { products: loadedProducts, error } = useProducts()
  const products = loadedProducts || []
  const brands = [...new Set(products.map(product => product.brand))]
  return (<>
    <section className="bg-cream"><div className="wrap grid items-center gap-10 py-16 md:grid-cols-2 md:py-28">
      <div><p className="text-xs uppercase tracking-[.3em] text-rose">The Autumn Edit</p>
        <h1 className="mt-4 text-5xl leading-[1.05] md:text-7xl">Beauty,<br/><i>curated</i> for you.</h1>
        <p className="mt-6 max-w-md text-ink/70">Over 20 considered houses of makeup, skincare, haircare and fragrance — chosen for formula, finish and ritual.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link to="/new-arrivals" className="btn-dark">Shop New Arrivals</Link><Link to="/beauty-finder" className="btn-line">Discover Beauty Finder</Link></div></div>
      <div className="aspect-[4/5] md:aspect-square" style={{ background: 'linear-gradient(150deg,#E4D6C3,#C99A8B 70%,#A8665A)' }}/>
    </div></section>
    <section className="wrap mt-20"><h2 className="text-4xl">Shop by category</h2>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">{cats.map(([n, t, h]) => <Link key={n} to={t} className="flex aspect-[3/4] items-end p-5 transition hover:-translate-y-1" style={{ background: `hsl(${h} 35% 78%)` }}><span className="font-serif text-3xl">{n}</span></Link>)}</div></section>
    <section className="wrap mt-24"><div className="flex items-end justify-between"><h2 className="text-4xl">Trending now</h2><Link to="/new-arrivals" className="text-xs uppercase tracking-widest underline">View all</Link></div>
      {error ? <p role="alert" className="mt-8 text-sm text-rose">Products could not be loaded. Please try again later.</p> : <div className="mt-8 flex snap-x gap-5 overflow-x-auto pb-4">{products.filter(p => p.trending).slice(0, 8).map(p => <div key={p.id} className="w-64 shrink-0 snap-start"><ProductCard p={p}/></div>)}</div>}</section>
    <section className="mt-24 bg-cream py-16"><div className="wrap"><h2 className="text-4xl">Shop by brand</h2>
      <div className="mt-8 grid grid-cols-2 gap-px bg-sand sm:grid-cols-4 lg:grid-cols-6">{brands.map(b => <Link key={b} to={`/brands/${slugify(b)}`} className="bg-ivory py-8 text-center font-serif text-lg transition hover:bg-ink hover:text-ivory">{b}</Link>)}</div></div></section>
    <section className="wrap mt-24"><h2 className="text-4xl">Best sellers</h2>
      <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">{products.filter(p => p.bestseller).slice(0, 8).map(p => <ProductCard key={p.id} p={p}/>)}</div></section>
    <section className="wrap mt-24"><div className="flex items-end justify-between"><h2 className="text-4xl">From the Beauty Edit</h2><Link to="/beauty-edit" className="text-xs uppercase tracking-widest underline">Read all</Link></div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">{articles.slice(0, 3).map(a => <Link key={a.slug} to={`/beauty-edit/${a.slug}`} className="group block"><div className="overflow-hidden"><Art hue={a.hue} variant={a.title.length} className="aspect-[4/3] transition duration-700 group-hover:scale-105"/></div>
        <p className="mt-3 text-xs text-ink/50">{a.category} · {a.readTime} min read</p><h3 className="mt-1 text-2xl leading-tight group-hover:text-rose">{a.title}</h3><p className="mt-1 text-sm text-ink/60">{a.subtitle}</p><p className="mt-2 text-xs text-ink/40">{fmtDate(a.date)}</p></Link>)}</div></section>
    <section className="mt-24 bg-ink py-20 text-center text-ivory"><h2 className="text-5xl">Your beauty ritual, <i>elevated.</i></h2><p className="mt-4 text-ivory/70">Use code BEAUTIQ10 for 10% off your first order.</p></section>
  </>)
}
