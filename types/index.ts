export type JobStatus = 'applied' | 'interview' | 'offer' | 'rejected'
export type ClientStatus = 'active' | 'in-review' | 'completed' | 'paused'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'
export type RateType = 'hourly' | 'fixed' | 'monthly'
export type WorkflowType = 'cover-letter' | 'invoice-reminder' | 'weekly-digest' | 'job-intake' | 'calendar-event'
export type WorkflowStatus = 'running' | 'success' | 'failed'

export interface InterviewRound {
  round: number
  date: Date
  notes: string
}

export interface IJob {
  _id: string
  userId: string
  title: string
  company: string
  location: string
  jobUrl: string
  status: JobStatus
  appliedDate: Date
  followUpDate: Date
  salary: string
  jdText: string
  coverLetter: string
  skillMatch: number
  source: string
  notes: string
  interviewDate?: Date
  interviewRounds: InterviewRound[]
  createdAt: Date
  updatedAt: Date
}

export interface IClient {
  _id: string
  userId: string
  name: string
  company: string
  email: string
  phone: string
  project: string
  rate: number
  rateType: RateType
  currency: string
  status: ClientStatus
  startDate: Date
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface IInvoice {
  _id: string
  userId: string
  clientId: string
  amount: number
  currency: string
  status: InvoiceStatus
  dueDate: Date
  sentDate: Date
  paidDate: Date
  description: string
  remindersSent: number
  createdAt: Date
  updatedAt: Date
}

export interface IWorkflowLog {
  _id: string
  userId: string
  workflowType: WorkflowType
  status: WorkflowStatus
  relatedId: string
  groqTokensUsed: number
  errorMessage: string
  executionMs: number
  createdAt: Date
}

export interface DashboardStats {
  jobsApplied: number
  interviews: number
  activeClients: number
  invoicedThisMonth: number
}
