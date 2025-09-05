
'use client'
import { create } from 'zustand'
import { safeGet, safeSet } from './storage'

type AllWishlistsData = {
  [userId: string]: string[] // array of product IDs
}

type WishlistState = {
  ids: string[]
  hasNewItem: boolean
  isLoading: boolean
  init: (userId: string) => void
  toggle: (userId: string, productId: string) => void
  has: (id: string) => boolean
  clearNewItemStatus: () => void
  clear: () => void
}

const getAllWishlists = (): AllWishlistsData => {
  return safeGet('all-wishlists', {});
}

const saveAllWishlists = (data: AllWishlistsData) => {
  safeSet('all-wishlists', data);
}

export const useWishlist = create<WishlistState>()((set, get) => ({
  ids: [],
  hasNewItem: false,
  isLoading: true,
  init: async (userId: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/user-data?userId=${userId}&type=wishlist`);
      if (response.ok) {
        const serverWishlist = await response.json();
        if (serverWishlist && Array.isArray(serverWishlist)) {
          set({ ids: serverWishlist, isLoading: false });
          return;
        }
      }
    } catch (error) {
      console.error('Error loading wishlist from server:', error);
    }
    
    set({ ids: [], isLoading: false });
  },
  toggle: async (userId: string, productId: string) => {
    const allWishlists = getAllWishlists();
    let userWishlist = allWishlists[userId] || [];
    const exists = userWishlist.includes(productId);

    if (exists) {
      userWishlist = userWishlist.filter(id => id !== productId);
    } else {
      userWishlist.push(productId);
      set({ hasNewItem: true });
    }
    
    allWishlists[userId] = userWishlist;
    saveAllWishlists(allWishlists);
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'wishlist', data: userWishlist })
      });
    } catch (error) {
      console.error('Error saving wishlist to server:', error);
    }
    
    set({ ids: userWishlist });
  },
  has: (id: string) => {
    return get().ids.includes(id)
  },
  clearNewItemStatus: () => {
    set({ hasNewItem: false })
  },
  clear: () => {
    set({ ids: [], isLoading: true, hasNewItem: false });
  }
}));
