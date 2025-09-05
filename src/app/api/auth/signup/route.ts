import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()
    
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Email, password and full name required' }, { status: 400 })
    }
    
    const db = await getDatabase()
    
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }
    
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const newUser = {
      email,
      password: hashedPassword,
      full_name: fullName,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    const result = await db.collection('users').insertOne(newUser)
    const { password: _, ...userData } = newUser
    
    return NextResponse.json({ data: { user: { ...userData, id: result.insertedId } } })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}