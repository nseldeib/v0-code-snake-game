"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Crown } from "lucide-react"
import { supabase, type User } from "@/lib/supabase"

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("high_score", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching leaderboard:", error)
      } else {
        setLeaderboard(data || [])
      }
    } catch (err) {
      console.error("Unexpected error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-amber-400" />
      case 2:
        return <Trophy className="w-5 h-5 text-slate-300" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <Award className="w-4 h-4 text-slate-400" />
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50"
      case 2:
        return "bg-gradient-to-r from-slate-500/20 to-gray-500/20 border-slate-500/50"
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50"
      default:
        return "bg-slate-800/30 border-slate-600/30"
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border-emerald-500/50">
        <CardHeader className="p-3">
          <CardTitle className="text-emerald-100 text-lg font-mono flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            LEADERBOARD
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="text-center text-slate-400">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border-emerald-500/50 shadow-[0_0_25px_rgba(52,211,153,0.3)]">
      <CardHeader className="p-3">
        <CardTitle className="text-emerald-100 text-lg font-mono flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          LEADERBOARD
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center text-slate-400 py-4">No players yet. Be the first!</div>
        ) : (
          leaderboard.map((user, index) => {
            const rank = index + 1
            return (
              <div
                key={user.id}
                className={`flex items-center justify-between p-2 rounded border ${getRankStyle(rank)}`}
              >
                <div className="flex items-center gap-2">
                  {getRankIcon(rank)}
                  <div>
                    <div className="font-mono text-sm text-emerald-100">{user.username}</div>
                    <div className="text-xs text-slate-400">{user.challenges_completed.length} challenges</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-100">{user.high_score.toLocaleString()}</div>
                  <Badge variant="outline" className="text-xs bg-slate-800/50 text-slate-300 border-slate-500/30">
                    #{rank}
                  </Badge>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
