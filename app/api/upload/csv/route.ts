import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Luminaire from "@/lib/models/Luminaire"
import Designer from "@/lib/models/Designer"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { data, type } = await request.json()

    if (type === "luminaires") {
      // Traitement des luminaires
      const processedLuminaires = data.map((item: any) => ({
        name: item["Nom luminaire"] || item.name || "",
        artist: item["Artiste / Dates"] || item.artist || "",
        specialty: item["Spécialité"] || item.specialty || "",
        collaboration: item["Collaboration / Œuvre"] || item.collaboration || "",
        year: item["Année"] || item.year || "",
        signed: item["Signé"] || item.signed || "",
        filename: item["Nom du fichier"] || item.filename || "",
        dimensions: item["Dimensions"] || item.dimensions || "",
        estimation: item["Estimation"] || item.estimation || "",
        materials: item["Matériaux"] || item.materials || "",
        description: item["Description"] || item.description || "",
        url: item["Lien internet"] || item.url || "",
      }))

      const savedLuminaires = await Luminaire.insertMany(processedLuminaires)

      return NextResponse.json({
        message: `${savedLuminaires.length} luminaires importés avec succès`,
        count: savedLuminaires.length,
      })
    } else if (type === "designers") {
      // Traitement des designers
      const processedDesigners = data.map((item: any) => ({
        name: item["Nom"] || item.name || "",
        imageFile: item["imagedesigner"] || item.imageFile || "",
      }))

      const savedDesigners = []
      for (const designerData of processedDesigners) {
        try {
          const designer = await Designer.findOneAndUpdate({ name: designerData.name }, designerData, {
            upsert: true,
            new: true,
          })
          savedDesigners.push(designer)
        } catch (error) {
          console.error(`Erreur lors de la sauvegarde du designer ${designerData.name}:`, error)
        }
      }

      return NextResponse.json({
        message: `${savedDesigners.length} designers importés avec succès`,
        count: savedDesigners.length,
      })
    }

    return NextResponse.json({ error: "Type de données non supporté" }, { status: 400 })
  } catch (error) {
    console.error("Error importing CSV data:", error)
    return NextResponse.json({ error: "Erreur lors de l'importation des données CSV" }, { status: 500 })
  }
}
