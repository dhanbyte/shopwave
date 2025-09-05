
'use client'
import { create } from 'zustand'
import { safeGet, safeSet } from './storage'
import type { Product } from './types'
import { useProductStore } from './productStore'

export type CartItem = Pick<Product, 'id' | 'name' | 'image'> & {
  qty: number
  price: number // This is the discounted price
}

type AllCartsData = {
  [userId: string]: CartItem[]
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
  
  // Check if cart has both Ayurvedic and other categories
  const hasAyurvedic = items.some(item => {
    const product = products.find(p => p.id === item.id)
    return product?.category === 'Ayurvedic'
  })
  const hasOthers = items.some(item => {
    const product = products.find(p => p.id === item.id)
    return product?.category !== 'Ayurvedic'
  })
  
  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);
  let totalShipping = 0;
  if (totalItems > 0) {
    if (totalItems <= 2) {
      totalShipping = 45;
    } else if (totalItems <= 8) {
      totalShipping = 65;
    } else {
      totalShipping = 100;
      const remainingItems = totalItems - 8;
      totalShipping += Math.ceil(remainingItems / 5) * 35;
    }
    
    // Double delivery charge if both Ayurvedic and other products
    if (hasAyurvedic && hasOthers) {
      totalShipping *= 2;
    }
  }

  // Platform fee instead of tax
  const platformFee = subtotal * 0.02; // 2% platform fee

  const total = (subtotal - totalDiscount) + totalShipping + platformFee
  return { subtotal, totalDiscount, totalShipping, totalTax: platformFee, total }
}

const getAllCarts = (): AllCartsData => {
  return safeGet('all-carts', {});
}

const saveAllCarts = (data: AllCartsData) => {
  safeSet('all-carts', data);
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
      const response = await fetch(`/api/user-data?userId=${userId}&type=cart`);
      if (response.ok) {
        const serverCart = await response.json();
        if (serverCart && Array.isArray(serverCart)) {
          set({ items: serverCart, ...calculateTotals(serverCart) });
          return;
        }
      }
    } catch (error) {
      console.error('Error loading cart from server:', error);
    }
    
    set({ items: [], ...calculateTotals([]) });
  },
  add: async (userId: string, item: CartItem) => {
    const allCarts = getAllCarts();
    let userCart = allCarts[userId] || [];
    const existing = userCart.find((p) => p.id === item.id)
    
    if (existing) {
      userCart = userCart.map((p) =>
        p.id === item.id ? { ...p, qty: Math.min(99, p.qty + item.qty) } : p
      )
    } else {
      userCart = [...userCart, { ...item, qty: Math.max(1, item.qty) }]
    }

    allCarts[userId] = userCart;
    saveAllCarts(allCarts);
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'cart', data: userCart })
      });
    } catch (error) {
      console.error('Error saving cart to server:', error);
    }
    
    set({ items: userCart, ...calculateTotals(userCart) });
  },
  remove: async (userId: string, id: string) => {
    const allCarts = getAllCarts();
    let userCart = allCarts[userId] || [];
    const newItems = userCart.filter((p) => p.id !== id);
    
    allCarts[userId] = newItems;
    saveAllCarts(allCarts);
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'cart', data: newItems })
      });
    } catch (error) {
      console.error('Error saving cart to server:', error);
    }
    
    set({ items: newItems, ...calculateTotals(newItems) });
  },
  setQty: async (userId: string, id: string, qty: number) => {
    const allCarts = getAllCarts();
    let userCart = allCarts[userId] || [];
    const newItems = userCart.map((p) =>
      p.id === id ? { ...p, qty: Math.max(1, Math.min(99, qty)) } : p
    );

    allCarts[userId] = newItems;
    saveAllCarts(allCarts);
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'cart', data: newItems })
      });
    } catch (error) {
      console.error('Error saving cart to server:', error);
    }
    
    set({ items: newItems, ...calculateTotals(newItems) });
  },
  clear: () => {
    set({ items: [], subtotal: 0, totalDiscount: 0, totalShipping: 0, totalTax: 0, total: 0 })
  },
  clearCartFromDB: async (userId: string) => {
    const allCarts = getAllCarts();
    allCarts[userId] = [];
    saveAllCarts(allCarts);
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'cart', data: [] })
      });
    } catch (error) {
      console.error('Error clearing cart on server:', error);
    }
    
    get().clear();
  }
}))
