import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

// Mock data for development
const generateMockHistory = () => {
  const statuses = ['pending', 'completed', 'failed'] as const;
  const types = ['signup', 'purchase', 'withdrawal'] as const;
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: `ref-${i + 1}`,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    type: types[i % types.length],
    status: statuses[i % statuses.length],
    amount: [500, 1000, 1500, 2000][i % 4],
    description: `Referral ${i + 1} - ${types[i % types.length]} ${statuses[i % statuses.length]}`,
    user: {
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`
    }
  }));
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    const { userId } = getAuth(request as any);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate mock history data
    const allHistory = generateMockHistory();
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedHistory = allHistory.slice(start, end);
    
    return NextResponse.json({
      data: paginatedHistory,
      pagination: {
        total: allHistory.length,
        page,
        limit,
        totalPages: Math.ceil(allHistory.length / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching referral history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral history' },
      { status: 500 }
    );
  }
}
