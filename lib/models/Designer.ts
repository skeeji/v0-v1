import mongoose, { Schema, type Document } from "mongoose"

export interface IDesigner extends Document {
  name: string
  imagePath?: string
  imageUrl?: string
  imageFile?: string
  description?: string
  collaboration?: string
  createdAt: Date
  updatedAt: Date
}

const DesignerSchema = new Schema<IDesigner>(
  {
    name: { type: String, required: true, unique: true },
    imagePath: { type: String },
    imageUrl: { type: String },
    imageFile: { type: String },
    description: { type: String },
    collaboration: { type: String },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Designer || mongoose.model<IDesigner>("Designer", DesignerSchema)
