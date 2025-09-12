'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs'
import { useWishlist } from '@/lib/wishlistStore'
import { useCart } from '@/lib/cartStore'
import { useAddressBook } from '@/lib/addressStore'
import { useOrders } from '@/lib/ordersStore'
import { useNotificationStore } from '@/lib/notificationStore'

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
  updateUserProfile: (profileData: Partial<CustomUser>) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  updateUserProfile: async () => {},
  logout: () => {},
});

export const ClerkAuthProvider = ({ children }: { children: ReactNode }) => {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerkAuth()
  const [user, setUser] = useState<CustomUser | null>(null)
  const [loading, setLoading] = useState(true)

  const { init: initWishlist, clear: clearWishlist } = useWishlist()
  const { init: initCart, clear: clearCart } = useCart()
  const { init: initAddresses, clear: clearAddresses } = useAddressBook()
  const { init: initOrders, clear: clearOrders } = useOrders()
  const { init: initNotifications, clear: clearNotifications } = useNotificationStore()

  const initializeStoresForUser = (userId: string) => {
    initWishlist(userId)
    initCart(userId)
    initAddresses(userId)
    initOrders(userId)
    initNotifications(userId)
  }

  const clearAllStores = () => {
    clearWishlist()
    clearCart()
    clearAddresses()
    clearOrders()
    clearNotifications()
  }

  const saveUserToDatabase = async (userData: CustomUser) => {
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: userData.id,
          email: userData.email,
          full_name: userData.fullName,
          created_at: new Date(userData.createdAt || Date.now()),
          updated_at: new Date()
        })
      })
    } catch (error) {
      console.error('Error saving user to database:', error)
    }
  }

  const trackReferralSignup = async (referralCode: string, newUserId: string) => {
    try {
      await fetch('/api/referrals/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode, newUserId })
      })
    } catch (error) {
      console.error('Error tracking referral signup:', error)
    }
  }

  useEffect(() => {
    try {
      if (isLoaded) {
        if (clerkUser) {
          const customUser: CustomUser = {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            fullName: clerkUser.fullName || '',
            createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).getTime() : Date.now(),
          }
          setUser(customUser)
          // Force re-initialization of stores to sync from database
          setTimeout(() => {
            initializeStoresForUser(customUser.id)
          }, 100)
          saveUserToDatabase(customUser)
          
          // Show welcome message for new users
          if (typeof window !== 'undefined') {
            const isNewUser = !localStorage.getItem(`user_welcomed_${customUser.id}`)
            if (isNewUser) {
              localStorage.setItem(`user_welcomed_${customUser.id}`, 'true')
              setTimeout(() => {
                // This will be handled by the toast in the component
                window.dispatchEvent(new CustomEvent('showWelcomeMessage', { 
                  detail: { userName: customUser.fullName || 'User' } 
                }))
              }, 1000)
            }
          }
          
          // Check for referral code in URL and track signup (client-side only)
          if (typeof window !== 'undefined') {
            try {
              const urlParams = new URLSearchParams(window.location.search)
              const referralCode = urlParams.get('ref')
              if (referralCode) {
                trackReferralSignup(referralCode, customUser.id)
              }
            } catch (urlError) {
              console.warn('Error processing referral code:', urlError)
            }
          }
        } else {
          setUser(null)
          clearAllStores()
        }
        setLoading(false)
      }
    } catch (error) {
      console.error('Auth context error:', error)
      setLoading(false)
    }
  }, [clerkUser, isLoaded])

  const updateUserProfile = async (profileData: Partial<CustomUser>) => {
    if (!user) return
    
    try {
      const updatedUser = { ...user, ...profileData }
      setUser(updatedUser)
      await saveUserToDatabase(updatedUser)
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut()
      setUser(null)
      clearAllStores()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      updateUserProfile, 
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)