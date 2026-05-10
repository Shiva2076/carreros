'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Rocket, LayoutDashboard, Briefcase, Users, Bot,
  Calendar, Zap, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/jobs', icon: Briefcase, label: 'Job tracker' },
  { href: '/freelance', icon: Users, label: 'Freelance CRM' },
  { href: '/ai-writer', icon: Bot, label: 'AI writer' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/workflows', icon: Zap, label: 'n8n workflows' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-[220px] border-r border-border bg-gray-50 flex flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <Rocket className="h-5 w-5 text-brand" />
        <span className="font-bold text-gray-900 tracking-tight">CareerOS</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-white text-gray-900 font-medium shadow-sm border border-border'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
            pathname === '/settings'
              ? 'bg-white text-gray-900 font-medium shadow-sm border border-border'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
