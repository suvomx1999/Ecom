import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig = {
  pages: {
    signIn: '/auth/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/seller');
      
      console.log('Middleware checking:', nextUrl.pathname, 'isLoggedIn:', isLoggedIn);

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      
      // Redirect logged-in users away from auth pages
      if (isLoggedIn && (nextUrl.pathname.startsWith('/auth/login') || nextUrl.pathname.startsWith('/auth/register'))) {
         const role = (auth.user as any).role;
         console.log('Redirecting logged in user with role:', role);
         
         if (role === 'ADMIN') {
           return Response.redirect(new URL('/admin/dashboard', nextUrl));
         } else if (role === 'SELLER') {
           return Response.redirect(new URL('/seller/dashboard', nextUrl));
         } else {
           return Response.redirect(new URL('/', nextUrl));
         }
      }
      
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
