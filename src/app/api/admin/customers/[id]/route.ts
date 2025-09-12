import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const db = await getDatabase()
    

    
    // If 'first' requested, get the first available user
    if (userId === 'first') {
      const firstUser = await db.collection('users').findOne({})
      if (firstUser) {
        const actualUserId = firstUser._id.toString()
        // Redirect to actual user ID
        const userData = await db.collection('user_data')
          .find({ userId: actualUserId })
          .toArray()
        
        const cart = Array.isArray(userData.find(d => d.type === 'cart')?.data) ? userData.find(d => d.type === 'cart').data : []
        const wishlist = Array.isArray(userData.find(d => d.type === 'wishlist')?.data) ? userData.find(d => d.type === 'wishlist').data : []
        const addresses = Array.isArray(userData.find(d => d.type === 'addresses')?.data) ? userData.find(d => d.type === 'addresses').data : []
        const orders = Array.isArray(userData.find(d => d.type === 'orders')?.data) ? userData.find(d => d.type === 'orders').data : []
        const paymentMethods = Array.isArray(userData.find(d => d.type === 'payment_methods')?.data) ? userData.find(d => d.type === 'payment_methods').data : []
        
        const totalSpent = orders.reduce((sum, order) => {
          const orderTotal = parseFloat(order?.total) || 0
          return sum + orderTotal
        }, 0)
        
        const ordersByStatus = orders.reduce((acc, order) => {
          const status = order?.status || 'Unknown'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {})
        
        const paymentGatewayUsage = orders.reduce((acc, order) => {
          if (order?.paymentMethod) {
            acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1
          }
          return acc
        }, {})
        
        return NextResponse.json({
          user: {
            id: actualUserId,
            email: firstUser.email || firstUser.emailAddress,
            fullName: firstUser.full_name || firstUser.fullName || (firstUser.firstName ? firstUser.firstName + ' ' + (firstUser.lastName || '') : null),
            phone: firstUser.phone,
            createdAt: firstUser.created_at || firstUser.createdAt,
            lastLogin: firstUser.last_login || firstUser.lastLogin
          },
          data: {
            cart: {
              count: cart.length || 0,
              items: cart,
              totalValue: cart.reduce((sum, item) => {
                const price = parseFloat(item?.price) || 0
                const quantity = parseInt(item?.quantity) || 0
                return sum + (price * quantity)
              }, 0)
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
      }
    }
    
    // Try to find user by string ID first, then by ObjectId
    let user = await db.collection('users').findOne({ _id: userId })
    if (!user && ObjectId.isValid(userId)) {
      user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
    }
    if (!user) {
      // Get available users to help with testing
      try {
        const users = await db.collection('users').find({}).limit(5).toArray()
        return NextResponse.json({ 
          error: 'User not found',
          availableUsers: users.map(u => ({ id: u._id.toString(), email: u.email || u.emailAddress || 'No email' })),
          totalUsers: await db.collection('users').countDocuments()
        }, { status: 404 })
      } catch (err) {
        return NextResponse.json({ 
          error: 'User not found and unable to fetch user list',
          message: 'Database connection issue'
        }, { status: 404 })
      }
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