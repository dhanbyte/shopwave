import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

// Mock data for development
const mockStats = {
  totalEarnings: 12500,
  pendingClearance: 3500,
  totalWithdrawn: 9000,
  activeProducts: 5,
  totalSignups: 24,
  totalConversions: 18,
  referralLink: 'https://example.com/ref/12345'
};

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
    return NextResponse.json(mockStats);
    
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral stats' },
      { status: 500 }
    );
  }
}
