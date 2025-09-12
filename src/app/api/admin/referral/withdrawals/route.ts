import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getWithdrawalRequests,
  processWithdrawal
} from '../../../../../../src/lib/services/referralAdminService';

// Get all withdrawal requests
export async function GET(request: Request) {
  try {
    // Verify admin access
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status');

    // Get withdrawal requests
    const { data, total, page: currentPage, totalPages } = await getWithdrawalRequests(
      page,
      limit,
      status as any
    );

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page: currentPage,
        totalPages,
        limit,
      },
    });

  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch withdrawal requests',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Process a withdrawal request (approve/reject)
export async function POST(request: Request) {
  try {
    // Verify admin access
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { withdrawalId, action } = await request.json();

    if (!withdrawalId || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request. Withdrawal ID and action (approve/reject) are required.' 
        },
        { status: 400 }
      );
    }

    // Process the withdrawal
    const result = await processWithdrawal(withdrawalId, action, userId);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: { withdrawalId, action },
    });

  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process withdrawal',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
