import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IJob } from '@/types'
import { daysSince } from '@/lib/utils'
import { Bell } from 'lucide-react'

export function FollowUpList({ jobs }: { jobs: IJob[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-500" />
          Follow-ups due today
        </CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No follow-ups due</p>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li key={job._id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.company}</p>
                </div>
                <Badge variant="warning">{daysSince(job.appliedDate)}d ago</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
