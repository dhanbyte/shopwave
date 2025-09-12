import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const db = await getDatabase()
    const reviews = await db.collection('reviews').find({ productId }).sort({ createdAt: -1 }).toArray()
    
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { productId, userId, userName, rating, title, body } = await request.json()
    
    if (!productId || !userId || !rating || !title || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = await getDatabase()
    
    const review = {
      productId,
      userId,
      userName,
      rating,
      title,
      body,
      createdAt: new Date(),
      approved: true
    }
    
    await db.collection('reviews').insertOne(review)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving review:', error)
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}