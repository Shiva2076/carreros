import { Worker } from 'bullmq'
import { connectDB } from '../mongodb'
import { createInterviewEvent } from '../googleCalendar'
import Job from '../../models/Job'
import User from '../../models/User'
import WorkflowLog from '../../models/WorkflowLog'
import { workerConnection } from './connection'

export const calendarWorker = new Worker(
  'careeros',
  async (job) => {
    if (job.name !== 'create-calendar-event') return

    const { jobId } = job.data as { jobId: string }
    console.log(`[Calendar Worker] Processing job ${job.id} for jobId ${jobId}`)
    await connectDB()

    const start = Date.now()
    const jobDoc = await Job.findById(jobId)
    if (!jobDoc) {
      console.warn(`[Calendar Worker] Job ${jobId} not found in database.`)
      return
    }
    console.log(`[Calendar Worker] Found job: ${jobDoc.company} - ${jobDoc.title}`)

    // Fetch user's Google refresh token from DB
    const userDoc = await User.findOne({ googleId: jobDoc.userId })
    if (!userDoc?.googleRefreshToken) {
      console.error(`[Calendar Worker] No Google refresh token for user ${jobDoc.userId}. User must log in again.`)
      return
    }

    const log = await WorkflowLog.create({
      userId: jobDoc.userId,
      workflowType: 'calendar-event',
      status: 'running',
      relatedId: jobId,
    })

    try {
      const interviewDate = jobDoc.interviewDate ? new Date(jobDoc.interviewDate) : new Date()
      if (!jobDoc.interviewDate) {
        interviewDate.setDate(interviewDate.getDate() + 3)
      }
      const startISO = interviewDate.toISOString()
      const endDate = new Date(interviewDate.getTime() + 60 * 60 * 1000)

      await createInterviewEvent({
        refreshToken: userDoc.googleRefreshToken,
        summary: `Interview: ${jobDoc.title} @ ${jobDoc.company}`,
        description: `Job URL: ${jobDoc.jobUrl}\n\nNotes: ${jobDoc.notes}`,
        startDateTime: startISO,
        endDateTime: endDate.toISOString(),
      })
      console.log(`[Calendar Worker] Event created successfully!`)

      await WorkflowLog.findByIdAndUpdate(log._id, {
        status: 'success',
        executionMs: Date.now() - start,
      })
    } catch (err) {
      await WorkflowLog.findByIdAndUpdate(log._id, {
        status: 'failed',
        errorMessage: String(err),
        executionMs: Date.now() - start,
      })
    }
  },
  { connection: workerConnection }
)
