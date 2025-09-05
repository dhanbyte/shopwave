
'use client'
import { create } from 'zustand'
import { googleAppsScriptService } from './googleAppsScript'
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
    
    // For now, just use sample data to avoid API errors during development
    // TODO: Configure proper Google Apps Script URL or database connection
    console.log('Using sample data for product store');
    set({ products: ALL_SAMPLE_PRODUCTS, isLoading: false, initialized: true });
    return;
    
    // Commented out external API calls until proper configuration
    /*
    // Check if Google Apps Script URL is configured
    const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_API_URL;
    
    if (!appsScriptUrl || appsScriptUrl.trim() === '') {
      console.log('Google Apps Script API URL not configured, using sample data');
      set({ products: ALL_SAMPLE_PRODUCTS, isLoading: false, initialized: true });
      return;
    }
    
    try {
      // Try to fetch from Google Apps Script API first
      const products = await googleAppsScriptService.getProducts();
      
      if (products.length > 0) {
        console.log(`Successfully loaded ${products.length} products from Google Apps Script`);
        set({ products, isLoading: false, initialized: true });
      } else {
        // Fallback to sample data if API returns no products or fails
        console.warn("Google Apps Script API returned no products, using sample data");
        set({ products: ALL_SAMPLE_PRODUCTS, isLoading: false, initialized: true });
      }
    } catch (error) {
      console.error("Error fetching products from Apps Script:", error);
      
      // Try local API as secondary fallback
      try {
        console.log("Trying local API as fallback...");
        const response = await fetch('/api/products');
        if (response.ok) {
          const products = await response.json();
          console.log(`Successfully loaded ${products.length} products from local API`);
          set({ products, isLoading: false, initialized: true });
          return;
        }
      } catch (apiError) {
        console.error("Local API also failed:", apiError);
      }
      
      console.log("All API sources failed, falling back to sample data");
      // Use sample data as final fallback
      set({ products: ALL_SAMPLE_PRODUCTS, isLoading: false, initialized: true });
    }
    */
  },

  getProduct: (id: string) => {
    return get().products.find(product => product.id === id);
  },

  addProduct: async (productData) => {
    try {
      const newProduct = await googleAppsScriptService.addProduct(productData);
      const currentProducts = get().products;
      set({ products: [...currentProducts, newProduct] });
      return newProduct;
    } catch (error) {
      console.error("Error adding product via Google Apps Script:", error);
      throw error;
    }
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = await googleAppsScriptService.updateProduct(id, updates);
      if (updatedProduct) {
        const currentProducts = get().products;
        const updatedProducts = currentProducts.map(product => 
          product.id === id ? updatedProduct : product
        );
        set({ products: updatedProducts });
      }
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product via Google Apps Script:", error);
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const success = await googleAppsScriptService.deleteProduct(id);
      if (success) {
        const currentProducts = get().products;
        const filteredProducts = currentProducts.filter(product => product.id !== id);
        set({ products: filteredProducts });
      }
      return success;
    } catch (error) {
      console.error("Error deleting product via Google Apps Script:", error);
      return false;
    }
  },

  searchProducts: async (query: string) => {
    try {
      const products = await googleAppsScriptService.searchProducts(query);
      return products;
    } catch (error) {
      console.error("Error searching products via Google Apps Script:", error);
      return [];
    }
  },

  getProductsByCategory: async (category: string) => {
    try {
      const products = await googleAppsScriptService.getProductsByCategory(category);
      return products;
    } catch (error) {
      console.error("Error fetching products by category via Google Apps Script:", error);
      return [];
    }
  },

  refetch: async () => {
    set({ isLoading: true });
    try {
      const products = await googleAppsScriptService.getProducts();
      set({ products, isLoading: false });
    } catch (error) {
      console.error("Error refetching products from Google Apps Script:", error);
      set({ isLoading: false });
    }
  },
}));

// Initialize the store immediately
useProductStore.getState().init();
