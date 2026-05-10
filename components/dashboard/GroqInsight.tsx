import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot } from 'lucide-react'

export function GroqInsight({ insight }: { insight: string }) {
  return (
    <Card className="border-brand/20 bg-brand/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-brand">
          <Bot className="h-4 w-4" />
          Groq weekly insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insight ? (
          <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
        ) : (
          <p className="text-sm text-gray-400">Generating your weekly insight…</p>
        )}
      </CardContent>
    </Card>
  )
}
