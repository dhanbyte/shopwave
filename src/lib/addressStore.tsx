
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
    try {
      const response = await fetch(`/api/user-data?userId=${userId}&type=addresses`);
      if (response.ok) {
        const serverAddresses = await response.json();
        console.log('Loaded addresses from server:', serverAddresses);
        if (serverAddresses && Array.isArray(serverAddresses)) {
          set({ addresses: serverAddresses, isLoading: false });
          return;
        }
      } else {
        console.error('Failed to load addresses:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error loading addresses from server:', error);
    }
    
    // Fallback to local storage
    const addressBook = getAddressBook();
    const localAddresses = addressBook[userId] || [];
    console.log('Using local addresses:', localAddresses);
    set({ addresses: localAddresses, isLoading: false });
  },
  save: async (userId, address) => {
    const addressBook = getAddressBook();
    let userAddresses = addressBook[userId] || [];
    
    const existingIndex = address.id ? userAddresses.findIndex((a) => a.id === address.id) : -1;

    let updatedAddresses;

    if (existingIndex > -1) {
      // Update existing address
      updatedAddresses = userAddresses.map((a, index) => 
        index === existingIndex ? { ...a, ...address } : a
      );
    } else {
      // Add new address
      const newAddress = { ...address, id: `addr_${Date.now()}` };
      // When adding a new address, make it the default.
      updatedAddresses = [
        ...userAddresses.map(a => ({ ...a, default: false })),
        { ...newAddress, default: true }
      ];
    }
    
    // Ensure only one default exists if the user is explicitly setting one
    if (address.default) {
        updatedAddresses = updatedAddresses.map(a => ({
            ...a,
            default: a.id === address.id
        }));
    }

    addressBook[userId] = updatedAddresses;
    saveAddressBook(addressBook);
    
    try {
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'addresses', data: updatedAddresses })
      });
      const result = await response.json();
      console.log('Address save response:', result);
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving addresses to server:', error);
      // Revert local changes if server save failed
      const originalAddresses = get().addresses;
      set({ addresses: originalAddresses });
      throw error;
    }
    
    set({ addresses: updatedAddresses });
  },
  remove: async (userId, addressId) => {
    const addressBook = getAddressBook();
    let userAddresses = addressBook[userId] || [];
    let newAddresses = userAddresses.filter((a) => a.id !== addressId);
    
    // If the removed address was the default, make the first remaining address the new default
    const wasDefault = userAddresses.find(a => a.id === addressId)?.default;
    if (wasDefault && newAddresses.length > 0) {
      newAddresses[0].default = true;
    }

    addressBook[userId] = newAddresses;
    saveAddressBook(addressBook);
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'addresses', data: newAddresses })
      });
    } catch (error) {
      console.error('Error saving addresses to server:', error);
    }
    
    set({ addresses: newAddresses });
  },
  setDefault: async (userId, addressId) => {
    const addressBook = getAddressBook();
    let userAddresses = addressBook[userId] || [];
    const newAddresses = userAddresses.map((a) => ({ ...a, default: a.id === addressId }));
    
    addressBook[userId] = newAddresses;
    saveAddressBook(addressBook);
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'addresses', data: newAddresses })
      });
    } catch (error) {
      console.error('Error saving addresses to server:', error);
    }
    
    set({ addresses: newAddresses });
  },
  clear: () => {
    set({ addresses: [], isLoading: true });
  }
}))
