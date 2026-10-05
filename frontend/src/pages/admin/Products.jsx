import { useMemo, useState } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import { Plus, Search, Trash2, Pencil } from 'lucide-react'
import { saveProduct, deleteProduct } from '../../services/productService'
import { useStore } from '../../context/Store'
import { Modal, Spinner, Thumb } from '../../components/ui'
import { inr } from '../../lib/format'
import { useProducts } from '../../hooks/useProducts'
const CATS = ['makeup', 'skincare', 'haircare', 'fragrance']
function ProductForm({ initial, onDone, brands }) {
  const { notify } = useStore(), blank = { name: '', brand: brands[0] || '', category: 'skincare', subcategory: '', price: '', discount: 0, stock: 20, hue: 20, description: '' }
  const [f, setF] = useState({ ...blank, ...initial }), [busy, setBusy] = useState(false)
  const s = (k, v) => setF(x => ({ ...x, [k]: v }))
  const submit = async e => { e.preventDefault(); if (!f.name.trim() || !f.price) return; setBusy(true); try { await saveProduct(f); notify(f.id ? 'Product updated' : 'Product added'); onDone() } finally { setBusy(false) } }
  const inp = (k, label, props = {}) => <label className="block text-sm"><span className="mb-1 block text-xs uppercase tracking-widest text-ink/60">{label}</span><input value={f[k]} onChange={e => s(k, e.target.value)} className="w-full border border-sand bg-ivory px-3 py-2 text-sm outline-none focus:border-ink" {...props}/></label>
  return <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{inp('name', 'Product name', { required: true })}
    <label className="block text-sm"><span className="mb-1 block text-xs uppercase tracking-widest text-ink/60">Brand</span><select value={f.brand} onChange={e => s('brand', e.target.value)} className="w-full border border-sand bg-ivory px-3 py-2 text-sm">{brands.map(b => <option key={b}>{b}</option>)}</select></label>
    <label className="block text-sm"><span className="mb-1 block text-xs uppercase tracking-widest text-ink/60">Category</span><select value={f.category} onChange={e => s('category', e.target.value)} className="w-full border border-sand bg-ivory px-3 py-2 text-sm">{CATS.map(c => <option key={c}>{c}</option>)}</select></label>
    {inp('subcategory', 'Subcategory')}{inp('price', 'Price (₹)', { type: 'number', min: 0 })}{inp('discount', 'Discount %', { type: 'number', min: 0, max: 90 })}{inp('stock', 'Stock', { type: 'number', min: 0 })}{inp('hue', 'Hue (0-60)', { type: 'number', min: 0, max: 60 })}
    <label className="col-span-2 block text-sm"><span className="mb-1 block text-xs uppercase tracking-widest text-ink/60">Description</span><textarea rows={3} value={f.description} onChange={e => s('description', e.target.value)} className="w-full border border-sand bg-ivory px-3 py-2 text-sm"/></label>
    <button disabled={busy} className="btn-dark col-span-2">{busy ? <><Spinner/>Saving</> : f.id ? 'Save changes' : 'Add product'}</button></form>
}
function ProductList() {
  const [q, setQ] = useState(''), [cat, setCat] = useState('all'), [form, setForm] = useState(null), [del, setDel] = useState(null), { notify } = useStore(), [, forceUpdate] = useState(0)
  const { products: catalog, error } = useProducts()
  const products = catalog || []
  const brands = [...new Set(products.map(product => product.brand))]
  const shown = useMemo(() => products.filter(p => (cat === 'all' || p.category === cat) && (!q.trim() || p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase()))), [q, cat, products])
  const remove = async () => { await deleteProduct(del.id); setDel(null); notify('Product deleted'); forceUpdate(n => n + 1) }
  return (<div><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-4xl">Products</h1><button onClick={() => setForm({})} className="btn-dark"><Plus size={14}/>Add product</button></div>
    <div className="mt-5 flex flex-wrap gap-3"><div className="flex items-center gap-2 border border-sand px-3 py-2"><Search size={14}/><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products" className="bg-transparent text-sm outline-none w-40"/></div>
      {['all', ...CATS].map(c => <button key={c} onClick={() => setCat(c)} className={`border px-4 py-2 text-xs capitalize tracking-widest ${cat === c ? 'border-ink bg-ink text-ivory' : 'border-sand'}`}>{c}</button>)}</div>
    <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead className="text-xs uppercase tracking-widest text-ink/50"><tr>{['', 'Product', 'Brand', 'Price', 'Stock', ''].map(h => <th key={h} className="border-b border-sand pb-2 text-left">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-sand">{shown.map(p => <tr key={p.id} className="hover:bg-cream/40"><td className="py-2"><Thumb p={p} className="h-12 w-10"/></td>
        <td className="py-2"><p className="font-medium">{p.name}</p><p className="text-xs text-ink/50">{p.subcategory} · {p.category}</p></td><td className="py-2">{p.brand}</td><td className="py-2">{inr(p.price)}{p.discount > 0 && <span className="ml-2 text-xs text-rose">{p.discount}% off</span>}</td><td className="py-2">{p.stock > 0 ? p.stock : <span className="text-rose">Out</span>}</td>
        <td className="py-2"><div className="flex gap-3"><button onClick={() => setForm(p)} aria-label="Edit" className="text-ink/50 hover:text-ink"><Pencil size={14}/></button><button onClick={() => setDel(p)} aria-label="Delete" className="text-ink/50 hover:text-rose"><Trash2 size={14}/></button></div></td></tr>)}</tbody></table>
      <p className="mt-3 text-xs text-ink/50">{shown.length} of {products.length} products</p>{error && <p role="alert" className="mt-3 text-sm text-rose">Products could not be loaded.</p>}</div>
    <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Edit product' : 'Add product'} wide><ProductForm key={form?.id || 'new'} initial={form} brands={brands} onDone={() => { setForm(null); forceUpdate(n => n + 1) }}/></Modal>
    <Modal open={!!del} onClose={() => setDel(null)} title="Delete product?"><p className="text-sm text-ink/70">This will remove <b>{del?.name}</b> from the catalogue. Orders and reviews that reference it will still exist.</p><div className="mt-6 flex gap-3"><button onClick={remove} className="btn-dark">Delete</button><button onClick={() => setDel(null)} className="btn-line">Cancel</button></div></Modal></div>)
}
export default function Products() { return <ProductList/> }
