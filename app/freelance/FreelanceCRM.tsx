'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ClientTable } from '@/components/freelance/ClientTable'
import { AddClientModal } from '@/components/freelance/AddClientModal'
import { N8nActivityFeed } from '@/components/dashboard/N8nActivityFeed'
import { IClient, IWorkflowLog, InvoiceStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Users, IndianRupee, AlertTriangle } from 'lucide-react'

interface FreelanceCRMProps {
  stats: { activeClients: number; invoicedThisMonth: number; overdueAmount: number }
  logs: IWorkflowLog[]
}

interface ClientRow extends IClient {
  latestInvoice?: { status: InvoiceStatus; amount: number } | null
}

export function FreelanceCRM({ stats, logs }: FreelanceCRMProps) {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchClients = useCallback(async () => {
    const res = await fetch('/api/clients')
    const data = await res.json()
    setClients(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  const statCards = [
    { label: 'Active Clients', value: stats.activeClients, icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Invoiced This Month', value: formatCurrency(stats.invoicedThisMonth), icon: IndianRupee, color: 'text-blue-600 bg-blue-50' },
    { label: 'Overdue Amount', value: formatCurrency(stats.overdueAmount), icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`p-2.5 rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Clients</h2>
        <AddClientModal onAdded={fetchClients} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-400">Loading clients…</div>
      ) : (
        <ClientTable clients={clients} onRefresh={fetchClients} />
      )}

      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Automation log</h2>
        <N8nActivityFeed logs={logs} />
      </div>
    </div>
  )
}
