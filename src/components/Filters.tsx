
'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react';
import { useProductStore } from '@/lib/productStore';

export default function Filters(){
  const router = useRouter(); 
  const sp = useSearchParams(); 
  const path = usePathname();
  const { products } = useProductStore();
  
  const set = (patch: Record<string,string|number|undefined|null>) => {
    const url = new URLSearchParams(sp.toString())
    Object.entries(patch).forEach(([k,v]) => {
      if (v === undefined || v === '' || v === null) {
        url.delete(k);
      } else {
        url.set(k, String(v));
      }
    });
    router.replace(`${path}?${url.toString()}`);
  }

  const { availableSubcategories, activeSubcategory, availableTertiaryCategories, activeTertiaryCategory } = useMemo(() => {
    const currentCategory = sp.get('category');
    const currentSubcategory = sp.get('subcategory');

    if (!currentCategory) return { availableSubcategories: [], activeSubcategory: null, availableTertiaryCategories: [], activeTertiaryCategory: null };
    
    const subcategories = [...new Set(products
      .filter(p => p.category === currentCategory && p.subcategory)
      .map(p => p.subcategory!)
    )];

    const tertiaryCategories = currentSubcategory ? [...new Set(products
      .filter(p => p.subcategory === currentSubcategory && p.tertiaryCategory)
      .map(p => p.tertiaryCategory!)
    )] : [];

    return { 
      availableSubcategories: subcategories,
      activeSubcategory: currentSubcategory,
      availableTertiaryCategories: tertiaryCategories,
      activeTertiaryCategory: sp.get('tertiaryCategory')
    };
  }, [sp, products]);

  const handleSubcategoryChange = (subcategory: string | null) => {
    set({ subcategory: subcategory, tertiaryCategory: null }); // Reset tertiary on subcategory change
  };

  const handleTertiaryCategoryChange = (tertiaryCategory: string, checked: boolean) => {
    set({ tertiaryCategory: checked ? tertiaryCategory : null });
  };

  return (
    <div className="space-y-4">
      {availableSubcategories.length > 0 && (
        <div className="rounded-xl border p-3">
          <div className="mb-2 text-sm font-medium">Subcategory</div>
          <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm">
                <input 
                  type="radio" 
                  name="subcategory"
                  className="h-4 w-4 rounded-full border-gray-300 text-brand focus:ring-brand"
                  checked={!activeSubcategory}
                  onChange={() => handleSubcategoryChange(null)}
                />
                All
              </label>
            {availableSubcategories.map(sub => (
              <label key={sub} className="flex items-center gap-2 text-sm">
                <input 
                  type="radio" 
                  name="subcategory"
                  className="h-4 w-4 rounded-full border-gray-300 text-brand focus:ring-brand"
                  checked={activeSubcategory === sub}
                  onChange={() => handleSubcategoryChange(sub)}
                />
                {sub.replace(/-/g, ' ')}
              </label>
            ))}
          </div>
        </div>
      )}

      {availableTertiaryCategories.length > 0 && (
        <div className="rounded-xl border p-3">
          <div className="mb-2 text-sm font-medium">Type</div>
          <div className="space-y-2">
            {availableTertiaryCategories.map(sub => (
              <label key={sub} className="flex items-center gap-2 text-sm">
                <input 
                  type="radio" 
                  name="tertiaryCategory"
                  className="h-4 w-4 rounded-full border-gray-300 text-brand focus:ring-brand"
                  checked={activeTertiaryCategory === sub}
                  onChange={(e) => handleTertiaryCategoryChange(sub, e.target.checked)}
                />
                {sub.replace(/-/g, ' ')}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border p-3">
        <div className="mb-2 text-sm font-medium">Price</div>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" className="w-full rounded-lg border px-2 py-1 text-sm" defaultValue={sp.get('min')||''} onBlur={e=>set({ min: e.target.value||undefined })}/>
          <span>-</span>
          <input type="number" placeholder="Max" className="w-full rounded-lg border px-2 py-1 text-sm" defaultValue={sp.get('max')||''} onBlur={e=>set({ max: e.target.value||undefined })}/>
        </div>
      </div>

      <div className="rounded-xl border p-3">
        <div className="mb-2 text-sm font-medium">Rating</div>
        <select className="w-full rounded-lg border px-2 py-1 text-sm" defaultValue={sp.get('rating')||''} onChange={e=>set({ rating: e.target.value||undefined })}>
          <option value="">Any</option>
          <option value="4">4★ & up</option>
          <option value="3">3★ & up</option>
        </select>
      </div>
    </div>
  )
}
