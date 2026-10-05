import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Lock, ShieldCheck, Truck } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore, useLS } from '../context/Store'
import { useAuth } from '../context/Auth'
import { cartToItems, computeTotals, createOrder, DELIVERY_OPTIONS, estimateDelivery } from '../services/orderService'
import { evaluateCoupon } from '../services/couponService'
import { createPayment, PAYMENT_METHODS, BANKS } from '../services/paymentService'
import { saveAddress } from '../services/userService'
import { isEmail } from '../lib/validate'
import { inr, fmtDate } from '../lib/format'
import AddressForm, { AddressBlock, blankAddress } from '../components/AddressForm'
import { Field, inputCls, Spinner, ProductImage } from '../components/ui'
import { PasswordInput, ErrorBanner } from './auth/parts'

const STEPS = ['Customer', 'Shipping', 'Delivery', 'Payment', 'Review']
const NEXTDAY = /delhi|gurugram|gurgaon|noida|faridabad|ghaziabad|mumbai|bengaluru|bangalore/i
const range = o => { const { from, to } = estimateDelivery(o); return o.days[0] === o.days[1] ? fmtDate(to, { weekday: 'short', day: 'numeric', month: 'short' }) : `${fmtDate(from, { day: 'numeric', month: 'short' })} – ${fmtDate(to, { day: 'numeric', month: 'short' })}` }
const Card = ({ on, onClick, children, disabled }) => <button type="button" disabled={disabled} onClick={onClick} aria-pressed={on} className={`flex w-full items-start gap-4 border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${on ? 'border-ink bg-cream/60' : 'border-sand hover:border-ink'}`}>
  <span className={`mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${on ? 'border-ink' : 'border-sand'}`}>{on && <i className="h-2 w-2 rounded-full bg-ink"/>}</span><span className="flex-1">{children}</span></button>
const fmtCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const fmtExp = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }

