import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/jobs/:path*', '/freelance/:path*', '/ai-writer/:path*', '/workflows/:path*'],
}
