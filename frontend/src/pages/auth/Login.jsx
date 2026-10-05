import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/Auth'
import { sendOtp } from '../../services/authService'
import { isEmail } from '../../lib/validate'
import { Field, inputCls, Spinner } from '../../components/ui'
import { AuthShell, AuthLink, ErrorBanner, PasswordInput, GoogleButton, OrDivider } from './parts'
export default function Login() {
  const { login, google } = useAuth(), go = useNavigate(), [sp] = useSearchParams(), next = sp.get('next') || '/account'
  const [f, setF] = useState({ email: '', password: '', remember: true }), [err, setErr] = useState({}), [fail, setFail] = useState(''), [busy, setBusy] = useState(false), [gBusy, setG] = useState(false)
  const check = v => { const e = {}; if (!v.email.trim()) e.email = 'Enter your email address'; else if (!isEmail(v.email)) e.email = 'Enter a valid email address'; if (!v.password) e.password = 'Enter your password'; return e }
  const submit = async e => { e.preventDefault(); setFail(''); const x = check(f); setErr(x); if (Object.keys(x).length) return
    setBusy(true)
    try { await login(f); go(next, { replace: true }) }
    catch (ex) { if (ex.code === 'UNVERIFIED') { await sendOtp(f.email, 'verify'); return go(`/verify-email?email=${encodeURIComponent(f.email)}&next=${encodeURIComponent(next)}`) } setFail(ex.message) }
    finally { setBusy(false) } }
  const g = async () => { setFail(''); setG(true); try { await google(); go(next, { replace: true }) } catch (ex) { setFail(ex.message) } finally { setG(false) } }
  return (<AuthShell title="Welcome back" subtitle="Sign in to track orders and check out faster." footer={<>New to BEAUTIQ? <AuthLink to={`/register${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`}>Create an account</AuthLink></>}>
    <ErrorBanner>{fail}</ErrorBanner>
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="Email" error={err.email}><input type="email" autoComplete="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} aria-invalid={!!err.email} className={inputCls(err.email)} placeholder="you@example.com"/></Field>
      <Field label="Password" error={err.password}><PasswordInput value={f.password} onChange={e => setF({ ...f, password: e.target.value })} error={err.password} autoComplete="current-password"/></Field>
      <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={f.remember} onChange={e => setF({ ...f, remember: e.target.checked })} className="accent-rose"/>Remember me</label><Link to="/forgot-password" className="underline underline-offset-4 hover:text-rose">Forgot password?</Link></div>
      <button disabled={busy} className="btn-dark w-full">{busy ? <><Spinner/>Signing in</> : 'Sign in'}</button></form>
    <OrDivider/><GoogleButton onClick={g} busy={gBusy}/>
    <div className="mt-6 border border-dashed border-sand bg-cream/60 p-4 text-xs text-ink/70"><p className="font-medium text-ink">Demo accounts</p><p className="mt-1">Customer: aanya.sharma@example.com / Beautiq@123</p><p>Admin: admin@beautiq.in / Admin@123</p>
      <div className="mt-2 flex gap-4 underline"><button type="button" onClick={() => setF({ ...f, email: 'aanya.sharma@example.com', password: 'Beautiq@123' })}>Fill customer</button><button type="button" onClick={() => setF({ ...f, email: 'admin@beautiq.in', password: 'Admin@123' })}>Fill admin</button></div></div>
  </AuthShell>)
}
