"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Routine } from "@/lib/supabase"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Calendar, Clock, Edit, Trash2, Play, Pause } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const daysOfWeek = [
  { value: 0, label: "Dom", fullLabel: "Domingo" },
  { value: 1, label: "Seg", fullLabel: "Segunda" },
  { value: 2, label: "Ter", fullLabel: "Terça" },
  { value: 3, label: "Qua", fullLabel: "Quarta" },
  { value: 4, label: "Qui", fullLabel: "Quinta" },
  { value: 5, label: "Sex", fullLabel: "Sexta" },
  { value: 6, label: "Sáb", fullLabel: "Sábado" },
]

export default function RoutinesPage() {
  const { user } = useAuth()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    days_of_week: [] as number[],
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      fetchRoutines()
    }
  }, [user])

  const fetchRoutines = async () => {
    try {
      const { data, error } = await supabase
        .from("routines")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setRoutines(data || [])
    } catch (error) {
      console.error("Erro ao carregar rotinas:", error)
      setError("Erro ao carregar rotinas")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.days_of_week.length === 0) {
      setError("Selecione pelo menos um dia da semana")
      return
    }

    try {
      if (editingRoutine) {
        // Atualizar rotina existente
        const { error } = await supabase.from("routines").update(formData).eq("id", editingRoutine.id)

        if (error) throw error
      } else {
        // Criar nova rotina
        const { error } = await supabase.from("routines").insert({
          ...formData,
          user_id: user!.id,
        })

        if (error) throw error
      }

      setIsDialogOpen(false)
      setEditingRoutine(null)
      setFormData({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        days_of_week: [],
      })
      fetchRoutines()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const toggleRoutineStatus = async (routineId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from("routines").update({ is_active: !isActive }).eq("id", routineId)

      if (error) throw error

      setRoutines((prev) =>
        prev.map((routine) => (routine.id === routineId ? { ...routine, is_active: !isActive } : routine)),
      )
    } catch (error) {
      console.error("Erro ao atualizar rotina:", error)
    }
  }

  const deleteRoutine = async (routineId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta rotina?")) return

    try {
      const { error } = await supabase.from("routines").delete().eq("id", routineId)

      if (error) throw error

      setRoutines((prev) => prev.filter((routine) => routine.id !== routineId))
    } catch (error) {
      console.error("Erro ao excluir rotina:", error)
    }
  }

  const openEditDialog = (routine: Routine) => {
    setEditingRoutine(routine)
    setFormData({
      title: routine.title,
      description: routine.description || "",
      start_time: routine.start_time || "",
      end_time: routine.end_time || "",
      days_of_week: routine.days_of_week || [],
    })
    setIsDialogOpen(true)
  }

  const toggleDayOfWeek = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day].sort(),
    }))
  }

  const formatTime = (time: string) => {
    if (!time) return ""
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysLabel = (days: number[]) => {
    if (days.length === 7) return "Todos os dias"
    if (days.length === 0) return "Nenhum dia"

    const sortedDays = [...days].sort()
    return sortedDays.map((day) => daysOfWeek[day].label).join(", ")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Minhas Rotinas</h1>
          <p className="text-gray-600 mt-1">Organize sua agenda com rotinas personalizadas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Rotina
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingRoutine ? "Editar Rotina" : "Criar Nova Rotina"}</DialogTitle>
              <DialogDescription>
                {editingRoutine ? "Atualize as informações da sua rotina" : "Defina uma nova rotina para sua agenda"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Exercícios matinais"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva sua rotina..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Horário de início</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">Horário de fim</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dias da semana</Label>
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={formData.days_of_week.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDayOfWeek(day.value)}
                      className="h-10"
                    >
                      {day.label}
                    </Button>
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
                <Button type="submit">{editingRoutine ? "Atualizar" : "Criar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Rotinas */}
      {routines.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma rotina criada</h3>
            <p className="text-gray-600 mb-6">Comece criando sua primeira rotina para organizar sua agenda</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Rotina
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routines.map((routine) => (
            <Card
              key={routine.id}
              className={`hover:shadow-lg transition-shadow ${!routine.is_active ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{routine.title}</CardTitle>
                    {routine.description && <CardDescription className="mt-1">{routine.description}</CardDescription>}
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(routine)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteRoutine(routine.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Horários */}
                {(routine.start_time || routine.end_time) && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {routine.start_time && formatTime(routine.start_time)}
                      {routine.start_time && routine.end_time && " - "}
                      {routine.end_time && formatTime(routine.end_time)}
                    </span>
                  </div>
                )}

                {/* Dias da semana */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{getDaysLabel(routine.days_of_week)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {daysOfWeek.map((day) => (
                      <Badge
                        key={day.value}
                        variant={routine.days_of_week.includes(day.value) ? "default" : "outline"}
                        className="text-xs"
                      >
                        {day.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Status e controles */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={routine.is_active}
                      onCheckedChange={() => toggleRoutineStatus(routine.id, routine.is_active)}
                    />
                    <span className="text-sm text-gray-600">{routine.is_active ? "Ativa" : "Pausada"}</span>
                  </div>

                  <Badge variant={routine.is_active ? "default" : "secondary"}>
                    {routine.is_active ? (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Ativa
                      </>
                    ) : (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        Pausada
                      </>
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
