import { useEffect, useState } from 'react'
import { BadgeCheck, ThumbsUp } from 'lucide-react'
import { getReviews, getReviewSummary, getVotedHelpful, toggleHelpful, addReview } from '../services/reviewService'
import { fmtDate } from '../lib/format'
import { useAuth } from '../context/Auth'
import { useStore } from '../context/Store'
import { Stars, Avatar, Modal, Field, inputCls, Spinner } from './ui'
import Lightbox from './Lightbox'

function ReviewForm({ product, onDone }) {
  const { user } = useAuth(), { notify } = useStore(), [r, setR] = useState(0), [title, setTitle] = useState(''), [comment, setComment] = useState(''), [err, setErr] = useState({}), [busy, setBusy] = useState(false)
  const submit = async e => { e.preventDefault(); const x = {}
    if (!r) x.r = 'Choose a star rating'; if (title.trim().length < 3) x.title = 'Add a short title'; if (comment.trim().length < 20) x.comment = 'Tell us a little more (at least 20 characters)'
    setErr(x); if (Object.keys(x).length) return; setBusy(true); await addReview(product.id, user, { rating: r, title, comment }); setBusy(false); notify('Thanks! Your review will appear once approved.'); onDone() }
  return <form onSubmit={submit} noValidate className="space-y-4">
    <div><span className="mb-1.5 block text-xs uppercase tracking-widest text-ink/60">Your rating</span><div className="flex gap-1" role="radiogroup" aria-label="Rating">{[1, 2, 3, 4, 5].map(i => <button type="button" role="radio" aria-checked={r === i} aria-label={`${i} stars`} key={i} onClick={() => setR(i)} className="p-0.5"><Stars value={i <= r ? 5 : 0} size={26}/></button>)}</div>{err.r && <p className="mt-1 text-xs text-rose">{err.r}</p>}</div>
    <Field label="Title" error={err.title}><input value={title} onChange={e => setTitle(e.target.value)} className={inputCls(err.title)} maxLength={80}/></Field>
    <Field label="Your review" error={err.comment}><textarea value={comment} onChange={e => setComment(e.target.value)} rows={5} className={inputCls(err.comment)} placeholder={`How did ${product.name} work for you?`}/></Field>
    <button disabled={busy} className="btn-dark w-full">{busy ? <><Spinner/>Submitting</> : 'Submit review'}</button></form>
}

