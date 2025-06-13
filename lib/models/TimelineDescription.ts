import mongoose, { Schema, type Document } from "mongoose"

export interface ITimelineDescription extends Document {
  periodName: string
  description: string
  createdAt: Date
  updatedAt: Date
}

const TimelineDescriptionSchema = new Schema<ITimelineDescription>(
  {
    periodName: { type: String, required: true, unique: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.TimelineDescription ||
  mongoose.model<ITimelineDescription>("TimelineDescription", TimelineDescriptionSchema)
