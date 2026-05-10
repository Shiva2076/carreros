import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { addJobToQueue } from '@/lib/queue'
import Job from '@/models/Job'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const query: Record<string, unknown> = { userId: session.user.id }
  if (status) query.status = status

  const jobs = await Job.find(query).sort({ createdAt: -1 }).lean()
  return NextResponse.json(jobs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()

  const job = await Job.create({
    ...body,
    userId: session.user.id,
    appliedDate: body.appliedDate ? new Date(body.appliedDate) : new Date(),
  })

  await addJobToQueue('score-job', { jobId: job._id.toString() })

  if (job.status === 'interview') {
    console.log(`[Jobs API] New job created in interview stage. Triggering calendar event...`)
    await addJobToQueue('create-calendar-event', { jobId: job._id.toString() })
  }

  return NextResponse.json(job, { status: 201 })
}
