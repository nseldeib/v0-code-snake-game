import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Update the User type to make email optional for public contexts
export type User = {
  id: string
  email?: string // Make email optional since we don't always need it publicly
  username: string
  high_score: number
  challenges_completed: string[]
  created_at: string
  updated_at: string
}

// Add a separate type for private user data that includes email
export type PrivateUser = {
  id: string
  email: string
  username: string
  high_score: number
  challenges_completed: string[]
  created_at: string
  updated_at: string
}
