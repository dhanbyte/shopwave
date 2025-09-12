
'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, Phone, Mail, Calendar } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Customer {
    id: string
    fullName: string
    email: string
    createdAt: Date
    updatedAt: Date
}

export default function CustomerDetailPage() {
    const { id } = useParams()
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCustomer()
    }, [id])

    const fetchCustomer = async () => {
        try {
            const response = await fetch(`/api/users?id=${id}`)
            const data = await response.json()
            setCustomer(data)
        } catch (error) {
            console.error('Error fetching customer:', error)
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

    if (!customer) {
        return (
            <div>
                <h1 className="text-3xl font-bold">Customer Not Found</h1>
                <p className="mt-2 text-gray-600">No customer found with ID: {id}</p>
                 <Link href="/admin/customers" className="mt-4 inline-block text-brand hover:underline">
                    &larr; Back to all customers
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                 <Link href="/admin/customers" className="text-sm text-brand font-semibold mb-2 inline-block">
                    &larr; All Customers
                </Link>
                <h1 className="text-3xl font-bold">{customer.fullName || 'N/A'}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-4">
                    <h2 className="text-lg font-bold mb-3">Customer Information</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <User size={16} className="text-gray-500" /> 
                            <span>{customer.fullName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail size={16} className="text-gray-500" /> 
                            <span>{customer.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-gray-500" /> 
                            <span>Joined: {new Date(customer.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-gray-500" /> 
                            <span>Last Updated: {new Date(customer.updatedAt).toLocaleDateString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <h2 className="text-lg font-bold mb-3">User ID</h2>
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <code className="text-xs text-gray-700 break-all">{customer.id}</code>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">This is the unique identifier for this customer in the system.</p>
                </div>
            </div>
        </div>
    )
}
