import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const { pathname } = request.nextUrl;

    // If on mobile and visiting desktop pages, redirect to /mobile
    if (isMobile && (pathname === '/' || pathname === '/admin/calendar')) {
        return NextResponse.redirect(new URL('/mobile', request.url));
    }

    // If on desktop and visiting /mobile, redirect back to /admin/calendar
    if (!isMobile && pathname === '/mobile') {
        return NextResponse.redirect(new URL('/admin/calendar', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/admin/calendar', '/mobile'],
};