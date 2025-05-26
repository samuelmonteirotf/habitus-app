import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  google_calendar_token?: string
  google_refresh_token?: string
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  title: string
  description?: string
  color: string
  frequency: "daily" | "weekly" | "monthly"
  target_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  notes?: string
  created_at: string
}

export interface Routine {
  id: string
  user_id: string
  title: string
  description?: string
  start_time?: string
  end_time?: string
  days_of_week: number[]
  is_active: boolean
  google_calendar_event_id?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  routine_id?: string
  title: string
  description?: string
  due_date?: string
  priority: "low" | "medium" | "high"
  is_completed: boolean
  google_calendar_event_id?: string
  created_at: string
  updated_at: string
}
