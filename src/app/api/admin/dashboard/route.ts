import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: Request, context?: { params?: Promise<any> }) {
  try {
    const db = await getDatabase()
    
    // Get all user data for orders
    const allUserData = await db.collection('user_data')
      .find({ type: 'orders' })
      .toArray()
    
    let totalOrders = 0
    let totalRevenue = 0
    const uniqueCustomers = new Set()
    
    for (const userData of allUserData) {
      if (userData.data && Array.isArray(userData.data)) {
        totalOrders += userData.data.length
        uniqueCustomers.add(userData.userId)
        
        // Calculate revenue from completed orders
        for (const order of userData.data) {
          if (order.status === 'Delivered') {
            totalRevenue += order.total
          }
        }
      }
    }
    
    return NextResponse.json({
      totalOrders,
      totalCustomers: uniqueCustomers.size,
      totalRevenue
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}