export default function Checkout() {
  const { cart, coupon, setCoupon, clearCart, notify } = useStore(), { user, login, refresh } = useAuth(), go = useNavigate()
  const [items, setItems] = useState(null), [itemsError, setItemsError] = useState(null)
  useEffect(() => {
    let active = true
    setItems(null)
    setItemsError(null)
    cartToItems(cart).then(result => {
      if (active) setItems(result)
    }).catch(error => {
      if (active) setItemsError(error)
    })
    return () => { active = false }
  }, [cart])
  const [d, setD] = useLS('bq-checkout', { email: '', address: null, delivery: 'standard', method: 'UPI' }), [step, setStep] = useState(0), [placing, setPlacing] = useState(false), [payErr, setPayErr] = useState('')
  const [mode, setMode] = useState('guest'), [lg, setLg] = useState({ email: '', password: '' }), [lgErr, setLgErr] = useState(''), [busy, setBusy] = useState(false), [errs, setErrs] = useState({})
  const [editing, setEditing] = useState(false), [saveAddr, setSaveAddr] = useState(true), [pay, setPay] = useState({ upi: '', number: '', name: '', exp: '', cvv: '', bank: '' }), [code, setCode] = useState(''), [cErr, setCErr] = useState('')
  const email = user?.email || d.email, totals = computeTotals({ items: items || [], couponCode: coupon, delivery: d.delivery, paymentMethod: d.method })
  const nextDayOk = d.address && NEXTDAY.test(d.address.city)
  useEffect(() => { if (d.delivery === 'nextday' && d.address && !nextDayOk) setD(v => ({ ...v, delivery: 'standard' })) }, [d.address])
  useEffect(() => { if (user && step === 0 && false) setStep(1) }, [user])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [step])
  const set = patch => setD(v => ({ ...v, ...patch }))

  if (items === null) return <div className="py-32 text-center">{itemsError ? <p role="alert" className="text-rose">Your bag could not be loaded. Please try again later.</p> : <p className="text-ink/60">Loading your bag…</p>}</div>
  if (!items.length && !placing) return <div className="py-32 text-center"><h1 className="text-5xl">Your bag is empty</h1><p className="mt-3 text-ink/60">Add something to your bag before checking out.</p><Link to="/new-arrivals" className="btn-dark mt-8">Shop New Arrivals</Link></div>

  const signIn = async e => { e.preventDefault(); setLgErr(''); if (!isEmail(lg.email) || !lg.password) return setLgErr('Enter your email and password'); setBusy(true)
    try { await login({ ...lg, remember: true }); setStep(1) } catch (x) { setLgErr(x.message) } finally { setBusy(false) } }
  const guest = e => { e.preventDefault(); if (!isEmail(d.email)) return setErrs({ email: 'Enter a valid email address' }); setErrs({}); setStep(1) }
  const useAddress = async a => { set({ address: a }); if (saveAddr && user && !a.id) { await saveAddress(user.id, a); await refresh() } setEditing(false); setStep(2) }
  const validatePay = () => { const e = {}, m = d.method
    if (m === 'UPI' && !/^[\w.\-]{2,}@[a-z]{2,}$/i.test(pay.upi.trim())) e.upi = 'Enter a valid UPI ID, like name@okhdfc'
    if (m === 'Credit/Debit Card') { if (pay.number.replace(/\s/g, '').length < 15) e.number = 'Enter a valid card number'; if (pay.name.trim().length < 2) e.name = 'Enter the name on the card'
      const [mm, yy] = pay.exp.split('/').map(Number); if (!(mm >= 1 && mm <= 12) || !yy || new Date(2000 + yy, mm, 1) <= new Date()) e.exp = 'Enter a valid, future expiry date'; if (!/^\d{3,4}$/.test(pay.cvv)) e.cvv = 'Enter the 3 or 4-digit CVV' }
    if (m === 'Net Banking' && !pay.bank) e.bank = 'Choose your bank'; setErrs(e); return !Object.keys(e).length }
  const place = async () => { setPayErr(''); setPlacing(true)
    try { const r = await createPayment({ method: d.method, amount: totals.total, details: pay })
      const order = await createOrder({ user, email, items, address: d.address, deliveryId: d.delivery, paymentMethod: d.method, paymentStatus: r.status, couponCode: coupon })
      clearCart(); setCoupon(''); setD(v => ({ ...v, address: user ? v.address : null })); notify('Order placed'); go(`/order-success/${order.id}`, { replace: true }) }
    catch (x) { setPayErr(x.message); setPlacing(false); setStep(3) } }
  const applyCode = () => { const r = evaluateCoupon(code, totals.subtotal); if (r.ok) { setCoupon(code.trim().toUpperCase()); setCode(''); setCErr('') } else setCErr(r.reason) }
  const Heading = ({ n, t }) => <h2 className="text-3xl"><span className="mr-3 text-ink/30">{n}</span>{t}</h2>
  const Next = ({ onClick, children = 'Continue' }) => <div className="mt-8 flex flex-wrap items-center gap-4"><button type="button" onClick={onClick} className="btn-dark">{children}</button>{step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="text-xs uppercase tracking-widest underline">Back</button>}</div>
  const panel = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: .22 } }
  const method = PAYMENT_METHODS.find(m => m.id === d.method)

  return (<div className="wrap py-10"><div className="flex items-center justify-between"><Link to="/" className="font-serif text-2xl tracking-[.22em]">BEAUTIQ</Link><span className="flex items-center gap-1.5 text-xs text-ink/60"><Lock size={13}/>Secure checkout</span></div>
    <ol className="mt-8 flex gap-2 overflow-x-auto text-xs" aria-label="Checkout steps">{STEPS.map((s, i) => <li key={s} className="flex flex-1 shrink-0 items-center gap-2"><button disabled={i >= step} onClick={() => setStep(i)} aria-current={i === step ? 'step' : undefined} className={`flex items-center gap-2 ${i > step ? 'text-ink/30' : ''}`}>
      <span className={`grid h-6 w-6 place-items-center rounded-full border text-[11px] ${i < step ? 'border-ink bg-ink text-ivory' : i === step ? 'border-ink' : 'border-sand'}`}>{i < step ? <Check size={12}/> : i + 1}</span><span className={i === step ? 'font-medium' : ''}>{s}</span></button>{i < 4 && <i className="h-px min-w-4 flex-1 bg-sand"/>}</li>)}</ol>
    <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]"><div className="min-w-0"><AnimatePresence mode="wait"><motion.div key={step} {...panel}>
      {step === 0 && <div><Heading n="1" t="Customer"/>
        {user ? <div className="mt-6 border border-sand p-5 text-sm"><p className="text-ink/60">Signed in as</p><p className="mt-1 font-medium">{user.name}</p><p>{user.email}</p><Next onClick={() => setStep(1)}/></div>
        : <><div className="mt-6 flex border-b border-sand text-sm">{[['guest', 'Guest checkout'], ['login', 'I have an account']].map(([k, l]) => <button key={k} onClick={() => setMode(k)} className={`px-5 py-3 ${mode === k ? 'border-b-2 border-ink font-medium' : 'text-ink/50'}`}>{l}</button>)}</div>
          {mode === 'guest' ? <form onSubmit={guest} noValidate className="mt-6 max-w-md space-y-4"><Field label="Email" error={errs.email} hint="We'll send your order confirmation here"><input type="email" autoComplete="email" value={d.email} onChange={e => set({ email: e.target.value })} className={inputCls(errs.email)}/></Field><button className="btn-dark">Continue as guest</button>
            <p className="text-xs text-ink/50">Want to track orders later? <Link to="/register?next=/checkout" className="underline">Create an account</Link></p></form>
          : <form onSubmit={signIn} noValidate className="mt-6 max-w-md space-y-4"><ErrorBanner>{lgErr}</ErrorBanner><Field label="Email"><input type="email" value={lg.email} onChange={e => setLg({ ...lg, email: e.target.value })} className={inputCls()}/></Field>
            <Field label="Password"><PasswordInput value={lg.password} onChange={e => setLg({ ...lg, password: e.target.value })} autoComplete="current-password"/></Field><div className="flex items-center gap-5"><button disabled={busy} className="btn-dark">{busy ? <><Spinner/>Signing in</> : 'Sign in & continue'}</button><Link to="/forgot-password" className="text-xs underline">Forgot password?</Link></div>
            <button type="button" className="text-xs underline" onClick={() => setLg({ email: 'aanya.sharma@example.com', password: 'Beautiq@123' })}>Use demo account</button></form>}</>}</div>}
      {step === 1 && <div><Heading n="2" t="Shipping address"/>
        {user?.addresses.length > 0 && !editing ? <div className="mt-6 space-y-3">{user.addresses.map(a => <Card key={a.id} on={d.address?.id === a.id} onClick={() => set({ address: a })}><span className="text-xs uppercase tracking-widest text-ink/50">{a.label}{a.isDefault && ' · Default'}</span><span className="mt-1 block"><AddressBlock a={a}/></span></Card>)}
          <button type="button" onClick={() => setEditing(true)} className="text-xs uppercase tracking-widest underline">+ Add a new address</button>
          <Next onClick={() => d.address?.id ? setStep(2) : setErrs({ addr: 'Select a delivery address' })}>Deliver to this address</Next>{errs.addr && <p role="alert" className="mt-2 text-xs text-rose">{errs.addr}</p>}</div>
        : <div className="mt-6"><AddressForm key={d.address?.id || 'f'} initial={d.address && !d.address.id ? d.address : blankAddress(user || {})} onSubmit={useAddress} showDefault={false} submitLabel="Deliver to this address" onCancel={user?.addresses.length ? () => setEditing(false) : undefined}
          showSave={<label className={`flex items-center gap-2 ${user ? '' : 'opacity-50'}`}><input type="checkbox" disabled={!user} checked={user ? saveAddr : false} onChange={e => setSaveAddr(e.target.checked)} className="accent-rose"/>Save this address{!user && ' (sign in to save)'}</label>}/>
          {!user && <button type="button" onClick={() => setStep(0)} className="mt-6 text-xs uppercase tracking-widest underline">Back</button>}</div>}</div>}
      {step === 2 && <div><Heading n="3" t="Delivery"/><div className="mt-6 space-y-3">{DELIVERY_OPTIONS.map(o => { const free = o.id === 'standard' && totals.subtotal - totals.discount > 1999, off = o.id === 'nextday' && !nextDayOk
        return <Card key={o.id} on={d.delivery === o.id} disabled={off} onClick={() => set({ delivery: o.id })}><span className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{o.label}</span><span>{free ? 'Free' : inr(o.price)}</span></span>
          <span className="mt-1 flex items-center gap-2 text-sm text-ink/60"><Truck size={14}/>{off ? 'Not available for your pincode' : `Arrives ${range(o)}`}</span><span className="mt-0.5 block text-xs text-ink/50">{o.note}</span></Card> })}</div><Next onClick={() => setStep(3)}/></div>}
      {step === 3 && <div><Heading n="4" t="Payment"/><ErrorBanner>{payErr}</ErrorBanner>
        <div className="mt-6 space-y-3">{PAYMENT_METHODS.map(m => <div key={m.id}><Card on={d.method === m.id} onClick={() => { set({ method: m.id }); setErrs({}) }}><span className="flex items-center justify-between gap-2"><span className="font-medium">{m.label}</span>{m.gateway && <span className="bg-cream px-2 py-0.5 text-[10px] uppercase tracking-widest">Recommended</span>}</span><span className="block text-xs text-ink/50">{m.hint}</span></Card>
          <AnimatePresence initial={false}>{d.method === m.id && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="border border-t-0 border-sand p-5">
            {m.id === 'Razorpay' && <p className="flex items-start gap-2 text-sm text-ink/70"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-rose"/>A secure Razorpay window opens when you place the order, where you can pay with cards, UPI, wallets or net banking. (Simulated for now.)</p>}
            {m.id === 'UPI' && <Field label="UPI ID" error={errs.upi}><input value={pay.upi} onChange={e => setPay({ ...pay, upi: e.target.value })} placeholder="name@okhdfc" className={inputCls(errs.upi)}/></Field>}
            {m.id === 'Credit/Debit Card' && <div className="grid gap-4 sm:grid-cols-2"><Field label="Card number" error={errs.number} className="sm:col-span-2"><input inputMode="numeric" autoComplete="cc-number" value={pay.number} onChange={e => setPay({ ...pay, number: fmtCard(e.target.value) })} placeholder="1234 5678 9012 3456" className={inputCls(errs.number)}/></Field>
              <Field label="Name on card" error={errs.name} className="sm:col-span-2"><input autoComplete="cc-name" value={pay.name} onChange={e => setPay({ ...pay, name: e.target.value })} className={inputCls(errs.name)}/></Field>
              <Field label="Expiry" error={errs.exp}><input inputMode="numeric" autoComplete="cc-exp" value={pay.exp} onChange={e => setPay({ ...pay, exp: fmtExp(e.target.value) })} placeholder="MM/YY" className={inputCls(errs.exp)}/></Field>
              <Field label="CVV" error={errs.cvv}><input inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={pay.cvv} onChange={e => setPay({ ...pay, cvv: e.target.value.replace(/\D/g, '') })} className={inputCls(errs.cvv)}/></Field><p className="text-xs text-ink/50 sm:col-span-2">Demo: any details work. A card ending 0002 simulates a declined payment. Card details are never stored.</p></div>}
            {m.id === 'Net Banking' && <div><div className="grid gap-2 sm:grid-cols-2">{BANKS.map(b => <button type="button" key={b} onClick={() => setPay({ ...pay, bank: b })} aria-pressed={pay.bank === b} className={`border px-4 py-3 text-left text-sm ${pay.bank === b ? 'border-ink bg-cream' : 'border-sand'}`}>{b}</button>)}</div>{errs.bank && <p role="alert" className="mt-2 text-xs text-rose">{errs.bank}</p>}</div>}
            {m.id === 'Cash on Delivery' && <p className="text-sm text-ink/70">Pay in cash or UPI when your order arrives. A ₹40 handling fee applies and is included in your total.</p>}</div></motion.div>}</AnimatePresence></div>)}</div>
        <Next onClick={() => validatePay() && setStep(4)}>Review order</Next></div>}
      {step === 4 && <div><Heading n="5" t="Review your order"/><div className="mt-6 space-y-6">
        <section className="border border-sand p-5"><h3 className="text-xl">Items</h3><ul className="mt-3 divide-y divide-sand">{items.map(i => <li key={i.productId + i.shade} className="flex gap-4 py-3 text-sm"><ProductImage p={i} className="h-16 w-14 shrink-0 object-cover"/><div className="flex-1"><p className="text-[11px] uppercase tracking-widest text-ink/50">{i.brand}</p><p className="font-serif text-lg leading-tight">{i.name}</p><p className="text-ink/60">{i.shade && `${i.shade} · `}Qty {i.qty} × {inr(i.price)}</p></div><b className="font-medium">{inr(i.price * i.qty)}</b></li>)}</ul></section>
        <div className="grid gap-6 md:grid-cols-3">{[['Ship to', 1, <AddressBlock a={d.address}/>], ['Delivery', 2, <><p className="text-sm font-medium">{totals.option.label}</p><p className="text-sm text-ink/60">Arrives {range(totals.option)}</p><p className="mt-1 text-sm text-ink/60">{email}</p></>],
          ['Payment', 3, <><p className="text-sm font-medium">{method.label}</p><p className="text-sm text-ink/60">{d.method === 'UPI' ? pay.upi : d.method === 'Credit/Debit Card' ? `Card ending ${pay.number.replace(/\s/g, '').slice(-4)}` : d.method === 'Net Banking' ? pay.bank : method.hint}</p></>]].map(([t, s, c]) =>
          <section key={t} className="border border-sand p-5"><div className="flex items-center justify-between"><h3 className="text-xl">{t}</h3><button onClick={() => { setEditing(false); setStep(s) }} className="text-xs uppercase tracking-widest underline">Change</button></div><div className="mt-3">{c}</div></section>)}</div></div>
        <ErrorBanner>{payErr}</ErrorBanner>
        <div className="mt-8 flex flex-wrap items-center gap-4"><button disabled={placing} onClick={place} className="btn-dark min-w-56">{placing ? <><Spinner/>{d.method === 'Cash on Delivery' ? 'Placing order' : 'Processing payment'}</> : `Place order · ${inr(totals.total)}`}</button><button disabled={placing} onClick={() => setStep(3)} className="text-xs uppercase tracking-widest underline">Back</button></div>
        <p className="mt-4 max-w-md text-xs text-ink/50">By placing your order you agree to BEAUTIQ's Terms of Service and Returns Policy.</p></div>}
    </motion.div></AnimatePresence></div>
    <aside className="h-fit bg-cream p-6 lg:sticky lg:top-24"><h2 className="text-2xl">Order summary</h2>
      <ul className="mt-4 max-h-64 space-y-3 overflow-auto">{items.map(i => <li key={i.productId + i.shade} className="flex gap-3 text-sm"><div className="relative"><ProductImage p={i} className="h-14 w-12 shrink-0 object-cover"/><span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-ivory">{i.qty}</span></div><div className="min-w-0 flex-1"><p className="truncate font-serif text-base leading-tight">{i.name}</p><p className="text-xs text-ink/50">{i.shade || i.brand}</p></div><span>{inr(i.price * i.qty)}</span></li>)}</ul>
      <div className="mt-4 flex gap-2"><input value={code} onChange={e => setCode(e.target.value)} placeholder="Coupon code" aria-label="Coupon code" className="w-full border border-sand bg-ivory px-3 py-2 text-sm"/><button onClick={applyCode} className="btn-line !px-4">Apply</button></div>
      {cErr && <p className="mt-1 text-xs text-rose">{cErr}</p>}{totals.couponOk && <p className="mt-1 flex justify-between text-xs text-rose"><span>{coupon} applied</span><button onClick={() => setCoupon('')} className="underline">Remove</button></p>}{coupon && !totals.couponOk && <p className="mt-1 text-xs text-rose">{totals.couponReason} <button onClick={() => setCoupon('')} className="underline">Remove</button></p>}
      <dl className="mt-5 space-y-2 text-sm">{[['Subtotal', totals.subtotal], ['Discount', -totals.discount], ['Shipping', totals.shipping], ...(totals.codFee ? [['COD fee', totals.codFee]] : [])].map(([k, v]) => <div key={k} className="flex justify-between"><dt>{k}</dt><dd>{v < 0 ? '−' : ''}{k === 'Shipping' && v === 0 ? 'Free' : inr(Math.abs(v))}</dd></div>)}
        <div className="flex justify-between border-t border-ink pt-3 text-lg font-medium"><dt>Total</dt><dd>{inr(totals.total)}</dd></div></dl></aside></div></div>)
}
