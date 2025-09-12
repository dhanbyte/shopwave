import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { code, refereeId, orderId, orderAmount } = await request.json()
    
    if (!code || !refereeId || !orderId || !orderAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const db = await getDatabase()
    
    // Find the referral code owner
    const allReferrals = await db.collection('user_data').find({ type: 'referrals' }).toArray()
    
    let referrerId = null
    
    for (const userReferrals of allReferrals) {
      const codes = userReferrals.data || []
      const matchingCode = codes.find((c: any) => c.code === code)
      if (matchingCode) {
        referrerId = userReferrals.userId
        break
      }
    }
    
    if (!referrerId || referrerId === refereeId) {
      return NextResponse.json({ error: 'Invalid referral' }, { status: 400 })
    }
    
    // Create referral reward (₹5 coins)
    const reward = {
      id: `reward_${Date.now()}`,
      referrerId,
      refereeId,
      orderId,
      rewardAmount: 5,
      coins: 5,
      status: 'completed',
      createdAt: new Date().toISOString()
    }
    
    // Get current stats
    const referrerStats = await db.collection('user_data').findOne({ 
      userId: referrerId, 
      type: 'referral_stats' 
    })
    
    const currentStats = referrerStats?.data || {
      totalReferrals: 0,
      totalEarnings: 0,
      totalCoins: 0,
      usedCoins: 0,
      availableCoins: 0,
      referralHistory: []
    }
    
    // Update stats
    const updatedStats = {
      ...currentStats,
      totalReferrals: currentStats.totalReferrals + 1,
      totalEarnings: currentStats.totalEarnings + 5,
      totalCoins: currentStats.totalCoins + 5,
      availableCoins: currentStats.availableCoins + 5,
      referralHistory: [reward, ...currentStats.referralHistory]
    }
    
    // Save updated stats
    await db.collection('user_data').updateOne(
      { userId: referrerId, type: 'referral_stats' },
      { 
        $set: { 
          userId: referrerId, 
          type: 'referral_stats', 
          data: updatedStats,
          updated_at: new Date() 
        } 
      },
      { upsert: true }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording referral:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}