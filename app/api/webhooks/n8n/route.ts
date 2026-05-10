import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import WorkflowLog from '@/models/WorkflowLog'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-n8n-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()
  const body = await req.json()
  const { userId, workflowType, status, relatedId, groqTokensUsed, executionMs, errorMessage } = body

  if (!userId || !workflowType || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  await WorkflowLog.create({
    userId,
    workflowType,
    status,
    relatedId: relatedId ?? '',
    groqTokensUsed: groqTokensUsed ?? 0,
    executionMs: executionMs ?? 0,
    errorMessage: errorMessage ?? '',
  })

  return NextResponse.json({ ok: true })
}
