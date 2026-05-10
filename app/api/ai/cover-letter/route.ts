import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { generateCoverLetter } from '@/lib/groq'
import Job from '@/models/Job'
import WorkflowLog from '@/models/WorkflowLog'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { jobId, jdText } = await req.json()

  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

  const job = await Job.findOne({ _id: jobId, userId: session.user.id })
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const start = Date.now()
  const log = await WorkflowLog.create({
    userId: session.user.id,
    workflowType: 'cover-letter',
    status: 'running',
    relatedId: jobId,
  })

  try {
    const text = jdText || job.jdText || job.title
    const { text: coverLetter, tokensUsed } = await generateCoverLetter(text)

    await Job.findByIdAndUpdate(jobId, { coverLetter })
    await WorkflowLog.findByIdAndUpdate(log._id, {
      status: 'success',
      groqTokensUsed: tokensUsed,
      executionMs: Date.now() - start,
    })

    return NextResponse.json({ coverLetter, tokensUsed })
  } catch (err) {
    await WorkflowLog.findByIdAndUpdate(log._id, {
      status: 'failed',
      errorMessage: String(err),
      executionMs: Date.now() - start,
    })
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }
}
