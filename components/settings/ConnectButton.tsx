'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface ConnectButtonProps {
  service: 'gmail' | 'calendar'
  className?: string
}

const SCOPES = {
  gmail: 'https://www.googleapis.com/auth/gmail.send',
  calendar: 'https://www.googleapis.com/auth/calendar',
}

export function ConnectButton({ service, className }: ConnectButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    try {
      // For incremental authorization, we include include_granted_scopes: true
      // and specify the additional scope we need.
      // We also use prompt: 'consent' to ensure Google shows the screen for the new scope.
      await signIn('google', 
        { callbackUrl: '/settings' },
        {
          scope: `openid email profile ${SCOPES[service]}`,
          include_granted_scopes: 'true',
          prompt: 'consent',
          access_type: 'offline',
        }
      )
    } catch (error) {
      console.error(`Failed to connect ${service}:`, error)
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleConnect}
      disabled={loading}
    >
      {loading ? (
        <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
      ) : (
        <PlusIcon className="w-3 h-3 mr-2" />
      )}
      Connect {service.charAt(0).toUpperCase() + service.slice(1)}
    </Button>
  )
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
