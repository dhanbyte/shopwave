'use client'
import { useState } from 'react'

function ApiEndpointCard({ endpoint, results, testSingleApi }: any) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{endpoint.name}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => testSingleApi(endpoint)}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
          >
            Test
          </button>
          <span className="text-sm text-gray-500">{endpoint.url}</span>
        </div>
      </div>
      
      {results[endpoint.name] && (
        <div className="mt-2">
          {results[endpoint.name].loading ? (
            <div className="text-blue-500">Testing...</div>
          ) : (
            <div>
              <div className={`inline-block px-2 py-1 rounded text-sm ${
                results[endpoint.name].ok 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                Status: {results[endpoint.name].status} {results[endpoint.name].ok ? '✅' : '❌'}
              </div>
              
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-blue-600">View Response</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(results[endpoint.name], null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ApiTestPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const apiEndpoints = [
    { name: 'All Products', url: '/api/products' },
    { name: 'Tech Products', url: '/api/products/tech' },
    { name: 'Home Products', url: '/api/products/home' },
    { name: 'Ayurvedic Products', url: '/api/products/ayurvedic' },
    { name: 'User Data', url: '/api/user-data' },
    { name: 'Test DB', url: '/api/test-db' },
    { name: 'ImageKit Auth', url: '/api/imagekit/auth' },
    { name: 'Admin Dashboard', url: '/api/admin/dashboard' },
    { name: 'Admin Orders', url: '/api/admin/orders' },
    { name: 'Admin Customers', url: '/api/admin/customers' },
    { name: 'Admin Customer Detail (First User)', url: '/api/admin/customers/first' },
    { name: 'Admin Coupons', url: '/api/admin/coupons' },
  ]

  const testApi = async (endpoint: { name: string; url: string }) => {
    try {
      const response = await fetch(endpoint.url)
      const data = await response.json()
      return {
        status: response.status,
        ok: response.ok,
        data: data
      }
    } catch (error) {
      return {
        status: 'ERROR',
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const testAllApis = async () => {
    setLoading(true)
    const newResults: any = {}
    
    for (const endpoint of apiEndpoints) {
      console.log(`Testing ${endpoint.name}...`)
      newResults[endpoint.name] = await testApi(endpoint)
    }
    
    setResults(newResults)
    setLoading(false)
  }

  const testSingleApi = async (endpoint: { name: string; url: string }) => {
    setResults(prev => ({ ...prev, [endpoint.name]: { loading: true } }))
    const result = await testApi(endpoint)
    setResults(prev => ({ ...prev, [endpoint.name]: result }))
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API Test Dashboard</h1>
      
      <div className="mb-6">
        <button 
          onClick={testAllApis}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing All APIs...' : 'Test All APIs'}
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3 text-blue-600">Product APIs</h2>
          <div className="grid gap-3">
            {apiEndpoints.filter(e => e.name.includes('Products')).map((endpoint) => (
              <ApiEndpointCard key={endpoint.name} endpoint={endpoint} results={results} testSingleApi={testSingleApi} />
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-600">Admin APIs</h2>
          <div className="grid gap-3">
            {apiEndpoints.filter(e => e.name.includes('Admin')).map((endpoint) => (
              <ApiEndpointCard key={endpoint.name} endpoint={endpoint} results={results} testSingleApi={testSingleApi} />
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3 text-purple-600">System APIs</h2>
          <div className="grid gap-3">
            {apiEndpoints.filter(e => !e.name.includes('Products') && !e.name.includes('Admin')).map((endpoint) => (
              <ApiEndpointCard key={endpoint.name} endpoint={endpoint} results={results} testSingleApi={testSingleApi} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Environment Info</h3>
        <div className="text-sm space-y-1">
          <div>App URL: {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</div>
          <div>Environment: {process.env.NODE_ENV}</div>
          <div>Current URL: {typeof window !== 'undefined' ? window.location.origin : 'Server'}</div>
        </div>
      </div>
    </div>
  )
}