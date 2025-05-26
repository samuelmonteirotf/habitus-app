"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Habit, type Task } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, CheckCircle, Calendar, TrendingUp, Plus, Clock, Star } from "lucide-react"
import Link from "next/link"

interface HabitWithLogs extends Habit {
  today_completed: boolean
  week_progress: number
  streak: number
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [habits, setHabits] = useState<HabitWithLogs[]>([])
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    weekProgress: 0,
    totalTasks: 0,
    completedTasks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Buscar hábitos ativos
      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (habitsError) throw habitsError

      // Buscar logs de hoje para cada hábito
      const today = new Date().toISOString().split("T")[0]
      const habitsWithProgress = await Promise.all(
        (habitsData || []).map(async (habit) => {
          // Verificar se foi completado hoje
          const { data: todayLog } = await supabase
            .from("habit_logs")
            .select("*")
            .eq("habit_id", habit.id)
            .gte("completed_at", `${today}T00:00:00`)
            .lte("completed_at", `${today}T23:59:59`)
            .limit(1)

          // Calcular progresso da semana
          const weekStart = new Date()
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          const { data: weekLogs } = await supabase
            .from("habit_logs")
            .select("*")
            .eq("habit_id", habit.id)
            .gte("completed_at", weekStart.toISOString())

          const weekProgress = Math.min(100, ((weekLogs?.length || 0) / 7) * 100)

          // Calcular streak (sequência)
          const { data: allLogs } = await supabase
            .from("habit_logs")
            .select("completed_at")
            .eq("habit_id", habit.id)
            .order("completed_at", { ascending: false })

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

          return {
            ...habit,
            today_completed: (todayLog?.length || 0) > 0,
            week_progress: weekProgress,
            streak,
          }
        }),
      )

      setHabits(habitsWithProgress)

      // Buscar tarefas de hoje
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user!.id)
        .gte("due_date", `${today}T00:00:00`)
        .lte("due_date", `${today}T23:59:59`)
        .order("priority", { ascending: false })

      if (tasksError) throw tasksError

      setTodayTasks(tasksData || [])

      // Calcular estatísticas
      const completedToday = habitsWithProgress.filter((h) => h.today_completed).length
      const avgWeekProgress =
        habitsWithProgress.reduce((acc, h) => acc + h.week_progress, 0) / habitsWithProgress.length || 0
      const completedTasks = (tasksData || []).filter((t) => t.is_completed).length

      setStats({
        totalHabits: habitsWithProgress.length,
        completedToday,
        weekProgress: avgWeekProgress,
        totalTasks: tasksData?.length || 0,
        completedTasks,
      })
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error)
    } finally {
      setLoading(false)
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

      // Recarregar dados
      fetchDashboardData()
    } catch (error) {
      console.error("Erro ao atualizar hábito:", error)
    }
  }

  const toggleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
    try {
      await supabase.from("tasks").update({ is_completed: !isCompleted }).eq("id", taskId)

      // Atualizar estado local
      setTodayTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, is_completed: !isCompleted } : task)))

      // Atualizar estatísticas
      setStats((prev) => ({
        ...prev,
        completedTasks: prev.completedTasks + (isCompleted ? -1 : 1),
      }))
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Olá, {profile?.full_name || "Usuário"}! 👋</h1>
          <p className="text-gray-600 mt-1">Vamos continuar construindo seus hábitos hoje</p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link href="/habits">
              <Plus className="h-4 w-4 mr-2" />
              Novo Hábito
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hábitos Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHabits}</div>
            <p className="text-xs text-muted-foreground">{stats.completedToday} completados hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.weekProgress)}%</div>
            <Progress value={stats.weekProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Hoje</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">{stats.completedTasks} concluídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sequência</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.max(...habits.map((h) => h.streak), 0)}</div>
            <p className="text-xs text-muted-foreground">dias consecutivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Hábitos de Hoje */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Hábitos de Hoje
            </CardTitle>
            <CardDescription>Marque os hábitos que você completou hoje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {habits.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhum hábito criado ainda</p>
                <Button asChild>
                  <Link href="/habits">Criar primeiro hábito</Link>
                </Button>
              </div>
            ) : (
              habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: habit.color }} />
                    <div>
                      <h4 className="font-medium">{habit.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>Sequência: {habit.streak} dias</span>
                        <span>•</span>
                        <span>Semana: {Math.round(habit.week_progress)}%</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={habit.today_completed ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleHabitCompletion(habit.id, habit.today_completed)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tarefas de Hoje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Tarefas de Hoje
            </CardTitle>
            <CardDescription>Suas tarefas programadas para hoje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhuma tarefa para hoje</p>
                <Button asChild>
                  <Link href="/tasks">Criar tarefa</Link>
                </Button>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="sm" onClick={() => toggleTaskCompletion(task.id, task.is_completed)}>
                      <CheckCircle className={`h-4 w-4 ${task.is_completed ? "text-green-600" : "text-gray-400"}`} />
                    </Button>
                    <div>
                      <h4 className={`font-medium ${task.is_completed ? "line-through text-gray-500" : ""}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
                        </Badge>
                        {task.due_date && (
                          <span className="text-sm text-gray-500">
                            {new Date(task.due_date).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
