import mongoose, { Schema, Document, models } from 'mongoose'

export interface WorkflowLogDocument extends Document {
  userId: string
  workflowType: 'cover-letter' | 'invoice-reminder' | 'weekly-digest' | 'job-intake' | 'calendar-event'
  status: 'running' | 'success' | 'failed'
  relatedId: string
  groqTokensUsed: number
  errorMessage: string
  executionMs: number
  createdAt: Date
}

const WorkflowLogSchema = new Schema<WorkflowLogDocument>(
  {
    userId: { type: String, required: true, index: true },
    workflowType: {
      type: String,
      enum: ['cover-letter', 'invoice-reminder', 'weekly-digest', 'job-intake', 'calendar-event'],
      required: true,
    },
    status: {
      type: String,
      enum: ['running', 'success', 'failed'],
      default: 'running',
    },
    relatedId: { type: String, default: '' },
    groqTokensUsed: { type: Number, default: 0 },
    errorMessage: { type: String, default: '' },
    executionMs: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export default models.WorkflowLog || mongoose.model<WorkflowLogDocument>('WorkflowLog', WorkflowLogSchema)
