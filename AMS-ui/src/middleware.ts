import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { routeAccessMap } from './lib/settings';

export function middleware(request: NextRequest) {

    // const { pathname } = request.nextUrl;

    // if (pathname === '/login') {
    //     return NextResponse.next();
    // }

    // const token = request.cookies.get('access_token')?.value;

    // if (!token) {
    //     return NextResponse.redirect(new URL('/login', request.url));
    // }

    // try {
    //     const decoded: any = jwtDecode(token);
    //     const expirationTime = decoded.exp * 1000;

    //     if (Date.now() > expirationTime) {
    //         return NextResponse.redirect(new URL('/login', request.url));
    //     }

    //     const userRole = decoded.role.toLowerCase(); // e.g., 'admin'
    //     for (const [pattern, allowedRoles] of Object.entries(routeAccessMap)) {
    //         const regex = new RegExp(`^${pattern}$`);
    //         if (regex.test(pathname)) {
    //             if (!allowedRoles.includes(userRole)) {
    //                 return NextResponse.redirect(new URL('/', request.url)); // Or home
    //             }
    //             break; // Role is allowed, no need to check further
    //         }
    //     }
    // }
    //  catch (err) {
    //         console.error('Error decoding token:', err);
    //         return NextResponse.redirect(new URL('/login', request.url));
    //     }
    // }

    if (request.nextUrl.pathname === '/login') {
        return NextResponse.next(); // Allow request to pass through without checking token
    }
    // Extract the token from cookies
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
        // If no token exists, redirect to the login page
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        // Decode the token to get its details
        const decoded: any = jwtDecode(token);

        // Check if the token has expired
        const expirationTime = decoded.exp * 1000; // Convert expiration time to milliseconds
        if (Date.now() > expirationTime) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const userRole = decoded.role;

        const url = request.nextUrl;

        // Restrict access based on user role and redirect to the appropriate dashboard
        if (userRole === 'Admin') {
            if (url.pathname.startsWith('/student') || url.pathname.startsWith('/faculty')) {
                return NextResponse.redirect(new URL('/', url)); // Redirect to admin dashboard
            }
        } else if (userRole === 'Student') {
            if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/faculty')) {
                return NextResponse.redirect(new URL('/', url)); // Redirect to student dashboard
            }
        } else if (userRole === 'Faculty') {
            if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/student')) {
                return NextResponse.redirect(new URL('/', url)); // Redirect to faculty dashboard
            }
        }

    } catch (err) {
        console.error('Error decoding token:', err);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If everything is valid, continue to the requested page
    return NextResponse.next();
}

// Apply middleware to all pages
export const config = {
    matcher: ['/((?!_next/|login|change-password).*)'], // This applies the middleware to all routes
};