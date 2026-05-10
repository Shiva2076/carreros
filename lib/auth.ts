import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

console.log('[Auth] Initializing with:', {
  hasClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && account.refresh_token) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token

        // Persist the refresh token to MongoDB so workers can access it
        try {
          await connectDB()
          await User.findOneAndUpdate(
            { googleId: token.sub },
            {
              googleId: token.sub,
              email: token.email ?? '',
              name: (profile as { name?: string })?.name ?? token.name ?? '',
              googleRefreshToken: account.refresh_token,
            },
            { upsert: true, new: true }
          )
          console.log('[Auth] Saved refresh token to DB for user:', token.sub)
        } catch (err) {
          console.error('[Auth] Failed to save refresh token:', err)
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.email!
      return session
    },
  },
})
