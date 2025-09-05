'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
export default function OfferPopup(){
  const [open, setOpen] = useState(false)
  
  useEffect(() => { 
    if (typeof window !== 'undefined' && sessionStorage.getItem('seenOffer') !== '1') { 
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem('seenOffer', '1');
      }, 5000); // Delay popup so it doesn't appear instantly
      return () => clearTimeout(timer);
    } 
  }, [])
  
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <motion.div 
            initial={{scale:0.9, opacity:0}} 
            animate={{scale:1, opacity:1}} 
            exit={{scale:0.9, opacity:0}} 
            transition={{type:'spring', stiffness:260, damping:20}} 
            className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl"
          >
            <div className="text-xl font-semibold">Limited Time Offer</div>
            <p className="mt-2 text-gray-600">Get an extra <span className="font-bold text-brand">10% OFF</span> on all Tech products. Use code: <b className="rounded bg-gray-100 px-2 py-1">TECH10</b></p>
            <Link href="/search?category=Tech" onClick={() => setOpen(false)} className="mt-4 inline-block rounded-xl bg-brand px-6 py-2.5 font-semibold text-white transition-transform hover:scale-105">Shop Now</Link>
            <button onClick={()=>setOpen(false)} className="mt-2 block w-full text-sm text-gray-500 hover:underline">Maybe later</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
