"use client"

import type React from "react"
import { useExpenses } from "../contexts/ExpenseContext"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "../contexts/LanguageContext"

interface BudgetOverviewProps {
  dateRange: { from: Date; to: Date }
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ dateRange }) => {
  const { transactions } = useExpenses()
  const { t } = useLanguage()

  const filteredTransactions = transactions.filter(
    (t) => new Date(t.date) >= dateRange.from && new Date(t.date) <= dateRange.to,
  )

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const remainingBudget = totalIncome - totalExpenses
  const percentageSpent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0

  return (
    <Card className="bg-secondary">
      <CardContent className="p-4 md:p-6">
        <div className="space-y-3 md:space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <span className="text-xl md:text-2xl font-bold">${remainingBudget.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">{t("availableBalance")}</span>
          </div>
          <Progress value={percentageSpent} className="w-full h-2" />
          <div className="flex justify-between text-xs md:text-sm">
            <span>
              {t("totalIncome")}: ${totalIncome.toFixed(2)}
            </span>
            <span>
              {t("totalExpenses")}: ${totalExpenses.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BudgetOverview

