import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { listCoupons, saveCoupon, deleteCoupon } from '../../services/couponService'
import { useStore } from '../../context/Store'
import { Modal, StatusBadge, Spinner } from '../../components/ui'
import { fmtDate } from '../../lib/format'
const blank = { code: '', type: 'percent', value: '', minOrder: 0, expiry: '', active: true, description: '' }
export default function AdminCoupons() {
  const [rows, setRows] = useState([]), [form, setForm] = useState(null), [del, setDel] = useState(null), [err, setErr] = useState(''), { notify } = useStore(), [busy, setBusy] = useState(false)
  const load = () => listCoupons().then(setRows); useEffect(load, [])
  const save = async () => { setBusy(true); setErr(''); try { await saveCoupon(form); await load(); setForm(null); notify(form.id ? 'Coupon updated' : 'Coupon created') } catch (e) { setErr(e.message) } finally { setBusy(false) } }
  const remove = async () => { await deleteCoupon(del.id); await load(); setDel(null); notify('Coupon deleted') }
  return (<div><div className="flex items-center justify-between"><h1 className="text-4xl">Coupons</h1><button onClick={() => setForm(blank)} className="btn-dark"><Plus size={14}/>Create coupon</button></div>
    <div className="mt-6 overflow-x-auto"><table className="w-full text-sm"><thead className="text-xs uppercase tracking-widest text-ink/50"><tr>{['Code', 'Type', 'Value', 'Min order', 'Expiry', 'Used', 'Status', ''].map(h => <th key={h} className="border-b border-sand pb-2 text-left">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-sand">{rows.map(c => <tr key={c.id} className="hover:bg-cream/40"><td className="py-3 font-mono font-medium">{c.code}</td><td className="py-3 text-xs text-ink/60">{c.type}</td><td className="py-3">{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}</td><td className="py-3">₹{c.minOrder || 0}</td><td className="py-3 text-xs">{c.expiry ? fmtDate(c.expiry) : '—'}</td><td className="py-3">{c.used}</td><td className="py-3"><StatusBadge status={c.active ? 'active' : 'inactive'}/></td>
        <td className="py-3"><div className="flex gap-3"><button onClick={() => setForm(c)} aria-label="Edit"><Pencil size={14}/></button><button onClick={() => setDel(c)} aria-label="Delete" className="hover:text-rose"><Trash2 size={14}/></button></div></td></tr>)}</tbody></table></div>
    <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Edit coupon' : 'Create coupon'}><div className="grid gap-4">{err && <p className="text-xs text-rose">{err}</p>}
      {[['code', 'Coupon code (uppercase)', {}], ['description', 'Description', {}], ['value', 'Discount value', { type: 'number', min: 0 }], ['minOrder', 'Minimum order (₹)', { type: 'number', min: 0 }], ['expiry', 'Expiry date', { type: 'date' }]].map(([k, l, p]) => <label key={k} className="block text-sm"><span className="mb-1 block text-xs uppercase tracking-widest text-ink/60">{l}</span><input value={form?.[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full border border-sand bg-ivory px-3 py-2" {...p}/></label>)}
      <label className="block text-sm"><span className="mb-1 block text-xs uppercase tracking-widest text-ink/60">Type</span><select value={form?.type || 'percent'} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border border-sand bg-ivory px-3 py-2"><option value="percent">Percentage off</option><option value="flat">Flat amount off</option></select></label>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={form?.active !== false} onChange={e => setForm({ ...form, active: e.target.checked })}/>Active</label>
      <button disabled={busy} onClick={save} className="btn-dark">{busy ? <><Spinner/>Saving</> : 'Save coupon'}</button></div></Modal>
    <Modal open={!!del} onClose={() => setDel(null)} title="Delete coupon?"><p className="text-sm">Remove <b>{del?.code}</b>?</p><div className="mt-5 flex gap-3"><button onClick={remove} className="btn-dark">Delete</button><button onClick={() => setDel(null)} className="btn-line">Cancel</button></div></Modal></div>)
}
