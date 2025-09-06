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
    let pendingRevenue = 0
    const uniqueCustomers = new Set()
    const paymentGateways = {}
    const orderStatuses = {}
    
    // Get address data
    const addressData = await db.collection('user_data')
      .find({ type: 'addresses' })
      .toArray()
    
    let totalAddresses = 0
    const cities = {}
    
    for (const userData of addressData) {
      if (userData.data && Array.isArray(userData.data)) {
        totalAddresses += userData.data.length
        userData.data.forEach(addr => {
          if (addr.city) {
            cities[addr.city] = (cities[addr.city] || 0) + 1
          }
        })
      }
    }
    
    for (const userData of allUserData) {
      if (userData.data && Array.isArray(userData.data)) {
        totalOrders += userData.data.length
        uniqueCustomers.add(userData.userId)
        
        for (const order of userData.data) {
          // Revenue calculation
          if (order.status === 'Delivered') {
            totalRevenue += order.total || 0
          } else if (order.status !== 'Cancelled') {
            pendingRevenue += order.total || 0
          }
          
          // Payment gateway tracking
          if (order.paymentMethod) {
            paymentGateways[order.paymentMethod] = (paymentGateways[order.paymentMethod] || 0) + 1
          }
          
          // Order status tracking
          orderStatuses[order.status] = (orderStatuses[order.status] || 0) + 1
        }
      }
    }
    
    return NextResponse.json({
      totalOrders,
      totalCustomers: uniqueCustomers.size,
      totalRevenue,
      pendingRevenue,
      totalAddresses,
      analytics: {
        paymentGateways,
        orderStatuses,
        topCities: Object.entries(cities)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .reduce((obj, [city, count]) => ({ ...obj, [city]: count }), {})
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}