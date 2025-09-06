'use client';

import { useState, useEffect } from 'react';
import { ProductService } from '@/lib/services/productService';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function MixedProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'home' | 'tech' | 'api'>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await ProductService.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    if (filter === 'home') return product.category === 'Home';
    if (filter === 'tech') return product.category === 'Tech';
    if (filter === 'api') return product.category === 'API';
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          All ({products.length})
        </button>
        <button
          onClick={() => setFilter('home')}
          className={`px-4 py-2 rounded ${filter === 'home' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Home ({products.filter(p => p.category === 'Home').length})
        </button>
        <button
          onClick={() => setFilter('tech')}
          className={`px-4 py-2 rounded ${filter === 'tech' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Tech ({products.filter(p => p.category === 'Tech').length})
        </button>
        <button
          onClick={() => setFilter('api')}
          className={`px-4 py-2 rounded ${filter === 'api' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          API ({products.filter(p => p.category === 'API').length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}