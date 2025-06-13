import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import connectDB from "@/lib/mongodb"
import Luminaire from "@/lib/models/Luminaire"
import Designer from "@/lib/models/Designer"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const formData = await request.formData()
    const files = formData.getAll("images") as File[]
    const type = formData.get("type") as string // 'luminaires' ou 'designers'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    const uploadedFiles = []

    for (const file of files) {
      if (file instanceof File) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        const extension = path.extname(file.name)
        const filename = `${file.name.replace(extension, "")}-${uniqueSuffix}${extension}`

        // Définir le chemin de stockage
        const uploadDir = path.join(process.cwd(), "public", "uploads", "images")
        const filePath = path.join(uploadDir, filename)
        const publicUrl = `/uploads/images/${filename}`

        // Sauvegarder le fichier
        await writeFile(filePath, buffer)

        uploadedFiles.push({
          originalName: file.name,
          filename,
          path: filePath,
          url: publicUrl,
        })

        // Associer l'image selon le type
        if (type === "luminaires") {
          // Chercher le luminaire par nom de fichier
          const fileNameWithoutExt = file.name.replace(extension, "")
          await Luminaire.findOneAndUpdate(
            {
              $or: [
                { filename: file.name },
                { filename: fileNameWithoutExt },
                { name: { $regex: fileNameWithoutExt, $options: "i" } },
              ],
            },
            {
              imagePath: filePath,
              imageUrl: publicUrl,
            },
          )
        } else if (type === "designers") {
          // Chercher le designer par nom de fichier d'image
          const fileNameWithoutExt = file.name.replace(extension, "")
          await Designer.findOneAndUpdate(
            {
              $or: [
                { imageFile: file.name },
                { imageFile: fileNameWithoutExt },
                { name: { $regex: fileNameWithoutExt, $options: "i" } },
              ],
            },
            {
              imagePath: filePath,
              imageUrl: publicUrl,
            },
          )
        }
      }
    }

    return NextResponse.json({
      message: `${uploadedFiles.length} images uploadées avec succès`,
      files: uploadedFiles,
    })
  } catch (error) {
    console.error("Error uploading images:", error)
    return NextResponse.json({ error: "Erreur lors de l'upload des images" }, { status: 500 })
  }
}
