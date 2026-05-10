import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { KanbanBoard } from '@/components/jobs/KanbanBoard'

export default async function JobsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  return (
    <AppShell title="Job tracker">
      <KanbanBoard />
    </AppShell>
  )
}
