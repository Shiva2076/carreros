import { Worker } from 'bullmq'
import { connectDB } from '../mongodb'
import { createInterviewEvent } from '../googleCalendar'
import { scoreJobMatch } from '../groq'
import { sendEmail } from '../gmail'
import Job from '../../models/Job'
import User from '../../models/User'
import WorkflowLog from '../../models/WorkflowLog'
import { workerConnection } from './connection'

export const mainWorker = new Worker(
  'careeros',
  async (job) => {
    console.log(`[Worker] Processing job: ${job.name} (ID: ${job.id})`)
    await connectDB()

    const start = Date.now()

    try {
      if (job.name === 'create-calendar-event') {
        const { jobId } = job.data as { jobId: string }
        const jobDoc = await Job.findById(jobId)
        if (!jobDoc) {
          console.warn(`[Worker] Job ${jobId} not found in DB`)
          return
        }

        // Fetch user's Google refresh token from DB
        const userDoc = await User.findOne({ googleId: jobDoc.userId })
        if (!userDoc?.googleRefreshToken) {
          console.error(`[Worker] No Google refresh token found for user ${jobDoc.userId}. User must log in again.`)
          return
        }

        const log = await WorkflowLog.create({
          userId: jobDoc.userId,
          workflowType: 'calendar-event',
          status: 'running',
          relatedId: jobId,
        })

        const interviewDate = jobDoc.interviewDate ? new Date(jobDoc.interviewDate) : new Date()
        if (!jobDoc.interviewDate) {
          interviewDate.setDate(interviewDate.getDate() + 3)
        }

        const startISO = interviewDate.toISOString()
        const endISO = new Date(interviewDate.getTime() + 60 * 60 * 1000).toISOString()

        await createInterviewEvent({
          refreshToken: userDoc.googleRefreshToken,
          summary: `Interview: ${jobDoc.title} @ ${jobDoc.company}`,
          description: `Job URL: ${jobDoc.jobUrl}\n\nNotes: ${jobDoc.notes}`,
          startDateTime: startISO,
          endDateTime: endISO,
        })

        await WorkflowLog.findByIdAndUpdate(log._id, {
          status: 'success',
          executionMs: Date.now() - start,
        })
        console.log(`[Worker] Calendar event created for ${jobDoc.company}`)
      } 
      
      else if (job.name === 'score-job') {
        const { jobId } = job.data as { jobId: string }
        const jobDoc = await Job.findById(jobId)
        if (!jobDoc) return

        const log = await WorkflowLog.create({
          userId: jobDoc.userId,
          workflowType: 'cover-letter',
          status: 'running',
          relatedId: jobId,
        })

        const { score, tokensUsed } = await scoreJobMatch(jobDoc.jdText || jobDoc.title)
        await Job.findByIdAndUpdate(jobId, { skillMatch: score })

        await WorkflowLog.findByIdAndUpdate(log._id, {
          status: 'success',
          groqTokensUsed: tokensUsed,
          executionMs: Date.now() - start,
        })
        console.log(`[Worker] Job scored for ${jobDoc.company}: ${score}%`)
      }

      else if (job.name === 'send-email') {
        const { to, subject, html } = job.data as { to: string, subject: string, html: string }
        await sendEmail({ to, subject, html })
        console.log(`[Worker] Email sent to ${to}`)
      }
    } catch (err) {
      console.error(`[Worker] Error in ${job.name}:`, err)
      // Note: We don't have a log ID for send-email as it doesn't use WorkflowLog yet
      // but for others we should update if we have it
    }
  },
  { connection: workerConnection }
)
