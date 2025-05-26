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
  private readonly timeZone = "America/Sao_Paulo" // Timezone do Brasil

  constructor(accessToken?: string) {
    this.accessToken = accessToken || null
  }

  // Função para formatar data no padrão brasileiro
  private formatDateToBrazilian(date: Date): string {
    // Garantir que a data está no timezone brasileiro
    const brazilDate = new Date(date.toLocaleString("en-US", { timeZone: this.timeZone }))
    return brazilDate.toISOString()
  }

  // Função para criar data no timezone brasileiro
  private createBrazilianDate(dateString?: string, timeString?: string): Date {
    let date: Date

    if (dateString && timeString) {
      // Para tarefas com data e hora específicas
      const [year, month, day] = dateString.split("-").map(Number)
      const [hours, minutes] = timeString.split(":").map(Number)
      date = new Date(year, month - 1, day, hours, minutes, 0, 0)
    } else if (dateString) {
      // Para datas sem hora específica
      const [year, month, day] = dateString.split("-").map(Number)
      date = new Date(year, month - 1, day, 9, 0, 0, 0) // 9h da manhã por padrão
    } else {
      // Para hoje
      date = new Date()
    }

    return date
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

  // Verificar se o token ainda é válido (versão mais robusta)
  async validateToken(): Promise<boolean> {
    if (!this.accessToken) {
      console.error("❌ Token não disponível para validação")
      return false
    }

    try {
      console.log("🔍 Validando token do Google Calendar...")

      const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      console.log("🔍 Status da validação:", response.status)

      if (response.ok) {
        console.log("✅ Token válido!")
        return true
      } else {
        const errorText = await response.text()
        console.error("❌ Token inválido:", response.status, errorText)
        return false
      }
    } catch (error) {
      console.error("❌ Erro ao validar token:", error)
      return false
    }
  }

  // Criar evento no Google Calendar (versão mais robusta)
  async createEvent(event: CalendarEvent): Promise<string | null> {
    if (!this.accessToken) {
      console.error("❌ Token de acesso não disponível")
      return null
    }

    try {
      console.log("📅 Criando evento no Google Calendar...")
      console.log("🔑 Usando token:", this.accessToken.substring(0, 20) + "...")
      console.log("📋 Dados do evento:", JSON.stringify(event, null, 2))

      const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })

      console.log("📅 Status da criação:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro ao criar evento:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        })

        // Tentar parsear o erro JSON
        try {
          const errorJson = JSON.parse(errorText)
          console.error("❌ Detalhes do erro:", errorJson)
        } catch {
          console.error("❌ Erro não é JSON:", errorText)
        }

        return null
      }

      const createdEvent = await response.json()
      console.log("✅ Evento criado com sucesso!")
      console.log("📅 ID do evento:", createdEvent.id)
      console.log("📅 Link do evento:", createdEvent.htmlLink)

      return createdEvent.id
    } catch (error) {
      console.error("❌ Erro inesperado ao criar evento:", error)
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
    const [hours, minutes] = time.split(":").map(Number)

    // Criar para hoje no horário brasileiro
    const startDateTime = this.createBrazilianDate()
    startDateTime.setHours(hours, minutes, 0, 0)

    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + 30) // 30 minutos de duração

    console.log("🎯 Criando hábito para:", {
      start: startDateTime.toLocaleString("pt-BR"),
      end: endDateTime.toLocaleString("pt-BR"),
      timezone: this.timeZone,
    })

    return {
      summary: `🎯 ${title}`,
      description: `Hábito: ${description}\n\nCriado pelo Hábitus\nHorário: ${startDateTime.toLocaleString("pt-BR")}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: this.timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: this.timeZone,
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
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)

    // Encontrar o próximo dia da semana válido
    const today = new Date()
    const nextValidDate = new Date(today)

    // Ajustar para o próximo dia válido
    while (!daysOfWeek.includes(nextValidDate.getDay())) {
      nextValidDate.setDate(nextValidDate.getDate() + 1)
    }

    const startDateTime = this.createBrazilianDate()
    startDateTime.setFullYear(nextValidDate.getFullYear(), nextValidDate.getMonth(), nextValidDate.getDate())
    startDateTime.setHours(startHours, startMinutes, 0, 0)

    const endDateTime = this.createBrazilianDate()
    endDateTime.setFullYear(nextValidDate.getFullYear(), nextValidDate.getMonth(), nextValidDate.getDate())
    endDateTime.setHours(endHours, endMinutes, 0, 0)

    // Converter dias da semana para formato do Google Calendar
    const googleDays = daysOfWeek.map((day) => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][day]).join(",")

    console.log("📅 Criando rotina para:", {
      start: startDateTime.toLocaleString("pt-BR"),
      end: endDateTime.toLocaleString("pt-BR"),
      days: googleDays,
      timezone: this.timeZone,
    })

    return {
      summary: `📅 ${title}`,
      description: `Rotina: ${description}\n\nCriado pelo Hábitus\nHorário: ${startTime} - ${endTime}\nDias: ${daysOfWeek.map((d) => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d]).join(", ")}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: this.timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: this.timeZone,
      },
      recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${googleDays}`],
    }
  }

  // Criar evento para tarefa
  createTaskEvent(title: string, description: string, dueDate: string): CalendarEvent {
    // Converter a data do formato ISO para Date brasileiro
    const taskDate = new Date(dueDate)

    // Garantir que está no timezone brasileiro
    const startDateTime = this.createBrazilianDate(
      taskDate.toISOString().split("T")[0],
      taskDate.toTimeString().slice(0, 5),
    )

    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + 30) // 30 minutos de duração

    console.log("✅ Criando tarefa para:", {
      original: dueDate,
      start: startDateTime.toLocaleString("pt-BR"),
      end: endDateTime.toLocaleString("pt-BR"),
      timezone: this.timeZone,
    })

    return {
      summary: `✅ ${title}`,
      description: `Tarefa: ${description}\n\nCriado pelo Hábitus\nPrazo: ${startDateTime.toLocaleString("pt-BR")}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: this.timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: this.timeZone,
      },
    }
  }

  // Listar eventos do calendário (para debug)
  async listEvents(): Promise<any[]> {
    if (!this.accessToken) {
      console.error("Token de acesso não disponível")
      return []
    }

    try {
      // Buscar eventos dos próximos 7 dias no timezone brasileiro
      const now = new Date()
      const timeMin = now.toISOString()
      const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      console.log("📋 Buscando eventos de", timeMin, "até", timeMax)

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&timeZone=${this.timeZone}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro ao listar eventos:", response.status, errorText)
        return []
      }

      const data = await response.json()
      console.log("📋 Eventos encontrados:", data.items?.length || 0)

      // Filtrar apenas eventos do Hábitus
      const habitusEvents = (data.items || []).filter(
        (event: any) =>
          event.summary?.includes("🎯") ||
          event.summary?.includes("📅") ||
          event.summary?.includes("✅") ||
          event.description?.includes("Criado pelo Hábitus"),
      )

      console.log("🎯 Eventos do Hábitus:", habitusEvents.length)
      habitusEvents.forEach((event: any) => {
        console.log("📅", event.summary, "->", new Date(event.start.dateTime).toLocaleString("pt-BR"))
      })

      return data.items || []
    } catch (error) {
      console.error("Erro ao listar eventos:", error)
      return []
    }
  }
}
