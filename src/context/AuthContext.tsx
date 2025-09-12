'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useWishlist } from '@/lib/wishlistStore'
import { useCart } from '@/lib/cartStore'
import { useAddressBook } from '@/lib/addressStore'
import { useOrders } from '@/lib/ordersStore'
import { useNotificationStore } from '@/lib/notificationStore'
import { referralService } from '@/lib/referralService'

export interface CustomUser {
  id: string
  fullName?: string
  email?: string
  createdAt?: number
  referralCode?: string
}

interface AuthContextType {
  user: CustomUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  updateUserProfile: (profileData: Partial<CustomUser>) => Promise<void>
  logout: () => void
  generateReferralCode: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signUp: async () => {},
  updateUserProfile: async () => {},
  logout: () => {},
  generateReferralCode: async () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  const { init: initWishlist, clear: clearWishlist } = useWishlist();
  const { init: initCart, clear: clearCart } = useCart();
  const { init: initAddresses, clear: clearAddresses } = useAddressBook();
  const { init: initOrders, clear: clearOrders } = useOrders();
  const { init: initNotifications, clear: clearNotifications } = useNotificationStore();

  const initializeStoresForUser = (userId: string) => {
    initWishlist(userId);
    initCart(userId);
    initAddresses(userId);
    initOrders(userId);
    initNotifications(userId);
  };

  const clearAllStores = () => {
    clearWishlist();
    clearCart();
    clearAddresses();
    clearOrders();
    clearNotifications();
  }

  useEffect(() => {
    // Check for existing session
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUser(user);
        initializeStoresForUser(user.id);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }
      
      const userData = result.data.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      initializeStoresForUser(userData.id);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Signup failed');
      }
      
      const userData = result.data.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      initializeStoresForUser(userData.id);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const updateUserProfile = async (profileData: Partial<CustomUser>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const generateReferralCode = async (): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const referralCode = await referralService.createReferralCode(user.id);
      if (referralCode) {
        // Update user profile with referral code
        await updateUserProfile({ referralCode: referralCode.code });
        return referralCode.code;
      }
      return null;
    } catch (error) {
      console.error('Error generating referral code:', error);
      return null;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('user');
      setUser(null);
      clearAllStores();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signUp,
      updateUserProfile, 
      logout,
      generateReferralCode
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);
