import mongoose, { Schema, Document, models } from 'mongoose'

export interface ClientDocument extends Document {
  userId: string
  name: string
  company: string
  email: string
  phone: string
  project: string
  rate: number
  rateType: 'hourly' | 'fixed' | 'monthly'
  currency: string
  status: 'active' | 'in-review' | 'completed' | 'paused'
  startDate: Date
  notes: string
  createdAt: Date
  updatedAt: Date
}

const ClientSchema = new Schema<ClientDocument>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    company: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    project: { type: String, default: '' },
    rate: { type: Number, default: 0 },
    rateType: {
      type: String,
      enum: ['hourly', 'fixed', 'monthly'],
      default: 'fixed',
    },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['active', 'in-review', 'completed', 'paused'],
      default: 'active',
    },
    startDate: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

export default models.Client || mongoose.model<ClientDocument>('Client', ClientSchema)
