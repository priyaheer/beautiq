import { useState } from 'react'
import { Camera } from 'lucide-react'
import { Art } from './ui'
import Lightbox from './Lightbox'
export default function CustomerPhotos({ photos, productName }) {
  const [i, setI] = useState(null), [all, setAll] = useState(false), shown = all ? photos : photos.slice(0, 6)
  return (<section className="mt-24" aria-labelledby="photos-h"><div className="flex items-end justify-between"><h2 id="photos-h" className="text-3xl">Customer photos</h2><span className="text-sm text-ink/50">{photos.length} photos</span></div>
    {!photos.length ? <div className="mt-6 border border-dashed border-sand p-10 text-center"><Camera className="mx-auto text-ink/30"/><p className="mt-3 font-serif text-xl">No photos yet</p><p className="text-sm text-ink/60">Be the first to share how you wear it.</p></div>
    : <><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{shown.map((p, k) => <button key={p.id} onClick={() => setI(k)} className="group relative text-left" aria-label={`View photo: ${p.caption} by ${p.userName}`}>
      <Art hue={p.hue} variant={p.variant} label={p.caption} className="aspect-square transition duration-500 group-hover:opacity-90"/>
      <span className="absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-ink/70 to-transparent p-2.5 pt-8 text-ivory opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100 max-md:opacity-100"><span className="block truncate text-xs font-medium">{p.userName}</span><span className="block truncate text-[11px] text-ivory/80">{p.caption}</span></span></button>)}</div>
      {photos.length > 6 && <button onClick={() => setAll(a => !a)} className="btn-line mt-6">{all ? 'Show fewer' : `View all ${photos.length} photos`}</button>}</>}
    <Lightbox photos={photos} index={i} onClose={() => setI(null)} onIndex={setI} productName={productName}/></section>)
}
