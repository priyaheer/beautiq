import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { useAuth } from '../../context/Auth'
import { useStore } from '../../context/Store'
import { isEmail, isPhone } from '../../lib/validate'
import { Avatar, Field, inputCls, Spinner } from '../../components/ui'
export default function Profile() {
  const { user, update } = useAuth(), { notify } = useStore(), [f, setF] = useState({ name: user.name, email: user.email, phone: user.phone || '', avatar: user.avatar }), [err, setErr] = useState({}), [busy, setBusy] = useState(false), file = useRef()
  const pick = e => { const x = e.target.files?.[0]; if (!x) return; if (!x.type.startsWith('image/')) return setErr({ avatar: 'Choose an image file' }); if (x.size > 1.5e6) return setErr({ avatar: 'Image must be under 1.5 MB' })
    const r = new FileReader(); r.onload = () => { setF(v => ({ ...v, avatar: r.result })); setErr({}) }; r.readAsDataURL(x) }
  const submit = async e => { e.preventDefault(); const x = {}; if (f.name.trim().length < 2) x.name = 'Enter your name'; if (!isEmail(f.email)) x.email = 'Enter a valid email address'; if (f.phone && !isPhone(f.phone)) x.phone = 'Enter a valid 10-digit mobile number'
    setErr(x); if (Object.keys(x).length) return; setBusy(true); try { await update(f); notify('Profile updated') } catch (ex) { setErr({ email: ex.message }) } finally { setBusy(false) } }
  const dirty = f.name !== user.name || f.email !== user.email || f.phone !== (user.phone || '') || f.avatar !== user.avatar
  return (<div><h1 className="text-4xl">Profile</h1><form onSubmit={submit} noValidate className="mt-8 max-w-xl space-y-5">
    <div className="flex items-center gap-5"><div className="relative"><Avatar user={{ ...user, avatar: f.avatar, name: f.name }} size={88}/><button type="button" onClick={() => file.current.click()} aria-label="Change profile photo" className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-ink text-ivory"><Camera size={14}/></button></div>
      <div className="text-sm"><input ref={file} type="file" accept="image/*" hidden onChange={pick}/><button type="button" onClick={() => file.current.click()} className="underline">Upload photo</button>{f.avatar && <button type="button" onClick={() => setF({ ...f, avatar: null })} className="ml-4 text-ink/60 underline">Remove</button>}<p className="mt-1 text-xs text-ink/50">JPG or PNG, up to 1.5 MB.</p>{err.avatar && <p className="text-xs text-rose">{err.avatar}</p>}</div></div>
    <Field label="Full name" error={err.name}><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inputCls(err.name)}/></Field>
    <Field label="Email" error={err.email}><input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className={inputCls(err.email)}/></Field>
    <Field label="Phone" error={err.phone} hint="Used for delivery updates"><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} inputMode="numeric" className={inputCls(err.phone)}/></Field>
    <button disabled={busy || !dirty} className="btn-dark disabled:opacity-40">{busy ? <><Spinner/>Saving</> : 'Save changes'}</button></form></div>)
}
