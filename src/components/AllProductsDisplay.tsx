'use client';

import { useState, useEffect } from 'react';
import { getAllProducts } from '@/lib/data/allProducts';
import { HOME_PRODUCTS } from '@/lib/data/home';
import { TECH_PRODUCTS } from '@/lib/data/tech';
import { AYURVEDIC_PRODUCTS } from '@/lib/data/ayurvedic';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function AllProductsDisplay() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [homeProducts, setHomeProducts] = useState<Product[]>([]);
  const [techProducts, setTechProducts] = useState<Product[]>([]);
  const [ayurvedicProducts, setAyurvedicProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const all = await getAllProducts();
        
        setAllProducts(all);
        setHomeProducts(HOME_PRODUCTS);
        setTechProducts(TECH_PRODUCTS);
        setAyurvedicProducts(AYURVEDIC_PRODUCTS);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading all products...</div>;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">All Products ({allProducts.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allProducts.map(product => (
            <ProductCard key={product.id} p={product} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Home Products ({homeProducts.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {homeProducts.map(product => (
            <ProductCard key={product.id} p={product} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Tech Products ({techProducts.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {techProducts.map(product => (
            <ProductCard key={product.id} p={product} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Ayurvedic Products ({ayurvedicProducts.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ayurvedicProducts.map(product => (
            <ProductCard key={product.id} p={product} />
          ))}
        </div>
      </section>
    </div>
  );
}