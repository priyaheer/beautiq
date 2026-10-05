import { useState } from 'react'
import { Check } from 'lucide-react'
import { useStore } from '../context/Store'
import { subscribeNewsletter } from '../services/productService'
import { isEmail } from '../lib/validate'
import { Spinner } from './ui'
export default function Newsletter() {
  const { notify } = useStore(), [email, setEmail] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [done, setDone] = useState(false)
  const submit = async e => { e.preventDefault()
    if (!email.trim()) return setErr('Enter your email address to subscribe')
    if (!isEmail(email)) return setErr('Please enter a valid email address, like name@example.com')
    setErr(''); setBusy(true)
    try { await subscribeNewsletter(email); setDone(true); notify('Welcome to the BEAUTIQ list ✦') } catch (x) { setErr(x.message) } finally { setBusy(false) } }
  return (<section className="bg-cream py-20 text-center"><div className="wrap max-w-xl"><p className="text-xs uppercase tracking-[.3em] text-rose">Newsletter</p><h2 className="mt-3 text-4xl md:text-5xl">Join the inner circle</h2>
    {done ? <div role="status" className="mt-8 border border-sand bg-ivory p-6"><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-ink text-ivory"><Check size={18}/></span><p className="mt-3 font-serif text-2xl">You're on the list</p>
        <p className="mt-1 text-sm text-ink/70">Your 10% welcome code is <b className="font-medium">BEAUTIQ10</b>. We'll send new arrivals and rituals to {email}.</p><button onClick={() => { setDone(false); setEmail('') }} className="mt-4 text-xs uppercase tracking-widest underline">Subscribe another email</button></div>
    : <><p className="mt-3 text-ink/70">New arrivals, rituals and private offers — 10% off your first order.</p>
      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-2 sm:flex-row"><input type="email" aria-label="Email address" aria-invalid={!!err} value={email} onChange={e => { setEmail(e.target.value); setErr('') }} placeholder="Your email address" className={`flex-1 border bg-ivory px-4 py-3 text-sm outline-none focus:border-ink ${err ? 'border-rose' : 'border-sand'}`}/>
        <button disabled={busy} className="btn-dark min-w-[9.5rem] disabled:opacity-60">{busy ? <><Spinner/>Subscribing</> : 'Subscribe'}</button></form>{err && <p role="alert" className="mt-2 text-xs text-rose">{err}</p>}</>}
  </div></section>) }
