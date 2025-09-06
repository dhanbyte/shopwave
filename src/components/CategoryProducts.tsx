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

  if (loading) return <div>Loading {category} products...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} p={product} />
      ))}
    </div>
  );
}