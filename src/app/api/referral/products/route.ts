import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

// Mock data for development
const mockProducts = [
  {
    id: '1',
    name: 'Premium Course',
    price: 9999,
    commission: 1000,
    image: '/images/products/course.jpg',
    videoUrl: 'https://example.com/video1',
    referralLink: 'https://example.com/ref/product1',
    slug: 'premium-course',
    isActive: true,
    referralEligible: true
  },
  {
    id: '2',
    name: 'E-book Bundle',
    price: 2999,
    commission: 500,
    image: '/images/products/ebook.jpg',
    videoUrl: 'https://example.com/video2',
    referralLink: 'https://example.com/ref/product2',
    slug: 'ebook-bundle',
    isActive: true,
    referralEligible: true
  },
  {
    id: '3',
    name: 'Workshop Access',
    price: 4999,
    commission: 1500,
    image: '/images/products/workshop.jpg',
    videoUrl: 'https://example.com/video3',
    referralLink: 'https://example.com/ref/product3',
    slug: 'workshop-access',
    isActive: true,
    referralEligible: true
  }
];

export async function GET(request: Request) {
  try {
    const { userId } = getAuth(request as any);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return mock data for now
    return NextResponse.json(mockProducts);
    
  } catch (error) {
    console.error('Error fetching referral products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral products' },
      { status: 500 }
    );
  }
}
