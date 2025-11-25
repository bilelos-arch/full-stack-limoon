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

  // Si l'utilisateur est sur une route d'authentification et a un token, permettre l'accès à la page de connexion
  // ⚠️ CORRECTION: Ne pas rediriger automatiquement les utilisateurs authentifiés vers /book-store
  // Ils doivent pouvoir accéder à /login pour se reconnecter ou changer de compte si nécessaire
  if (isAuthRoute && accessToken) {
    console.log('Middleware: Accès autorisé à /login pour utilisateur authentifié');
    // Permettre la continuation normale - pas de redirection
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
     * - uploads (uploaded files - PDFs, images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};