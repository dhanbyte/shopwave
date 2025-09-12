
'use client'
import { create } from 'zustand'


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



export const useWishlist = create<WishlistState>()((set, get) => ({
  ids: [],
  hasNewItem: false,
  isLoading: true,
  init: async (userId: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/user-data?userId=${encodeURIComponent(userId)}&type=wishlist`);
      if (response.ok) {
        const serverWishlist = await response.json();
        if (serverWishlist && Array.isArray(serverWishlist)) {
          set({ ids: serverWishlist, isLoading: false });
          return;
        }
      }
    } catch (error) {
      console.warn('Wishlist sync failed:', error);
    }
    
    set({ ids: [], isLoading: false });
  },
  toggle: async (userId: string, productId: string) => {
    const currentIds = get().ids;
    const exists = currentIds.includes(productId);

    let newIds;
    if (exists) {
      newIds = currentIds.filter(id => id !== productId);
    } else {
      newIds = [...currentIds, productId];
      set({ hasNewItem: true });
    }
    
    set({ ids: newIds });
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'wishlist', data: newIds })
      });
    } catch (error) {
      console.warn('Wishlist save failed:', error);
    }
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
