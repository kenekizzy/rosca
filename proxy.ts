import { NextResponse } from 'next/server'
import authConfig from '@/auth.config'
import NextAuth from 'next-auth'

const { auth } = NextAuth(authConfig)

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard')

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl))
  }
})

export const config = {
  matcher: ['/dashboard/:path*'],
}
