
'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const BANNERS = [
  { id:1, img:'https://images.unsplash.com/photo-1515940175183-6798529cb860?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxsYXRlc3QlMjBnYWRnZXRzfGVufDB8fHx8MTc1NjM4MDEyMHww&ixlib=rb-4.1.0&q=80&w=1080', title:'Big Tech Deals', link:'/search?category=Tech', dataAiHint: 'latest gadgets' },
  { id:2, img:'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=1600&auto=format&fit=crop', title:'Festive Fashion Sale', link:'/search?category=Fashion', dataAiHint: 'stylish apparel' },
  { id:3, img:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop', title:'Ayurvedic Essentials', link:'/search?category=Ayurvedic', dataAiHint: 'natural remedies' },
]

export default function BannerSlider(){
  const [idx, setIdx] = useState(0)
  useEffect(() => { const t = setInterval(()=> setIdx(i => (i+1)%BANNERS.length), 4000); return ()=>clearInterval(t) }, [])
  const b = BANNERS[idx]
  return (
    <div className="relative h-52 w-full overflow-hidden rounded-2xl md:h-80">
      <AnimatePresence>
        <motion.a 
          key={b.id} 
          href={b.link} 
          className="absolute inset-0"
          initial={{opacity:0, scale:1.05}} 
          animate={{opacity:1, scale:1}} 
          exit={{opacity:0, scale:1.05}} 
          transition={{duration:0.7, ease: 'easeInOut'}}
        >
          <Image src={b.img} alt={b.title} fill sizes="100vw" className="object-cover" data-ai-hint={b.dataAiHint}/>
        </motion.a>
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      <div className="absolute bottom-4 left-4 text-white">
        <h2 className="text-2xl md:text-4xl font-bold">{b.title}</h2>
        <p className="hidden md:block mt-1">Shop the latest collection now</p>
      </div>
      <div className="absolute bottom-4 right-4 flex gap-1.5">
        {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`h-2 w-2 rounded-full transition-all ${i === idx ? 'bg-white w-6' : 'bg-white/50'}`}></button>
        ))}
      </div>
    </div>
  )
}
