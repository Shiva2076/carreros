import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IWorkflowLog } from '@/types'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WORKFLOW_TYPE_LABELS } from '@/lib/constants'

export function N8nActivityFeed({ logs }: { logs: IWorkflowLog[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-brand" />
          Recent n8n activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No workflow runs yet</p>
        ) : (
          <ul className="space-y-2.5">
            {logs.map((log) => (
              <li key={log._id} className="flex items-center gap-3">
                <span
                  className={cn('h-2 w-2 rounded-full shrink-0', {
                    'bg-green-500': log.status === 'success',
                    'bg-amber-400': log.status === 'running',
                    'bg-red-500': log.status === 'failed',
                  })}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">
                    {WORKFLOW_TYPE_LABELS[log.workflowType] ?? log.workflowType}
                  </p>
                  {log.executionMs > 0 && (
                    <p className="text-xs text-gray-400">{log.executionMs}ms</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
