
'use client'
import Link from 'next/link'
import PriceTag from './PriceTag'
import RatingStars from './RatingStars'
import WishlistButton from './WishlistButton'
import { useCart } from '@/lib/cartStore'
import { motion } from 'framer-motion'
import ProductSuggestionsRow from './ProductSuggestionsRow'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import { Button } from './ui/button'
import { useAuth } from '@/context/ClerkAuthContext'
import { useToast } from '@/hooks/use-toast'
import { useNotificationStore } from '@/lib/notificationStore'
import { BellRing, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProductCard({ p, suggest }: { p: Product; suggest?: any[] }) {
  const { add } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter();
  const { addNotification, hasNotification } = useNotificationStore()
  const price = p.price.discounted ?? p.price.original
  
  const handleAddToCart = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to add items to cart", variant: "destructive" });
      return;
    }
    add(user.id, { id: p.id, qty: 1, price, name: p.name, image: p.image });
    toast({ title: "Added to Cart", description: `${p.name} has been added to your cart.` });
  };

  const handleNotifyMe = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to get notifications", variant: "destructive" });
      return;
    }
    if (!hasNotification(p.id)) {
      addNotification(user.id, p.id);
      toast({ title: "You're on the list!", description: `We'll notify you when ${p.name} is back in stock.` });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card p-2 flex flex-col group"
    >
      <div className="relative">
        <Link href={`/product/${p.slug}`}>
          <div className="relative w-full h-32 overflow-hidden">
            <Image
              src={p.image}
              alt={p.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 20vw, 15vw"
              className="rounded-lg object-cover transform transition-transform duration-300 group-hover:scale-105"
            />
             {p.quantity === 0 && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-full">OUT OF STOCK</span>
                </div>
            )}
          </div>
        </Link>
        <div className="absolute right-1 top-1">
          <WishlistButton id={p.id} />
        </div>
      </div>
      <div className="flex-grow flex flex-col pt-2 px-1">
        <Link href={`/product/${p.slug}`} className="flex-grow">
          <div className="line-clamp-2 h-9 text-sm font-medium">{p.name}</div>
          <RatingStars value={p.ratings?.average ?? 0} />
          <div className="mt-1">
            <PriceTag original={p.price.original} discounted={p.price.discounted} />
          </div>
        </Link>
        <div className="mt-2">
            {p.quantity > 0 ? (
                <Button onClick={handleAddToCart} size="sm" className="w-full h-9">
                    Add to Cart
                </Button>
            ) : (
                hasNotification(p.id) ? (
                    <Button size="sm" className="w-full h-9" disabled>
                        <Check className="h-4 w-4 mr-2" />
                        We'll Notify You
                    </Button>
                ) : (
                    <Button onClick={handleNotifyMe} size="sm" variant="secondary" className="w-full h-9">
                        <BellRing className="h-4 w-4 mr-2" />
                        Notify Me
                    </Button>
                )
            )}
        </div>
      </div>
      {/* Below-card suggestions */}
      {suggest && suggest.length > 0 && (
        <div className="mt-4 border-t pt-2">
          <div className="mb-1 text-xs font-medium text-gray-500">Customers also viewed</div>
          <ProductSuggestionsRow products={suggest} />
        </div>
      )}
    </motion.div>
  )
}
