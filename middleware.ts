// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define paths we want to protect
  const isAdminUIPath = path.startsWith('/admin') && path !== '/admin/login';
  const isAdminApiPath = path.startsWith('/api/admin') && !path.startsWith('/api/admin/login');
  
  // Skip middleware for non-protected paths
  if (!isAdminUIPath && !isAdminApiPath) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  const isAuthenticated = !!sessionCookie;

  console.log(`[Middleware] Path: ${path}, Auth: ${isAuthenticated ? 'Yes' : 'No'}`);

  // Not authenticated, handle based on path type
  if (!isAuthenticated) {
    // API routes return 401
    if (isAdminApiPath) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized', code: 'not_authenticated' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Admin UI routes redirect to login
    if (isAdminUIPath) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Continue for authenticated requests
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};