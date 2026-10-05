import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestPasswordReset, confirmResetOtp, sendOtp } from '../../services/authService'
import { isEmail } from '../../lib/validate'
import { Field, inputCls, Spinner } from '../../components/ui'
import { AuthShell, AuthLink, ErrorBanner, OtpInput, useCountdown, DemoCode, Stepper } from './parts'
export const RESET_STEPS = ['Email', 'Verify', 'New password', 'Done']
export default function ForgotPassword() {
  const go = useNavigate(), [step, setStep] = useState(0), [email, setEmail] = useState(''), [code, setCode] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [demo, setDemo] = useState(null), [left, restart] = useCountdown(60)
  const send = async e => { e.preventDefault(); setErr(''); if (!isEmail(email)) return setErr('Enter a valid email address'); setBusy(true)
    try { const r = await requestPasswordReset(email); setDemo(r.code); restart(); setStep(1) } catch (ex) { setErr(ex.message) } finally { setBusy(false) } }
  const verify = async c => { if (busy) return; setErr(''); setBusy(true); try { await confirmResetOtp(email, c); go('/reset-password') } catch (ex) { setErr(ex.message); setCode('') } finally { setBusy(false) } }
  const resend = async () => { setErr(''); setCode(''); const r = await sendOtp(email, 'reset'); setDemo(r.code); restart() }
  return (<AuthShell title={step ? 'Enter your code' : 'Forgot your password?'} subtitle={step ? <>We sent a 6-digit code to <b className="font-medium text-ink">{email}</b>.</> : "Enter your email and we'll send a code to reset it."} footer={<>Remembered it? <AuthLink to="/login">Back to sign in</AuthLink></>}>
    <Stepper steps={RESET_STEPS} current={step}/><ErrorBanner>{err}</ErrorBanner>
    {step === 0 ? <form onSubmit={send} noValidate className="space-y-5"><Field label="Email"><input type="email" autoComplete="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} className={inputCls(err)} placeholder="you@example.com"/></Field>
      <button disabled={busy} className="btn-dark w-full">{busy ? <><Spinner/>Sending code</> : 'Send reset code'}</button></form>
    : <div><DemoCode code={demo}/><OtpInput value={code} onChange={setCode} error={err} disabled={busy} onComplete={verify}/>
      <button onClick={() => verify(code)} disabled={busy || code.length < 6} className="btn-dark mt-6 w-full disabled:opacity-40">{busy ? <><Spinner/>Verifying</> : 'Verify code'}</button>
      <p className="mt-5 text-center text-sm text-ink/60">{left > 0 ? <>Resend code in <b className="font-medium tabular-nums text-ink">0:{String(left).padStart(2, '0')}</b></> : <button onClick={resend} className="underline underline-offset-4 hover:text-rose">Resend code</button>}</p>
      <button onClick={() => { setStep(0); setCode(''); setErr('') }} className="mx-auto mt-3 block text-xs uppercase tracking-widest text-ink/50 underline">Use a different email</button></div>}
  </AuthShell>)
}
