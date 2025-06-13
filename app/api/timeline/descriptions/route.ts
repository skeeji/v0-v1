import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TimelineDescription from "@/lib/models/TimelineDescription"

export async function GET() {
  try {
    await connectDB()

    const descriptions = await TimelineDescription.find().lean()

    // Convertir en objet clé-valeur pour compatibilité
    const descriptionsMap = descriptions.reduce(
      (acc, desc) => {
        acc[desc.periodName] = desc.description
        return acc
      },
      {} as Record<string, string>,
    )

    return NextResponse.json(descriptionsMap)
  } catch (error) {
    console.error("Error fetching timeline descriptions:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des descriptions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { periodName, description } = await request.json()

    const timelineDescription = await TimelineDescription.findOneAndUpdate(
      { periodName },
      { description },
      { upsert: true, new: true },
    )

    return NextResponse.json(timelineDescription)
  } catch (error) {
    console.error("Error saving timeline description:", error)
    return NextResponse.json({ error: "Erreur lors de la sauvegarde de la description" }, { status: 500 })
  }
}
