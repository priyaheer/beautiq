import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Art } from './ui'
export default function Lightbox({ photos, index, onClose, onIndex, productName }) {
  const open = index != null && photos[index], go = d => onIndex((index + d + photos.length) % photos.length)
  useEffect(() => { if (!open) return; const k = e => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }
    window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' } })
  const ph = open ? photos[index] : null
  return <AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[55] grid place-items-center bg-ink/90 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Customer photo">
    <button onClick={onClose} aria-label="Close photo" className="absolute right-5 top-5 text-ivory"><X size={28}/></button>
    {photos.length > 1 && <><button onClick={e => { e.stopPropagation(); go(-1) }} aria-label="Previous photo" className="absolute left-3 text-ivory sm:left-8"><ChevronLeft size={36}/></button><button onClick={e => { e.stopPropagation(); go(1) }} aria-label="Next photo" className="absolute right-3 text-ivory sm:right-8"><ChevronRight size={36}/></button></>}
    <motion.figure key={ph.id} initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()} className="w-full max-w-md">
      <Art hue={ph.hue} variant={ph.variant} label={ph.caption} className="aspect-[4/5] w-full"/>
      <figcaption className="mt-3 text-ivory"><p className="font-serif text-xl">{ph.caption}</p><p className="mt-0.5 text-sm text-ivory/70">Photo by {ph.userName}{productName && ` · ${productName}`}</p><p className="mt-1 text-xs text-ivory/50">{index + 1} of {photos.length}</p></figcaption></motion.figure></motion.div>}</AnimatePresence>
}
