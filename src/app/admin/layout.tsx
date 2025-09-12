'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminNav from '@/components/AdminNav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      // Skip auth check for login page
      if (pathname === '/admin/login') {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      const adminAuth = localStorage.getItem('adminAuth')
      if (adminAuth === 'true') {
        setIsAuthenticated(true)
      } else {
        router.push('/admin/login')
      }
      setIsLoading(false)
    }
    
    checkAuth()
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show login page without nav
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Show admin panel with nav if authenticated
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminNav />
        <main className="flex-grow p-6">
          {children}
        </main>
      </div>
    )
  }

  return null
}