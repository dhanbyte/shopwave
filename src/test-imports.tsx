// Test imports
import type { Product } from '@/lib/types'
import { useWishlist } from '@/lib/wishlistStore'
import { Button } from '@/components/ui/button'

// This file is just to test if imports work
const test: Product = {
  id: '1',
  name: 'test',
  slug: 'test',
  brand: 'test',
  category: 'test',
  image: 'test',
  quantity: 1,
  price: { original: 100 },
  description: 'test'
}

export default function TestImports() {
  return null
}
