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
    '/api/auth',
]

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
        await jwtVerify(token, JWT_SECRET)
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
