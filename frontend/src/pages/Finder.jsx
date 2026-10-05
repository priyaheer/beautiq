import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { getRecommendations } from '../services/productService'
import { hairTypes } from '../data'
import { Check } from 'lucide-react'
import { useStore } from '../context/Store'
import { ProductImage } from '../components/ui'
const steps = [
  { k: 'skin', q: 'What is your skin type?', o: ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'] },
  { k: 'concerns', q: 'Which concerns matter most?', multi: true, o: ['Dullness', 'Acne', 'Ageing', 'Hydration', 'Redness', 'Frizz', 'Damage'] },
  { k: 'categories', q: 'What are you shopping for?', multi: true, o: ['makeup', 'skincare', 'haircare', 'fragrance'] },
  { k: 'hair', q: "What's your hair type?", hair: true, multi: true, o: hairTypes },
  { k: 'ingredients', q: 'Any ingredients you love?', multi: true, o: ['Niacinamide', 'Hyaluronic Acid', 'Ceramides', 'Squalane', 'Argan Oil', 'Keratin'] },
  { k: 'budget', q: 'What is your budget per product?', o: [1000, 2000, 3500, 5000], fmt: v => `Up to ₹${v}` }]
export default function Finder() {
  const { addToCart } = useStore(), [i, setI] = useState(0), [a, setA] = useState({ skin: '', concerns: [], categories: [], ingredients: [], hair: [], budget: 0 }), [res, setRes] = useState(null)
  const s = steps[i], val = a[s.k], wantsHair = a.categories.includes('haircare'), ok = s.hair ? (!wantsHair || val.length > 0) : s.multi ? val.length > 0 : !!val
  const [error, setError] = useState(null)
  const PATTERN = ['Straight', 'Wavy', 'Curly', 'Coily'], TEXTURE = ['Fine', 'Thick']
  // pattern and texture are separate dimensions: choose one pattern and optionally one texture
  const pickHair = o => setA(x => { const g = PATTERN.includes(o) ? PATTERN : TEXTURE, has = x.hair.includes(o); return { ...x, hair: [...x.hair.filter(h => !g.includes(h)), ...(has && g === TEXTURE ? [] : [o])] } })
  const pick = o => s.hair ? pickHair(o) : setA(x => ({ ...x, [s.k]: s.multi ? (x[s.k].includes(o) ? x[s.k].filter(v => v !== o) : [...x[s.k], o]) : o }))
  const next = async () => {
    if (i < steps.length - 1) return setI(i + 1)
    setError(null)
    try { setRes(await getRecommendations(a)) } catch (reason) { setError(reason) }
  }
  const answers = [a.skin, ...a.concerns, ...(wantsHair ? a.hair : [])].filter(Boolean)
  if (res) return (<div className="wrap py-12"><p className="text-xs uppercase tracking-[.3em] text-rose">Beauty Finder</p><h1 className="mt-2 text-5xl">Your Beauty Match</h1><p className="mt-3 text-sm text-ink/60">Based on {answers.join(' · ').toLowerCase()}</p>
    {!res.length ? <p className="mt-10">No close matches — try a higher budget.</p> : <div className="mt-10 grid gap-6 md:grid-cols-2">{res.map(({ p, match, why }) => <div key={p.id} className="flex gap-5 border border-sand p-5">
      <ProductImage p={p} className="h-36 w-28 shrink-0 object-cover"/><div className="flex-1"><p className="text-[11px] uppercase tracking-widest text-ink/50">{p.brand}</p>
        <Link to={`/product/${p.id}`} className="font-serif text-xl">{p.name}</Link><p className="mt-1 text-sm text-rose">{match}% match</p>
        <ul className="mt-2 list-disc pl-4 text-xs text-ink/70">{why.slice(0, 3).map(w => <li key={w}>{w}</li>)}</ul>
        <div className="mt-3 flex items-center justify-between"><b className="font-medium">₹{p.price.toLocaleString('en-IN')}</b><button onClick={() => addToCart(p, p.shades[0]?.name ?? null)} className="btn-dark !px-4 !py-2">Add to Bag</button></div></div></div>)}</div>}
    <button onClick={() => { setRes(null); setI(0) }} className="btn-line mt-10">Retake</button></div>)
  return (<div className="wrap max-w-3xl py-12"><p className="text-xs uppercase tracking-widest">Step {i + 1} of {steps.length}</p>
    <div className="mt-2 h-px bg-sand"><motion.div className="h-px bg-ink" animate={{ width: `${((i + 1) / steps.length) * 100}%` }}/></div>
    <AnimatePresence mode="wait"><motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h1 className="mt-10 text-4xl md:text-5xl">{s.q}</h1>{s.hair ? <p className="mt-2 text-sm text-ink/50">{wantsHair ? 'Choose a curl pattern, and add fine or thick if it describes you.' : 'Only needed for haircare picks — you can skip this step.'}</p> : s.multi && <p className="mt-2 text-sm text-ink/50">Select all that apply</p>}
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">{s.o.map(o => { const on = s.multi ? val.includes(o) : val === o
        return <button key={o} onClick={() => pick(o)} aria-pressed={on} className={`flex items-center justify-center gap-2 border px-4 py-5 text-sm capitalize transition ${on ? 'border-ink bg-ink text-ivory' : 'border-sand hover:border-ink'}`}>{on && <Check size={14}/>}{s.fmt ? s.fmt(o) : o}</button> })}</div></motion.div></AnimatePresence>
    {error && <p role="alert" className="mt-4 text-sm text-rose">Recommendations could not be loaded. Please try again.</p>}
    <div className="mt-10 flex justify-between"><button disabled={!i} onClick={() => setI(i - 1)} className="btn-line disabled:opacity-30">Back</button>
      <button disabled={!ok} onClick={next} className="btn-dark disabled:opacity-40">{s.hair && !wantsHair && !val.length ? 'Skip' : i === steps.length - 1 ? 'See my match' : 'Next'}</button></div></div>)
}
