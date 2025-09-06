import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest, context?: { params?: Promise<any> }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    
    if (!userId || !type) {
      return NextResponse.json({ 
        success: true,
        message: 'User data API ready. Use ?userId=<id>&type=<type> to fetch data',
        example: '?userId=user123&type=cart'
      })
    }
    
    const db = await getDatabase()
    const userData = await db.collection('user_data').findOne({ userId, type })
    
    return NextResponse.json(userData?.data || null)
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context?: { params?: Promise<any> }) {
  try {
    const { userId, type, data } = await request.json()
    
    if (!userId || !type) {
      return NextResponse.json({ error: 'Missing userId or type' }, { status: 400 })
    }
    
    const db = await getDatabase()
    await db.collection('user_data').updateOne(
      { userId, type },
      { 
        $set: { 
          userId, 
          type, 
          data, 
          updated_at: new Date() 
        } 
      },
      { upsert: true }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving user data:', error)
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}