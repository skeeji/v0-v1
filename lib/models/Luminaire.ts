import mongoose, { Schema, type Document } from "mongoose"

export interface ILuminaire extends Document {
  name: string
  artist?: string
  year?: string
  specialty?: string
  collaboration?: string
  signed?: string
  imagePath?: string
  imageUrl?: string
  filename?: string
  dimensions?: string
  estimation?: string
  materials?: string
  description?: string
  url?: string
  createdAt: Date
  updatedAt: Date
}

const LuminaireSchema = new Schema<ILuminaire>(
  {
    name: { type: String, required: true },
    artist: { type: String },
    year: { type: String },
    specialty: { type: String },
    collaboration: { type: String },
    signed: { type: String },
    imagePath: { type: String }, // Chemin local de l'image
    imageUrl: { type: String }, // URL pour accéder à l'image
    filename: { type: String },
    dimensions: { type: String },
    estimation: { type: String },
    materials: { type: String },
    description: { type: String },
    url: { type: String },
  },
  {
    timestamps: true,
  },
)

// Index pour la recherche
LuminaireSchema.index({
  name: "text",
  artist: "text",
  specialty: "text",
  collaboration: "text",
  materials: "text",
  description: "text",
})

export default mongoose.models.Luminaire || mongoose.model<ILuminaire>("Luminaire", LuminaireSchema)
