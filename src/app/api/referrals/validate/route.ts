import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }
    
    const db = await getDatabase()
    
    // Search for referral code in all users' referral data
    const allReferralData = await db.collection('user_data')
      .find({ type: 'referrals' })
      .toArray()
    
    for (const userData of allReferralData) {
      if (userData.data && Array.isArray(userData.data)) {
        const referralCode = userData.data.find(ref => 
          ref.code === code && 
          ref.isActive && 
          ref.currentUses < ref.maxUses
        )
        
        if (referralCode) {
          return NextResponse.json({ data: referralCode })
        }
      }
    }
    
    return NextResponse.json({ error: 'Invalid or expired referral code' }, { status: 404 })
  } catch (error) {
    console.error('Error validating referral code:', error)
    return NextResponse.json({ error: 'Failed to validate referral code' }, { status: 500 })
  }
}