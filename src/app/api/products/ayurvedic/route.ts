import { NextResponse } from 'next/server';
import { AYURVEDIC_PRODUCTS } from '@/lib/data/ayurvedic';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: AYURVEDIC_PRODUCTS,
      count: AYURVEDIC_PRODUCTS.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ayurvedic products' },
      { status: 500 }
    );
  }
}