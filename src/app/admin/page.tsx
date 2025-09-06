'use client'

import { useOrders } from '@/lib/ordersStore'
import { useProductStore } from '@/lib/productStore'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { IndianRupee, ShoppingCart, Users, Package } from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'

const StatCard = ({ icon: Icon, title, value, color, href }: {
    icon: React.ElementType
    title: string
    value: string | number
    color: string
    href?: string
}) => {
    const cardContent = (
        <div className="bg-white rounded-lg shadow border p-6 flex items-center gap-4 transition-transform transform hover:scale-105">
            <div className={`rounded-full p-3 ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
                <div className="text-gray-500 text-sm">{title}</div>
                <div className="text-2xl font-bold">{value}</div>
            </div>
        </div>
    )
    
    if (href) {
        return <Link href={href}>{cardContent}</Link>
    }
    return <div>{cardContent}</div>
}

export default function AdminPage() {
    const { products, init } = useProductStore()
    
    useEffect(() => {
        init() // Initialize products from all categories
    }, [init])
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0
    })
    const [isLoading, setIsLoading] = useState(true)
    const { adminUser } = useAdminAuth();

    useEffect(() => {
        fetchDashboardStats()
    }, [])

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch('/api/admin/dashboard')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
        } finally {
            setIsLoading(false)
        }
    }



    if (!adminUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized Access</h1>
                    <p className="text-gray-600 mb-4">Please login as admin to access this page.</p>
                    <Link 
                        href="/admin/login" 
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back, admin! Here's your business overview.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={IndianRupee}
                        title="Total Revenue"
                        value={`₹${stats.totalRevenue.toLocaleString()}`}
                        color="bg-green-500"
                    />
                    <StatCard
                        icon={ShoppingCart}
                        title="Total Orders"
                        value={stats.totalOrders}
                        color="bg-blue-500"
                        href="/admin/orders"
                    />
                    <StatCard
                        icon={Package}
                        title="Total Products"
                        value={`${products.length} (All Categories)`}
                        color="bg-purple-500"
                        href="/admin/products"
                    />
                    <StatCard
                        icon={Users}
                        title="Total Customers"
                        value={stats.totalCustomers}
                        color="bg-orange-500"
                        href="/admin/customers"
                    />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow border p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href="/admin/products"
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <Package className="h-5 w-5 mr-2" />
                            Manage Products
                        </Link>
                        <Link
                            href="/admin/orders"
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            View Orders
                        </Link>
                        <Link
                            href="/admin/customers"
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <Users className="h-5 w-5 mr-2" />
                            Manage Customers
                        </Link>
                        <button
                            onClick={fetchDashboardStats}
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <IndianRupee className="h-5 w-5 mr-2" />
                            Refresh Data
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow border p-6">
                    <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <h3 className="font-semibold text-green-800">Revenue</h3>
                            <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
                            <p className="text-sm text-green-600">From delivered orders</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-semibold text-blue-800">Orders</h3>
                            <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                            <p className="text-sm text-blue-600">Total orders placed</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                            <h3 className="font-semibold text-orange-800">Customers</h3>
                            <p className="text-2xl font-bold text-orange-600">{stats.totalCustomers}</p>
                            <p className="text-sm text-orange-600">Unique customers</p>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">System Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-blue-700"><strong>Admin User:</strong> {adminUser?.email || 'admin@shopwave.com'}</p>
                            <p className="text-blue-700"><strong>Last Login:</strong> {new Date().toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-blue-700"><strong>System Status:</strong> Online</p>
                            <p className="text-blue-700"><strong>Database:</strong> Connected</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
