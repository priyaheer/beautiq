import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { getResetContext, resetPassword } from '../../services/authService'
import { passwordChecks, passwordOk } from '../../lib/validate'
import { Field, Spinner, PasswordMeter } from '../../components/ui'
import { AuthShell, ErrorBanner, PasswordInput, Stepper } from './parts'
import { RESET_STEPS } from './ForgotPassword'
export default function ResetPassword() {
  const [ctx] = useState(getResetContext), [pw, setPw] = useState(''), [cf, setCf] = useState(''), [err, setErr] = useState({}), [fail, setFail] = useState(''), [busy, setBusy] = useState(false), [done, setDone] = useState(false)
  if (!ctx && !done) return <AuthShell title="This reset link has expired" subtitle="For your security, reset sessions only last a few minutes."><Link to="/forgot-password" className="btn-dark w-full">Start again</Link></AuthShell>
  if (done) return <AuthShell title="Password updated"><Stepper steps={RESET_STEPS} current={4}/><div role="status" className="text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink text-ivory"><Check size={28}/></span><p className="mt-5 text-ink/70">Your password has been changed. Sign in with your new password.</p><Link to="/login" className="btn-dark mt-6 w-full">Sign in</Link></div></AuthShell>
  const submit = async e => { e.preventDefault(); setFail(''); const x = {}; if (!passwordOk(pw)) x.pw = 'Password does not meet all requirements'; if (cf !== pw) x.cf = 'Passwords do not match'; setErr(x); if (Object.keys(x).length) return
    setBusy(true); try { await resetPassword(pw); setDone(true) } catch (ex) { setFail(ex.message) } finally { setBusy(false) } }
  return (<AuthShell title="Set a new password" subtitle={`Choose a strong password for ${ctx.email}.`}><Stepper steps={RESET_STEPS} current={2}/><ErrorBanner>{fail}</ErrorBanner>
    <form onSubmit={submit} noValidate className="space-y-5"><Field label="New password" error={err.pw}><PasswordInput value={pw} onChange={e => setPw(e.target.value)} error={err.pw} autoComplete="new-password"/>{pw && <PasswordMeter checks={passwordChecks(pw)}/>}</Field>
      <Field label="Confirm new password" error={err.cf}><PasswordInput value={cf} onChange={e => setCf(e.target.value)} error={err.cf} autoComplete="new-password"/></Field>
      <button disabled={busy} className="btn-dark w-full">{busy ? <><Spinner/>Updating</> : 'Update password'}</button></form></AuthShell>)
}
