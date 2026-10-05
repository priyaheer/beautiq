import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { listBrands, saveBrand, deleteBrand } from '../../services/brandService'
import { useStore } from '../../context/Store'
import { Modal, Spinner } from '../../components/ui'
export default function AdminBrands() {
  const [rows, setRows] = useState([]), [form, setForm] = useState(null), [del, setDel] = useState(null), [err, setErr] = useState(''), { notify } = useStore(), [busy, setBusy] = useState(false)
  const load = () => listBrands().then(setRows); useEffect(load, [])
  const save = async () => { setBusy(true); setErr(''); try { await saveBrand(form); await load(); setForm(null); notify(form.id ? 'Brand updated' : 'Brand added') } catch (e) { setErr(e.message) } finally { setBusy(false) } }
  const remove = async () => { try { await deleteBrand(del.id); await load(); setDel(null); notify('Brand deleted') } catch (e) { notify(e.message) } }
  return (<div><div className="flex items-center justify-between"><h1 className="text-4xl">Brands</h1><button onClick={() => setForm({ name: '', description: '', active: true })} className="btn-dark"><Plus size={14}/>Add brand</button></div>
    <div className="mt-6 overflow-x-auto"><table className="w-full text-sm"><thead className="text-xs uppercase tracking-widest text-ink/50"><tr>{['Name', 'Products', 'Active', ''].map(h => <th key={h} className="border-b border-sand pb-2 text-left">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-sand">{rows.map(b => <tr key={b.id} className="hover:bg-cream/40"><td className="py-3 font-medium">{b.name}</td><td className="py-3">{b.products}</td><td className="py-3">{b.active ? '✓' : '—'}</td>
        <td className="py-3"><div className="flex gap-3"><button onClick={() => setForm(b)} aria-label="Edit"><Pencil size={14}/></button><button onClick={() => setDel(b)} aria-label="Delete" className="hover:text-rose"><Trash2 size={14}/></button></div></td></tr>)}</tbody></table></div>
    <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Edit brand' : 'Add brand'}><div className="space-y-4">{err && <p className="text-xs text-rose">{err}</p>}
      <label className="block text-sm"><span className="mb-1 block text-xs uppercase tracking-widest text-ink/60">Name</span><input value={form?.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-sand bg-ivory px-3 py-2"/></label>
      <label className="block text-sm"><span className="mb-1 block text-xs uppercase tracking-widest text-ink/60">Description</span><textarea value={form?.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-sand bg-ivory px-3 py-2"/></label>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={form?.active !== false} onChange={e => setForm({ ...form, active: e.target.checked })}/>Active</label>
      <button disabled={busy} onClick={save} className="btn-dark">{busy ? <><Spinner/>Saving</> : 'Save brand'}</button></div></Modal>
    <Modal open={!!del} onClose={() => setDel(null)} title="Delete brand?"><p className="text-sm">Remove <b>{del?.name}</b>? This will fail if the brand has products.</p><div className="mt-5 flex gap-3"><button onClick={remove} className="btn-dark">Delete</button><button onClick={() => setDel(null)} className="btn-line">Cancel</button></div></Modal></div>)
}
