import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update session and refresh auth token
  const response = await updateSession(request)

  // Get the pathname of the request
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']

  // Check if the current route is public
  const isPublicRoute = pathname === '/' || publicRoutes.some((route) => pathname.startsWith(route))

  // If it's a public route, allow the request
  if (isPublicRoute) {
    return response
  }

  // For protected routes, you could add additional auth checks here
  // For now, we'll let the route handlers deal with auth

  return response
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    // Match all routes except:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
