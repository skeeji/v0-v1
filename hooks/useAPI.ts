"use client"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"

export function useAPI() {
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const apiCall = async (url: string, options: RequestInit = {}) => {
    setIsLoading(true)
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API Error:", error)
      showToast(error instanceof Error ? error.message : "Erreur API", "error")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const uploadFiles = async (url: string, formData: FormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Upload Error:", error)
      showToast(error instanceof Error ? error.message : "Erreur upload", "error")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    apiCall,
    uploadFiles,
    isLoading,
  }
}
