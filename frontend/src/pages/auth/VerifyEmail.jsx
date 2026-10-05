import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useAuth } from '../../context/Auth'
import { sendOtp, peekDemoOtp } from '../../services/authService'
import { useStore } from '../../context/Store'
import { AuthShell, AuthLink, ErrorBanner, OtpInput, useCountdown, DemoCode } from './parts'
import { Spinner } from '../../components/ui'
export default function VerifyEmail() {
  const [sp] = useSearchParams(), email = sp.get('email') || '', next = sp.get('next') || '/account', { verify } = useAuth(), { notify } = useStore(), go = useNavigate()
  const [code, setCode] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [done, setDone] = useState(false), [left, restart] = useCountdown(60), [demo, setDemo] = useState(() => peekDemoOtp(email))
  useEffect(() => { if (done) { const t = setTimeout(() => go(next, { replace: true }), 1600); return () => clearTimeout(t) } }, [done])
  const submit = async c => { if (busy) return; setErr(''); setBusy(true)
    try { await verify(email, c); setDone(true); notify('Email verified') } catch (ex) { setErr(ex.message); setCode('') } finally { setBusy(false) } }
  const resend = async () => { setErr(''); setCode(''); const r = await sendOtp(email, 'verify'); setDemo(r.code); restart(); notify('A new code has been sent') }
  if (!email) return <AuthShell title="Nothing to verify" subtitle="Open the verification link from your sign-up, or create an account first."><Link to="/register" className="btn-dark w-full">Create an account</Link></AuthShell>
  if (done) return <AuthShell title="Email verified"><div role="status" className="text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink text-ivory"><Check size={28}/></span><p className="mt-5 text-ink/70">You're all set. Taking you to your account…</p><Link to={next} className="btn-dark mt-6">Continue</Link></div></AuthShell>
  return (<AuthShell title="Check your email" subtitle={<>We sent a 6-digit code to <b className="font-medium text-ink">{email}</b>.</>} footer={<>Wrong email? <AuthLink to="/register">Start again</AuthLink></>}>
    <DemoCode code={demo}/><ErrorBanner>{err}</ErrorBanner>
    <OtpInput value={code} onChange={setCode} error={err} disabled={busy} onComplete={submit}/>
    <button onClick={() => submit(code)} disabled={busy || code.length < 6} className="btn-dark mt-6 w-full disabled:opacity-40">{busy ? <><Spinner/>Verifying</> : 'Verify email'}</button>
    <p className="mt-5 text-center text-sm text-ink/60">{left > 0 ? <>Resend code in <b className="font-medium tabular-nums text-ink">0:{String(left).padStart(2, '0')}</b></> : <button onClick={resend} className="underline underline-offset-4 hover:text-rose">Resend code</button>}</p></AuthShell>)
}
