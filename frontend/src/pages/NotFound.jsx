import { Link } from 'react-router-dom'
export default () => <div className="py-32 text-center"><p className="text-xs uppercase tracking-[.3em] text-rose">404</p><h1 className="mt-3 text-6xl">Page not found</h1><p className="mt-3 text-ink/60">The page you're looking for has moved or never existed.</p><Link to="/" className="btn-dark mt-8">Back to home</Link></div>
