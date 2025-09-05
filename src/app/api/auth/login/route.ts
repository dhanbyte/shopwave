import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    
    const db = await getDatabase()
    const user = await db.collection('users').findOne({ email })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    
    const { password: _, ...userData } = user
    return NextResponse.json({ data: { user: userData } })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}