
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function Gallery({ images, isOutOfStock }: { images: string[]; isOutOfStock: boolean; }) {
  const [active, setActive] = useState(0)
  if (!images || images.length === 0) {
    return <div className="aspect-square w-full rounded-xl bg-gray-200" />
  }

  return (
    <div>
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-2xl">
        <AnimatePresence initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image 
              src={images[active]} 
              alt={`Product image ${active + 1}`} 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover" 
            />
             {isOutOfStock && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white text-lg font-bold bg-black/50 px-4 py-2 rounded-full">OUT OF STOCK</span>
                </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((src, i) => (
          <button 
            key={i} 
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${i === active ? 'border-brand' : 'border-transparent hover:border-brand/50'}`} 
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
          >
            <div className="relative h-full w-full">
                <Image src={src} alt={`thumbnail ${i + 1}`} fill className="object-cover" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
