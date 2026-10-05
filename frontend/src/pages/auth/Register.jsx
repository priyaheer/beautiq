import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/Auth'
import { sendOtp } from '../../services/authService'
import { isEmail, passwordChecks, passwordOk } from '../../lib/validate'
import { Field, inputCls, Spinner, PasswordMeter } from '../../components/ui'
import { AuthShell, AuthLink, ErrorBanner, PasswordInput, GoogleButton, OrDivider } from './parts'
export default function Register() {
  const { register, google } = useAuth(), go = useNavigate(), [sp] = useSearchParams(), next = sp.get('next') || '/account'
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', terms: false }), [err, setErr] = useState({}), [fail, setFail] = useState(''), [busy, setBusy] = useState(false), [gBusy, setG] = useState(false)
  const check = v => { const e = {}; if (v.name.trim().length < 2) e.name = 'Enter your full name'; if (!isEmail(v.email)) e.email = 'Enter a valid email address'
    if (!passwordOk(v.password)) e.password = 'Password does not meet all requirements'; if (v.confirm !== v.password) e.confirm = 'Passwords do not match'; if (!v.terms) e.terms = 'Please accept the terms to continue'; return e }
  const submit = async e => { e.preventDefault(); setFail(''); const x = check(f); setErr(x); if (Object.keys(x).length) return; setBusy(true)
    try { await register(f); await sendOtp(f.email, 'verify'); go(`/verify-email?email=${encodeURIComponent(f.email.trim())}&next=${encodeURIComponent(next)}`) } catch (ex) { setFail(ex.message) } finally { setBusy(false) } }
  const g = async () => { setFail(''); setG(true); try { await google(); go(next, { replace: true }) } catch (ex) { setFail(ex.message) } finally { setG(false) } }
  return (<AuthShell title="Create your account" subtitle="Save addresses, track orders and keep a wishlist." footer={<>Already a member? <AuthLink to="/login">Sign in</AuthLink></>}>
    <ErrorBanner>{fail}</ErrorBanner>
    <GoogleButton onClick={g} busy={gBusy} label="Sign up with Google"/><OrDivider/>
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="Full name" error={err.name}><input autoComplete="name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inputCls(err.name)}/></Field>
      <Field label="Email" error={err.email}><input type="email" autoComplete="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className={inputCls(err.email)}/></Field>
      <Field label="Password" error={err.password}><PasswordInput value={f.password} onChange={e => setF({ ...f, password: e.target.value })} error={err.password} autoComplete="new-password"/>{f.password && <PasswordMeter checks={passwordChecks(f.password)}/>}</Field>
      <Field label="Confirm password" error={err.confirm}><PasswordInput value={f.confirm} onChange={e => setF({ ...f, confirm: e.target.value })} error={err.confirm} autoComplete="new-password"/></Field>
      <div><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={f.terms} onChange={e => setF({ ...f, terms: e.target.checked })} className="mt-1 accent-rose"/><span>I agree to the BEAUTIQ Terms of Service and Privacy Policy.</span></label>{err.terms && <p role="alert" className="mt-1 text-xs text-rose">{err.terms}</p>}</div>
      <button disabled={busy} className="btn-dark w-full">{busy ? <><Spinner/>Creating account</> : 'Create account'}</button></form>
  </AuthShell>)
}
