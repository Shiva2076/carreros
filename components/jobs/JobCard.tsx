'use client'
import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IJob } from '@/types'
import { daysSince, isOverdue } from '@/lib/utils'
import { Bot, ExternalLink, Clock, Edit2, Calendar as CalendarIcon, Trash2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface JobCardProps {
  job: IJob
  index: number
  onUpdated: () => void
}

export function JobCard({ job, index, onUpdated }: JobCardProps) {
  const [coverLetterOpen, setCoverLetterOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [interviewDate, setInterviewDate] = useState(job.interviewDate ? new Date(job.interviewDate).toISOString().slice(0, 16) : '')
  const [coverLetter, setCoverLetter] = useState(job.coverLetter || '')
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  const overdue = job.followUpDate && isOverdue(job.followUpDate) && job.status === 'applied'

  async function handleUpdate() {
    setUpdating(true)
    try {
      await fetch(`/api/jobs/${job._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewDate: interviewDate || null }),
      })
      setEditOpen(false)
      onUpdated()
    } finally {
      setUpdating(false)
    }
  }

  async function handleGenerateCoverLetter() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job._id }),
      })
      const data = await res.json()
      if (data.coverLetter) {
        setCoverLetter(data.coverLetter)
        onUpdated()
      }
    } finally {
      setLoading(false)
    }
  }
  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this job?')) return
    setUpdating(true)
    try {
      await fetch(`/api/jobs/${job._id}`, { method: 'DELETE' })
      onUpdated()
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <Draggable draggableId={job._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={snapshot.isDragging ? 'rotate-1 opacity-90' : ''}
          >
            <Card className="mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative group">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{job.company}</p>
                    <p className="text-xs text-gray-500 truncate">{job.title}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={handleDelete}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete job"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {job.jobUrl && (
                      <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-brand">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {daysSince(job.appliedDate)}d ago
                  </span>
                  {overdue && <Badge variant="warning">Follow-up due</Badge>}
                  {job.interviewDate && (
                    <Badge variant="outline" className="bg-brand/5 text-brand border-brand/20">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {new Date(job.interviewDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                  )}
                  {job.skillMatch > 0 && (
                    <Badge variant={job.skillMatch >= 70 ? 'success' : 'secondary'}>
                      {job.skillMatch}% match
                    </Badge>
                  )}
                </div>

                  <div className="flex gap-2 w-full mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 h-7 text-xs gap-1 text-brand hover:text-brand hover:bg-brand/10"
                      onClick={() => {
                        setCoverLetterOpen(true)
                        if (!coverLetter) handleGenerateCoverLetter()
                      }}
                    >
                      <Bot className="h-3.5 w-3.5" />
                      {coverLetter ? 'Cover' : 'AI'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 h-7 text-xs gap-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setEditOpen(true)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </Draggable>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Job Details</DialogTitle>
              <DialogDescription>
                Set the interview date to automatically schedule it in your calendar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="interviewDate">Interview Date & Time</Label>
                <div className="relative">
                  <Input
                    id="interviewDate"
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="pl-9"
                  />
                  <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                <p className="text-[10px] text-gray-400">
                  Moving this card to "Interview" will sync this date to Google Calendar.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate} disabled={updating}>
                {updating ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      <Dialog open={coverLetterOpen} onOpenChange={setCoverLetterOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cover letter — {job.company}</DialogTitle>
            <DialogDescription>{job.title}</DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-400">Generating with Groq…</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 border border-border p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                {coverLetter || 'No cover letter yet.'}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleGenerateCoverLetter} disabled={loading}>
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(coverLetter)
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
