"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { UserPlus, Eye, EyeOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SignupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SignupModal({ open, onOpenChange, onSuccess }: SignupModalProps) {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Clear form and errors when modal opens
  useEffect(() => {
    if (open) {
      setError("")
      setEmail("")
      setUsername("")
      setPassword("")
    }
  }, [open])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Use our server-side API route for signup
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          username,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle rate limiting error specifically
        if (data.error && data.error.includes("For security purposes, you can only request this after")) {
          const match = data.error.match(/after (\d+) seconds/)
          const seconds = match ? match[1] : "a few"
          setError(`Please wait ${seconds} seconds before trying again. This is a security measure to prevent spam.`)
        } else if (data.error && data.error.includes("User already registered")) {
          setError("An account with this email already exists. Try logging in instead.")
        } else {
          setError(data.error || "Failed to create account")
        }
        setLoading(false)
        return
      }

      console.log("User created successfully:", data.user)

      // Show success toast
      toast({
        title: "Welcome to Code Quest! 🎉",
        description: `Account created successfully! You're now logged in as ${username}.`,
      })

      // Refresh the auth state
      const { data: session } = await supabase.auth.getSession()

      if (session) {
        console.log("Session established:", session)
      }

      onSuccess()
      onOpenChange(false)
      setEmail("")
      setUsername("")
      setPassword("")
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 to-indigo-900 border-emerald-500/50 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-emerald-100 font-mono flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            JOIN CODE QUEST
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-emerald-200">
              Email
            </Label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 border-emerald-500/50 text-slate-100"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-username" className="text-emerald-200">
              Username
            </Label>
            <Input
              id="signup-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              className="bg-slate-800 border-emerald-500/50 text-slate-100"
              placeholder="coder123"
              minLength={3}
              maxLength={20}
              required
            />
            <p className="text-xs text-slate-400">3-20 characters, lowercase letters, numbers, and underscores only</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-emerald-200">
              Password
            </Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-emerald-500/50 text-slate-100 pr-10"
                placeholder="••••••••"
                minLength={6}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-100"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-400">Minimum 6 characters</p>
          </div>

          {error && (
            <Alert className="border-rose-500/50 bg-rose-900/30">
              <AlertDescription className="text-rose-100">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
