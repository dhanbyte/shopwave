
'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useNotificationStore } from '@/lib/notificationStore'
import { useProductStore } from '@/lib/productStore'
import type { Product } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { Button } from './ui/button'

export default function BackInStockPopup() {
  const { user } = useAuth()
  const { products } = useProductStore()
  const { notifications, removeNotification } = useNotificationStore()
  const [showPopup, setShowPopup] = useState(false)
  const [backInStockItems, setBackInStockItems] = useState<Product[]>([])

  useEffect(() => {
    if (!user || notifications.length === 0 || products.length === 0) {
      setBackInStockItems([])
      setShowPopup(false)
      return
    }

    const newlyAvailable = notifications
      .map(notification => products.find(p => p.id === notification.productId))
      .filter((p): p is Product => !!p && p.quantity > 0)

    if (newlyAvailable.length > 0) {
      setBackInStockItems(newlyAvailable)
      setShowPopup(true)
    }
  }, [notifications, products, user])

  const handleClose = () => {
    setShowPopup(false)
    // Clear notifications for the items that were shown
    if (user) {
        backInStockItems.forEach(item => removeNotification(user.id, item.id))
    }
  }
  
  if (!showPopup || backInStockItems.length === 0) return null;

  return (
    <AnimatePresence>
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
        >
          <motion.div 
            initial={{scale:0.9, opacity:0}} 
            animate={{scale:1, opacity:1}} 
            exit={{scale:0.9, opacity:0}} 
            transition={{type:'spring', stiffness:260, damping:20}} 
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-xl font-semibold text-center mb-4">Items Back in Stock!</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
                {backInStockItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0">
                            <Image src={item.image} alt={item.name} fill className="rounded-lg object-cover" />
                        </div>
                        <div className="flex-grow">
                            <div className="text-sm font-medium line-clamp-2">{item.name}</div>
                             <Button asChild size="sm" variant="link" className="p-0 h-auto">
                                <Link href={`/product/${item.slug}`} onClick={handleClose}>View Item</Link>
                             </Button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <Button onClick={handleClose} className="w-full">Okay, Got It</Button>
            </div>
          </motion.div>
        </motion.div>
    </AnimatePresence>
  )
}
