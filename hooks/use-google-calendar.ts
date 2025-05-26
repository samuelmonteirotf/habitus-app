"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { GoogleCalendarService } from "@/lib/google-calendar"
import { supabase } from "@/lib/supabase"

export function useGoogleCalendar() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const isConnected = async (): Promise<boolean> => {
    if (!user) return false

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("google_calendar_token")
        .eq("id", user.id)
        .single()

      return !!profile?.google_calendar_token
    } catch {
      return false
    }
  }

  const syncHabitToCalendar = async (habitId: string, title: string, description: string) => {
    if (!user) return null

    setLoading(true)
    try {
      const calendarService = new GoogleCalendarService()
      const token = await calendarService.getAccessToken(user.id)

      if (!token) {
        console.error("Token do Google Calendar não encontrado")
        return null
      }

      const event = calendarService.createHabitEvent(title, description)
      const eventId = await calendarService.createEvent(event)

      if (eventId) {
        // Salvar o ID do evento no banco
        await supabase.from("habits").update({ google_calendar_event_id: eventId }).eq("id", habitId)

        console.log("✅ Hábito sincronizado com Google Calendar")
        return eventId
      }

      return null
    } catch (error) {
      console.error("Erro ao sincronizar hábito:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const syncRoutineToCalendar = async (
    routineId: string,
    title: string,
    description: string,
    startTime: string,
    endTime: string,
    daysOfWeek: number[],
  ) => {
    if (!user) return null

    setLoading(true)
    try {
      const calendarService = new GoogleCalendarService()
      const token = await calendarService.getAccessToken(user.id)

      if (!token) {
        console.error("Token do Google Calendar não encontrado")
        return null
      }

      const event = calendarService.createRoutineEvent(title, description, startTime, endTime, daysOfWeek)
      const eventId = await calendarService.createEvent(event)

      if (eventId) {
        // Salvar o ID do evento no banco
        await supabase.from("routines").update({ google_calendar_event_id: eventId }).eq("id", routineId)

        console.log("✅ Rotina sincronizada com Google Calendar")
        return eventId
      }

      return null
    } catch (error) {
      console.error("Erro ao sincronizar rotina:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const syncTaskToCalendar = async (taskId: string, title: string, description: string, dueDate: string) => {
    if (!user) return null

    setLoading(true)
    try {
      const calendarService = new GoogleCalendarService()
      const token = await calendarService.getAccessToken(user.id)

      if (!token) {
        console.error("Token do Google Calendar não encontrado")
        return null
      }

      const event = calendarService.createTaskEvent(title, description, dueDate)
      const eventId = await calendarService.createEvent(event)

      if (eventId) {
        // Salvar o ID do evento no banco
        await supabase.from("tasks").update({ google_calendar_event_id: eventId }).eq("id", taskId)

        console.log("✅ Tarefa sincronizada com Google Calendar")
        return eventId
      }

      return null
    } catch (error) {
      console.error("Erro ao sincronizar tarefa:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const removeFromCalendar = async (eventId: string) => {
    if (!user || !eventId) return false

    setLoading(true)
    try {
      const calendarService = new GoogleCalendarService()
      const token = await calendarService.getAccessToken(user.id)

      if (!token) {
        console.error("Token do Google Calendar não encontrado")
        return false
      }

      const success = await calendarService.deleteEvent(eventId)

      if (success) {
        console.log("✅ Evento removido do Google Calendar")
      }

      return success
    } catch (error) {
      console.error("Erro ao remover evento:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    isConnected,
    syncHabitToCalendar,
    syncRoutineToCalendar,
    syncTaskToCalendar,
    removeFromCalendar,
  }
}
