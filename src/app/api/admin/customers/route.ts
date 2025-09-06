import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: Request, context?: { params?: Promise<any> }) {
  try {
    const db = await getDatabase()
    
    // Get all users
    const users = await db.collection('users').find({}).toArray()
    
    // Get all user data (cart, wishlist, addresses, orders)
    const allUserData = await db.collection('user_data').find({}).toArray()
    
    const customersData = []
    
    for (const user of users) {
      const userId = user._id.toString()
      
      // Find user's data
      const userData = allUserData.filter(data => data.userId === userId)
      
      const cart = userData.find(d => d.type === 'cart')?.data || []
      const wishlist = userData.find(d => d.type === 'wishlist')?.data || []
      const addresses = userData.find(d => d.type === 'addresses')?.data || []
      const orders = userData.find(d => d.type === 'orders')?.data || []
      
      customersData.push({
        id: userId,
        email: user.email || user.emailAddress,
        fullName: user.full_name || user.fullName || (user.firstName ? user.firstName + ' ' + (user.lastName || '') : null),
        createdAt: user.created_at || user.createdAt,
        cart: cart.length,
        wishlist: wishlist.length,
        addresses: addresses.length,
        orders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0),
        lastActivity: new Date()
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