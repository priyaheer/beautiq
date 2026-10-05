import { createContext, useContext, useState, useCallback } from 'react'
import * as auth from '../services/authService'
import * as users from '../services/userService'
const Ctx = createContext()
export const useAuth = () => useContext(Ctx)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.getSession())
  const login = useCallback(async creds => { const u = await auth.login(creds); setUser(u); return u }, [])
  const google = useCallback(async () => { const u = await auth.loginWithGoogle(); setUser(u); return u }, [])
  const verify = useCallback(async (email, code) => { const u = await auth.verifyEmail(email, code); setUser(u); return u }, [])
  const logout = useCallback(() => { auth.logout(); setUser(null) }, [])
  const refresh = useCallback(async () => { if (user) setUser(await users.getUser(user.id)) }, [user])
  const update = useCallback(async data => { const u = await users.updateProfile(user.id, data); setUser(u); return u }, [user])
  return <Ctx.Provider value={{ user, login, google, verify, logout, refresh, update, register: auth.register, isAdmin: user?.role === 'admin' }}>{children}</Ctx.Provider>
}
