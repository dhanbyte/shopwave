'use client'
import { create } from 'zustand'
import { supabase } from './supabase'
import type { Order, Address, PaymentMethod } from './types'
import type { CartItem } from './cartStore'
import { referralService } from './referralService'

type OrdersState = {
  orders: Order[]
  isLoading: boolean
  hasNewOrder: boolean
  init: (userId: string | null) => () => void
  placeOrder: (userId: string, items: CartItem[], address: Address, total: number, payment: PaymentMethod, referralCode?: string) => Promise<Order>
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>
  clearNewOrderStatus: (userId: string) => Promise<void>
  clear: () => void
}

export const useOrders = create<OrdersState>()((set, get) => ({
  orders: [],
  isLoading: true,
  hasNewOrder: false,
  
  init: (userId) => {
    set({ isLoading: true });
    
    if (userId) {
      // Listen to user's orders
      const fetchUserOrders = async () => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('userId', userId)
            .order('createdAt', { ascending: false });

          if (error) {
            console.error('Error fetching user orders:', error);
            set({ isLoading: false });
            return;
          }

          set({ orders: data || [], isLoading: false });
        } catch (error) {
          console.error('Error in fetchUserOrders:', error);
          set({ isLoading: false });
        }
      };

      fetchUserOrders();

      // Set up real-time subscription
      const subscription = supabase
        .channel(`orders:userId=eq.${userId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'orders',
            filter: `userId=eq.${userId}`
          }, 
          () => {
            fetchUserOrders();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // For admin - fetch all orders
      const fetchAllOrders = async () => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('createdAt', { ascending: false });

          if (error) {
            console.error('Error fetching all orders:', error);
            set({ isLoading: false });
            return;
          }

          set({ orders: data || [], isLoading: false });
        } catch (error) {
          console.error('Error in fetchAllOrders:', error);
          set({ isLoading: false });
        }
      };

      fetchAllOrders();

      // Set up real-time subscription for all orders
      const subscription = supabase
        .channel('all-orders')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'orders'
          }, 
          () => {
            fetchAllOrders();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  },

  placeOrder: async (userId, items, address, total, payment, referralCode) => {
    try {
      let finalTotal = total;
      let discountAmount = 0;

      // Apply referral code discount if provided
      if (referralCode) {
        const result = await referralService.applyReferralCode(referralCode, total);
        if (result.isValid) {
          discountAmount = result.discountAmount;
          finalTotal = total - discountAmount;
        }
      }

      const newOrder: Omit<Order, 'id'> = {
        userId,
        items: items.map(item => ({
          productId: item.id,
          qty: item.qty,
          price: item.price,
          name: item.name,
          image: item.image
        })),
        total: finalTotal,
        originalTotal: total,
        discountAmount,
        referralCode: referralCode || null,
        address,
        payment,
        status: 'Pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .single();

      if (error) {
        console.error('Error placing order:', error);
        throw error;
      }

      const order = data as Order;

      // Record referral usage if applicable
      if (referralCode && discountAmount > 0) {
        await referralService.recordReferralUsage(referralCode, userId, order.id, total);
      }

      // Update local state
      const currentOrders = get().orders;
      set({ orders: [order, ...currentOrders] });

      return order;
    } catch (error) {
      console.error('Error in placeOrder:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updatedAt: Date.now() 
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      // Update local state
      const currentOrders = get().orders;
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId 
          ? { ...order, status, updatedAt: Date.now() }
          : order
      );
      set({ orders: updatedOrders });
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  },

  clearNewOrderStatus: async (userId) => {
    try {
      // This can be implemented based on your notification system
      set({ hasNewOrder: false });
    } catch (error) {
      console.error('Error in clearNewOrderStatus:', error);
    }
  },

  clear: () => {
    set({ orders: [], isLoading: false, hasNewOrder: false });
  },
}));
