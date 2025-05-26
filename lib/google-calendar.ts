import { supabase } from "./supabase"

interface CalendarEvent {
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  recurrence?: string[]
}

export class GoogleCalendarService {
  private accessToken: string | null = null

  constructor(accessToken?: string) {
    this.accessToken = accessToken || null
  }

  // Obter token de acesso do usuário
  async getAccessToken(userId: string): Promise<string | null> {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("google_calendar_token, google_refresh_token")
        .eq("id", userId)
        .single()

      if (profile?.google_calendar_token) {
        this.accessToken = profile.google_calendar_token
        return profile.google_calendar_token
      }

      return null
    } catch (error) {
      console.error("Erro ao obter token:", error)
      return null
    }
  }

  // Criar evento no Google Calendar
  async createEvent(event: CalendarEvent): Promise<string | null> {
    if (!this.accessToken) {
      console.error("Token de acesso não disponível")
      return null
    }

    try {
      const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error("Erro ao criar evento:", error)
        return null
      }

      const createdEvent = await response.json()
      return createdEvent.id
    } catch (error) {
      console.error("Erro ao criar evento no Google Calendar:", error)
      return null
    }
  }

  // Atualizar evento no Google Calendar
  async updateEvent(eventId: string, event: CalendarEvent): Promise<boolean> {
    if (!this.accessToken) {
      console.error("Token de acesso não disponível")
      return false
    }

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })

      return response.ok
    } catch (error) {
      console.error("Erro ao atualizar evento:", error)
      return false
    }
  }

  // Deletar evento do Google Calendar
  async deleteEvent(eventId: string): Promise<boolean> {
    if (!this.accessToken) {
      console.error("Token de acesso não disponível")
      return false
    }

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error("Erro ao deletar evento:", error)
      return false
    }
  }

  // Criar evento recorrente para hábito
  createHabitEvent(title: string, description: string, time = "09:00"): CalendarEvent {
    const startDateTime = new Date()
    const [hours, minutes] = time.split(":").map(Number)
    startDateTime.setHours(hours, minutes, 0, 0)

    const endDateTime = new Date(startDateTime)
    endDateTime.setHours(hours + 1, minutes, 0, 0) // 1 hora de duração

    return {
      summary: `🎯 ${title}`,
      description: `Hábito: ${description}\n\nCriado pelo Hábitus`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      recurrence: ["RRULE:FREQ=DAILY"], // Recorrência diária
    }
  }

  // Criar evento para rotina
  createRoutineEvent(
    title: string,
    description: string,
    startTime: string,
    endTime: string,
    daysOfWeek: number[],
  ): CalendarEvent {
    const today = new Date()
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)

    const startDateTime = new Date(today)
    startDateTime.setHours(startHours, startMinutes, 0, 0)

    const endDateTime = new Date(today)
    endDateTime.setHours(endHours, endMinutes, 0, 0)

    // Converter dias da semana para formato do Google Calendar
    const googleDays = daysOfWeek.map((day) => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][day]).join(",")

    return {
      summary: `📅 ${title}`,
      description: `Rotina: ${description}\n\nCriado pelo Hábitus`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${googleDays}`],
    }
  }

  // Criar evento para tarefa
  createTaskEvent(title: string, description: string, dueDate: string): CalendarEvent {
    const taskDate = new Date(dueDate)
    const endDate = new Date(taskDate)
    endDate.setHours(taskDate.getHours() + 1) // 1 hora de duração

    return {
      summary: `✅ ${title}`,
      description: `Tarefa: ${description}\n\nCriado pelo Hábitus`,
      start: {
        dateTime: taskDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }
  }
}
