'use client'
import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface AddJobModalProps {
  onAdded: () => void
}

export function AddJobModal({ onAdded }: AddJobModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', company: '', location: '', jobUrl: '',
    salary: '', jdText: '', source: 'manual', notes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, appliedDate: new Date().toISOString() }),
      })
      setOpen(false)
      setForm({ title: '', company: '', location: '', jobUrl: '', salary: '', jdText: '', source: 'manual', notes: '' })
      onAdded()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add new job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" name="company" value={form.company} onChange={handleChange} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Role *</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={form.location} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. ₹12L" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jobUrl">Job URL</Label>
            <Input id="jobUrl" name="jobUrl" value={form.jobUrl} onChange={handleChange} placeholder="https://" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="source">Source</Label>
            <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="naukri">Naukri</SelectItem>
                <SelectItem value="indeed">Indeed</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jdText">Job description (paste for AI scoring)</Label>
            <Textarea id="jdText" name="jdText" value={form.jdText} onChange={handleChange} rows={4} placeholder="Paste the full job description here…" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Adding…' : 'Add job'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
