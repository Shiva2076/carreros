import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LoginButton } from './login-button'
import { Rocket } from 'lucide-react'

export default async function HomePage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-border shadow-sm p-10 w-full max-w-md text-center space-y-8">
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[#185FA5] flex items-center justify-center">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">CareerOS</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your job hunt and freelance work, automated.<br />
            AI cover letters, Kanban tracking, client CRM, and n8n automations — all in one place.
          </p>
        </div>

        <LoginButton />

        <p className="text-xs text-gray-400">
          By signing in you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
