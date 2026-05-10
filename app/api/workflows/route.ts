import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import WorkflowLog from '@/models/WorkflowLog'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const logs = await WorkflowLog.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  return NextResponse.json(logs)
}
