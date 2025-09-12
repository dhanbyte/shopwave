import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { referralCode, newUserId } = await request.json()
    
    if (!referralCode || !newUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const db = await getDatabase()
    
    // Find the referral code owner
    const allReferrals = await db.collection('user_data').find({ type: 'referrals' }).toArray()
    
    let referrerId = null
    
    for (const userReferrals of allReferrals) {
      const codes = userReferrals.data || []
      const matchingCode = codes.find((c: any) => c.code === referralCode)
      if (matchingCode) {
        referrerId = userReferrals.userId
        break
      }
    }
    
    if (!referrerId || referrerId === newUserId) {
      return NextResponse.json({ error: 'Invalid referral' }, { status: 400 })
    }
    
    // Track the signup (but don't give coins yet)
    const signupRecord = {
      id: `signup_${Date.now()}`,
      referrerId,
      refereeId: newUserId,
      signupAt: new Date().toISOString(),
      hasPurchased: false
    }
    
    // Get current stats
    const referrerStats = await db.collection('user_data').findOne({ 
      userId: referrerId, 
      type: 'referral_stats' 
    })
    
    const currentStats = referrerStats?.data || {
      totalReferrals: 0,
      totalSignups: 0,
      totalEarnings: 0,
      totalCoins: 0,
      usedCoins: 0,
      availableCoins: 0,
      referralHistory: [],
      signupHistory: []
    }
    
    // Update stats with signup (no coins yet)
    const updatedStats = {
      ...currentStats,
      totalSignups: currentStats.totalSignups + 1,
      signupHistory: [signupRecord, ...(currentStats.signupHistory || [])]
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
    console.error('Error tracking referral signup:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}