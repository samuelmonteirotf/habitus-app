"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Erro na autenticação:", error)
          router.push("/auth?error=auth_error")
          return
        }

        if (data.session) {
          router.push("/dashboard")
        } else {
          router.push("/auth")
        }
      } catch (error) {
        console.error("Erro inesperado:", error)
        router.push("/auth?error=unexpected_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-gray-600">Processando autenticação...</p>
      </div>
    </div>
  )
}
