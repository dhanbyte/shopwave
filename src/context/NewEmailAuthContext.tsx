'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut } from '@/lib/supabase'
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
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // User is signed in
        const customUser: CustomUser = {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name,
          createdAt: new Date(session.user.created_at).getTime(),
        };
        setUser(customUser);
        initializeStoresForUser(customUser.id);
      } else {
        // User is signed out
        setUser(null);
        clearAllStores();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await signInWithEmail(email, password);
      if (error) {
        console.error('Error signing in:', error);
        throw error;
      }
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
      const { data, error } = await signUpWithEmail(email, password, fullName);
      if (error) {
        console.error('Error signing up:', error);
        throw error;
      }
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
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileData.fullName }
      });

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
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
      await supabaseSignOut();
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
