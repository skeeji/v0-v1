import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import connectDB from "@/lib/mongodb"
import WelcomeVideo from "@/lib/models/WelcomeVideo"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const formData = await request.formData()
    const file = formData.get("video") as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier vidéo fourni" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.name)
    const filename = `welcome-video-${uniqueSuffix}${extension}`

    // Définir le chemin de stockage
    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos")
    const filePath = path.join(uploadDir, filename)
    const publicUrl = `/uploads/videos/${filename}`

    // Sauvegarder le fichier
    await writeFile(filePath, buffer)

    // Supprimer l'ancienne vidéo et sauvegarder la nouvelle
    await WelcomeVideo.deleteMany({})
    const welcomeVideo = new WelcomeVideo({
      videoPath: filePath,
      videoUrl: publicUrl,
      filename: file.name,
    })
    await welcomeVideo.save()

    return NextResponse.json({
      message: "Vidéo d'accueil mise à jour avec succès",
      videoUrl: publicUrl,
    })
  } catch (error) {
    console.error("Error uploading video:", error)
    return NextResponse.json({ error: "Erreur lors de l'upload de la vidéo" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()

    const welcomeVideo = await WelcomeVideo.findOne().sort({ createdAt: -1 }).lean()

    if (!welcomeVideo) {
      return NextResponse.json({ videoUrl: null })
    }

    return NextResponse.json({ videoUrl: welcomeVideo.videoUrl })
  } catch (error) {
    console.error("Error fetching welcome video:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération de la vidéo" }, { status: 500 })
  }
}
