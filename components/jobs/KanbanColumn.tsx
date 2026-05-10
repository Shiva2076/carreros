import { Droppable } from '@hello-pangea/dnd'
import { JobCard } from './JobCard'
import { IJob, JobStatus } from '@/types'
import { cn } from '@/lib/utils'

const columnConfig: Record<JobStatus, { label: string; color: string; dot: string }> = {
  applied: { label: 'Applied', color: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  interview: { label: 'Interview', color: 'bg-purple-50 border-purple-200', dot: 'bg-purple-500' },
  offer: { label: 'Offer', color: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
  rejected: { label: 'Rejected', color: 'bg-red-50 border-red-200', dot: 'bg-red-400' },
}

interface KanbanColumnProps {
  status: JobStatus
  jobs: IJob[]
  onUpdated: () => void
}

export function KanbanColumn({ status, jobs, onUpdated }: KanbanColumnProps) {
  const config = columnConfig[status]

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className={cn('flex items-center gap-2 px-3 py-2 rounded-t-lg border border-b-0', config.color)}>
        <span className={cn('h-2 w-2 rounded-full', config.dot)} />
        <span className="text-sm font-semibold text-gray-700">{config.label}</span>
        <span className="ml-auto text-xs text-gray-400 font-normal">{jobs.length}</span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 min-h-48 p-2 border rounded-b-lg transition-colors',
              config.color,
              snapshot.isDraggingOver && 'ring-2 ring-inset ring-brand/30'
            )}
          >
            {jobs.map((job, index) => (
              <JobCard key={job._id} job={job} index={index} onUpdated={onUpdated} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
