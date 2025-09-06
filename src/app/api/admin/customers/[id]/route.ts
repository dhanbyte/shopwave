import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const db = await getDatabase()
    
    // Get user basic info
    const user = await db.collection('users').findOne({ _id: userId })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Get all user data
    const userData = await db.collection('user_data')
      .find({ userId })
      .toArray()
    
    const cart = userData.find(d => d.type === 'cart')?.data || []
    const wishlist = userData.find(d => d.type === 'wishlist')?.data || []
    const addresses = userData.find(d => d.type === 'addresses')?.data || []
    const orders = userData.find(d => d.type === 'orders')?.data || []
    const paymentMethods = userData.find(d => d.type === 'payment_methods')?.data || []
    
    // Calculate analytics
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})
    
    const paymentGatewayUsage = orders.reduce((acc, order) => {
      if (order.paymentMethod) {
        acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1
      }
      return acc
    }, {})
    
    return NextResponse.json({
      user: {
        id: userId,
        email: user.email || user.emailAddress,
        fullName: user.full_name || user.fullName || (user.firstName ? user.firstName + ' ' + (user.lastName || '') : null),
        phone: user.phone,
        createdAt: user.created_at || user.createdAt,
        lastLogin: user.last_login || user.lastLogin
      },
      data: {
        cart: {
          count: cart.length,
          items: cart,
          totalValue: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
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
          list: orders.sort((a, b) => new Date(b.createdAt || b.orderDate).getTime() - new Date(a.createdAt || a.orderDate).getTime()),
          totalSpent,
          byStatus: ordersByStatus
        },
        paymentMethods: {
          saved: paymentMethods,
          gatewayUsage: paymentGatewayUsage
        }
      },
      analytics: {
        totalSpent,
        averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
        orderFrequency: orders.length,
        favoritePaymentMethod: Object.entries(paymentGatewayUsage).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
      }
    })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 })
  }
}