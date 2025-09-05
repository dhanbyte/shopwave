
'use client'
import { ShoppingCart, User, Heart } from 'lucide-react'
import Link from 'next/link'
import SearchBar from './SearchBar'
import { useCart } from '@/lib/cartStore'
import { useWishlist } from '@/lib/wishlistStore'
import { useOrders } from '@/lib/ordersStore'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const mainCategories = ['Tech', 'Home', 'Ayurvedic'];

export default function TopBar() {
  const { user } = useAuth();
  const { items } = useCart();
  const { ids: wishlistIds, hasNewItem: hasNewWishlistItem } = useWishlist();
  const { hasNewOrder } = useOrders();
  const cartItemCount = items.reduce((acc, item) => acc + item.qty, 0);
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="container flex items-center gap-4 py-3">
        <Link href="/" className="text-xl font-bold text-brand">ShopWave</Link>
        <div className="hidden flex-1 md:block md:px-8 lg:px-16">
          <SearchBar />
        </div>
        
        <div className="hidden md:flex items-center gap-4">
            {mainCategories.filter(c => c !== currentCategory).map(c => (
                <Link key={c} href={`/search?category=${c}`} className="text-sm font-medium text-gray-600 hover:text-brand transition-colors">{c === 'Home' ? 'Home Decor' : c}</Link>
            ))}
        </div>

        <nav className="ml-auto flex items-center gap-1 sm:gap-3">
          <Link href="/wishlist" className="relative rounded-full p-2 hover:bg-gray-100 transition-colors" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            {user && hasNewWishlistItem && (
              <span className="absolute right-0 top-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white blinking-dot" />
            )}
            {user && wishlistIds.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs text-white">
                {wishlistIds.length}
              </span>
            )}
          </Link>
          <Link href="/account" className="relative rounded-full p-2 hover:bg-gray-100 transition-colors" aria-label="Account">
            <User className="h-5 w-5" />
             {user && hasNewOrder && (
              <span className="absolute right-0 top-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white blinking-dot" />
            )}
          </Link>
          <Link href="/cart" className="relative rounded-full p-2 hover:bg-gray-100 transition-colors" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {user && cartItemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs text-white">
                {cartItemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
      <div className="container md:hidden pb-3 border-t md:border-t-0"><SearchBar /></div>
    </header>
  )
}
