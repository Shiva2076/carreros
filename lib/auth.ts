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
      if (account) {
        token.accessToken = account.access_token
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token
        }
        token.id = account.providerAccountId
        token.sub = account.providerAccountId

        // Persist the refresh token and scopes to MongoDB
        try {
          await connectDB()
          const updateData: any = {
            googleId: account.providerAccountId,
            email: token.email ?? '',
            name: (profile as { name?: string })?.name ?? token.name ?? '',
            grantedScopes: account.scope?.split(' ') ?? [],
          }
          
          if (account.refresh_token) {
            updateData.googleRefreshToken = account.refresh_token
          }

          await User.findOneAndUpdate(
            { googleId: account.providerAccountId },
            updateData,
            { upsert: true, new: true }
          )
          console.log('[Auth] Updated user data in DB for:', account.providerAccountId)
        } catch (err) {
          console.error('[Auth] Failed to update user data:', err)
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.email!
      // Add granted scopes to the session user object
      try {
        await connectDB()
        const user = await User.findOne({ googleId: (token.sub || token.id) as string })
        if (user) {
          session.user.grantedScopes = user.grantedScopes
          console.log('[Auth] Loaded scopes for session:', user.grantedScopes.length)
        } else {
          console.warn('[Auth] No user found in DB for session:', token.sub || token.id)
        }
      } catch (err) {
        console.error('[Auth] Failed to fetch user scopes for session:', err)
      }
      return session
    },
  },
})
