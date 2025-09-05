'use client'
import Link from 'next/link'
import PriceTag from './PriceTag'
import Image from 'next/image'

export default function SearchSuggestions({ items, onPick }:{ items: { id:string; slug:string; name:string; image:string; price:number }[], onPick?: ()=>void }){
  if (!items.length) return null
  return (
    <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border bg-white shadow-soft">
      <ul className="max-h-96 overflow-auto">
        {items.map(it => (
          <li key={it.id}>
            <Link href={`/product/${it.slug}`} onClick={onPick} className="flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors">
              <div className="relative h-12 w-12 shrink-0">
                <Image src={it.image} alt={it.name} fill className="rounded-lg object-cover"/>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="line-clamp-1 text-sm font-medium">{it.name}</div>
                <PriceTag original={it.price} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
