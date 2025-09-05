
'use client'
import { create } from 'zustand'
import { safeGet, safeSet } from './storage'
import type { NotificationItem } from './types'

type AllNotificationsData = {
  [userId: string]: NotificationItem[]
}

type NotificationState = {
  notifications: NotificationItem[]
  isLoading: boolean
  init: (userId: string) => void
  addNotification: (userId: string, productId: string) => void
  removeNotification: (userId: string, productId: string) => void
  hasNotification: (productId: string) => boolean
  clear: () => void
}

const getAllNotifications = (): AllNotificationsData => {
  return safeGet('all-notifications', {});
}

const saveAllNotifications = (data: AllNotificationsData) => {
  safeSet('all-notifications', data);
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  isLoading: true,
  init: (userId: string) => {
    set({ isLoading: true });
    const allNotifications = getAllNotifications();
    const userNotifications = allNotifications[userId] || [];
    set({ notifications: userNotifications, isLoading: false });
  },
  addNotification: (userId: string, productId: string) => {
    const allNotifications = getAllNotifications();
    let userNotifications = allNotifications[userId] || [];
    const exists = userNotifications.some(item => item.productId === productId);

    if (!exists) {
      const newItem: NotificationItem = { productId, notifiedAt: Date.now() };
      userNotifications.push(newItem);
      allNotifications[userId] = userNotifications;
      saveAllNotifications(allNotifications);
      set({ notifications: [...userNotifications] });
    }
  },
  removeNotification: (userId: string, productId: string) => {
    const allNotifications = getAllNotifications();
    let userNotifications = allNotifications[userId] || [];
    const newNotifications = userNotifications.filter(item => item.productId !== productId);
    
    allNotifications[userId] = newNotifications;
    saveAllNotifications(allNotifications);
    set({ notifications: newNotifications });
  },
  hasNotification: (productId: string) => {
    return get().notifications.some(item => item.productId === productId);
  },
  clear: () => {
    set({ notifications: [], isLoading: true });
  }
}));
