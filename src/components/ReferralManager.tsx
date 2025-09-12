'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/ClerkAuthContext'
import { referralService, type ReferralCode, type ReferralStats } from '@/lib/referralService'
import { Copy, Plus, Share2, Coins } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from './ui/button'

export default function ReferralManager() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([])
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (user) {
      loadReferralCodes()
      loadStats()
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

  const loadStats = async () => {
    if (!user) return
    
    try {
      const userStats = await referralService.getReferralStats(user.id)
      setStats(userStats)
    } catch (error) {
      console.error('Error loading referral stats:', error)
    }
  }

  const createReferralCode = async () => {
    if (!user) return
    
    setIsCreating(true)
    try {
      const newCode = await referralService.createReferralCode(user.id, 5) // 5% discount
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    const isLink = text.includes('http')
    toast({ 
      title: "Copied!", 
      description: isLink ? "Referral link copied to clipboard" : `Referral code ${text} copied to clipboard` 
    })
  }

  const shareReferralLink = (code: string) => {
    const shareLink = referralService.getShareLink(code)
    if (navigator.share) {
      navigator.share({
        title: 'Get 5% discount on ShopWave!',
        text: `Use my referral code ${code} and get 5% discount on all products!`,
        url: shareLink
      })
    } else {
      navigator.clipboard.writeText(shareLink)
      toast({ title: "Link Copied!", description: "Referral link copied to clipboard" })
    }
  }

  if (!user) return null

  if (isLoading) {
    return <div className="text-center py-4">Loading referral codes...</div>
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalSignups || 0}</div>
            <div className="text-xs text-gray-600">Total Signups</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-2xl font-bold text-brand">{stats.totalReferrals}</div>
            <div className="text-xs text-gray-600">Paid Referrals</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
              <Coins className="h-5 w-5" />
              {stats.availableCoins}
            </div>
            <div className="text-xs text-gray-600">Available Coins</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.activeReferralCodes}</div>
            <div className="text-xs text-gray-600">Active Codes</div>
          </div>
        </div>
      )}

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
                  5% discount • Used {code.currentUses}/{code.maxUses} times
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
                  onClick={() => shareReferralLink(code.code)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(referralService.getShareLink(code.code))}
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
          <li>• Share your referral link with friends</li>
          <li>• They get ₹5 discount on eligible products</li>
          <li>• You get 5 coins only when they make their first purchase</li>
          <li>• Signups are tracked but coins given only on purchase</li>
          <li>• 1 coin = ₹1 discount on your orders</li>
        </ul>
      </div>

      {/* Referral History */}
      {stats && stats.referralHistory.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Recent Referrals</h3>
          <div className="space-y-2">
            {stats.referralHistory.slice(0, 5).map((reward) => (
              <div key={reward.id} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">Order #{reward.orderId}</span>
                  <span className="text-gray-500 ml-2">
                    {new Date(reward.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-green-600 font-medium">
                  <Coins className="h-4 w-4" />
                  +{reward.coins}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}