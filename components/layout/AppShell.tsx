import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface AppShellProps {
  title: string
  children: React.ReactNode
}

export function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[220px] min-w-0">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
