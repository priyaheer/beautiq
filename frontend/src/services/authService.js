// Frontend-only auth. Replace with POST /api/auth/* (JWT or httpOnly cookie) later; function signatures stay the same.
import { usersTable, safe } from './userService'
import { wait, read, write } from './db'
import { uid } from '../lib/format'
const SKEY = 'bq-session', OKEY = 'bq-otp', RKEY = 'bq-reset'
const err = (m, code) => { const e = new Error(m); e.code = code; return e }
const find = email => usersTable.all().find(u => u.email.toLowerCase() === (email || '').trim().toLowerCase())

export const getSession = () => { const s = read(SKEY, null) || JSON.parse(sessionStorage.getItem(SKEY) || 'null'); const u = s && usersTable.all().find(x => x.id === s.userId); return u && u.status !== 'blocked' ? safe(u) : null }
const startSession = (u, remember) => { const s = { userId: u.id }; localStorage.removeItem(SKEY); sessionStorage.removeItem(SKEY)
  remember ? write(SKEY, s) : sessionStorage.setItem(SKEY, JSON.stringify(s)); return safe(u) }
export const logout = () => { localStorage.removeItem(SKEY); sessionStorage.removeItem(SKEY) }

export const login = async ({ email, password, remember }) => { await wait(null, 700)
  const u = find(email); if (!u || u.password !== password) throw err('Email or password is incorrect.', 'BAD_CREDENTIALS')
  if (u.status === 'blocked') throw err('This account has been suspended. Please contact support.', 'BLOCKED')
  if (!u.verified) throw err('Please verify your email to continue.', 'UNVERIFIED')
  return startSession(u, remember) }
export const loginWithGoogle = async () => { await wait(null, 900)
  let u = find('google.user@gmail.com'); if (!u) { u = { id: uid('u'), role: 'customer', name: 'Google User', email: 'google.user@gmail.com', phone: '', password: uid('g'), avatar: null, hue: 24, status: 'active', verified: true, joined: new Date().toISOString().slice(0, 10), addresses: [], orders: [], wishlist: [] }; usersTable.save([...usersTable.all(), u]) }
  return startSession(u, true) }
export const register = async ({ name, email, password }) => { await wait(null, 800)
  if (find(email)) throw err('An account with this email already exists. Try signing in.', 'EXISTS')
  const u = { id: uid('u'), role: 'customer', name: name.trim(), email: email.trim().toLowerCase(), phone: '', password, avatar: null, hue: 10 + Math.floor(Math.random() * 30), status: 'active', verified: false, joined: new Date().toISOString().slice(0, 10), addresses: [], orders: [], wishlist: [] }
  usersTable.save([...usersTable.all(), u]); return safe(u) }

// ---- OTP (mock): the code is returned so the UI can show it in demo mode. A real API emails/SMSes it and never returns it. ----
export const sendOtp = async (email, purpose) => { await wait(null, 600)
  const code = String(Math.floor(100000 + Math.random() * 900000)); sessionStorage.setItem(OKEY, JSON.stringify({ email: email.toLowerCase(), purpose, code, expires: Date.now() + 10 * 60000, tries: 0 })); return { code, ttl: 60 } }
export const verifyOtp = async (email, purpose, code) => { await wait(null, 600)
  const o = JSON.parse(sessionStorage.getItem(OKEY) || 'null')
  if (!o || o.email !== email.toLowerCase() || o.purpose !== purpose) throw err('No active code. Please request a new one.', 'NO_OTP')
  if (Date.now() > o.expires) throw err('This code has expired. Please request a new one.', 'EXPIRED')
  if (o.tries >= 5) throw err('Too many attempts. Please request a new code.', 'LOCKED')
  if (o.code !== code) { o.tries++; sessionStorage.setItem(OKEY, JSON.stringify(o)); throw err(`That code is not correct. ${5 - o.tries} attempts left.`, 'BAD_OTP') }
  sessionStorage.removeItem(OKEY); return true }
export const verifyEmail = async (email, code) => { await verifyOtp(email, 'verify', code); const u = find(email); if (!u) throw err('Account not found', 'NOT_FOUND')
  usersTable.save(usersTable.all().map(x => x.id === u.id ? { ...x, verified: true } : x)); return startSession({ ...u, verified: true }, true) }

// ---- password reset: email -> OTP -> token -> new password ----
export const requestPasswordReset = async email => { if (!find(email)) { await wait(null, 600); throw err('We could not find an account with that email.', 'NOT_FOUND') } return sendOtp(email, 'reset') }
export const confirmResetOtp = async (email, code) => { await verifyOtp(email, 'reset', code); const token = uid('rt'); sessionStorage.setItem(RKEY, JSON.stringify({ email: email.toLowerCase(), token, expires: Date.now() + 15 * 60000 })); return token }
export const getResetContext = () => { const r = JSON.parse(sessionStorage.getItem(RKEY) || 'null'); return r && Date.now() < r.expires ? r : null }
export const resetPassword = async password => { await wait(null, 800); const r = getResetContext(); if (!r) throw err('This reset link has expired. Please start again.', 'EXPIRED')
  const u = find(r.email); usersTable.save(usersTable.all().map(x => x.id === u.id ? { ...x, password } : x)); sessionStorage.removeItem(RKEY); return true }
// demo-only helper so the UI can display the mock code; a real backend never exposes it
export const peekDemoOtp = email => { const o = JSON.parse(sessionStorage.getItem(OKEY) || 'null'); return o && o.email === (email || '').toLowerCase() ? o.code : null }
