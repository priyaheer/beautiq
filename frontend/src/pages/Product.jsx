import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'

import { useStore } from '../context/Store'
import { getProductById } from '../services/productService'
import { getCustomerPhotos } from '../services/reviewService'
import { getCategory, categoryPath } from '../services/categoryService'

import FrequentlyBought from '../components/FrequentlyBought'
import { ProductDetailsSkeleton } from '../components/Skeleton'
import ProductCard, { Price, Rating } from '../components/ProductCard'
import ProductError from '../components/ProductError'
import Reviews from '../components/Reviews'
import CustomerPhotos from '../components/CustomerPhotos'
import { ProductImage } from '../components/ui'
import { useProducts } from '../hooks/useProducts'

export default function Product() {
  const { id } = useParams()
  const {
    addToCart,
    addRecent,
    recent,
    toggleWish,
    wish
  } = useStore()

  const [state, setState] = useState({
    status: 'loading',
    p: null
  })

  const [photos, setPhotos] = useState([])
  const [shade, setShade] = useState(null)
  const [qty, setQty] = useState(1)
  const [img, setImg] = useState(0)
  const [tab, setTab] = useState('ingredients')
  const { products: catalog } = useProducts()
  const products = catalog || []

  const load = useCallback(() => {
    setState({
      status: 'loading',
      p: null
    })

    getProductById(id)
      .then((p) => {
        if (!p) {
          setState({
            status: 'notfound',
            p: null
          })
          return
        }

        setState({
          status: 'ok',
          p
        })

        addRecent(p.id)

        setShade(p.shades?.[0]?.name ?? null)
        setImg(0)
        setQty(1)
        setTab('ingredients')

        window.scrollTo(0, 0)

        getCustomerPhotos(p.id)
          .then(setPhotos)
          .catch(() => setPhotos([]))
      })
      .catch((e) => {
        setState({
          status: e.code === 'INVALID_ID' ? 'invalid' : 'error',
          p: null
        })
      })
  }, [id, addRecent])

  useEffect(() => {
    load()
  }, [load])

  const { status, p } = state

  if (status === 'loading') {
    return <ProductDetailsSkeleton />
  }

  if (status !== 'ok') {
    return <ProductError kind={status} onRetry={load} />
  }

  const related = products
    .filter(
      (x) =>
        x.category === p.category &&
        String(x.id) !== String(p.id)
    )
    .slice(0, 4)

  const cat = getCategory(p.category)

  const seen = recent
    .filter((i) => String(i) !== String(p.id))
    .map((i) => products.find((x) => String(x.id) === String(i)))
    .filter(Boolean)
    .slice(0, 4)

  const tabs = {
    ingredients: p.ingredients?.join(', ') || 'Not available',

    benefits: p.benefits?.join(' · ') || 'Not available',

    'how to use':
      'Apply a small amount to clean skin or hair; build gradually. Patch test before first use.',

    'suitable for': [
      p.skinTypes?.length
        ? `${p.skinTypes.join(', ')} skin`
        : null,

      p.hairTypes?.length
        ? `${p.hairTypes.join(', ')} hair`
        : null,

      p.concerns?.length
        ? p.concerns.join(', ')
        : null
    ]
      .filter(Boolean)
      .join(' · ') || 'All skin types'
  }

  const productImages =
    p.images?.length > 0
      ? p.images
      : p.thumbnail
        ? [p.thumbnail]
        : []

  return (
    <div className="wrap py-12">

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 text-xs text-ink/50"
      >
        <Link
          to="/"
          className="hover:text-ink"
        >
          Home
        </Link>

        {' / '}

        <Link
          to={categoryPath(p.category)}
          className="hover:text-ink"
        >
          {cat?.name || p.category}
        </Link>

        {' / '}

        <span className="text-ink">
          {p.name}
        </span>
      </nav>

      {/* Main Product Section */}
      <div className="grid gap-10 md:grid-cols-2">

        {/* ================= IMAGE GALLERY ================= */}
        <div>

          {/* Main Image */}
          <div className="aspect-square overflow-hidden bg-sand">

            {productImages.length > 0 ? (
              <ProductImage
                p={p}
                src={p.images?.[img] || p.thumbnail}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center font-serif text-4xl text-ink/30">
                {p.brand}
              </div>
            )}

          </div>

          {/* Image Thumbnails */}
          {productImages.length > 0 && (
            <div className="mt-3 flex gap-3 overflow-x-auto">

              {productImages.map((image, i) => (
                <button
                  key={i}
                  aria-label={`Image ${i + 1}`}
                  onClick={() => setImg(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden border ${
                    img === i
                      ? 'border-ink'
                      : 'border-transparent'
                  }`}
                >
                  <ProductImage
                    p={p}
                    src={image}
                    alt={`${p.name} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}

            </div>
          )}

        </div>

        {/* ================= PRODUCT INFORMATION ================= */}
        <div>

          <p className="text-xs uppercase tracking-widest text-ink/50">
            {p.brand}
          </p>

          <h1 className="mt-2 text-5xl">
            {p.name}
          </h1>

          {/* Rating + Price */}
          <div className="mt-3 flex items-center gap-4">

            <a
              href="#reviews"
              onClick={(e) => {
                e.preventDefault()

                document
                  .getElementById('reviews')
                  ?.scrollIntoView({
                    behavior: 'smooth'
                  })
              }}
              aria-label="Jump to reviews"
            >
              <Rating
                value={p.rating}
                count={p.reviews}
              />
            </a>

            <Price p={p} />

          </div>

          {/* Description */}
          <p className="mt-6 text-ink/70">
            {p.description}
          </p>

          {/* Shades */}
          {p.shades?.length > 0 && (
            <div className="mt-6">

              <p className="text-xs uppercase tracking-widest">
                Shade: {shade}
              </p>

              <div className="mt-2 flex gap-2">

                {p.shades.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setShade(s.name)}
                    title={s.name}
                    aria-label={s.name}
                    className={`h-8 w-8 rounded-full border-2 ${
                      shade === s.name
                        ? 'border-ink'
                        : 'border-ivory ring-1 ring-sand'
                    }`}
                    style={{
                      background: s.hex
                    }}
                  />

                ))}

              </div>
            </div>
          )}

          {/* Quantity + Cart */}
          <div className="mt-8 flex flex-wrap items-center gap-3">

            <div className="flex items-center border border-sand">

              <button
                aria-label="Decrease quantity"
                className="px-4 py-3"
                onClick={() =>
                  setQty((q) => Math.max(1, q - 1))
                }
              >
                −
              </button>

              <span className="w-8 text-center">
                {qty}
              </span>

              <button
                aria-label="Increase quantity"
                className="px-4 py-3"
                onClick={() =>
                  setQty((q) => q + 1)
                }
              >
                +
              </button>

            </div>

            <button
              disabled={!p.stock}
              onClick={() =>
                addToCart(p, shade, qty)
              }
              className="btn-dark flex-1 disabled:opacity-50"
            >
              {p.stock
                ? 'Add to Bag'
                : 'Out of stock'}
            </button>

            <button
              onClick={() => toggleWish(p)}
              aria-pressed={wish.includes(p.id)}
              className="btn-line"
            >
              {wish.includes(p.id)
                ? 'Saved ✓'
                : 'Wishlist'}
            </button>

          </div>

          {/* Product Information Tabs */}
          <div className="mt-10 border-t border-sand">

            <div className="flex gap-5 overflow-x-auto py-4 text-xs uppercase tracking-widest">

              {Object.keys(tabs).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={
                    tab === t
                      ? 'text-rose underline underline-offset-8'
                      : ''
                  }
                >
                  {t}
                </button>
              ))}

            </div>

            <p className="text-sm text-ink/70">
              {tabs[tab]}
            </p>

          </div>

        </div>
      </div>

      {/* Frequently Bought */}
      <FrequentlyBought p={p} />

      {/* Reviews */}
      <Reviews
        product={p}
        photos={photos}
      />

      {/* Customer Photos */}
      <CustomerPhotos
        photos={photos}
        productName={p.name}
      />

      {/* Related Products */}
      <h2 className="mt-24 text-3xl">
        You may also love
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">

        {related.map((x) => (
          <ProductCard
            key={x.id}
            p={x}
          />
        ))}

      </div>

      {/* Recently Viewed */}
      {seen.length > 0 && (
        <>
          <h2 className="mt-20 text-3xl">
            Recently viewed
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">

            {seen.map((x) => (
              <ProductCard
                key={x.id}
                p={x}
              />
            ))}

          </div>
        </>
      )}

    </div>
  )
}