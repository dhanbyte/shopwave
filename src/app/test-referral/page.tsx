'use client'
import { useState } from 'react'
import { useAuth } from '@/context/ClerkAuthContext'
import { referralService } from '@/lib/referralService'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function TestReferralPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [testCode, setTestCode] = useState('')
  const [result, setResult] = useState<any>(null)

  const testReferralCode = async () => {
    if (!testCode.trim()) {
      toast({ title: "Error", description: "Please enter a referral code", variant: "destructive" })
      return
    }

    try {
      const sampleCartItems = [
        { id: 'test1', name: 'Test Product 1', category: 'Tech', price: 100, qty: 1 },
        { id: 'test2', name: 'Test Product 2', category: 'Home', price: 200, qty: 1 },
      ]

      const result = await referralService.applyReferralCode(testCode.trim(), sampleCartItems)
      setResult(result)
      
      if (result.isValid) {
        toast({ 
          title: "✅ Referral Code Valid!", 
          description: `Discount: ₹${result.discountAmount}` 
        })
      } else {
        toast({ 
          title: "❌ Invalid Code", 
          description: "Referral code not found or expired", 
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error('Test error:', error)
      toast({ title: "Error", description: "Failed to test referral code", variant: "destructive" })
    }
  }

  const createTestCode = async () => {
    if (!user) {
      toast({ title: "Error", description: "Please login first", variant: "destructive" })
      return
    }

    try {
      const newCode = await referralService.createReferralCode(user.id, 5, 100)
      if (newCode) {
        setTestCode(newCode.code)
        toast({ title: "✅ Test Code Created!", description: `Code: ${newCode.code}` })
      }
    } catch (error) {
      console.error('Create error:', error)
      toast({ title: "Error", description: "Failed to create test code", variant: "destructive" })
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Referral System</h1>
      
      <div className="space-y-4">
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">Create Test Referral Code</h2>
          <Button onClick={createTestCode} disabled={!user}>
            {user ? 'Create Test Code' : 'Login Required'}
          </Button>
        </div>

        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">Test Referral Code</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Enter referral code to test"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase())}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <Button onClick={testReferralCode}>Test Code</Button>
          </div>
          
          {result && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="card p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Test Instructions</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Login to your account</li>
            <li>Create a test referral code</li>
            <li>Test the code to verify it works</li>
            <li>Share the referral link: {typeof window !== 'undefined' ? window.location.origin : 'https://shopwave.social'}?ref=YOUR_CODE</li>
          </ol>
        </div>
      </div>
    </div>
  )
}