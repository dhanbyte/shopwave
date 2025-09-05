'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/ClerkAuthContext'
import { referralService, type ReferralCode } from '@/lib/referralService'
import { Copy, Plus, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from './ui/button'

export default function ReferralManager() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (user) {
      loadReferralCodes()
    }
  }, [user])

  const loadReferralCodes = async () => {
    if (!user) return
    
    try {
      const codes = await referralService.getUserReferralCodes(user.id)
      setReferralCodes(codes)
    } catch (error) {
      console.error('Error loading referral codes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createReferralCode = async () => {
    if (!user) return
    
    setIsCreating(true)
    try {
      const newCode = await referralService.createReferralCode(user.id)
      if (newCode) {
        setReferralCodes(prev => [...prev, newCode])
        toast({ title: "Referral Code Created!", description: `Your new code: ${newCode.code}` })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create referral code", variant: "destructive" })
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: "Copied!", description: `Referral code ${code} copied to clipboard` })
  }

  if (!user) return null

  if (isLoading) {
    return <div className="text-center py-4">Loading referral codes...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Referral Codes</h2>
        <Button onClick={createReferralCode} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? 'Creating...' : 'Create Code'}
        </Button>
      </div>

      {referralCodes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No referral codes yet.</p>
          <p className="text-sm">Create your first referral code to start earning!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {referralCodes.map((code) => (
            <div key={code.id} className="card p-4 flex justify-between items-center">
              <div>
                <div className="font-mono text-lg font-bold text-brand">{code.code}</div>
                <div className="text-sm text-gray-600">
                  {code.discountPercentage}% discount • Used {code.currentUses}/{code.maxUses} times
                </div>
                <div className="text-xs text-gray-500">
                  Created: {new Date(code.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  code.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {code.isActive ? 'Active' : 'Inactive'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(code.code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">How Referrals Work</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Share your referral code with friends</li>
          <li>• They get {referralCodes[0]?.discountPercentage || 10}% discount on their order</li>
          <li>• You earn rewards when they make purchases</li>
          <li>• Track your earnings in the dashboard</li>
        </ul>
      </div>
    </div>
  )
}