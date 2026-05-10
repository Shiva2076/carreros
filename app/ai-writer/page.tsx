import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { AIWriter } from './AIWriter'

export default async function AIWriterPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')
  return (
    <AppShell title="AI writer">
      <AIWriter />
    </AppShell>
  )
}
