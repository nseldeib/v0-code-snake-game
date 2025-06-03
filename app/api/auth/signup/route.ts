import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json()

    // Validate inputs
    if (!email || !password || !username) {
      return NextResponse.json({ error: "Email, password, and username are required" }, { status: 400 })
    }

    // Create a Supabase client with cookies
    const supabase = createRouteHandlerClient({ cookies })

    // Check if username is already taken
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking username:", checkError)
      return NextResponse.json({ error: "Error checking username availability" }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 })
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Create user record in our users table
    // This uses the same authenticated session from the auth signup
    const { error: dbError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      username,
      high_score: 0,
      challenges_completed: [],
    })

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: `Failed to create user profile: ${dbError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        username,
      },
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
