import { Worker } from 'bullmq'
import { connectDB } from '../mongodb'
import { scoreJobMatch } from '../groq'
import Job from '../../models/Job'
import WorkflowLog from '../../models/WorkflowLog'
import { workerConnection } from './connection'

export const coverLetterWorker = new Worker(
  'careeros',
  async (job) => {
    if (job.name !== 'score-job') return

    const { jobId } = job.data as { jobId: string }
    await connectDB()

    const start = Date.now()
    const jobDoc = await Job.findById(jobId)
    if (!jobDoc) return

    const log = await WorkflowLog.create({
      userId: jobDoc.userId,
      workflowType: 'cover-letter',
      status: 'running',
      relatedId: jobId,
    })

    try {
      const { score, tokensUsed } = await scoreJobMatch(jobDoc.jdText || jobDoc.title)
      await Job.findByIdAndUpdate(jobId, { skillMatch: score })

      await WorkflowLog.findByIdAndUpdate(log._id, {
        status: 'success',
        groqTokensUsed: tokensUsed,
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
