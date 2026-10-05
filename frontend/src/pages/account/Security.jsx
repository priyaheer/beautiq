import { useState } from 'react'
import { ShieldCheck, Smartphone, Clock } from 'lucide-react'
import { useAuth } from '../../context/Auth'
import { useStore } from '../../context/Store'
import { changePassword } from '../../services/userService'
import { passwordChecks, passwordOk } from '../../lib/validate'
import { Field, Spinner, PasswordMeter } from '../../components/ui'
import { PasswordInput } from '../auth/parts'
import { fmtDate } from '../../lib/format'
export default function Security() {
  const { user, refresh } = useAuth(), { notify } = useStore(), [f, setF] = useState({ cur: '', next: '', cf: '' }), [err, setErr] = useState({}), [busy, setBusy] = useState(false)
  const submit = async e => { e.preventDefault(); const x = {}; if (!f.cur) x.cur = 'Enter your current password'; if (!passwordOk(f.next)) x.next = 'Password does not meet all requirements'; else if (f.next === f.cur) x.next = 'Choose a password you have not used just now'; if (f.cf !== f.next) x.cf = 'Passwords do not match'
    setErr(x); if (Object.keys(x).length) return; setBusy(true)
    try { await changePassword(user.id, f.cur, f.next); setF({ cur: '', next: '', cf: '' }); await refresh(); notify('Password changed') } catch (ex) { setErr({ cur: ex.message }) } finally { setBusy(false) } }
  const info = [[ShieldCheck, 'Email', user.verified ? 'Verified' : 'Not verified'], [Clock, 'Password', user.passwordChangedAt ? `Changed ${fmtDate(user.passwordChangedAt)}` : 'Never changed'], [Smartphone, 'Member since', fmtDate(user.joined)]]
  return (<div><h1 className="text-4xl">Security</h1><div className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]">
    <form onSubmit={submit} noValidate className="max-w-xl space-y-5"><h2 className="text-2xl">Change password</h2>
      <Field label="Current password" error={err.cur}><PasswordInput value={f.cur} onChange={e => setF({ ...f, cur: e.target.value })} error={err.cur} autoComplete="current-password"/></Field>
      <Field label="New password" error={err.next}><PasswordInput value={f.next} onChange={e => setF({ ...f, next: e.target.value })} error={err.next} autoComplete="new-password"/>{f.next && <PasswordMeter checks={passwordChecks(f.next)}/>}</Field>
      <Field label="Confirm new password" error={err.cf}><PasswordInput value={f.cf} onChange={e => setF({ ...f, cf: e.target.value })} error={err.cf} autoComplete="new-password"/></Field>
      <button disabled={busy} className="btn-dark">{busy ? <><Spinner/>Updating</> : 'Update password'}</button></form>
    <aside className="h-fit bg-cream p-6"><h2 className="text-2xl">Security overview</h2><ul className="mt-4 space-y-4 text-sm">{info.map(([I, l, v]) => <li key={l} className="flex gap-3"><I size={18} className="mt-0.5 text-rose"/><div><p className="font-medium">{l}</p><p className="text-ink/60">{v}</p></div></li>)}</ul>
      <p className="mt-5 text-xs text-ink/60">BEAUTIQ will never ask for your password by email or phone.</p></aside></div></div>)
}
