import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const db = await getDatabase()
    await db.collection('health_check').findOne({})
    
    return NextResponse.json({ 
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ 
      status: 'error',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}