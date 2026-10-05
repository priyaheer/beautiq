import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, X, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { initials } from '../lib/format'

export function ProductImage({ p, src = p?.images?.[0], alt = p?.name || '', className = 'h-full w-full object-cover' }) {
  const thumbnail = p?.thumbnail
  const sources = [...new Set([src, thumbnail].filter(Boolean))]
  const [sourceIndex, setSourceIndex] = useState(0)

  useEffect(() => {
    setSourceIndex(0)
  }, [src, thumbnail])

  if (!sources[sourceIndex]) {
    return <div role="img" aria-label={alt} className={`bg-sand ${className.replace(/\bobject-(cover|contain)\b/g, '')}`}/>
  }

  return <img src={sources[sourceIndex]} alt={alt} className={className} onError={() => setSourceIndex(index => index + 1)}/>
}
export const Thumb = ({ p, className = 'h-14 w-12' }) => <ProductImage p={p} className={`shrink-0 ${className} object-cover`}/>
export const Stars = ({ value, size = 14 }) => <span className="inline-flex" aria-label={`${value} out of 5`}>{[1, 2, 3, 4, 5].map(i => <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-nude text-nude' : 'text-sand'}/>)}</span>
export const Avatar = ({ user, size = 40 }) => user?.avatar ? <img src={user.avatar} alt="" className="rounded-full object-cover" style={{ width: size, height: size }}/>
  : <span className="grid shrink-0 place-items-center rounded-full font-serif text-ink" style={{ width: size, height: size, fontSize: size / 2.4, background: `hsl(${user?.hue ?? 20} 40% 80%)` }}>{initials(user?.name)}</span>
// Abstract editorial "photograph": layered gradient shapes. variant 0-3 gives each image a different composition.
export const Art = ({ hue = 20, variant = 0, label, className = '' }) => {
  const bg = [`radial-gradient(circle at 70% 25%,hsl(${hue} 55% 88%) 0 18%,transparent 19%),linear-gradient(160deg,hsl(${hue} 38% 82%),hsl(${hue} 30% 66%))`,
    `radial-gradient(ellipse at 30% 110%,hsl(${hue} 30% 48%) 0 40%,transparent 41%),linear-gradient(180deg,hsl(${hue} 45% 90%),hsl(${hue} 35% 76%))`,
    `linear-gradient(115deg,hsl(${hue} 30% 70%) 0 38%,hsl(${hue} 42% 86%) 38% 70%,hsl(${hue} 26% 58%) 70%)`,
    `radial-gradient(circle at 50% 55%,hsl(${hue} 50% 92%) 0 22%,hsl(${hue} 35% 74%) 23% 46%,hsl(${hue} 28% 60%) 47%)`][variant % 4]
  return <div role="img" aria-label={label || 'Editorial image'} className={`relative overflow-hidden ${className}`} style={{ background: bg }}/>
}
export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => { if (!open) return; const k = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' } }, [open, onClose])
  return <AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" onClick={onClose}>
    <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }} role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()} className={`max-h-[90vh] w-full overflow-auto bg-ivory p-6 ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
      <div className="mb-5 flex items-start justify-between"><h2 className="text-3xl">{title}</h2><button onClick={onClose} aria-label="Close"><X/></button></div>{children}</motion.div></motion.div>}</AnimatePresence>
}
export const Field = ({ label, error, hint, children, className = '' }) => <label className={`block text-sm ${className}`}><span className="mb-1.5 block text-xs uppercase tracking-widest text-ink/60">{label}</span>{children}
  {hint && !error && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}{error && <span role="alert" className="mt-1 block text-xs text-rose">{error}</span>}</label>
export const inputCls = err => `w-full border bg-ivory px-3.5 py-3 text-sm outline-none transition focus:border-ink ${err ? 'border-rose' : 'border-sand'}`
export const Empty = ({ title, text, to, cta }) => <div className="py-20 text-center"><h3 className="text-3xl">{title}</h3>{text && <p className="mx-auto mt-2 max-w-md text-ink/60">{text}</p>}{to && <Link to={to} className="btn-dark mt-6">{cta}</Link>}</div>
export const StatusBadge = ({ status }) => { const c = { Delivered: 'bg-emerald-50 text-emerald-800', Cancelled: 'bg-rose/10 text-rose', Shipped: 'bg-sky-50 text-sky-800', 'Out for Delivery': 'bg-amber-50 text-amber-800', Processing: 'bg-cream text-ink', Confirmed: 'bg-cream text-ink',
  approved: 'bg-emerald-50 text-emerald-800', pending: 'bg-amber-50 text-amber-800', rejected: 'bg-rose/10 text-rose', active: 'bg-emerald-50 text-emerald-800', blocked: 'bg-rose/10 text-rose', inactive: 'bg-sand/60 text-ink/70' }[status] || 'bg-cream'
  return <span className={`inline-block px-2.5 py-1 text-[11px] capitalize tracking-wide ${c}`}>{status}</span> }
export const Spinner = () => <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden/>
export const Tick = ({ on }) => <span className={`grid h-5 w-5 place-items-center rounded-full border ${on ? 'border-ink bg-ink text-ivory' : 'border-sand'}`}>{on && <Check size={12}/>}</span>
export function PasswordMeter({ checks }) { const ok = checks.filter(c => c[1]).length
  return <div className="mt-2"><div className="flex gap-1">{checks.map((_, i) => <i key={i} className={`h-1 flex-1 ${i < ok ? (ok < 3 ? 'bg-rose' : ok < 5 ? 'bg-nude' : 'bg-emerald-600') : 'bg-sand'}`}/>)}</div>
    <ul className="mt-2 grid grid-cols-1 gap-x-4 text-xs sm:grid-cols-2">{checks.map(([l, v]) => <li key={l} className={v ? 'text-emerald-700' : 'text-ink/50'}>{v ? '✓' : '○'} {l}</li>)}</ul></div> }
