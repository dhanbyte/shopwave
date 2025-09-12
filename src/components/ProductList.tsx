'use client';

import { useState, useEffect } from 'react';
import { getAllProducts } from '@/lib/data/allProducts';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} p={product} />
      ))}
    </div>
  );
}