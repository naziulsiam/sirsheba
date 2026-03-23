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
            userId: string
            role: 'admin' | 'tutor'
            subscription?: 'active' | 'inactive' | 'trial'
        }

        const userRole = payload.role
        const subscription = payload.subscription || 'inactive'

        // Check admin routes
        if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
            if (userRole !== 'admin') {
                // Tutors trying to access admin routes → redirect to tutor dashboard
                return NextResponse.redirect(new URL('/', request.url))
            }
            return NextResponse.next()
        }

        // Check tutor routes - require active subscription
        if (TUTOR_ROUTES.some(route => pathname.startsWith(route))) {
            if (userRole === 'admin') {
                // Admins can access tutor routes too
                return NextResponse.next()
            }

            // Check subscription for tutors
            if (subscription === 'inactive' && !ALLOWED_WHILE_INACTIVE.some(route => pathname.startsWith(route))) {
                // Redirect to subscription page if no active subscription
                return NextResponse.redirect(new URL('/subscription', request.url))
            }

            return NextResponse.next()
        }

        return NextResponse.next()
    } catch {
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
