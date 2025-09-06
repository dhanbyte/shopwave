import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: Request, context?: { params?: Promise<any> }) {
  try {
    const db = await getDatabase()
    
    // Get all users
    const users = await db.collection('users').find({}).toArray()
    console.log('Total users:', users.length)
    console.log('Sample users:', users.slice(0, 3))
    
    // Get all user data (cart, wishlist, addresses, orders)
    const allUserData = await db.collection('user_data').find({}).toArray()
    console.log('Total user data records:', allUserData.length)
    console.log('Sample user data:', allUserData.slice(0, 3))
    
    const customersData = []
    
    for (const user of users) {
      const userId = user._id.toString()
      const userEmail = user.email || user.emailAddress
      
      // Find user's data - try both string ID and email as userId
      const userData = allUserData.filter(data => 
        data.userId === userId || 
        data.userId === userEmail || 
        data.userId === user.email ||
        data.userId === user.emailAddress
      )
      
      const cart = userData.find(d => d.type === 'cart')?.data || []
      const wishlist = userData.find(d => d.type === 'wishlist')?.data || []
      const addresses = userData.find(d => d.type === 'addresses')?.data || []
      const orders = userData.find(d => d.type === 'orders')?.data || []
      const paymentMethods = userData.find(d => d.type === 'payment_methods')?.data || []
      
      // Get payment gateway usage from orders
      const paymentGateways = orders.reduce((acc, order) => {
        if (order.paymentMethod) {
          acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1
        }
        return acc
      }, {})
      
      customersData.push({
        id: userId,
        email: user.email || user.emailAddress,
        fullName: user.full_name || user.fullName || (user.firstName ? user.firstName + ' ' + (user.lastName || '') : null),
        phone: user.phone || addresses[0]?.phone || null,
        createdAt: user.created_at || user.createdAt,
        cart: {
          count: cart.length,
          items: cart
        },
        wishlist: {
          count: wishlist.length,
          items: wishlist
        },
        addresses: {
          count: addresses.length,
          list: addresses
        },
        orders: {
          count: orders.length,
          list: orders.slice(0, 5), // Show last 5 orders
          totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0)
        },
        paymentMethods: {
          saved: paymentMethods,
          gatewayUsage: paymentGateways
        },
        lastActivity: orders.length > 0 ? new Date(Math.max(...orders.map(o => new Date(o.createdAt || o.orderDate).getTime()))) : user.created_at || user.createdAt
      })
    }
    
    // Sort by creation date, newest first
    customersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return NextResponse.json(customersData)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}