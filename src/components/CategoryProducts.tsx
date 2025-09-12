'use client';

import { useState, useEffect } from 'react';
import { getHomeProducts, getTechProducts, getAyurvedicProducts } from '@/lib/data/allProducts';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

type Category = 'home' | 'tech' | 'ayurvedic';

export default function CategoryProducts({ category }: { category: Category }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      let data: Product[] = [];
      
      switch(category) {
        case 'home':
          data = await getHomeProducts();
          break;
        case 'tech':
          data = await getTechProducts();
          break;
        case 'ayurvedic':
          data = await getAyurvedicProducts();
          break;
      }
      
      setProducts(data);
      setLoading(false);
    };

    loadProducts();
  }, [category]);

  if (loading) return (
    <div className="flex justify-center items-center py-8">
      <div className="text-gray-600">Loading {category} products...</div>
    </div>
  );

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {category} products available</h3>
          <p className="text-gray-500">Check back later for new products in this category.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} p={product} />
      ))}
    </div>
  );
}