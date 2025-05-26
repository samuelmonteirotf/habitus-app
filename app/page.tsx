"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Target } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/auth")
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Loading state */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full bg-white border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-gray-900">Hábitus</span>
            </div>

            <div className="flex space-x-6 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                Termos de Serviço
              </Link>
              <span>© 2024 Hábitus. Todos os direitos reservados.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
