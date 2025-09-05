
'use client'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/lib/wishlistStore'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/ClerkAuthContext'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function WishlistButton({ id }: { id: string }) {
  const { user } = useAuth();
  const { ids, has, toggle } = useWishlist()
  const { toast } = useToast()
  const router = useRouter();
  const [isWished, setIsWished] = useState(false)

  // Sync state with the store whenever the ids array changes
  useEffect(() => {
    setIsWished(has(id))
  }, [ids, has, id])

  const handleToggle = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to wishlist",
        variant: "destructive"
      });
      return;
    }
    toggle(user.id, id)
  }

  return (
    <motion.button 
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle Wishlist" 
      onClick={handleToggle} 
      className={`rounded-full p-2 transition-colors ${isWished ? 'bg-red-100 text-red-500' : 'bg-gray-100/80 text-gray-600 hover:bg-red-100/50 hover:text-red-500'}`}
    >
      <Heart className={`h-5 w-5 ${isWished ? 'fill-red-500' : 'fill-transparent'}`} />
    </motion.button>
  )
}
