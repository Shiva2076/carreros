import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { addJobToQueue } from '@/lib/queue'
import Job from '@/models/Job'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const job = await Job.findOne({ _id: params.id, userId: session.user.id }).lean()
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(job)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()
  console.log(`[Jobs API] Updating job ${params.id} with body:`, JSON.stringify(body))
  
  const existing = await Job.findOne({ _id: params.id, userId: session.user.id })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const previousStatus = existing.status
  const updated = await Job.findByIdAndUpdate(params.id, body, { new: true }).lean()
  console.log(`[Jobs API] Updated doc:`, JSON.stringify(updated))

  const currentStatus = body.status || existing.status
  const statusChangedToInterview = body.status === 'interview' && previousStatus !== 'interview'
  
  const existingDateISO = existing.interviewDate ? new Date(existing.interviewDate).toISOString() : null
  const dateUpdated = body.interviewDate && body.interviewDate !== existingDateISO

  if (statusChangedToInterview || (dateUpdated && currentStatus === 'interview')) {
    console.log(`[Jobs API] Triggering calendar event... Reason: ${statusChangedToInterview ? 'status change' : 'date update'}`)
    await addJobToQueue('create-calendar-event', { jobId: params.id })
  } else {
    console.log(`[Jobs API] No calendar event triggered. Condition not met. Status: ${currentStatus}`)
  }

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  await Job.findOneAndDelete({ _id: params.id, userId: session.user.id })
  return NextResponse.json({ ok: true })
}
