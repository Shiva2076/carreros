import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, Calendar, Users, IndianRupee } from 'lucide-react'
import { DashboardStats } from '@/types'
import { formatCurrency } from '@/lib/utils'

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: 'Jobs Applied',
      value: stats.jobsApplied,
      icon: Briefcase,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Interviews',
      value: stats.interviews,
      icon: Calendar,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Active Clients',
      value: stats.activeClients,
      icon: Users,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Invoiced This Month',
      value: formatCurrency(stats.invoicedThisMonth),
      icon: IndianRupee,
      color: 'text-amber-600 bg-amber-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
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
  )
}
