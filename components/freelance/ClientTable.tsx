'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { IClient, ClientStatus, InvoiceStatus } from '@/types'
import { formatCurrency, getInitials } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const statusConfig: Record<ClientStatus, { label: string; variant: 'success' | 'blue' | 'warning' | 'secondary' }> = {
  active: { label: 'Active', variant: 'success' },
  'in-review': { label: 'In review', variant: 'blue' },
  completed: { label: 'Completed', variant: 'secondary' },
  paused: { label: 'Paused', variant: 'warning' },
}

interface ClientRow extends IClient {
  latestInvoice?: { status: InvoiceStatus; amount: number } | null
}

interface AddInvoiceModalProps {
  clients: ClientRow[]
  onAdded: () => void
}

function AddInvoiceModal({ clients, onAdded }: AddInvoiceModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ clientId: '', amount: '', description: '', dueDate: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      })
      setOpen(false)
      onAdded()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">New invoice</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Create invoice</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Client</Label>
            <Select value={form.clientId} onValueChange={(v) => setForm((f) => ({ ...f, clientId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c._id} value={c._id}>{c.name} — {c.company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (INR)</Label>
            <Input id="amount" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !form.clientId}>{loading ? 'Creating…' : 'Create invoice'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface ClientTableProps {
  clients: ClientRow[]
  onRefresh: () => void
}

export function ClientTable({ clients, onRefresh }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-sm text-gray-400">No clients yet. Add your first client above.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <AddInvoiceModal clients={clients} onAdded={onRefresh} />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((client) => {
                const sc = statusConfig[client.status]
                return (
                  <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {getInitials(client.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-400">{client.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{client.project || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {client.rate > 0
                        ? `${formatCurrency(client.rate, client.currency)} / ${client.rateType}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={sc.variant}>{sc.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {client.latestInvoice ? (
                        <div className="flex items-center gap-2">
                          <InvoiceStatusBadge status={client.latestInvoice.status} />
                          <span className="text-xs text-gray-400">
                            {formatCurrency(client.latestInvoice.amount, client.currency)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
