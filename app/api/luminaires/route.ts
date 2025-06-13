import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Luminaire from "@/lib/models/Luminaire"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const artist = searchParams.get("artist")
    const yearMin = searchParams.get("yearMin")
    const yearMax = searchParams.get("yearMax")
    const period = searchParams.get("period")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const sort = searchParams.get("sort") || "name"

    const query: any = {}

    // Recherche textuelle
    if (search) {
      query.$text = { $search: search }
    }

    // Filtre par artiste
    if (artist && artist !== "all") {
      query.artist = artist
    }

    // Filtre par année
    if (yearMin || yearMax) {
      query.year = {}
      if (yearMin) query.year.$gte = yearMin
      if (yearMax) query.year.$lte = yearMax
    }

    // Filtre par période (pour la chronologie)
    if (period) {
      query.$or = [
        { specialty: { $regex: period, $options: "i" } },
        { collaboration: { $regex: period, $options: "i" } },
        { description: { $regex: period, $options: "i" } },
      ]
    }

    // Configuration du tri
    let sortConfig: any = {}
    switch (sort) {
      case "name-asc":
        sortConfig = { name: 1 }
        break
      case "name-desc":
        sortConfig = { name: -1 }
        break
      case "year-asc":
        sortConfig = { year: 1 }
        break
      case "year-desc":
        sortConfig = { year: -1 }
        break
      default:
        sortConfig = { name: 1 }
    }

    const skip = (page - 1) * limit

    const [luminaires, total] = await Promise.all([
      Luminaire.find(query).sort(sortConfig).skip(skip).limit(limit).lean(),
      Luminaire.countDocuments(query),
    ])

    return NextResponse.json({
      luminaires,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + luminaires.length < total,
    })
  } catch (error) {
    console.error("Error fetching luminaires:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des luminaires" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const data = await request.json()
    const luminaire = new Luminaire(data)
    await luminaire.save()

    return NextResponse.json(luminaire, { status: 201 })
  } catch (error) {
    console.error("Error creating luminaire:", error)
    return NextResponse.json({ error: "Erreur lors de la création du luminaire" }, { status: 500 })
  }
}
