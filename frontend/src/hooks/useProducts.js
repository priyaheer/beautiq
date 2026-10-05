import { useEffect, useState } from 'react'
import { getProducts, PRODUCT_CATALOG_CHANGED } from '../services/productService'

export function useProducts() {
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    const load = () => {
      setError(null)
      getProducts().then(result => {
        if (active) setProducts(result)
      }).catch(reason => {
        if (active) setError(reason)
      })
    }
    load()
    window.addEventListener(PRODUCT_CATALOG_CHANGED, load)
    return () => {
      active = false
      window.removeEventListener(PRODUCT_CATALOG_CHANGED, load)
    }
  }, [])

  return { products, error }
}
