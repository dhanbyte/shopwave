import { getDatabase } from './db'
import { ObjectId } from 'mongodb'

// Product Services
export const getProducts = async (filters?: any) => {
  try {
    const db = await getDatabase()
    const query = filters || {}
    const products = await db.collection('products').find(query).toArray()
    return { data: products, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch products' } }
  }
}

export const getProductById = async (id: string) => {
  try {
    const db = await getDatabase()
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) })
    return { data: product, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Product not found' } }
  }
}

export const createProduct = async (productData: any) => {
  try {
    const db = await getDatabase()
    const product = {
      ...productData,
      created_at: new Date(),
      updated_at: new Date()
    }
    const result = await db.collection('products').insertOne(product)
    return { data: { ...product, _id: result.insertedId }, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to create product' } }
  }
}

// Order Services
export const createOrder = async (orderData: any) => {
  try {
    const db = await getDatabase()
    const order = {
      ...orderData,
      userId: new ObjectId(orderData.userId),
      created_at: new Date(),
      updated_at: new Date()
    }
    const result = await db.collection('orders').insertOne(order)
    return { data: { ...order, _id: result.insertedId }, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to create order' } }
  }
}

export const getUserOrders = async (userId: string) => {
  try {
    const db = await getDatabase()
    const orders = await db.collection('orders')
      .find({ userId: new ObjectId(userId) })
      .sort({ created_at: -1 })
      .toArray()
    return { data: orders, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch orders' } }
  }
}

// Cart Services
export const getCart = async (userId: string) => {
  try {
    const db = await getDatabase()
    const cart = await db.collection('cart').findOne({ userId: new ObjectId(userId) })
    return { data: cart, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch cart' } }
  }
}

export const updateCart = async (userId: string, items: any[]) => {
  try {
    const db = await getDatabase()
    const result = await db.collection('cart').updateOne(
      { userId: new ObjectId(userId) },
      { 
        $set: { 
          items, 
          updated_at: new Date() 
        } 
      },
      { upsert: true }
    )
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to update cart' } }
  }
}