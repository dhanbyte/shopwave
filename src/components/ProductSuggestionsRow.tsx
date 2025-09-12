import Link from 'next/link'
import PriceTag from './PriceTag'
import Image from 'next/image'

export default function ProductSuggestionsRow({ products }:{ products: { slug:string; image:string; name:string; price:number }[] }){
  if (!products.length) return null
  return (
    <div className="no-scrollbar mt-2 flex gap-3 overflow-x-auto pb-2">
      {products.map(p => (
        <Link key={p.slug} href={`/product/${p.slug}`} className="block w-[160px] min-w-[160px] rounded-xl border bg-white p-2 transition-shadow hover:shadow-md">
          <div className="relative h-24 w-full">
            <Image src={p.image} alt={p.name} fill className="rounded-lg object-cover"/>
          </div>
          <div className="mt-1 line-clamp-2 text-xs h-8">{p.name}</div>
          <PriceTag original={p.price} />
        </Link>
      ))}
    </div>
  )
}
