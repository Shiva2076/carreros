import { Badge } from '@/components/ui/badge'
import { InvoiceStatus } from '@/types'

const config: Record<InvoiceStatus, { label: string; variant: 'success' | 'blue' | 'warning' | 'destructive' | 'secondary' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  sent: { label: 'Sent', variant: 'blue' },
  paid: { label: 'Paid', variant: 'success' },
  overdue: { label: 'Overdue', variant: 'destructive' },
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, variant } = config[status] ?? { label: status, variant: 'secondary' }
  return <Badge variant={variant}>{label}</Badge>
}
