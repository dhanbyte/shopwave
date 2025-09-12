
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Customer {
    id: string
    fullName: string
    email: string
    createdAt: Date
    cart: number
    wishlist: number
    addresses: number
    orders: number
    totalSpent: number
    lastActivity?: Date
}

interface CustomerDetails {
    cart: any[]
    wishlist: any[]
    addresses: any[]
    orders: any[]
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null)
    const [detailsLoading, setDetailsLoading] = useState(false)

    useEffect(() => {
        fetchCustomers()
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchCustomers, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchCustomers = async () => {
        try {
            const response = await fetch('/api/admin/customers')
            const data = await response.json()
            setCustomers(data)
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCustomerDetails = async (customerId: string) => {
        setDetailsLoading(true)
        try {
            const [cart, wishlist, addresses, orders] = await Promise.all([
                fetch(`/api/user-data?userId=${customerId}&type=cart`).then(r => r.json()),
                fetch(`/api/user-data?userId=${customerId}&type=wishlist`).then(r => r.json()),
                fetch(`/api/user-data?userId=${customerId}&type=addresses`).then(r => r.json()),
                fetch(`/api/user-data?userId=${customerId}&type=orders`).then(r => r.json())
            ])
            setCustomerDetails({ 
                cart: Array.isArray(cart) ? cart : [], 
                wishlist: Array.isArray(wishlist) ? wishlist : [], 
                addresses: Array.isArray(addresses) ? addresses : [], 
                orders: Array.isArray(orders) ? orders : [] 
            })
        } catch (error) {
            console.error('Error fetching customer details:', error)
        } finally {
            setDetailsLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Customers</h1>

            <div className="card p-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="p-3">Customer Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Cart Items</th>
                                <th className="p-3">Wishlist</th>
                                <th className="p-3">Addresses</th>
                                <th className="p-3">Orders</th>
                                <th className="p-3">Total Spent</th>
                                <th className="p-3">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(customer => (
                                <tr key={customer.id} className="border-b hover:bg-gray-50 cursor-pointer" 
                                    onClick={() => {
                                        setSelectedCustomer(customer)
                                        fetchCustomerDetails(customer.id)
                                    }}>
                                    <td className="p-3 font-medium">
                                        <div className="text-blue-600 hover:underline">
                                            {customer.fullName || (customer.email ? customer.email.split('@')[0] : `User ${customer.id.slice(-4)}`)}
                                        </div>
                                        <div className="text-xs text-gray-500">{customer.email}</div>
                                    </td>
                                    <td className="p-3">{customer.email || 'N/A'}</td>
                                    <td className="p-3 text-center">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                            {typeof customer.cart === 'object' ? customer.cart.count : customer.cart || 0}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                            {typeof customer.wishlist === 'object' ? customer.wishlist.count : customer.wishlist || 0}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                            {typeof customer.addresses === 'object' ? customer.addresses.count : customer.addresses || 0}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                            {typeof customer.orders === 'object' ? customer.orders.count : customer.orders || 0}
                                        </span>
                                    </td>
                                    <td className="p-3 font-medium">₹{(typeof customer.orders === 'object' ? customer.orders.totalSpent : customer.totalSpent || 0).toLocaleString()}</td>
                                    <td className="p-3">{new Date(customer.createdAt).toLocaleDateString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {customers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No customers found yet.
                    </div>
                )}
            </div>

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">
                                {selectedCustomer.fullName || selectedCustomer.email?.split('@')[0] || 'Customer Details'}
                            </h2>
                            <button 
                                onClick={() => setSelectedCustomer(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        {detailsLoading ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner />
                            </div>
                        ) : customerDetails && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cart Items */}
                                <div className="card p-4">
                                    <h3 className="font-semibold mb-3 text-blue-600">Cart Items ({customerDetails.cart.length})</h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {customerDetails.cart.map((item, i) => (
                                            <div key={i} className="text-sm border-b pb-1">
                                                {typeof item === 'object' && item.name ? item.name : 'Unknown Item'} - Qty: {typeof item === 'object' ? (item.qty || item.quantity || 1) : 1} - ₹{typeof item === 'object' && item.price ? item.price : 0}
                                            </div>
                                        ))}
                                        {customerDetails.cart.length === 0 && <p className="text-gray-500 text-sm">No items in cart</p>}
                                    </div>
                                </div>

                                {/* Wishlist */}
                                <div className="card p-4">
                                    <h3 className="font-semibold mb-3 text-red-600">Wishlist ({customerDetails.wishlist.length})</h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {customerDetails.wishlist.map((item, i) => (
                                            <div key={i} className="text-sm border-b pb-1">
                                                {typeof item === 'object' && item.name ? item.name : 'Unknown Item'} - ₹{typeof item === 'object' && item.price ? item.price : 0}
                                            </div>
                                        ))}
                                        {customerDetails.wishlist.length === 0 && <p className="text-gray-500 text-sm">No wishlist items</p>}
                                    </div>
                                </div>

                                {/* Addresses */}
                                <div className="card p-4">
                                    <h3 className="font-semibold mb-3 text-green-600">Addresses ({customerDetails.addresses.length})</h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {customerDetails.addresses.map((addr, i) => (
                                            <div key={i} className="text-sm border-b pb-2">
                                                <div className="font-medium">{typeof addr === 'object' && addr.name ? addr.name : addr.fullName || 'Unknown Name'}</div>
                                                <div>{typeof addr === 'object' ? `${addr.street || addr.line1 || ''}, ${addr.city || ''} - ${addr.pincode || ''}` : 'Address not available'}</div>
                                                <div>{typeof addr === 'object' && addr.phone ? addr.phone : ''}</div>
                                            </div>
                                        ))}
                                        {customerDetails.addresses.length === 0 && <p className="text-gray-500 text-sm">No addresses saved</p>}
                                    </div>
                                </div>

                                {/* Orders */}
                                <div className="card p-4">
                                    <h3 className="font-semibold mb-3 text-purple-600">Orders ({customerDetails.orders.length})</h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {customerDetails.orders.map((order, i) => (
                                            <div key={i} className="text-sm border-b pb-2">
                                                <div className="font-medium">Order #{typeof order === 'object' && order.id ? order.id.slice(-6) : i+1}</div>
                                                <div>₹{typeof order === 'object' && order.total ? order.total : 0} - {typeof order === 'object' && order.status ? order.status : 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">
                                                    {typeof order === 'object' && order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date not available'}
                                                </div>
                                            </div>
                                        ))}
                                        {customerDetails.orders.length === 0 && <p className="text-gray-500 text-sm">No orders placed</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
