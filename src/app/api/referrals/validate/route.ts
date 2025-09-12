import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 })
    }
    
    const db = await getDatabase()
    
    // Find referral code in all users' referral data
    const allReferrals = await db.collection('user_data').find({ type: 'referrals' }).toArray()
    
    let foundCode = null
    for (const userReferrals of allReferrals) {
      const codes = userReferrals.data || []
      const matchingCode = codes.find((c: any) => c.code === code && c.isActive)
      if (matchingCode) {
        foundCode = matchingCode
        break
      }
    }
    
    if (!foundCode) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 404 })
    }
    
    return NextResponse.json({ data: foundCode })
  } catch (error) {
    console.error('Error validating referral code:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}