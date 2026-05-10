import './env'

import { mainWorker } from './mainWorker'

console.log('CareerOS Master Worker started')
console.log('  ✓ Handling: score-job, create-calendar-event, send-email')

process.on('SIGTERM', async () => {
  await mainWorker.close()
  process.exit(0)
})
