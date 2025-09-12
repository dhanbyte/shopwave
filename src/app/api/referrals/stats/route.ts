import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    const db = await getDatabase()
    
    // Get user's referral stats
    const statsDoc = await db.collection('user_data').findOne({ 
      userId, 
      type: 'referral_stats' 
    })
    
    const stats = statsDoc?.data || {
      totalReferrals: 0,
      totalSignups: 0,
      totalEarnings: 0,
      totalCoins: 0,
      usedCoins: 0,
      availableCoins: 0,
      activeReferralCodes: 0,
      referralHistory: [],
      signupHistory: []
    }
    
    // Get active referral codes count
    const referralCodes = await db.collection('user_data').findOne({ 
      userId, 
      type: 'referrals' 
    })
    
    const activeCodes = referralCodes?.data?.filter((code: any) => code.isActive) || []
    stats.activeReferralCodes = activeCodes.length
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting referral stats:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}