import { NextResponse } from 'next/server';
import { TECH_PRODUCTS } from '@/lib/data/tech';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: TECH_PRODUCTS,
      count: TECH_PRODUCTS.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tech products' },
      { status: 500 }
    );
  }
}