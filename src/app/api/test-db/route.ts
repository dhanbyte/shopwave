import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET() {
  try {
    const db = await getDatabase()
    const result = await db.collection('test').insertOne({ test: true, timestamp: new Date() })
    return NextResponse.json({ success: true, insertedId: result.insertedId })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      error: error.message, 
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      dbName: process.env.MONGODB_DB_NAME || 'shopwave'
    }, { status: 500 })
  }
}