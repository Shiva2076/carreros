export const dynamic = 'force-dynamic'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import Job from '@/models/Job'
import Client from '@/models/Client'
import Invoice from '@/models/Invoice'
import WorkflowLog from '@/models/WorkflowLog'
import { AppShell } from '@/components/layout/AppShell'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { FollowUpList } from '@/components/dashboard/FollowUpList'
import { N8nActivityFeed } from '@/components/dashboard/N8nActivityFeed'
import { GroqInsight } from '@/components/dashboard/GroqInsight'
import { generateWeeklyDigest } from '@/lib/groq'
import { IJob, IWorkflowLog } from '@/types'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  await connectDB()
  const userId = session.user.id
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [jobsApplied, interviews, activeClients, invoicedResult, followUpJobs, logs] =
    await Promise.all([
      Job.countDocuments({ userId, status: 'applied' }),
      Job.countDocuments({ userId, status: 'interview' }),
      Client.countDocuments({ userId, status: 'active' }),
      Invoice.aggregate([
        { $match: { userId, status: { $in: ['sent', 'paid'] }, createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Job.find({
        userId,
        status: 'applied',
        followUpDate: { $lte: now },
      })
        .sort({ followUpDate: 1 })
        .limit(10)
        .lean(),
      WorkflowLog.find({ userId }).sort({ createdAt: -1 }).limit(8).lean(),
    ])

  const stats = {
    jobsApplied,
    interviews,
    activeClients,
    invoicedThisMonth: invoicedResult[0]?.total ?? 0,
  }

  let insight = ''
  try {
    insight = await generateWeeklyDigest({
      jobsApplied,
      interviews,
      activeClients,
      followUpsOverdue: followUpJobs.length,
    }) ?? ''
  } catch {
    insight = 'Unable to generate insight right now. Check your Groq API key.'
  }

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <StatsCards stats={stats} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <FollowUpList jobs={followUpJobs as unknown as IJob[]} />
          </div>
          <div className="lg:col-span-1">
            <N8nActivityFeed logs={logs as unknown as IWorkflowLog[]} />
          </div>
          <div className="lg:col-span-1">
            <GroqInsight insight={insight} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
