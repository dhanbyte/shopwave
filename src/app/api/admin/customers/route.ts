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
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at,
        cart: cart.length,
        wishlist: wishlist.length,
        addresses: addresses.length,
        orders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0)
      })
    }
    
    return NextResponse.json(customersData)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}