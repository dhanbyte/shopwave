'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/ClerkAuthContext'
import { referralService, type ReferralCode, type ReferralReward } from '@/lib/referralService'
import { useToast } from '@/hooks/use-toast'
import { Copy, Gift, Users, IndianRupee, Share2 } from 'lucide-react'

export default function ReferralSystem() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([])
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    activeReferralCodes: 0
  })
  const [referralHistory, setReferralHistory] = useState<ReferralReward[]>([])
  const [loading, setLoading] = useState(true)
  const [createCodeLoading, setCreateCodeLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchReferralData()
    }
  }, [user])

  const fetchReferralData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [codes, stats, history] = await Promise.all([
        referralService.getUserReferralCodes(user.id),
        referralService.getReferralStats(user.id),
        referralService.getReferralHistory(user.id)
      ])

      setReferralCodes(codes)
      setReferralStats(stats)
      setReferralHistory(history)
    } catch (error) {
      console.error('Error fetching referral data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load referral data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReferralCode = async () => {
    if (!user) return

    setCreateCodeLoading(true)
    try {
      const newCode = await referralService.createReferralCode(user.id)
      if (newCode) {
        toast({
          title: 'Success!',
          description: 'Referral code created successfully'
        })
        fetchReferralData() // Refresh data
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create referral code',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error creating referral code:', error)
      toast({
        title: 'Error',
        description: 'Failed to create referral code',
        variant: 'destructive'
      })
    } finally {
      setCreateCodeLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'Referral code copied to clipboard'
    })
  }

  const shareReferralCode = (code: string) => {
    const shareText = `🎉 Hey! Use my referral code "${code}" and get 10% discount on your order! 🛍️\n\nShop now at: ${window.location.origin}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Get 10% Discount!',
        text: shareText,
      })
    } else {
      copyToClipboard(shareText)
    }
  }

  if (!user) {
    return (
      <div className="card p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Referral System</h2>
        <p className="text-gray-600 mb-4">Please login to access referral features</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <Users className="mx-auto h-8 w-8 text-blue-500 mb-2" />
          <div className="text-2xl font-bold">{referralStats.totalReferrals}</div>
          <div className="text-sm text-gray-600">Total Referrals</div>
        </div>
        
        <div className="card p-4 text-center">
          <IndianRupee className="mx-auto h-8 w-8 text-green-500 mb-2" />
          <div className="text-2xl font-bold">₹{referralStats.totalEarnings}</div>
          <div className="text-sm text-gray-600">Total Earnings</div>
        </div>
        
        <div className="card p-4 text-center">
          <Gift className="mx-auto h-8 w-8 text-purple-500 mb-2" />
          <div className="text-2xl font-bold">{referralStats.activeReferralCodes}</div>
          <div className="text-sm text-gray-600">Active Codes</div>
        </div>
      </div>

      {/* Referral Codes */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your Referral Codes</h3>
          <Button 
            onClick={handleCreateReferralCode}
            disabled={createCodeLoading}
            size="sm"
          >
            {createCodeLoading ? 'Creating...' : 'Create New Code'}
          </Button>
        </div>

        {referralCodes.length > 0 ? (
          <div className="space-y-3">
            {referralCodes.map((code) => (
              <div key={code.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-mono text-lg font-semibold">{code.code}</div>
                  <div className="text-sm text-gray-600">
                    {code.discountPercentage}% discount • Used {code.currentUses}/{code.maxUses} times
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(code.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => shareReferralCode(code.code)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Gift className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">You don't have any referral codes yet</p>
            <Button onClick={handleCreateReferralCode} disabled={createCodeLoading}>
              {createCodeLoading ? 'Creating...' : 'Create Your First Code'}
            </Button>
          </div>
        )}
      </div>

      {/* How it Works */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">How Referral System Works</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <div>Create your unique referral code</div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <div>Share it with friends and family</div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <div>They get 10% discount on their order</div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
            <div>You earn rewards for each successful referral</div>
          </div>
        </div>
      </div>

      {/* Referral History */}
      {referralHistory.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Referrals</h3>
          <div className="space-y-3">
            {referralHistory.slice(0, 5).map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">₹{reward.rewardAmount} earned</div>
                  <div className="text-sm text-gray-600">
                    {new Date(reward.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  reward.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {reward.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
