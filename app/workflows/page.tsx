import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import WorkflowLog from '@/models/WorkflowLog'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent } from '@/components/ui/card'
import { IWorkflowLog } from '@/types'
import { cn } from '@/lib/utils'
import { WORKFLOW_TYPE_LABELS } from '@/lib/constants'

export default async function WorkflowsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  await connectDB()
  const logs = await WorkflowLog.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  return (
    <AppShell title="n8n workflows">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm text-gray-500">Last 50 workflow executions</p>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tokens</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(logs as unknown as IWorkflowLog[]).map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {WORKFLOW_TYPE_LABELS[log.workflowType] ?? log.workflowType}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('h-2 w-2 rounded-full', {
                          'bg-green-500': log.status === 'success',
                          'bg-amber-400': log.status === 'running',
                          'bg-red-500': log.status === 'failed',
                        })} />
                        <span className="capitalize text-gray-600">{log.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{log.groqTokensUsed || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{log.executionMs ? `${log.executionMs}ms` : '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">No workflow runs yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
