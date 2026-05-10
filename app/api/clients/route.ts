import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Client from '@/models/Client'
import Invoice from '@/models/Invoice'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const [clients, latestInvoices] = await Promise.all([
    Client.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean(),
    Invoice.aggregate([
      { $match: { userId: session.user.id } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$clientId', status: { $first: '$status' }, amount: { $first: '$amount' } } },
    ]),
  ])

  const invoiceMap = new Map(latestInvoices.map((i) => [i._id.toString(), i]))

  const enriched = clients.map((c) => ({
    ...c,
    latestInvoice: invoiceMap.get(c._id.toString()) ?? null,
  }))

  return NextResponse.json(enriched)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()
  const client = await Client.create({ ...body, userId: session.user.id })
  return NextResponse.json(client, { status: 201 })
}
