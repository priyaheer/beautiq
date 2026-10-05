import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { listUsers, setUserStatus } from '../../services/userService'
import { useStore } from '../../context/Store'
import { Avatar, StatusBadge } from '../../components/ui'
import { fmtDate } from '../../lib/format'
export default function AdminUsers() {
  const [users, setUsers] = useState([]), [q, setQ] = useState(''), { notify } = useStore()
  useEffect(() => { listUsers().then(setUsers) }, [])
  const shown = useMemo(() => users.filter(u => !q || [u.name, u.email, u.phone || ''].join(' ').toLowerCase().includes(q.toLowerCase())), [users, q])
  const toggle = async u => { await setUserStatus(u.id, u.status === 'active' ? 'blocked' : 'active'); listUsers().then(setUsers); notify(`${u.name} ${u.status === 'active' ? 'blocked' : 'unblocked'}`) }
  return (<div><h1 className="text-4xl">Users</h1>
    <div className="mt-5 flex items-center gap-2 border border-sand px-3 py-2 w-64"><Search size={14}/><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or email" className="bg-transparent text-sm outline-none w-full"/></div>
    <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead className="text-xs uppercase tracking-widest text-ink/50"><tr>{['User', 'Email', 'Joined', 'Orders', 'Status', ''].map(h => <th key={h} className="border-b border-sand pb-2 text-left">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-sand">{shown.map(u => <tr key={u.id} className="hover:bg-cream/40"><td className="py-3"><div className="flex items-center gap-3"><Avatar user={u} size={36}/><span className="font-medium">{u.name}</span></div></td><td className="py-3 text-xs text-ink/70">{u.email}</td><td className="py-3 text-xs text-ink/60">{fmtDate(u.joined)}</td><td className="py-3">{u.orders?.length || 0}</td><td className="py-3"><StatusBadge status={u.status || 'active'}/></td><td className="py-3">{u.id !== 'admin' && <button onClick={() => toggle(u)} className="text-xs underline">{u.status === 'active' ? 'Block' : 'Unblock'}</button>}</td></tr>)}</tbody></table>
      <p className="mt-3 text-xs text-ink/50">{shown.length} of {users.length} users</p></div></div>)
}
