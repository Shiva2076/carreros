import mongoose, { Schema, Document, models, Types } from 'mongoose'

export interface InvoiceDocument extends Document {
  userId: string
  clientId: Types.ObjectId
  amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: Date
  sentDate: Date
  paidDate: Date
  description: string
  remindersSent: number
  createdAt: Date
  updatedAt: Date
}

const InvoiceSchema = new Schema<InvoiceDocument>(
  {
    userId: { type: String, required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue'],
      default: 'draft',
    },
    dueDate: { type: Date },
    sentDate: { type: Date },
    paidDate: { type: Date },
    description: { type: String, default: '' },
    remindersSent: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default models.Invoice || mongoose.model<InvoiceDocument>('Invoice', InvoiceSchema)
