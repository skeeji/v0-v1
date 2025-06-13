import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Designer from "@/lib/models/Designer"
import Luminaire from "@/lib/models/Luminaire"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const sort = searchParams.get("sort") || "name-asc"

    // Récupérer tous les designers
    const query: any = {}
    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    let sortConfig: any = {}
    switch (sort) {
      case "name-asc":
        sortConfig = { name: 1 }
        break
      case "name-desc":
        sortConfig = { name: -1 }
        break
      default:
        sortConfig = { name: 1 }
    }

    const designers = await Designer.find(query).sort(sortConfig).lean()

    // Pour chaque designer, compter ses luminaires et récupérer quelques exemples
    const designersWithLuminaires = await Promise.all(
      designers.map(async (designer) => {
        const [count, luminaires] = await Promise.all([
          Luminaire.countDocuments({ artist: designer.name }),
          Luminaire.find({ artist: designer.name }).limit(3).lean(),
        ])

        return {
          ...designer,
          count,
          luminaires,
          slug: encodeURIComponent(designer.name),
        }
      }),
    )

    // Trier par nombre de luminaires si demandé
    if (sort === "count-desc") {
      designersWithLuminaires.sort((a, b) => b.count - a.count)
    }

    return NextResponse.json(designersWithLuminaires)
  } catch (error) {
    console.error("Error fetching designers:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des designers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const data = await request.json()
    const designer = new Designer(data)
    await designer.save()

    return NextResponse.json(designer, { status: 201 })
  } catch (error) {
    console.error("Error creating designer:", error)
    return NextResponse.json({ error: "Erreur lors de la création du designer" }, { status: 500 })
  }
}
