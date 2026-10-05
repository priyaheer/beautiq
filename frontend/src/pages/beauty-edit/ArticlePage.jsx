import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Clock, Share2, Twitter, LinkIcon } from 'lucide-react'
import { getArticleBySlug, getRelatedArticles } from '../../services/articleService'
import { Art, Avatar } from '../../components/ui'
import { fmtDate } from '../../lib/format'
import { useStore } from '../../context/Store'
const Content = ({ block }) => {
  if (block.type === 'p') return <p className="mb-5 leading-relaxed text-ink/80 max-w-[65ch]">{block.text}</p>
  if (block.type === 'h2') return <h2 className="mt-12 mb-5 text-3xl">{block.text}</h2>
  if (block.type === 'img') return <figure className="my-10"><Art hue={block.hue} variant={2} className="w-full" style={{ aspectRatio: '16/7' }}/>{block.caption && <figcaption className="mt-2 text-center text-sm text-ink/50">{block.caption}</figcaption>}</figure>
  if (block.type === 'quote') return <blockquote className="my-10 border-l-4 border-rose pl-6"><p className="font-serif text-2xl leading-snug text-ink/80">{block.text}</p></blockquote>
  if (block.type === 'list') return <div className="my-8 bg-cream p-6"><p className="mb-3 text-xs uppercase tracking-widest">{block.title}</p><ul className="space-y-2">{block.items.map(it => <li key={it} className="flex gap-2 text-sm text-ink/80"><span className="text-rose">✦</span>{it}</li>)}</ul></div>
  return null }
export default function ArticlePage() {
  const { slug } = useParams(), [a, setA] = useState(undefined), [related, setRelated] = useState([]), { notify } = useStore()
  useEffect(() => { setA(undefined); getArticleBySlug(slug).then(x => { setA(x); if (x) getRelatedArticles(x).then(setRelated); window.scrollTo(0, 0) }) }, [slug])
  const share = async () => { try { await navigator.share({ title: a.title, url: location.href }) } catch { await navigator.clipboard.writeText(location.href); notify('Link copied to clipboard') } }
  if (a === undefined) return <div className="wrap max-w-3xl py-12 space-y-6 animate-pulse"><div className="h-80 bg-cream"/><div className="h-10 w-2/3 bg-cream"/><div className="h-5 w-full bg-cream"/></div>
  if (!a) return <div className="wrap py-20 text-center"><p className="text-xs uppercase tracking-[.3em] text-rose">Not found</p><h1 className="mt-2 text-5xl">Article not found</h1><p className="mt-3 text-ink/60">This article may have been moved or retired.</p><Link to="/beauty-edit" className="btn-dark mt-8">Back to Beauty Edit</Link></div>
  return (<article><div className="wrap max-w-4xl pt-10"><Link to="/beauty-edit" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-ink/60 hover:text-ink"><ChevronLeft size={14}/>Beauty Edit</Link>
    <p className="mt-6 text-xs uppercase tracking-widest text-rose">{a.category}</p><h1 className="mt-3 font-serif text-5xl leading-[1.05] md:text-6xl">{a.title}</h1><p className="mt-4 text-xl text-ink/60">{a.subtitle}</p>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-sand pb-6"><div className="flex items-center gap-3"><Avatar user={{ ...a.author, hue: a.author.hue }} size={44}/><div className="text-sm"><p className="font-medium">{a.author.name}</p><p className="text-ink/50">{a.author.role}</p></div></div>
      <div className="flex items-center gap-5 text-xs text-ink/50"><span><Clock size={13} className="inline mr-1"/>{a.readTime} min read</span><span>{fmtDate(a.date)}</span>
        <button onClick={share} aria-label="Share article" className="flex items-center gap-1 hover:text-ink"><Share2 size={14}/>Share</button></div></div></div>
    <div className="relative mt-10"><Art hue={a.hue} variant={1} className="w-full" style={{ aspectRatio: '16/6' }}/><div className="absolute inset-0 bg-gradient-to-t from-ivory/30 to-transparent"/></div>
    <div className="wrap max-w-3xl py-12"><div className="flex flex-wrap gap-2 mb-10">{a.tags.map(t => <Link key={t} to={`/beauty-edit?q=${encodeURIComponent(t)}`} className="border border-sand px-3 py-1 text-xs capitalize hover:border-ink">{t}</Link>)}</div>
      {a.content.map((block, i) => <Content key={i} block={block}/>)}</div>
    {related.length > 0 && <div className="bg-cream py-16"><div className="wrap"><p className="text-xs uppercase tracking-[.3em] text-rose">Continue reading</p><h2 className="mt-2 text-3xl">Related articles</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.map(r => <Link key={r.slug} to={`/beauty-edit/${r.slug}`} className="group block"><div className="overflow-hidden"><Art hue={r.hue} variant={r.slug.length % 4} className="aspect-[4/3] transition duration-500 group-hover:scale-105"/></div>
        <p className="mt-3 text-[11px] uppercase tracking-widest text-rose">{r.category}</p><h3 className="mt-1 text-xl leading-tight group-hover:text-rose">{r.title}</h3><p className="mt-1 text-sm text-ink/60">{r.subtitle}</p></Link>)}</div></div></div>}</article>)
}
