import { Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { trackingSteps } from '../services/orderService'
import { fmtDateTime } from '../lib/format'
export default function OrderTimeline({ order }) {
  const steps = trackingSteps(order)
  return <ol className="relative" aria-label="Order tracking">{steps.map((s, i) => <li key={s.label + i} className="relative flex gap-4 pb-8 last:pb-0">
    {i < steps.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-sand"><motion.span initial={{ height: 0 }} animate={{ height: steps[i + 1].done ? '100%' : 0 }} transition={{ duration: .5, delay: i * .12 }} className="block w-px bg-ink"/></span>}
    <span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs ${s.cancelled ? 'border-rose bg-rose text-white' : s.done ? 'border-ink bg-ink text-ivory' : 'border-sand bg-ivory text-ink/30'} ${s.current && !s.cancelled ? 'ring-4 ring-nude/30' : ''}`}>{s.cancelled ? <X size={14}/> : s.done ? <Check size={14}/> : i + 1}</span>
    <div className="pt-1"><p className={`font-medium ${s.done ? '' : 'text-ink/40'}`}>{s.label}{s.current && !s.cancelled && s.label !== 'Delivered' && <span className="ml-2 text-xs font-normal text-rose">In progress</span>}</p><p className="text-xs text-ink/50">{s.at && s.done ? fmtDateTime(s.at) : s.done ? '' : 'Pending'}</p></div></li>)}</ol>
}
