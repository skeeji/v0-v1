import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Luminaire from "@/lib/models/Luminaire"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const currentLuminaire = await Luminaire.findById(params.id).lean()

    if (!currentLuminaire) {
      return NextResponse.json({ error: "Luminaire non trouvé" }, { status: 404 })
    }

    // Recherche de luminaires similaires
    const similarQuery: any = {
      _id: { $ne: params.id }, // Exclure le luminaire actuel
    }

    // Construire la requête de similarité
    const orConditions = []

    if (currentLuminaire.artist) {
      orConditions.push({ artist: currentLuminaire.artist })
    }

    if (currentLuminaire.specialty) {
      orConditions.push({ specialty: currentLuminaire.specialty })
    }

    if (currentLuminaire.year) {
      const year = Number.parseInt(currentLuminaire.year)
      if (!isNaN(year)) {
        orConditions.push({
          year: {
            $gte: (year - 10).toString(),
            $lte: (year + 10).toString(),
          },
        })
      }
    }

    if (currentLuminaire.collaboration) {
      orConditions.push({
        collaboration: { $regex: currentLuminaire.collaboration, $options: "i" },
      })
    }

    if (orConditions.length > 0) {
      similarQuery.$or = orConditions
    }

    const similarLuminaires = await Luminaire.find(similarQuery).limit(6).lean()

    return NextResponse.json(similarLuminaires)
  } catch (error) {
    console.error("Error fetching similar luminaires:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des luminaires similaires" }, { status: 500 })
  }
}
