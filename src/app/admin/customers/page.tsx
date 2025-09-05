
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
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCustomers()
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
                                <tr key={customer.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium">
                                        <div>{customer.fullName || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{customer.id}</div>
                                    </td>
                                    <td className="p-3">{customer.email || 'N/A'}</td>
                                    <td className="p-3 text-center">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                            {customer.cart}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                            {customer.wishlist}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                            {customer.addresses}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                            {customer.orders}
                                        </span>
                                    </td>
                                    <td className="p-3 font-medium">₹{customer.totalSpent.toLocaleString()}</td>
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
        </div>
    )
}
