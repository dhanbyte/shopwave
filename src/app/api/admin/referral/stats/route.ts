import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return mock data for now
    return NextResponse.json({
      success: true,
      data: {
        totalReferredSales: 0,
        totalCommissionsPaid: 0,
        totalActiveReferrers: 0,
        pendingWithdrawals: 0,
      },
    });

  } catch (error) {
    console.error('Error fetching admin referral stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch referral statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
