import { connectDB } from './lib/mongodb'
import Job from './models/Job'
import WorkflowLog from './models/WorkflowLog'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function migrate() {
  await connectDB()
  const email = 'sj.980315@gmail.com'
  
  const jobResult = await Job.updateMany({}, { userId: email })
  console.log(`Updated ${jobResult.modifiedCount} jobs to user ${email}`)
  
  const logResult = await WorkflowLog.updateMany({}, { userId: email })
  console.log(`Updated ${logResult.modifiedCount} logs to user ${email}`)
  
  process.exit(0)
}

migrate()
