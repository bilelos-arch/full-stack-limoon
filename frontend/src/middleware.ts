import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/admin', '/stories', '/histoires'];
const authRoutes = ['/login', '/register'];
const publicRoutes = ['/', '/book-store'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ⚠️ AMÉLIORATION: Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);

  // Vérifier la présence du cookie accessToken
  const accessToken = request.cookies.get('accessToken')?.value;

  console.log(`Middleware: ${pathname} - Protected: ${isProtectedRoute}, Auth: ${isAuthRoute}, Token: ${!!accessToken}`);

  // Si l'utilisateur est sur une route d'authentification et a un token, rediriger vers book-store
  if (isAuthRoute && accessToken) {
    console.log('Middleware: Redirection vers /book-store pour utilisateur authentifié');
    return NextResponse.redirect(new URL('/book-store', request.url));
  }

  // Si l'utilisateur est sur une route protégée sans token, rediriger vers login
  if (isProtectedRoute && !accessToken) {
    console.log('Middleware: Redirection vers /login pour route protégée sans token');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Pour les autres routes, continuer normalement
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};