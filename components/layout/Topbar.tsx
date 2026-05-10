'use client'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface TopbarProps {
  title: string
}

export function Topbar({ title }: TopbarProps) {
  const { data: session } = useSession()

  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-6">
      <h1 className="font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        {session?.user && (
          <>
            <span className="text-sm text-gray-500">{session.user.email}</span>
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? 'User'}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">
                {session.user.name?.[0] ?? 'U'}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: '/' })}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
