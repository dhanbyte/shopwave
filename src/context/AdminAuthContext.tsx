
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  adminUser: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: () => {},
});

// Admin credentials (in production, use environment variables or database)
const ADMIN_CREDENTIALS = {
  password: 'Dhanbyte9157',
  email: 'admin@shopwave.com'
};

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if admin is already logged in (from localStorage)
    const adminData = localStorage.getItem('adminUser');
    if (adminData) {
      try {
        const user = JSON.parse(adminData);
        setAdminUser(user);
      } catch (err) {
        localStorage.removeItem('adminUser');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !adminUser && pathname.startsWith('/admin') && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
    if (!loading && adminUser && pathname === '/admin/login') {
      router.push('/admin');
    }
  }, [adminUser, loading, pathname, router]);

  const login = async (username: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      // Check admin credentials - only password required
      if (password === ADMIN_CREDENTIALS.password) {
        const adminUser: AdminUser = {
          id: 'admin-1',
          email: ADMIN_CREDENTIALS.email,
          role: 'admin'
        };
        
        setAdminUser(adminUser);
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        router.push('/admin');
      } else {
        setError('Invalid username or password');
      }
    } catch (err: any) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setAdminUser(null);
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const value = { adminUser, loading, error, login, logout };
  
  if (loading && pathname.startsWith('/admin') && pathname !== '/admin/login') {
     return (
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
     );
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
