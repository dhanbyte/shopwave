'use client'
import { useParams } from 'next/navigation'
import { useProductStore } from '@/lib/productStore'
import ProductCard from '@/components/ProductCard'
import { useMemo } from 'react'

const categoryNames: Record<string, string> = {
  'tech': 'Tech Accessories',
  'home': 'Home & Kitchen',
  'ayurvedic': 'Ayurvedic Products',
  'electronics': 'Electronics'
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const { products } = useProductStore()
  
  const categoryProducts = useMemo(() => {
    const category = slug.charAt(0).toUpperCase() + slug.slice(1)
    return products.filter(p => 
      p.category.toLowerCase() === slug.toLowerCase() || 
      (slug === 'electronics' && p.category === 'Tech')
    )
  }, [products, slug])

  const categoryName = categoryNames[slug.toLowerCase()] || slug

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{categoryName}</h1>
        <p className="text-gray-600">Discover our collection of {categoryName.toLowerCase()}</p>
      </div>

      {categoryProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categoryProducts.map(product => (
            <ProductCard key={product.id} p={product} />
          ))}
        </div>
      )}
    </div>
  )
}