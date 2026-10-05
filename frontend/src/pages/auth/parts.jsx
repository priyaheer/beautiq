import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Art, inputCls } from '../../components/ui'

export function AuthShell({ title, subtitle, children, footer }) {
  return (<div className="grid min-h-[calc(100vh-7rem)] lg:grid-cols-[1fr_1.1fr]">
    <div className="relative hidden lg:block"><Art hue={22} variant={1} className="absolute inset-0"/><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-12 text-ivory"><p className="max-w-sm font-serif text-4xl leading-tight">Beauty, curated for you.</p><p className="mt-3 max-w-sm text-sm text-ivory/80">Track orders, save addresses and keep your rituals in one place.</p></div></div>
    <div className="grid place-items-center px-5 py-12 md:px-10"><div className="w-full max-w-md"><h1 className="text-4xl md:text-5xl">{title}</h1>{subtitle && <p className="mt-2 text-ink/60">{subtitle}</p>}<div className="mt-8">{children}</div>{footer && <div className="mt-8 text-center text-sm text-ink/70">{footer}</div>}</div></div></div>)
}
export const AuthLink = ({ to, children }) => <Link to={to} className="underline underline-offset-4 hover:text-rose">{children}</Link>
export const ErrorBanner = ({ children }) => children ? <div role="alert" className="mb-5 border border-rose/40 bg-rose/5 px-4 py-3 text-sm text-rose">{children}</div> : null

export function PasswordInput({ value, onChange, error, id, placeholder, autoComplete, onBlur }) {
  const [show, setShow] = useState(false)
  return <div className="relative"><input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={!!error} className={`${inputCls(error)} pr-11`}/>
    <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50 hover:text-ink">{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
}
export const GoogleButton = ({ onClick, busy, label = 'Continue with Google' }) => <button type="button" onClick={onClick} disabled={busy} className="flex w-full items-center justify-center gap-3 border border-sand bg-ivory px-6 py-3 text-sm transition hover:border-ink disabled:opacity-60">
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>{busy ? 'Connecting…' : label}</button>
export const OrDivider = () => <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-ink/40"><i className="h-px flex-1 bg-sand"/>or<i className="h-px flex-1 bg-sand"/></div>

export function OtpInput({ value, onChange, error, disabled, onComplete }) {
  const refs = useRef([]), digits = Array.from({ length: 6 }, (_, i) => value[i] || '')
  const set = (i, d) => { const next = digits.map((x, k) => k === i ? d : x).join(''); onChange(next); if (d && i < 5) refs.current[i + 1]?.focus(); if (next.length === 6 && !next.includes(' ') && digits.every((x, k) => k === i || x)) onComplete?.(next) }
  const key = (i, e) => { if (e.key === 'Backspace') { e.preventDefault(); if (digits[i]) set(i, ''); else if (i > 0) { refs.current[i - 1]?.focus(); onChange(digits.map((x, k) => k === i - 1 ? '' : x).join('')) } }
    else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus(); else if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus() }
  const paste = e => { const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); if (!t) return; e.preventDefault(); onChange(t); refs.current[Math.min(t.length, 5)]?.focus(); if (t.length === 6) onComplete?.(t) }
  return <motion.div key={error || 'ok'} animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: .4 }} className="flex justify-between gap-2" role="group" aria-label="6-digit verification code">
    {digits.map((d, i) => <input key={i} ref={el => refs.current[i] = el} value={d} disabled={disabled} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={1} aria-label={`Digit ${i + 1}`} onPaste={paste} onKeyDown={e => key(i, e)}
      onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v) set(i, v.slice(-1)) }} onFocus={e => e.target.select()}
      className={`h-14 w-full min-w-0 border bg-ivory text-center font-serif text-3xl outline-none transition focus:border-ink disabled:opacity-50 ${error ? 'border-rose' : d ? 'border-ink' : 'border-sand'}`}/>)}</motion.div>
}
export function useCountdown(start = 60) {
  const [left, setLeft] = useState(start)
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft(l => l - 1), 1000); return () => clearTimeout(t) }, [left])
  return [left, () => setLeft(start)]
}
export const DemoCode = ({ code }) => code ? <p className="mb-5 border border-dashed border-nude bg-cream px-4 py-3 text-xs text-ink/70">Demo mode — no email is sent. Your code is <b className="font-medium tracking-widest text-ink">{code}</b></p> : null
export function Stepper({ steps, current }) {
  return <ol className="mb-8 flex items-center gap-2 text-xs">{steps.map((s, i) => <li key={s} className="flex flex-1 items-center gap-2"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] ${i < current ? 'border-ink bg-ink text-ivory' : i === current ? 'border-ink' : 'border-sand text-ink/40'}`}>{i < current ? <Check size={12}/> : i + 1}</span>
    <span className={`hidden sm:inline ${i === current ? '' : 'text-ink/40'}`}>{s}</span>{i < steps.length - 1 && <i className="h-px flex-1 bg-sand"/>}</li>)}</ol>
}
