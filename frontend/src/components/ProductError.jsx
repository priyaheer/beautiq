import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
const copy = {
  notfound: ['Product not found', "We couldn't find this product. It may have been retired or the link may be out of date."],
  invalid: ['That product link is not valid', 'Product links use a number, like /product/12. Check the address, or browse the shop instead.'],
  error: ['We could not load this product', 'Something went wrong on our side while loading the product. Check your connection and try again.'] }
export default function ProductError({ kind = 'notfound', onRetry }) {
  const [t, m] = copy[kind] || copy.notfound
  return (<div className="wrap py-20 text-center" role="alert"><svg viewBox="0 0 200 160" className="mx-auto h-40 w-52" aria-hidden="true"><defs><linearGradient id="pe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E4D6C3"/><stop offset="1" stopColor="#C99A8B"/></linearGradient></defs>
    <circle cx="100" cy="80" r="62" fill="#F3ECE2"/><rect x="78" y="34" width="44" height="88" rx="4" fill="url(#pe)"/><rect x="88" y="22" width="24" height="16" fill="#241F1D"/><rect x="86" y="62" width="28" height="30" fill="#FBF8F3" opacity=".85"/>
    <path d="M62 128c14-8 62-8 76 0" stroke="#A8665A" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="1 6"/><path d="M144 44l12 12m0-12l-12 12" stroke="#A8665A" strokeWidth="2.5" strokeLinecap="round"/></svg>
    <p className="mt-6 text-xs uppercase tracking-[.3em] text-rose">{kind === 'error' ? 'Loading error' : 'Product unavailable'}</p><h1 className="mt-2 text-4xl md:text-5xl">{t}</h1><p className="mx-auto mt-3 max-w-md text-ink/60">{m}</p>
    <div className="mt-8 flex flex-wrap justify-center gap-3">{kind === 'error' && onRetry && <button onClick={onRetry} className="btn-dark"><RefreshCw size={14}/>Try again</button>}<Link to="/shop" className={kind === 'error' ? 'btn-line' : 'btn-dark'}>Back to Shop</Link><Link to="/new-arrivals" className="btn-line">Continue Shopping</Link></div></div>)
}
