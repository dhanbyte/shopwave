
'use client'
import { create } from 'zustand'
import type { Product } from './types'
import { AYURVEDIC_PRODUCTS } from './sampleData'
import { HOME_PRODUCTS } from './data/home'
import { TECH_PRODUCTS } from './data/tech'

const ALL_SAMPLE_PRODUCTS = [...AYURVEDIC_PRODUCTS, ...HOME_PRODUCTS, ...TECH_PRODUCTS];

type ProductState = {
  products: Product[]
  isLoading: boolean
  initialized: boolean
  init: () => Promise<void>
  getProduct: (id: string) => Product | undefined
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product | null>
  deleteProduct: (id: string) => Promise<boolean>
  searchProducts: (query: string) => Promise<Product[]>
  getProductsByCategory: (category: string) => Promise<Product[]>
  refetch: () => Promise<void>
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  isLoading: true,
  initialized: false,
  
  init: async () => {
    if (get().initialized) {
      return;
    }
    
    set({ isLoading: true });
    
    try {
      // Try to fetch from MongoDB API first
      const response = await fetch('/api/products');
      if (response.ok) {
        const result = await response.json();
        const products = result.data || [];
        
        if (products.length > 0) {
          console.log(`Successfully loaded ${products.length} products from MongoDB`);
          set({ products, isLoading: false, initialized: true });
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching products from MongoDB:", error);
    }
    
    // Fallback to sample data if API fails or returns no products
    console.log('Using sample data as fallback');
    set({ products: ALL_SAMPLE_PRODUCTS, isLoading: false, initialized: true });
  },

  getProduct: (id: string) => {
    return get().products.find(product => product.id === id);
  },

  addProduct: async (productData) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add product');
      }
      
      const result = await response.json();
      const newProduct = result.data;
      
      const currentProducts = get().products;
      set({ products: [...currentProducts, newProduct] });
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
      }
      
      const result = await response.json();
      const updatedProduct = result.data;
      
      if (updatedProduct) {
        const currentProducts = get().products;
        const updatedProducts = currentProducts.map(product => 
          product.id === id ? updatedProduct : product
        );
        set({ products: updatedProducts });
      }
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }
      
      const currentProducts = get().products;
      const filteredProducts = currentProducts.filter(product => product.id !== id);
      set({ products: filteredProducts });
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  },

  searchProducts: async (query: string) => {
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  },

  getProductsByCategory: async (category: string) => {
    try {
      const response = await fetch(`/api/products?category=${encodeURIComponent(category)}`);
      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return [];
    }
  },

  refetch: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const result = await response.json();
        const products = result.data || [];
        set({ products, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error refetching products:", error);
      set({ isLoading: false });
    }
  },
}));

// Initialize the store immediately
useProductStore.getState().init();
