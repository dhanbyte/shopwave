import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET() {
  try {
    const db = await getDatabase()
    
    // Get all orders from all users
    const allUserData = await db.collection('user_data')
      .find({ type: 'orders' })
      .toArray()
    
    const allOrders = []
    for (const userData of allUserData) {
      if (userData.data && Array.isArray(userData.data)) {
        allOrders.push(...userData.data)
      }
    }
    
    // Sort by creation date (newest first)
    allOrders.sort((a, b) => b.createdAt - a.createdAt)
    
    return NextResponse.json(allOrders)
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{}> }) {
  try {
    const { orderId, status } = await request.json()
    
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 })
    }
    
    const db = await getDatabase()
    
    // Find and update the order in user_data collection
    const allUserData = await db.collection('user_data')
      .find({ type: 'orders' })
      .toArray()
    
    for (const userData of allUserData) {
      if (userData.data && Array.isArray(userData.data)) {
        const orderIndex = userData.data.findIndex(order => order.id === orderId)
        if (orderIndex !== -1) {
          userData.data[orderIndex].status = status
          
          await db.collection('user_data').updateOne(
            { _id: userData._id },
            { $set: { data: userData.data, updated_at: new Date() } }
          )
          
          return NextResponse.json({ success: true })
        }
      }
    }
    
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}