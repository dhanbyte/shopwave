
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Home, ShoppingCart, Package, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Button } from './ui/button';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const { adminUser, logout } = useAdminAuth();

  if (!adminUser) return null; // Don't render nav if not logged in

  return (
    <aside className="flex flex-col w-64 bg-gray-800 text-white">
      <div className="p-6 text-center border-b border-gray-700">
        <Link href="/admin" className="text-xl font-bold flex items-center justify-center gap-2">
          <LayoutDashboard />
          <span>ShopWave</span>
        </Link>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-brand text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700 space-y-2">
         <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
            <Home className="h-5 w-5" />
            <span>Storefront</span>
          </Link>
        <Button onClick={logout} variant="ghost" className="w-full justify-start text-left text-gray-300 hover:bg-red-500/20 hover:text-white">
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
