'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function SortBar(){
  const router = useRouter(); const sp = useSearchParams(); const path = usePathname();
  const sort = sp.get('sort') || ''
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URLSearchParams(sp.toString()); 
    const v = e.target.value;
    v ? url.set('sort', v) : url.delete('sort'); 
    router.replace(`${path}?${url.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm text-gray-500">Sort by:</label>
      <select id="sort-select" className="rounded-lg border bg-gray-50 px-2 py-1.5 text-sm" value={sort} onChange={handleSortChange}>
        <option value="">Relevance</option>
        <option value="new">Newest</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
        <option value="popular">Popularity</option>
      </select>
    </div>
  )
}
