
'use client'
import { create } from 'zustand'
import type { Order, Address, PaymentMethod } from './types'
import type { CartItem } from './cartStore'

type OrdersState = {
  orders: Order[]
  isLoading: boolean
  hasNewOrder: boolean
  init: (userId: string | null) => void
  placeOrder: (userId: string, items: CartItem[], address: Address, total: number, payment: PaymentMethod, referralCode?: string) => Promise<Order>
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>
  clearNewOrderStatus: (userId: string) => void
  clear: () => void
}



export const useOrders = create<OrdersState>()((set, get) => ({
  orders: [],
  isLoading: true,
  hasNewOrder: false,
  init: async (userId) => {
    set({ isLoading: true });
    
    if (userId) {
      try {
        const response = await fetch(`/api/user-data?userId=${encodeURIComponent(userId)}&type=orders`);
        if (response.ok) {
          const serverOrders = await response.json();
          if (serverOrders && Array.isArray(serverOrders)) {
            const sortedOrders = serverOrders.sort((a, b) => b.createdAt - a.createdAt);
            set({ orders: sortedOrders, hasNewOrder: false, isLoading: false });
            return;
          }
        }
      } catch (error) {
        console.warn('Orders sync failed:', error);
      }
    } else {
      // Admin - fetch all orders
      try {
        const response = await fetch('/api/admin/orders');
        if (response.ok) {
          const allOrders = await response.json();
          set({ orders: allOrders, hasNewOrder: false, isLoading: false });
          return;
        }
      } catch (error) {
        console.warn('Admin orders sync failed:', error);
      }
    }
    
    set({ orders: [], hasNewOrder: false, isLoading: false });
  },
  placeOrder: async (userId, items, address, total, payment, referralCode) => {
    // Import useCart dynamically to avoid circular dependency
    const { useCart } = await import('./cartStore');
    const { clearCartFromDB } = useCart.getState();

    const order: Order = {
      id: 'O' + Date.now().toString().slice(-6),
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: items.map(it => ({ productId: it.id, qty: it.qty, price: it.price, name: it.name, image: it.image })),
      total,
      address,
      payment,
      status: 'Pending',
      referralCode
    }
    
    const currentOrders = get().orders;
    const newOrders = [order, ...currentOrders];
    
    set({ orders: newOrders });
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'orders', data: newOrders })
      });
      
      await clearCartFromDB(userId);
    } catch (error) {
      console.warn('Order save failed:', error);
    }
    
    return order;
  },
  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      
      if (response.ok) {
        // Update local state
        set(state => ({
          orders: state.orders.map(order => 
            order.id === orderId ? { ...order, status } : order
          )
        }));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  },
  clearNewOrderStatus: (userId: string) => {
     set({ hasNewOrder: false });
  },
  clear: () => {
    set({ orders: [], isLoading: true, hasNewOrder: false });
  }
}));
