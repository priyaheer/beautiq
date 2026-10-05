import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Clock } from 'lucide-react'
import { getArticles, getTrendingArticles, articleCategories } from '../../services/articleService'
import { Art } from '../../components/ui'
import { fmtDate } from '../../lib/format'
const ALL = 'All'
const HeroCard = ({ a }) => <Link to={`/beauty-edit/${a.slug}`} className="group relative block overflow-hidden md:col-span-2 lg:col-span-2">
  <Art hue={a.hue} variant={0} className="aspect-[16/7] transition duration-700 group-hover:scale-105"/>
  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/80 via-ink/30 to-transparent p-6 text-ivory md:p-10"><span className="text-xs uppercase tracking-[.25em]">{a.category}</span><h2 className="mt-2 font-serif text-3xl leading-tight md:text-5xl">{a.title}</h2><p className="mt-2 max-w-xl text-ivory/80">{a.subtitle}</p><span className="mt-4 inline-flex items-center gap-2 text-xs"><Clock size={13}/>{a.readTime} min read · {fmtDate(a.date)}</span></div></Link>
const GridCard = ({ a }) => <Link to={`/beauty-edit/${a.slug}`} className="group block"><div className="overflow-hidden"><Art hue={a.hue} variant={a.title.length % 4} className="aspect-[4/3] transition duration-700 group-hover:scale-105"/></div>
  <p className="mt-3 text-[11px] uppercase tracking-widest text-rose">{a.category}</p><h3 className="mt-1 text-xl leading-tight group-hover:text-rose">{a.title}</h3><p className="mt-1 text-sm text-ink/60">{a.subtitle}</p><p className="mt-2 text-xs text-ink/40">{a.readTime} min · {fmtDate(a.date)}</p></Link>
export default function BeautyEdit() {
  const [all, setAll] = useState(null), [trending, setTrending] = useState([]), [cat, setCat] = useState(ALL), [q, setQ] = useState('')
  useEffect(() => { getArticles().then(setAll); getTrendingArticles().then(setTrending) }, [])
  const shown = (all || []).filter(a => (cat === ALL || a.category === cat) && (!q.trim() || a.title.toLowerCase().includes(q.toLowerCase()) || a.subtitle.toLowerCase().includes(q.toLowerCase())))
  return (<div className="wrap py-12"><p className="text-xs uppercase tracking-[.3em] text-rose">From the editors</p><h1 className="mt-2 text-5xl md:text-6xl">Beauty Edit</h1><p className="mt-3 text-ink/60">Guides, rituals and ingredient deep-dives from the BEAUTIQ team.</p>
    <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-2 overflow-x-auto pb-1">{[ALL, ...articleCategories].map(c => <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={`shrink-0 border px-4 py-2 text-xs uppercase tracking-widest ${cat === c ? 'border-ink bg-ink text-ivory' : 'border-sand hover:border-ink'}`}>{c}</button>)}</div>
      <label className="flex min-w-48 items-center gap-2 border-b border-sand pb-2"><Search size={15} className="shrink-0 text-ink/40"/><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search articles" aria-label="Search articles" className="w-full bg-transparent text-sm outline-none"/></label></div>
    {!all ? <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[4/3] bg-cream"/><div className="mt-3 h-3 w-1/4 bg-cream"/><div className="mt-2 h-6 w-3/4 bg-cream"/></div>)}</div>
    : !shown.length ? <div className="py-20 text-center"><p className="font-serif text-3xl">No articles match "{q || cat}"</p><div className="mt-4 flex justify-center gap-3"><button onClick={() => { setCat(ALL); setQ('') }} className="btn-line">Clear filters</button></div></div>
    : <><div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"><HeroCard a={shown[0]}/>{shown.slice(1, 3).map(a => <GridCard key={a.slug} a={a}/>)}</div><div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{shown.slice(3).map(a => <GridCard key={a.slug} a={a}/>)}</div></>}
    {trending.length > 0 && cat === ALL && !q && <section className="mt-20 bg-cream py-12"><p className="text-xs uppercase tracking-[.3em] text-rose">Trending</p><h2 className="mt-2 text-3xl">What everyone's reading</h2>
      <div className="mt-6 flex gap-6 overflow-x-auto pb-2">{trending.map((a, i) => <Link key={a.slug} to={`/beauty-edit/${a.slug}`} className="group flex min-w-[220px] gap-4 hover:bg-white/60 sm:min-w-[280px]"><span className="font-serif text-4xl text-ink/20 leading-none">0{i + 1}</span><div><p className="text-[11px] uppercase tracking-widest text-rose">{a.category}</p><h3 className="font-serif text-lg leading-tight group-hover:text-rose">{a.title}</h3><p className="mt-1 text-xs text-ink/50">{a.readTime} min read</p></div></Link>)}</div></section>}</div>)
}
