import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/Auth'
export function RequireAuth({ children }) { const { user } = useAuth(), loc = useLocation()
  return user ? children : <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace/> }
export function RequireAdmin({ children }) { const { user } = useAuth(), loc = useLocation()
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace/>
  if (user.role !== 'admin') return <div className="py-32 text-center"><p className="text-xs uppercase tracking-[.3em] text-rose">403</p><h1 className="mt-3 text-5xl">Admins only</h1><p className="mt-3 text-ink/60">Your account doesn't have access to this area.</p><a href="/" className="btn-dark mt-8">Back to home</a></div>
  return children }
