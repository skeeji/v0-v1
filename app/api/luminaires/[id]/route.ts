import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Luminaire from "@/lib/models/Luminaire"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const luminaire = await Luminaire.findById(params.id).lean()

    if (!luminaire) {
      return NextResponse.json({ error: "Luminaire non trouvé" }, { status: 404 })
    }

    return NextResponse.json(luminaire)
  } catch (error) {
    console.error("Error fetching luminaire:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du luminaire" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const data = await request.json()
    const luminaire = await Luminaire.findByIdAndUpdate(params.id, data, { new: true, runValidators: true })

    if (!luminaire) {
      return NextResponse.json({ error: "Luminaire non trouvé" }, { status: 404 })
    }

    return NextResponse.json(luminaire)
  } catch (error) {
    console.error("Error updating luminaire:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du luminaire" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const luminaire = await Luminaire.findByIdAndDelete(params.id)

    if (!luminaire) {
      return NextResponse.json({ error: "Luminaire non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ message: "Luminaire supprimé avec succès" })
  } catch (error) {
    console.error("Error deleting luminaire:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression du luminaire" }, { status: 500 })
  }
}
