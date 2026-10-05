import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck } from 'lucide-react'
import { listAllReviews, setReviewStatus, deleteReview } from '../../services/reviewService'
import { useStore } from '../../context/Store'
import { StatusBadge, Stars } from '../../components/ui'
import { fmtDate } from '../../lib/format'
export default function AdminReviews() {
  const [reviews, setReviews] = useState([]), [f, setF] = useState('pending'), [del, setDel] = useState(null), { notify } = useStore()
  const load = () => listAllReviews().then(setReviews); useEffect(load, [])
  const shown = useMemo(() => reviews.filter(r => f === 'all' || r.status === f), [reviews, f])
  const update = async (id, status) => { await setReviewStatus(id, status); await load(); notify(`Review ${status}`) }
  const remove = async id => { await deleteReview(id); await load(); setDel(null); notify('Review deleted') }
  return (<div><h1 className="text-4xl">Reviews</h1>
    <div className="mt-5 flex gap-2">{[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([k, l]) => <button key={k} onClick={() => setF(k)} className={`border px-4 py-2 text-xs ${f === k ? 'border-ink bg-ink text-ivory' : 'border-sand'}`}>{l}{k === 'pending' && reviews.filter(r => r.status === 'pending').length > 0 && <span className="ml-2 text-rose">({reviews.filter(r => r.status === 'pending').length})</span>}</button>)}</div>
    <ul className="mt-5 space-y-4">{shown.map(r => <li key={r.id} className="border border-sand p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Stars value={r.rating} size={13}/><span className="font-medium">{r.title}</span>{r.verifiedPurchase && <BadgeCheck size={14} className="text-emerald-600"/>}</div><p className="text-xs text-ink/50">By {r.userName} on {r.productName} · {fmtDate(r.date)}</p></div><StatusBadge status={r.status}/></div>
      <p className="mt-2 text-sm text-ink/70">{r.comment}</p>
      <div className="mt-4 flex flex-wrap gap-3">{r.status !== 'approved' && <button onClick={() => update(r.id, 'approved')} className="btn-dark !py-1.5">Approve</button>}{r.status !== 'rejected' && <button onClick={() => update(r.id, 'rejected')} className="btn-line !py-1.5">Reject</button>}<button onClick={() => setDel(r.id)} className="text-xs text-rose underline">Delete</button></div></li>)}
      {!shown.length && <li className="py-10 text-center text-ink/60">No {f} reviews.</li>}</ul>
    {del && <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50"><div className="bg-ivory p-8 max-w-md w-full"><h2 className="text-2xl">Delete this review?</h2><p className="mt-2 text-sm text-ink/70">This cannot be undone.</p><div className="mt-6 flex gap-3"><button onClick={() => remove(del)} className="btn-dark">Delete</button><button onClick={() => setDel(null)} className="btn-line">Cancel</button></div></div></div>}</div>)
}
