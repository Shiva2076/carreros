import { Worker } from 'bullmq'
import { sendEmail } from '../gmail'
import { workerConnection } from './connection'

export const emailWorker = new Worker(
  'careeros',
  async (job) => {
    console.log(`[Email Worker] Processing job ${job.id} for ${job.name}`)
    if (job.name !== 'send-email') return

    const { to, subject, html } = job.data as {
      to: string
      subject: string
      html: string
    }

    try {
      await sendEmail({ to, subject, html })
      console.log(`[Email Worker] Successfully sent email to ${to}`)
    } catch (err) {
      console.error(`[Email Worker] Failed to send email:`, err)
    }
  },
  { connection: workerConnection }
)
