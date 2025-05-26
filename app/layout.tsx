import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hábitus - Produtividade Inteligente",
  description: "Transforme sua rotina em uma jornada de produtividade inteligente",
  verification: {
    google: "FSD1yiRtLxBDuhMzmVn21qe1P1Uqy9x7qU1e4O9_sDw",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="google-site-verification" content="FSD1yiRtLxBDuhMzmVn21qe1P1Uqy9x7qU1e4O9_sDw" />
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
