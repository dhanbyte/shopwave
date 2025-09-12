import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    if (!userData.id && !userData._id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
    }
    
    const userId = userData.id || userData._id
    
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: true })
    }
    
    const db = await getDatabase()
    
    // Use upsert to handle Clerk user data
    const { created_at, ...updateData } = userData
    await db.collection('users').updateOne(
      { _id: userId },
      { 
        $set: {
          ...updateData,
          _id: userId,
          updated_at: new Date()
        },
        $setOnInsert: {
          created_at: created_at || new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving user:', error)
    return NextResponse.json({ error: error.message || 'Failed to save user' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    
    if (!process.env.MONGODB_URI) {
      console.warn('MongoDB not configured, returning empty array')
      return NextResponse.json([])
    }
    
    const db = await getDatabase()
    
    if (userId) {
      const user = await db.collection('users').findOne({ _id: userId })
      return NextResponse.json(user)
    } else {
      // Get all users for admin
      const users = await db.collection('users').find({}).toArray()
      return NextResponse.json(users)
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }
}