import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: Request, context?: { params?: Promise<any> }) {
  try {
    const db = await getDatabase()
    const coupons = await db.collection('coupons').find({}).sort({ createdAt: -1 }).toArray()
    
    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context?: { params?: Promise<any> }) {
  try {
    const couponData = await request.json()
    
    if (!couponData.code || !couponData.type || !couponData.value || !couponData.expiryDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const db = await getDatabase()
    
    // Check if coupon code already exists
    const existingCoupon = await db.collection('coupons').findOne({ code: couponData.code })
    if (existingCoupon) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }
    
    const couponId = `coupon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newCoupon = {
      id: couponId,
      ...couponData,
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await db.collection('coupons').insertOne(newCoupon)
    
    return NextResponse.json({ success: true, data: newCoupon }, { status: 201 })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}