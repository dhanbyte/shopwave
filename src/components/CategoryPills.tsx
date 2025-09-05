
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useProductStore } from '@/lib/productStore'
import { useMemo } from 'react'

const mainCategories = ['Tech', 'Home', 'Ayurvedic', 'Food & Drinks'];

export default function CategoryPills() {
  const router = useRouter(); 
  const sp = useSearchParams(); 
  const { products } = useProductStore();
  const activeCategory = sp.get('category');
  const activeSubcategory = sp.get('subcategory');

  const categoriesToShow = useMemo(() => {
    if (!activeCategory || !mainCategories.includes(activeCategory)) {
      return ['All', ...mainCategories];
    }
    
    const subcategories = [...new Set(products
      .filter(p => p.category === activeCategory && p.subcategory)
      .map(p => p.subcategory!))
    ];
    return ['All', ...subcategories];

  }, [activeCategory, products]);

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(sp.toString());
    const isMainCategory = mainCategories.includes(category);
    
    if (activeCategory && !isMainCategory) {
      // It's a subcategory click
      if (category === 'All') {
        params.delete('subcategory');
      } else {
        params.set('subcategory', category);
      }
    } else {
      // It's a main category click
      params.delete('subcategory');
      if (category === 'All') {
        params.delete('category');
      } else {
        params.set('category', category);
      }
    }

    router.push(`/search?${params.toString()}`);
  }

  const getActivePill = () => {
    if (activeSubcategory) return activeSubcategory;
    if (activeCategory) return activeCategory;
    return 'All';
  }
  
  const activePill = getActivePill();

  return (
    <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
      {categoriesToShow.map(c => (
        <button 
          key={c} 
          onClick={()=> handleCategoryClick(c)} 
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activePill===c?'bg-brand text-white shadow':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          {c.replace('-', ' ')}
        </button>
      ))}
    </div>
  )
}
