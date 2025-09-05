'use client'
import { useCart } from '@/lib/cartStore'
import QtyCounter from '@/components/QtyCounter'
import Link from 'next/link'
import PriceTag from '@/components/PriceTag'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/ClerkAuthContext'

export default function CartPage(){
  const { user } = useAuth()
  const { items, setQty, remove, subtotal, totalDiscount, totalShipping, totalTax, total } = useCart()
  
  const handleRemove = (itemId: string) => {
    if (user) {
      remove(user.id, itemId)
    }
  }

  const handleSetQty = (itemId: string, newQty: number) => {
    if (user) {
      setQty(user.id, itemId, newQty)
    }
  }
  
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Your Cart</h1>
      {items.length === 0 && (
        <div className="card p-8 text-center">
          <h2 className="text-lg font-medium text-gray-700">Your cart is empty.</h2>
          <p className="text-sm text-gray-500 mt-1">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild className="mt-4">
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      )}
      {items.length > 0 && (
        <div className="grid gap-6 md:grid-cols-[1fr_320px] md:items-start">
          <div className="space-y-3">
            {items.map(it => (
              <div key={it.id} className="card flex items-center gap-4 p-3">
                <div className="relative h-20 w-20 shrink-0">
                    <Image src={it.image} alt={it.name} fill className="rounded-lg object-cover"/>
                </div>
                <div className="flex-1">
                  <div className="line-clamp-2 font-medium text-sm">{it.name}</div>
                  <div className="mt-1"><PriceTag original={it.price} /></div>
                  <div className="mt-2"><QtyCounter value={it.qty} onChange={n=>handleSetQty(it.id, n)} /></div>
                </div>
                <button onClick={()=>handleRemove(it.id)} className="rounded-lg border p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200" aria-label="Remove item">
                    <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="card sticky top-24 p-4">
            <div className="text-lg font-semibold">Price Details</div>
            <div className="mt-3 space-y-2 border-b pb-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- ₹{totalDiscount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{totalShipping > 0 ? `₹${totalShipping.toLocaleString('en-IN')}`: 'Free'}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="mt-3 flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
             <Button asChild className="mt-4 w-full">
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
