"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Habit } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Target, Edit, Trash2, CheckCircle, Calendar, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGoogleCalendar } from "@/hooks/use-google-calendar"

interface HabitWithStats extends Habit {
  today_completed: boolean
  week_progress: number
  month_progress: number
  streak: number
  total_completions: number
}

const colors = [
  { name: "Azul", value: "#3B82F6" },
  { name: "Verde", value: "#10B981" },
  { name: "Roxo", value: "#8B5CF6" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Laranja", value: "#F59E0B" },
  { name: "Vermelho", value: "#EF4444" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Teal", value: "#14B8A6" },
]

export default function HabitsPage() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<HabitWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [deletingHabit, setDeletingHabit] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    color: "#3B82F6",
    frequency: "daily",
    target_count: 1,
  })
  const [error, setError] = useState("")
  const { syncHabitToCalendar, removeFromCalendar, loading: calendarLoading } = useGoogleCalendar()

  useEffect(() => {
    if (user) {
      fetchHabits()
    }
  }, [user])

  const fetchHabits = async () => {
    try {
      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (habitsError) throw habitsError

      // Calcular estatísticas para cada hábito
      const habitsWithStats = await Promise.all(
        (habitsData || []).map(async (habit) => {
          const today = new Date().toISOString().split("T")[0]
          const weekStart = new Date()
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          const monthStart = new Date()
          monthStart.setDate(1)

          // Verificar se foi completado hoje
          const { data: todayLog } = await supabase
            .from("habit_logs")
            .select("*")
            .eq("habit_id", habit.id)
            .gte("completed_at", `${today}T00:00:00`)
            .lte("completed_at", `${today}T23:59:59`)

          // Logs da semana
          const { data: weekLogs } = await supabase
            .from("habit_logs")
            .select("*")
            .eq("habit_id", habit.id)
            .gte("completed_at", weekStart.toISOString())

          // Logs do mês
          const { data: monthLogs } = await supabase
            .from("habit_logs")
            .select("*")
            .eq("habit_id", habit.id)
            .gte("completed_at", monthStart.toISOString())

          // Todos os logs para calcular streak
          const { data: allLogs } = await supabase
            .from("habit_logs")
            .select("completed_at")
            .eq("habit_id", habit.id)
            .order("completed_at", { ascending: false })

          // Calcular streak
          let streak = 0
          if (allLogs && allLogs.length > 0) {
            const dates = allLogs.map((log) => new Date(log.completed_at).toDateString())
            const uniqueDates = [...new Set(dates)]

            for (let i = 0; i < uniqueDates.length; i++) {
              const checkDate = new Date()
              checkDate.setDate(checkDate.getDate() - i)
              if (uniqueDates.includes(checkDate.toDateString())) {
                streak++
              } else {
                break
              }
            }
          }

          const weekProgress = Math.min(100, ((weekLogs?.length || 0) / 7) * 100)
          const monthProgress = Math.min(100, ((monthLogs?.length || 0) / 30) * 100)

          return {
            ...habit,
            today_completed: (todayLog?.length || 0) > 0,
            week_progress: weekProgress,
            month_progress: monthProgress,
            streak,
            total_completions: allLogs?.length || 0,
          }
        }),
      )

      setHabits(habitsWithStats)
    } catch (error) {
      console.error("Erro ao carregar hábitos:", error)
      setError("Erro ao carregar hábitos")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (editingHabit) {
        // Atualizar hábito existente
        const { error } = await supabase.from("habits").update(formData).eq("id", editingHabit.id)

        if (error) throw error
      } else {
        // Criar novo hábito
        const { data: newHabit, error } = await supabase
          .from("habits")
          .insert({
            ...formData,
            user_id: user!.id,
          })
          .select()
          .single()

        if (error) throw error

        // Sincronizar com Google Calendar
        if (newHabit) {
          await syncHabitToCalendar(newHabit.id, formData.title, formData.description || "")
        }
      }

      setIsDialogOpen(false)
      setEditingHabit(null)
      setFormData({
        title: "",
        description: "",
        color: "#3B82F6",
        frequency: "daily",
        target_count: 1,
      })
      fetchHabits()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const toggleHabitCompletion = async (habitId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        // Remover log de hoje
        const today = new Date().toISOString().split("T")[0]
        await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habitId)
          .gte("completed_at", `${today}T00:00:00`)
          .lte("completed_at", `${today}T23:59:59`)
      } else {
        // Adicionar log de hoje
        await supabase.from("habit_logs").insert({
          habit_id: habitId,
          user_id: user!.id,
          completed_at: new Date().toISOString(),
        })
      }

      fetchHabits()
    } catch (error) {
      console.error("Erro ao atualizar hábito:", error)
    }
  }

  const deleteHabit = async (habitId: string) => {
    setDeletingHabit(habitId)

    try {
      // Buscar o hábito para obter o ID do evento do Google Calendar
      const habit = habits.find((h) => h.id === habitId)

      // Remover do Google Calendar se existir
      if (habit?.google_calendar_event_id) {
        await removeFromCalendar(habit.google_calendar_event_id)
      }

      // Primeiro, deletar todos os logs relacionados
      const { error: logsError } = await supabase.from("habit_logs").delete().eq("habit_id", habitId)

      if (logsError) throw logsError

      // Depois, deletar o hábito
      const { error: habitError } = await supabase.from("habits").delete().eq("id", habitId)

      if (habitError) throw habitError

      // Atualizar a lista local
      setHabits((prev) => prev.filter((habit) => habit.id !== habitId))
    } catch (error) {
      console.error("Erro ao excluir hábito:", error)
      setError("Erro ao excluir hábito")
    } finally {
      setDeletingHabit(null)
    }
  }

  const openEditDialog = (habit: Habit) => {
    setEditingHabit(habit)
    setFormData({
      title: habit.title,
      description: habit.description || "",
      color: habit.color,
      frequency: habit.frequency,
      target_count: habit.target_count,
    })
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Hábitos</h1>
          <p className="text-gray-600 mt-1">Gerencie e acompanhe seus hábitos diários</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Hábito
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingHabit ? "Editar Hábito" : "Criar Novo Hábito"}</DialogTitle>
              <DialogDescription>
                {editingHabit ? "Atualize as informações do seu hábito" : "Defina um novo hábito para acompanhar"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Beber 2L de água"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva seu hábito..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequência</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_count">Meta</Label>
                  <Input
                    id="target_count"
                    type="number"
                    min="1"
                    value={formData.target_count}
                    onChange={(e) => setFormData({ ...formData, target_count: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color.value ? "border-gray-900" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingHabit ? "Atualizar" : "Criar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Hábitos */}
      {habits.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum hábito criado</h3>
            <p className="text-gray-600 mb-6">Comece criando seu primeiro hábito para acompanhar seu progresso</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Hábito
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <Card key={habit.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: habit.color }} />
                    <div>
                      <CardTitle className="text-lg">{habit.title}</CardTitle>
                      {habit.description && <CardDescription className="mt-1">{habit.description}</CardDescription>}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(habit)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={deletingHabit === habit.id}>
                          {deletingHabit === habit.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Hábito</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o hábito "{habit.title}"? Esta ação não pode ser desfeita e
                            todos os dados relacionados serão perdidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteHabit(habit.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Botão de completar hoje */}
                <Button
                  variant={habit.today_completed ? "default" : "outline"}
                  className="w-full"
                  onClick={() => toggleHabitCompletion(habit.id, habit.today_completed)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {habit.today_completed ? "Completado hoje!" : "Marcar como feito"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncHabitToCalendar(habit.id, habit.title, habit.description || "")}
                  disabled={calendarLoading}
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {habit.google_calendar_event_id ? "Sincronizado" : "Sincronizar com Calendar"}
                </Button>

                {/* Estatísticas */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sequência atual</span>
                    <Badge variant="secondary">{habit.streak} dias</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progresso semanal</span>
                      <span className="font-medium">{Math.round(habit.week_progress)}%</span>
                    </div>
                    <Progress value={habit.week_progress} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progresso mensal</span>
                      <span className="font-medium">{Math.round(habit.month_progress)}%</span>
                    </div>
                    <Progress value={habit.month_progress} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">Total de completações</span>
                    <span className="font-semibold text-lg">{habit.total_completions}</span>
                  </div>
                </div>

                {/* Badges de frequência */}
                <div className="flex justify-between items-center">
                  <Badge variant="outline">
                    {habit.frequency === "daily" ? "Diário" : habit.frequency === "weekly" ? "Semanal" : "Mensal"}
                  </Badge>
                  <span className="text-sm text-gray-500">Meta: {habit.target_count}x</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
