const B = ({ c = '' }) => <div className={`animate-pulse bg-cream ${c}`}/>
export const ProductCardSkeleton = () => <div><B c="aspect-[4/5]"/><B c="mt-3 h-3 w-1/3"/><B c="mt-2 h-5 w-4/5"/><B c="mt-2 h-3 w-1/2"/></div>
export const ProductGridSkeleton = ({ n = 6 }) => <div className="grid grid-cols-2 gap-5 md:grid-cols-3">{Array.from({ length: n }).map((_, i) => <ProductCardSkeleton key={i}/>)}</div>
export const ProductDetailsSkeleton = () => <div className="wrap grid gap-10 py-12 md:grid-cols-2"><B c="aspect-square"/><div className="space-y-4"><B c="h-3 w-1/4"/><B c="h-12 w-4/5"/><B c="h-4 w-1/3"/><B c="h-24"/><B c="h-12"/></div></div>
export const ArticleSkeleton = () => <div className="wrap max-w-3xl py-12"><B c="h-72"/><B c="mt-6 h-10 w-3/4"/><B c="mt-4 h-40"/></div>
export const BrandSkeleton = () => <div className="wrap py-12"><B c="h-48"/><ProductGridSkeleton/></div>
export const AccountSkeleton = () => <div className="wrap space-y-4 py-12"><B c="h-10 w-1/3"/><B c="h-32"/><B c="h-32"/></div>
export const OrderSkeleton = () => <div className="space-y-4">{[0, 1, 2].map(i => <B key={i} c="h-28"/>)}</div>
