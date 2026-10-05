import { useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { useAuth } from '../../context/Auth'
import { useStore } from '../../context/Store'
import { saveAddress, deleteAddress, setDefaultAddress } from '../../services/userService'
import AddressForm, { AddressBlock, blankAddress } from '../../components/AddressForm'
import { Modal } from '../../components/ui'
export default function Addresses() {
  const { user, refresh } = useAuth(), { notify } = useStore(), [edit, setEdit] = useState(null), [del, setDel] = useState(null)
  const save = async a => { await saveAddress(user.id, a); await refresh(); setEdit(null); notify(a.id ? 'Address updated' : 'Address added') }
  const remove = async () => { await deleteAddress(user.id, del.id); await refresh(); setDel(null); notify('Address deleted') }
  const makeDefault = async a => { await setDefaultAddress(user.id, a.id); await refresh(); notify('Default address updated') }
  return (<div><div className="flex flex-wrap items-end justify-between gap-3"><h1 className="text-4xl">Addresses</h1><button onClick={() => setEdit(blankAddress(user))} className="btn-dark"><Plus size={14}/>Add address</button></div>
    {!user.addresses.length ? <div className="mt-8 border border-dashed border-sand p-12 text-center"><p className="font-serif text-2xl">No saved addresses</p><p className="mt-1 text-sm text-ink/60">Save an address to speed up checkout.</p><button onClick={() => setEdit(blankAddress(user))} className="btn-dark mt-5">Add your first address</button></div>
    : <ul className="mt-8 grid gap-5 md:grid-cols-2">{user.addresses.map(a => <li key={a.id} className={`border p-5 ${a.isDefault ? 'border-ink' : 'border-sand'}`}><div className="mb-3 flex items-center justify-between"><span className="text-xs uppercase tracking-widest text-ink/50">{a.label}</span>{a.isDefault && <span className="bg-ink px-2 py-0.5 text-[10px] uppercase tracking-widest text-ivory">Default</span>}</div>
      <AddressBlock a={a}/><div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-widest"><button onClick={() => setEdit(a)} className="flex items-center gap-1 underline"><Pencil size={12}/>Edit</button><button onClick={() => setDel(a)} className="flex items-center gap-1 underline"><Trash2 size={12}/>Delete</button>{!a.isDefault && <button onClick={() => makeDefault(a)} className="underline">Set as default</button>}</div></li>)}</ul>}
    <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit address' : 'Add address'} wide>{edit && <AddressForm key={edit.id || 'new'} initial={edit} onSubmit={save} onCancel={() => setEdit(null)}/>}</Modal>
    <Modal open={!!del} onClose={() => setDel(null)} title="Delete address?"><p className="text-sm text-ink/70">This will remove {del?.label} ({del?.line1}). You can add it again later.</p><div className="mt-6 flex gap-3"><button onClick={remove} className="btn-dark">Delete address</button><button onClick={() => setDel(null)} className="btn-line">Keep it</button></div></Modal></div>)
}
