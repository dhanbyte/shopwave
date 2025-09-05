
'use client';

import { usePathname } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toast';

import BackInStockPopup from '@/components/BackInStockPopup';
import { useProductStore } from '@/lib/productStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/context/ClerkAuthContext';

export default function RootContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const { isLoading: productsLoading } = useProductStore();
  const { loading: authLoading } = useAuth();

  if (isAdminRoute) {
    return <>{children}</>;
  }
  
  if (productsLoading || authLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <LoadingSpinner />
        </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <main className="container py-4 pb-24 md:pb-8 flex-grow">
          {children}
        </main>
        <Footer />
      </div>
      <BottomNav />

      <BackInStockPopup />
      <Toaster />
    </>
  );
}
