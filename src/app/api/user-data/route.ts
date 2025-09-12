import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest, context?: { params?: Promise<any> }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    
    if (!userId || !type) {
      return NextResponse.json([])
    }
    
    // Validate inputs
    if (typeof userId !== 'string' || typeof type !== 'string') {
      return NextResponse.json([])
    }
    
    const db = await getDatabase()
    const userData = await db.collection('user_data').findOne({ 
      userId: userId.trim(), 
      type: type.trim() 
    })
    
    // Always return an array for addresses, empty array if no data
    const result = userData?.data || []
    return NextResponse.json(Array.isArray(result) ? result : [])
  } catch (error) {
    console.error('Error fetching user data:', error)
    // Return empty array instead of error to prevent UI breaks
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest, context?: { params?: Promise<any> }) {
  try {
    const body = await request.json()
    const { userId, type, data } = body
    
    if (!userId || !type || data === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }
    
    // Validate inputs
    if (typeof userId !== 'string' || typeof type !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid input types' }, { status: 400 })
    }
    
    const db = await getDatabase()
    const result = await db.collection('user_data').updateOne(
      { userId: userId.trim(), type: type.trim() },
      { 
        $set: { 
          userId: userId.trim(), 
          type: type.trim(), 
          data, 
          updated_at: new Date() 
        } 
      },
      { upsert: true }
    )
    
    const success = result.modifiedCount > 0 || result.upsertedCount > 0
    
    return NextResponse.json({ 
      success, 
      saved: success,
      message: success ? 'Data saved successfully' : 'No changes made'
    })
  } catch (error) {
    console.error('Error saving user data:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save data',
      message: 'Server error occurred'
    }, { status: 500 })
  }
}