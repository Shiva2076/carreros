import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import Client from '@/models/Client'
import Invoice from '@/models/Invoice'
import WorkflowLog from '@/models/WorkflowLog'
import { AppShell } from '@/components/layout/AppShell'
import { FreelanceCRM } from './FreelanceCRM'
import { IWorkflowLog } from '@/types'

export default async function FreelancePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  await connectDB()
  const userId = session.user.id
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [activeClients, invoicedResult, overdueResult, logs] = await Promise.all([
    Client.countDocuments({ userId, status: 'active' }),
    Invoice.aggregate([
      { $match: { userId, status: { $in: ['sent', 'paid'] }, createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Invoice.aggregate([
      { $match: { userId, status: 'overdue' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    WorkflowLog.find({
      userId,
      workflowType: { $in: ['invoice-reminder', 'weekly-digest'] },
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
  ])

  const stats = {
    activeClients,
    invoicedThisMonth: invoicedResult[0]?.total ?? 0,
    overdueAmount: overdueResult[0]?.total ?? 0,
  }

  return (
    <AppShell title="Freelance CRM">
      <FreelanceCRM stats={stats} logs={logs as unknown as IWorkflowLog[]} />
    </AppShell>
  )
}
