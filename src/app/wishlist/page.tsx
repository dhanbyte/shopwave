
'use client'
import { useWishlist } from '@/lib/wishlistStore'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/context/ClerkAuthContext'
import { useProductStore } from '@/lib/productStore'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function WishlistPage() {
  const { user } = useAuth();
  const { ids, isLoading, clearNewItemStatus } = useWishlist()
  const { products, isLoading: productsLoading } = useProductStore();
  
  // Memoize the wished products based on the ids from the store
  const wishedProducts = useMemo(() => {
    return products.filter(p => ids.includes(p.id));
  }, [ids, products]);

  useEffect(() => {
    // When the user visits this page, clear the new item notification
    clearNewItemStatus();
  }, [clearNewItemStatus]);

  if (isLoading || productsLoading) {
    return <div className="flex justify-center py-10"><LoadingSpinner /></div>
  }

  if (!user) {
    return (
       <div className="text-center py-10 rounded-xl border bg-white">
          <Heart className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-lg font-medium text-gray-700">Please Login</h2>
          <p className="text-sm text-gray-500 mt-1">Login to see your wishlist.</p>
          <Link href="/account" className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90">Go to Login</Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
      {wishedProducts.length === 0 ? (
        <div className="text-center py-10 rounded-xl border bg-white">
            <Heart className="mx-auto h-12 w-12 text-gray-300" />
            <h2 className="mt-4 text-lg font-medium text-gray-700">Your wishlist is empty.</h2>
            <p className="text-sm text-gray-500 mt-1">Looks like you haven't added anything yet. Start exploring!</p>
            <Link href="/" className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {wishedProducts.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  )
}
