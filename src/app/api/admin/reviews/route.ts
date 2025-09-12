import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET() {
  try {
    const db = await getDatabase()
    const reviews = await db.collection('reviews').find({}).sort({ createdAt: -1 }).toArray()
    
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching admin reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}