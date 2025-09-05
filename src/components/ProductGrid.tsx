
import ProductCard from './ProductCard'
import type { Product } from '@/lib/types'

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10 rounded-xl border bg-white">
        <p className="text-gray-600">No products found.</p>
        <p className="text-sm text-gray-500">Please try adjusting your search or filters.</p>
      </div>
    )
  }

  return (
    <div className="no-scrollbar -mx-3 flex gap-3 overflow-x-auto px-3 pb-2">
      {products.map(p => (
        <div key={p.id} className="w-[calc(50%-0.5rem)] shrink-0 md:w-1/4">
          <ProductCard p={p} />
        </div>
      ))}
    </div>
  )
}
