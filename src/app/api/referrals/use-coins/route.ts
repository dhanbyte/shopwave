import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId, coinsToUse } = await request.json()
    
    if (!userId || !coinsToUse || coinsToUse <= 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    
    const db = await getDatabase()
    
    // Get current stats
    const statsDoc = await db.collection('user_data').findOne({ 
      userId, 
      type: 'referral_stats' 
    })
    
    const currentStats = statsDoc?.data || {
      totalReferrals: 0,
      totalEarnings: 0,
      totalCoins: 0,
      usedCoins: 0,
      availableCoins: 0,
      referralHistory: []
    }
    
    // Check if user has enough coins
    if (currentStats.availableCoins < coinsToUse) {
      return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 })
    }
    
    // Update stats
    const updatedStats = {
      ...currentStats,
      usedCoins: currentStats.usedCoins + coinsToUse,
      availableCoins: currentStats.availableCoins - coinsToUse
    }
    
    // Save updated stats
    await db.collection('user_data').updateOne(
      { userId, type: 'referral_stats' },
      { 
        $set: { 
          userId, 
          type: 'referral_stats', 
          data: updatedStats,
          updated_at: new Date() 
        } 
      },
      { upsert: true }
    )
    
    return NextResponse.json({ success: true, availableCoins: updatedStats.availableCoins })
  } catch (error) {
    console.error('Error using coins:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}