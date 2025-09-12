
'use client'
import { create } from 'zustand'
import type { Product } from './types'
import { useProductStore } from './productStore'

export type CartItem = Pick<Product, 'id' | 'name' | 'image'> & {
  qty: number
  price: number // This is the discounted price
}

type CartState = {
  items: CartItem[]
  subtotal: number
  totalDiscount: number
  totalShipping: number
  totalTax: number
  total: number
  init: (userId: string) => void
  add: (userId: string, item: CartItem) => void
  remove: (userId: string, id: string) => void
  setQty: (userId: string, id: string, qty: number) => void
  clear: () => void
  clearCartFromDB: (userId: string) => void
}

const calculateTotals = (items: CartItem[]) => {
  const products = useProductStore.getState().products;

  const totalDiscount = items.reduce((acc, cartItem) => {
    const product = products.find(p => p.id === cartItem.id)
    const originalPrice = product?.price.original || cartItem.price;
    const itemDiscount = (originalPrice - cartItem.price) * cartItem.qty;
    return acc + itemDiscount;
  }, 0)

  const subtotal = items.reduce((s, i) => {
     const product = products.find(p => p.id === i.id)
     const originalPrice = product?.price.original || i.price;
     return s + (i.qty * originalPrice)
  }, 0)
  
  // Count items by category
  let ayurvedicItems = 0;
  let homeItems = 0;
  let techItems = 0;
  
  items.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product?.category === 'Ayurvedic') {
      ayurvedicItems += item.qty;
    } else if (product?.category === 'Tech') {
      techItems += item.qty;
    } else {
      homeItems += item.qty;
    }
  });
  
  // Calculate shipping
  let totalShipping = 0;
  const hasAyurvedic = ayurvedicItems > 0;
  const hasHome = homeItems > 0;
  const hasTech = techItems > 0;
  
  if (hasAyurvedic) {
    // If any Ayurvedic items, charge ₹45
    totalShipping = 45;
  } else if (hasTech) {
    // For Tech items
    if (techItems <= 5) {
      totalShipping = 21; // Flat ₹21 for up to 5 items
    } else {
      // ₹21 for first 5 items + ₹2 per additional item
      totalShipping = 21 + ((techItems - 5) * 2);
    }
    
    // Add Home items to the same calculation if present
    if (hasHome) {
      const totalItems = techItems + homeItems;
      if (totalItems > 5) {
        totalShipping = 21 + ((totalItems - 5) * 2);
      } else {
        totalShipping = 21;
      }
    }
  } else if (hasHome) {
    // For Home items only
    if (homeItems <= 5) {
      totalShipping = 21; // Flat ₹21 for up to 5 items
    } else {
      // ₹21 for first 5 items + ₹2 per additional item
      totalShipping = 21 + ((homeItems - 5) * 2);
    }
  }

  // Calculate platform fee (5% of subtotal)
  const platformFee = subtotal * 0.05;
  
  // Calculate total with all adjustments
  const total = (subtotal - totalDiscount) + totalShipping + platformFee;
  return { subtotal, totalDiscount, totalShipping, totalTax: platformFee, total }
}



export const useCart = create<CartState>()((set, get) => ({
  items: [],
  subtotal: 0,
  totalDiscount: 0,
  totalShipping: 0,
  totalTax: 0,
  total: 0,
  init: async (userId: string) => {
    try {
      const response = await fetch(`/api/user-data?userId=${encodeURIComponent(userId)}&type=cart`);
      if (response.ok) {
        const serverCart = await response.json();
        if (serverCart && Array.isArray(serverCart)) {
          set({ items: serverCart, ...calculateTotals(serverCart) });
          return;
        }
      }
    } catch (error) {
      console.warn('Cart sync failed, starting with empty cart:', error);
    }
    
    set({ items: [], ...calculateTotals([]) });
  },
  add: async (userId: string, item: CartItem) => {
    const currentItems = get().items;
    const existing = currentItems.find((p) => p.id === item.id)
    
    let newItems;
    if (existing) {
      newItems = currentItems.map((p) =>
        p.id === item.id ? { ...p, qty: Math.min(99, p.qty + item.qty) } : p
      )
    } else {
      newItems = [...currentItems, { ...item, qty: Math.max(1, item.qty) }]
    }
    
    set({ items: newItems, ...calculateTotals(newItems) });
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'cart', data: newItems })
      });
    } catch (error) {
      console.warn('Cart save failed:', error);
    }
  },
  remove: async (userId: string, id: string) => {
    const currentItems = get().items;
    const newItems = currentItems.filter((p) => p.id !== id);
    
    set({ items: newItems, ...calculateTotals(newItems) });
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'cart', data: newItems })
      });
    } catch (error) {
      console.warn('Cart save failed:', error);
    }
  },
  setQty: async (userId: string, id: string, qty: number) => {
    const currentItems = get().items;
    const newItems = currentItems.map((p) =>
      p.id === id ? { ...p, qty: Math.max(1, Math.min(99, qty)) } : p
    );
    
    set({ items: newItems, ...calculateTotals(newItems) });
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'cart', data: newItems })
      });
    } catch (error) {
      console.warn('Cart save failed:', error);
    }
  },
  clear: () => {
    set({ items: [], subtotal: 0, totalDiscount: 0, totalShipping: 0, totalTax: 0, total: 0 })
  },
  clearCartFromDB: async (userId: string) => {
    set({ items: [], subtotal: 0, totalDiscount: 0, totalShipping: 0, totalTax: 0, total: 0 });
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'cart', data: [] })
      });
    } catch (error) {
      console.warn('Cart clear failed:', error);
    }
  }
}))
