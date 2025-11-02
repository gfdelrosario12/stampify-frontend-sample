import type { Passport } from "@/lib/types"
import { Award, TrendingUp, Users, Zap } from "lucide-react"

interface MemberStatsProps {
  passport: Passport
}

export function MemberStats({ passport }: MemberStatsProps) {
  const stampCount = passport.stamps.length
  const points = stampCount * 50
  const level = Math.floor(stampCount / 3) + 1

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Events</p>
            <p className="text-3xl font-bold text-primary">{stampCount}</p>
          </div>
          <Award className="w-8 h-8 text-primary/40" />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Points</p>
            <p className="text-3xl font-bold text-accent">{points}</p>
          </div>
          <Zap className="w-8 h-8 text-accent/40" />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Level</p>
            <p className="text-3xl font-bold text-primary">{level}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-primary/40" />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Streak</p>
            <p className="text-3xl font-bold text-accent">{stampCount > 0 ? "🔥" : "—"}</p>
          </div>
          <Users className="w-8 h-8 text-accent/40" />
        </div>
      </div>
    </div>
  )
}
