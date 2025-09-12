import { NextResponse } from 'next/server';
import { getAdminReferralStats } from '@/lib/services/referralAdminService';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Verify admin access
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real app, verify admin status here
    // For now, we'll allow any authenticated user as admin for development

    // Get referral stats
    const stats = await getAdminReferralStats();

    return NextResponse.json({
      success: true,
      data: {
        totalReferredSales: stats.totalReferredSales,
        totalCommissionsPaid: stats.totalCommissionsPaid,
        totalActiveReferrers: stats.totalActiveReferrers,
        pendingWithdrawals: stats.totalWithdrawalsPending,
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
  return true;
}
