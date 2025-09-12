
'use client'
import { useState, useEffect } from 'react'
import { User, Package, Heart, MapPin, LifeBuoy, LogOut, ChevronRight, Edit, Gift } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import AddressManager from '@/components/AddressManager'
import ReferralSystem from '@/components/ReferralSystem'
import { useOrders } from '@/lib/ordersStore'
import { useWishlist } from '@/lib/wishlistStore'
import { useAuth } from '@/context/ClerkAuthContext'
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import LoadingSpinner from '@/components/LoadingSpinner'

const accountSections = {
  DASHBOARD: 'DASHBOARD',
  ADDRESSES: 'ADDRESSES',
  EDIT_PROFILE: 'EDIT_PROFILE',
  REFERRALS: 'REFERRALS',
}

const AuthForm = () => {
    return (
        <div className="mx-auto max-w-sm card p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Login or Sign Up</h1>
            <p className="text-sm text-gray-500 mb-4">Choose an option to continue</p>
            <div className="space-y-4">
                <SignInButton mode="modal">
                    <Button className="w-full">
                        Sign In
                    </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                    <Button variant="outline" className="w-full">
                        Sign Up
                    </Button>
                </SignUpButton>
            </div>
        </div>
    );
};

const EditProfileSection = ({ onBack }: { onBack: () => void }) => {
    const { user, updateUserProfile } = useAuth();
    const [fullName, setFullName] = useState(user?.fullName || '');
    const { toast } = useToast();

    const handleSave = async () => {
        if (!fullName.trim()) {
            toast({ title: "Name Required", description: "Please enter your full name.", variant: "destructive" });
            return;
        }
        await updateUserProfile({ fullName });
        toast({ title: "Profile Updated!", description: "Your name has been updated successfully." });
        onBack();
    };

    return (
        <div className="card p-6">
             <button onClick={onBack} className="text-sm text-brand font-semibold mb-4">&larr; Back to Account</button>
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <div className="space-y-4">
                 <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 text-sm mt-1"
                    />
                </div>
                <Button onClick={handleSave} className="w-full">
                    Save Changes
                </Button>
            </div>
        </div>
    );
};


export default function AccountPage() {
  const { user, loading, logout } = useAuth()
  const [activeSection, setActiveSection] = useState(accountSections.DASHBOARD)
  const { hasNewOrder } = useOrders()
  const { hasNewItem } = useWishlist()
  const { toast } = useToast()
  
  // Listen for welcome message event
  useEffect(() => {
    const handleWelcomeMessage = (event: CustomEvent) => {
      toast({
        title: `🎉 Welcome to ShopWave, ${event.detail.userName}!`,
        description: "Your account has been created successfully. Start shopping now!",
        duration: 5000,
      })
    }
    
    window.addEventListener('showWelcomeMessage', handleWelcomeMessage as EventListener)
    return () => window.removeEventListener('showWelcomeMessage', handleWelcomeMessage as EventListener)
  }, [toast])
  
  if (loading) {
    return <div className="flex justify-center py-10"><LoadingSpinner /></div>
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case accountSections.ADDRESSES:
        return <AddressManager onBack={() => setActiveSection(accountSections.DASHBOARD)} />
      case accountSections.EDIT_PROFILE:
        return <EditProfileSection onBack={() => setActiveSection(accountSections.DASHBOARD)} />
      case accountSections.REFERRALS:
        return (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => setActiveSection(accountSections.DASHBOARD)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Back to dashboard"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
              </button>
              <h2 className="text-xl font-bold">Referral Program</h2>
            </div>
            <ReferralSystem />
          </div>
        )
      case accountSections.DASHBOARD:
      default:
        return (
          <div>
            <div className="card p-4 md:p-6 mb-6">
                <div className="flex items-center gap-4">
                    <UserButton afterSignOutUrl="/" />
                    <div>
                        <h2 className="text-xl font-bold">{user.fullName || 'Welcome!'}</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <DashboardCard icon={Package} title="My Orders" href="/orders" hasNotification={hasNewOrder} />
                <DashboardCard icon={Heart} title="Wishlist" href="/wishlist" hasNotification={hasNewItem} />
                <DashboardCard icon={MapPin} title="My Addresses" onClick={() => setActiveSection(accountSections.ADDRESSES)} />
                <DashboardCard icon={Gift} title="Referrals" onClick={() => setActiveSection(accountSections.REFERRALS)} />
                <DashboardCard icon={Edit} title="Edit Profile" onClick={() => setActiveSection(accountSections.EDIT_PROFILE)} />
            </div>

            <div className="card p-4">
                 <AccountLink title="Logout" icon={LogOut} onClick={logout} />
            </div>
          </div>
        )
    }
  }

  return (
     <motion.div
      key={activeSection}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto max-w-2xl"
    >
      {renderSection()}
    </motion.div>
  )
}

const DashboardCard = ({ icon: Icon, title, href, onClick, hasNotification }: { icon: React.ElementType, title: string, href?: string, onClick?: () => void, hasNotification?: boolean }) => {
  const content = (
      <div className="card p-4 text-center flex flex-col items-center justify-center h-full relative">
          {hasNotification && <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full blinking-dot"></div>}
          <Icon className="w-8 h-8 text-brand" />
          <h3 className="font-semibold">{title}</h3>
      </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  
  return <button onClick={onClick} className="w-full">{content}</button>;
};

const AccountLink = ({ title, icon: Icon, onClick }: { title: string, icon: React.ElementType, onClick?: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gray-600" />
            <span className="font-medium">{title}</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
)
