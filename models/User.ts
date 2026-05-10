import mongoose, { Schema, Document } from 'mongoose'

export interface UserDocument extends Document {
  googleId: string
  email: string
  name: string
  googleRefreshToken: string
  updatedAt: Date
}

const UserSchema = new Schema<UserDocument>(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String, default: '' },
    googleRefreshToken: { type: String, default: '' },
  },
  { timestamps: true }
)

export default (mongoose.models?.User as mongoose.Model<UserDocument>) || mongoose.model<UserDocument>('User', UserSchema)
