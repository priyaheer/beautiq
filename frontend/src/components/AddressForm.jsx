import { useState } from 'react'
import { Field, inputCls, Spinner } from './ui'
import { isPhone, isPin } from '../lib/validate'
export const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']
export const blankAddress = (u = {}) => ({ label: 'Home', name: u.name || '', phone: u.phone || '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false })
export const validateAddress = a => { const e = {}
  if (a.name.trim().length < 2) e.name = 'Enter the recipient\'s full name'; if (!isPhone(a.phone)) e.phone = 'Enter a valid 10-digit mobile number'; if (a.line1.trim().length < 5) e.line1 = 'Enter your street address'
  if (!a.city.trim()) e.city = 'Enter your city'; if (!a.state) e.state = 'Select your state'; if (!isPin(a.pincode)) e.pincode = 'Enter a valid 6-digit PIN code'; return e }
export default function AddressForm({ initial, onSubmit, onCancel, submitLabel = 'Save address', showDefault = true, showSave, extra }) {
  const [a, setA] = useState(initial), [err, setErr] = useState({}), [busy, setBusy] = useState(false), set = (k, v) => setA(x => ({ ...x, [k]: v }))
  const submit = async e => { e.preventDefault(); e.stopPropagation(); const x = validateAddress(a); setErr(x); if (Object.keys(x).length) return; setBusy(true); try { await onSubmit(a) } finally { setBusy(false) } }
  const inp = (k, label, props = {}, cls = '') => <Field label={label} error={err[k]} className={cls}><input value={a[k]} onChange={e => set(k, e.target.value)} aria-invalid={!!err[k]} className={inputCls(err[k])} {...props}/></Field>
  return <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
    <div className="sm:col-span-2"><span className="mb-1.5 block text-xs uppercase tracking-widest text-ink/60">Address type</span><div className="flex gap-2">{['Home', 'Office', 'Other'].map(l => <button type="button" key={l} aria-pressed={a.label === l} onClick={() => set('label', l)} className={`border px-4 py-2 text-sm ${a.label === l ? 'border-ink bg-ink text-ivory' : 'border-sand'}`}>{l}</button>)}</div></div>
    {inp('name', 'Full name', { autoComplete: 'name' })}{inp('phone', 'Phone', { autoComplete: 'tel', inputMode: 'numeric', placeholder: '10-digit mobile number' })}
    {inp('line1', 'Address', { autoComplete: 'address-line1', placeholder: 'House / flat no., street' }, 'sm:col-span-2')}{inp('line2', 'Landmark (optional)', { autoComplete: 'address-line2' }, 'sm:col-span-2')}
    {inp('city', 'City', { autoComplete: 'address-level2' })}
    <Field label="State" error={err.state}><select value={a.state} onChange={e => set('state', e.target.value)} className={inputCls(err.state)}><option value="">Select state</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></Field>
    {inp('pincode', 'Postal code', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6 })}
    <div className="flex flex-col justify-end gap-2 pb-1 text-sm">{showDefault && <label className="flex items-center gap-2"><input type="checkbox" checked={a.isDefault} onChange={e => set('isDefault', e.target.checked)} className="accent-rose"/>Make this my default address</label>}{showSave}</div>
    {extra}<div className="flex gap-3 sm:col-span-2"><button disabled={busy} className="btn-dark">{busy ? <><Spinner/>Saving</> : submitLabel}</button>{onCancel && <button type="button" onClick={onCancel} className="btn-line">Cancel</button>}</div></form>
}
export const AddressBlock = ({ a }) => <address className="text-sm not-italic leading-relaxed text-ink/80"><b className="font-medium text-ink">{a.name}</b><br/>{a.line1}{a.line2 && `, ${a.line2}`}<br/>{a.city}, {a.state} {a.pincode}<br/>Phone: {a.phone}</address>
