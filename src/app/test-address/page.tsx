'use client'
import { useState } from 'react'

export default function TestAddressPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testSaveAddress = async () => {
    setLoading(true)
    try {
      const testAddress = {
        fullName: 'Test User',
        phone: '9876543210',
        pincode: '400001',
        line1: 'Test Building',
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
          userId: 'test-user-123', 
          type: 'addresses', 
          data: [testAddress] 
        })
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult('Error: ' + error.message)
    }
    setLoading(false)
  }

  const testFetchAddress = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user-data?userId=test-user-123&type=addresses')
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult('Error: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Address API Test</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testSaveAddress}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          {loading ? 'Testing...' : 'Test Save Address'}
        </button>
        
        <button 
          onClick={testFetchAddress}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Testing...' : 'Test Fetch Address'}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  )
}