import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function checks if the current user is an admin
async function isAdmin(userId: string): Promise<boolean> {
  // In a real application, you would check the user's role in your database
  // For now, we'll allow any authenticated user as admin for development
  return true;
}

export async function adminMiddleware(request: NextRequest) {
  try {
    // Get the user ID from the session
    const { userId } = auth();
    
    // If there's no user ID, redirect to sign-in
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check if the user is an admin
    const userIsAdmin = await isAdmin(userId);
    
    // If not an admin, show 403 Forbidden
    if (!userIsAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // User is authenticated and is an admin, continue with the request
    return NextResponse.next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Apply this middleware to all admin routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};

export default adminMiddleware;
