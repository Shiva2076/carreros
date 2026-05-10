import IORedis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
console.log(`[Redis] Connecting to: ${redisUrl.split('@').pop()}`) // Log host only for security

export const workerConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  family: 4,
  tls: redisUrl.includes('upstash.io') ? {} : undefined, // Add TLS if using Upstash
})

workerConnection.on('error', (err) => {
  console.error('[Redis] Connection error:', err)
})

workerConnection.on('connect', () => {
  console.log('[Redis] Connected successfully')
})
