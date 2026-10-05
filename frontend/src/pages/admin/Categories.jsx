import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { listCategories, saveCategory, deleteCategory } from '../../services/categoryService'
import { useStore } from '../../context/Store'
import { Modal, Spinner } from '../../components/ui'
export default function AdminCategories() {
  const [rows, setRows] = useState([]), [form, setForm] = useState(null), [del, setDel] = useState(null), [err, setErr] = useState(''), { notify } = useStore(), [busy, setBusy] = useState(false)
  const load = () => listCategories().then(setRows); useEffect(load, [])
  const save = async () => { setBusy(true); setErr(''); try { await saveCategory({ ...form, subs: form.subs }); await load(); setForm(null); notify('Category saved') } catch (e) { setErr(e.message) } finally { setBusy(false) } }
  const remove = async () => { try { await deleteCategory(del.id); await load(); setDel(null); notify('Category deleted') } catch (e) { notify(e.message) } }
  return (<div><div className="flex items-center justify-between"><h1 className="text-4xl">Categories</h1><button onClick={() => setForm({ name: '', tagline: '', subs: '' })} className="btn-dark"><Plus size={14}/>Add category</button></div>
    <div className="mt-6 overflow-x-auto"><table className="w-full text-sm"><thead className="text-xs uppercase tracking-widest text-ink/50"><tr>{['Name', 'Products', 'Subcategories', ''].map(h => <th key={h} className="border-b border-sand pb-2 text-left">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-sand">{rows.map(c => <tr key={c.id} className="hover:bg-cream/40"><td className="py-3 font-medium">{c.name}</td><td className="py-3">{c.products}</td><td className="py-3 text-xs text-ink/60">{c.subcategories?.map(s => s.name).join(', ')}</td>
        <td className="py-3"><div className="flex gap-3"><button onClick={() => setForm({ ...c, subs: c.subcategories?.map(s => s.name).join(', ') })} aria-label="Edit"><Pencil size={14}/></button><button onClick={() => setDel(c)} aria-label="Delete" className="hover:text-rose"><Trash2 size={14}/></button></div></td></tr>)}</tbody></table></div>
    <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Edit category' : 'Add category'}><div className="space-y-4">{err && <p className="text-xs text-rose">{err}</p>}
      <label className="block text-sm"><span className="mb-1 block text-xs uppercase tracking-widest text-ink/60">Name</span><input value={form?.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-sand bg-ivory px-3 py-2"/></label>
      <label className="block text-sm"><span className="mb-1 block text-xs uppercase tracking-widest text-ink/60">Tagline</span><input value={form?.tagline || ''} onChange={e => setForm({ ...form, tagline: e.target.value })} className="w-full border border-sand bg-ivory px-3 py-2"/></label>
      <label className="block text-sm"><span className="mb-1 block text-xs uppercase tracking-widest text-ink/60">Subcategories (comma-separated)</span><input value={form?.subs || ''} onChange={e => setForm({ ...form, subs: e.target.value })} className="w-full border border-sand bg-ivory px-3 py-2"/></label>
      <button disabled={busy} onClick={save} className="btn-dark">{busy ? <><Spinner/>Saving</> : 'Save category'}</button></div></Modal>
    <Modal open={!!del} onClose={() => setDel(null)} title="Delete category?"><p className="text-sm">Remove <b>{del?.name}</b>? This will fail if the category has products.</p><div className="mt-5 flex gap-3"><button onClick={remove} className="btn-dark">Delete</button><button onClick={() => setDel(null)} className="btn-line">Cancel</button></div></Modal></div>)
}
