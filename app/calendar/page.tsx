import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  return (
    <AppShell title="Calendar">
      <div className="max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
              <Calendar className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Google Calendar</h2>
              <p className="text-sm text-gray-500 mt-1">
                Interview events are automatically created in your Google Calendar when a job moves to the Interview stage.
              </p>
            </div>
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand hover:underline"
            >
              Open Google Calendar →
            </a>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
