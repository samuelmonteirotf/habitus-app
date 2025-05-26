"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase, type Profile } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("❌ Erro ao obter sessão:", error)
          setLoading(false)
          return
        }

        console.log("🔐 Sessão obtida:", session ? "✅ Logado" : "❌ Não logado")
        if (session?.provider_token) {
          console.log("🔑 Token do Google encontrado:", session.provider_token.substring(0, 20) + "...")
        }

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          fetchProfile(session.user.id, session)
        } else {
          setLoading(false)
        }
      })
      .catch((error) => {
        console.error("❌ Erro inesperado ao obter sessão:", error)
        setLoading(false)
      })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Mudança de autenticação:", event)

      if (session?.provider_token) {
        console.log("🔑 Novo token do Google:", session.provider_token.substring(0, 20) + "...")
      }

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id, session)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string, session?: Session) => {
    try {
      console.log("👤 Buscando perfil para:", userId)

      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code === "PGRST116") {
        // Perfil não existe, criar um novo
        console.log("📝 Criando novo perfil...")

        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          const newProfile = {
            id: userData.user.id,
            email: userData.user.email!,
            full_name: userData.user.user_metadata?.full_name || "",
            avatar_url: userData.user.user_metadata?.avatar_url || "",
            // Capturar token do Google Calendar se disponível
            google_calendar_token: session?.provider_token || null,
            google_refresh_token: session?.provider_refresh_token || null,
          }

          console.log("🔑 Salvando tokens:", {
            hasAccessToken: !!newProfile.google_calendar_token,
            hasRefreshToken: !!newProfile.google_refresh_token,
          })

          const { data: createdProfile, error: createError } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select()
            .single()

          if (!createError) {
            console.log("✅ Perfil criado com sucesso")
            setProfile(createdProfile)
          } else {
            console.error("❌ Erro ao criar perfil:", createError)
          }
        }
      } else if (!error) {
        // Atualizar tokens se necessário
        if (session?.provider_token && data.google_calendar_token !== session.provider_token) {
          console.log("🔄 Atualizando tokens do Google...")

          const updatedProfile = {
            ...data,
            google_calendar_token: session.provider_token,
            google_refresh_token: session.provider_refresh_token || data.google_refresh_token,
          }

          const { error: updateError } = await supabase.from("profiles").update(updatedProfile).eq("id", userId)

          if (!updateError) {
            console.log("✅ Tokens atualizados")
            setProfile(updatedProfile)
          } else {
            console.error("❌ Erro ao atualizar tokens:", updateError)
            setProfile(data)
          }
        } else {
          console.log("✅ Perfil carregado")
          setProfile(data)
        }
      }
    } catch (error) {
      console.error("❌ Erro inesperado ao buscar perfil:", error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    console.log("🔐 Iniciando login com Google...")

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar",
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      console.error("❌ Erro no login Google:", error)
    } else {
      console.log("✅ Redirecionando para Google...")
    }

    return { data, error }
  }

  const signOut = async () => {
    console.log("👋 Fazendo logout...")
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
