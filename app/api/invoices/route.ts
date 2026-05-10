import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Invoice from '@/models/Invoice'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const invoices = await Invoice.find({ userId: session.user.id })
    .populate('clientId', 'name company')
    .sort({ createdAt: -1 })
    .lean()
  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()
  const invoice = await Invoice.create({ ...body, userId: session.user.id, status: 'draft' })

  try {
    await fetch(`${process.env.N8N_BASE_URL}/webhook/invoice-created`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-n8n-secret': process.env.N8N_WEBHOOK_SECRET! },
      body: JSON.stringify({ invoiceId: invoice._id.toString(), userId: session.user.id }),
    })
  } catch {
    // n8n webhook is best-effort
  }

  return NextResponse.json(invoice, { status: 201 })
}
