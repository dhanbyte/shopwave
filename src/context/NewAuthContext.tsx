'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, signInWithPhone, verifyOtp, signOut as supabaseSignOut, getUserProfile, createUserProfile, updateUserProfile as supabaseUpdateProfile } from '@/lib/supabase'
import { useWishlist } from '@/lib/wishlistStore'
import { useCart } from '@/lib/cartStore'
import { useAddressBook } from '@/lib/addressStore'
import { useOrders } from '@/lib/ordersStore'
import { useNotificationStore } from '@/lib/notificationStore'
import { referralService } from '@/lib/referralService'

export interface CustomUser {
  id: string
  fullName?: string
  phone?: string
  email?: string
  createdAt?: number
  referralCode?: string
}

interface AuthContextType {
  user: CustomUser | null
  loading: boolean
  isNewUser: boolean
  isOtpSent: boolean
  login: (phone: string) => Promise<void>
  verifyOtpCode: (phone: string, otp: string) => Promise<void>
  completeRegistration: (fullName: string) => Promise<void>
  updateUserProfile: (profileData: Partial<CustomUser>) => Promise<void>
  logout: () => void
  generateReferralCode: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isNewUser: false,
  isOtpSent: false,
  login: async () => {},
  verifyOtpCode: async () => {},
  completeRegistration: async () => {},
  updateUserProfile: async () => {},
  logout: () => {},
  generateReferralCode: async () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [tempPhone, setTempPhone] = useState<string | null>(null);

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
        const { data: profile } = await getUserProfile(session.user.id);
        if (profile) {
          const customUser: CustomUser = {
            id: session.user.id,
            phone: session.user.phone,
            email: session.user.email,
            fullName: profile.fullName,
            createdAt: new Date(profile.created_at).getTime(),
            referralCode: profile.referralCode,
          };
          setUser(customUser);
          initializeStoresForUser(customUser.id);
        }
      } else {
        // User is signed out
        setUser(null);
        clearAllStores();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (phone: string) => {
    setLoading(true);
    try {
      const { error } = await signInWithPhone(phone);
      if (error) {
        console.error('Error sending OTP:', error);
        throw error;
      }
      setIsOtpSent(true);
      setTempPhone(phone);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const verifyOtpCode = async (phone: string, otp: string) => {
    setLoading(true);
    try {
      const { data, error } = await verifyOtp(phone, otp);
      if (error) {
        console.error('Error verifying OTP:', error);
        throw error;
      }

      if (data.user) {
        // Check if user profile exists
        const { data: profile } = await getUserProfile(data.user.id);
        if (!profile) {
          // New user - needs to complete registration
          setIsNewUser(true);
        } else {
          // Existing user
          const customUser: CustomUser = {
            id: data.user.id,
            phone: data.user.phone,
            email: data.user.email,
            fullName: profile.fullName,
            createdAt: new Date(profile.created_at).getTime(),
            referralCode: profile.referralCode,
          };
          setUser(customUser);
          initializeStoresForUser(customUser.id);
          setIsNewUser(false);
        }
      }
      setIsOtpSent(false);
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const completeRegistration = async (fullName: string) => {
    if (!tempPhone) return;
    setLoading(true);
    
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error('No authenticated user found');
      }

      // Create user profile
      const { data: profile, error } = await createUserProfile(authData.user.id, {
        fullName,
        phone: tempPhone,
      });

      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }

      const newUser: CustomUser = {
        id: authData.user.id,
        phone: tempPhone,
        fullName: fullName,
        createdAt: Date.now(),
      };

      setUser(newUser);
      initializeStoresForUser(newUser.id);
      setIsNewUser(false);
      setTempPhone(null);
    } catch (error) {
      console.error('Registration completion error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData: Partial<CustomUser>) => {
    if (!user) return;
    
    try {
      const { error } = await supabaseUpdateProfile(user.id, profileData);
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
      setIsNewUser(false);
      setIsOtpSent(false);
      setTempPhone(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isNewUser, 
      isOtpSent,
      login, 
      verifyOtpCode,
      completeRegistration, 
      updateUserProfile, 
      logout,
      generateReferralCode
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);
