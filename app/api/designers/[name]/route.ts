import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Designer from "@/lib/models/Designer"
import Luminaire from "@/lib/models/Luminaire"

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    await connectDB()

    const designerName = decodeURIComponent(params.name)

    // Chercher le designer
    const designer = await Designer.findOne({ name: designerName }).lean()

    // Récupérer les luminaires du designer
    const luminaires = await Luminaire.find({ artist: designerName }).lean()

    const result = {
      name: designerName,
      image: designer?.imageUrl || "",
      specialty: designer?.description || "",
      collaboration: designer?.collaboration || "",
      count: luminaires.length,
      luminaires,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching designer:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du designer" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    await connectDB()

    const designerName = decodeURIComponent(params.name)
    const data = await request.json()

    const designer = await Designer.findOneAndUpdate({ name: designerName }, data, {
      new: true,
      upsert: true,
      runValidators: true,
    })

    return NextResponse.json(designer)
  } catch (error) {
    console.error("Error updating designer:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du designer" }, { status: 500 })
  }
}
