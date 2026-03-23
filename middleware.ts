import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'sirsheba-dev-secret-change-in-production-32ch'
)

const PUBLIC_PATHS = [
    '/login',
    '/register',
    '/verify-email',
    '/set-password',
    '/welcome',
    '/forgot-pin',
    '/auth',
    '/api/auth',
]

// Role-based route access
const ADMIN_ROUTES = ['/admin']
const TUTOR_ROUTES = ['/', '/students', '/fees', '/attendance', '/sms', '/exams', '/batches', '/settings']
const ALLOWED_WHILE_INACTIVE = ['/subscription', '/api/subscription']

// Check if user has active subscription (including trial)
function hasActiveSubscription(subscription?: string): boolean {
    return subscription === 'active' || subscription === 'trial'
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow public paths
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next()
    }

    // Allow static files and _next
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/icons') ||
        pathname.startsWith('/sw.js') ||
        pathname.startsWith('/manifest.json') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // Check JWT cookie
    const token = request.cookies.get('sirsheba_session')?.value

    if (!token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
    }

    try {
        const verified = await jwtVerify(token, JWT_SECRET)
        const payload = verified.payload as {
            sub: string
            role: 'admin' | 'tutor'
            subscription?: string
        }

        const userRole = payload.role
        // Default to inactive if subscription is missing or invalid
        const subscription = payload.subscription || 'inactive'

        // If user has active subscription and visits /subscription, redirect to dashboard
        if (pathname === '/subscription' && hasActiveSubscription(subscription)) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // Check admin routes
        if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
            if (userRole !== 'admin') {
                return NextResponse.redirect(new URL('/', request.url))
            }
            return NextResponse.next()
        }

        // Check tutor routes - require active subscription
        if (TUTOR_ROUTES.some(route => pathname.startsWith(route))) {
            if (userRole === 'admin') {
                return NextResponse.next()
            }

            // Check subscription for tutors
            if (!hasActiveSubscription(subscription) && !ALLOWED_WHILE_INACTIVE.some(route => pathname.startsWith(route))) {
                return NextResponse.redirect(new URL('/subscription', request.url))
            }

            return NextResponse.next()
        }

        return NextResponse.next()
    } catch (err) {
        // If JWT verification fails, clear cookie and redirect to login
        console.error('Middleware error:', err)
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('sirsheba_session')
        return response
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