export default function Reviews({ product, photos }) {
  const [sum, setSum] = useState(null), [list, setList] = useState(null), [sort, setSort] = useState('helpful'), [star, setStar] = useState(0), [withPhotos, setWP] = useState(false), [n, setN] = useState(4)
  const [voted, setVoted] = useState(getVotedHelpful), [form, setForm] = useState(false), [box, setBox] = useState(null)
  useEffect(() => { getReviewSummary(product.id).then(setSum) }, [product.id])
  const load = () => getReviews(product.id, { sort, rating: star, photosOnly: withPhotos }).then(setList)
  useEffect(() => { setList(null); setN(4); load() }, [product.id, sort, star, withPhotos])
  const helpful = id => { toggleHelpful(id); setVoted(getVotedHelpful()); load() }
  const open = (r, k) => { const rp = r.photos.map(id => photos.find(p => p.id === id)).filter(Boolean); setBox({ photos: rp, i: k }) }
  if (!sum) return <section className="mt-24"><div className="h-48 animate-pulse bg-cream"/></section>
  return (<section id="reviews" className="mt-24 scroll-mt-24" aria-labelledby="reviews-h"><div className="flex flex-wrap items-end justify-between gap-3"><h2 id="reviews-h" className="text-3xl">Ratings &amp; reviews</h2><button onClick={() => setForm(true)} className="btn-line">Write a review</button></div>
    <div className="mt-8 grid gap-10 lg:grid-cols-[320px_1fr]">
      <div className="h-fit bg-cream p-6"><div className="flex items-end gap-4"><span className="font-serif text-7xl leading-none">{sum.average.toFixed(1)}</span><div className="pb-1"><Stars value={sum.average} size={18}/><p className="mt-1 text-sm text-ink/60">{sum.total.toLocaleString('en-IN')} ratings</p></div></div>
        <div className="mt-6 space-y-1.5" role="list" aria-label="Rating breakdown">{sum.breakdown.map(b => <button role="listitem" key={b.star} onClick={() => setStar(star === b.star ? 0 : b.star)} aria-pressed={star === b.star} className={`flex w-full items-center gap-3 px-1 py-1 text-xs transition hover:bg-sand/40 ${star === b.star ? 'bg-sand/60' : ''}`}>
          <span className="w-6 shrink-0 text-left">{b.star} ★</span><span className="h-2 flex-1 bg-ivory"><span className="block h-full bg-nude transition-all" style={{ width: `${b.pct}%` }}/></span><span className="w-10 text-right">{b.pct < 1 && b.count ? '<1' : Math.round(b.pct)}%</span><span className="w-12 text-right text-ink/50">{b.count.toLocaleString('en-IN')}</span></button>)}</div>
        <p className="mt-4 text-xs text-ink/50">Select a row to filter reviews by rating.</p></div>
      <div><div className="flex flex-wrap items-center gap-3 border-b border-sand pb-4 text-sm">
        <label className="flex items-center gap-2">Sort<select value={sort} onChange={e => setSort(e.target.value)} className="border border-sand bg-ivory p-2"><option value="helpful">Most helpful</option><option value="newest">Newest</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option></select></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={withPhotos} onChange={e => setWP(e.target.checked)} className="accent-rose"/>With photos</label>
        {star > 0 && <button onClick={() => setStar(0)} className="bg-cream px-3 py-1.5 text-xs">{star} ★ only ✕</button>}</div>
        {!list ? <div className="mt-6 space-y-4">{[0, 1, 2].map(i => <div key={i} className="h-28 animate-pulse bg-cream"/>)}</div>
        : !list.length ? <div className="py-16 text-center"><p className="font-serif text-2xl">No reviews match</p><p className="mt-1 text-sm text-ink/60">Try a different rating or remove the photo filter.</p><button onClick={() => { setStar(0); setWP(false) }} className="btn-line mt-5">Reset filters</button></div>
        : <><ul>{list.slice(0, n).map(r => <li key={r.id} className="border-b border-sand py-6"><article>
          <div className="flex items-start gap-3"><Avatar user={{ name: r.userName, hue: (r.userName.length * 13) % 50 }} size={40}/><div className="flex-1"><div className="flex flex-wrap items-center gap-x-3"><span className="font-medium">{r.userName}</span>{r.verifiedPurchase && <span className="flex items-center gap-1 text-xs text-emerald-700"><BadgeCheck size={14}/>Verified purchase</span>}</div><p className="text-xs text-ink/50">{fmtDate(r.date)}</p></div></div>
          <div className="mt-3 flex items-center gap-2"><Stars value={r.rating}/><h3 className="font-sans text-sm font-medium tracking-normal">{r.title}</h3></div><p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/80">{r.comment}</p>
          {r.photos.length > 0 && <div className="mt-3 flex gap-2">{r.photos.map((id, k) => { const ph = photos.find(p => p.id === id); return ph && <button key={id} onClick={() => open(r, k)} aria-label={`View review photo ${k + 1}`} className="h-16 w-16"><div className="h-full w-full" style={{ background: `linear-gradient(160deg,hsl(${ph.hue} 38% 82%),hsl(${ph.hue} 30% 62%))` }}/></button> })}</div>}
          <button onClick={() => helpful(r.id)} aria-pressed={voted.includes(r.id)} className={`mt-4 inline-flex items-center gap-2 border px-3 py-1.5 text-xs transition ${voted.includes(r.id) ? 'border-ink bg-ink text-ivory' : 'border-sand hover:border-ink'}`}><ThumbsUp size={13}/>Helpful ({r.helpful})</button></article></li>)}</ul>
          {n < list.length && <button onClick={() => setN(n + 4)} className="btn-line mt-6">Show more reviews ({list.length - n})</button>}
          <p className="mt-4 text-xs text-ink/50">Showing {Math.min(n, list.length)} of {list.length} written reviews</p></>}
      </div></div>
    <Modal open={form} onClose={() => setForm(false)} title="Write a review"><ReviewForm product={product} onDone={() => setForm(false)}/></Modal>
    <Lightbox photos={box?.photos || []} index={box?.i ?? null} onClose={() => setBox(null)} onIndex={k => setBox(b => ({ ...b, i: k }))} productName={product.name}/></section>)
}
