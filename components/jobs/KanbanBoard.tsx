'use client'
import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { KanbanColumn } from './KanbanColumn'
import { AddJobModal } from './AddJobModal'
import { IJob, JobStatus } from '@/types'

const STATUSES: JobStatus[] = ['applied', 'interview', 'offer', 'rejected']

export function KanbanBoard() {
  const [jobs, setJobs] = useState<IJob[]>([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = useCallback(async () => {
    const res = await fetch('/api/jobs')
    const data = await res.json()
    setJobs(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  async function onDragEnd(result: DropResult) {
    const { draggableId, destination } = result
    if (!destination) return

    const newStatus = destination.droppableId as JobStatus
    const job = jobs.find((j) => j._id === draggableId)
    if (!job || job.status === newStatus) return

    setJobs((prev) =>
      prev.map((j) => (j._id === draggableId ? { ...j, status: newStatus } : j))
    )

    await fetch(`/api/jobs/${draggableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-sm text-gray-400">Loading jobs…</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{jobs.length} jobs tracked</p>
        <AddJobModal onAdded={fetchJobs} />
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              jobs={jobs.filter((j) => j.status === status)}
              onUpdated={fetchJobs}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
