import { NextResponse } from 'next/server';
import { HOME_PRODUCTS } from '@/lib/data/home';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: HOME_PRODUCTS,
      count: HOME_PRODUCTS.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch home products' },
      { status: 500 }
    );
  }
}