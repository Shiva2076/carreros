export const dynamic = 'force-dynamic'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, User, Shield, Zap, Database, Mail, Calendar } from 'lucide-react'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const user = session.user

  const connections = [
    {
      name: 'Google OAuth',
      status: true, // Connected by virtue of being logged in
      description: 'Used for authentication and syncing services.',
      icon: Shield,
    },
    {
      name: 'Gmail API',
      status: !!process.env.GOOGLE_REFRESH_TOKEN && !!process.env.GMAIL_USER,
      description: 'Allows sending AI-generated cover letters.',
      icon: Mail,
    },
    {
      name: 'Google Calendar',
      status: !!process.env.GOOGLE_REFRESH_TOKEN,
      description: 'Syncs interview events to your calendar.',
      icon: Calendar,
    },
    {
      name: 'Groq AI',
      status: !!process.env.GROQ_API_KEY,
      description: 'Powers cover letter generation and insights.',
      icon: Zap,
    },
    {
      name: 'MongoDB Atlas',
      status: !!process.env.MONGODB_URI,
      description: 'Stores your jobs, clients, and workflows.',
      icon: Database,
    },
    {
      name: 'Redis Queue',
      status: !!process.env.REDIS_URL,
      description: 'Handles background worker tasks.',
      icon: Zap,
    },
  ]

  return (
    <AppShell title="Settings">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Section */}
        <Card className="overflow-hidden border-border shadow-sm">
          <div className="h-24 bg-gradient-to-r from-brand/10 to-brand/5" />
          <CardContent className="relative pt-12 pb-8">
            <div className="absolute -top-12 left-6">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? 'User'}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-brand/10 flex items-center justify-center">
                  <User className="w-12 h-12 text-brand" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" size="sm">
                Edit profile
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100">
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Connections Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">System Connections</h3>
            <Badge variant="outline" className="bg-white">
              6 total services
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((conn) => (
              <Card key={conn.name} className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 border border-border">
                      <conn.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <CardTitle className="text-sm font-medium">{conn.name}</CardTitle>
                  </div>
                  {conn.status ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-50">
                      <XCircle className="w-3 h-3 mr-1" />
                      Missing Config
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs line-clamp-2">
                    {conn.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Documentation / Help Section */}
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-brand/10">
                <Shield className="w-6 h-6 text-brand" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Configuration Guide</h4>
                <p className="text-sm text-gray-500 max-w-md">
                  Need to update your keys or add new integrations? Check the project <code>README.md</code> for a step-by-step guide on setting up Google Cloud, MongoDB, and Groq.
                </p>
              </div>
              <Button variant="link" className="text-brand">
                View documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
