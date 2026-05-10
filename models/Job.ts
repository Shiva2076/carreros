import mongoose, { Schema, Document, models } from 'mongoose'

export interface JobDocument extends Document {
  userId: string
  title: string
  company: string
  location: string
  jobUrl: string
  status: 'applied' | 'interview' | 'offer' | 'rejected'
  appliedDate: Date
  followUpDate: Date
  salary: string
  jdText: string
  coverLetter: string
  skillMatch: number
  source: string
  notes: string
  interviewDate: Date
  interviewRounds: Array<{ round: number; date: Date; notes: string }>
  createdAt: Date
  updatedAt: Date
}

const JobSchema = new Schema<JobDocument>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: '' },
    jobUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['applied', 'interview', 'offer', 'rejected'],
      default: 'applied',
    },
    appliedDate: { type: Date, default: Date.now },
    followUpDate: { type: Date },
    salary: { type: String, default: '' },
    jdText: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    skillMatch: { type: Number, default: 0, min: 0, max: 100 },
    source: { type: String, default: 'manual' },
    notes: { type: String, default: '' },
    interviewDate: { type: Date },
    interviewRounds: [
      {
        round: Number,
        date: Date,
        notes: String,
      },
    ],
  },
  { timestamps: true }
)

JobSchema.pre('save', function (this: mongoose.HydratedDocument<JobDocument>, next) {
  if (this.isNew && !this.followUpDate && this.appliedDate) {
    const follow = new Date(this.appliedDate)
    follow.setDate(follow.getDate() + 7)
    this.followUpDate = follow
  }
  next()
})

export default models.Job || mongoose.model<JobDocument>('Job', JobSchema)
