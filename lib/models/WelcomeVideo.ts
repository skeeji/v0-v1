import mongoose, { Schema, type Document } from "mongoose"

export interface IWelcomeVideo extends Document {
  videoPath: string
  videoUrl: string
  filename: string
  createdAt: Date
  updatedAt: Date
}

const WelcomeVideoSchema = new Schema<IWelcomeVideo>(
  {
    videoPath: { type: String, required: true },
    videoUrl: { type: String, required: true },
    filename: { type: String, required: true },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.WelcomeVideo || mongoose.model<IWelcomeVideo>("WelcomeVideo", WelcomeVideoSchema)
