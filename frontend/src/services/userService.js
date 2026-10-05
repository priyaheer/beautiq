import { users as seed } from '../data/users'
import { table, wait } from './db'
import { uid } from '../lib/format'
export const usersTable = table('bq-users-v1', seed)
export const safe = u => { if (!u) return null; const { password, ...rest } = u; return rest }
const patch = (id, fn) => { let out = null; usersTable.save(usersTable.all().map(u => u.id === id ? (out = fn(u)) : u)); return out }
export const getUser = id => wait(safe(usersTable.all().find(u => u.id === id)))
export const updateProfile = (id, data) => { if (usersTable.all().some(u => u.id !== id && u.email.toLowerCase() === data.email.toLowerCase())) return Promise.reject(new Error('That email is already used by another account'))
  const u = patch(id, x => ({ ...x, name: data.name.trim(), email: data.email.trim().toLowerCase(), phone: data.phone, avatar: data.avatar ?? x.avatar })); return wait(safe(u)) }
export const changePassword = (id, current, next) => { const u = usersTable.all().find(x => x.id === id)
  if (!u || u.password !== current) return Promise.reject(new Error('Your current password is incorrect')); patch(id, x => ({ ...x, password: next, passwordChangedAt: new Date().toISOString() })); return wait(true) }
export const getAddresses = id => wait(usersTable.all().find(u => u.id === id)?.addresses || [])
export const saveAddress = (id, a) => { const u = patch(id, x => { let list = x.addresses
  const row = { ...a, id: a.id || uid('a') }; if (!list.length) row.isDefault = true
  list = a.id ? list.map(i => i.id === a.id ? row : i) : [...list, row]
  if (row.isDefault) list = list.map(i => ({ ...i, isDefault: i.id === row.id })); return { ...x, addresses: list } }); return wait(u.addresses) }
export const deleteAddress = (id, aid) => { const u = patch(id, x => { let list = x.addresses.filter(i => i.id !== aid); if (list.length && !list.some(i => i.isDefault)) list = list.map((i, k) => ({ ...i, isDefault: k === 0 })); return { ...x, addresses: list } }); return wait(u.addresses) }
export const setDefaultAddress = (id, aid) => { const u = patch(id, x => ({ ...x, addresses: x.addresses.map(i => ({ ...i, isDefault: i.id === aid })) })); return wait(u.addresses) }
// ---- admin ----
export const listUsers = () => wait(usersTable.all().map(safe))
export const setUserStatus = (id, status) => { patch(id, u => ({ ...u, status })); return wait(true) }
