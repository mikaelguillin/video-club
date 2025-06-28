import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const locales = ['en', 'fr'];
const defaultLocale = 'fr';

function getLocale(request: NextRequest) {
    const acceptLang = request.headers.get('accept-language');
    if (!acceptLang) return defaultLocale;
    const preferred = acceptLang.split(',')[0].split('-')[0];
    return locales.includes(preferred) ? preferred : defaultLocale;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip public files, API routes, and admin routes
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/admin') ||
        PUBLIC_FILE.test(pathname)
    ) {
        return;
    }

    // If the path is "/", redirect to the preferred locale
    if (pathname === '/') {
        const locale = getLocale(request);
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    // If the path already includes a locale, continue
    if (locales.some((loc) => pathname.startsWith(`/${loc}`))) {
        return;
    }

    // Otherwise, redirect to default locale
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
}

export const config = {
    matcher: ['/((?!_next|favicon.ico|api|.*\..*).*)'],
}; 