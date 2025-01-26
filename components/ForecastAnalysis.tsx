"use client"

import type React from "react"
import { useExpenses } from "../contexts/ExpenseContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useLanguage } from "../contexts/LanguageContext"

interface ForecastAnalysisProps {
  dateRange: { from: Date; to: Date }
}

const ForecastAnalysis: React.FC<ForecastAnalysisProps> = ({ dateRange }) => {
  const { transactions } = useExpenses()
  const { t } = useLanguage()

  const filteredTransactions = transactions.filter(
    (t) => new Date(t.date) >= dateRange.from && new Date(t.date) <= dateRange.to,
  )

  // Group transactions by month
  const monthlyData = filteredTransactions.reduce(
    (acc, transaction) => {
      const date = new Date(transaction.date)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!acc[monthYear]) {
        acc[monthYear] = { income: 0, expenses: 0 }
      }

      if (transaction.type === "income") {
        acc[monthYear].income += transaction.amount
      } else {
        acc[monthYear].expenses += transaction.amount
      }

      return acc
    },
    {} as Record<string, { income: number; expenses: number }>,
  )

  // Convert to array and sort
  const sortedData = Object.entries(monthlyData)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Simple linear regression for forecasting
  const forecastMonths = 3
  const forecastData = [...sortedData]

  if (sortedData.length >= 2) {
    const lastTwoMonths = sortedData.slice(-2)
    const incomeSlope = lastTwoMonths[1].income - lastTwoMonths[0].income
    const expenseSlope = lastTwoMonths[1].expenses - lastTwoMonths[0].expenses

    for (let i = 1; i <= forecastMonths; i++) {
      const lastDate = new Date(sortedData[sortedData.length - 1].date)
      lastDate.setMonth(lastDate.getMonth() + i)
      const forecastDate = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, "0")}`

      forecastData.push({
        date: forecastDate,
        income: Math.max(0, sortedData[sortedData.length - 1].income + incomeSlope * i),
        expenses: Math.max(0, sortedData[sortedData.length - 1].expenses + expenseSlope * i),
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("financialForecast")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#8884d8" name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default ForecastAnalysis

