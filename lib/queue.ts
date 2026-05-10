import { Queue } from 'bullmq'
import IORedis from 'ioredis'

let connection: IORedis | null = null
let queue: Queue | null = null

function getQueue(): Queue {
  if (!connection) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      family: 4,
      tls: redisUrl.includes('upstash.io') ? {} : undefined,
    })
  }
  if (!queue) {
    queue = new Queue('careeros', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    })
  }
  return queue
}

export async function addJobToQueue(type: string, data: Record<string, unknown>) {
  try {
    const q = getQueue()
    console.log(`[Queue] ATTENTION: Adding job "${type}" to queue "${q.name}" with data:`, JSON.stringify(data))
    const job = await q.add(type, data)
    console.log(`[Queue] SUCCESS: Job "${type}" added with ID: ${job.id}`)
  } catch (err) {
    console.error('[Queue] CRITICAL ERROR:', err)
  }
}
