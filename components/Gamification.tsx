"use client"

import type React from "react"
import { useExpenses } from "../contexts/ExpenseContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, TrendingUp } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

interface GamificationProps {
  dateRange: { from: Date; to: Date }
}

const Gamification: React.FC<GamificationProps> = ({ dateRange }) => {
  const { transactions, goals } = useExpenses()
  const { t } = useLanguage()

  const filteredTransactions = transactions.filter(
    (t) => new Date(t.date) >= dateRange.from && new Date(t.date) <= dateRange.to,
  )

  // Calculate total savings
  const totalSavings =
    filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0) -
    filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  // Calculate streak (assuming a streak is maintained by adding a transaction every day)
  const streak = calculateStreak(filteredTransactions)

  // Calculate progress towards goals
  const goalProgress = goals.map((goal) => {
    const amountSaved = filteredTransactions
      .filter((t) => t.goalId === goal.id && t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
    return {
      ...goal,
      progress: (amountSaved / goal.targetAmount) * 100,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("financialJourney")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Trophy className="text-yellow-500" />
          <span className="font-semibold">{t("savingsMilestone")}:</span>
          <Badge variant="secondary">${totalSavings.toFixed(2)}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="text-green-500" />
          <span className="font-semibold">{t("transactionStreak")}:</span>
          <Badge variant="secondary">{streak} days</Badge>
        </div>
        <div className="space-y-2">
          <span className="font-semibold">{t("goalProgress")}:</span>
          {goalProgress.map((goal) => (
            <div key={goal.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{goal.name}</span>
                <span>{goal.progress.toFixed(2)}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function calculateStreak(transactions: any[]): number {
  if (transactions.length === 0) return 0

  const sortedDates = transactions
    .map((t) => new Date(t.date).toISOString().split("T")[0])
    .sort((a, b) => b.localeCompare(a))

  let streak = 1
  let currentDate = new Date(sortedDates[0])

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i])
    const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24))

    if (diffDays === 1) {
      streak++
      currentDate = prevDate
    } else if (diffDays > 1) {
      break
    }
  }

  return streak
}

export default Gamification

