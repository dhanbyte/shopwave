
'use client'
import { create } from 'zustand'
import { doc, onSnapshot, setDoc, updateDoc, collection, getDocs, where, query } from 'firebase/firestore'
import { db } from './firebase'
import type { Order, Address, PaymentMethod } from './types'
import type { CartItem } from './cartStore'
import { useCart } from './cartStore'

type OrdersState = {
  orders: Order[]
  isLoading: boolean
  hasNewOrder: boolean
  init: (userId: string | null) => () => void
  placeOrder: (userId: string, items: CartItem[], address: Address, total: number, payment: PaymentMethod) => Promise<Order>
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>
  clearNewOrderStatus: (userId: string) => Promise<void>
  clear: () => void
}

const getOrderDocRef = (userId: string) => doc(db, 'orders', userId);
const allOrdersCollRef = collection(db, 'orders');

export const useOrders = create<OrdersState>()((set, get) => ({
  orders: [],
  isLoading: true,
  hasNewOrder: false,
  init: (userId) => {
    set({ isLoading: true });
    
    // If userId is provided (regular user), listen to that user's orders document.
    if (userId) {
        const docRef = getOrderDocRef(userId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const sortedList = (data.list || []).sort((a: Order, b: Order) => b.createdAt - a.createdAt);
                set({ orders: sortedList, hasNewOrder: data.hasNewOrder || false, isLoading: false });
            } else {
                setDoc(docRef, { list: [], hasNewOrder: false });
                set({ orders: [], hasNewOrder: false, isLoading: false });
            }
        }, (error) => {
            console.error(`Error fetching orders for user ${userId}:`, error);
            set({ isLoading: false });
        });
        return unsubscribe;
    } 
    // If no userId (for admin), fetch all order documents.
    else {
        const fetchAllOrders = async () => {
            try {
                const querySnapshot = await getDocs(allOrdersCollRef);
                const allOrders: Order[] = [];
                querySnapshot.forEach(doc => {
                     const data = doc.data();
                     if (data.list) {
                        allOrders.push(...data.list);
                     }
                });
                const sortedOrders = allOrders.sort((a, b) => b.createdAt - a.createdAt);
                set({ orders: sortedOrders, isLoading: false });
            } catch (error) {
                console.error("Error fetching all orders for admin:", error);
                set({ isLoading: false });
            }
        };

        fetchAllOrders();
        // For admin, we don't need a real-time listener as it's inefficient.
        // We will refetch manually or on a timer if needed.
        return () => {}; // Return an empty unsubscribe function
    }
  },
  placeOrder: async (userId, items, address, total, payment) => {
    const docRef = getOrderDocRef(userId);
    const { clearCartFromDB } = useCart.getState();

    const order: Order = {
      id: 'O' + Date.now().toString().slice(-6),
      createdAt: Date.now(),
      items: items.map(it => ({ productId: it.id, qty: it.qty, price: it.price, name: it.name, image: it.image })),
      total,
      address,
      payment,
      status: 'Pending',
    }
    const state = get();
    const currentOrders = state.orders;
    const newOrders = [order, ...currentOrders];
    await setDoc(docRef, { list: newOrders, hasNewOrder: true }, { merge: true });
    
    // After placing order, clear the cart from the database
    await clearCartFromDB(userId);
    
    set({ hasNewOrder: true }); 
    return order;
  },
  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    // This logic is inefficient and should be improved with a better data model,
    // e.g., a top-level 'orders' collection where each doc is an order.
    // For now, fetching all and updating in client.
    const allDocsSnapshot = await getDocs(allOrdersCollRef);
    let targetDocRef: any = null;
    let userOrders: Order[] = [];

    for (const doc of allDocsSnapshot.docs) {
        const ordersList = doc.data().list as Order[];
        if (ordersList && ordersList.some(o => o.id === orderId)) {
            targetDocRef = doc.ref;
            userOrders = ordersList;
            break;
        }
    }

    if (!targetDocRef) {
        console.error("Could not find document for order:", orderId);
        return;
    }

    const newOrders = userOrders.map(o => 
      o.id === orderId ? { ...o, status: status } : o
    );
    await updateDoc(targetDocRef, { list: newOrders });
  },
  clearNewOrderStatus: async (userId: string) => {
     set({ hasNewOrder: false });
     const docRef = getOrderDocRef(userId);
     await updateDoc(docRef, { hasNewOrder: false });
  },
  clear: () => {
    set({ orders: [], isLoading: true, hasNewOrder: false });
  }
}));
