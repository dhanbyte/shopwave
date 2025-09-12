import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getPromotionalProducts,
  updateProductCommission
} from '../../../../../../src/lib/services/referralAdminService';

// Get all promotional products
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

    // Get promotional products
    const { data, total, page: currentPage, totalPages } = await getPromotionalProducts(page, limit);

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
    console.error('Error fetching promotional products:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch promotional products',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Update product commission settings
export async function PATCH(request: Request) {
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

    const { productId, ...updates } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Update product commission
    const updatedProduct = await updateProductCommission(productId, updates);

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });

  } catch (error) {
    console.error('Error updating product commission:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update product commission',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
