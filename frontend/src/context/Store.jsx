import { createContext, useContext, useEffect, useState, useCallback } from 'react'
const Ctx = createContext()
export const useLS = (k, d) => { const [v, s] = useState(() => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } })
  useEffect(() => { localStorage.setItem(k, JSON.stringify(v)) }, [k, v]); return [v, s] }
export const useStore = () => useContext(Ctx)
export function StoreProvider({ children }) {
  const [cart, setCart] = useLS('bq-cart', []), [wish, setWish] = useLS('bq-wish', []), [recent, setRecent] = useLS('bq-recent', [])
  const [compare, setCompare] = useLS('bq-compare', []), [quick, setQuick] = useState(null), [drawer, setDrawer] = useState(false)
  const [toast, setToast] = useState(null), [coupon, setCoupon] = useLS('bq-coupon', '')
  const notify = useCallback(m => { setToast(m); setTimeout(() => setToast(null), 2200) }, [])
  const addToCart = (p, shade = null, qty = 1) => { setCart(c => { const f = c.find(x => x.id === p.id && x.shade === shade)
    return f ? c.map(x => x === f ? { ...x, qty: x.qty + qty } : x) : [...c, { id: p.id, shade, qty }] }); notify(`${p.name} added to bag`); setDrawer(true) }
  const setQty = (id, shade, qty) => setCart(c => c.map(x => x.id === id && x.shade === shade ? { ...x, qty: Math.max(1, qty) } : x))
  const removeItem = (id, shade) => setCart(c => c.filter(x => !(x.id === id && x.shade === shade)))
  const toggleWish = p => { setWish(w => w.includes(p.id) ? w.filter(i => i !== p.id) : [...w, p.id]); notify(wish.includes(p.id) ? 'Removed from wishlist' : 'Saved to wishlist') }
  const toggleCompare = p => setCompare(c => c.includes(p.id) ? (notify('Removed from compare'), c.filter(i => i !== p.id)) : c.length >= 4 ? (notify('Compare up to 4 products'), c) : (notify('Added to compare'), [...c, p.id]))
  const clearCart = () => setCart([])
  const addRecent = id => setRecent(r => [id, ...r.filter(i => i !== id)].slice(0, 8))
  return <Ctx.Provider value={{ compare, toggleCompare, quick, setQuick, drawer, setDrawer, notify, cart, wish, recent, toast, coupon, setCoupon, clearCart, addToCart, setQty, removeItem, toggleWish, addRecent }}>{children}</Ctx.Provider>
}
