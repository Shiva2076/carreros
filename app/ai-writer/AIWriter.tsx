'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { IJob } from '@/types'
import { Bot, Copy, RefreshCw } from 'lucide-react'

export function AIWriter() {
  const [jobs, setJobs] = useState<IJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [jdText, setJdText] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [tokensUsed, setTokensUsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/jobs').then((r) => r.json()).then((d) => setJobs(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => {
    if (selectedJobId) {
      const job = jobs.find((j) => j._id === selectedJobId)
      if (job?.jdText) setJdText(job.jdText)
      if (job?.coverLetter) setCoverLetter(job.coverLetter)
    }
  }, [selectedJobId, jobs])

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: selectedJobId || undefined, jdText }),
      })
      const data = await res.json()
      if (data.coverLetter) {
        setCoverLetter(data.coverLetter)
        setTokensUsed(data.tokensUsed ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4 text-brand" />
              Cover letter generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Link to a job (optional)</Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tracked job…" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((j) => (
                    <SelectItem key={j._id} value={j._id}>
                      {j.company} — {j.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jd">Job description *</Label>
              <Textarea
                id="jd"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={12}
                placeholder="Paste the full job description here…"
                className="resize-none"
              />
            </div>

            <Button
              className="w-full gap-2"
              onClick={generate}
              disabled={loading || !jdText.trim()}
            >
              {loading ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Generating…</>
              ) : (
                <><Bot className="h-4 w-4" /> Generate cover letter</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Generated cover letter</CardTitle>
              {tokensUsed > 0 && (
                <Badge variant="secondary" className="text-xs">{tokensUsed} tokens</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {coverLetter ? (
              <>
                <div className="rounded-lg bg-gray-50 border border-border p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-64 max-h-[500px] overflow-y-auto">
                  {coverLetter}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={copy} className="gap-2">
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={generate} disabled={loading}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Regenerate
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 gap-3">
                <Bot className="h-10 w-10 opacity-30" />
                <p className="text-sm">Your cover letter will appear here.<br />Paste a job description and click Generate.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
