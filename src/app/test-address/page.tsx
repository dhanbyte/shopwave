'use client'
import { useState } from 'react'
import { useAuth } from '@/context/ClerkAuthContext'
import { useAddressBook } from '@/lib/addressStore'

export default function TestAddressPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { addresses, save, init } = useAddressBook()

  const testSaveAddress = async () => {
    setLoading(true)
    try {
      const testAddress = {
        id: `test_${Date.now()}`,
        fullName: 'Test User Production',
        phone: '9876543210',
        pincode: '400001',
        line1: 'Test Building Production',
        line2: 'Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        landmark: 'Near Test Mall',
        default: true
      }

      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id || 'test-user-123', 
          type: 'addresses', 
          data: [testAddress] 
        })
      })

      const data = await response.json()
      setResult(`Save Response: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult('Save Error: ' + error.message)
    }
    setLoading(false)
  }

  const testFetchAddress = async () => {
    setLoading(true)
    try {
      const userId = user?.id || 'test-user-123'
      const response = await fetch(`/api/user-data?userId=${encodeURIComponent(userId)}&type=addresses`)
      const data = await response.json()
      setResult(`Fetch Response: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult('Fetch Error: ' + error.message)
    }
    setLoading(false)
  }

  const testAddressStore = async () => {
    setLoading(true)
    try {
      const userId = user?.id || 'test-user-123'
      await init(userId)
      const testAddress = {
        fullName: 'Store Test User',
        phone: '9876543210',
        pincode: '400001',
        line1: 'Store Test Building',
        line2: 'Store Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        landmark: 'Near Store Test Mall',
        default: true
      }
      
      await save(userId, testAddress)
      setResult(`Address Store Test: Saved successfully. Current addresses: ${addresses.length}`)
    } catch (error) {
      setResult('Store Test Error: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Address API Test - Production Ready</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p><strong>User ID:</strong> {user?.id || 'test-user-123'}</p>
        <p><strong>Current Addresses:</strong> {addresses.length}</p>
      </div>
      
      <div className="space-y-4">
        <button 
          onClick={testSaveAddress}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Direct API Save'}
        </button>
        
        <button 
          onClick={testFetchAddress}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded mr-4 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Direct API Fetch'}
        </button>
        
        <button 
          onClick={testAddressStore}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Address Store'}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {result}
          </pre>
        </div>
      )}
    </div>
  )
}