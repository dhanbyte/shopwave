
'use client'
import { create } from 'zustand'
import { safeGet, safeSet } from './storage'
import type { Address } from './types'

type AddressBookData = {
  [userId: string]: Address[]
}

type AddressState = {
  addresses: Address[]
  isLoading: boolean
  init: (userId: string) => void
  save: (userId: string, address: Omit<Address, 'id'> & { id?: string }) => void
  remove: (userId: string, addressId: string) => void
  setDefault: (userId: string, addressId: string) => void
  clear: () => void
}

const getAddressBook = (): AddressBookData => {
  return safeGet('address-book', {});
}

const saveAddressBook = (data: AddressBookData) => {
  safeSet('address-book', data);
}

export const useAddressBook = create<AddressState>()((set, get) => ({
  addresses: [],
  isLoading: true,
  init: async (userId: string) => {
    set({ isLoading: true });
    
    // First load from localStorage immediately
    const addressBook = getAddressBook();
    const localAddresses = addressBook[userId] || [];
    set({ addresses: localAddresses, isLoading: false });
    
    // Then try to sync with server in background
    try {
      const response = await fetch(`/api/user-data?userId=${encodeURIComponent(userId)}&type=addresses`);
      
      if (response.ok) {
        const serverAddresses = await response.json();
        if (serverAddresses && Array.isArray(serverAddresses) && serverAddresses.length > 0) {
          // Update both state and localStorage with server data
          const updatedAddressBook = getAddressBook();
          updatedAddressBook[userId] = serverAddresses;
          saveAddressBook(updatedAddressBook);
          set({ addresses: serverAddresses });
        }
      }
    } catch (error) {
      console.warn('Could not sync addresses with server:', error);
    }
  },
  save: async (userId, address) => {
    const currentAddresses = get().addresses;
    const newId = address.id || `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const existingIndex = address.id ? currentAddresses.findIndex((a) => a.id === address.id) : -1;

    let updatedAddresses;

    if (existingIndex > -1) {
      // Update existing address
      updatedAddresses = currentAddresses.map((a, index) => 
        index === existingIndex ? { ...a, ...address, id: a.id } : a
      );
    } else {
      // Add new address - make it default if it's the first one
      const newAddress = { ...address, id: newId, default: currentAddresses.length === 0 };
      if (newAddress.default) {
        updatedAddresses = [newAddress];
      } else {
        updatedAddresses = [...currentAddresses, newAddress];
      }
    }

    // Update state immediately
    set({ addresses: updatedAddresses });
    
    // Try to save to server
    try {
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId, 
          type: 'addresses', 
          data: updatedAddresses 
        })
      });
      
      if (!response.ok) {
        console.warn('Server save failed');
      }
    } catch (error) {
      console.warn('Network error saving address:', error);
    }
  },
  remove: async (userId, addressId) => {
    const currentAddresses = get().addresses;
    const addressToRemove = currentAddresses.find(a => a.id === addressId);
    let newAddresses = currentAddresses.filter((a) => a.id !== addressId);
    
    // If the removed address was the default, make the first remaining address the new default
    if (addressToRemove?.default && newAddresses.length > 0) {
      newAddresses[0].default = true;
    }

    // Update state and localStorage immediately
    set({ addresses: newAddresses });
    const addressBook = getAddressBook();
    addressBook[userId] = newAddresses;
    saveAddressBook(addressBook);
    
    // Try to sync with server
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'addresses', data: newAddresses })
      });
    } catch (error) {
      console.warn('Error syncing address removal to server:', error);
    }
  },
  setDefault: async (userId, addressId) => {
    const currentAddresses = get().addresses;
    const newAddresses = currentAddresses.map((a) => ({ ...a, default: a.id === addressId }));
    
    // Update state and localStorage immediately
    set({ addresses: newAddresses });
    const addressBook = getAddressBook();
    addressBook[userId] = newAddresses;
    saveAddressBook(addressBook);
    
    // Try to sync with server
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'addresses', data: newAddresses })
      });
    } catch (error) {
      console.warn('Error syncing default address to server:', error);
    }
  },
  clear: () => {
    set({ addresses: [], isLoading: true });
  }
}))
